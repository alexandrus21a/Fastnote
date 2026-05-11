import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export interface PaletteCommand {
  id: string;
  label: string;
  description?: string;
  shortcut?: string[];
  icon?: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  commands: PaletteCommand[];
  onClose: () => void;
}

export function CommandPalette({ open, commands, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => { setSelected(0); }, [query]);

  const execute = (cmd: PaletteCommand) => {
    onClose();
    cmd.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && filtered[selected]) {
      execute(filtered[selected]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[14vh]">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 bg-base-100 rounded-2xl shadow-2xl border border-base-300/40 overflow-hidden animate-in">

        {/* Search row */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-base-300/40">
          <Search size={15} className="text-base-content/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-base-content/30"
            placeholder="Search commands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="text-base-content/25 hover:text-base-content/55 transition-colors"
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-base-content/30">
              No commands match "{query}"
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selected
                    ? 'bg-primary/10 text-primary'
                    : 'text-base-content/80 hover:bg-base-200/50'
                }`}
                onMouseEnter={() => setSelected(i)}
                onClick={() => execute(cmd)}
              >
                {cmd.icon && (
                  <span className={`shrink-0 ${i === selected ? 'text-primary' : 'text-base-content/35'}`}>
                    {cmd.icon}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium leading-tight">{cmd.label}</div>
                  {cmd.description && (
                    <div className="text-[11px] text-base-content/35 mt-0.5">{cmd.description}</div>
                  )}
                </div>
                {cmd.shortcut && (
                  <div className="shrink-0 flex items-center gap-0.5 ml-2">
                    {cmd.shortcut.map((k) => (
                      <kbd
                        key={k}
                        className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono bg-base-200 border border-base-300/60 rounded text-base-content/45 leading-none"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-base-300/25 flex items-center gap-4 text-[10px] text-base-content/25 select-none">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> run</span>
          <span><kbd className="font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
