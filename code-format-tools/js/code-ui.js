/**
 * CodeUI - Unified UI components for Code & Format Tools
 */
const CodeUI = {
    init: (config) => {
        console.log(`Initializing ${config.toolName}...`);
        CodeUI.setupCommonUI();
        CodeUI.loadTheme();
    },

    setupCommonUI: () => {
        // Theme toggle
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.onclick = () => {
                const isDark = document.body.getAttribute('data-theme') === 'dark';
                const nextTheme = isDark ? 'light' : 'dark';
                document.body.setAttribute('data-theme', nextTheme);
                toggle.textContent = isDark ? '🌙' : '☀️';
                localStorage.setItem('code-theme', nextTheme);
            };
        }
    },

    loadTheme: () => {
        const theme = localStorage.getItem('code-theme') || 'light';
        document.body.setAttribute('data-theme', theme);
        const toggle = document.getElementById('theme-toggle');
        if (toggle) toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    },

    /**
     * Copy to clipboard with visual feedback
     */
    copyToClipboard: (elementId, btn) => {
        const text = document.getElementById(elementId).value || document.getElementById(elementId).textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅ Copied!';
            btn.classList.add('btn-success');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
            }, 2000);
        });
    },

    /**
     * Render stats in standard container
     */
    renderStats: (containerId, stats) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <div class="code-stat"><span>Chars:</span> <strong>${stats.chars}</strong></div>
            <div class="code-stat"><span>Lines:</span> <strong>${stats.lines}</strong></div>
            <div class="code-stat"><span>Size:</span> <strong>${stats.size}</strong></div>
        `;
    },

    /**
     * Render related tools
     */
    renderRelated: (containerId, tools) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = tools.map(t => `
            <a href="${t.url}" class="related-tool-card">
                <div class="related-icon">${t.icon}</div>
                <div class="related-info">
                    <h4>${t.name}</h4>
                    <p>${t.desc}</p>
                </div>
            </a>
        `).join('');
    }
};
