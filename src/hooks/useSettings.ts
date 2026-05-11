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

const fn = (bg: string, text: string, rx = '6') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="${rx}" fill="${bg}"/><text x="16" y="23" font-size="16" text-anchor="middle" fill="${text}" font-family="system-ui,sans-serif" font-weight="700">Fn</text></svg>`;

const THEME_FAVICONS: Record<AppTheme, string> = {
  'light':        fn('#f9fafb', '#1f2937'),
  'dark':         fn('#1e1e2e', '#f87171'),
  'pink':         fn('#fdf2f8', '#ec4899'),
  'forest':       fn('#0f1a12', '#22c55e'),
  'luxury':       fn('#09090b', '#d97706'),
  'liquid-glass': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#bfdbfe"/><stop offset="100%" stop-color="#a5b4fc"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/><rect x="3" y="3" width="26" height="26" rx="6" fill="rgba(255,255,255,0.45)" stroke="rgba(255,255,255,0.75)" stroke-width="1.5"/><text x="16" y="23" font-size="15" text-anchor="middle" fill="#1e40af" font-family="system-ui,sans-serif" font-weight="700">Fn</text></svg>`,
  'win96':        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#c0c0c0"/><rect x="0" y="0" width="32" height="9" fill="#000080"/><text x="3" y="7" font-size="6" fill="white" font-family="Tahoma,sans-serif" font-weight="bold">Fastnote</text><rect x="2" y="11" width="28" height="19" fill="white" stroke="#808080" stroke-width="1"/><line x1="4" y1="15" x2="28" y2="15" stroke="#ddd" stroke-width="1"/><line x1="4" y1="18" x2="24" y2="18" stroke="#ddd" stroke-width="1"/><line x1="4" y1="21" x2="26" y2="21" stroke="#ddd" stroke-width="1"/><line x1="4" y1="24" x2="20" y2="24" stroke="#ddd" stroke-width="1"/></svg>`,
  'hacker':       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0d0c0c"/><text x="3" y="22" font-size="15" fill="#87a987" font-family="Courier New,monospace" font-weight="bold">&gt;_</text><rect x="0" y="0" width="32" height="32" fill="none" stroke="#87a987" stroke-width="1.5" opacity="0.3"/></svg>`,
};

function setFavicon(theme: AppTheme) {
  const svg = THEME_FAVICONS[theme];
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.href = href;
}

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

    setFavicon(theme);
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
