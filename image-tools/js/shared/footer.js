// ===================================
// TOOLSHUB FOOTER - New Design (Sample 1)
// Dark premium footer, 4 columns
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
    var placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;
    var prefix = getPathPrefix();
    var F = function (p) { return fixPath(p, prefix); };

    var popular = [
      ['image-tools/compression/image-compressor.html', 'Image Compressor'],
      ['pdf-tools/merge-pdf.html', 'Merge PDF'],
      ['seo-tools/word-counter.html', 'Word Counter'],
      ['code-format-tools/formatters/json-formatter.html', 'JSON Formatter'],
      ['image-tools/conversion/heic-jpg-converter.html', 'HEIC to JPG'],
      ['code-format-tools/encoders/base64-encoder-decoder.html', 'Base64 Encoder']
    ].map(function (t) { return '<li><a href="' + F(t[0]) + '">' + t[1] + '</a></li>'; }).join('');

    var categories = [
      ['image-tools/index.html', 'Image Tools'],
      ['pdf-tools/index.html', 'PDF Tools'],
      ['text-tools/index.html', 'Text & Writing'],
      ['seo-tools/index.html', 'SEO Tools'],
      ['calculator-tools/index.html', 'Calculators'],
      ['/', 'View All 203 Tools']
    ].map(function (t) { return '<li><a href="' + F(t[0]) + '">' + t[1] + '</a></li>'; }).join('');

    placeholder.innerHTML =
      '<footer class="th-footer">' +
      '<div class="th-footer-top">' +
      '<div class="th-f-brand">' +
      '<a class="th-logo" href="' + F('/') + '"><span class="th-logo-badge"><i class="fa-solid fa-wrench"></i></span><span class="th-logo-text">TOOL<em>SHUB</em></span></a>' +
      '<p>203 free online tools that run entirely in your browser. No sign-up, no watermarks, no limits.</p>' +
      '<div class="th-social">' +
      '<a href="#" aria-label="Twitter"><i class="fa-brands fa-twitter"></i></a>' +
      '<a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>' +
      '<a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>' +
      '<a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>' +
      '<a href="#" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>' +
      '</div></div>' +
      '<div class="th-f-col"><h4>Popular Tools</h4><ul>' + popular + '</ul></div>' +
      '<div class="th-f-col"><h4>Categories</h4><ul>' + categories + '</ul></div>' +
      '<div class="th-f-col th-newsletter"><h4>Stay Updated</h4>' +
      '<p>Get notified when we launch new tools. No spam, ever.</p>' +
      '<form class="th-newsletter-form" onsubmit="return false;"><input type="email" placeholder="Your email address" aria-label="Email address"><button type="submit">Join</button></form>' +
      '<div class="th-f-stats"><div><b>203</b><span>Free Tools</span></div><div><b>10</b><span>Categories</span></div><div><b>100%</b><span>Free Forever</span></div></div>' +
      '</div></div>' +
      '<div class="th-footer-bottom"><div class="th-footer-bottom-inner">' +
      '<span>&copy; 2026 TOOLSHUB. All rights reserved. Made for the open web.</span>' +
      '<div class="th-f-legal"><a href="' + F('about-us.html') + '">About</a><a href="' + F('contact-us.html') + '">Contact</a><a href="' + F('sitemap.xml') + '">Sitemap</a></div>' +
      '</div></div></footer>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
