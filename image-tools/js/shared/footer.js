// ===================================
// FOOTER COMPONENT
// Site footer with tool links and info
// ===================================

class Footer {
  constructor() {
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    // Determine path prefix
    const getPathPrefix = () => {
      const path = window.location.pathname;
      const cleanPath = path.replace(/^\/|\/$/g, '');
      const segments = cleanPath ? cleanPath.split('/') : [];
      if (segments.length > 0 && segments[segments.length - 1].includes('.')) {
        segments.pop();
      }
      if (segments.length === 0) return './';
      return '../'.repeat(segments.length);
    };

    const prefix = getPathPrefix();

    const fixPath = (p) => {
      if (p.startsWith('http') || p.startsWith('#')) return p;
      if (p === '/') return prefix + 'index.html';
      const cleanP = p.replace(/^\//, '');
      return prefix + cleanP;
    };

    const footerHTML = `
      <!-- ========== FOOTER ========== -->
      <footer class="footer">
        <div class="container">
          <div class="footer-brand">
            <div class="footer-logo">TOOLSHUB.COM</div>
            <div class="footer-tagline">Your Ultimate Free Online Tools Suite</div>
            <div class="footer-meta">178+ Tools • 100% Free • No Registration Required</div>
          </div>

          <div class="footer-content">
            <div class="footer-column">
              <h4 class="footer-column-title">Quick Links</h4>
              <div class="footer-links">
                <a href="${fixPath('/')}" class="footer-link">Home</a>
                <a href="${fixPath('/all-tools.html')}" class="footer-link">All Tools</a>
                <a href="${fixPath('/categories.html')}" class="footer-link">Categories</a>
                <a href="${fixPath('/features.html')}" class="footer-link">Features</a>
                <a href="${fixPath('/blog.html')}" class="footer-link">Blog</a>
                <a href="${fixPath('/contact-us.html')}" class="footer-link">Contact Us</a>
                <a href="${fixPath('/sitemap.xml')}" class="footer-link">Sitemap</a>
              </div>
            </div>

            <div class="footer-column">
              <h4 class="footer-column-title">Tool Categories</h4>
              <div class="footer-links">
                <a href="${fixPath('image-tools/index.html')}" class="footer-link">Image Tools</a>
                <a href="${fixPath('seo-tools/index.html')}" class="footer-link">SEO Tools</a>
                <a href="${fixPath('doc-tools/index.html')}" class="footer-link">Documents</a>
                <a href="${fixPath('pdf-tools/index.html')}" class="footer-link">PDF Tools</a>
                <a href="${fixPath('text-tools/index.html')}" class="footer-link">Text & Writing</a>
                <a href="${fixPath('calculator-tools/index.html')}" class="footer-link">Calculators</a>
                <a href="${fixPath('binary-tools/index.html')}" class="footer-link">Binary Tools</a>
                <a href="${fixPath('code-format-tools/index.html')}" class="footer-link">Code & Formatters</a>
                <a href="${fixPath('other-tools/index.html')}" class="footer-link">Other Tools</a>
              </div>
            </div>

            <div class="footer-column">
              <h4 class="footer-column-title">Company</h4>
              <div class="footer-links">
                <a href="${fixPath('/about-us.html')}" class="footer-link">About Us</a>
                <a href="${fixPath('/how-it-works.html')}" class="footer-link">How It Works</a>
                <a href="${fixPath('/privacy-policy.html')}" class="footer-link">Privacy Policy</a>
                <a href="${fixPath('/terms-of-service.html')}" class="footer-link">Terms of Service</a>
                <a href="${fixPath('/dmca.html')}" class="footer-link">DMCA</a>
                <a href="${fixPath('/cookie-policy.html')}" class="footer-link">Cookie Policy</a>
              </div>
            </div>

            <div class="footer-column">
              <h4 class="footer-column-title">Connect With Us</h4>
              <div class="social-links">
                <a href="#" class="social-link">📘 Facebook</a>
                <a href="#" class="social-link">🐦 Twitter</a>
                <a href="#" class="social-link">💼 LinkedIn</a>
                <a href="#" class="social-link">🐙 GitHub</a>
                <a href="#" class="social-link">📺 YouTube</a>
                <a href="#" class="social-link">💬 Discord</a>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <div class="footer-languages">
              <a href="#" class="language-link active">English</a>
              <a href="#" class="language-link">Español</a>
              <a href="#" class="language-link">Français</a>
              <a href="#" class="language-link">Deutsch</a>
              <a href="#" class="language-link">中文</a>
              <a href="#" class="language-link">العربية</a>
            </div>

            <div class="footer-copyright">
              Copyright © ${new Date().getFullYear()} Toolshub.com. All rights reserved.<br>
              All trademarks and logos are the property of their respective owners.<br>
              All tools are free for personal and commercial use.
            </div>

            <div class="footer-made-with">
              Made with <span class="footer-heart">❤️</span> for the global community • 🇵🇰 Built in Pakistan
            </div>
          </div>
        </div>
      </footer>`;

    // Inject into placeholder or body
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
      placeholder.innerHTML = footerHTML;
    } else {
      document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
  }
}

// Initialize footer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Footer());
} else {
  new Footer();
}
