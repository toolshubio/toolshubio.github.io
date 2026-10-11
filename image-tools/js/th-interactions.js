// TOOLSHUB header interactions (for hardcoded headers)
// Mobile menu, theme toggle, search redirect
(function () {
  'use strict';

  function init() {
    // Mobile menu toggle
    document.querySelectorAll('[data-th-menu-btn]').forEach(function (btn) {
      var header = btn.closest('.th-header');
      var menu = header ? header.querySelector('[data-th-menu]') : document.querySelector('[data-th-menu]');
      if (menu) btn.addEventListener('click', function () { menu.classList.toggle('open'); });
    });

    // Theme toggle (applies saved theme ASAP, then binds buttons)
    try {
      var saved = null;
      try { saved = localStorage.getItem('th-theme'); } catch (e) {}
      if (saved) document.documentElement.setAttribute('data-theme', saved);
    } catch (e) {}

    function paintIcons() {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.querySelectorAll('[data-th-theme]').forEach(function (b) {
        b.innerHTML = dark ? '<i class="fa-regular fa-sun"></i>' : '<i class="fa-regular fa-moon"></i>';
      });
    }
    paintIcons();
    document.querySelectorAll('[data-th-theme]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
        try { localStorage.setItem('th-theme', dark ? 'light' : 'dark'); } catch (e) {}
        paintIcons();
      });
    });

    // Search -> homepage with #search= hash
    document.querySelectorAll('.th-search-input').forEach(function (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && input.value.trim()) {
          var base = input.getAttribute('data-th-home') || './index.html';
          window.location.href = base + '#search=' + encodeURIComponent(input.value.trim());
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
