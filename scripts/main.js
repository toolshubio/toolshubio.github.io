// TOOLSHUB.COM - Main JavaScript
// Handles search, dark mode, favorites, navigation, and all interactivity

(function () {
    'use strict';

    // ========== STATE MANAGEMENT ==========
    const state = {
        theme: localStorage.getItem('theme') || 'light',
        favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
        recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]'),
        allTools: []
    };

    // ========== INITIALIZATION ==========
    document.addEventListener('DOMContentLoaded', function () {
        initializeApp();
    });

    function initializeApp() {
        // Load all tools from data
        state.allTools = getAllTools();

        // Initialize features
        // theme is now handled by theme.js
        initSearch();
        initNavigation();
        initMobileMenu();
        populateMobileMenu();
        initFavorites();
        initScrollToTop();
        // initStatsAnimation(); // Removed as per user request
        initNewsletter();
        initContactForm();
        playEntryAnimation();

        console.log('ToolsHub initialized with', state.allTools.length, 'tools');
    }

    function playEntryAnimation() {
        const main = document.getElementById('main-content');
        if (!main) return;

        main.classList.add('reveal-init');
        requestAnimationFrame(() => {
            setTimeout(() => {
                main.classList.add('reveal-active');
                // Reveal flicker-prevention elements
                document.querySelectorAll('.flicker-prevention').forEach(el => el.classList.add('flicker-ready'));
            }, 50);
        });
    }

    // ========== SEARCH FUNCTIONALITY ==========
    function initSearch() {
        // Inline Search Elements
        const inlineInput = document.getElementById('inline-search-input');
        const inlineResults = document.getElementById('inline-search-results');

        // Overlay Search Elements (Keep for mobile or backup)
        const searchOverlay = document.getElementById('search-overlay');
        const searchClose = document.getElementById('search-close');
        const searchBar = document.getElementById('search-bar');

        // --- Inline Search Logic ---
        if (inlineInput && inlineResults) {
            let debounceTimer;

            // Input handler
            inlineInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                const query = e.target.value.trim();

                if (query.length < 2) {
                    inlineResults.classList.remove('active');
                    inlineResults.style.display = 'none';
                    return;
                }

                debounceTimer = setTimeout(() => {
                    const results = searchTools(query);
                    displaySearchResults(results.slice(0, 10), inlineResults);
                }, 300);
            });

            // Focus handler (show previous results if exist)
            inlineInput.addEventListener('focus', () => {
                if (inlineInput.value.trim().length >= 2) {
                    inlineResults.classList.add('active');
                    inlineResults.style.display = 'block';
                }
            });

            // Click outside to close
            document.addEventListener('click', (e) => {
                if (!inlineInput.contains(e.target) && !inlineResults.contains(e.target)) {
                    inlineResults.classList.remove('active');
                    inlineResults.style.display = 'none';
                }
            });
        }

        // --- Overlay Search Logic (Legacy/Mobile) ---
        if (searchOverlay && searchBar) {
            const closeSearch = () => {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
                searchBar.value = '';
                hideAutocomplete();
            };

            if (searchClose) searchClose.addEventListener('click', closeSearch);
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) closeSearch();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                    closeSearch();
                }
            });

            // Only attach overlay logic if explicitly triggered (e.g. by a distinct button if we had one)
            // Currently inline search is the primary, so we don't auto-open overlay.

            let debounceTimer;
            searchBar.addEventListener('input', function (e) {
                clearTimeout(debounceTimer);
                const query = e.target.value.trim();
                const autocomplete = document.getElementById('search-autocomplete');

                if (query.length < 2) {
                    if (autocomplete) autocomplete.classList.remove('active');
                    return;
                }

                debounceTimer = setTimeout(() => {
                    const results = searchTools(query);
                    displaySearchResults(results.slice(0, 10), autocomplete);
                }, 300);
            });
        }
    }

    function performSearch(query) {
        // Deprecated single-point entry, logic moved to event listeners for specific containers
        const results = searchTools(query);
        // Default to overlay if called generically
        const autocomplete = document.getElementById('search-autocomplete');
        if (autocomplete) displaySearchResults(results.slice(0, 10), autocomplete);
    }

    function displaySearchResults(results, container) {
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div class="autocomplete-item">No tools found</div>';
            container.classList.add('active');
            container.style.display = 'block';
            return;
        }

        const html = results.map(tool => `
      <div class="autocomplete-item" data-tool-id="${tool.id}">
        <div class="autocomplete-icon" style="color: ${tool.categoryColor}">
          ${tool.categoryIcon}
        </div>
        <div class="autocomplete-info">
            <div class="autocomplete-name">${tool.name}</div>
            <div class="autocomplete-desc">${tool.desc}</div>
        </div>
      </div>
    `).join('');

        container.innerHTML = html;
        container.classList.add('active');
        container.style.display = 'block';

        // Add click handlers
        container.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', function () {
                const tool = results.find(t => t.id === this.dataset.toolId);
                if (tool) {
                    window.location.href = tool.url;
                }
            });
        });
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function showAutocomplete() {
        const autocomplete = document.getElementById('search-autocomplete');
        if (autocomplete) {
            autocomplete.classList.add('active');
        }
    }

    function hideAutocomplete() {
        const autocomplete = document.getElementById('search-autocomplete');
        if (autocomplete) {
            autocomplete.classList.remove('active');
        }
    }

    function saveRecentSearch(query) {
        if (!state.recentSearches.includes(query)) {
            state.recentSearches.unshift(query);
            state.recentSearches = state.recentSearches.slice(0, 10); // Keep last 10
            localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
        }
    }

    // ========== NAVIGATION ==========
    function initNavigation() {
        const megaMenuTrigger = document.getElementById('mega-menu-trigger');
        const megaMenu = document.getElementById('mega-dropdown');
        const megaMenuContent = document.getElementById('mega-menu-content');

        if (!megaMenuTrigger || !megaMenu || !megaMenuContent) return;

        // Populate Mega Menu
        populateMegaMenu(megaMenuContent);

        megaMenuTrigger.addEventListener('click', function (e) {
            e.preventDefault();
            this.classList.toggle('active');
            megaMenu.classList.toggle('active');
        });

        // Close on outside click or escape
        document.addEventListener('click', function (e) {
            if (!megaMenuTrigger.contains(e.target) && !megaMenu.contains(e.target)) {
                megaMenuTrigger.classList.remove('active');
                megaMenu.classList.remove('active');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                megaMenuTrigger.classList.remove('active');
                megaMenu.classList.remove('active');
            }
        });
    }

    function populateMegaMenu(container) {
        if (typeof TOOLS_DATA === 'undefined') return;

        const categories = Object.values(TOOLS_DATA);
        const html = categories.map(cat => {
            return `
            <div class="dropdown-category">
                <div class="dropdown-tools">
                    ${cat.tools.map(tool => `
                        <a href="${tool.url}" class="dropdown-tool">${tool.name}</a>
                    `).join('')}
                </div>
            </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // ========== MOBILE MENU ==========
    function initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileNav = document.getElementById('mobile-nav');

        if (!mobileMenuBtn || !mobileNav) return;

        mobileMenuBtn.addEventListener('click', function () {
            this.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });
    }

    function populateMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        if (!mobileNav || typeof TOOLS_DATA === 'undefined') return;

        const categories = Object.values(TOOLS_DATA);
        const html = `
            <div class="mobile-nav-links" style="padding: 1rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;">
                <a href="about-us.html" style="display: block; padding: 0.5rem 0; font-weight: 600;">About Us</a>
                <a href="contact-us.html" style="display: block; padding: 0.5rem 0; font-weight: 600;">Contact Us</a>
            </div>
        ` + categories.map(cat => `
            <div class="mobile-nav-category">
                <div class="mobile-category-tools active">
                    ${cat.tools.slice(0, 10).map(tool => `
                        <a href="${tool.url}" class="mobile-tool-link">${tool.name}</a>
                    `).join('')}
                </div>
            </div>
        `).join('');

        mobileNav.innerHTML = html;

        // Re-initialize toggles for newly added elements
        mobileNav.querySelectorAll('.mobile-category-header').forEach(header => {
            header.addEventListener('click', function () {
                const tools = this.nextElementSibling;
                tools.classList.toggle('active');
                const icon = this.querySelector('.dropdown-icon');
                if (icon) {
                    icon.style.transform = tools.classList.contains('active') ? 'rotate(180deg)' : '';
                }
            });
        });
    }

    // ========== FAVORITES SYSTEM ==========
    function initFavorites() {
        updateFavoritesUI();

        // Add click handlers to favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const toolId = this.dataset.toolId;
                toggleFavorite(toolId);
            });
        });
    }

    function toggleFavorite(toolId) {
        const index = state.favorites.indexOf(toolId);

        if (index > -1) {
            state.favorites.splice(index, 1);
        } else {
            state.favorites.push(toolId);
        }

        localStorage.setItem('favorites', JSON.stringify(state.favorites));
        updateFavoritesUI();
    }

    function updateFavoritesUI() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const toolId = btn.dataset.toolId;
            const isFavorite = state.favorites.includes(toolId);
            btn.textContent = isFavorite ? '⭐' : '☆';
            btn.classList.toggle('active', isFavorite);
        });

        // Update favorites count
        const favoritesCount = document.getElementById('favorites-count');
        if (favoritesCount) {
            favoritesCount.textContent = state.favorites.length;
        }
    }

    // ========== SCROLL TO TOP ==========
    function initScrollToTop() {
        const scrollBtn = document.getElementById('scroll-top-btn');
        if (!scrollBtn) return;

        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        scrollBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========== STATS ANIMATION ==========
    function initStatsAnimation() {
        const stats = document.querySelectorAll('.stat-number');
        if (stats.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }

    function animateNumber(element) {
        const target = parseInt(element.dataset.count) || parseInt(element.textContent.replace(/\D/g, ''));
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;

            if (current >= target) {
                element.textContent = formatNumber(target);
                clearInterval(timer);
            } else {
                element.textContent = formatNumber(Math.floor(current));
            }
        }, 16);
    }

    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    }

    // ========== NEWSLETTER ==========
    function initNewsletter() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            // Simulate subscription (in real app, send to backend)
            const btn = this.querySelector('button');
            const originalText = btn.textContent;
            btn.innerHTML = '<span class="loading"></span>';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = '✓ Subscribed!';
                emailInput.value = '';
                showNotification('Successfully subscribed to newsletter!', 'success');

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 2000);
            }, 1500);
        });
    }

    // ========== CONTACT FORM ==========
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Simulate form submission
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.innerHTML = '<span class="loading"></span> Sending...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = '✓ Message Sent!';
                btn.classList.add('success');
                this.reset();
                showNotification('Thank you! Your message has been sent successfully.', 'success');

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.classList.remove('success');
                }, 3000);
            }, 1500);
        });
    }

    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function showNotification(message, type = 'info') {
        // Simple notification (can be enhanced with a proper notification system)
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message); // For now, use alert. Replace with custom notification UI later.
    }

    // ========== UTILITY FUNCTIONS ==========
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ========== EXPORT FOR CONSOLE DEBUGGING ==========
    window.ToolsHub = {
        state,
        toggleFavorite,
        searchTools,
        getAllTools: () => state.allTools
    };

})();
