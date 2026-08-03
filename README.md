<div align="center">

# ⚡ Fastnote

### Next-Level Offline Note-Taking & Inline Workspace

**Zero accounts. Zero cloud sync. Zero telemetry. 100% Private, Blazing Fast Notes.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-fastnote--app.vercel.app-000000?style=for-the-badge&logo=vercel)](https://fastnote-app.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-Offline--Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[**Experience Fastnote Live →**](https://fastnote-app.vercel.app)

</div>

---

## ✨ Features at a Glance

- 🪄 **Inline Math & Conversions** — Evaluates arithmetic, formulas, unit conversions (`15km to mi =`), and live currency conversions (`100$ + 2€ =`) directly inside text.
- 📂 **Folders, Categories & Hashtags** — Categorize notes into custom folders and tag them with `#tags` for effortless indexing.
- 📝 **Markdown & Plain Text Modes** — Full GFM support, live side-by-side preview, formatting toolbar, or switch to distraction-free Simple Mode.
- 🎨 **Dynamic Design Systems** — 5 standard themes + 3 full layout transformations (**Liquid Glass**, **Win 96**, and **Hacker Terminal**).
- 🔒 **Client-Side Encryption** — Export/import full workspace backups using local **AES-GCM encryption** with custom passphrases.
- 📤 **Rich Exports** — Export notes instantly to **Markdown (.md)**, **Plain Text (.txt)**, **Word (.docx)**, or **PDF**.
- ⚡ **Offline PWA** — Install directly to desktop or mobile with instant load speeds and zero network dependency.

---

## 🪄 Inline Magic Calculations

Fastnote automatically calculates any math expression or conversion ending with `=`. 
Press `Space` or `Tab` to accept the inline auto-calculated result.

| Expression | Evaluated Result |
|---|---|
| `(12 + 8) * 5 =` | `100` |
| `sqrt(144) =` | `12` |
| `sin(30deg) =` | `0.5` |
| `x = 5` → `x * 3 =` | `15` |
| `100km to mi =` | `62.14 mi` |
| `15kg to lbs =` | `33.07 lbs` |
| `100$ + 2€ =` | Live exchange rate result |

---

## 🎨 Layout Themes

Transform the app's visual identity, chrome, typography, and structure:

| Theme | Type | Visual Style |
|---|---|---|
| **Liquid Glass** | Custom | Ambient multi-radial mesh gradients with frosted glass reflection panels |
| **Win 96** | Custom | Nostalgic Windows 95/96 desktop chrome with title bar & status bar |
| **Hacker** | Custom | CRT green-on-black terminal layout with vim status line & `ls` list |
| **Light / Dark** | Standard | Modern minimal light and dark themes |
| **Cupcake / Forest / Luxury** | Standard | Soft pastel, deep emerald green, and black & gold palettes |

---

## ⌨️ Command Palette & Keyboard Shortcuts

Press `Ctrl + K` (or `⌘ + K` on macOS) to launch the instant command palette:

| Shortcut | Action |
|---|---|
| `Ctrl + K` | Launch Command Palette |
| `Ctrl + N` | Create a new note |
| `Ctrl + /` | Jump to search input |
| `Ctrl + B` | Toggle sidebar / mobile navigation |
| `Ctrl + ,` | Open Settings modal |

---

## 🚀 Quick Start

```bash
# Clone and install dependencies
git clone https://github.com/alexandrus21a/Fastnote.git
cd Fastnote
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm run preview
```

---

## 🛡 Tech Stack

- **Core Framework**: React 19, TypeScript 5.8
- **Build Tool**: Vite 8
- **Design & Layout**: Tailwind CSS v4, DaisyUI 5, Lucide Icons
- **Markdown & Math**: `react-markdown`, `remark-gfm`
- **Exports**: `docx`, `jspdf`, `html2canvas`
- **Localization**: `i18next` (English, Russian)
- **PWA & Storage**: `vite-plugin-pwa`, `localStorage`, Web Crypto API (AES-GCM)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
