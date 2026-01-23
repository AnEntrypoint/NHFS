# Technical Caveats

## Buildless Architecture (v0.2.0+)

### Architecture Transformation
- Migrated from Next.js+React+HeroUI bloat to minimal Express+Vanilla JavaScript
- Achieves 99.4% reduction in node_modules (746MB → 4.7MB)
- Zero build step required - serve HTML/CSS/JS as-is
- Cold start: ~1 second (was 30+ seconds with Turbopack builds)
- Source code: 1161 lines total (was 3105 LOC)
- Dependencies: 2 prod packages only (express, busboy)

### Backend (Express + Busboy)
- Single server.js file handles all file operations
- Path injection prevention: `path.normalize()` + `resolveWithBaseDir()` validates all paths stay within BASE_DIR
- Multipart upload via busboy streaming (no memory buffer for large files)
- File operations: list, upload, download, delete, rename, move, mkdir
- All endpoints return JSON with consistent {ok, value/error} response format
- File type detection via extension mapping (image, video, audio, text, code, archive, document)
- Permission checks via fs.access() with granular read/write flags

### Frontend (Vanilla JavaScript)
- Single index.html with no build step
- app.js handles all UI logic without React/Framework dependencies
- Fetch API for backend communication
- Drag-drop upload with progress tracking
- Preview support: inline images, HTML5 audio/video players
- Breadcrumb navigation with history
- Dark mode via CSS prefers-color-scheme media query
- Responsive design: mobile-optimized layout

### Deployment Considerations
- Serve public/ directory as static root via Express
- BASE_DIR environment variable controls accessible filesystem
- PORT environment variable overrides default 3000
- No build artifacts, no .next folder, no dist directory needed
- Direct execution: `node server.js`

### Why This Works
- File server needs: REST API for file ops + static HTML UI
- Does NOT need: SSR, JSX compilation, styled-components, TypeScript types, build optimization
- Vanilla JS perfectly adequate for client-side interactivity
- Express sufficient for file operations without Next.js framework overhead
