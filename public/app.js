import {
    h, applyDiff, components as C
} from 'anentrypoint-design';

const basePath = window.BASEPATH || '';
const appName = window.APP_NAME || 'fsbrowse';

const state = {
    currentPath: './',
    files: [],
    error: null,
    loading: false,
    dragover: false,
    uploads: [],
    uploadLabel: '',
    viewer: null,
    viewerBody: null,
    confirm: null,
    prompt: null,
    promptValue: '',
    filter: '',
    sortKey: 'name',   // 'name' | 'size' | 'modified'
    sortDir: 1,        // 1 asc, -1 desc
    selected: -1,      // index into the filtered list for keyboard nav
    dropTarget: null,  // path of the dir currently a drag-move drop target
    marked: new Set(), // multi-select: set of selected file paths
    anchor: -1,        // shift-range anchor index (into visibleFiles order)
    showHelp: false    // keyboard-shortcuts hint visibility
};

const root = document.getElementById('app');
const api = (p) => basePath + p;

// ── path helpers ────────────────────────────────────────────
function pathSegments(p = state.currentPath) {
    if (p === './' || p === '.' || p === '') return [];
    return p.replace(/^\.\//, '').split('/').filter(Boolean);
}
function pathFromSegments(n) {
    const segs = pathSegments().slice(0, n);
    return segs.length ? './' + segs.join('/') : './';
}
function joinPath(p, name) {
    if (p === './' || p === '.' || p === '') return './' + name;
    return p + '/' + name;
}
function parentPath() {
    const segs = pathSegments();
    return segs.length ? pathFromSegments(segs.length - 1) : './';
}

// ── history / deep-link ─────────────────────────────────────
function pathToHash(p) {
    const segs = pathSegments(p);
    return segs.length ? '#/' + segs.map(encodeURIComponent).join('/') : '#/';
}
function hashToPath() {
    const hStr = (location.hash || '').replace(/^#\/?/, '');
    if (!hStr) return './';
    const segs = hStr.split('/').filter(Boolean).map(decodeURIComponent);
    return segs.length ? './' + segs.join('/') : './';
}
function syncTitleAndHistory(push) {
    const segs = pathSegments();
    const leaf = segs.length ? segs[segs.length - 1] : 'root';
    document.title = (segs.length ? leaf + ' — ' : '') + appName;
    const targetHash = pathToHash(state.currentPath);
    if (push && location.hash !== targetHash) {
        history.pushState({ path: state.currentPath }, '', targetHash);
    }
}

// ── data ────────────────────────────────────────────────────
async function loadFiles(p = './', push = true) {
    state.currentPath = p;
    state.loading = true;
    state.error = null;
    state.filter = '';
    state.selected = -1;
    clearSelection();
    render();
    syncTitleAndHistory(push);
    try {
        const r = await fetch(api(`/api/list/${encodeURIComponent(p)}`));
        if (!r.ok) throw new Error('list ' + r.status);
        const j = await r.json();
        if (!j.ok) throw new Error(j.error);
        state.files = (j.value.children || []).map(f => ({
            ...f,
            modified: f.time?.modified ? new Date(f.time.modified).toLocaleDateString() : '',
            modifiedTs: f.time?.modified ? new Date(f.time.modified).getTime() : 0
        }));
    } catch (e) {
        state.error = 'load: ' + e.message;
    } finally {
        state.loading = false;
        // If the file open in the viewer no longer exists after this reload
        // (deleted/moved/renamed elsewhere), close the viewer rather than show
        // a stale preview.
        if (state.viewer && !state.files.some(f => f.path === state.viewer.path)) {
            state.viewer = null;
            state.viewerBody = null;
        }
        render();
    }
}

// Files after filter + sort, dirs always first.
function visibleFiles() {
    const q = state.filter.trim().toLowerCase();
    let list = state.files;
    if (q) list = list.filter(f => f.name.toLowerCase().includes(q));
    const dir = state.sortDir;
    const key = state.sortKey;
    return [...list].sort((a, b) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1;
        if (a.type !== 'dir' && b.type === 'dir') return 1;
        let cmp;
        if (key === 'size') cmp = (a.size || 0) - (b.size || 0);
        else if (key === 'modified') cmp = (a.modifiedTs || 0) - (b.modifiedTs || 0);
        else cmp = a.name.localeCompare(b.name);
        return cmp * dir;
    });
}

function previewableFiles() {
    return visibleFiles().filter(f => f.type !== 'dir');
}

// ── viewer ──────────────────────────────────────────────────
let lastFocused = null;

async function openFile(file) {
    if (file.type === 'dir') return loadFiles(file.path);
    lastFocused = document.activeElement;
    state.viewer = file;
    state.viewerBody = h('div', { class: 'ds-preview-fallback' }, h('span', { class: 'ds-preview-glyph' }, '⏳'), h('span', {}, 'loading…'));
    render();
    if (file.type === 'image' || file.type === 'video' || file.type === 'audio') {
        const src = api(`/api/download/${encodeURIComponent(file.path)}`);
        state.viewerBody = C.FilePreviewMedia({ type: file.type, src, name: file.name });
        render();
        return;
    }
    try {
        const r = await fetch(api(`/api/view/${encodeURIComponent(file.path)}`));
        const j = await r.json();
        if (!j.ok) throw new Error(j.error);
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const codeExts = ['js','ts','jsx','tsx','py','java','c','cpp','css','html','xml','yaml','yml','sh','bash','go','rs','kotlin','swift','rb','php'];
        if (file.type === 'code' || codeExts.includes(ext)) {
            state.viewerBody = C.FilePreviewCode({ content: j.value, lang: ext });
        } else if (ext === 'json') {
            let pretty = j.value;
            try { pretty = JSON.stringify(JSON.parse(j.value), null, 2); } catch {}
            state.viewerBody = C.FilePreviewCode({ content: pretty, lang: 'json' });
        } else {
            const truncated = j.value.length > 10000;
            const content = truncated ? j.value.slice(0, 10000) : j.value;
            state.viewerBody = C.FilePreviewText({ content, truncated });
        }
    } catch (e) {
        state.viewerBody = h('div', { class: 'ds-preview-fallback' },
            h('span', { class: 'ds-preview-glyph' }, '✕'),
            h('span', {}, 'view: ' + e.message)
        );
    }
    render();
}

function closeViewer() {
    state.viewer = null;
    state.viewerBody = null;
    render();
    if (lastFocused && document.contains(lastFocused)) {
        try { lastFocused.focus(); } catch {}
    }
    lastFocused = null;
}

function stepViewer(delta) {
    if (!state.viewer) return;
    const prev = previewableFiles();
    const idx = prev.findIndex(f => f.path === state.viewer.path);
    if (idx === -1) return;
    const next = prev[(idx + delta + prev.length) % prev.length];
    if (next) openFile(next);
}

function downloadFile(file) {
    window.location.href = api(`/api/download/${encodeURIComponent(file.path)}`);
}

// ── error toast (auto-dismiss) ──────────────────────────────
let errorTimer = null;
function setError(msg) {
    state.error = msg;
    if (errorTimer) clearTimeout(errorTimer);
    if (msg) errorTimer = setTimeout(() => { state.error = null; render(); }, 6000);
    render();
}

// ── row actions ─────────────────────────────────────────────
function rowAction(act, file) {
    if (act === 'download') return downloadFile(file);
    if (act === 'delete') {
        state.confirm = {
            title: 'delete ' + file.name + '?',
            message: file.type === 'dir' ? 'this will recursively delete the directory and everything inside it.' : 'this cannot be undone.',
            destructive: true,
            onConfirm: async () => {
                state.confirm = null;
                try {
                    const r = await fetch(api(`/api/file/${encodeURIComponent(file.path)}`), { method: 'DELETE' });
                    if (!r.ok) {
                        const j = await r.json().catch(() => ({}));
                        throw new Error(j.error || 'delete ' + r.status);
                    }
                    await loadFiles(state.currentPath, false);
                } catch (e) {
                    setError('delete: ' + e.message);
                }
            },
            onCancel: () => { state.confirm = null; render(); }
        };
        render();
        return;
    }
    if (act === 'rename') {
        state.prompt = {
            title: 'rename ' + file.name,
            value: file.name,
            confirmLabel: 'rename',
            selectBasename: true,
            onConfirm: async (v) => {
                const newName = (v || '').trim();
                state.prompt = null; state.promptValue = '';
                if (!newName || newName === file.name) { render(); return; }
                try {
                    const fd = new FormData();
                    fd.append('path', file.path);
                    fd.append('name', newName);
                    const r = await fetch(api('/api/rename'), { method: 'POST', body: fd });
                    const j = await r.json();
                    if (!j.ok) throw new Error(j.error);
                    await loadFiles(state.currentPath, false);
                } catch (e) {
                    setError('rename: ' + e.message);
                }
            },
            onCancel: () => { state.prompt = null; state.promptValue = ''; render(); }
        };
        state.promptValue = file.name;
        render();
    }
}

async function moveFile(file, destDir) {
    if (file.path === destDir) return;
    try {
        const fd = new FormData();
        fd.append('source', file.path);
        fd.append('destination', destDir);
        const r = await fetch(api('/api/move'), { method: 'POST', body: fd });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error);
        await loadFiles(state.currentPath, false);
    } catch (e) {
        setError('move: ' + e.message);
    }
}

function newFolder() {
    state.prompt = {
        title: 'new folder',
        value: '',
        confirmLabel: 'create',
        placeholder: 'folder name',
        onConfirm: async (v) => {
            const name = (v || '').trim();
            state.prompt = null; state.promptValue = '';
            if (!name) { render(); return; }
            try {
                const fd = new FormData();
                fd.append('path', joinPath(state.currentPath, name));
                const r = await fetch(api('/api/mkdir'), { method: 'POST', body: fd });
                const j = await r.json();
                if (!j.ok) throw new Error(j.error);
                await loadFiles(state.currentPath, false);
            } catch (e) {
                setError('mkdir: ' + e.message);
            }
        },
        onCancel: () => { state.prompt = null; state.promptValue = ''; render(); }
    };
    state.promptValue = '';
    render();
}

// ── upload with real progress (XHR) ─────────────────────────
function uploadFiles(fileList) {
    if (!fileList || !fileList.length) return;
    const files = Array.from(fileList);
    const total = files.reduce((s, f) => s + (f.size || 0), 0);
    // One aggregate item — a single request carries all files, so a single
    // honest bar (driven by total bytes) beats faking per-file accuracy.
    state.uploadLabel = files.length === 1 ? files[0].name : files.length + ' files';
    state.uploads = [{ name: state.uploadLabel, pct: 0, done: false }];
    render();

    const fd = new FormData();
    for (const f of files) fd.append('files', f);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', api(`/api/upload?path=${encodeURIComponent(state.currentPath)}`));
    xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const pct = Math.round((e.loaded / (e.total || total || 1)) * 100);
        state.uploads = [{ name: state.uploadLabel, pct: Math.min(99, pct), done: false }];
        render();
    };
    xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            state.uploads = [{ name: state.uploadLabel, pct: 100, done: true }];
            render();
            await loadFiles(state.currentPath, false);
            setTimeout(() => { state.uploads = []; render(); }, 1200);
        } else {
            state.uploads = [{ name: state.uploadLabel, pct: 0, error: true }];
            setError('upload: ' + xhr.status);
        }
    };
    xhr.onerror = () => {
        state.uploads = [{ name: state.uploadLabel, pct: 0, error: true }];
        setError('upload: network error');
    };
    xhr.send(fd);
}

function pickFiles() {
    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true;
    input.onchange = () => uploadFiles(input.files);
    input.click();
}

// ── sort control ────────────────────────────────────────────
function cycleSort(key) {
    if (state.sortKey === key) state.sortDir = -state.sortDir;
    else { state.sortKey = key; state.sortDir = 1; }
    state.selected = -1;
    render();
}
function sortLabel() {
    const arrow = state.sortDir === 1 ? '↑' : '↓';
    return state.sortKey + ' ' + arrow;
}

// Kit Btn renders <a href="#"> and does not preventDefault, so a raw click
// would append '#' to the URL and clobber our hash-based routing. Wrap every
// Btn handler so the anchor's default navigation is suppressed.
function guard(fn) {
    return (e) => { if (e && e.preventDefault) e.preventDefault(); fn(); };
}

// ── multi-select ────────────────────────────────────────────
function clearSelection() { state.marked = new Set(); state.anchor = -1; }

function allSelected(files) {
    return files.length > 0 && files.every(f => state.marked.has(f.path));
}
function toggleSelectAll(files) {
    if (allSelected(files)) clearSelection();
    else state.marked = new Set(files.map(f => f.path));
    render();
}

function toggleMark(path) {
    if (state.marked.has(path)) state.marked.delete(path);
    else state.marked.add(path);
}

// Handle a selection gesture on the row at index i (in visibleFiles order).
// modifiers: { ctrl, shift }. Returns true if it consumed the click (i.e. it
// was a selection gesture, not a plain open).
function handleSelectGesture(i, file, mods) {
    const files = visibleFiles();
    if (mods.shift && state.anchor >= 0) {
        const [a, b] = state.anchor <= i ? [state.anchor, i] : [i, state.anchor];
        for (let k = a; k <= b; k++) if (files[k]) state.marked.add(files[k].path);
        render();
        return true;
    }
    if (mods.ctrl) {
        toggleMark(file.path);
        state.anchor = i;
        render();
        return true;
    }
    return false;
}

async function bulkDelete() {
    const paths = [...state.marked];
    if (!paths.length) return;
    state.confirm = {
        title: 'delete ' + paths.length + ' item' + (paths.length > 1 ? 's' : '') + '?',
        message: 'this cannot be undone. directories are deleted recursively.',
        destructive: true,
        confirmLabel: 'delete ' + paths.length,
        onConfirm: async () => {
            state.confirm = null; render();
            const failures = [];
            for (const p of paths) {
                try {
                    const r = await fetch(api(`/api/file/${encodeURIComponent(p)}`), { method: 'DELETE' });
                    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || r.status); }
                } catch (e) { failures.push(p.split('/').pop() + ': ' + e.message); }
            }
            clearSelection();
            await loadFiles(state.currentPath, false);
            if (failures.length) setError('delete failed for ' + failures.length + ': ' + failures.join('; '));
        },
        onCancel: () => { state.confirm = null; render(); }
    };
    render();
}

async function bulkMoveTo(destDir) {
    const paths = [...state.marked].filter(p => p !== destDir);
    if (!paths.length) return;
    const byPath = new Map(state.files.map(f => [f.path, f]));
    const failures = [];
    for (const p of paths) {
        const f = byPath.get(p);
        if (!f) continue;
        try {
            const fd = new FormData();
            fd.append('source', f.path);
            fd.append('destination', destDir);
            const r = await fetch(api('/api/move'), { method: 'POST', body: fd });
            const j = await r.json();
            if (!j.ok) throw new Error(j.error);
        } catch (e) { failures.push(f.name + ': ' + e.message); }
    }
    clearSelection();
    await loadFiles(state.currentPath, false);
    if (failures.length) setError('move failed for ' + failures.length + ': ' + failures.join('; '));
}

// ── render ──────────────────────────────────────────────────
function App() {
    const segs = pathSegments();
    const files = visibleFiles();
    // tag the keyboard-selected row as active
    const decorated = files.map((f, i) => ({ ...f, active: i === state.selected }));

    const filterInput = h('input', {
        class: 'input ds-filter-input',
        type: 'search',
        placeholder: 'filter…',
        value: state.filter,
        'aria-label': 'filter files by name',
        oninput: (e) => { state.filter = e.target.value; state.selected = -1; render(); }
    });

    const main = h('div', { class: 'ds-file-stage' },
        h('div', {
            class: 'ds-sr-live',
            'aria-live': 'polite',
            'aria-atomic': 'true',
            style: { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }
        }, state.error ? state.error : (state.loading ? 'loading directory' : files.length + ' items')),
        state.error ? h('div', { class: 'ds-error-banner', role: 'alert', onclick: () => { state.error = null; render(); } }, state.error + ' (click to dismiss)') : null,
        C.BreadcrumbPath({
            segments: segs,
            root: appName,
            onNav: (i) => loadFiles(pathFromSegments(i))
        }),
        C.FileToolbar({
            left: [
                C.Btn({ onClick: guard(pickFiles), children: '⇪ upload' }),
                C.Btn({ onClick: guard(newFolder), children: '+ folder' }),
                C.Btn({ onClick: guard(() => loadFiles(state.currentPath, false)), children: '↻ refresh' }),
                segs.length ? C.Btn({ onClick: guard(() => loadFiles(parentPath())), children: '↑ up' }) : null,
                C.Btn({ onClick: guard(() => cycleSort(state.sortKey === 'name' ? 'modified' : state.sortKey === 'modified' ? 'size' : 'name')), children: '⇅ ' + sortLabel() }),
                files.length ? C.Btn({ onClick: guard(() => toggleSelectAll(files)), children: allSelected(files) ? '☐ none' : '☑ all' }) : null
            ].filter(Boolean),
            right: [
                filterInput,
                h('span', { class: 'meta ds-meta-mono' },
                    state.loading ? 'loading…' : String(files.length).padStart(2, '0') + ' items'
                ),
                C.Btn({ onClick: guard(() => { state.showHelp = !state.showHelp; render(); }), children: '?', 'aria-label': 'keyboard shortcuts' })
            ]
        }),
        state.showHelp ? ShortcutsHint() : null,
        state.marked.size ? BulkBar() : null,
        C.DropZone({
            label: state.dragover ? 'release to upload' : 'drop files here to upload',
            dragover: state.dragover,
            onDragOver: () => { if (!state.dragover) { state.dragover = true; render(); } },
            onDragLeave: () => { state.dragover = false; render(); },
            onDrop: (files) => { state.dragover = false; uploadFiles(files); },
            onPick: pickFiles
        }),
        C.UploadProgress({ items: state.uploads }),
        FileList(decorated)
    );

    return h('div', {},
        C.AppShell({
            topbar: C.Topbar({ brand: appName, leaf: 'files', items: [] }),
            crumb: C.Crumb({ trail: [appName], leaf: state.currentPath === './' ? 'root' : segs[segs.length - 1] || 'root' }),
            main,
            status: C.Status({
                left: ['main', '• ' + files.length + ' items'],
                right: [state.loading ? 'loading' : 'live']
            })
        }),
        state.viewer ? C.FileViewer({
            file: state.viewer,
            body: state.viewerBody,
            onClose: closeViewer,
            onAction: (act) => { if (act === 'download') downloadFile(state.viewer); }
        }) : null,
        state.confirm ? C.ConfirmDialog(state.confirm) : null,
        state.prompt ? C.PromptDialog({
            ...state.prompt,
            value: state.promptValue,
            onInput: (v) => { state.promptValue = v; }
        }) : null
    );
}

function ShortcutsHint() {
    const rows = [
        ['↑ / ↓', 'move selection'],
        ['Enter', 'open file / folder'],
        ['Backspace', 'up a directory'],
        ['Space', 'toggle select row'],
        ['Ctrl/⌘ + click', 'add to selection'],
        ['Shift + click', 'select range'],
        ['Ctrl/⌘ + A', 'select all'],
        ['Delete', 'delete selection'],
        ['← / →', 'prev / next in viewer'],
        ['Esc', 'close dialog']
    ];
    return h('div', { class: 'ds-shortcuts-hint', role: 'region', 'aria-label': 'keyboard shortcuts' },
        ...rows.map(([k, d]) => h('div', { class: 'ds-shortcut-row' },
            h('kbd', { class: 'ds-kbd' }, k),
            h('span', {}, d)
        ))
    );
}

function BulkBar() {
    const n = state.marked.size;
    return h('div', { class: 'ds-bulk-bar', role: 'toolbar', 'aria-label': 'bulk actions' },
        h('span', { class: 'ds-bulk-count' }, n + ' selected'),
        C.Btn({ onClick: guard(() => { clearSelection(); render(); }), children: 'clear' }),
        C.Btn({ onClick: guard(bulkDelete), children: '✕ delete selected', danger: true }),
        C.Btn({ onClick: guard(() => {
            // move selected: prompt for a destination directory (relative to current)
            state.prompt = {
                title: 'move ' + n + ' item' + (n > 1 ? 's' : '') + ' to…',
                value: '',
                placeholder: 'destination folder (e.g. docs)',
                confirmLabel: 'move',
                onConfirm: async (v) => {
                    const dest = (v || '').trim();
                    state.prompt = null; state.promptValue = '';
                    if (!dest) { render(); return; }
                    await bulkMoveTo(joinPath(state.currentPath, dest));
                },
                onCancel: () => { state.prompt = null; state.promptValue = ''; render(); }
            };
            state.promptValue = '';
            render();
        }), children: '⇨ move selected' })
    );
}

// FileGrid wrapper that adds drag-to-move and a stable loading state.
function FileList(files) {
    if (state.loading && !files.length) {
        return h('div', { class: 'ds-file-grid ds-file-grid-loading', 'aria-busy': 'true' },
            ...Array.from({ length: 5 }).map((_, i) =>
                h('div', { key: 'sk' + i, class: 'ds-file-skeleton' })
            )
        );
    }
    const emptyText = state.filter
        ? 'no files match “' + state.filter + '”'
        : 'empty directory — drop files or create a folder.';
    const grid = C.FileGrid({
        files,
        onOpen: openFile,
        onAction: rowAction,
        emptyText
    });
    // Augment the rendered grid's row vnodes with drag handlers (move support).
    if (grid && grid.props && Array.isArray(grid.props.children)) {
        grid.props.children.forEach((rowV, i) => {
            const f = files[i];
            if (!rowV || !f) return;
            rowV.props = rowV.props || {};

            // Selection state class + checkbox affordance.
            if (state.marked.has(f.path)) {
                rowV.props.class = (rowV.props.class || '') + ' selected';
                rowV.props['aria-selected'] = 'true';
            }
            const box = h('button', {
                class: 'ds-file-check' + (state.marked.has(f.path) ? ' on' : ''),
                title: 'select',
                'aria-label': (state.marked.has(f.path) ? 'deselect ' : 'select ') + f.name,
                'aria-pressed': state.marked.has(f.path) ? 'true' : 'false',
                onclick: (e) => { e.stopPropagation(); toggleMark(f.path); state.anchor = i; render(); }
            }, state.marked.has(f.path) ? '✓' : '');
            // Prepend the checkbox as the first child of the row.
            if (Array.isArray(rowV.props.children)) rowV.props.children.unshift(box);

            // Intercept click for ctrl/shift selection; plain click still opens.
            const origOpen = rowV.props.onclick;
            rowV.props.onclick = (e) => {
                if (e.ctrlKey || e.metaKey || e.shiftKey) {
                    e.preventDefault(); e.stopPropagation();
                    handleSelectGesture(i, f, { ctrl: e.ctrlKey || e.metaKey, shift: e.shiftKey });
                    return;
                }
                if (origOpen) origOpen(e);
            };

            rowV.props.draggable = true;
            rowV.props.ondragstart = (e) => {
                // If this row is part of the selection, drag the whole selection.
                const payload = state.marked.has(f.path) ? [...state.marked].join('\n') : f.path;
                e.dataTransfer.setData('text/fsbrowse-path', payload);
                e.dataTransfer.effectAllowed = 'move';
            };
            if (f.type === 'dir') {
                rowV.props.ondragover = (e) => {
                    if (e.dataTransfer.types.includes('text/fsbrowse-path')) {
                        e.preventDefault();
                        if (state.dropTarget !== f.path) { state.dropTarget = f.path; render(); }
                    }
                };
                rowV.props.ondragleave = () => { if (state.dropTarget === f.path) { state.dropTarget = null; render(); } };
                rowV.props.ondrop = (e) => {
                    e.preventDefault();
                    const payload = e.dataTransfer.getData('text/fsbrowse-path');
                    state.dropTarget = null;
                    const srcPaths = payload.split('\n').filter(Boolean);
                    if (srcPaths.length > 1) {
                        // multi-move: temporarily treat these as the selection
                        state.marked = new Set(srcPaths);
                        bulkMoveTo(f.path);
                    } else {
                        const srcFile = state.files.find(x => x.path === srcPaths[0]);
                        if (srcFile) moveFile(srcFile, f.path);
                    }
                    render();
                };
                if (state.dropTarget === f.path) {
                    rowV.props.class = (rowV.props.class || '') + ' ds-drop-target';
                }
            }
        });
    }
    return grid;
}

let lastPromptSelected = false;
function applyPromptSelection() {
    if (state.prompt && state.prompt.selectBasename && !lastPromptSelected) {
        const inp = root.querySelector('.ds-modal-input');
        if (inp) {
            const v = inp.value;
            const dot = v.lastIndexOf('.');
            inp.focus();
            inp.setSelectionRange(0, dot > 0 ? dot : v.length);
            lastPromptSelected = true;
        }
    }
    if (!state.prompt) lastPromptSelected = false;
}
function render() {
    applyDiff(root, [App()]);
    requestAnimationFrame(applyPromptSelection);
}

// ── keyboard ────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    // Modal-priority Escape handling
    if (e.key === 'Escape') {
        if (state.viewer) { closeViewer(); return; }
        if (state.prompt) { state.prompt.onCancel && state.prompt.onCancel(); return; }
        if (state.confirm) { state.confirm.onCancel && state.confirm.onCancel(); return; }
        return;
    }
    // Viewer prev/next
    if (state.viewer) {
        if (e.key === 'ArrowRight') { e.preventDefault(); stepViewer(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); stepViewer(-1); }
        return;
    }
    // Don't hijack typing in inputs
    const tag = (e.target && e.target.tagName) || '';
    if (state.prompt || state.confirm || tag === 'INPUT' || tag === 'TEXTAREA') return;

    const files = visibleFiles();
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.selected = Math.min(files.length - 1, state.selected + 1);
        render(); focusSelected();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.selected = Math.max(0, state.selected - 1);
        render(); focusSelected();
    } else if (e.key === 'Enter' && state.selected >= 0 && files[state.selected]) {
        e.preventDefault();
        openFile(files[state.selected]);
    } else if (e.key === ' ' && state.selected >= 0 && files[state.selected]) {
        // Space toggles selection membership of the keyboard-focused row.
        e.preventDefault();
        toggleMark(files[state.selected].path);
        state.anchor = state.selected;
        render(); focusSelected();
    } else if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        state.marked = new Set(files.map(f => f.path));
        render();
    } else if (e.key === 'Delete' && state.marked.size) {
        e.preventDefault();
        bulkDelete();
    } else if (e.key === 'Backspace' && pathSegments().length) {
        e.preventDefault();
        loadFiles(parentPath());
    }
});

function focusSelected() {
    const rows = root.querySelectorAll('.ds-file-row');
    const el = rows[state.selected];
    if (el) el.focus();
}

// drag/drop page guards (prevent browser navigating to dropped files)
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    document.addEventListener(evt, e => e.preventDefault());
});

// history
window.addEventListener('popstate', () => {
    const p = hashToPath();
    if (p !== state.currentPath) loadFiles(p, false);
});

// initial load — honor a deep-link hash if present
loadFiles(hashToPath(), false);
syncTitleAndHistory(false);
