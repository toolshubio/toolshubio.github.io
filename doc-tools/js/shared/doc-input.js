// ===================================
// DOCUMENT INPUT COMPONENT
// Unified file upload for document tools
// Supports: DOCX, XLSX, PPTX, TXT, PDF, CSV
// ===================================

class DocInput {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'upload-zone',
            acceptTypes: options.acceptTypes || '.docx,.xlsx,.xls,.pptx,.pdf,.txt,.csv,.rtf,.odt,.ods',
            multiple: options.multiple !== false,
            maxFiles: options.maxFiles || 50,
            maxSizeMB: options.maxSizeMB || 100,
            toolIcon: options.toolIcon || '📄',
            toolName: options.toolName || 'Document Tool',
            onFilesLoaded: options.onFilesLoaded || (() => { }),
            onFileRemoved: options.onFileRemoved || (() => { }),
            ...options
        };

        this.files = [];
        this.activeFileIndex = 0;
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const container = document.getElementById(this.options.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="doc-input-wrapper">
                <div class="doc-dropzone" id="doc-dropzone">
                    <div class="doc-dropzone-icon">${this.options.toolIcon}</div>
                    <h3 class="doc-dropzone-title">Drop your documents here</h3>
                    <p class="doc-dropzone-subtitle">or click to browse • Max ${this.options.maxFiles} files</p>
                    
                    <div class="dropzone-actions" style="display: flex; gap: 0.75rem; margin: 1.5rem 0;">
                        <button class="btn btn-primary" id="doc-browse-btn">
                            <span>📂</span> Browse Files
                        </button>
                    </div>
                    
                    <div class="doc-dropzone-formats">
                        Supports: DOCX, XLSX, PPTX, PDF, TXT, CSV, RTF
                    </div>
                </div>
                
                <input type="file" id="doc-file-input" 
                       accept="${this.options.acceptTypes}" 
                       ${this.options.multiple ? 'multiple' : ''} 
                       style="display: none;">
                
                <div class="doc-file-list" id="doc-file-list" style="display: none;">
                    <div class="doc-tabs" id="doc-tabs"></div>
                    <div class="doc-file-actions" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                        <span class="file-count" id="doc-file-count">0 files</span>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-sm btn-secondary" id="doc-add-more">+ Add More</button>
                            <button class="btn btn-sm btn-danger" id="doc-clear-all">Clear All</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.injectStyles();
    }

    injectStyles() {
        if (document.getElementById('doc-input-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'doc-input-styles';
        styles.textContent = `
            .doc-input-wrapper {
                width: 100%;
            }
            
            .doc-file-list {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-lg);
                overflow: hidden;
            }
            
            .doc-tabs {
                display: flex;
                gap: 2px;
                background: var(--bg-tertiary);
                padding: 0.5rem 0.5rem 0;
                overflow-x: auto;
            }
            
            .doc-tab {
                padding: 0.5rem 1rem;
                background: var(--bg-secondary);
                border: none;
                color: var(--text-secondary);
                font-size: 0.875rem;
                cursor: pointer;
                border-radius: 0.5rem 0.5rem 0 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                white-space: nowrap;
                max-width: 200px;
                transition: all 0.2s;
            }
            
            .doc-tab:hover {
                background: var(--bg-primary);
            }
            
            .doc-tab.active {
                background: var(--bg-primary);
                color: var(--text-primary);
                font-weight: 500;
            }
            
            .doc-tab-icon {
                font-size: 1.25rem;
            }
            
            .doc-tab-name {
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            }
            
            .doc-tab-close {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: transparent;
                border: none;
                color: var(--text-tertiary);
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .doc-tab-close:hover {
                background: var(--error);
                color: white;
            }
        `;

        document.head.appendChild(styles);
    }

    attachEventListeners() {
        const dropzone = document.getElementById('doc-dropzone');
        const fileInput = document.getElementById('doc-file-input');
        const browseBtn = document.getElementById('doc-browse-btn');
        const addMoreBtn = document.getElementById('doc-add-more');
        const clearAllBtn = document.getElementById('doc-clear-all');

        if (!dropzone) return;

        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Click to browse
        dropzone.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            fileInput.click();
        });

        browseBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        addMoreBtn?.addEventListener('click', () => fileInput.click());
        clearAllBtn?.addEventListener('click', () => this.clearAll());
    }

    async handleFiles(fileList) {
        const validExtensions = this.options.acceptTypes.split(',').map(e => e.trim().toLowerCase());

        for (const file of Array.from(fileList)) {
            // Validate extension
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            if (!validExtensions.some(v => v === ext || v === '.*')) {
                console.warn(`Skipped ${file.name}: unsupported format`);
                continue;
            }

            // Validate size
            if (file.size > this.options.maxSizeMB * 1024 * 1024) {
                alert(`${file.name} is too large (> ${this.options.maxSizeMB}MB)`);
                continue;
            }

            // Check max files
            if (this.files.length >= this.options.maxFiles) {
                alert(`Maximum ${this.options.maxFiles} files allowed.`);
                break;
            }

            this.files.push(file);
        }

        if (this.files.length > 0) {
            this.renderFileList();
            await this.options.onFilesLoaded(this.files, this.files[this.activeFileIndex]);
        }
    }

    renderFileList() {
        const dropzone = document.getElementById('doc-dropzone');
        const fileList = document.getElementById('doc-file-list');
        const tabs = document.getElementById('doc-tabs');
        const fileCount = document.getElementById('doc-file-count');

        if (this.files.length === 0) {
            dropzone.style.display = 'flex';
            fileList.style.display = 'none';
            return;
        }

        dropzone.style.display = 'none';
        fileList.style.display = 'block';
        fileCount.textContent = `${this.files.length} file${this.files.length > 1 ? 's' : ''}`;

        tabs.innerHTML = '';
        this.files.forEach((file, index) => {
            const tab = document.createElement('div');
            tab.className = `doc-tab ${index === this.activeFileIndex ? 'active' : ''}`;
            tab.innerHTML = `
                <span class="doc-tab-icon">${this.getFileIcon(file.name)}</span>
                <span class="doc-tab-name" title="${file.name}">${file.name}</span>
                <button class="doc-tab-close" data-index="${index}">&times;</button>
            `;

            tab.addEventListener('click', (e) => {
                if (e.target.classList.contains('doc-tab-close')) {
                    this.removeFile(parseInt(e.target.dataset.index));
                } else {
                    this.setActiveFile(index);
                }
            });

            tabs.appendChild(tab);
        });
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'docx': '📄', 'doc': '📄',
            'xlsx': '📊', 'xls': '📊',
            'pptx': '📽️', 'ppt': '📽️',
            'pdf': '📕',
            'txt': '📝',
            'csv': '📈',
            'rtf': '📃'
        };
        return icons[ext] || '📄';
    }

    setActiveFile(index) {
        this.activeFileIndex = index;
        this.renderFileList();
        this.options.onFilesLoaded(this.files, this.files[index]);
    }

    removeFile(index) {
        this.files.splice(index, 1);
        if (this.activeFileIndex >= this.files.length) {
            this.activeFileIndex = Math.max(0, this.files.length - 1);
        }
        this.renderFileList();

        if (this.files.length > 0) {
            this.options.onFilesLoaded(this.files, this.files[this.activeFileIndex]);
        } else {
            this.options.onFileRemoved();
        }
    }

    clearAll() {
        this.files = [];
        this.activeFileIndex = 0;
        this.renderFileList();
        this.options.onFileRemoved();
    }

    getFiles() {
        return this.files;
    }

    getActiveFile() {
        return this.files[this.activeFileIndex];
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocInput;
}

window.DocInput = DocInput;
