import { Trash2, Pin, PinOff } from 'lucide-react';
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
      className={`group relative flex flex-col gap-1 p-3 cursor-pointer rounded-xl transition-all duration-200 ${
        active
          ? 'bg-primary/90 text-primary-content shadow-lg shadow-primary/20'
          : 'hover:bg-white/60 hover:shadow-sm'
      }`}
      onClick={() => onSelect(note.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {note.pinned && (
            <Pin size={11} className={`shrink-0 mt-1 ${active ? 'text-primary-content/80' : 'text-primary/70'}`} />
          )}
          <span className={`font-semibold text-sm truncate ${active ? 'text-primary-content' : 'text-base-content/90'}`}>
            {note.title || t('untitledNote')}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className={`btn btn-xs btn-square btn-ghost min-h-6 h-6 w-6 ${active ? 'hover:bg-primary-content/20' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            title={note.pinned ? t('unpin') : t('pin')}
          >
            {note.pinned ? <PinOff size={12} /> : <Pin size={12} />}
          </button>
          <button
            className={`btn btn-xs btn-square btn-ghost min-h-6 h-6 w-6 ${active ? 'hover:bg-primary-content/20' : ''}`}
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
