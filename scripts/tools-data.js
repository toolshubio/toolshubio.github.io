// TOOLSHUB.COM - Complete Tools Database
// All 137+ tools organized by category with metadata

const TOOLS_DATA = {
  imageTools: {
    id: 'image-tools',
    name: 'Image Tools',
    icon: '🖼️',
    color: '#2196F3',
    count: 37,
    tools: [
      // CONVERSION (15)
      { id: 'png-jpg-converter', name: 'PNG ↔ JPG Converter', desc: 'Fast PNG to JPG conversion', category: 'conversion', keywords: ['png', 'jpg', 'jpeg', 'convert', 'image'], url: 'conversion/png-jpg-converter.html', popular: true },
      { id: 'png-svg-converter', name: 'PNG ↔ SVG Converter', desc: 'Convert PNG to vector SVG', category: 'conversion', keywords: ['png', 'svg', 'vector', 'convert'], url: 'conversion/png-svg-converter.html' },
      { id: 'jpg-svg-converter', name: 'JPG ↔ SVG Converter', desc: 'Convert JPG to vector SVG', category: 'conversion', keywords: ['jpg', 'svg', 'vector', 'convert'], url: 'conversion/jpg-svg-converter.html' },
      { id: 'webp-png-converter', name: 'WebP ↔ PNG Converter', desc: 'Modern WebP format converter', category: 'conversion', keywords: ['webp', 'png', 'modern', 'convert'], url: 'conversion/webp-png-converter.html', popular: true },
      { id: 'webp-jpg-converter', name: 'WebP ↔ JPG Converter', desc: 'Convert WebP to JPG', category: 'conversion', keywords: ['webp', 'jpg', 'convert'], url: 'conversion/webp-jpg-converter.html' },
      { id: 'svg-png-converter', name: 'SVG ↔ PNG Converter', desc: 'Vector to raster conversion', category: 'conversion', keywords: ['svg', 'png', 'vector', 'raster', 'convert'], url: 'conversion/svg-png-converter.html', popular: true },
      { id: 'svg-jpg-converter', name: 'SVG ↔ JPG Converter', desc: 'Vector SVG to JPG', category: 'conversion', keywords: ['svg', 'jpg', 'vector', 'convert'], url: 'conversion/svg-jpg-converter.html' },
      { id: 'avif-jpg-converter', name: 'AVIF ↔ JPG Converter', desc: 'Next-gen AVIF converter', category: 'conversion', keywords: ['avif', 'jpg', 'convert'], url: 'conversion/avif-jpg-converter.html' },
      { id: 'heic-jpg-converter', name: 'HEIC ↔ JPG Converter', desc: 'Convert iPhone photos', category: 'conversion', keywords: ['heic', 'jpg', 'iphone', 'convert'], url: 'conversion/heic-jpg-converter.html' },
      { id: 'jfif-png-converter', name: 'JFIF ↔ PNG Converter', desc: 'JFIF format converter', category: 'conversion', keywords: ['jfif', 'png', 'convert'], url: 'conversion/jfif-png-converter.html' },
      { id: 'tiff-jpg-converter', name: 'TIFF ↔ JPG Converter', desc: 'Convert TIFF images', category: 'conversion', keywords: ['tiff', 'jpg', 'convert'], url: 'conversion/tiff-jpg-converter.html' },
      { id: 'bmp-png-converter', name: 'BMP ↔ PNG Converter', desc: 'Bitmap to PNG converter', category: 'conversion', keywords: ['bmp', 'png', 'bitmap', 'convert'], url: 'conversion/bmp-png-converter.html' },
      { id: 'gif-mp4-converter', name: 'GIF ↔ MP4 Converter', desc: 'Animate GIF to video', category: 'conversion', keywords: ['gif', 'mp4', 'video', 'convert', 'animation'], url: 'conversion/gif-mp4-converter.html' },
      { id: 'pdf-images-converter', name: 'PDF ↔ Images Converter', desc: 'Extract images from PDF', category: 'conversion', keywords: ['pdf', 'images', 'extract', 'convert'], url: 'conversion/pdf-images-converter.html' },
      { id: 'ico-png-converter', name: 'ICO ↔ PNG Converter', desc: 'Icon file converter', category: 'conversion', keywords: ['ico', 'png', 'icon', 'favicon', 'convert'], url: 'conversion/ico-png-converter.html' },

      // COMPRESSION (6)
      { id: 'image-compressor', name: 'Image Compressor', desc: 'Reduce file size', category: 'compression', keywords: ['compress', 'reduce', 'size', 'optimize'], url: 'compression/image-compressor.html', popular: true, trending: true },
      { id: 'compress-20kb', name: 'Compress to 20KB', desc: 'Compress to exactly 20KB', category: 'compression', keywords: ['compress', '20kb', 'size'], url: 'compression/image-compressor.html' },
      { id: 'compress-30kb', name: 'Compress to 30KB', desc: 'Compress to exactly 30KB', category: 'compression', keywords: ['compress', '30kb', 'size'], url: 'compression/image-compressor.html' },
      { id: 'compress-50kb', name: 'Compress to 50KB', desc: 'Compress to exactly 50KB', category: 'compression', keywords: ['compress', '50kb', 'size'], url: 'compression/image-compressor.html' },
      { id: 'compress-100kb', name: 'Compress to 100KB', desc: 'Compress to exactly 100KB', category: 'compression', keywords: ['compress', '100kb', 'size'], url: 'compression/image-compressor.html' },
      { id: 'lossless-compressor', name: 'Lossless Compressor', desc: 'No quality loss compression', category: 'compression', keywords: ['compress', 'lossless', 'quality'], url: 'compression/image-compressor.html' },

      // EDITING (8)
      { id: 'photo-resizer', name: 'Photo Resizer', desc: 'Resize photos', category: 'editing', keywords: ['resize', 'photo', 'dimensions'], url: 'resize-crop/photo-resizer.html', popular: true },
      { id: 'image-resizer', name: 'Image Resizer', desc: 'Resize any image', category: 'editing', keywords: ['resize', 'image', 'scale'], url: 'resize-crop/image-resizer.html' },
      { id: 'resize-10kb', name: 'Resize to 10KB', desc: 'Resize to 10KB target', category: 'editing', keywords: ['resize', '10kb'], url: 'resize-crop/image-resizer.html' },
      { id: 'crop-image', name: 'Crop Image', desc: 'Trim & edit images', category: 'editing', keywords: ['crop', 'trim', 'cut', 'edit'], url: 'resize-crop/crop-image.html', popular: true },
      { id: 'watermark-tool', name: 'Watermark Adder/Remover', desc: 'Add/remove watermarks', category: 'editing', keywords: ['watermark', 'add', 'remove', 'logo'], url: 'editing/watermark-adder.html', popular: true },
      { id: 'image-filters', name: 'Image Filters & Effects', desc: 'Apply filters', category: 'editing', keywords: ['filter', 'effects', 'adjust'], url: 'editing/filters-effects.html', popular: true },
      { id: 'color-corrector', name: 'Color Corrector', desc: 'Adjust colors', category: 'editing', keywords: ['color', 'correct', 'adjust', 'hue'], url: 'editing/color-corrector.html', popular: true },
      { id: 'background-remover', name: 'Background Remover', desc: 'Remove bg automatically', category: 'editing', keywords: ['background', 'remove', 'bg', 'transparent'], url: 'editing/filters-effects.html', popular: true, trending: true },

      // EXTRACTION (4)
      { id: 'image-to-text', name: 'Image to Text (OCR)', desc: 'Extract text from images', category: 'extraction', keywords: ['ocr', 'text', 'extract', 'read'], url: 'utilities/image-to-text.html', popular: true },
      { id: 'exif-viewer', name: 'EXIF Data Viewer/Remover', desc: 'View/remove metadata', category: 'extraction', keywords: ['exif', 'metadata', 'remove'], url: 'utilities/exif-viewer.html' },
      { id: 'color-palette', name: 'Color Palette Generator', desc: 'Extract color palette', category: 'extraction', keywords: ['color', 'palette', 'extract'], url: 'utilities/color-palette.html' },
      { id: 'duplicate-finder', name: 'Duplicate Image Finder', desc: 'Find duplicate images', category: 'extraction', keywords: ['duplicate', 'find', 'similar'], url: 'utilities/duplicate-finder.html' },
      { id: 'noise-reducer', name: 'Noise Reducer', desc: 'Reduce image noise', category: 'utilities', keywords: ['noise', 'reduce', 'clean'], url: 'editing/noise-reducer.html' },
      { id: 'sharpness-tool', name: 'Sharpness Tool', desc: 'Enhance sharpness', category: 'utilities', keywords: ['sharp', 'enhance', 'clarity'], url: 'editing/sharpness-tool.html' },
      { id: 'image-compare', name: 'Image Compare Tool', desc: 'Compare images side-by-side', category: 'utilities', keywords: ['compare', 'diff', 'side-by-side'], url: 'utilities/image-compare.html' },
      { id: 'bulk-processor', name: 'Bulk Image Processor', desc: 'Process multiple images', category: 'utilities', keywords: ['bulk', 'batch', 'multiple'], url: 'conversion/batch-converter.html' }
    ]
  },

  seoTools: {
    id: 'seo-tools',
    name: 'SEO Tools',
    icon: '📊',
    color: '#4CAF50',
    count: 23,
    tools: [
      // ANALYSIS (9)
      { id: 'keyword-density', name: 'Keyword Density Checker', desc: 'Analyze keyword density', category: 'analysis', keywords: ['keyword', 'density', 'seo', 'analyze'], url: 'seo-tools/keyword-density-checker.html', popular: true },
      { id: 'keyword-frequency', name: 'Keyword Frequency Counter', desc: 'Count keyword frequency', category: 'analysis', keywords: ['keyword', 'frequency', 'count'], url: 'seo-tools/keyword-frequency-counter.html' },
      { id: 'word-counter-seo', name: 'Word Counter for SEO', desc: 'SEO word counting', category: 'analysis', keywords: ['word', 'count', 'seo'], url: 'seo-tools/word-counter.html' },
      { id: 'readability-checker', name: 'Readability Checker', desc: 'Check content readability', category: 'analysis', keywords: ['readability', 'score', 'flesch'], url: 'seo-tools/readability-checker.html' },
      { id: 'heading-extractor', name: 'Heading Extractor', desc: 'Extract H1-H6 tags', category: 'analysis', keywords: ['heading', 'h1', 'extract', 'seo'], url: 'seo-tools/heading-extractor.html', popular: true },
      { id: 'internal-link-counter', name: 'Internal Link Counter', desc: 'Count internal links', category: 'analysis', keywords: ['internal', 'links', 'count'], url: 'seo-tools/internal-link-counter.html' },
      { id: 'external-link-counter', name: 'External Link Counter', desc: 'Count external links', category: 'analysis', keywords: ['external', 'links', 'count'], url: 'seo-tools/external-link-counter.html' },
      { id: 'seo-checklist', name: 'SEO Checklist', desc: 'Complete SEO audit', category: 'analysis', keywords: ['seo', 'checklist', 'audit'], url: 'seo-tools/seo-checklist.html', popular: true },
      { id: 'speed-test', name: 'Website Speed Test', desc: 'Analyze page performance and load times', category: 'analysis', keywords: ['speed', 'performance', 'audit', 'core web vitals'], url: 'seo-tools/website-speed-test.html', popular: true },

      // GENERATORS (8)
      { id: 'schema-generator', name: 'Schema.org Generator', desc: 'Generate JSON-LD markup', category: 'generators', keywords: ['schema', 'json-ld', 'structured'], url: 'seo-tools/schema-generator.html', popular: true },
      { id: 'meta-tag-generator', name: 'Meta Tag Generator', desc: 'Generate meta tags', category: 'generators', keywords: ['meta', 'tags', 'generate', 'seo'], url: 'seo-tools/meta-tag-generator.html', popular: true, trending: true },
      { id: 'robots-txt-generator', name: 'Robots.txt Generator', desc: 'Create robots.txt', category: 'generators', keywords: ['robots', 'txt', 'generate'], url: 'seo-tools/robots-txt-generator.html', popular: true },
      { id: 'sitemap-generator', name: 'Sitemap Generator', desc: 'Create XML sitemap', category: 'generators', keywords: ['sitemap', 'xml', 'generate'], url: 'seo-tools/sitemap-generator.html', popular: true },
      { id: 'canonical-tag', name: 'Canonical Tag Generator', desc: 'Generate canonical tags', category: 'generators', keywords: ['canonical', 'tag', 'generate'], url: 'seo-tools/canonical-tag-generator.html' },
      { id: 'meta-robots', name: 'Meta Robots Generator', desc: 'Generate meta robots tags', category: 'generators', keywords: ['meta', 'robots', 'noindex'], url: 'seo-tools/meta-robots-generator.html' },
      { id: 'open-graph', name: 'Open Graph Generator', desc: 'Social meta tags', category: 'generators', keywords: ['opengraph', 'facebook', 'social'], url: 'seo-tools/open-graph-generator.html', popular: true },
      { id: 'alt-text-generator', name: 'Alt Text Generator', desc: 'Generate image alt text', category: 'generators', keywords: ['alt', 'text', 'image', 'seo'], url: 'seo-tools/alt-text-generator.html', popular: true },

      // VALIDATION (4)
      { id: 'meta-title-checker', name: 'Meta Title Checker', desc: 'Check meta titles', category: 'validation', keywords: ['meta', 'title', 'check', 'length'], url: 'seo-tools/meta-title-checker.html' },
      { id: 'meta-description-checker', name: 'Meta Description Checker', desc: 'Check meta descriptions', category: 'validation', keywords: ['meta', 'description', 'check'], url: 'seo-tools/meta-description-checker.html' },
      { id: 'seo-url-checker', name: 'SEO URL Checker', desc: 'Analyze URL structure', category: 'validation', keywords: ['url', 'seo', 'check', 'slug'], url: 'seo-tools/seo-url-checker.html', popular: true },
      { id: 'slug-generator', name: 'Slug Generator', desc: 'Generate SEO-friendly slugs', category: 'validation', keywords: ['slug', 'url', 'generate', 'seo'], url: 'seo-tools/slug-generator.html' },

      // UTILITIES (2)
      { id: 'stop-words-remover', name: 'Stop Words Remover', desc: 'Remove common stop words', category: 'utilities', keywords: ['stop', 'words', 'remove', 'filter'], url: 'seo-tools/stop-words-remover.html' },
      { id: 'keyword-case-converter', name: 'Keyword Case Converter', desc: 'Convert keyword case', category: 'utilities', keywords: ['keyword', 'case', 'convert'], url: 'seo-tools/keyword-case-converter.html' }
    ]
  },


  docTools: {
    id: 'doc-tools',
    name: 'Document Tools',
    icon: '📂',
    color: '#009688',
    count: 11,
    tools: [
      // VIEWERS (3)
      { id: 'word-viewer', name: 'Word Viewer', desc: 'View DOCX online', category: 'viewers', keywords: ['word', 'docx', 'view', 'open'], url: 'doc-tools/word-viewer.html' },
      { id: 'excel-viewer', name: 'Excel Viewer', desc: 'View XLS/XLSX files', category: 'viewers', keywords: ['excel', 'xlsx', 'view', 'open'], url: 'doc-tools/excel-viewer.html', recent: true },
      { id: 'csv-viewer', name: 'CSV Viewer', desc: 'View CSV files online', category: 'viewers', keywords: ['csv', 'view', 'read', 'open'], url: 'doc-tools/csv-viewer.html', new: true },
      { id: 'text-file-viewer', name: 'Text File Viewer', desc: 'View text files', category: 'viewers', keywords: ['text', 'file', 'view', 'txt'], url: 'doc-tools/text-viewer.html' },

      // EDITING (2)
      { id: 'online-notepad', name: 'Online Notepad', desc: 'Take notes online', category: 'editing', keywords: ['notepad', 'notes', 'text', 'write'], url: 'doc-tools/online-notepad.html', popular: true },
      { id: 'excel-editor', name: 'Excel Editor', desc: 'Edit spreadsheets online', category: 'editing', keywords: ['excel', 'edit', 'spreadsheet'], url: 'doc-tools/excel-editor.html' },

      // UTILITIES (6)
      { id: 'document-signer', name: 'Document Signer', desc: 'Add digital signature', category: 'utilities', keywords: ['sign', 'signature', 'digital'], url: 'doc-tools/document-signer.html', popular: true },
      { id: 'document-scanner', name: 'Document Scanner', desc: 'Scan documents', category: 'utilities', keywords: ['scan', 'document', 'camera'], url: 'doc-tools/document-scanner.html' },
      { id: 'document-compressor', name: 'Document Compressor', desc: 'Compress documents', category: 'utilities', keywords: ['compress', 'document', 'reduce'], url: 'doc-tools/document-compressor.html' },
      { id: 'document-merger', name: 'Document Merger', desc: 'Merge documents', category: 'utilities', keywords: ['merge', 'combine', 'document'], url: 'doc-tools/document-merger.html' },
      { id: 'document-compare', name: 'Document Compare Tool', desc: 'Compare documents', category: 'utilities', keywords: ['compare', 'diff', 'document'], url: 'doc-tools/document-compare.html' },
      { id: 'document-repair', name: 'Document Repair Tool', desc: 'Repair corrupted files', category: 'utilities', keywords: ['repair', 'fix', 'corrupted'], url: 'doc-tools/document-repair.html' }
    ]
  },

  pdfTools: {
    id: 'pdf-tools',
    name: 'PDF Tools',
    icon: '📕',
    color: '#E91E63', // Premium Pink-Red
    count: 35,
    tools: [
      // OPTIMIZER (10)
      { id: 'compress-pdf', name: 'Compress PDF', desc: 'Optimize PDF size without losing quality', category: 'optimizer', keywords: ['pdf', 'compress', 'reduce', 'size'], url: 'pdf-tools/compress-pdf.html', popular: true, trending: true },
      { id: 'compress-pdf-50kb', name: 'Compress PDF to 50KB', desc: 'Aggressive compression to 50KB', category: 'optimizer', keywords: ['pdf', 'compress', '50kb'], url: 'pdf-tools/compress-pdf-50kb.html' },
      { id: 'compress-pdf-100kb', name: 'Compress PDF to 100KB', desc: 'Balanced compression to 100KB', category: 'optimizer', keywords: ['pdf', 'compress', '100kb'], url: 'pdf-tools/compress-pdf-100kb.html' },
      { id: 'compress-pdf-150kb', name: 'Compress PDF to 150KB', desc: 'Custom target size compression', category: 'optimizer', keywords: ['pdf', 'compress', '150kb'], url: 'pdf-tools/compress-pdf-150kb.html' },
      { id: 'compress-pdf-200kb', name: 'Compress PDF to 200KB', desc: 'High quality threshold compression', category: 'optimizer', keywords: ['pdf', 'compress', '200kb'], url: 'pdf-tools/compress-pdf-200kb.html' },
      { id: 'resize-pdf-200kb', name: 'Resize PDF to 200KB', desc: 'Iterative resizing to exact limit', category: 'optimizer', keywords: ['pdf', 'resize', '200kb'], url: 'pdf-tools/resize-pdf-200kb.html' },
      { id: 'compress-pdf-300kb', name: 'Compress PDF to 300KB', desc: 'Optimized for email attachments', category: 'optimizer', keywords: ['pdf', 'compress', '300kb'], url: 'pdf-tools/compress-pdf-300kb.html' },
      { id: 'compress-pdf-500kb', name: 'Compress PDF to 500KB', desc: 'Standard business optimization', category: 'optimizer', keywords: ['pdf', 'compress', '500kb'], url: 'pdf-tools/compress-pdf-500kb.html' },
      { id: 'compress-pdf-1mb', name: 'Compress PDF to 1MB', desc: 'Retain maximum visual fidelity', category: 'optimizer', keywords: ['pdf', 'compress', '1mb'], url: 'pdf-tools/compress-pdf-1mb.html' },
      { id: 'compress-pdf-2mb', name: 'Compress PDF to 2MB', desc: 'Professional quality preservation', category: 'optimizer', keywords: ['pdf', 'compress', '2mb'], url: 'pdf-tools/compress-pdf-2mb.html' },

      // CONVERTER - TO PDF (9)
      { id: 'word-to-pdf', name: 'Word to PDF', desc: 'Convert DOCX to high-quality PDF', category: 'converter', keywords: ['word', 'pdf', 'convert', 'docx'], url: 'pdf-tools/word-to-pdf.html', popular: true, trending: true },
      { id: 'jpg-to-pdf', name: 'JPG to PDF', desc: 'Convert images to PDF sequence', category: 'converter', keywords: ['jpg', 'pdf', 'images'], url: 'pdf-tools/jpg-to-pdf.html', popular: true },
      { id: 'ppt-to-pdf', name: 'PowerPoint to PDF', desc: 'Slides to PDF with notes', category: 'converter', keywords: ['ppt', 'pdf', 'slides'], url: 'pdf-tools/ppt-to-pdf.html' },
      { id: 'excel-to-pdf', name: 'Excel to PDF', desc: 'Convert spreadsheets to PDF', category: 'converter', keywords: ['excel', 'pdf', 'xlsx'], url: 'pdf-tools/excel-to-pdf.html' },
      { id: 'gif-to-pdf', name: 'GIF to PDF', desc: 'Convert animated GIF to pages', category: 'converter', keywords: ['gif', 'pdf', 'animate'], url: 'pdf-tools/gif-to-pdf.html' },
      { id: 'bmp-to-pdf', name: 'BMP to PDF', desc: 'Bitmap image to PDF converter', category: 'converter', keywords: ['bmp', 'pdf'], url: 'pdf-tools/bmp-to-pdf.html' },
      { id: 'tiff-to-pdf', name: 'TIFF to PDF', desc: 'Multi-page TIFF to PDF', category: 'converter', keywords: ['tiff', 'pdf'], url: 'pdf-tools/tiff-to-pdf.html' },
      { id: 'png-to-pdf', name: 'PNG to PDF', desc: 'Convert PNG with transparency', category: 'converter', keywords: ['png', 'pdf'], url: 'pdf-tools/png-to-pdf.html' },
      { id: 'svg-to-pdf', name: 'SVG to PDF', desc: 'Vector SVG to PDF converter', category: 'converter', keywords: ['svg', 'pdf'], url: 'pdf-tools/svg-to-pdf.html' },

      // CONVERTER - FROM PDF (9)
      { id: 'pdf-to-word', name: 'PDF to Word', desc: 'Convert PDF back to editable DOCX', category: 'converter', keywords: ['pdf', 'word', 'ocr'], url: 'pdf-tools/pdf-to-word.html', popular: true },
      { id: 'pdf-to-jpg', name: 'PDF to JPG', desc: 'Extract pages as JPG images', category: 'converter', keywords: ['pdf', 'jpg', 'images'], url: 'pdf-tools/pdf-to-jpg.html', popular: true },
      { id: 'pdf-to-bmp', name: 'PDF to BMP', desc: 'Convert pages to BMP format', category: 'converter', keywords: ['pdf', 'bmp'], url: 'pdf-tools/pdf-to-bmp.html' },
      { id: 'pdf-to-tiff', name: 'PDF to TIFF', desc: 'Save PDF as multi-page TIFF', category: 'converter', keywords: ['pdf', 'tiff'], url: 'pdf-tools/pdf-to-tiff.html' },
      { id: 'pdf-to-svg', name: 'PDF to SVG', desc: 'Convert PDF to scalable vectors', category: 'converter', keywords: ['pdf', 'svg'], url: 'pdf-tools/pdf-to-svg.html' },
      { id: 'pdf-to-png', name: 'PDF to PNG', desc: 'High-res extraction to PNG', category: 'converter', keywords: ['pdf', 'png'], url: 'pdf-tools/pdf-to-png.html' },
      { id: 'pdf-to-excel', name: 'PDF to Excel', desc: 'Extract PDF tables to XLSX', category: 'converter', keywords: ['pdf', 'excel', 'extract', 'tables'], url: 'pdf-tools/pdf-to-excel.html' },
      { id: 'pdf-to-zip', name: 'PDF to ZIP', desc: 'Package PDF pages into ZIP', category: 'converter', keywords: ['pdf', 'zip', 'package'], url: 'pdf-tools/pdf-to-zip.html' },

      // MANAGEMENT (7)
      { id: 'merge-pdf', name: 'Merge PDF', desc: 'Combine multiple PDFs into one', category: 'management', keywords: ['merge', 'combine', 'pdf'], url: 'pdf-tools/merge-pdf.html', popular: true, trending: true },
      { id: 'split-pdf', name: 'Split PDF', desc: 'Split PDF into separate files', category: 'management', keywords: ['split', 'extract', 'pdf'], url: 'pdf-tools/split-pdf.html', popular: true },
      { id: 'rotate-pdf', name: 'Rotate PDF', desc: 'Rotate specific PDF pages', category: 'management', keywords: ['rotate', 'orientation', 'pdf'], url: 'pdf-tools/rotate-pdf.html' },
      { id: 'delete-pdf-pages', name: 'Delete Pages From PDF', desc: 'Remove unwanted pages easily', category: 'management', keywords: ['delete', 'remove', 'pdf'], url: 'pdf-tools/delete-pdf-pages.html' },
      { id: 'pdf-page-remover', name: 'PDF Page Remover', desc: 'Visual interface for page deletion', category: 'management', keywords: ['remover', 'visual', 'pdf'], url: 'pdf-tools/pdf-page-remover.html' },
      { id: 'watermark-pdf', name: 'Watermark PDF', desc: 'Add text/image watermarks', category: 'management', keywords: ['watermark', 'label', 'pdf'], url: 'pdf-tools/watermark-pdf.html' },

      // SECURITY (3)
      { id: 'lock-pdf', name: 'Lock PDF', desc: 'Add password & permissions', category: 'security', keywords: ['lock', 'password', 'encrypt', 'pdf'], url: 'pdf-tools/lock-pdf.html' },
      { id: 'unlock-pdf', name: 'Unlock PDF', desc: 'Remove PDF restrictions', category: 'security', keywords: ['unlock', 'password', 'decrypt', 'pdf'], url: 'pdf-tools/unlock-pdf.html' },
      { id: 'remove-pdf-password', name: 'Remove Password From PDF', desc: 'Permanent password removal', category: 'security', keywords: ['remove', 'password', 'pdf'], url: 'pdf-tools/remove-pdf-password.html' }
    ]
  },

  textTools: {
    id: 'text-tools',
    name: 'Text & Writing',
    icon: '📝',
    color: '#FF9800',
    count: 20,
    tools: [
      // TEXT TRANSFORM (6)
      { id: 'text-case-changer', name: 'Text Case Changer', desc: 'Change text case', category: 'transform', keywords: ['case', 'uppercase', 'lowercase', 'convert'], url: 'text-tools/text-case-changer.html', popular: true },
      { id: 'reverse-text', name: 'Reverse Text Generator', desc: 'Flip text backwards', category: 'transform', keywords: ['reverse', 'flip', 'backwards'], url: 'text-tools/reverse-text-generator.html', popular: true },
      { id: 'bold-text', name: 'Bold Text Generator', desc: 'Create bold text', category: 'transform', keywords: ['bold', 'strong', 'text'], url: 'text-tools/bold-text-generator.html', popular: true },
      { id: 'small-caps', name: 'Small Caps Generator', desc: 'Generate small caps', category: 'transform', keywords: ['small', 'caps', 'text'], url: 'text-tools/small-caps-generator.html' },
      { id: 'upside-down-text', name: 'Upside Down Text Generator', desc: 'Flip text upside down', category: 'transform', keywords: ['upside', 'down', 'flip'], url: 'text-tools/upside-down-text.html' },
      { id: 'small-text', name: 'Small Text Generator', desc: 'Generate tiny text', category: 'transform', keywords: ['small', 'tiny', 'text'], url: 'text-tools/small-text-generator.html', popular: true },

      // WRITING ASSIST (5)
      { id: 'paraphrasing-tool', name: 'Paraphrasing Tool', desc: 'Rewrite sentences', category: 'writing', keywords: ['paraphrase', 'rewrite', 'rephrase'], url: 'text-tools/paraphrasing-tool.html', popular: true, trending: true },
      { id: 'rewriter-tool', name: 'Rewriter Tool', desc: 'Rewrite content', category: 'writing', keywords: ['rewrite', 'content', 'article'], url: 'text-tools/rewriter-tool.html' },
      { id: 'paragraph-rephraser', name: 'Paragraph Rephraser', desc: 'Rephrase paragraphs', category: 'writing', keywords: ['paragraph', 'rephrase', 'rewrite'], url: 'text-tools/paragraph-rephraser.html' },
      { id: 'word-changer', name: 'Word Changer', desc: 'Find synonyms', category: 'writing', keywords: ['word', 'synonym', 'change'], url: 'text-tools/word-changer.html', popular: true },
      { id: 'text-summarizer', name: 'Text Summarizer', desc: 'Summarize articles', category: 'writing', keywords: ['summarize', 'summary', 'shorten'], url: 'text-tools/text-summarizer.html', recent: true },

      // CHECKING (3)
      { id: 'sentence-checker', name: 'Sentence Checker', desc: 'Improve sentences', category: 'checking', keywords: ['sentence', 'check', 'grammar'], url: 'text-tools/sentence-checker.html', popular: true },
      { id: 'spell-checker', name: 'Spell Checker', desc: 'Fix spelling errors', category: 'checking', keywords: ['spell', 'check', 'spelling'], url: 'text-tools/spell-checker.html', popular: true },
      { id: 'character-counter', name: 'Character Counter', desc: 'Count chars & words', category: 'checking', keywords: ['character', 'count', 'word'], url: 'text-tools/character-counter.html', popular: true },

      // UTILITIES (3)
      { id: 'invisible-character', name: 'Invisible Character Tool', desc: 'Generate invisible characters', category: 'utilities', keywords: ['invisible', 'character', 'blank'], url: 'text-tools/invisible-character.html' },
      { id: 'sentence-counter', name: 'Sentence Counter', desc: 'Count sentences', category: 'utilities', keywords: ['sentence', 'count'], url: 'text-tools/sentence-counter.html' },
      { id: 'line-tools', name: 'Line Tools', desc: 'Count & manipulate lines', category: 'utilities', keywords: ['line', 'count', 'tools'], url: 'text-tools/line-tools.html' },

      // NEW TOOLS REQUESTED (3)
      { id: 'text-comparator', name: 'Text Comparator', desc: 'Compare two texts for differences', category: 'utilities', keywords: ['compare', 'diff', 'text'], url: 'text-tools/text-comparator.html' },
      { id: 'text-cleaner', name: 'Text Cleaner', desc: 'Remove extra spaces and formatting', category: 'utilities', keywords: ['clean', 'format', 'text'], url: 'text-tools/text-cleaner.html' },
      { id: 'text-formatter', name: 'Text Formatter', desc: 'Format text for better readability', category: 'utilities', keywords: ['format', 'beautify', 'text'], url: 'text-tools/text-formatter.html' }
    ]
  },

  calculators: {
    id: 'calculators',
    name: 'Calculators',
    icon: '🧮',
    color: '#F44336',
    count: 17,
    tools: [
      // BASIC CALC (4)
      { id: 'simple-calculator', name: 'Simple Calculator', desc: 'Basic calculations', category: 'basic', keywords: ['calculator', 'basic', 'math'], url: 'calculator-tools/simple-calculator.html' },
      { id: 'scientific-calculator', name: 'Scientific Calculator', desc: 'Advanced math operations', category: 'basic', keywords: ['scientific', 'calculator', 'advanced'], url: 'calculator-tools/simple-calculator.html', popular: true },
      { id: 'percentage-calculator', name: 'Percentage Calculator', desc: 'Calculate percentages', category: 'basic', keywords: ['percentage', 'percent', 'calculator'], url: 'calculator-tools/percentage-calculator.html', popular: true },
      { id: 'unit-converter', name: 'Unit Converter', desc: 'Convert units', category: 'basic', keywords: ['unit', 'convert', 'measurement'], url: 'calculator-tools/unit-converter.html', popular: true },

      // FINANCE CALC (5)
      { id: 'loan-emi-calculator', name: 'Loan EMI Calculator', desc: 'Calculate loan payments', category: 'finance', keywords: ['loan', 'emi', 'payment', 'calculator'], url: 'calculator-tools/loan-emi-calculator.html', popular: true },
      { id: 'interest-calculator', name: 'Interest Calculator', desc: 'Simple & compound interest', category: 'finance', keywords: ['interest', 'compound', 'calculator'], url: 'calculator-tools/interest-calculator.html', popular: true },
      { id: 'mortgage-calculator', name: 'Mortgage Calculator', desc: 'Calculate mortgage payments', category: 'finance', keywords: ['mortgage', 'home', 'loan', 'calculator'], url: 'calculator-tools/mortgage-calculator.html' },
      { id: 'investment-calculator', name: 'Investment Calculator', desc: 'Calculate investment returns', category: 'finance', keywords: ['investment', 'return', 'calculator'], url: 'calculator-tools/investment-calculator.html' },
      { id: 'tax-calculator', name: 'Tax Calculator', desc: 'Calculate taxes', category: 'finance', keywords: ['tax', 'calculator', 'income'], url: 'calculator-tools/tax-calculator.html' },

      // DATE & TIME (3)
      { id: 'age-calculator', name: 'Age Calculator', desc: 'Calculate exact age', category: 'datetime', keywords: ['age', 'birthday', 'calculator'], url: 'calculator-tools/age-calculator.html', popular: true, trending: true },
      { id: 'date-difference-calculator', name: 'Date Difference Calculator', desc: 'Calculate date differences', category: 'datetime', keywords: ['date', 'diff', 'calculator'], url: 'calculator-tools/date-difference-calculator.html', popular: true },
      { id: 'time-calculator', name: 'Time Calculator', desc: 'Add/subtract time', category: 'datetime', keywords: ['time', 'calculator', 'duration'], url: 'calculator-tools/time-calculator.html' },

      // HEALTH CALC (2)
      { id: 'bmi-calculator', name: 'BMI Calculator', desc: 'Calculate Body Mass Index', category: 'health', keywords: ['bmi', 'body', 'mass', 'health'], url: 'calculator-tools/bmi-calculator.html', popular: true, trending: true },
      { id: 'calorie-calculator', name: 'Calorie Calculator', desc: 'Calculate daily calories', category: 'health', keywords: ['calorie', 'diet', 'calculator'], url: 'calculator-tools/calorie-calculator.html' },

      // SHOPPING CALC (3)
      { id: 'discount-calculator', name: 'Discount Calculator', desc: 'Calculate discounts', category: 'shopping', keywords: ['discount', 'sale', 'calculator'], url: 'calculator-tools/discount-calculator.html', popular: true },
      { id: 'currency-converter', name: 'Currency Converter', desc: 'Convert currencies', category: 'shopping', keywords: ['currency', 'money', 'exchange', 'convert'], url: 'calculator-tools/currency-converter.html', popular: true, trending: true },
      { id: 'tip-calculator', name: 'Tip Calculator', desc: 'Calculate tips', category: 'shopping', keywords: ['tip', 'gratuity', 'calculator'], url: '#' }
    ]
  },

  codeTools: {
    id: 'code-tools',
    name: 'Code & Formatters',
    icon: '💻',
    color: '#673AB7',
    count: 18,
    tools: [
      // MINIFIERS (4)
      { id: 'html-minifier', name: 'HTML Minifier', desc: 'Compress HTML code', category: 'minifiers', keywords: ['html', 'minify', 'compress'], url: 'code-format-tools/minifiers/html-minifier.html', popular: true, trending: true },
      { id: 'css-minifier', name: 'CSS Minifier', desc: 'Compress CSS code', category: 'minifiers', keywords: ['css', 'minify', 'compress'], url: 'code-format-tools/minifiers/css-minifier.html', popular: true },
      { id: 'js-minifier', name: 'JavaScript Minifier', desc: 'Compress JS code', category: 'minifiers', keywords: ['javascript', 'js', 'minify', 'compress'], url: 'code-format-tools/minifiers/javascript-minifier.html', popular: true },
      { id: 'code-compressor', name: 'Code Compressor (All-in-One)', desc: 'Compress any code', category: 'minifiers', keywords: ['code', 'compress', 'minify'], url: 'code-format-tools/minifiers/universal-code-compressor.html' },

      // FORMATTERS (8)
      { id: 'html-formatter', name: 'HTML Formatter', desc: 'Beautify HTML code', category: 'formatters', keywords: ['html', 'format', 'beautify'], url: 'code-format-tools/formatters/html-formatter.html', popular: true, trending: true },
      { id: 'css-beautifier', name: 'CSS Beautifier', desc: 'Format CSS code', category: 'formatters', keywords: ['css', 'beautify', 'format'], url: 'code-format-tools/formatters/css-beautifier.html', popular: true },
      { id: 'js-beautifier', name: 'JavaScript Beautifier', desc: 'Beautify JS code', category: 'formatters', keywords: ['javascript', 'js', 'beautify', 'format'], url: 'code-format-tools/formatters/javascript-beautifier.html' },
      { id: 'json-formatter', name: 'JSON Formatter', desc: 'Format & validate JSON', category: 'formatters', keywords: ['json', 'format', 'validate'], url: 'code-format-tools/formatters/json-formatter.html', popular: true, trending: true },
      { id: 'sql-formatter', name: 'SQL Formatter', desc: 'Format SQL queries', category: 'formatters', keywords: ['sql', 'format', 'query'], url: 'code-format-tools/formatters/sql-formatter.html', popular: true },
      { id: 'xml-formatter', name: 'XML Formatter', desc: 'Format XML data', category: 'formatters', keywords: ['xml', 'format'], url: 'code-format-tools/formatters/xml-formatter.html' },
      { id: 'python-formatter', name: 'Python Formatter', desc: 'Format Python code', category: 'formatters', keywords: ['python', 'format', 'pep8'], url: 'code-format-tools/formatters/python-formatter.html', popular: true },
      { id: 'code-obfuscator', name: 'Code Obfuscator', desc: 'Obfuscate code', category: 'formatters', keywords: ['obfuscate', 'protect', 'code'], url: 'code-format-tools/code-utilities/code-obfuscator.html' },

      // VALIDATORS (3)
      { id: 'css-validator', name: 'CSS Validator', desc: 'Validate CSS code', category: 'validators', keywords: ['css', 'validate', 'check'], url: 'code-format-tools/validators/css-validator.html', recent: true },
      { id: 'html-validator', name: 'HTML Validator', desc: 'Validate HTML markup', category: 'validators', keywords: ['html', 'validate', 'check'], url: '#' },
      { id: 'json-validator', name: 'JSON Validator', desc: 'Validate JSON syntax', category: 'validators', keywords: ['json', 'validate', 'check'], url: 'code-format-tools/validators/json-validator.html' },

      // VIEWERS (3)
      { id: 'html-viewer', name: 'HTML Viewer', desc: 'Preview HTML code', category: 'viewers', keywords: ['html', 'view', 'preview'], url: '#' },
      { id: 'syntax-highlighter', name: 'Syntax Highlighter', desc: 'Highlight code syntax', category: 'viewers', keywords: ['syntax', 'highlight', 'code'], url: 'code-format-tools/code-utilities/syntax-highlighter.html' },
      { id: 'code-obfuscator', name: 'Code Obfuscator', desc: 'Protect JS code from theft', category: 'viewers', keywords: ['obfuscate', 'protect', 'code'], url: 'code-format-tools/code-utilities/code-obfuscator.html' }
    ]
  },

  binaryTools: {
    id: 'binary-tools',
    name: 'Binary Tools',
    icon: '🔢',
    color: '#607D8B',
    count: 14,
    tools: [
      { id: 'binary-to-text', name: 'Binary To Text', desc: 'Convert binary code to plain text', category: 'conversion', keywords: ['binary', 'text', 'convert'], url: 'binary-tools/binary-to-text.html' },
      { id: 'binary-to-hex', name: 'Binary To HEX', desc: 'Convert binary to hexadecimal', category: 'conversion', keywords: ['binary', 'hex', 'convert'], url: 'binary-tools/binary-to-hex.html' },
      { id: 'binary-to-decimal', name: 'Binary To Decimal', desc: 'Convert binary to decimal numbers', category: 'conversion', keywords: ['binary', 'decimal', 'convert'], url: 'binary-tools/binary-to-decimal.html' },
      { id: 'binary-to-ascii', name: 'Binary To ASCII', desc: 'Convert binary to ASCII format', category: 'conversion', keywords: ['binary', 'ascii', 'convert'], url: 'binary-tools/binary-to-ascii.html' },
      { id: 'hex-to-text', name: 'HEX To TEXT', desc: 'Convert hexadecimal to plain text', category: 'conversion', keywords: ['hex', 'text', 'convert'], url: 'binary-tools/hex-to-text.html' },
      { id: 'hex-to-decimal', name: 'HEX To Decimal', desc: 'Convert hexadecimal to decimal', category: 'conversion', keywords: ['hex', 'decimal', 'convert'], url: 'binary-tools/hex-to-decimal.html' },
      { id: 'hex-to-binary', name: 'HEX To Binary', desc: 'Convert hexadecimal to binary', category: 'conversion', keywords: ['hex', 'binary', 'convert'], url: 'binary-tools/hex-to-binary.html' },
      { id: 'text-to-hex', name: 'Text to HEX', desc: 'Convert plain text to hexadecimal', category: 'conversion', keywords: ['text', 'hex', 'convert'], url: 'binary-tools/text-to-hex.html' },
      { id: 'text-to-ascii', name: 'Text to ASCII', desc: 'Convert plain text to ASCII values', category: 'conversion', keywords: ['text', 'ascii', 'convert'], url: 'binary-tools/text-to-ascii.html' },
      { id: 'text-to-binary', name: 'Text to Binary', desc: 'Convert plain text to binary code', category: 'conversion', keywords: ['text', 'binary', 'convert'], url: 'binary-tools/text-to-binary.html' },
      { id: 'ascii-to-binary', name: 'ASCII To Binary', desc: 'Convert ASCII values to binary', category: 'conversion', keywords: ['ascii', 'binary', 'convert'], url: 'binary-tools/ascii-to-binary.html' },
      { id: 'ascii-to-text', name: 'ASCII To Text', desc: 'Convert ASCII values to plain text', category: 'conversion', keywords: ['ascii', 'text', 'convert'], url: 'binary-tools/ascii-to-text.html' },
      { id: 'decimal-to-binary', name: 'Decimal To Binary', desc: 'Convert decimal number to binary', category: 'conversion', keywords: ['decimal', 'binary', 'convert'], url: 'binary-tools/decimal-to-binary.html' },
      { id: 'decimal-to-hex', name: 'Decimal To HEX', desc: 'Convert decimal number to hexadecimal', category: 'conversion', keywords: ['decimal', 'hex', 'convert'], url: 'binary-tools/decimal-to-hex.html' }
    ]
  },
  otherTools: {
    id: 'other-tools',
    name: 'Other Tools',
    icon: '⚒️',
    color: '#9E9E9E',
    count: 4,
    tools: [
      { id: 'random-name-generator', name: 'Random Name Generator', desc: 'Generate multi-cultural names with identity presets', category: 'generators', keywords: ['name', 'random', 'identity', 'fake'], url: 'other-tools/random-name-generator.html', popular: true },
      { id: 'random-id-generator', name: 'Random ID Card Generator', desc: 'Generate virtual IDs with photos and QR codes', category: 'generators', keywords: ['id', 'card', 'identity', 'virtual'], url: 'other-tools/random-id-generator.html' },
      { id: 'fake-address-generator', name: 'Fake Address Generator', desc: 'Create realistic addresses for any country', category: 'generators', keywords: ['address', 'fake', 'location', 'test'], url: 'other-tools/fake-address-generator.html' },
      { id: 'fake-number-generator', name: 'Fake Number Generator', desc: 'Generate valid-format phone numbers globally', category: 'generators', keywords: ['number', 'phone', 'fake', 'test'], url: 'other-tools/fake-number-generator.html' }
    ]
  }
};

// Helper functions
const getAllTools = () => {
  const allTools = [];
  Object.values(TOOLS_DATA).forEach(category => {
    category.tools.forEach(tool => {
      allTools.push({
        ...tool,
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color
      });
    });
  });
  return allTools;
};

const getPopularTools = () => {
  return getAllTools().filter(tool => tool.popular === true);
};

const getTrendingTools = () => {
  return getAllTools().filter(tool => tool.trending === true);
};

const getRecentTools = () => {
  return getAllTools().filter(tool => tool.recent === true);
};

const searchTools = (query) => {
  const lowerQuery = query.toLowerCase();
  return getAllTools().filter(tool => {
    return tool.name.toLowerCase().includes(lowerQuery) ||
      tool.desc.toLowerCase().includes(lowerQuery) ||
      tool.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery));
  });
};

const getToolsByCategory = (categoryId) => {
  return TOOLS_DATA[categoryId]?.tools || [];
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TOOLS_DATA,
    getAllTools,
    getPopularTools,
    getTrendingTools,
    getRecentTools,
    searchTools,
    getToolsByCategory
  };
}
