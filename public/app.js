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
    viewer: null,
    viewerBody: null,
    confirm: null,
    prompt: null,
    promptValue: ''
};

const root = document.getElementById('app');
const api = (p) => basePath + p;

async function loadFiles(p = './') {
    state.currentPath = p;
    state.loading = true;
    state.error = null;
    render();
    try {
        const r = await fetch(api(`/api/list/${encodeURIComponent(p)}`));
        if (!r.ok) throw new Error('list ' + r.status);
        const j = await r.json();
        if (!j.ok) throw new Error(j.error);
        state.files = (j.value.children || []).map(f => ({
            ...f,
            modified: f.time?.modified ? new Date(f.time.modified).toLocaleDateString() : ''
        }));
    } catch (e) {
        state.error = 'load: ' + e.message;
    } finally {
        state.loading = false;
        render();
    }
}

function pathSegments() {
    if (state.currentPath === './' || state.currentPath === '.' || state.currentPath === '') return [];
    return state.currentPath.replace(/^\.\//, '').split('/').filter(Boolean);
}

function pathFromSegments(n) {
    const segs = pathSegments().slice(0, n);
    return segs.length ? './' + segs.join('/') : './';
}

function joinPath(p, name) {
    if (p === './' || p === '.' || p === '') return './' + name;
    return p + '/' + name;
}

async function openFile(file) {
    if (file.type === 'dir') return loadFiles(file.path);
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

function downloadFile(file) {
    window.location.href = api(`/api/download/${encodeURIComponent(file.path)}`);
}

function rowAction(act, file) {
    if (act === 'download') return downloadFile(file);
    if (act === 'delete') {
        state.confirm = {
            title: 'delete ' + file.name + '?',
            message: file.type === 'dir' ? 'this will recursively delete the directory.' : 'this cannot be undone.',
            destructive: true,
            onConfirm: async () => {
                state.confirm = null;
                try {
                    const r = await fetch(api(`/api/file/${encodeURIComponent(file.path)}`), { method: 'DELETE' });
                    if (!r.ok) {
                        const j = await r.json().catch(() => ({}));
                        throw new Error(j.error || 'delete ' + r.status);
                    }
                    await loadFiles(state.currentPath);
                } catch (e) {
                    state.error = 'delete: ' + e.message;
                    render();
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
            onConfirm: async (v) => {
                const newName = (v || '').trim();
                state.prompt = null; state.promptValue = '';
                if (!newName) { render(); return; }
                try {
                    const fd = new FormData();
                    fd.append('path', file.path);
                    fd.append('name', newName);
                    const r = await fetch(api('/api/rename'), { method: 'POST', body: fd });
                    const j = await r.json();
                    if (!j.ok) throw new Error(j.error);
                    await loadFiles(state.currentPath);
                } catch (e) {
                    state.error = 'rename: ' + e.message;
                    render();
                }
            },
            onCancel: () => { state.prompt = null; state.promptValue = ''; render(); }
        };
        state.promptValue = file.name;
        render();
    }
}

function newFolder() {
    state.prompt = {
        title: 'new folder',
        value: '',
        confirmLabel: 'create',
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
                await loadFiles(state.currentPath);
            } catch (e) {
                state.error = 'mkdir: ' + e.message;
                render();
            }
        },
        onCancel: () => { state.prompt = null; state.promptValue = ''; render(); }
    };
    state.promptValue = '';
    render();
}

async function uploadFiles(fileList) {
    if (!fileList || !fileList.length) return;
    const items = Array.from(fileList).map(f => ({ name: f.name, pct: 0, done: false }));
    state.uploads = items;
    render();
    const fd = new FormData();
    for (const f of fileList) fd.append('files', f);
    try {
        const r = await fetch(api(`/api/upload?path=${encodeURIComponent(state.currentPath)}`), { method: 'POST', body: fd });
        if (!r.ok) throw new Error('upload ' + r.status);
        items.forEach(it => { it.pct = 100; it.done = true; });
        render();
        await loadFiles(state.currentPath);
        setTimeout(() => { state.uploads = []; render(); }, 1200);
    } catch (e) {
        items.forEach(it => { it.error = true; });
        state.error = 'upload: ' + e.message;
        render();
    }
}

function pickFiles() {
    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true;
    input.onchange = () => uploadFiles(input.files);
    input.click();
}

function App() {
    const segs = pathSegments();
    const main = h('div', { style: 'padding: 18px 24px' },
        state.error ? h('div', { class: 'ds-error', style: 'background:var(--flame);color:var(--ink);padding:10px 14px;border-radius:10px;margin-bottom:14px;cursor:pointer', onclick: () => { state.error = null; render(); } }, state.error + ' (click to dismiss)') : null,
        C.BreadcrumbPath({
            segments: segs,
            root: appName,
            onNav: (i) => loadFiles(pathFromSegments(i))
        }),
        C.FileToolbar({
            left: [
                C.Btn({ onClick: pickFiles, children: '⇪ upload' }),
                C.Btn({ onClick: newFolder, children: '+ folder' }),
                C.Btn({ onClick: () => loadFiles(state.currentPath), children: '↻ refresh' })
            ],
            right: [
                h('span', { class: 'meta', style: 'color:var(--panel-text-3);font-family:var(--ff-mono);font-size:12px' },
                    state.loading ? 'loading…' : String(state.files.length).padStart(2, '0') + ' items'
                )
            ]
        }),
        C.DropZone({
            label: state.dragover ? 'release to upload' : 'drop files here to upload',
            dragover: state.dragover,
            onDragOver: () => { if (!state.dragover) { state.dragover = true; render(); } },
            onDragLeave: () => { state.dragover = false; render(); },
            onDrop: (files) => { state.dragover = false; uploadFiles(files); },
            onPick: pickFiles
        }),
        C.UploadProgress({ items: state.uploads }),
        C.FileGrid({
            files: state.files,
            onOpen: openFile,
            onAction: rowAction,
            emptyText: state.loading ? 'loading…' : 'empty directory — drop files or create a folder.'
        })
    );

    return h('div', {},
        C.AppShell({
            topbar: C.Topbar({
                brand: appName,
                leaf: 'files',
                items: []
            }),
            crumb: C.Crumb({ trail: [appName], leaf: state.currentPath === './' ? 'root' : segs[segs.length - 1] || 'root' }),
            main,
            status: C.Status({
                left: ['main', '• ' + state.files.length + ' items'],
                right: [state.loading ? 'loading' : 'live']
            })
        }),
        state.viewer ? C.FileViewer({
            file: state.viewer,
            body: state.viewerBody,
            onClose: () => { state.viewer = null; state.viewerBody = null; render(); },
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

function render() { applyDiff(root, [App()]); }

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (state.viewer) { state.viewer = null; state.viewerBody = null; render(); return; }
    if (state.prompt) { state.prompt.onCancel && state.prompt.onCancel(); return; }
    if (state.confirm) { state.confirm.onCancel && state.confirm.onCancel(); }
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    document.addEventListener(evt, e => e.preventDefault());
});

loadFiles('./');
