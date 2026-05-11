<div align="center">

# ⚡ Fastnote

**No accounts. No sync. No server. Just fast, private notes.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-fastnote--app.vercel.app-black?style=for-the-badge&logo=vercel)](https://fastnote-app.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-offline--ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[**Try it live →**](https://fastnote-app.vercel.app)

</div>

---

## ✨ Highlights

- **Magic calculations** — type `100$ + 2€ =` or `15km to mi =` and the answer appears inline
- **Markdown editor** with live preview, toolbar, and GFM support — or switch to plain Simple mode
- **8 themes** — including Liquid Glass, Win 96, and Hacker that transform the entire UI
- **Encrypted backups** — AES-GCM `.fastnote` files you decrypt with a passphrase
- **Fully offline** — stores everything in `localStorage`, installs as a PWA, no server ever

---

## 🪄 Magic Calculations

End any expression with `=` and Fastnote inserts the result. Press `Space` or `Tab` to accept, or keep typing to commit.

| Expression | Result |
|---|---|
| `(12 + 8) * 5 =` | `100` |
| `sqrt(144) =` | `12` |
| `sin(30deg) =` | `0.5` |
| `x = 5` → `x * 3 =` | `15` |
| `100km to mi =` | `62.14 mi` |
| `15kg to lbs =` | `33.07 lbs` |
| `100$ + 2€ =` | live rate |

Supports arithmetic, variables, trig/log/scientific functions, unit conversions (length, weight, temp, …), and live currency rates.

---

## 📝 Editor

Two modes, switchable in Settings:

- **Markdown** — GFM, formatting toolbar, live preview, side-by-side split on desktop
- **Simple** — plain text, zero distractions

Toolbar: `Bold` · `Italic` · `Strikethrough` · `Heading` · `Divider` · `Bullet list` · `Numbered list` · `Task list` · `Link` · `Image` · `Blockquote` · `Code block`

Each note exports as **TXT · Markdown · DOCX · PDF** or sends to the printer.

---

## 🎨 Themes

5 standard color themes plus 3 fully custom themes that **reimagine the layout, chrome, and typography** — not just the palette.

| Theme | Type | Description |
|---|---|---|
| Light | Standard | Clean light mode |
| Dark | Standard | Dark mode |
| Pink | Standard | Soft pastel (DaisyUI cupcake) |
| Forest | Standard | Deep forest green |
| Luxury | Standard | Black & gold |
| **Liquid Glass** | Custom | Frosted glass panels over a gradient backdrop |
| **Win 96** | Custom | Windows 95/96 chrome — title bar, menu bar, inset fields, status bar |
| **Hacker** | Custom | Terminal green-on-black, `ls` note list, CRT scanlines |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl K` | Command palette |
| `Ctrl N` | New note |
| `Ctrl /` | Focus search |
| `Ctrl B` | Toggle sidebar |
| `Ctrl ,` | Open settings |

On macOS use `⌘` instead of `Ctrl`.

---

## 💾 Backup & Restore

Settings → Data → export all notes to an AES-GCM encrypted `.fastnote` file. Import on any device with the same passphrase. No cloud, no intermediary.

---

## 🚀 Getting Started

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

## 🛠 Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 + DaisyUI 5 |
| Markdown | react-markdown + remark-gfm |
| Icons | lucide-react |
| Word export | docx |
| PDF export | jsPDF + html2canvas |
| i18n | i18next (EN + RU) |
| PWA | vite-plugin-pwa |
| Crypto | Web Crypto API (AES-GCM) |

---

## License

MIT
