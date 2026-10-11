// ===================================
// UNIFIED INPUT COMPONENT
// Standardized dropzone for all 37 Image Tools
// Features: Drag-Drop, Paste, URL Import, Batch List
// ===================================

class UnifiedInput {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'upload-zone',
            fileListId: options.fileListId || 'file-list',
            acceptTypes: options.acceptTypes || 'image/*',
            showList: options.showList !== false, // Default true
            multiple: options.multiple !== false,
            maxFiles: options.maxFiles || 100,
            maxSizeMB: options.maxSizeMB || 500,
            toolIcon: options.toolIcon || '🖼️',
            toolName: options.toolName || 'Image Tool',
            allowWebcam: options.allowWebcam !== false, // Default true
            allowUrl: options.allowUrl !== false,       // Default true
            onFilesLoaded: options.onFilesLoaded || (() => { }),
            onFileRemoved: options.onFileRemoved || (() => { }),
            ...options
        };

        this.files = [];
        this.fileHashes = new Set();
        this.stream = null;
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const container = document.getElementById(this.options.containerId);
        if (!container) return;

        // Check if we already rendered to this container
        let wrapper = container.querySelector('.unified-input-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'unified-input-wrapper';
            container.appendChild(wrapper);
        }

        const webcamButtonHtml = this.options.allowWebcam ? `
            <button class="btn btn-secondary dropzone-url-btn" id="webcam-btn">
                <span>📷</span> Webcam
            </button>
        ` : '';

        const urlSectionHtml = this.options.allowUrl ? `
            <div class="dropzone-url-area">
                <div class="url-badge">⚡ Live URL Fetching</div>
                <div class="url-input-wrapper">
                    <span class="url-icon">🔗</span>
                    <input type="text" id="direct-url-input" placeholder="Paste image link here..." class="direct-url-input">
                    <button class="btn btn-primary btn-sm" id="direct-url-import-btn">Import Link</button>
                </div>
            </div>
        ` : '';

        const webcamModalHtml = this.options.allowWebcam ? `
            <!-- Webcam Modal -->
            <div class="modal" id="webcam-modal" style="display: none;">
                <div class="modal-backdrop"></div>
                <div class="modal-content webcam-modal-content">
                    <div class="modal-header">
                        <h3>Capture from Webcam</h3>
                        <button class="modal-close" id="webcam-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="webcam-container">
                            <video id="webcam-video" autoplay playsinline></video>
                            <canvas id="webcam-canvas" style="display: none;"></canvas>
                            <div class="webcam-overlay" id="webcam-countdown" style="display: none;">3</div>
                        </div>
                        <div class="webcam-controls">
                            <div class="control-group">
                                <label>Exposure</label>
                                <input type="range" id="webcam-exposure" min="-2" max="2" step="0.1" value="0">
                            </div>
                            <div class="control-group">
                                <label>Contrast</label>
                                <input type="range" id="webcam-contrast" min="0" max="200" value="100">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="webcam-cancel">Cancel</button>
                        <button class="btn btn-primary" id="webcam-capture">📸 Capture</button>
                    </div>
                </div>
            </div>
        ` : '';

        wrapper.innerHTML = `
            <div class="unified-dropzone" id="unified-dropzone">
                <div class="dropzone-content">
                    <div class="dropzone-icon">${this.options.toolIcon}</div>
                    <h3 class="dropzone-title">Drop your files here</h3>
                    <p class="dropzone-subtitle">or click to browse • Ctrl+V to paste • Max ${this.options.maxFiles} files</p>
                    
                    <div class="dropzone-actions">
                        <button class="btn btn-primary dropzone-browse-btn" id="browse-btn">
                            <span>📂</span> Browse Files
                        </button>
                        ${webcamButtonHtml}
                    </div>

                    ${urlSectionHtml}
                    
                    <div class="dropzone-formats">
                        Supports: ${this.options.acceptTypes.replace(/\./g, '').toUpperCase()}
                    </div>
                </div>
                
                <input type="file" id="unified-file-input" 
                       accept="${this.options.acceptTypes}" 
                       ${this.options.multiple ? 'multiple' : ''} 
                       style="display: none;">
            </div>
            
            <div class="file-list-container" id="file-list-container" style="display: none;">
                <div class="file-list-header">
                    <span class="file-count" id="file-count">0 files selected</span>
                    <div class="header-actions">
                        <button class="btn btn-sm btn-secondary" id="add-more-btn">+ Add More</button>
                        <button class="btn btn-sm btn-danger" id="clear-all-btn">Clear All</button>
                    </div>
                </div>
                <div class="file-list" id="unified-file-list"></div>
            </div>
            
            ${webcamModalHtml}
        `;

        this.injectStyles();
    }

    injectStyles() {
        if (document.getElementById('unified-input-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'unified-input-styles';
        styles.textContent = `
            .unified-dropzone {
                border: 3px dashed var(--border-color);
                border-radius: var(--radius-xl);
                padding: var(--space-8);
                text-align: center;
                background: var(--bg-secondary);
                transition: all var(--transition-base);
                cursor: pointer;
                min-height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }

            .unified-dropzone.dragover, .unified-input-wrapper.dragover .unified-dropzone {
                border-color: var(--primary-500);
                background: rgba(var(--primary-rgb), 0.05);
                transform: scale(0.99);
            }
            
            .unified-input-wrapper.dragover .file-list-container {
                 border-color: var(--primary-500);
                 box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
            }

            .dropzone-icon { font-size: 3.5rem; margin-bottom: 1rem; }
            .dropzone-title { font-size: 1.5rem; margin-bottom: 0.5rem; }
            .dropzone-subtitle { color: var(--text-secondary); margin-bottom: 1.5rem; }
            .dropzone-actions { display: flex; gap: 0.75rem; justify-content: center; margin-bottom: 1.5rem; }
            .dropzone-formats { font-size: 0.85rem; color: var(--text-tertiary); }

            .file-list-container {
                margin-top: 2rem;
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
                padding: 1.5rem;
                border: 1px solid var(--border-color);
            }

            .file-list-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
            }

            .file-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 1.25rem;
                max-height: 500px;
                overflow-y: auto;
                padding: 0.5rem;
            }

            .file-item {
                background: var(--bg-primary);
                border-radius: var(--radius-md);
                padding: 1rem;
                border: 1px solid var(--border-color);
                position: relative;
                transition: transform 0.2s;
            }

            .file-item:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }

            .file-item-preview {
                width: 100%;
                height: 120px;
                object-fit: contain;
                border-radius: var(--radius-sm);
                margin-bottom: 0.75rem;
                background: #0001;
            }

            .file-item-name {
                font-size: 0.9rem;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .file-item-size { font-size: 0.75rem; color: var(--text-tertiary); }

            .file-item-remove {
                position: absolute;
                top: -8px;
                right: -8px;
                width: 24px;
                height: 24px;
                background: var(--error);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: var(--shadow-sm);
                opacity: 0;
                transition: opacity 0.2s;
            }

            .file-item:hover .file-item-remove { opacity: 1; }

            .file-item-status {
                height: 4px;
                background: var(--border-color);
                border-radius: 2px;
                margin-top: 0.75rem;
                overflow: hidden;
            }

            .file-item-progress {
                height: 100%;
                width: 0%;
                background: var(--primary-500);
                transition: width 0.3s;
            }

            /* Webcam Specific */
            .webcam-container {
                position: relative;
                background: #000;
                border-radius: var(--radius-lg);
                overflow: hidden;
                aspect-ratio: 4/3;
            }

            #webcam-video { width: 100%; height: 100%; object-fit: cover; }
            .webcam-overlay {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 5rem;
                color: white;
                background: rgba(0,0,0,0.3);
            }

            .webcam-controls { margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .webcam-modal-content { max-width: 640px; }

            /* Direct URL Input Area */
            .dropzone-url-area {
                margin: 1.5rem auto;
                max-width: 400px;
                width: 100%;
            }

            .url-input-wrapper {
                display: flex;
                align-items: center;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-lg);
                padding: 4px 6px 4px 12px;
                transition: all 0.3s ease;
                box-shadow: var(--shadow-sm);
            }

            .url-input-wrapper:focus-within {
                border-color: var(--primary-500);
                box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
            }

            .url-icon {
                font-size: 1.1rem;
                margin-right: 8px;
                color: var(--text-tertiary);
            }

            .direct-url-input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                color: var(--text-primary);
                font-size: 0.95rem;
                min-width: 100px;
            }

            .direct-url-input::placeholder {
                color: var(--text-tertiary);
                font-size: 0.9rem;
            }

            #direct-url-import-btn {
                padding: 6px 16px;
                font-size: 0.85rem;
                border-radius: var(--radius-md);
                white-space: nowrap;
                background: var(--primary-600);
            }

            .url-badge {
                display: inline-block;
                font-size: 0.7rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                background: var(--primary-500);
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                margin-bottom: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .url-input-wrapper.fetching {
                border-color: var(--primary-500, #6366f1);
                animation: pulse-border 1.5s infinite;
            }

            .url-input-wrapper.fetch-success {
                border-color: var(--success, #10b981);
                background: rgba(16, 185, 129, 0.1);
            }

            .url-input-wrapper.fetch-error {
                border-color: var(--error, #ef4444);
                background: rgba(239, 68, 68, 0.1);
            }

            @keyframes pulse-border {
                0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                70% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
                100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
            }

            .spinner-sm {
                display: inline-block;
                width: 14px;
                height: 14px;
                border: 2px solid rgba(255,255,255,.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Modal Shared */
            .modal { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; }
            .modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
            .modal-content { position: relative; background: var(--bg-primary); padding: 1.5rem; border-radius: var(--radius-xl); width: 90%; max-width: 450px; }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
            .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-tertiary); }
            .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
        `;

        document.head.appendChild(styles);
    }

    attachEventListeners() {
        const wrapper = document.querySelector(`#${this.options.containerId} .unified-input-wrapper`);
        const dropzone = document.getElementById('unified-dropzone');
        const fileInput = document.getElementById('unified-file-input');
        const browseBtn = document.getElementById('browse-btn');
        const webcamBtn = document.getElementById('webcam-btn');
        const addMoreBtn = document.getElementById('add-more-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');

        if (!wrapper || !dropzone) return;

        // Drag & Drop on the entire wrapper (covers both dropzone and file list)
        wrapper.addEventListener('dragover', (e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            dropzone.classList.add('dragover'); 
            wrapper.classList.add('dragover');
        });
        
        wrapper.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Only remove if leaving the main container
            if (!wrapper.contains(e.relatedTarget)) {
                dropzone.classList.remove('dragover');
                wrapper.classList.remove('dragover');
            }
        });

        wrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
            wrapper.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.handleFiles(e.dataTransfer.files);
            }
        });

        // Click to browse (only on dropzone)
        dropzone.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('input')) return;
            fileInput.click();
        });

        if (browseBtn) browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        if (addMoreBtn) addMoreBtn.addEventListener('click', () => fileInput.click());
        if (clearAllBtn) clearAllBtn.addEventListener('click', () => this.clearAll());

        // Multi-Paste Support
        document.addEventListener('paste', async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const files = [];
            for (let item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        const name = `pasted-image-${Date.now()}-${files.length}.${file.type.split('/')[1]}`;
                        files.push(new File([file], name, { type: file.type }));
                    }
                }
            }

            if (files.length > 0) {
                e.preventDefault();
                await this.handleFiles(files);
            }
        });

        this.setupDirectUrlImport();
        this.setupWebcamModal();
    }

    setupDirectUrlImport() {
        const urlInput = document.getElementById('direct-url-input');
        const importBtn = document.getElementById('direct-url-import-btn');
        let debounceTimer;

        if (!urlInput || !importBtn) return;

        urlInput.addEventListener('click', (e) => e.stopPropagation());

        // Live Fetch with Debounce
        urlInput.addEventListener('input', (e) => {
            const url = urlInput.value.trim();
            clearTimeout(debounceTimer);

            if (url && this.isValidUrl(url)) {
                debounceTimer = setTimeout(() => {
                    this.fetchFromUrl(url, true);
                }, 800); // 800ms debounce for live fetch
            }
        });

        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const url = urlInput.value.trim();
                if (url) {
                    clearTimeout(debounceTimer);
                    this.fetchFromUrl(url);
                }
            }
        });

        importBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const url = urlInput.value.trim();
            if (url) {
                clearTimeout(debounceTimer);
                await this.fetchFromUrl(url);
            }
        });
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    async fetchFromUrl(url, isLive = false) {
        const urlInput = document.getElementById('direct-url-input');
        const importBtn = document.getElementById('direct-url-import-btn');
        const wrapper = urlInput?.closest('.url-input-wrapper');

        try {
            if (importBtn) {
                importBtn.disabled = true;
                importBtn.innerHTML = '<span class="spinner-sm"></span>';
            }
            if (wrapper) {
                wrapper.className = 'url-input-wrapper fetching';
            }

            // Attempt to fetch
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch image');

            const blob = await res.blob();
            if (!blob.type.startsWith('image/') && blob.type !== 'application/pdf') {
                throw new Error('URL is not a supported file type');
            }

            const filename = url.split('/').pop().split('?')[0] || 'imported-image';
            const extension = blob.type.split('/')[1] || 'jpg';
            const finalName = filename.includes('.') ? filename : `${filename}.${extension}`;

            const file = new File([blob], finalName, { type: blob.type });

            // Mark file as coming from URL for auto-processing
            file.sourceType = 'url';

            await this.handleFiles([file]);

            // Success feedback
            if (urlInput) {
                urlInput.value = '';
                if (wrapper) {
                    wrapper.className = 'url-input-wrapper fetch-success';
                    setTimeout(() => wrapper.className = 'url-input-wrapper', 1500);
                }
            }
        } catch (err) {
            console.error('Fetch Error:', err);

            if (wrapper) {
                wrapper.className = 'url-input-wrapper fetch-error';
                setTimeout(() => wrapper.className = 'url-input-wrapper', 2000);
            }

            // Only alert if it's a manual import or a very specific error type
            if (!isLive) {
                if (err.message.includes('Failed to fetch')) {
                    alert('CORS Error: The website hosting this image does not allow direct access. Try downloading the image and uploading it manually, or use a CORS-friendly URL.');
                } else {
                    alert('Error: ' + err.message);
                }
            }
        } finally {
            if (importBtn) {
                importBtn.disabled = false;
                importBtn.textContent = 'Import Link';
            }
        }
    }

    setupWebcamModal() {
        const modal = document.getElementById('webcam-modal');
        const video = document.getElementById('webcam-video');
        const captureBtn = document.getElementById('webcam-capture');
        const exposureInput = document.getElementById('webcam-exposure');
        const contrastInput = document.getElementById('webcam-contrast');

        document.getElementById('webcam-btn')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                video.srcObject = this.stream;
                modal.style.display = 'flex';
            } catch (err) {
                alert('Webcam access denied or unavailable.');
            }
        });

        const stopStream = () => {
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }
            modal.style.display = 'none';
        };

        document.getElementById('webcam-close').onclick = document.getElementById('webcam-cancel').onclick = stopStream;

        const updateFilters = () => {
            video.style.filter = `contrast(${contrastInput.value}%) brightness(${1 + parseFloat(exposureInput.value)})`;
        };
        exposureInput.oninput = contrastInput.oninput = updateFilters;

        captureBtn.onclick = () => {
            const countdown = document.getElementById('webcam-countdown');
            countdown.style.display = 'flex';
            let count = 3;
            countdown.textContent = count;

            const timer = setInterval(() => {
                count--;
                if (count > 0) {
                    countdown.textContent = count;
                } else {
                    clearInterval(timer);
                    countdown.style.display = 'none';
                    this.takeSnapshot();
                    stopStream();
                }
            }, 500);
        };
    }

    takeSnapshot() {
        const video = document.getElementById('webcam-video');
        const canvas = document.getElementById('webcam-canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = video.style.filter;
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(blob => {
            const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' });
            this.handleFiles([file]);
        }, 'image/jpeg', 0.95);
    }

    async handleFiles(fileList) {
        const filesToAdd = [];
        const duplicates = [];

        for (const file of Array.from(fileList)) {
            // Validation
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') continue;
            if (file.size > this.options.maxSizeMB * 1024 * 1024) {
                alert(`${file.name} is too large (> ${this.options.maxSizeMB}MB)`);
                continue;
            }

            // Duplicate Detection (Hash-based simulation)
            const hash = `${file.name}-${file.size}-${file.lastModified}`;
            if (this.fileHashes.has(hash)) {
                duplicates.push(file.name);
                continue;
            }

            this.fileHashes.add(hash);
            filesToAdd.push(file);
        }

        if (this.files.length + filesToAdd.length > this.options.maxFiles) {
            alert(`Maximum ${this.options.maxFiles} files allowed.`);
            return;
        }

        if (duplicates.length > 0) {
            console.warn('Skipped duplicates:', duplicates);
        }

        if (filesToAdd.length > 0) {
            this.files.push(...filesToAdd);
            this.renderFileList();
            await this.options.onFilesLoaded(this.files, filesToAdd);
        }
    }

    renderFileList() {
        if (!this.options.showList) return;

        const dropzone = document.getElementById('unified-dropzone');
        const listContainer = document.getElementById('file-list-container');
        const fileList = document.getElementById('unified-file-list');
        const fileCount = document.getElementById('file-count');

        if (this.files.length === 0) {
            dropzone.style.display = 'flex';
            listContainer.style.display = 'none';
            return;
        }

        dropzone.style.display = 'none';
        listContainer.style.display = 'block';
        fileCount.textContent = `${this.files.length} file${this.files.length > 1 ? 's' : ''} selected`;

        fileList.innerHTML = '';
        this.files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.dataset.index = index;

            item.innerHTML = `
                <img class="file-item-preview" src="${file.type === 'application/pdf' ? 'https://cdn-icons-png.flaticon.com/512/337/337946.png' : URL.createObjectURL(file)}">
                <div class="file-item-name" title="${file.name}">${file.name}</div>
                <div class="file-item-size">${this.formatFileSize(file.size)}</div>
                <button class="file-item-remove" data-index="${index}">&times;</button>
                <div class="file-item-status"><div class="file-item-progress"></div></div>
            `;

            item.querySelector('.file-item-remove').onclick = () => this.removeFile(index);
            fileList.appendChild(item);
        });
    }

    removeFile(index) {
        const file = this.files[index];
        const hash = `${file.name}-${file.size}-${file.lastModified}`;
        this.fileHashes.delete(hash);
        this.files.splice(index, 1);
        this.renderFileList();
        this.options.onFileRemoved(file, this.files);
    }

    clearAll() {
        this.files = [];
        this.fileHashes.clear();
        this.renderFileList();
        this.options.onFilesLoaded([], []);
    }

    getFiles() {
        return this.files;
    }

    setFileProgress(index, progress) {
        const item = document.querySelector(`.file-item[data-index="${index}"]`);
        if (!item) return;

        const progressBar = item.querySelector('.file-item-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (progress > 0 && progress < 100) {
            item.classList.add('processing');
            item.classList.remove('done');
        } else if (progress >= 100) {
            item.classList.remove('processing');
            item.classList.add('done');
        }
    }

    setFileStatus(index, status, percent = 100) {
        const item = document.querySelector(`.file-item[data-index="${index}"]`);
        if (!item) return;
        const bar = item.querySelector('.file-item-progress');
        if (status === 'done') {
            bar.style.width = '100%';
            bar.style.backgroundColor = 'var(--success)';
        } else if (status === 'error') {
            bar.style.width = '100%';
            bar.style.backgroundColor = 'var(--error)';
        } else {
            bar.style.width = `${percent}%`;
        }
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedInput;
}

// Global access
window.UnifiedInput = UnifiedInput;
