import { useEffect, useRef } from 'react';
import { Plus, Search, Settings, FileText } from 'lucide-react';
import type { Note } from '../types/note';
import type { AppTheme } from '../hooks/useSettings';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  search: string;
  mobileView: 'list' | 'editor';
  theme: AppTheme;
  focusSearchTrigger?: number;
  onSearchChange: (q: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpenSettings: () => void;
}

export function NoteList({
  notes, activeNoteId, search, mobileView, theme, focusSearchTrigger,
  onSearchChange, onSelect, onCreate, onDelete, onTogglePin, onOpenSettings,
}: NoteListProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusSearchTrigger) searchRef.current?.focus();
  }, [focusSearchTrigger]);
  const pinnedNotes = notes.filter((n) => n.pinned);
  const unpinnedNotes = notes.filter((n) => !n.pinned);
  const isWin96 = theme === 'win96';
  const isHacker = theme === 'hacker';
  const isLiquidGlass = theme === 'liquid-glass';

  const visClass = mobileView === 'list' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col';

  const asideBase = [
    visClass,
    isLiquidGlass
      ? 'glass-panel rounded-2xl overflow-hidden border-0 shadow-xl'
      : 'bg-base-100 border-r border-base-300/30',
    isWin96 ? 'lg:w-52' : 'w-full lg:w-72',
    'lg:flex-shrink-0',
    'pb-16 lg:pb-0',
  ].join(' ');

  const emptyState = () => {
    if (isHacker) {
      return (
        <div className="px-3 py-6" style={{ fontFamily: '"Courier New", monospace' }}>
          <div className="text-[11px] space-y-0.5" style={{ color: '#54546d' }}>
            <div style={{ color: '#87a987' }}>$ ls vault/</div>
            <div>total 0</div>
            <div>{search ? 'no match found' : '(empty vault)'}</div>
            {!search && <div style={{ color: '#c5c9c5' }}>touch new.md to start</div>}
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-10 h-10 rounded-xl bg-base-200/60 flex items-center justify-center mb-3">
          <FileText size={18} className="text-base-content/15" />
        </div>
        <p className="text-[13px] text-base-content/40 font-medium">
          {search ? 'No matches found' : 'No notes yet'}
        </p>
        <p className="text-xs text-base-content/25 mt-1">
          {search ? 'Try a different term' : 'Press + to create one'}
        </p>
      </div>
    );
  };

  return (
    <aside className={asideBase}>

      {/* ── WIN96 HEADER ───────────────────────────────────────────────────── */}
      {isWin96 && (
        <>
          <div
            className="shrink-0 flex items-center gap-1 px-1.5 py-1 border-b"
            style={{ background: '#c0c0c0', borderBottomColor: '#808080', fontFamily: 'Tahoma, "MS Sans Serif", sans-serif' }}
          >
            <button
              className="h-[19px] px-2 text-[11px] flex items-center hover:bg-[#e0e0e0] active:border-inset"
              style={{ background: '#c0c0c0', border: '1.5px outset #dfdfdf' }}
              onClick={onCreate}
            >
              New
            </button>
            <div className="w-px h-3.5 bg-[#808080] mx-0.5" />
            <button
              className="w-[19px] h-[19px] flex items-center justify-center text-[12px]"
              style={{ background: '#c0c0c0', border: '1.5px outset #dfdfdf' }}
              onClick={onOpenSettings}
              title="Settings"
            >
              ⚙
            </button>
            <span className="ml-auto text-[10px]" style={{ color: '#808080' }}>{notes.length} item(s)</span>
          </div>
          <div
            className="shrink-0 px-1.5 py-1 border-b"
            style={{ background: '#c0c0c0', borderBottomColor: '#808080', fontFamily: 'Tahoma' }}
          >
            <div className="flex items-center bg-white h-[18px]" style={{ border: '2px inset #808080' }}>
              <span className="px-1 text-[10px]" style={{ color: '#808080' }}>🔍</span>
              <input
                ref={searchRef}
                type="text"
                className="flex-1 bg-transparent text-[11px] outline-none pr-1"
                style={{ fontFamily: 'Tahoma' }}
                placeholder="Search..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {/* ── HACKER HEADER ──────────────────────────────────────────────────── */}
      {isHacker && (
        <>
          <div
            className="shrink-0 px-3 pt-3 pb-2 border-b"
            style={{ borderBottomColor: '#393836', fontFamily: '"Courier New", monospace' }}
          >
            <pre className="text-[9px] leading-[1.4] select-none" style={{ color: '#87a987' }}>
{`┌────────────────────┐
│   FASTNOTE  v1.0   │
└────────────────────┘`}
            </pre>
            <div className="text-[11px] mt-2" style={{ color: '#c5c9c5' }}>
              {'$ ls vault/ '}
              <span style={{ color: '#87a987' }}>({notes.length} files)</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-[11px]" style={{ fontFamily: '"Courier New", monospace' }}>
              <button className="hover:underline" style={{ color: '#87a987' }} onClick={onCreate}>
                $ touch new.md
              </button>
              <button className="ml-auto" style={{ color: '#7a8382' }} onClick={onOpenSettings}>
                [config]
              </button>
            </div>
          </div>
          <div
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 border-b"
            style={{ borderBottomColor: '#393836', fontFamily: '"Courier New", monospace' }}
          >
            <span className="text-[11px] shrink-0" style={{ color: '#7a8382' }}>{'grep -i "'}</span>
            <input
              ref={searchRef}
              type="text"
              className="flex-1 bg-transparent text-[11px] outline-none min-w-0"
              style={{ color: '#87a987', fontFamily: '"Courier New", monospace' }}
              placeholder="pattern"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <span className="text-[11px] shrink-0" style={{ color: '#7a8382' }}>{'"'}</span>
          </div>
        </>
      )}

      {/* ── DEFAULT HEADER ─────────────────────────────────────────────────── */}
      {!isWin96 && !isHacker && (
        <>
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <div className="flex-1 min-w-0 flex items-baseline gap-2">
              <h1 className="text-[15px] font-semibold tracking-tight text-base-content/90">Fastnote</h1>
              {notes.length > 0 && (
                <span className="text-[11px] font-medium text-base-content/30 tabular-nums">{notes.length}</span>
              )}
            </div>
            <button
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-base-200 transition-colors text-base-content/40"
              onClick={onOpenSettings}
              title="Settings"
            >
              <Settings size={15} />
            </button>
            <button
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-content hover:opacity-90 transition-opacity"
              onClick={onCreate}
              title="New note"
            >
              <Plus size={15} />
            </button>
          </div>
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/25" />
              <input
                ref={searchRef}
                type="text"
                className="w-full pl-8 pr-3 h-8 text-[13px] bg-base-200/60 border border-transparent focus:border-base-300/60 focus:bg-base-100 rounded-full outline-none transition-all placeholder:text-base-content/25 shadow-inner"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {/* ── NOTE LIST ──────────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto"
        style={isWin96 ? { background: 'white', border: '2px inset #808080', margin: '2px 4px 2px 4px' } : {}}
      >
        {notes.length === 0 ? emptyState() : (
          <>
            {!isHacker && pinnedNotes.length > 0 && (
              <div className="px-4 py-1.5">
                <span className="text-[11px] font-medium text-base-content/25" style={isWin96 ? { fontFamily: 'Tahoma', fontSize: 10, color: '#808080' } : {}}>
                  Pinned
                </span>
              </div>
            )}
            {pinnedNotes.map((note) => (
              <NoteItem key={note.id} note={note} active={note.id === activeNoteId} theme={theme} onSelect={onSelect} onDelete={onDelete} onTogglePin={onTogglePin} />
            ))}
            {!isHacker && pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
              <div className="px-4 py-1.5 mt-1 border-t border-base-300/20">
                <span className="text-[11px] font-medium text-base-content/25" style={isWin96 ? { fontFamily: 'Tahoma', fontSize: 10, color: '#808080' } : {}}>
                  All Notes
                </span>
              </div>
            )}
            {unpinnedNotes.map((note) => (
              <NoteItem key={note.id} note={note} active={note.id === activeNoteId} theme={theme} onSelect={onSelect} onDelete={onDelete} onTogglePin={onTogglePin} />
            ))}
          </>
        )}
      </div>

      {/* ── WIN96 SIDEBAR STATUS BAR ───────────────────────────────────────── */}
      {isWin96 && (
        <div
          className="shrink-0 flex items-center px-2 h-[18px] text-[10px]"
          style={{ background: '#c0c0c0', borderTop: '1px solid #808080', fontFamily: 'Tahoma', color: '#000' }}
        >
          {notes.length} object(s)
        </div>
      )}
    </aside>
  );
}
