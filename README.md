# Fastnote

A fast, offline-first note-taking app with a markdown editor, magic calculations, and multiple themes. Works in the browser, installs as a PWA, and stores everything locally.

## Features

### Notes
- Create, edit, and delete notes
- Pin important notes to the top
- Full-text search across all notes
- Auto-saves as you type
- Timestamps on every note

### Editor modes
- **Markdown** — full GFM support with toolbar, live preview, and side-by-side view on desktop
- **Simple** — plain text editor, no formatting

### Markdown toolbar
Bold, italic, strikethrough, headings, dividers, bullet lists, numbered lists, task lists, links, images, blockquotes, code blocks.

### Magic Features
Type a line ending with `=` and Fastnote auto-calculates the result inline. Press `Space` or `Tab` to accept.

| Type | Example |
|------|---------|
| Math | `(12 + 8) * 5 =` → `100` |
| Variables | `x = 5` then `x * 3 =` → `15` |
| Scientific | `sqrt(144) =` → `12`, `sin(30deg) =` |
| Unit conversion | `100km to mi =` → `62.14 mi` |
| Currency | `100$ + 2€ =` → live rate result |

Currency rates are fetched live from exchangerate-api.com.

### Search
- **Global search** — filter notes list by title or content
- **In-note search** — find text within the current note (Ctrl/Cmd+F style), with prev/next navigation

### Export
Each note can be exported as:
- Plain text (`.txt`)
- Markdown (`.md`)
- Word document (`.docx`)
- PDF (via print to PDF)
- Direct print

### Backup & Restore
Export all notes as an encrypted `.fastnote` file (AES-GCM via Web Crypto). Import on any device using the same passphrase.

### Themes
| Theme | Description |
|-------|-------------|
| Light | Clean light mode |
| Dark | Dark mode |
| Pink | DaisyUI pink |
| Forest | DaisyUI forest green |
| Luxury | DaisyUI purple/gold luxury |
| Liquid Glass | Frosted glass with backdrop blur |
| Win 96 | Windows 95/96 retro aesthetic |
| Hacker | Terminal green-on-black with CRT scanlines |

### Language
English and Russian (auto-detected from browser, switchable in Settings).

### PWA
Installs as a native-like app on desktop and mobile. Fully offline — all notes live in `localStorage`, no server required.

### Responsive layout
- **Desktop (1024px+)** — persistent sidebar + editor side by side. Preview opens in split view.
- **Mobile** — bottom tab bar switches between the Notes list and Editor. Preview toggle appears in the editor toolbar.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Stack

- [React 19](https://react.dev) + TypeScript
- [Vite 8](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com)
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [lucide-react](https://lucide.dev) icons
- [docx](https://github.com/dolanmiu/docx) for Word export
- [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com) for PDF export
- [i18next](https://www.i18next.com) for i18n
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) for PWA

## License

MIT
