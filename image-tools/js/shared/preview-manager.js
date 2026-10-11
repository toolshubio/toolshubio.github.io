class PreviewManager {
    constructor(options = {}) {
        this.container = document.getElementById(options.containerId || 'preview-comparison');
        this.mode = options.mode || 'slider';
        this.zoom = 1;
        this.init();
    }

    init() {
        if (!this.container) return;
        this.injectStyles();
    }

    render(img1, img2, filename = 'processed-image') {
        if (!this.container) return;
        this.lastImg2 = img2;
        this.lastFilename = filename;

        // Auto-detect single mode if img2 is missing or same as img1
        const isSingle = !img2 || img1 === img2;

        this.container.innerHTML = `
            <div class="preview-comparison-wrapper ${this.mode}">
                ${isSingle ? this.renderSingle(img1) : (this.mode === 'slider' ? this.renderSlider(img1, img2) : this.renderSplit(img1, img2))}
            </div>
            <div class="preview-controls">
                ${!isSingle ? `
                <button class="btn btn-sm btn-secondary" onclick="window.previewManager.setMode('slider')">Slider</button>
                <button class="btn btn-sm btn-secondary" onclick="window.previewManager.setMode('split')">Side-by-Side</button>
                ` : ''}
                ${img2 ? `
                <button class="btn btn-sm btn-premium-download" onclick="window.previewManager.downloadProcessed()">
                    <span>📥</span> Download Image
                </button>
                ` : ''}
                ${!isSingle ? `
                <div class="zoom-controls">
                    <button onclick="window.previewManager.changeZoom(-0.1)">-</button>
                    <span>${Math.round(this.zoom * 100)}%</span>
                    <button onclick="window.previewManager.changeZoom(0.1)">+</button>
                </div>
                ` : ''}
            </div>
        `;

        if (!isSingle && this.mode === 'slider') this.attachSliderEvents();
    }

    downloadProcessed() {
        if (!this.lastImg2) return;
        const a = document.createElement('a');
        a.href = this.lastImg2;
        a.download = this.lastFilename.includes('.') ? this.lastFilename : `${this.lastFilename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    renderSingle(img) {
        return `
            <div class="single-preview">
                <img src="${img}" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
        `;
    }

    renderSlider(img1, img2) {
        return `
            <div class="comparison-slider">
                <img src="${img1}" class="img-original">
                <div class="slider-overlay" style="width: 50%;">
                    <img src="${img2}" class="img-processed">
                </div>
                <div class="slider-handle" style="left: 50%;">
                    <div class="handle-line"></div>
                    <div class="handle-circle">↔</div>
                </div>
            </div>
        `;
    }

    renderSplit(img1, img2) {
        return `
            <div class="comparison-split">
                <div class="split-pane">
                    <div class="pane-label">Original</div>
                    <img src="${img1}">
                </div>
                <div class="split-pane">
                    <div class="pane-label">Processed</div>
                    <img src="${img2}">
                </div>
            </div>
        `;
    }

    setMode(mode) {
        this.mode = mode;
        // Re-render logic would go here if we kept state, but for now we rely on the tool to call render again
    }

    changeZoom(delta) {
        this.zoom = Math.max(0.1, Math.min(5, this.zoom + delta));
        // Apply zoom to images logic would go here
    }

    attachSliderEvents() {
        const slider = this.container.querySelector('.comparison-slider');
        if (!slider) return;
        const overlay = this.container.querySelector('.slider-overlay');
        const handle = this.container.querySelector('.slider-handle');

        const move = (e) => {
            const rect = slider.getBoundingClientRect();
            const pageX = e.pageX || (e.touches && e.touches[0].pageX);
            if (pageX === undefined) return;
            const x = pageX - rect.left;
            const pos = Math.max(0, Math.min(x, rect.width));
            const pct = (pos / rect.width) * 100;

            overlay.style.width = `${pct}%`;
            handle.style.left = `${pct}%`;
        };

        slider.addEventListener('mousemove', move);
        slider.addEventListener('touchmove', move);
    }

    injectStyles() {
        if (document.getElementById('preview-manager-styles')) return;
        const styles = document.createElement('style');
        styles.id = 'preview-manager-styles';
        styles.textContent = `
            .preview-comparison-wrapper {
                position: relative;
                width: 100%;
                max-width: 1000px;
                margin: 0 auto;
                border-radius: var(--radius-lg);
                overflow: hidden;
                background: var(--bg-tertiary, #f0f0f0);
                aspect-ratio: 16/9;
                border: 1px solid var(--border-color, #ddd);
            }
            .comparison-slider { position: relative; width: 100%; height: 100%; cursor: col-resize; }
            .comparison-slider img { width: 100%; height: 100%; object-fit: contain; }
            .slider-overlay { position: absolute; top: 0; left: 0; height: 100%; overflow: hidden; border-right: 2px solid white; z-index: 10; }
            .img-processed { width: 1000px !important; max-width: none !important; } /* Force dimensions for overlay */
            .slider-handle { position: absolute; top: 0; bottom: 0; width: 4px; background: white; z-index: 20; transform: translateX(-50%); }
            .handle-circle { position: absolute; top: 50%; left: 50%; width: 40px; height: 40px; background: white; border-radius: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); color: var(--primary-500); font-weight: bold; }
            
            .single-preview { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #fff; }
            
            .comparison-split { display: flex; gap: 1rem; width: 100%; height: 100%; padding: 1rem; }
            .split-pane { flex: 1; position: relative; background: #fff; border-radius: var(--radius-md); overflow: hidden; }
            .split-pane img { width: 100%; height: 100%; object-fit: contain; }
            .pane-label { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; z-index: 10; }
            
            .preview-controls { 
                display: flex; 
                justify-content: center; 
                gap: 1.5rem; 
                margin-top: 1.5rem; 
                align-items: center; 
                flex-wrap: wrap; 
                padding: 1rem;
                background: var(--surface-glass);
                border-radius: var(--radius-lg);
                backdrop-filter: blur(10px);
                border: 1px solid var(--border-color);
            }
            .zoom-controls { 
                display: flex; 
                align-items: center; 
                gap: 0.5rem; 
                background: var(--bg-secondary); 
                padding: 6px 16px; 
                border-radius: 30px; 
                font-size: 0.9rem; 
                border: 1px solid var(--border-color);
                box-shadow: var(--shadow-sm);
            }
            .zoom-controls button { 
                background: none; 
                border: none; 
                cursor: pointer; 
                color: var(--text-primary); 
                font-weight: bold; 
                padding: 0 4px;
                transition: transform 0.2s ease;
            }
            .zoom-controls button:hover { transform: scale(1.2); }
        `;
        document.head.appendChild(styles);
    }
}

if (typeof window !== 'undefined') {
    window.PreviewManager = PreviewManager;
}
