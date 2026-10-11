// TOOLSHUB Unified interactions
// FAQ accordion, workspace tabs
(function () {
  'use strict';
  function init() {
    // FAQ accordion
    document.querySelectorAll('.tu-faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.closest('.tu-faq-item');
        var wasOpen = item.classList.contains('open');
        item.parentElement.querySelectorAll('.tu-faq-item').forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });
    // Workspace tabs (visual only; tool keeps working)
    document.querySelectorAll('.tu-ws-tabs').forEach(function (tabs) {
      tabs.querySelectorAll('.tu-ws-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.querySelectorAll('.tu-ws-tab').forEach(function (t) { t.classList.remove('on'); });
          tab.classList.add('on');
        });
      });
    });
    // Open first FAQ by default
    var first = document.querySelector('.tu-faq .tu-faq-item');
    if (first) first.classList.add('open');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// Homepage live search filter
(function () {
  function initSearch() {
    var input = document.getElementById('tu-hp-search');
    if (!input) return;
    // Handle #search= hash (from tool page headers)
    function fromHash() {
      var m = location.hash.match(/#search=(.+)/);
      if (m) {
        input.value = decodeURIComponent(m[1]);
        filter(input.value);
        document.querySelector('.tu-hp-hero').scrollIntoView();
      }
    }
    function filter(q) {
      q = q.toLowerCase().trim();
      document.querySelectorAll('.tu-hp-card').forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
      });
      document.querySelectorAll('.tu-hp-section').forEach(function (sec) {
        var visible = sec.querySelectorAll('.tu-hp-card:not([style*="none"])').length;
        sec.style.display = visible ? '' : 'none';
      });
    }
    input.addEventListener('input', function () { filter(input.value); });
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSearch);
  else initSearch();
})();
