import { useState, useEffect, useCallback } from 'react';

export type EditorMode = 'markdown' | 'simple';
export type AppTheme = 'light' | 'dark' | 'pink' | 'forest' | 'luxury' | 'liquid-glass' | 'win96' | 'hacker';

const SETTINGS_KEY = 'fastnote:settings';

export interface AppSettings {
  theme: AppTheme;
  editorMode: EditorMode;
  magicFeatures: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  editorMode: 'markdown',
  magicFeatures: true,
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

const DAISY_THEMES: AppTheme[] = ['light', 'dark', 'pink', 'forest', 'luxury'];
const CUSTOM_THEMES: AppTheme[] = ['liquid-glass', 'win96', 'hacker'];

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    const { theme } = settings;

    // Map internal theme names to DaisyUI v5 theme names where they differ
    const DAISY_THEME_MAP: Partial<Record<AppTheme, string>> = { pink: 'cupcake' };
    const baseTheme = DAISY_THEMES.includes(theme)
      ? (DAISY_THEME_MAP[theme] ?? theme)
      : 'light';
    document.documentElement.setAttribute('data-theme', baseTheme);

    // Remove old custom theme classes
    CUSTOM_THEMES.forEach((t) => {
      document.body.classList.remove(`theme-${t}`);
    });

    // Add custom theme class if needed
    if (CUSTOM_THEMES.includes(theme)) {
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
