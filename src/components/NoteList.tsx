import { Plus, Search, X, Settings } from 'lucide-react';
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onToggleSidebar}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="glass-panel m-3 mb-0 rounded-2xl flex flex-col h-[calc(100%-1.5rem)] overflow-hidden">
          {/* Header */}
          <div className="p-4 pb-3 flex items-center gap-3">
            <button
              className="btn btn-ghost btn-sm btn-square lg:hidden min-h-8 h-8 w-8"
              onClick={onToggleSidebar}
            >
              <X size={16} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">Fastnote</h1>
              <p className="text-[11px] text-base-content/40 font-medium tracking-wide uppercase">
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm btn-square min-h-8 h-8 w-8"
              onClick={onOpenSettings}
              title="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              className="btn btn-primary btn-sm btn-square min-h-8 h-8 w-8 shadow-md"
              onClick={onCreate}
              title="New note"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30"
              />
              <input
                type="text"
                className="input input-sm w-full pl-9 h-9 text-sm rounded-xl"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Note list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mb-4">
                  <Search size={24} className="text-base-content/20" />
                </div>
                <p className="text-sm text-base-content/50 font-medium">
                  {search ? 'No matches found' : 'No notes yet'}
                </p>
                <p className="text-xs text-base-content/30 mt-1">
                  {search ? 'Try a different search term' : 'Click + to create your first note'}
                </p>
              </div>
            ) : (
              <>
                {pinnedCount > 0 && (
                  <div className="px-2 pt-1 pb-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-base-content/30">
                      Pinned · {pinnedCount}
                    </span>
                  </div>
                )}
                {notes.filter((n) => n.pinned).map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    active={note.id === activeNoteId}
                    onSelect={(id) => {
                      onSelect(id);
                      onToggleSidebar();
                    }}
                    onDelete={onDelete}
                    onTogglePin={onTogglePin}
                  />
                ))}
                {pinnedCount > 0 && unpinnedNotes.length > 0 && (
                  <div className="px-2 pt-2 pb-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-base-content/30">
                      All Notes
                    </span>
                  </div>
                )}
                {unpinnedNotes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    active={note.id === activeNoteId}
                    onSelect={(id) => {
                      onSelect(id);
                      onToggleSidebar();
                    }}
                    onDelete={onDelete}
                    onTogglePin={onTogglePin}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
