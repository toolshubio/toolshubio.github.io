// ===================================
// HEADER COMPONENT
// Dynamic header with navigation and theme toggle
// ===================================

class Header {
  constructor() {
    this.header = null;
    this.mobileMenuOpen = false;
    this.init();
  }

  init() {
    this.injectDependencies();
    this.render();
    this.attachEventListeners();
  }

  injectDependencies() {
    // Inject FontAwesome if not present
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
      document.head.appendChild(link);
    }

    // Determine path prefix for CSS
    const prefix = this.getPathPrefix();

    // Inject Tools Data if not present (Required for search)
    if (typeof TOOLS_DATA === 'undefined') {
      const script = document.createElement('script');
      script.src = prefix + 'scripts/tools-data.js';
      document.head.appendChild(script);
    }

    // Inject Core CSS if not present
    const cssFiles = [
      'css/global.css',
      'css/components.css',
      'css/responsive.css'
    ];

    cssFiles.forEach(file => {
      const href = prefix + file;
      const exists = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(l => l.getAttribute('href') && l.getAttribute('href').includes(file));
      if (!exists) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }

  getPathPrefix() {
    const path = window.location.pathname;
    
    // Count how many directories deep we are
    // Example: /image-tools/conversion/png-jpg-converter.html has 2 levels above root (image-tools, conversion)
    // But we need to handle both / and /index.html
    const cleanPath = path.replace(/^\/|\/$/g, '');
    const segments = cleanPath ? cleanPath.split('/') : [];
    
    // If we have index.html at the end, it doesn't count as a directory level
    if (segments.length > 0 && segments[segments.length - 1].includes('.')) {
      segments.pop();
    }

    if (segments.length === 0) return './';
    return '../'.repeat(segments.length);
  }

  fixPath(p, prefix) {
    if (p.startsWith('http') || p.startsWith('#')) return p;
    
    if (p === '/') {
       return prefix + 'index.html';
    }
    
    const cleanP = p.replace(/^\//, '');
    return prefix + cleanP;
  }

  render() {
    // Check if we should hide mobile nav (for Calculator and Code tools as requested)
    const path = window.location.pathname;
    const hideMobileNav = path.includes('calculator-tools') || path.includes('code-format-tools');

    // Determine path prefix
    const prefix = this.getPathPrefix();
    const fixPath = (p) => this.fixPath(p, prefix);

    // Generate dynamic category dropdown content
    const generateMegaMenu = () => {
      if (typeof TOOLS_DATA === 'undefined') return '<div class="loading-tools">Loading Tools...</div>';

      return Object.values(TOOLS_DATA).map(category => {
        return `
          <div class="dropdown-category ${category.id}">
            <div class="dropdown-tools">
              ${category.tools.slice(0, 10).map(tool => `
                <a href="${fixPath(tool.url === '#' ? category.id + '/index.html' : tool.url)}" class="dropdown-tool">${tool.name}</a>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    };

    const headerHTML = `
      <!-- ========== HEADER ========== -->
      <header class="header">
        <div class="header-container">
          <a href="${fixPath('/')}" class="logo">
            <span class="logo-icon">🛠️</span>
            <span class="logo-text">ToolsHub</span>
          </a>

          <nav class="header-nav">
            <a href="${fixPath('/')}" class="nav-link">Home</a>
            <a href="${fixPath('/')}#features" class="nav-link">Features</a>
            <a href="${fixPath('/')}#pricing" class="nav-link">Pricing</a>
            <a href="${prefix}about-us.html" class="nav-link">About Us</a>
            <a href="${prefix}contact-us.html" class="nav-link">Contact Us</a>
          </nav>

          <div class="header-search-container">
            <div class="header-search-control">
              <i class="fas fa-search search-icon"></i>
              <input type="text" placeholder="Search tools..." id="inline-search-input" autocomplete="off">
            </div>
            <div class="search-autocomplete" id="header-search-results"></div>
          </div>

          <div class="header-cta-container">
            <button class="btn btn-primary cta-btn" onclick="window.location.href='${fixPath('/')}#get-started'">Get Started</button>
          </div>

          <div class="utility-icons">
            <button class="icon-btn" id="theme-toggle" aria-label="Toggle dark mode">
                <i class="fas fa-moon"></i>
            </button>
          </div>

          ${!hideMobileNav ? `
          <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          ` : ''}
        </div>
      </header>

      <!-- MEGA DROPDOWN REMOVED -->

      <!-- ========== MOBILE NAVIGATION ========== -->
      ${!hideMobileNav ? `
      <div class="mobile-nav" id="mobile-nav">
         <div class="mobile-nav-content">
             <a href="${fixPath('/')}" class="mobile-link">Home</a>
             <a href="${fixPath('#features')}" class="mobile-link">Features</a>
             <a href="${fixPath('#pricing')}" class="mobile-link">Pricing</a>
             <a href="${fixPath('about-us.html')}" class="mobile-link">About Us</a>
             <a href="${fixPath('contact-us.html')}" class="mobile-link">Contact Us</a>
             <button class="btn btn-primary mobile-cta" onclick="window.location.href='${fixPath('#get-started')}'">Get Started</button>
         </div>
      </div>
      ` : ''}
    `;

    // Inject into placeholder or body
    const placeholder = document.getElementById('header-placeholder');
    if (placeholder) {
      placeholder.innerHTML = headerHTML;
    } else {
      // Remove existing header if any
      const existingHeader = document.querySelector('header.header');
      if (existingHeader) existingHeader.remove();
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }
    this.header = document.querySelector('.header');
  }

  attachEventListeners() {
    // Scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    });

    // Mobile Menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileBtn && mobileNav) {
      mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
      });
    }

    // Inline Search Logic
    const searchInput = document.getElementById('inline-search-input');
    const searchResults = document.getElementById('header-search-results');

    if (searchInput && searchResults) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length < 2) {
          searchResults.classList.remove('active');
          searchResults.style.display = 'none';
          return;
        }

        if (typeof searchTools !== 'undefined') {
          const results = searchTools(query);
          this.renderSearchResults(results);
        }
      });

      // Hide results on click outside
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
          searchResults.classList.remove('active');
          searchResults.style.display = 'none';
        }
      });
    }


    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      const updateThemeIcon = (theme) => {
        themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      };

      themeBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
      });

      const saved = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', saved);
      updateThemeIcon(saved);
    }
  }

  renderSearchResults(results) {
    const searchResults = document.getElementById('header-search-results');
    if (!searchResults) return;

    if (!results || results.length === 0) {
      searchResults.innerHTML = '<div class="autocomplete-item no-results">No tools found</div>';
      searchResults.classList.add('active');
      searchResults.style.display = 'block';
      return;
    }

    const prefix = this.getPathPrefix();
    searchResults.innerHTML = results.slice(0, 8).map(tool => `
      <div class="autocomplete-item" onclick="window.location.href='${this.fixPath(tool.url, prefix)}'">
        <div class="autocomplete-icon" style="color: ${tool.categoryColor}">
          ${tool.categoryIcon || '🛠️'}
        </div>
        <div class="autocomplete-info">
            <div class="autocomplete-name">${tool.name}</div>
            <div class="autocomplete-desc">${tool.desc.substring(0, 40)}...</div>
        </div>
      </div>
    `).join('');

    searchResults.classList.add('active');
    searchResults.style.display = 'block';
  }
}

// Initialize header when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Header());
} else {
  new Header();
}
