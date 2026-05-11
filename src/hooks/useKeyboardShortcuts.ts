import { useEffect } from 'react';

export interface ShortcutBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
}

export function useKeyboardShortcuts(bindings: ShortcutBinding[]) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const b of bindings) {
        const wantsCtrl = b.ctrl ?? false;
        if (
          e.key.toLowerCase() === b.key.toLowerCase() &&
          (e.ctrlKey || e.metaKey) === wantsCtrl &&
          e.shiftKey === (b.shift ?? false) &&
          e.altKey === (b.alt ?? false)
        ) {
          // Non-ctrl shortcuts are skipped when user is typing
          if (isInput && !wantsCtrl) continue;
          e.preventDefault();
          b.handler();
          return;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [bindings]);
}
