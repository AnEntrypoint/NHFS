const app = {
  currentPath: './',
  selectedFile: null,
  renameFile: null,

  async init() {
    this.setupDragDrop();
    this.setupFileInput();
    await this.loadFiles();
  },

  setupDragDrop() {
    const uploadArea = document.getElementById('uploadArea');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
      uploadArea.addEventListener(evt, e => e.preventDefault());
      document.addEventListener(evt, e => e.preventDefault());
    });

    uploadArea.addEventListener('dragover', () => uploadArea.classList.add('dragover'));
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', e => {
      uploadArea.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });
  },

  setupFileInput() {
    document.getElementById('fileInput').addEventListener('change', e => {
      this.handleFiles(e.target.files);
    });
  },

  async handleFiles(files) {
    if (!files.length) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    try {
      const response = await fetch(`/api/upload?path=${encodeURIComponent(this.currentPath)}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      await this.loadFiles();
    } catch (err) {
      this.showError(`Upload error: ${err.message}`);
    }
  },

  async loadFiles(path = './') {
    this.currentPath = path;
    this.showLoading(true);
    this.clearError();

    try {
      const response = await fetch(`/api/list/${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error('Failed to load files');

      const result = await response.json();
      if (!result.ok) throw new Error(result.error);

      this.renderBreadcrumbs(result.value.path);
      this.renderFiles(result.value.children || []);
    } catch (err) {
      this.showError(`Error loading files: ${err.message}`);
    } finally {
      this.showLoading(false);
    }
  },

  renderBreadcrumbs(currentPath) {
    const container = document.getElementById('breadcrumbs');
    const parts = currentPath === './' ? [] : currentPath.split('/').filter(Boolean);

    let html = '<button class="breadcrumb-btn" onclick="app.loadFiles(\'./\')">Root</button>';

    let path = './';
    for (const part of parts) {
      path = path === './' ? `./${part}` : `${path}/${part}`;
      html += `<span class="breadcrumb-sep">/</span><button class="breadcrumb-btn" onclick="app.loadFiles('${path}')">${part}</button>`;
    }

    container.innerHTML = html;
  },

  renderFiles(files) {
    const container = document.getElementById('fileList');

    if (!files.length) {
      container.innerHTML = '<div class="empty-state">No files</div>';
      return;
    }

    let html = '';
    for (const file of files) {
      const icon = this.getFileIcon(file.type);
      const size = file.type === 'dir' ? '-' : this.formatSize(file.size);
      const date = new Date(file.time?.modified).toLocaleDateString();

      html += `
        <div class="file-row" data-path="${file.path}" data-type="${file.type}">
          <div class="file-info">
            <span class="file-icon">${icon}</span>
            <div class="file-details">
              <div class="file-name" onclick="app.openFile('${file.path}', '${file.type}')">${this.escapeHtml(file.name)}</div>
              <div class="file-meta">${size} · ${date}</div>
            </div>
          </div>
          <div class="file-actions">
            ${file.type === 'dir' ? `<button class="icon-btn" onclick="app.loadFiles('${file.path}')" title="Open">→</button>` : ''}
            ${file.type !== 'dir' ? `<button class="icon-btn" onclick="app.downloadFile('${file.path}')" title="Download">⬇</button>` : ''}
            <button class="icon-btn" onclick="app.startRename('${file.path}', '${this.escapeHtml(file.name)}')" title="Rename">✎</button>
            <button class="icon-btn delete" onclick="app.deleteFile('${file.path}')" title="Delete">✕</button>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  },

  openFile(filePath, fileType) {
    if (fileType === 'dir') {
      this.loadFiles(filePath);
      return;
    }

    this.selectedFile = filePath;
    this.showPreview(filePath, fileType);
  },

  showPreview(filePath, fileType) {
    const previewContainer = document.getElementById('previewContainer');
    const previewName = document.getElementById('previewName');
    const fileName = filePath.split('/').pop();

    previewName.textContent = fileName;

    if (['image', 'video', 'audio'].includes(fileType)) {
      if (fileType === 'image') {
        previewContainer.innerHTML = `<img src="/api/download/${encodeURIComponent(filePath)}" alt="${this.escapeHtml(fileName)}">`;
      } else if (fileType === 'video') {
        previewContainer.innerHTML = `<video controls><source src="/api/download/${encodeURIComponent(filePath)}"></video>`;
      } else if (fileType === 'audio') {
        previewContainer.innerHTML = `<audio controls><source src="/api/download/${encodeURIComponent(filePath)}"></audio>`;
      }
    } else {
      previewContainer.innerHTML = `<p class="preview-text">File: ${this.escapeHtml(fileName)}</p>`;
    }

    document.getElementById('previewModal').style.display = 'flex';
  },

  closePreview() {
    document.getElementById('previewModal').style.display = 'none';
    this.selectedFile = null;
  },

  downloadFile(filePath) {
    const fileName = filePath.split('/').pop();
    window.location.href = `/api/download/${encodeURIComponent(filePath)}`;
  },

  startRename(filePath, fileName) {
    this.renameFile = filePath;
    document.getElementById('renameInput').value = fileName;
    document.getElementById('renameModal').style.display = 'flex';
    document.getElementById('renameInput').focus();
  },

  async confirmRename() {
    const newName = document.getElementById('renameInput').value.trim();
    if (!newName) {
      this.showError('Please enter a name');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('path', this.renameFile);
      formData.append('name', newName);

      const response = await fetch('/api/rename', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Rename failed');
      this.closeRename();
      await this.loadFiles(this.currentPath);
    } catch (err) {
      this.showError(`Rename error: ${err.message}`);
    }
  },

  closeRename() {
    document.getElementById('renameModal').style.display = 'none';
    this.renameFile = null;
  },

  showCreateFolder() {
    document.getElementById('mkdirInput').value = '';
    document.getElementById('mkdirModal').style.display = 'flex';
    document.getElementById('mkdirInput').focus();
  },

  async confirmMkdir() {
    const folderName = document.getElementById('mkdirInput').value.trim();
    if (!folderName) {
      this.showError('Please enter a folder name');
      return;
    }

    try {
      const folderPath = this.currentPath === './' ? `./${folderName}` : `${this.currentPath}/${folderName}`;
      const formData = new FormData();
      formData.append('path', folderPath);

      const response = await fetch('/api/mkdir', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Create folder failed');
      this.closeMkdir();
      await this.loadFiles(this.currentPath);
    } catch (err) {
      this.showError(`Error creating folder: ${err.message}`);
    }
  },

  closeMkdir() {
    document.getElementById('mkdirModal').style.display = 'none';
  },

  async deleteFile(filePath) {
    if (!confirm('Are you sure you want to delete this?')) return;

    try {
      const response = await fetch(`/api/file/${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');
      await this.loadFiles(this.currentPath);
    } catch (err) {
      this.showError(`Delete error: ${err.message}`);
    }
  },

  getFileIcon(type) {
    const icons = {
      image: '🖼',
      video: '🎬',
      audio: '🎵',
      text: '📄',
      code: '💻',
      archive: '📦',
      document: '📋',
      dir: '📁',
      symlink: '🔗',
      other: '📝',
    };
    return icons[type] || icons.other;
  },

  formatSize(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIdx = 0;
    while (size >= 1024 && unitIdx < units.length - 1) {
      size /= 1024;
      unitIdx++;
    }
    return `${size.toFixed(1)} ${units[unitIdx]}`;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
  },

  showError(message) {
    const errorBox = document.getElementById('error');
    errorBox.textContent = message;
    errorBox.style.display = 'block';
  },

  clearError() {
    document.getElementById('error').style.display = 'none';
  },
};

document.addEventListener('DOMContentLoaded', () => app.init());
