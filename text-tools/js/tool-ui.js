/* ============================================
   Tool UI - Shared UI Logic for All Text Tools
   ============================================ */

const ToolUI = {
    // === INITIALIZATION ===
    init: function (config = {}) {
        this.toolName = config.toolName || 'Tool';
        this.history = [];
        this.maxHistory = config.maxHistory || 10;
        this.setupThemeToggle();
        this.setupKeyboardShortcuts();
        this.loadHistory();
        this.loadSharedComponents();
        this.playEntryAnimation();
    },

    // === ENTRY ANIMATION ===
    playEntryAnimation: function() {
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
    },

    loadSharedComponents: function () {
        // v3 REBUILD (2026-10-11): from-scratch design uses only
        // ../image-tools/css/v3-design.css. The old shared CSS (global.css,
        // components.css, responsive.css) and the old header/footer scripts
        // must NOT be injected at runtime, or they override the v3 design.
        // FontAwesome 6.5.0 is already linked in the page head, so nothing to do.
    },

    // === THEME TOGGLE ===
    setupThemeToggle: function () {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        // Load saved theme
        const savedTheme = localStorage.getItem('toolshub-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('toolshub-theme', next);
            themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
        });
    },

    // === KEYBOARD SHORTCUTS ===
    setupKeyboardShortcuts: function () {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter = Process
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const processBtn = document.getElementById('process-btn');
                if (processBtn) processBtn.click();
            }

            // Ctrl/Cmd + Shift + C = Copy Output
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.copyOutput();
            }

            // Ctrl/Cmd + Z = Undo (from history)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                const inputArea = document.getElementById('input-text');
                if (document.activeElement !== inputArea && this.history.length > 0) {
                    e.preventDefault();
                    this.restoreFromHistory(0);
                }
            }
        });
    },

    // === TOAST NOTIFICATIONS ===
    showToast: function (message, duration = 2000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), duration);
    },

    // === COPY TO CLIPBOARD ===
    copyToClipboard: function (text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('✓ Copied to clipboard!');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    },

    fallbackCopy: function (text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showToast('✓ Copied to clipboard!');
    },

    copyOutput: function () {
        const output = document.getElementById('output-text');
        if (output) {
            this.copyToClipboard(output.value || output.textContent);
        }
    },

    // === DOWNLOAD TEXT ===
    downloadText: function (text, filename = 'output.txt') {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('✓ File downloaded!');
    },

    // === CLEAR INPUT/OUTPUT ===
    clearAll: function () {
        const input = document.getElementById('input-text');
        const output = document.getElementById('output-text');
        if (input) input.value = '';
        if (output) output.value = '';
        this.updateStats({});
        this.showToast('Cleared!');
    },

    // === HISTORY MANAGEMENT ===
    addToHistory: function (input, output, settings = {}) {
        const entry = {
            input: input.substring(0, 100),
            output: output.substring(0, 100),
            settings,
            timestamp: new Date().toISOString()
        };
        this.history.unshift(entry);
        if (this.history.length > this.maxHistory) this.history.pop();
        this.saveHistory();
        this.renderHistory();
    },

    saveHistory: function () {
        const key = `toolshub-history-${this.toolName}`;
        localStorage.setItem(key, JSON.stringify(this.history));
    },

    loadHistory: function () {
        const key = `toolshub-history-${this.toolName}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                this.history = JSON.parse(saved);
                this.renderHistory();
            } catch (e) {
                this.history = [];
            }
        }
    },

    renderHistory: function () {
        const container = document.getElementById('history-list');
        if (!container) return;

        container.innerHTML = this.history.map((entry, index) => `
            <div class="history-item" onclick="ToolUI.restoreFromHistory(${index})">
                <span class="history-preview">${entry.input}...</span>
                <span class="history-time">${this.formatTime(entry.timestamp)}</span>
            </div>
        `).join('');
    },

    restoreFromHistory: function (index) {
        const entry = this.history[index];
        if (!entry) return;

        const input = document.getElementById('input-text');
        if (input) {
            input.value = entry.input;
            this.showToast('Restored from history');
        }
    },

    formatTime: function (isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    },

    clearHistory: function () {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
        this.showToast('History cleared');
    },

    // === STATS UPDATE ===
    updateStats: function (stats) {
        for (const [key, value] of Object.entries(stats)) {
            const el = document.getElementById(`stat-${key}`);
            if (el) el.textContent = value;
        }
    },

    // === TOGGLE SWITCH HANDLER ===
    setupToggle: function (toggleId, callback) {
        const toggle = document.getElementById(toggleId);
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            const isActive = toggle.classList.contains('active');
            if (callback) callback(isActive);
        });
    },

    // === SLIDER HANDLER ===
    setupSlider: function (sliderId, valueId, callback) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        if (!slider) return;

        slider.addEventListener('input', () => {
            const value = slider.value;
            if (valueDisplay) valueDisplay.textContent = value + '%';
            if (callback) callback(parseInt(value));
        });
    },

    // === PRESET BUTTONS HANDLER ===
    setupPresetButtons: function (containerId, callback) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const buttons = container.querySelectorAll('.preset-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (callback) callback(btn.dataset.value || btn.textContent);
            });
        });
    },

    // === LIVE PROCESSING ===
    setupLiveProcessing: function (inputId, processFunction, debounceMs = 300) {
        const input = document.getElementById(inputId);
        if (!input) return;

        let timeout;
        input.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                processFunction(input.value);
            }, debounceMs);
        });
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolUI;
}
