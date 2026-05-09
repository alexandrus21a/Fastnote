import { Trash2, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Note } from '../types/note';

interface NoteItemProps {
  note: Note;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export function NoteItem({ note, active, onSelect, onDelete, onTogglePin }: NoteItemProps) {
  const { t } = useTranslation();
  const date = new Date(note.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className={`group relative cursor-pointer transition-colors duration-150 ${
        active ? 'bg-base-200/60' : 'hover:bg-base-200/40'
      }`}
      onClick={() => onSelect(note.id)}
    >
      {/* Active indicator line */}
      {active && (
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-full" />
      )}

      <div className="px-4 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {note.pinned && (
              <Pin
                size={10}
                className={`shrink-0 mt-1 ${active ? 'text-primary' : 'text-base-content/30'}`}
                fill="currentColor"
              />
            )}
            <span
              className={`text-sm truncate font-medium ${
                active ? 'text-base-content' : 'text-base-content/80'
              }`}
            >
              {note.title || t('untitledNote')}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors ${
                active
                  ? 'hover:bg-base-300/60 text-base-content/50'
                  : 'hover:bg-base-300/50 text-base-content/30'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              title={note.pinned ? t('unpin') : t('pin')}
            >
              <Pin size={11} fill={note.pinned ? 'currentColor' : 'none'} />
            </button>
            <button
              className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors ${
                active
                  ? 'hover:bg-error/10 text-base-content/50 hover:text-error'
                  : 'hover:bg-error/10 text-base-content/30 hover:text-error'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              title={t('delete')}
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
        <p
          className={`text-[13px] truncate leading-relaxed mt-0.5 ${
            active ? 'text-base-content/50' : 'text-base-content/35'
          }`}
        >
          {note.content.slice(0, 90).replace(/\n/g, ' ') || t('noContent')}
        </p>
        <span
          className={`text-[11px] font-mono mt-1 block ${
            active ? 'text-base-content/30' : 'text-base-content/25'
          }`}
        >
          {date}
        </span>
      </div>
    </div>
  );
}
