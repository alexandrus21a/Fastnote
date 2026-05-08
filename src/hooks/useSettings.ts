import { useState, useEffect, useCallback } from 'react';

export type EditorMode = 'markdown' | 'simple';
export type AppTheme = 'pink' | 'forest' | 'luxury' | 'liquid-glass' | 'win96' | 'hacker';

const SETTINGS_KEY = 'fastnote:settings';

export interface AppSettings {
  theme: AppTheme;
  editorMode: EditorMode;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'liquid-glass',
  editorMode: 'markdown',
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

const DAISY_THEMES: AppTheme[] = ['pink', 'forest', 'luxury'];

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    const { theme } = settings;
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('theme-liquid-glass', 'theme-win96', 'theme-hacker');

    if (DAISY_THEMES.includes(theme)) {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.body.classList.add(`theme-${theme}`);
    }
  }, [settings.theme]);

  const setSettings = useCallback((next: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...next };
      saveSettings(updated);
      return updated;
    });
  }, []);

  return { settings, setSettings };
}
