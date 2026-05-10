<div align="center">

# ⚡ Fastnote

**A fast, offline-first note-taking app with magic calculations, markdown, and immersive themes.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-fastnote--app.vercel.app-black?style=for-the-badge&logo=vercel)](https://fastnote-app.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[**Try it live →**](https://fastnote-app.vercel.app)

</div>

---

## What is Fastnote?

Fastnote is a browser-based note app that lives entirely on your device — no accounts, no sync, no server. Notes are stored in `localStorage`, the app installs as a PWA, and works fully offline.

The headline feature is **Magic** — type a math expression, unit conversion, or currency calculation ending with `=` and Fastnote inserts the result inline, iOS Notes-style.

---

## Features

### Magic Calculations

Type any expression on a line, end it with `=`, and the result is inserted automatically. Press **Space** or **Tab** to accept the badge preview, or just keep typing `=` to commit immediately.

| Expression | Result |
|------------|--------|
| `(12 + 8) * 5 =` | `100` |
| `sqrt(144) =` | `12` |
| `sin(30deg) =` | `0.5` |
| `x = 5` → `x * 3 =` | `15` |
| `100km to mi =` | `62.14 mi` |
| `15kg to lbs =` | `33.07 lbs` |
| `100$ + 2€ =` | live rate |

Supported: arithmetic, variables, scientific functions (`sin`, `cos`, `sqrt`, `log`, `abs`, …), unit conversions (length, weight, temperature, …), and live currency via exchangerate-api.

---

### Editor

- **Markdown mode** — GFM support, formatting toolbar, live preview, side-by-side split on desktop
- **Simple mode** — plain text, no distractions
- In-note search with prev/next navigation
- Auto-saves on every keystroke

**Toolbar actions:** Bold · Italic · Strikethrough · Heading · Divider · Bullet list · Numbered list · Task list · Link · Image · Blockquote · Code block

---

### Notes

- Create, edit, delete — instantly
- Pin notes to the top
- Full-text search across all notes
- Auto-timestamped

---

### Export

Each note exports as: **TXT · Markdown · DOCX · PDF · Print**

---

### Backup & Restore

Export all notes as an AES-GCM encrypted `.fastnote` file (Web Crypto API). Import on any device with the same passphrase.

---

### Themes

Fastnote ships 8 themes — 5 standard and 3 fully custom themes that **reimagine the entire UI**, not just the color palette.

| Theme | Type | Description |
|-------|------|-------------|
| Light | Standard | Clean light mode |
| Dark | Standard | Dark mode |
| Pink | Standard | DaisyUI cupcake |
| Forest | Standard | DaisyUI forest green |
| Luxury | Standard | DaisyUI purple/gold |
| **Liquid Glass** | Custom | Frosted glass panels floating over a gradient backdrop |
| **Win 96** | Custom | Authentic Windows 95/96 chrome — title bar, menu bar, inset fields, status bars |
| **Hacker** | Custom | Terminal green-on-black, ASCII header, `ls`-style note list, vim status line, CRT scanlines |

Custom themes don't just recolor the app — they transform the layout, typography, chrome, and interactive elements to match their aesthetic.

---

### Responsive

- **Desktop** — persistent sidebar + editor. Markdown preview opens in split view.
- **Mobile** — bottom tab bar (Notes · Editor · Settings). Full-screen views, no drawer.
- Installs as a **PWA** on desktop and mobile.

### Languages

English and Russian — auto-detected from the browser, switchable in Settings.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

```bash
# Production build
npm run build
npm run preview
```

---

## Stack

| | |
|-|-|
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 8 |
| **Styling** | Tailwind CSS v4 + DaisyUI 5 |
| **Markdown** | react-markdown + remark-gfm |
| **Icons** | lucide-react |
| **Word export** | docx |
| **PDF export** | jsPDF + html2canvas |
| **i18n** | i18next + react-i18next |
| **PWA** | vite-plugin-pwa |
| **Crypto** | Web Crypto API (AES-GCM) |

---

## License

MIT
