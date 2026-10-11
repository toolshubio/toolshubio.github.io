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
