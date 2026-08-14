# 📂 fsbrowse — Minimal File Server

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
bunx fsbrowse
```

Open `http://localhost:3000`

For development:

```bash
git clone https://github.com/AnEntrypoint/httpfs.git
cd httpfs
bun install          # 5 seconds (2 dependencies only)
bun start            # Instant - no build needed
```

### Environment Variables

```bash
PORT=3000           # Server port (default: 3000)
BASE_DIR=/files     # Directory to serve (default: /files)
BASEPATH=           # URL subpath prefix (default: empty, e.g., /files for http://example.com/files/...)
```

---

## 📂 Architecture

**Backend: `server.js` (378 LOC)**
- Express server for file operations
- REST API: `/api/list`, `/api/upload`, `/api/download`, etc.
- Busboy for streaming multipart uploads
- Path injection prevention

**Frontend: 247420 design system + webjsx**
- `public/index.html` — minimal shell with importmap pointing at the design SDK
- `public/app.js` — buildless ES module that imports `anentrypoint-design` and renders FileGrid / DropZone / FileViewer / ConfirmDialog / PromptDialog from the SDK
- No bundler. The SDK ships from `../anentrypoint-design/dist` (sibling repo) when present, otherwise from `raw.githack.com/AnEntrypoint/design/main/dist` — always the design system's current `main`, and githack never caches (unlike unpkg/jsDelivr), so a push to that repo is live immediately with no separate CDN purge step.
- Visual language: tonal surfaces, indicator rails by file type (rail color comes from `data-file-type`), zero borders, zero drop shadows. See [the design system](https://github.com/AnEntrypoint/design) for the full SKILL.md.

**Dependencies: 2 only**
- `express` — HTTP server
- `busboy` — Multipart form parsing

---

## ✅ Why Buildless Works

fsbrowse is a file browser + uploader. It needs:
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

Edit `server.js` or `public/app.js` and refresh browser. No build step.

To work on the visual language alongside fsbrowse, clone [`anentrypoint-design`](https://github.com/AnEntrypoint/design) as a sibling directory:

```
C:/dev/
  fsbrowse/
  anentrypoint-design/   # built dist/ here is auto-served at /_ds/
```

Run `node scripts/build.mjs` in the design repo to rebuild; refresh fsbrowse to pick up the changes. If the sibling is absent, fsbrowse falls back to the unpkg-published SDK.

---

## 📜 License

MIT
# Triggered npm publishing
