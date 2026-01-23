# 📂 NHFS — Minimal HTTP File Server

<div align="center">
  A <strong>tiny, buildless file manager</strong> with Express backend and vanilla JavaScript frontend.
  Zero framework bloat. Just files.
</div>

---

## ✨ Features

- **Browse Files** — List directories with file metadata
- **Preview Files** — Images, audio, video inline
- **Drag-Drop Upload** — Upload files with progress
- **File Operations** — Delete, rename, move, mkdir
- **Responsive UI** — Works on mobile
- **Dark Mode** — CSS prefers-color-scheme
- **Path Security** — All paths validated against directory traversal

---

## 🚀 Quick Start

```bash
git clone https://github.com/AnEntrypoint/NHFS.git
cd NHFS
npm install          # 20 seconds (2 dependencies only)
npm start            # Instant - no build needed
```

Open `http://localhost:3000`

### Environment Variables

```bash
PORT=3000           # Server port (default: 3000)
BASE_DIR=/home      # Directory to serve (default: current directory)
```

---

## 📂 Architecture

**Backend: `server.js` (378 LOC)**
- Express server for file operations
- REST API: `/api/list`, `/api/upload`, `/api/download`, etc.
- Busboy for streaming multipart uploads
- Path injection prevention

**Frontend: Vanilla JavaScript (784 LOC)**
- `public/index.html` — Pure HTML (no JSX)
- `public/app.js` — DOM manipulation + fetch API
- `public/style.css` — Responsive CSS

**Dependencies: 2 only**
- `express` — HTTP server
- `busboy` — Multipart form parsing

---

## ✅ Why Buildless Works

NHFS is a file browser + uploader. It needs:
- REST API endpoints (Express does this)
- HTML/CSS/JS frontend (browsers run this directly)

It does NOT need:
- Server-side rendering
- JSX compilation
- CSS frameworks
- Type checking at runtime
- Build optimization

Result: **99.4% smaller node_modules, 0 build time**

---

## 📊 Metrics

| Metric | Before (Next.js) | After (Express) | Change |
|--------|-----------------|-----------------|--------|
| Dependencies | 47 packages | 2 packages | -95.7% |
| node_modules | 746MB | 4.7MB | -99.4% |
| Install time | 90s | 20s | -77% |
| Build time | 39.5s | 0s | -100% |
| Source code | 3105 LOC | 1161 LOC | -62.6% |

---

## 🛠 Development

```bash
npm start   # Run server
```

Edit `server.js`, `public/app.js`, or `public/style.css` and refresh browser. No build step.

---

## 📜 License

MIT
