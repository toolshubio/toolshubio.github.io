// ===================================
// BREADCRUMB NAVIGATION COMPONENT
// Dynamically generates breadcrumbs based on URL path
// ===================================

class Breadcrumb {
    constructor(customPath = null) {
        this.customPath = customPath;
        this.init();
    }

    init() {
        this.render();
    }

    parsePath() {
        const path = this.customPath || window.location.pathname;
        // Remove common base path segments
        const segments = path.split('/').filter(seg => seg && !seg.includes('.html'));

        // Determine depth for relative paths
        let prefix = './';
        const depth = (path.match(/\//g) || []).length - 1; // Basic depth check

        if (path.includes('/conversion/') || path.includes('/compression/') || path.includes('/resize-crop/') || path.includes('/editing/') || path.includes('/utilities/') ||
            path.includes('/meta-tags/') || path.includes('/keywords/') || path.includes('/backlinks/') || path.includes('/performance/') || path.includes('/serp/') ||
            path.includes('/minifiers/') || path.includes('/formatters/') || path.includes('/validators/') || path.includes('/viewers/') || path.includes('/encoders/') || path.includes('/code-utilities/')) {
            prefix = '../../';
        } else if (path.includes('/image-tools/') || path.includes('/seo-tools/') || path.includes('/text-tools/') || path.includes('/code-format-tools/') || path.includes('/calculator/') || path.includes('/calculator-tools/') || path.includes('/pdf-tools/') || path.includes('/binary-tools/') || path.includes('/doc-tools/') || path.includes('/other-tools/')) {
            prefix = '../';
        }

        const breadcrumbs = [
            { name: 'Home', path: prefix + 'index.html' }
        ];

        const categoryMap = {
            'image-tools': { name: 'Image Tools', icon: '🖼️' },
            'seo-tools': { name: 'SEO', icon: '📊' },
            'doc-tools': { name: 'Doc Tools', icon: '📄' },
            'pdf-tools': { name: 'PDF Tools', icon: '📕' },
            'text-tools': { name: 'Text Tools', icon: '📝' },
            'calculator-tools': { name: 'Calculators', icon: '🧮' },
            'binary-tools': { name: 'Binary Tools', icon: '🔢' },
            'code-format-tools': { name: 'Code Tools', icon: '💻' },
            'other-tools': { name: 'Other Tools', icon: '⚒️' },
            'conversion': { name: 'Conversion', parent: 'image-tools' },
            'compression': { name: 'Compression', parent: 'image-tools' },
            'resize-crop': { name: 'Resize & Crop', parent: 'image-tools' },
            'editing': { name: 'Editing', parent: 'image-tools' },
            'utilities': { name: 'Utilities', parent: 'image-tools' }
        };

        // Extract current filename
        const filename = path.split('/').pop() || 'index.html';

        segments.forEach(segment => {
            if (categoryMap[segment]) {
                const cat = categoryMap[segment];
                if (cat.parent) {
                    const parentCat = categoryMap[cat.parent];
                    if (!breadcrumbs.find(b => b.name === parentCat.name)) {
                        breadcrumbs.push({ name: parentCat.name, path: prefix + cat.parent + '/index.html' });
                    }
                    breadcrumbs.push({
                        name: cat.name,
                        path: prefix + cat.parent + '/index.html#' + segment,
                        isCategory: true,
                        categoryId: segment
                    });
                } else {
                    breadcrumbs.push({
                        name: cat.name,
                        path: prefix + segment + '/index.html',
                        isCategory: true,
                        categoryId: segment
                    });
                }
            }
        });

        // Add current tool name if it's not an index page
        if (filename && filename !== 'index.html' && typeof TOOLS_DATA !== 'undefined') {
            const allTools = [
                ...(TOOLS_DATA.imageTools ? TOOLS_DATA.imageTools.tools : []),
                ...(TOOLS_DATA.seoTools ? TOOLS_DATA.seoTools.tools : []),
                ...(TOOLS_DATA.binaryTools ? TOOLS_DATA.binaryTools.tools : []),
                ...(TOOLS_DATA.pdfTools ? TOOLS_DATA.pdfTools.tools : []),
                ...(TOOLS_DATA.docTools ? TOOLS_DATA.docTools.tools : []),
                ...(TOOLS_DATA.textTools ? TOOLS_DATA.textTools.tools : []),
                ...(TOOLS_DATA.calculators ? TOOLS_DATA.calculators.tools : []),
                ...(TOOLS_DATA.codeTools ? TOOLS_DATA.codeTools.tools : []),
                ...(TOOLS_DATA.otherTools ? TOOLS_DATA.otherTools.tools : [])
            ];

            const tool = allTools.find(t => t.url.includes(filename));
            if (tool) {
                breadcrumbs.push({ name: tool.name, path: null, isTool: true });
            }
        }

        return breadcrumbs;
    }

    render() {
        const breadcrumbs = this.parsePath();
        const currentPath = window.location.pathname;

        const breadcrumbHTML = `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <div class="container">
          <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
            ${breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            let content = '';

            if (crumb.path && !isLast) {
                content = `<a href="${crumb.path}" class="breadcrumb-link" itemprop="item"><span itemprop="name">${crumb.name}</span></a>`;
            } else {
                const categoryClass = currentPath.includes('binary-tools') ? 'data-category="binary"' :
                    currentPath.includes('other-tools') ? 'data-category="other"' : '';
                content = `<span class="breadcrumb-current" itemprop="name" ${categoryClass}>${crumb.name}</span>`;
            }

            return `
                <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                  ${content}
                  <meta itemprop="position" content="${index + 1}" />
                </li>
              `;
        }).join('')}
          </ol>
        </div>
      </nav>
    `;

        // Inject into placeholder
        const placeholder = document.getElementById('breadcrumb-placeholder');
        if (placeholder) {
            placeholder.innerHTML = breadcrumbHTML;
            return;
        }

        // Clean up existing breadcrumbs if any
        const existing = document.querySelector('.breadcrumb');
        if (existing) existing.remove();

        // Inject after header
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentHTML('afterend', breadcrumbHTML);
        } else {
            document.body.insertAdjacentHTML('afterbegin', breadcrumbHTML);
        }
    }

    static update(customPath) {
        new Breadcrumb(customPath);
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new Breadcrumb();
});
