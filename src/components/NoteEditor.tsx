import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bold, Italic, Heading, List, ListOrdered, Link, Quote, Code,
  Eye, EyeOff, Menu, Strikethrough, CheckSquare, Image,
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
import type { EditorMode } from '../hooks/useSettings';
import { autoCalculateLine } from '../utils/math';
import { autoCalculateCurrencyLineSync } from '../utils/currency';
import { autoCalculateUnitLine } from '../utils/units';
import { useCaretPosition } from '../hooks/useCaretPosition';

interface NoteEditorProps {
  note: Note | null;
  editorMode: EditorMode;
  magicFeatures: boolean;
  onUpdate: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
  onToggleSidebar: () => void;
  onCreate: () => void;
}

export function NoteEditor({ note, editorMode, magicFeatures, onUpdate, onToggleSidebar, onCreate }: NoteEditorProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const [magicPreview, setMagicPreview] = useState<string | null>(null);
  const [magicBadgePos, setMagicBadgePos] = useState<{ top: number; left: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const getCaretPos = useCaretPosition();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  useEffect(() => {
    if (note && textareaRef.current && !showPreview) {
      textareaRef.current.focus();
    }
  }, [note?.id, showPreview]);

  useEffect(() => {
    setSearchIndex(0);
  }, [searchQuery, note?.id]);

  const matches = useMemo(() => {
    if (!searchQuery || !note) return [];
    const q = searchQuery.toLowerCase();
    const text = note.content.toLowerCase();
    const positions: number[] = [];
    let i = text.indexOf(q);
    while (i !== -1) {
      positions.push(i);
      i = text.indexOf(q, i + 1);
    }
    return positions;
  }, [searchQuery, note?.content]);

  const goToMatch = useCallback((dir: 'next' | 'prev') => {
    if (matches.length === 0) return;
    setSearchIndex((prev) => {
      if (dir === 'next') return (prev + 1) % matches.length;
      return (prev - 1 + matches.length) % matches.length;
    });
  }, [matches.length]);

  useEffect(() => {
    if (!searchQuery || !textareaRef.current || matches.length === 0) return;
    const pos = matches[searchIndex];
    const el = textareaRef.current;
    el.setSelectionRange(pos, pos + searchQuery.length);
    el.focus();
  }, [searchIndex, matches, searchQuery]);

  const insertText = useCallback(
    (before: string, after: string = '') => {
      const el = textareaRef.current;
      if (!el || !note) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const value = el.value;
      const selected = value.slice(start, end);
      const replacement = before + selected + after;
      const newContent = value.slice(0, start) + replacement + value.slice(end);
      onUpdate(note.id, { content: newContent });
      requestAnimationFrame(() => {
        el.focus();
        const newCursor = start + before.length + selected.length;
        el.setSelectionRange(newCursor, newCursor);
      });
    },
    [note, onUpdate]
  );

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

  const handleExportTXT = useCallback(() => {
    if (!note) return;
    const blob = new Blob([note.content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${note.title || 'note'}.txt`);
  }, [note]);

  const handleExportMD = useCallback(() => {
    if (!note) return;
    const blob = new Blob([note.content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${note.title || 'note'}.md`);
  }, [note]);

  const handleExportDOCX = useCallback(async () => {
    if (!note) return;
    const lines = note.content.split('\n');
    const children: Paragraph[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { children.push(new Paragraph({ text: '' })); continue; }
      if (trimmed.startsWith('# ')) children.push(new Paragraph({ text: trimmed.slice(2), heading: HeadingLevel.HEADING_1 }));
      else if (trimmed.startsWith('## ')) children.push(new Paragraph({ text: trimmed.slice(3), heading: HeadingLevel.HEADING_2 }));
      else if (trimmed.startsWith('### ')) children.push(new Paragraph({ text: trimmed.slice(4), heading: HeadingLevel.HEADING_3 }));
      else if (trimmed.startsWith('> ')) children.push(new Paragraph({ children: [new TextRun({ text: trimmed.slice(2), italics: true })] }));
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) children.push(new Paragraph({ text: trimmed.slice(2), bullet: { level: 0 } }));
      else if (/^\d+\.\s/.test(trimmed)) children.push(new Paragraph({ text: trimmed.replace(/^\d+\.\s/, ''), numbering: { reference: 'my-numbering', level: 0 } }));
      else if (trimmed.startsWith('```')) continue;
      else {
        const parts = trimmed.split(/(\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`)/g);
        const runs: TextRun[] = [];
        for (const part of parts) {
          if (part.startsWith('**') && part.endsWith('**')) runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
          else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
          else if (part.startsWith('~~') && part.endsWith('~~')) runs.push(new TextRun({ text: part.slice(2, -2), strike: true }));
          else if (part.startsWith('`') && part.endsWith('`')) runs.push(new TextRun({ text: part.slice(1, -1), font: 'Courier New' }));
          else if (part) runs.push(new TextRun({ text: part }));
        }
        children.push(new Paragraph({ children: runs }));
      }
    }
    const doc = new Document({ sections: [{ properties: {}, children: [new Paragraph({ text: note.title || t('untitledNote'), heading: HeadingLevel.TITLE }), ...children] }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${note.title || 'note'}.docx`);
  }, [note, t]);

  const handleExportPDF = useCallback(async () => {
    if (!note || !previewRef.current) return;
    const el = previewRef.current;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;
    pdf.setFontSize(16);
    pdf.text(note.title || t('untitledNote'), 10, 10);
    position = 20;
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 30;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 20;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }
    pdf.save(`${note.title || 'note'}.pdf`);
  }, [note, t]);

  const handlePrint = useCallback(() => {
    if (!note) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${note.title || t('untitledNote')}</title><style>body{font-family:system-ui,sans-serif;line-height:1.7;max-width:800px;margin:40px auto;padding:0 24px;color:#333}h1,h2,h3{color:#111;font-weight:600}code{background:#f4f4f4;padding:2px 6px;border-radius:4px;font-family:monospace}pre{background:#f8f8f8;padding:16px;border-radius:12px;overflow-x:auto}pre code{background:none;padding:0}blockquote{border-left:3px solid #ddd;padding-left:16px;margin-left:0;color:#666;font-style:italic}table{border-collapse:collapse;width:100%;margin:16px 0}th,td{border:1px solid #eee;padding:10px;text-align:left}th{background:#f8f8f8;font-weight:600;font-size:.85em}img{max-width:100%;border-radius:8px}hr{border:none;border-top:1px solid #eee;margin:28px 0}a{color:#3b82f6}ul,ol{padding-left:24px}@media print{body{margin:0}}</style></head><body><h1 style="font-size:28px;margin-bottom:8px;letter-spacing:-0.5px">${note.title || t('untitledNote')}</h1><div id="c"></div></body></html>`);
    w.document.close();
    const c = w.document.getElementById('c');
    if (c && previewRef.current) c.innerHTML = previewRef.current.innerHTML;
    w.focus();
    setTimeout(() => w.print(), 300);
  }, [note, t]);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-base-content/25 p-8">
        <button
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-base-200 transition-colors text-base-content/40 mb-8"
          onClick={onToggleSidebar}
        >
          <Menu size={18} />
        </button>
        <div className="w-12 h-12 rounded-xl bg-base-200/50 flex items-center justify-center mb-4">
          <PenLine size={20} className="text-base-content/15" />
        </div>
        <p className="text-sm font-medium text-base-content/40 mb-1">{t('selectOrCreate')}</p>
        <button
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-content text-sm font-medium hover:opacity-90 transition-opacity"
          onClick={onCreate}
        >
          <Plus size={15} />
          {t('writeNewNote')}
        </button>
      </div>
    );
  }

  const isSimple = editorMode === 'simple';

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-base-100">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <button
          className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-base-200 transition-colors text-base-content/40"
          onClick={onToggleSidebar}
        >
          <Menu size={16} />
        </button>
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
              >
                <Search size={15} />
              </button>
              <button
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-base-200 transition-colors text-base-content/40"
                onClick={() => setShowPreview((p) => !p)}
                title={showPreview ? t('edit') : t('preview')}
              >
                {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </>
          )}
          <div className="relative">
            <button
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-base-200 transition-colors text-base-content/40"
              onClick={() => setExportOpen((v) => !v)}
            >
              <Download size={15} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 bg-base-100 border border-base-300/40 rounded-xl shadow-xl w-44 z-50">
                <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-base-200/60 transition-colors" onClick={() => { handleExportTXT(); setExportOpen(false); }}>{t('exportTXT')}</button>
                <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-base-200/60 transition-colors" onClick={() => { handleExportMD(); setExportOpen(false); }}>{t('exportMD')}</button>
                <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-base-200/60 transition-colors" onClick={() => { handleExportDOCX(); setExportOpen(false); }}>{t('exportDOCX')}</button>
                {!isSimple && <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-base-200/60 transition-colors" onClick={() => { handleExportPDF(); setExportOpen(false); }}>{t('exportPDF')}</button>}
                <div className="h-px bg-base-300/30 mx-2 my-1" />
                <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-base-200/60 transition-colors" onClick={() => { handlePrint(); setExportOpen(false); }}>{t('print')}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && !isSimple && (
        <div className="px-5 py-2 border-b border-base-300/20 flex items-center gap-2">
          <Search size={14} className="text-base-content/30" />
          <input
            ref={searchInputRef}
            type="text"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/25 h-7"
            placeholder="Find in note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goToMatch('next');
              if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
            }}
          />
          {matches.length > 0 && (
            <span className="text-xs text-base-content/40 whitespace-nowrap font-mono">
              {searchIndex + 1} / {matches.length}
            </span>
          )}
          <button className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-base-200 text-base-content/40" onClick={() => goToMatch('prev')} disabled={matches.length === 0}>
            <ChevronUp size={14} />
          </button>
          <button className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-base-200 text-base-content/40" onClick={() => goToMatch('next')} disabled={matches.length === 0}>
            <ChevronDown size={14} />
          </button>
          <button className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-base-200 text-base-content/40" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Markdown toolbar */}
      {!isSimple && (
        <div className="px-5 py-1.5 border-b border-base-300/20 flex items-center gap-0.5 overflow-x-auto">
          {toolbarActions.map((t) => (
            <button
              key={t.title}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-base-200/70 transition-colors text-base-content/40 flex-shrink-0"
              onClick={t.action}
              title={t.title}
            >
              <t.icon size={13} strokeWidth={2} />
            </button>
          ))}
        </div>
      )}

      {/* Editor / Preview */}
      <div className="flex-1 flex min-h-0 relative">
        <div className={`flex-1 flex flex-col min-w-0 relative ${(!isSimple && showPreview && !isMobile) ? 'border-r border-base-300/20' : ''} ${(!isSimple && showPreview && isMobile) ? 'hidden' : 'flex'}`}>
          <textarea
            ref={textareaRef}
            className="flex-1 w-full resize-none outline-none bg-transparent p-5 text-[15px] leading-[1.75] text-base-content/80"
            placeholder={isSimple ? (t('startWritingSimple') || 'Start writing...') : t('startWriting')}
            value={note.content}
            onChange={(e) => onUpdate(note.id, { content: e.target.value })}
            onInput={() => {
              if (!magicFeatures || !note || !textareaRef.current) {
                setMagicPreview(null);
                setMagicBadgePos(null);
                return;
              }
              const el = textareaRef.current;
              const cursorPos = el.selectionStart;
              const value = el.value;
              const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
              const lineEnd = value.indexOf('\n', cursorPos);
              const line = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);

              if (!line.trimEnd().endsWith('=')) {
                setMagicPreview(null);
                setMagicBadgePos(null);
                return;
              }

              let result = autoCalculateLine(line, value);
              if (!result) result = autoCalculateUnitLine(line);
              if (!result) result = autoCalculateCurrencyLineSync(line);

              if (result) {
                const computed = result.slice(line.trimEnd().length).trim();
                setMagicPreview(computed);
                const pos = getCaretPos(el, cursorPos);
                setMagicBadgePos(pos);
              } else {
                setMagicPreview(null);
                setMagicBadgePos(null);
              }
            }}
            onKeyDown={(e) => {
              if (!magicFeatures || !note) return;
              const el = e.currentTarget;
              const cursorPos = el.selectionStart;
              const value = el.value;
              const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
              const lineEnd = value.indexOf('\n', cursorPos);
              const line = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);

              if ((e.key === ' ' || e.key === 'Tab') && magicPreview) {
                e.preventDefault();
                const before = value.slice(0, cursorPos);
                const after = value.slice(cursorPos);
                const spacer = e.key === 'Tab' ? '\t' : ' ';
                const newValue = before + magicPreview + spacer + after;
                onUpdate(note.id, { content: newValue });
                setMagicPreview(null);
                setMagicBadgePos(null);
                requestAnimationFrame(() => {
                  const newPos = cursorPos + magicPreview.length + 1;
                  el.setSelectionRange(newPos, newPos);
                  el.focus();
                });
                return;
              }

              if (e.key !== '=') return;

              let result = autoCalculateLine(line, value);
              if (!result) result = autoCalculateUnitLine(line);
              if (!result) result = autoCalculateCurrencyLineSync(line);

              if (result) {
                e.preventDefault();
                const before = value.slice(0, lineStart);
                const after = lineEnd === -1 ? '' : value.slice(lineEnd);
                const newValue = before + result + after;
                onUpdate(note.id, { content: newValue });
                setMagicPreview(null);
                setMagicBadgePos(null);
                requestAnimationFrame(() => {
                  const newPos = lineStart + result!.length;
                  el.setSelectionRange(newPos, newPos);
                  el.focus();
                });
              }
            }}
          />

          {/* Magic preview badge */}
          {magicPreview && magicBadgePos && (
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                top: magicBadgePos.top + 4,
                left: magicBadgePos.left + 8,
              }}
            >
              <div className="bg-base-100/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-medium text-primary shadow-lg border border-primary/20 flex items-center gap-1.5">
                <Sparkles size={12} />
                {magicPreview}
              </div>
            </div>
          )}
        </div>

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
      {!isSimple && isMobile && (
        <div className="border-t border-base-300/20 p-2 flex justify-center sm:hidden">
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-base-200 text-sm text-base-content/60 transition-colors" onClick={() => setShowPreview((p) => !p)}>
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? t('edit') : t('preview')}
          </button>
        </div>
      )}
    </div>
  );
}
