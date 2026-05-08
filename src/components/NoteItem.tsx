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
  const time = new Date(note.updatedAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group flex flex-col gap-1 p-3 cursor-pointer rounded-xl transition-all duration-200 border border-transparent ${
        active
          ? 'bg-primary text-primary-content shadow-md'
          : 'hover:bg-base-200/70 hover:border-base-300/50'
      }`}
      onClick={() => onSelect(note.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {note.pinned && (
            <span className={`shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md ${active ? 'bg-primary-content/20' : 'bg-primary/10'}`}>
              <Pin size={11} className={`${active ? 'text-primary-content' : 'text-primary'}`} fill={active ? 'currentColor' : 'none'} />
            </span>
          )}
          <span className={`font-semibold text-sm truncate ${active ? 'text-primary-content' : 'text-base-content/90'}`}>
            {note.title || t('untitledNote')}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            className={`btn btn-xs btn-square min-h-6 h-6 w-6 border-0 ${
              note.pinned
                ? (active ? 'bg-primary-content/20 text-primary-content' : 'bg-primary/10 text-primary')
                : (active ? 'btn-ghost hover:bg-primary-content/20 text-primary-content/70' : 'btn-ghost hover:bg-base-300/50 text-base-content/40')
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            title={note.pinned ? t('unpin') : t('pin')}
          >
            <Pin size={12} fill={note.pinned ? 'currentColor' : 'none'} />
          </button>
          <button
            className={`btn btn-xs btn-square min-h-6 h-6 w-6 border-0 ${
              active
                ? 'btn-ghost hover:bg-error/30 text-primary-content/70 hover:text-error-content'
                : 'btn-ghost hover:bg-error/10 text-base-content/40 hover:text-error'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            title={t('delete')}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <p className={`text-xs truncate leading-relaxed ${active ? 'text-primary-content/70' : 'text-base-content/40'}`}>
        {note.content.slice(0, 80).replace(/\n/g, ' ') || t('noContent')}
      </p>
      <span className={`text-[10px] font-medium tracking-wide uppercase ${active ? 'text-primary-content/50' : 'text-base-content/30'}`}>
        {date} · {time}
      </span>
    </div>
  );
}
