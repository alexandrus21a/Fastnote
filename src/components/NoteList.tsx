import { Plus, Search, X, Settings, FileText } from 'lucide-react';
import type { Note } from '../types/note';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  search: string;
  sidebarOpen: boolean;
  onSearchChange: (q: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

export function NoteList({
  notes,
  activeNoteId,
  search,
  sidebarOpen,
  onSearchChange,
  onSelect,
  onCreate,
  onDelete,
  onTogglePin,
  onToggleSidebar,
  onOpenSettings,
}: NoteListProps) {
  const pinnedCount = notes.filter((n) => n.pinned).length;
  const unpinnedNotes = notes.filter((n) => !n.pinned);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/15 z-40 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 flex flex-col lg:flex-shrink-0 bg-base-100 border-r border-base-300/30 transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <button
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-base-200 transition-colors text-base-content/50"
            onClick={onToggleSidebar}
          >
            <X size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold tracking-tight text-base-content/90">
              Fastnote
            </h1>
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

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/25"
            />
            <input
              type="text"
              className="w-full pl-8 pr-3 h-8 text-[13px] bg-base-200/40 border border-transparent focus:border-base-300/60 focus:bg-base-100 rounded-lg outline-none transition-all placeholder:text-base-content/25"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
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
          ) : (
            <>
              {pinnedCount > 0 && (
                <div className="px-4 py-1.5">
                  <span className="text-[11px] font-medium text-base-content/25">
                    Pinned
                  </span>
                </div>
              )}
              {notes.filter((n) => n.pinned).map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  active={note.id === activeNoteId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onTogglePin={onTogglePin}
                />
              ))}
              {pinnedCount > 0 && unpinnedNotes.length > 0 && (
                <div className="px-4 py-1.5 mt-1 border-t border-base-300/20">
                  <span className="text-[11px] font-medium text-base-content/25">
                    All Notes
                  </span>
                </div>
              )}
              {unpinnedNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  active={note.id === activeNoteId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onTogglePin={onTogglePin}
                />
              ))}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
