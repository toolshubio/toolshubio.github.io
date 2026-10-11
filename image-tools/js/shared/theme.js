// ===================================
// THEME SYSTEM
// Dark/Light mode with localStorage persistence
// ===================================

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        // Load saved theme or detect system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

        this.currentTheme = savedTheme || systemPreference;
        this.applyTheme(this.currentTheme);
        this.attachEventListeners();
        this.watchSystemPreference();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.updateToggleIcon();
    }

    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    updateToggleIcon() {
        const themeToggle = document.getElementById('theme-toggle') || document.getElementById('themeToggle');
        if (!themeToggle) return;

        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        const faIcon = themeToggle.querySelector('i');

        if (sunIcon && moonIcon) {
            if (this.currentTheme === 'dark') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }

        // Handle FontAwesome icons
        if (faIcon) {
            if (this.currentTheme === 'dark') {
                faIcon.className = 'fas fa-sun';
            } else {
                faIcon.className = 'fas fa-moon';
            }
        }
    }

    attachEventListeners() {
        // Global delegation for theme toggles
        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('#theme-toggle, #themeToggle');
            if (toggle) {
                this.toggle();
            }
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updateToggleIcon());
        } else {
            this.updateToggleIcon();
        }
    }

    watchSystemPreference() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.ThemeManager = themeManager;
}
