/* ============================================
   Calculator UI - Shared UI Logic (Premium Edition)
   ============================================ */

const CalcUI = {
    history: [],
    maxHistory: 50,
    toolName: 'calculator',
    undoStack: [],
    redoStack: [],
    presets: {},
    shortcuts: {},

    // === INITIALIZATION ===
    init: function (config = {}) {
        this.toolName = config.toolName || 'calculator';
        this.setupThemeToggle();
        this.setupKeyboardShortcuts();
        this.loadHistory();
        this.loadPresets();
        this.setupMobileSticky();
        this.trackRecentlyUsed();

        // Auto-calculate on input if handler provided
        if (config.onCalculate) {
            this.setupAutoCalculate(config.onCalculate);
        }

        // Disable loading animations as per user request
        document.documentElement.classList.add('instant-update');

        this.playEntryAnimation();

        console.log(`[CalcUI] Initialized: ${this.toolName}`);
    },

    // === ENTRY ANIMATION ===
    // === ENTRY ANIMATION ===
    playEntryAnimation: function() {
        // Disabled as per user request
        /*
        // Find main tool container or body
        const main = document.querySelector('.tool-page') || document.querySelector('.container') || document.body;
        if (!main) return;

        main.classList.add('reveal-init');
        
        // Use requestAnimationFrame for smooth trigger
        requestAnimationFrame(() => {
            setTimeout(() => {
                main.classList.add('reveal-active');
            }, 50);
        });
        */
        const main = document.querySelector('.tool-page') || document.querySelector('.container') || document.body;
        if (main) {
             main.style.opacity = '1';
             main.style.transform = 'none';
        }
    },

    // === THEME TOGGLE ===
    setupThemeToggle: function () {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        const saved = localStorage.getItem('toolshub-theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        toggle.textContent = saved === 'dark' ? '☀️' : '🌙';

        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('toolshub-theme', next);
            toggle.textContent = next === 'dark' ? '☀️' : '🌙';
        });
    },

    // === KEYBOARD SHORTCUTS ===
    setupKeyboardShortcuts: function () {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter = Calculate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const calcBtn = document.getElementById('calculate-btn') || document.querySelector('.btn-primary');
                if (calcBtn) calcBtn.click();
                return;
            }

            // Ctrl/Cmd + Z = Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
                return;
            }

            // Ctrl/Cmd + Shift + Z or Ctrl + Y = Redo
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
                return;
            }

            // Ctrl/Cmd + C on result = Copy
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                const active = document.activeElement;
                if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA')) {
                    const result = document.querySelector('.result-value');
                    if (result) {
                        e.preventDefault();
                        this.copyToClipboard(result.textContent);
                    }
                }
            }

            // Escape = Clear
            if (e.key === 'Escape') {
                const clearBtn = document.getElementById('clear-btn') || document.querySelector('.key.clear');
                if (clearBtn) clearBtn.click();
            }

            // Custom shortcuts
            const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.altKey ? 'alt+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`;
            if (this.shortcuts[key]) {
                e.preventDefault();
                this.shortcuts[key]();
            }
        });
    },

    registerShortcut: function (combo, callback) {
        this.shortcuts[combo.toLowerCase()] = callback;
    },

    // === TOAST NOTIFICATIONS ===
    showToast: function (message, type = 'info', duration = 2500) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
        toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;

        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // === CLIPBOARD ===
    copyToClipboard: function (text) {
        const cleanText = String(text).replace(/[^\d.,\-+]/g, '');

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => this.showToast('Copied!', 'success'));
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            this.showToast('Copied!', 'success');
        }
    },

    // === UNDO/REDO ===
    saveState: function (state) {
        this.undoStack.push(JSON.stringify(state));
        this.redoStack = []; // Clear redo on new action

        // Limit stack size
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
    },

    undo: function () {
        if (this.undoStack.length === 0) {
            this.showToast('Nothing to undo', 'warning');
            return null;
        }
        const state = this.undoStack.pop();
        this.redoStack.push(state);
        this.showToast('Undone', 'info');
        return JSON.parse(state);
    },

    redo: function () {
        if (this.redoStack.length === 0) {
            this.showToast('Nothing to redo', 'warning');
            return null;
        }
        const state = this.redoStack.pop();
        this.undoStack.push(state);
        this.showToast('Redone', 'info');
        return JSON.parse(state);
    },

    // === HISTORY ===
    addToHistory: function (entry) {
        const historyEntry = {
            ...entry,
            timestamp: new Date().toISOString(),
            tool: this.toolName
        };
        this.history.unshift(historyEntry);
        if (this.history.length > this.maxHistory) this.history.pop();
        this.saveHistory();

        // Dispatch event for UI updates
        document.dispatchEvent(new CustomEvent('calcHistoryUpdate', { detail: historyEntry }));
    },

    saveHistory: function () {
        localStorage.setItem(`calc-history-${this.toolName}`, JSON.stringify(this.history));
    },

    loadHistory: function () {
        const saved = localStorage.getItem(`calc-history-${this.toolName}`);
        if (saved) {
            try { this.history = JSON.parse(saved); }
            catch (e) { this.history = []; }
        }
    },

    clearHistory: function () {
        this.history = [];
        this.saveHistory();
        this.showToast('History cleared', 'success');
        document.dispatchEvent(new CustomEvent('calcHistoryUpdate'));
    },

    getHistory: function () {
        return [...this.history];
    },

    // === PRESETS ===
    loadPresets: function () {
        const saved = localStorage.getItem(`calc-presets-${this.toolName}`);
        if (saved) {
            try { this.presets = JSON.parse(saved); }
            catch (e) { this.presets = {}; }
        }
    },

    savePreset: function (name, data) {
        this.presets[name] = {
            data,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(`calc-presets-${this.toolName}`, JSON.stringify(this.presets));
        this.showToast(`Preset "${name}" saved`, 'success');
    },

    loadPreset: function (name) {
        if (this.presets[name]) {
            this.showToast(`Loaded "${name}"`, 'success');
            return this.presets[name].data;
        }
        this.showToast(`Preset "${name}" not found`, 'error');
        return null;
    },

    deletePreset: function (name) {
        if (this.presets[name]) {
            delete this.presets[name];
            localStorage.setItem(`calc-presets-${this.toolName}`, JSON.stringify(this.presets));
            this.showToast(`Preset "${name}" deleted`, 'success');
        }
    },

    getPresets: function () {
        return Object.keys(this.presets).map(name => ({
            name,
            ...this.presets[name]
        }));
    },

    // === EXPORT ===
    exportResult: function (data, filename = 'calculation-result', format = 'json') {
        let content, mimeType;

        if (format === 'pdf') {
            this.exportToPDF(data, filename);
            return;
        }

        switch (format) {
            case 'csv':
                content = this.dataToCSV(data);
                mimeType = 'text/csv';
                filename += '.csv';
                break;
            case 'txt':
                content = this.dataToText(data);
                mimeType = 'text/plain';
                filename += '.txt';
                break;
            default:
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
                filename += '.json';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast(`Exported as ${format.toUpperCase()}`, 'success');
    },

    exportToPDF: function (data, filename) {
        // High-end browser-native print-to-PDF approach
        const printWindow = window.open('', '_blank');
        const styles = Array.from(document.styleSheets)
            .map(sheet => {
                try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join(''); }
                catch (e) { return ''; }
            }).join('');

        const content = typeof data === 'string' ? data : this.dataToText(data);
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>${filename}</title>
                    <style>${styles}</style>
                    <style>
                        body { padding: 40px; font-family: 'Inter', sans-serif; }
                        .report-header { border-bottom: 2px solid #10b981; margin-bottom: 30px; padding-bottom: 10px; }
                        pre { background: #f8fafc; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
                    </style>
                </head>
                <body>
                    <div class="report-header">
                        <h1>${this.toolName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h1>
                        <p>Generated on ${new Date().toLocaleString()}</p>
                    </div>
                    <pre>${content}</pre>
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    },

    dataToCSV: function (data) {
        if (Array.isArray(data)) {
            if (data.length === 0) return '';
            const headers = Object.keys(data[0]);
            const rows = data.map(row => headers.map(h => `"${row[h]}"`).join(','));
            return [headers.join(','), ...rows].join('\n');
        }
        return Object.entries(data).map(([k, v]) => `${k},${v}`).join('\n');
    },

    dataToText: function (data) {
        if (typeof data === 'object') {
            return Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
        }
        return String(data);
    },

    // === MOBILE STICKY ACTION BAR ===
    setupMobileSticky: function () {
        const actionBar = document.querySelector('.action-bar-sticky');
        if (!actionBar) return;

        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (currentScroll > lastScroll && currentScroll > 100) {
                actionBar.classList.add('hidden');
            } else {
                actionBar.classList.remove('hidden');
            }
            lastScroll = currentScroll;
        });
    },

    // === RECENTLY USED TRACKING ===
    trackRecentlyUsed: function () {
        const key = 'toolshub-recently-used';
        let recent = JSON.parse(localStorage.getItem(key) || '[]');

        // Add current tool to recent
        recent = recent.filter(t => t.name !== this.toolName);
        recent.unshift({ name: this.toolName, timestamp: Date.now() });
        recent = recent.slice(0, 10); // Keep last 10

        localStorage.setItem(key, JSON.stringify(recent));
    },

    getRecentlyUsed: function () {
        return JSON.parse(localStorage.getItem('toolshub-recently-used') || '[]');
    },

    // === AUTO-CALCULATE ===
    setupAutoCalculate: function (handler, debounceMs = 300) {
        let timeout;
        const inputs = document.querySelectorAll('.calc-input, .calc-select, input[type="number"], input[type="range"]');

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(handler, debounceMs);
            });
            input.addEventListener('change', handler);
        });
    },



    // === SEGMENTED CONTROL SETUP ===
    setupSegmentedControl: function (id, callback) {
        const container = document.getElementById(id);
        if (!container) return;

        const buttons = container.querySelectorAll('.segment-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (callback) callback(btn.dataset.value || btn.textContent.trim());
            });
        });
    },

    setupToggle: function (id, callback, initialState = false) {
        const el = document.getElementById(id);
        if (!el) return;

        let active = initialState;
        if (active) el.classList.add('active');

        el.addEventListener('click', () => {
            active = !active;
            el.classList.toggle('active');
            if (callback) callback(active);
        });
    },

    // === INPUT HELPERS ===
    getInputValue: function (id, defaultVal = 0) {
        const el = document.getElementById(id);
        if (!el) return defaultVal;
        const val = parseFloat(el.value);
        return isNaN(val) ? defaultVal : val;
    },

    setInputValue: function (id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    },

    getSelectValue: function (id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    },

    getChecked: function (id) {
        const el = document.getElementById(id);
        return el ? el.checked : false;
    },

    // === RESULT DISPLAY ===
    formatResult: function (value, decimals = 2) {
        if (isNaN(value) || value === 'Error' || value === null || value === undefined) return 'Error';
        return CalcUtils.formatNumber(value, decimals);
    },

    updateResult: function (elementId, value, prefix = '', suffix = '') {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = prefix + value + suffix;
            el.classList.add('result-updated');
            setTimeout(() => el.classList.remove('result-updated'), 300);
        }
    },

    updateMultipleResults: function (updates) {
        for (const [id, value] of Object.entries(updates)) {
            this.updateResult(id, value);
        }
    },

    // === CHART HELPERS (Canvas API) ===
    Chart: {
        drawBar: function (canvasId, data, options = {}) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width * 2;
            canvas.height = height * 2;
            ctx.scale(2, 2);

            const padding = options.padding || 40;
            const barWidth = (width - padding * 2) / data.length - 10;
            const maxValue = Math.max(...data.map(d => d.value)) * 1.1;

            // Clear canvas
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-tertiary').trim() || '#f1f5f9';
            ctx.fillRect(0, 0, width, height);

            // Draw bars
            data.forEach((item, i) => {
                const barHeight = (item.value / maxValue) * (height - padding * 2);
                const x = padding + i * (barWidth + 10);
                const y = height - padding - barHeight;

                // Bar
                ctx.fillStyle = item.color || '#10b981';
                ctx.fillRect(x, y, barWidth, barHeight);

                // Label
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#64748b';
                ctx.font = '11px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(item.label || '', x + barWidth / 2, height - 10);

                // Value
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1e293b';
                ctx.fillText(CalcUtils.formatCompact(item.value), x + barWidth / 2, y - 5);
            });
        },

        drawPie: function (canvasId, data, options = {}) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width * 2;
            canvas.height = height * 2;
            ctx.scale(2, 2);

            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(centerX, centerY) - 20;

            const total = data.reduce((sum, d) => sum + d.value, 0);
            let startAngle = -Math.PI / 2;

            data.forEach(item => {
                const sliceAngle = (item.value / total) * Math.PI * 2;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.fillStyle = item.color || '#10b981';
                ctx.fill();

                // Label
                const labelAngle = startAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius * 0.65);
                const labelY = centerY + Math.sin(labelAngle) * (radius * 0.65);

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(item.value / total * 100)}%`, labelX, labelY);

                startAngle += sliceAngle;
            });
        },

        drawLine: function (canvasId, data, options = {}) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width * 2;
            canvas.height = height * 2;
            ctx.scale(2, 2);

            const padding = options.padding || 40;
            const chartWidth = width - padding * 2;
            const chartHeight = height - padding * 2;
            const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
            const minValue = Math.min(0, ...data.map(d => d.value));

            // Clear
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-tertiary').trim() || '#f1f5f9';
            ctx.fillRect(0, 0, width, height);

            // Draw line
            ctx.beginPath();
            ctx.strokeStyle = options.lineColor || '#10b981';
            ctx.lineWidth = 2;

            data.forEach((item, i) => {
                const x = padding + (i / (data.length - 1)) * chartWidth;
                const y = height - padding - ((item.value - minValue) / (maxValue - minValue)) * chartHeight;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                // Draw point
                ctx.fillStyle = options.pointColor || '#10b981';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.stroke();
        }
    },

    // === RELATED CALCULATORS ===
    renderRelatedCalculators: function (containerId, calculators) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = calculators.map(calc => `
            <a href="${calc.url}" class="related-tool-card">
                <span class="related-tool-icon">${calc.icon}</span>
                <div class="related-tool-info">
                    <div class="related-tool-name">${calc.name}</div>
                    <div class="related-tool-desc">${calc.desc}</div>
                </div>
            </a>
        `).join('');

        container.innerHTML = html;
        container.classList.add('flicker-ready');
    },

    // === COLLAPSIBLE SECTIONS ===
    setupCollapsible: function () {
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isOpen = content.style.maxHeight;

                if (isOpen) {
                    content.style.maxHeight = null;
                    header.classList.remove('open');
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    header.classList.add('open');
                }
            });
        });
    },

    // === VALIDATION ===
    validateInput: function (id, rules = {}) {
        const el = document.getElementById(id);
        if (!el) return { valid: false, message: 'Element not found' };

        const value = parseFloat(el.value);

        if (rules.required && (el.value === '' || isNaN(value))) {
            el.classList.add('input-error');
            return { valid: false, message: 'Required field' };
        }

        if (rules.min !== undefined && value < rules.min) {
            el.classList.add('input-error');
            return { valid: false, message: `Minimum value is ${rules.min}` };
        }

        if (rules.max !== undefined && value > rules.max) {
            el.classList.add('input-error');
            return { valid: false, message: `Maximum value is ${rules.max}` };
        }

        el.classList.remove('input-error');
        return { valid: true, value };
    },

    // UI Helper: Render Amortization Table
    renderTable: function (containerId, headers, rows) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = `<div class="premium-table-container"><table class="premium-table">`;
        html += `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
        html += `<tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`;
        html += `</table></div>`;
        
        container.innerHTML = html;
    }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalcUI;
}
