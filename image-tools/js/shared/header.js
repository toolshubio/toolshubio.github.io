// ===================================
// TOOLSHUB HEADER - New Design (Sample 1)
// Sticky glass header with dropdown nav
// ===================================

(function () {
  'use strict';

  function getPathPrefix() {
    var path = window.location.pathname || '';
    var clean = path.replace(/^\/|\/$/g, '');
    var segs = clean ? clean.split('/') : [];
    if (segs.length && segs[segs.length - 1].indexOf('.') !== -1) segs.pop();
    if (!segs.length) return './';
    return new Array(segs.length + 1).join('../');
  }

  function fixPath(p, prefix) {
    if (/^(https?:|#|mailto:)/.test(p)) return p;
    if (p === '/') return prefix + 'index.html';
    return prefix + p.replace(/^\//, '');
  }

  function init() {
    // Ensure Font Awesome (category pages don't link it)
    if (!document.querySelector('link[href*="font-awesome"]')) {
      var fa = document.createElement('link');
      fa.rel = 'stylesheet';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
      document.head.appendChild(fa);
    }
    var placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;
    var prefix = getPathPrefix();

    var cats = [
      ['image-tools/index.html', 'fa-regular fa-image', 'Image Tools'],
      ['pdf-tools/index.html', 'fa-regular fa-file-pdf', 'PDF Tools'],
      ['text-tools/index.html', 'fa-solid fa-font', 'Text & Writing'],
      ['seo-tools/index.html', 'fa-solid fa-magnifying-glass-chart', 'SEO Tools'],
      ['calculator-tools/index.html', 'fa-solid fa-calculator', 'Calculators'],
      ['binary-tools/index.html', 'fa-solid fa-code', 'Binary Tools'],
      ['code-format-tools/index.html', 'fa-solid fa-file-code', 'Code & Formatters'],
      ['doc-tools/index.html', 'fa-regular fa-file-lines', 'Documents'],
      ['other-tools/index.html', 'fa-solid fa-shapes', 'Other Tools']
    ];
    var dropLinks = cats.map(function (c) {
      return '<a href="' + fixPath(c[0], prefix) + '"><i class="' + c[1] + '"></i>' + c[2] + '</a>';
    }).join('');
    var mobLinks = cats.map(function (c) {
      return '<a href="' + fixPath(c[0], prefix) + '">' + c[2] + '</a>';
    }).join('') + '<a href="' + fixPath('about-us.html', prefix) + '">About Us</a>' +
      '<a href="' + fixPath('contact-us.html', prefix) + '">Contact Us</a>';

    placeholder.innerHTML =
      '<header class="th-header">' +
      '<div class="th-header-inner">' +
      '<a class="th-logo" href="' + fixPath('/', prefix) + '"><span class="th-logo-badge"><i class="fa-solid fa-wrench"></i></span><span class="th-logo-text">TOOL<em>SHUB</em></span></a>' +
      '<nav class="th-nav">' +
      '<div class="th-dropdown"><button class="th-drop-btn" aria-haspopup="true">All Tools <i class="fa-solid fa-chevron-down"></i></button>' +
      '<div class="th-dropdown-menu">' + dropLinks + '</div></div>' +
      '<a class="th-nav-link" href="' + fixPath('image-tools/index.html', prefix) + '">Image Tools</a>' +
      '<a class="th-nav-link" href="' + fixPath('pdf-tools/index.html', prefix) + '">PDF Tools</a>' +
      '<a class="th-nav-link" href="' + fixPath('seo-tools/index.html', prefix) + '">SEO Tools</a>' +
      '<a class="th-nav-link" href="' + fixPath('about-us.html', prefix) + '">About</a>' +
      '</nav><div class="th-spacer"></div>' +
      '<div class="th-search"><i class="fa-solid fa-magnifying-glass"></i><input type="text" class="th-search-input" placeholder="Search 203 tools..." aria-label="Search tools"></div>' +
      '<button class="th-theme-btn" data-th-theme title="Toggle dark mode" aria-label="Toggle dark mode"><i class="fa-regular fa-moon"></i></button>' +
      '<a class="th-cta" href="' + fixPath('/', prefix) + '#features">Explore Tools</a>' +
      '<button class="th-mobile-toggle" data-th-menu-btn aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>' +
      '</div><div class="th-mobile-menu" data-th-menu>' + mobLinks + '</div></header>';

    bindInteractions(placeholder, prefix);
  }

  function bindInteractions(root, prefix) {
    var menuBtn = root.querySelector('[data-th-menu-btn]');
    var menu = root.querySelector('[data-th-menu]');
    if (menuBtn && menu) menuBtn.addEventListener('click', function () { menu.classList.toggle('open'); });

    var themeBtn = root.querySelector('[data-th-theme]');
    function paintIcon() {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeBtn.innerHTML = dark ? '<i class="fa-regular fa-sun"></i>' : '<i class="fa-regular fa-moon"></i>';
    }
    try {
      var saved = null;
      try { saved = localStorage.getItem('th-theme'); } catch (e) {}
      if (saved) document.documentElement.setAttribute('data-theme', saved);
    } catch (e) {}
    if (themeBtn) {
      paintIcon();
      themeBtn.addEventListener('click', function () {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
        try { localStorage.setItem('th-theme', dark ? 'light' : 'dark'); } catch (e) {}
        paintIcon();
      });
    }

    var search = root.querySelector('.th-search-input');
    if (search) search.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && search.value.trim()) {
        window.location.href = fixPath('/', prefix) + '#search=' + encodeURIComponent(search.value.trim());
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
