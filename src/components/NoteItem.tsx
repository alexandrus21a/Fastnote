import { Trash2, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Note } from '../types/note';
import type { AppTheme } from '../hooks/useSettings';

interface NoteItemProps {
  note: Note;
  active: boolean;
  theme: AppTheme;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export function NoteItem({ note, active, theme, onSelect, onDelete, onTogglePin }: NoteItemProps) {
  const { t } = useTranslation();

  // ── WIN96 ──────────────────────────────────────────────────────────────────
  if (theme === 'win96') {
    const date = new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return (
      <div
        className="cursor-pointer select-none flex items-center gap-1.5 px-2 py-[3px] text-[12px] group"
        style={{
          fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
          background: active ? '#000080' : 'transparent',
          color: active ? '#fff' : '#000',
        }}
        onClick={() => onSelect(note.id)}
        onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = '#c8d4e8'; }}
        onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <span className="shrink-0 text-[13px]">📄</span>
        <span className="flex-1 min-w-0 truncate font-medium">{note.title || t('untitledNote')}</span>
        {note.pinned && <span className="text-[10px] shrink-0" style={{ color: active ? 'rgba(255,255,255,0.7)' : '#808080' }}>📌</span>}
        <span className="text-[10px] shrink-0" style={{ color: active ? 'rgba(255,255,255,0.6)' : '#808080' }}>{date}</span>
        <div className="flex gap-px shrink-0 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
          <button
            className="w-[14px] h-[14px] text-[9px] flex items-center justify-center"
            style={{ background: '#c0c0c0', border: '1px outset #dfdfdf', color: '#000' }}
            onClick={() => onTogglePin(note.id)}
            title={note.pinned ? t('unpin') : t('pin')}
          >📌</button>
          <button
            className="w-[14px] h-[14px] text-[9px] flex items-center justify-center"
            style={{ background: '#c0c0c0', border: '1px outset #dfdfdf', color: '#000' }}
            onClick={() => onDelete(note.id)}
            title={t('delete')}
          >✕</button>
        </div>
      </div>
    );
  }

  // ── HACKER ─────────────────────────────────────────────────────────────────
  if (theme === 'hacker') {
    const d = new Date(note.updatedAt);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const sizeB = note.content.length;
    const sizeStr = sizeB > 1024 ? `${(sizeB / 1024).toFixed(1)}K` : `${sizeB}B`;
    const filename = (note.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '_');

    return (
      <div
        className="cursor-pointer group px-3"
        style={{
          background: active ? 'rgba(0,255,65,0.07)' : 'transparent',
          borderBottom: '1px solid #001800',
        }}
        onClick={() => onSelect(note.id)}
      >
        <div className="flex items-center gap-1.5 py-[5px] text-[11px]" style={{ fontFamily: '"Courier New", monospace' }}>
          <span className="shrink-0 w-[10px]" style={{ color: active ? '#00ff41' : '#004400' }}>
            {active ? '▶' : ' '}
          </span>
          <span className="flex-1 min-w-0 truncate" style={{ color: active ? '#00ff41' : '#00cc33' }}>
            {filename}<span style={{ color: '#004400' }}>.md</span>
          </span>
          {note.pinned && <span style={{ color: '#006600', fontSize: 10 }}>[pin]</span>}
          <span style={{ color: '#004400', fontSize: 10 }} className="shrink-0">{sizeStr}</span>
          <span style={{ color: '#003300', fontSize: 10 }} className="shrink-0">{iso}</span>
        </div>
        <div
          className="hidden group-hover:flex items-center gap-3 pb-[4px] pl-4 text-[10px]"
          style={{ fontFamily: '"Courier New", monospace' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => onTogglePin(note.id)} className="hover:underline" style={{ color: '#008811' }}>
            {note.pinned ? '[unpin]' : '[pin]'}
          </button>
          <button onClick={() => onDelete(note.id)} className="hover:underline" style={{ color: '#660000' }}>
            [rm -f]
          </button>
        </div>
      </div>
    );
  }

  // ── DEFAULT ────────────────────────────────────────────────────────────────
  const date = new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return (
    <div
      className={`group relative cursor-pointer transition-colors duration-150 ${active ? 'bg-base-200/60' : 'hover:bg-base-200/40'}`}
      onClick={() => onSelect(note.id)}
    >
      {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-full" />}
      <div className="px-4 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {note.pinned && (
              <Pin size={10} className={`shrink-0 mt-1 ${active ? 'text-primary' : 'text-base-content/30'}`} fill="currentColor" />
            )}
            <span className={`text-sm truncate font-medium ${active ? 'text-base-content' : 'text-base-content/80'}`}>
              {note.title || t('untitledNote')}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <button
              className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors ${active ? 'hover:bg-base-300/60 text-base-content/50' : 'hover:bg-base-300/50 text-base-content/30'}`}
              onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
              title={note.pinned ? t('unpin') : t('pin')}
            >
              <Pin size={11} fill={note.pinned ? 'currentColor' : 'none'} />
            </button>
            <button
              className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors ${active ? 'hover:bg-error/10 text-base-content/50 hover:text-error' : 'hover:bg-error/10 text-base-content/30 hover:text-error'}`}
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
              title={t('delete')}
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
        <p className={`text-[13px] truncate leading-relaxed mt-0.5 ${active ? 'text-base-content/50' : 'text-base-content/35'}`}>
          {note.content.slice(0, 90).replace(/\n/g, ' ') || t('noContent')}
        </p>
        <span className={`text-[11px] font-mono mt-1 block ${active ? 'text-base-content/30' : 'text-base-content/25'}`}>
          {date}
        </span>
      </div>
    </div>
  );
}
