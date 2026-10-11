// TOOLSHUB v3 shared interactions
(function () {
  'use strict';
  function init() {
    // FAQ accordion
    document.querySelectorAll('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.closest('.faq-item');
        var wasOpen = item.classList.contains('open');
        item.parentElement.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });
    // Open first FAQ by default
    var first = document.querySelector('.faq .faq-item');
    if (first && !document.querySelector('.faq .faq-item.open')) first.classList.add('open');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// Homepage live search: filter tool cards + hide empty sections
(function () {
  function initSearch() {
    var s = document.getElementById('v3-search');
    if (!s) return;
    s.addEventListener('input', function () {
      var q = s.value.trim().toLowerCase();
      document.querySelectorAll('.v3-sec').forEach(function (sec) {
        var n = 0;
        sec.querySelectorAll('.v3-tool-card').forEach(function (c) {
          var show = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
          c.style.display = show ? '' : 'none';
          if (show) n++;
        });
        sec.style.display = n ? '' : 'none';
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSearch);
  else initSearch();
})();
