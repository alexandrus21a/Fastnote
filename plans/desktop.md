# Plan: Electron Desktop Packaging via electron-vite

## Context
Wrap the existing Fastnote Vite + React app as a native desktop app for Win/macOS/Linux using `electron-vite` — the recommended modern approach for Vite + Electron projects. It handles ESM/CJS automatically, provides hot reload in dev, and integrates with `electron-builder` for packaging. The existing `npm run build` web build (for Vercel) is untouched.

---

## Architecture

```
electron/
  main/index.ts        ← Electron main process (electron-vite compiles this)
  preload/index.ts     ← Preload script (minimal, context bridge)
electron.vite.config.ts  ← electron-vite config (separate from vite.config.ts)
src/                   ← existing React renderer (unchanged)
vite.config.ts         ← kept for web/Vercel builds (unchanged)
out/                   ← electron-vite output (gitignored)
  main/index.js
  preload/index.js
  renderer/            ← compiled web assets (for Electron)
release/               ← electron-builder output (gitignored)
```

---

## New Files to Create

### `electron/main/index.ts`
```ts
import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';   // bundled with electron-vite

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 800,
    minWidth: 700, minHeight: 500,
    title: 'Fastnote',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

### `electron/preload/index.ts`
```ts
// Minimal preload — extend with contextBridge if native APIs are needed
import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('appVersion', process.env.npm_package_version);
```

### `electron.vite.config.ts`
```ts
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    // Use existing src/ as renderer root — no code changes needed
    root: '.',
    build: { rollupOptions: { input: 'index.html' } },
    plugins: [tailwindcss(), react()],
    // Note: PWA not included in electron renderer (service workers unsupported)
  },
});
```

---

## Files to Modify

### `package.json`
**New devDependencies:**
- `electron` — `^34`
- `electron-vite` — `^3`
- `electron-builder` — `^25`
- `@electron-toolkit/utils` — `^4` (provides `is.dev` helper)

**Add `"main"` field** (electron-builder needs it):
```json
"main": "out/main/index.js"
```

**New scripts:**
```json
"electron:dev":         "electron-vite dev",
"electron:build":       "electron-vite build && electron-builder",
"electron:build:win":   "electron-vite build && electron-builder --win",
"electron:build:mac":   "electron-vite build && electron-builder --mac",
"electron:build:linux": "electron-vite build && electron-builder --linux"
```

**Add `build` config for electron-builder:**
```json
"build": {
  "appId": "com.fastnote.app",
  "productName": "Fastnote",
  "icon": "build/icon",
  "directories": { "buildResources": "build", "output": "release" },
  "files": ["out/**/*"],
  "win":   { "target": [{ "target": "nsis" }, { "target": "portable" }] },
  "mac":   { "target": "dmg", "category": "public.app-category.productivity" },
  "linux": { "target": ["AppImage", "deb"], "category": "Office" }
}
```

### `.gitignore`
Add:
```
out/
release/
```

---

## Icon Assets (`build/` directory)
electron-builder auto-generates `.ico` and `.icns` from a single `build/icon.png` (512×512).  
Action: create `build/` and place a 512×512 PNG. Can be converted from the existing `favicon.svg`.

---

## Critical Files
| File | Action |
|---|---|
| `electron/main/index.ts` | CREATE |
| `electron/preload/index.ts` | CREATE |
| `electron.vite.config.ts` | CREATE |
| `package.json` | MODIFY — deps, scripts, `"main"`, builder config |
| `.gitignore` | MODIFY — add `out/`, `release/` |
| `vite.config.ts` | **UNCHANGED** — web build untouched |

---

## Verification
1. `npm install` → packages resolve
2. `npm run electron:build:linux` → `release/Fastnote-*.AppImage` created
3. Launch AppImage → app loads, themes work, notes persist, shortcuts fire
4. `npm run build` (web) → still produces `dist/` for Vercel unaffected
