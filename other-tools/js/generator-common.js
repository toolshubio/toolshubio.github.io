// Shared Logic for Generator Tools

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initTheme();
    initHistory();
});

// Sidebar & Mobile Menu Logic
function initSidebar() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');

    // Set active link
    navItems.forEach(item => {
        if (item.href.includes(currentPath.split('/').pop())) {
            item.classList.add('active');
        }
    });

    // Mobile Toggle
    const menuBtn = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768 &&
                !sidebar.contains(e.target) &&
                !menuBtn.contains(e.target) &&
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// Theme Toggle Logic
function initTheme() {
    const themeBtn = document.querySelector('#theme-toggle');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('toolsHubTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('toolsHubTheme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// History Management System
const HistoryManager = {
    key: 'toolsHubHistory',

    add(item) {
        const history = this.get();
        history.unshift({
            ...item,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });

        // Keep last 50 items
        if (history.length > 50) history.pop();

        localStorage.setItem(this.key, JSON.stringify(history));
        this.render();
    },

    get() {
        return JSON.parse(localStorage.getItem(this.key) || '[]');
    },

    clear() {
        localStorage.removeItem(this.key);
        this.render();
    },

    render() {
        const container = document.getElementById('history-list');
        if (!container) return; // Only if history panel is present

        const items = this.get();
        if (items.length === 0) {
            container.innerHTML = '<p class="text-muted text-center mt-3">No history yet.</p>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="history-item p-3 mb-2 border rounded bg-light">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <small class="text-primary font-weight-bold">${item.tool}</small>
                    <small class="text-muted">${new Date(item.timestamp).toLocaleTimeString()}</small>
                </div>
                <div class="text-truncate">${item.preview}</div>
                <button class="btn btn-sm btn-link p-0 mt-1" onclick="navigator.clipboard.writeText('${item.value}')">Copy</button>
            </div>
        `).join('');
    }
};

function initHistory() {
    const historyBtn = document.getElementById('history-toggle');
    const historyPanel = document.querySelector('.history-panel');
    const closeBtn = document.querySelector('.close-history');

    if (historyBtn && historyPanel) {
        historyBtn.addEventListener('click', () => {
            historyPanel.classList.add('open');
            HistoryManager.render();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                historyPanel.classList.remove('open');
            });
        }
    }
}

// Bulk Export Utility
window.GeneratorUtils = {
    downloadText(filename, text) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Toast notification could go here
            alert('Copied to clipboard!');
        });
    }
};
