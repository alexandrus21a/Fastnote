import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bold, Italic, Heading, List, ListOrdered, Link, Quote, Code,
  Eye, EyeOff, Strikethrough, CheckSquare, Image,
  SeparatorHorizontal, Download, Search, X, ChevronUp, ChevronDown,
  PenLine, Sparkles, Plus,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import type { Note } from '../types/note';
import type { EditorMode, AppTheme } from '../hooks/useSettings';
import { autoCalculateLine } from '../utils/math';
import { autoCalculateCurrencyLineSync } from '../utils/currency';
import { autoCalculateUnitLine } from '../utils/units';
import { useCaretPosition } from '../hooks/useCaretPosition';

interface NoteEditorProps {
  note: Note | null;
  editorMode: EditorMode;
  magicFeatures: boolean;
  mobileView: 'list' | 'editor';
  theme: AppTheme;
  onUpdate: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
  onCreate: () => void;
}

export function NoteEditor({ note, editorMode, magicFeatures, mobileView, theme, onUpdate, onCreate }: NoteEditorProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const [magicPreview, setMagicPreview] = useState<string | null>(null);
  const [magicBadgePos, setMagicBadgePos] = useState<{ top: number; left: number } | null>(null);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const getCaretPos = useCaretPosition();

  const isWin96 = theme === 'win96';
  const isHacker = theme === 'hacker';
  const isLiquidGlass = theme === 'liquid-glass';

  const visibilityClass = mobileView === 'editor' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col';

  const outerClass = [
    'min-w-0 pb-16 lg:pb-0',
    'flex-1',
    visibilityClass,
    isLiquidGlass ? 'glass-panel rounded-2xl overflow-hidden border-0 shadow-xl' : 'bg-base-100',
  ].join(' ');

  const trackCursor = useCallback((el: HTMLTextAreaElement) => {
    const before = el.value.slice(0, el.selectionStart);
    const lines = before.split('\n');
    setCursorLine(lines.length);
    setCursorCol(lines[lines.length - 1].length + 1);
  }, []);

  const acceptMagicPreview = useCallback(() => {
    if (!magicPreview || !note || !textareaRef.current) return;
    const el = textareaRef.current;
    const cursorPos = el.selectionStart;
    const value = el.value;
    const newValue = value.slice(0, cursorPos) + magicPreview + ' ' + value.slice(cursorPos);
    onUpdate(note.id, { content: newValue });
    setMagicPreview(null);
    setMagicBadgePos(null);
    requestAnimationFrame(() => {
      const newPos = cursorPos + magicPreview.length + 1;
      el.setSelectionRange(newPos, newPos);
      el.focus();
    });
  }, [magicPreview, note, onUpdate]);

  useEffect(() => {
    if (note && textareaRef.current && !showPreview) {
      textareaRef.current.focus();
    }
  }, [note?.id, showPreview]);

  useEffect(() => { setSearchIndex(0); }, [searchQuery, note?.id]);

  const matches = useMemo(() => {
    if (!searchQuery || !note) return [];
    const q = searchQuery.toLowerCase();
    const text = note.content.toLowerCase();
    const positions: number[] = [];
    let i = text.indexOf(q);
    while (i !== -1) { positions.push(i); i = text.indexOf(q, i + 1); }
    return positions;
  }, [searchQuery, note?.content]);

  const goToMatch = useCallback((dir: 'next' | 'prev') => {
    if (matches.length === 0) return;
    setSearchIndex((prev) => dir === 'next' ? (prev + 1) % matches.length : (prev - 1 + matches.length) % matches.length);
  }, [matches.length]);

  useEffect(() => {
    if (!searchQuery || !textareaRef.current || matches.length === 0) return;
    const el = textareaRef.current;
    el.setSelectionRange(matches[searchIndex], matches[searchIndex] + searchQuery.length);
    el.focus();
  }, [searchIndex, matches, searchQuery]);

  const insertText = useCallback((before: string, after = '') => {
    const el = textareaRef.current;
    if (!el || !note) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end);
    const newContent = el.value.slice(0, start) + before + selected + after + el.value.slice(end);
    onUpdate(note.id, { content: newContent });
    requestAnimationFrame(() => {
      el.focus();
      const cur = start + before.length + selected.length;
      el.setSelectionRange(cur, cur);
    });
  }, [note, onUpdate]);

  const toolbarActions = [
    { icon: Bold, action: () => insertText('**', '**'), title: t('bold') },
    { icon: Italic, action: () => insertText('*', '*'), title: t('italic') },
    { icon: Strikethrough, action: () => insertText('~~', '~~'), title: t('strikethrough') },
    { icon: Heading, action: () => insertText('## ', ''), title: t('heading') },
    { icon: SeparatorHorizontal, action: () => insertText('\n---\n', ''), title: t('divider') },
    { icon: List, action: () => insertText('- ', ''), title: t('bulletList') },
    { icon: ListOrdered, action: () => insertText('1. ', ''), title: t('numberedList') },
    { icon: CheckSquare, action: () => insertText('- [ ] ', ''), title: t('taskList') },
    { icon: Link, action: () => insertText('[', '](url)'), title: t('link') },
    { icon: Image, action: () => insertText('![alt](', ')'), title: t('image') },
    { icon: Quote, action: () => insertText('> ', ''), title: t('quote') },
    { icon: Code, action: () => insertText('```\n', '\n```'), title: t('codeBlock') },
  ];

  const handleExportTXT = useCallback(() => { if (!note) return; saveAs(new Blob([note.content], { type: 'text/plain;charset=utf-8' }), `${note.title || 'note'}.txt`); }, [note]);
  const handleExportMD = useCallback(() => { if (!note) return; saveAs(new Blob([note.content], { type: 'text/markdown;charset=utf-8' }), `${note.title || 'note'}.md`); }, [note]);

  const handleExportDOCX = useCallback(async () => {
    if (!note) return;
    const children: Paragraph[] = [];
    for (const line of note.content.split('\n')) {
      const tr = line.trim();
      if (!tr) { children.push(new Paragraph({ text: '' })); continue; }
      if (tr.startsWith('# ')) children.push(new Paragraph({ text: tr.slice(2), heading: HeadingLevel.HEADING_1 }));
      else if (tr.startsWith('## ')) children.push(new Paragraph({ text: tr.slice(3), heading: HeadingLevel.HEADING_2 }));
      else if (tr.startsWith('### ')) children.push(new Paragraph({ text: tr.slice(4), heading: HeadingLevel.HEADING_3 }));
      else if (tr.startsWith('> ')) children.push(new Paragraph({ children: [new TextRun({ text: tr.slice(2), italics: true })] }));
      else if (tr.startsWith('- ') || tr.startsWith('* ')) children.push(new Paragraph({ text: tr.slice(2), bullet: { level: 0 } }));
      else if (/^\d+\.\s/.test(tr)) children.push(new Paragraph({ text: tr.replace(/^\d+\.\s/, ''), numbering: { reference: 'my-numbering', level: 0 } }));
      else if (tr.startsWith('```')) continue;
      else {
        const runs: TextRun[] = tr.split(/(\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`)/g).map((p) => {
          if (p.startsWith('**') && p.endsWith('**')) return new TextRun({ text: p.slice(2, -2), bold: true });
          if (p.startsWith('*') && p.endsWith('*') && !p.startsWith('**')) return new TextRun({ text: p.slice(1, -1), italics: true });
          if (p.startsWith('~~') && p.endsWith('~~')) return new TextRun({ text: p.slice(2, -2), strike: true });
          if (p.startsWith('`') && p.endsWith('`')) return new TextRun({ text: p.slice(1, -1), font: 'Courier New' });
          return new TextRun({ text: p });
        });
        children.push(new Paragraph({ children: runs }));
      }
    }
    const doc = new Document({ sections: [{ properties: {}, children: [new Paragraph({ text: note.title || t('untitledNote'), heading: HeadingLevel.TITLE }), ...children] }] });
    saveAs(await Packer.toBlob(doc), `${note.title || 'note'}.docx`);
  }, [note, t]);

  const handleExportPDF = useCallback(async () => {
    if (!note || !previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW - 20;
    const imgH = (canvas.height * imgW) / canvas.width;
    let heightLeft = imgH;
    pdf.setFontSize(16); pdf.text(note.title || t('untitledNote'), 10, 10);
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 20, imgW, imgH);
    heightLeft -= pageH - 30;
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, heightLeft - imgH + 20, imgW, imgH);
      heightLeft -= pageH - 20;
    }
    pdf.save(`${note.title || 'note'}.pdf`);
  }, [note, t]);

  const handlePrint = useCallback(() => {
    if (!note) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${note.title || t('untitledNote')}</title><style>body{font-family:system-ui,sans-serif;line-height:1.7;max-width:800px;margin:40px auto;padding:0 24px;color:#333}h1,h2,h3{color:#111;font-weight:600}code{background:#f4f4f4;padding:2px 6px;border-radius:4px;font-family:monospace}pre{background:#f8f8f8;padding:16px;border-radius:12px;overflow-x:auto}pre code{background:none;padding:0}blockquote{border-left:3px solid #ddd;padding-left:16px;margin-left:0;color:#666;font-style:italic}table{border-collapse:collapse;width:100%}th,td{border:1px solid #eee;padding:10px;text-align:left}th{background:#f8f8f8;font-weight:600}img{max-width:100%;border-radius:8px}hr{border:none;border-top:1px solid #eee;margin:28px 0}a{color:#3b82f6}ul,ol{padding-left:24px}@media print{body{margin:0}}</style></head><body><h1>${note.title || t('untitledNote')}</h1><div id="c"></div></body></html>`);
    w.document.close();
    const c = w.document.getElementById('c');
    if (c && previewRef.current) c.innerHTML = previewRef.current.innerHTML;
    w.focus(); setTimeout(() => w.print(), 300);
  }, [note, t]);

  const exportMenu = (
    <div className="relative">
      <button
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-base-200 transition-colors text-base-content/40"
        onClick={() => setExportOpen((v) => !v)}
        title="Export"
      >
        <Download size={15} />
      </button>
      {exportOpen && (
        <div className="absolute right-0 top-full mt-1 py-1 bg-base-100 border border-base-300/40 rounded-xl shadow-xl w-44 z-50">
          <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-base-200/60" onClick={() => { handleExportTXT(); setExportOpen(false); }}>{t('exportTXT')}</button>
          <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-base-200/60" onClick={() => { handleExportMD(); setExportOpen(false); }}>{t('exportMD')}</button>
          <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-base-200/60" onClick={() => { handleExportDOCX(); setExportOpen(false); }}>{t('exportDOCX')}</button>
          {editorMode !== 'simple' && <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-base-200/60" onClick={() => { handleExportPDF(); setExportOpen(false); }}>{t('exportPDF')}</button>}
          <div className="h-px bg-base-300/30 mx-2 my-1" />
          <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-base-200/60" onClick={() => { handlePrint(); setExportOpen(false); }}>{t('print')}</button>
        </div>
      )}
    </div>
  );

  // ── EMPTY STATE ─────────────────────────────────────────────────────────────
  if (!note) {
    const emptyContent = () => {
      if (isHacker) return (
        <div style={{ fontFamily: '"Courier New", monospace' }}>
          <div className="text-[11px] space-y-1" style={{ color: '#00cc33' }}>
            <div style={{ color: '#00ff41' }}>$ vim _</div>
            <div>No buffer loaded.</div>
            <div style={{ color: '#008811' }}>Select a file or touch new.md</div>
          </div>
        </div>
      );
      if (isWin96) return (
        <div style={{ fontFamily: 'Tahoma', fontSize: 12, color: '#808080', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
          <div>Select a note or create a new one</div>
          <button
            className="mt-3 px-3 py-1 text-[12px]"
            style={{ background: '#c0c0c0', border: '1.5px outset #dfdfdf', fontFamily: 'Tahoma', color: '#000' }}
            onClick={onCreate}
          >
            New Note
          </button>
        </div>
      );
      return (
        <>
          <div className="w-12 h-12 rounded-xl bg-base-200/50 flex items-center justify-center mb-4">
            <PenLine size={20} className="text-base-content/15" />
          </div>
          <p className="text-sm font-medium text-base-content/40 mb-1">{t('selectOrCreate')}</p>
          <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-content text-sm font-medium hover:opacity-90 transition-opacity" onClick={onCreate}>
            <Plus size={15} />{t('writeNewNote')}
          </button>
        </>
      );
    };
    return (
      <div className={`flex-1 items-center justify-center text-base-content/25 p-8 pb-16 lg:pb-0 ${visibilityClass} ${isLiquidGlass ? 'glass-panel rounded-2xl overflow-hidden border-0 shadow-xl' : 'bg-base-100'}`}>
        {emptyContent()}
      </div>
    );
  }

  const isSimple = editorMode === 'simple';
  const noteFilename = (note.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '_');

  // ── TITLE AREA ──────────────────────────────────────────────────────────────
  const renderTitleArea = () => {
    if (isWin96) {
      return (
        <div
          className="shrink-0 flex items-center gap-1.5 px-2 py-1 border-b"
          style={{ background: '#c0c0c0', borderBottomColor: '#808080', fontFamily: 'Tahoma' }}
        >
          <span className="text-[11px]" style={{ color: '#808080' }}>📄</span>
          <input
            type="text"
            className="flex-1 min-w-0 h-[20px] bg-white text-[12px] px-1 outline-none"
            style={{ border: '2px inset #808080', fontFamily: 'Tahoma' }}
            placeholder="Untitled"
            value={note.title}
            onChange={(e) => onUpdate(note.id, { title: e.target.value })}
          />
          <div className="flex items-center gap-px">
            {!isSimple && (
              <button
                className="w-[19px] h-[19px] text-[10px] flex items-center justify-center"
                style={{ background: '#c0c0c0', border: '1.5px outset #dfdfdf' }}
                onClick={() => { setSearchOpen((s) => !s); setTimeout(() => searchInputRef.current?.focus(), 50); }}
                title="Find"
              >🔍</button>
            )}
            {exportMenu}
          </div>
        </div>
      );
    }
    if (isHacker) {
      return (
        <div
          className="shrink-0 flex items-center gap-2 px-3 py-1.5 border-b"
          style={{ borderBottomColor: '#003300', fontFamily: '"Courier New", monospace' }}
        >
          <span className="text-[11px] shrink-0" style={{ color: '#008811' }}>vim</span>
          <input
            type="text"
            className="flex-1 min-w-0 bg-transparent text-[13px] outline-none"
            style={{ color: '#00ff41', fontFamily: '"Courier New", monospace' }}
            placeholder="untitled.md"
            value={note.title}
            onChange={(e) => onUpdate(note.id, { title: e.target.value })}
          />
          <div className="flex items-center gap-0.5">
            {!isSimple && (
              <button
                className="inline-flex items-center justify-center w-7 h-7 transition-colors"
                style={{ color: '#006600' }}
                onClick={() => { setSearchOpen((s) => !s); setTimeout(() => searchInputRef.current?.focus(), 50); }}
                title="Search"
              >
                <Search size={13} />
              </button>
            )}
            {!isSimple && (
              <button
                className="hidden lg:inline-flex items-center justify-center w-7 h-7 transition-colors"
                style={{ color: '#006600' }}
                onClick={() => setShowPreview((p) => !p)}
                title={showPreview ? t('edit') : t('preview')}
              >
                {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            )}
            {exportMenu}
          </div>
        </div>
      );
    }
    // Default
    return (
      <div className="shrink-0 flex items-center gap-2 px-5 pt-4 pb-2">
        <input
          type="text"
          className="flex-1 bg-transparent text-xl font-semibold tracking-tight outline-none placeholder:text-base-content/20 text-base-content/90 py-1"
          placeholder={t('noteTitle')}
          value={note.title}
          onChange={(e) => onUpdate(note.id, { title: e.target.value })}
        />
        <div className="flex items-center gap-0.5">
          {!isSimple && (
            <>
              <button
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-base-200 transition-colors text-base-content/40"
                onClick={() => { setSearchOpen((s) => !s); setTimeout(() => searchInputRef.current?.focus(), 50); }}
                title="Search in note"
              ><Search size={15} /></button>
              <button
                className="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-base-200 transition-colors text-base-content/40"
                onClick={() => setShowPreview((p) => !p)}
                title={showPreview ? t('edit') : t('preview')}
              >{showPreview ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </>
          )}
          {exportMenu}
        </div>
      </div>
    );
  };

  return (
    <div className={outerClass}>

      {renderTitleArea()}

      {/* Search bar */}
      {searchOpen && !isSimple && (
        <div
          className="shrink-0 px-5 py-2 border-b border-base-300/20 flex items-center gap-2"
          style={isHacker ? { borderBottomColor: '#003300', fontFamily: '"Courier New", monospace' } : {}}
        >
          <Search size={14} className="text-base-content/30" style={isHacker ? { color: '#008811' } : {}} />
          <input
            ref={searchInputRef}
            type="text"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/25 h-7"
            style={isHacker ? { color: '#00ff41', fontFamily: '"Courier New", monospace' } : {}}
            placeholder="Find in note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goToMatch('next');
              if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
            }}
          />
          {matches.length > 0 && <span className="text-xs text-base-content/40 whitespace-nowrap font-mono">{searchIndex + 1} / {matches.length}</span>}
          <button className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-base-200 text-base-content/40" onClick={() => goToMatch('prev')} disabled={matches.length === 0}><ChevronUp size={14} /></button>
          <button className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-base-200 text-base-content/40" onClick={() => goToMatch('next')} disabled={matches.length === 0}><ChevronDown size={14} /></button>
          <button className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-base-200 text-base-content/40" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}><X size={14} /></button>
        </div>
      )}

      {/* Win96 format toolbar */}
      {isWin96 && !isSimple && (
        <div
          className="shrink-0 flex items-center gap-px px-1.5 py-1 border-b overflow-x-auto"
          style={{ background: '#c0c0c0', borderBottomColor: '#808080', fontFamily: 'Tahoma' }}
        >
          {toolbarActions.map((tb) => (
            <button
              key={tb.title}
              className="w-[20px] h-[20px] flex items-center justify-center flex-shrink-0"
              style={{ background: '#c0c0c0', border: '1px outset #dfdfdf', color: '#000' }}
              onClick={tb.action}
              title={tb.title}
            >
              <tb.icon size={11} strokeWidth={2} />
            </button>
          ))}
        </div>
      )}

      {/* Default / Hacker markdown toolbar */}
      {!isWin96 && !isSimple && (
        <div
          className="shrink-0 px-5 py-1.5 border-b border-base-300/20 flex items-center gap-0.5 overflow-x-auto"
          style={isHacker ? { borderBottomColor: '#003300' } : {}}
        >
          {toolbarActions.map((tb) => (
            <button
              key={tb.title}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-base-200/70 transition-colors text-base-content/40 flex-shrink-0"
              onClick={tb.action}
              title={tb.title}
            >
              <tb.icon size={13} strokeWidth={2} />
            </button>
          ))}
        </div>
      )}

      {/* Editor / Preview area */}
      <div className="flex-1 flex min-h-0 relative">
        <div className={[
          'flex-col min-w-0 relative',
          !isSimple && showPreview ? 'hidden lg:flex lg:flex-1 lg:border-r lg:border-base-300/20' : 'flex flex-1',
        ].join(' ')}>
          <textarea
            ref={textareaRef}
            className="flex-1 w-full resize-none outline-none bg-transparent p-5 leading-[1.75]"
            style={
              isWin96 ? { fontFamily: 'Tahoma', fontSize: 13, color: '#000', background: 'white' }
              : isHacker ? { fontFamily: '"Courier New", monospace', fontSize: 13, color: '#00ff41', caretColor: '#00ff41' }
              : { fontSize: 15, color: 'var(--color-base-content)' }
            }
            placeholder={isSimple ? (t('startWritingSimple') || 'Start writing...') : isHacker ? '-- INSERT --' : t('startWriting')}
            value={note.content}
            onChange={(e) => onUpdate(note.id, { content: e.target.value })}
            onSelect={(e) => trackCursor(e.currentTarget)}
            onKeyUp={(e) => trackCursor(e.currentTarget)}
            onInput={() => {
              if (!magicFeatures || !note || !textareaRef.current) { setMagicPreview(null); setMagicBadgePos(null); return; }
              const el = textareaRef.current;
              const cursorPos = el.selectionStart;
              const value = el.value;
              const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
              const lineEnd = value.indexOf('\n', cursorPos);
              const line = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
              if (!line.trimEnd().endsWith('=')) { setMagicPreview(null); setMagicBadgePos(null); return; }
              let result = autoCalculateLine(line, value);
              if (!result) result = autoCalculateUnitLine(line);
              if (!result) result = autoCalculateCurrencyLineSync(line);
              if (result) {
                setMagicPreview(result.slice(line.trimEnd().length).trim());
                setMagicBadgePos(getCaretPos(el, cursorPos));
              } else { setMagicPreview(null); setMagicBadgePos(null); }
            }}
            onKeyDown={(e) => {
              if (!magicFeatures || !note) return;
              const el = e.currentTarget;
              const cursorPos = el.selectionStart;
              const value = el.value;
              const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
              const lineEnd = value.indexOf('\n', cursorPos);
              const line = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
              if ((e.key === ' ' || e.key === 'Tab') && magicPreview) { e.preventDefault(); acceptMagicPreview(); return; }
              if (e.key !== '=') return;
              const lineWithEq = line + '=';
              let result = autoCalculateLine(lineWithEq, value);
              if (!result) result = autoCalculateUnitLine(lineWithEq);
              if (!result) result = autoCalculateCurrencyLineSync(lineWithEq);
              if (result) {
                e.preventDefault();
                const before = value.slice(0, lineStart);
                const after = lineEnd === -1 ? '' : value.slice(lineEnd);
                onUpdate(note.id, { content: before + result + after });
                setMagicPreview(null); setMagicBadgePos(null);
                requestAnimationFrame(() => {
                  el.setSelectionRange(lineStart + result!.length, lineStart + result!.length);
                  el.focus();
                });
              }
            }}
          />

          {/* Magic preview badge */}
          {magicPreview && magicBadgePos && (
            <div key={magicPreview} className="absolute z-10" style={{ top: magicBadgePos.top + 28, left: Math.max(16, magicBadgePos.left - 4) }}>
              <button
                className="magic-result-badge inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-content text-[13px] font-semibold shadow-lg"
                onMouseDown={(e) => { e.preventDefault(); acceptMagicPreview(); }}
                onTouchEnd={(e) => { e.preventDefault(); acceptMagicPreview(); }}
                tabIndex={-1}
              >
                <Sparkles size={11} className="opacity-70 shrink-0" />
                <span>{magicPreview}</span>
                <kbd className="text-[10px] font-normal opacity-50 ml-0.5 hidden sm:inline">tab</kbd>
              </button>
            </div>
          )}
        </div>

        {/* Preview pane */}
        {!isSimple && showPreview && (
          <div className="flex-1 min-w-0 overflow-y-auto p-5">
            <div ref={previewRef} className="markdown-preview prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content || t('nothingToPreview')}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Mobile preview toggle */}
      {!isSimple && !isWin96 && (
        <div
          className="shrink-0 border-t border-base-300/20 p-2 flex justify-center lg:hidden"
          style={isHacker ? { borderTopColor: '#003300' } : {}}
        >
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-base-200 text-sm text-base-content/60 transition-colors"
            onClick={() => setShowPreview((p) => !p)}
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? t('edit') : t('preview')}
          </button>
        </div>
      )}

      {/* ── WIN96 STATUS BAR ───────────────────────────────────────────────── */}
      {isWin96 && (
        <div
          className="shrink-0 flex items-center px-2 h-[18px] text-[10px] gap-4"
          style={{ background: '#c0c0c0', borderTop: '1px solid #808080', fontFamily: 'Tahoma', color: '#000' }}
        >
          <span>Ready</span>
          <div className="h-3 w-px bg-[#808080]" />
          <span>Ln {cursorLine}, Col {cursorCol}</span>
          <div className="h-3 w-px bg-[#808080]" />
          <span>{note.content.split('\n').length} lines</span>
        </div>
      )}

      {/* ── HACKER VIM STATUS LINE ─────────────────────────────────────────── */}
      {isHacker && (
        <div
          className="shrink-0 flex items-center px-3 h-[22px] text-[11px]"
          style={{ background: '#0a0a0a', borderTop: '1px solid #003300', fontFamily: '"Courier New", monospace' }}
        >
          <span className="px-1.5 mr-2 text-[10px] font-bold" style={{ background: '#00ff41', color: '#000' }}>INSERT</span>
          <span className="flex-1 min-w-0 truncate" style={{ color: '#00cc33' }}>{noteFilename}.md</span>
          <span style={{ color: '#008811' }}>:{cursorLine}:{cursorCol}</span>
        </div>
      )}
    </div>
  );
}
