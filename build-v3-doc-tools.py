#!/usr/bin/env python3
"""TOOLSHUB v3 — rebuild 13 doc-tools pages from scratch.

Reads original pages in ~/workspace/toolshub/doc-tools/, extracts:
  - <title>, meta description
  - tool workspace HTML (main.tool-main or div.tu-workspace), IDs preserved
  - CDN lib <script src>s (drops old design-system js: th-interactions.js, tu-unified.js)
  - inline tool <script> (verbatim)
  - steps (.tu-steps), FAQ (.tu-faq-item), SEO article (section.seo-article)
and rebuilds each page with the v3 template (v3-design.css + v3.js).
Old CSS links are dropped; a page-local <style> covers the tool UI chrome.
"""
import bs4, re, os, html

BASE = os.path.expanduser('~/workspace/toolshub/doc-tools')
ROMAN = ['i.', 'ii.', 'iii.', 'iv.', 'v.', 'vi.', 'vii.']

# ---------- minimal v3-consistent tool-UI chrome (page-local) ----------
CSS_BLOCK = """
<style>
/* ---- v3 tool workspace chrome: original tool UI, v3 styling ---- */
.ws-dropzone{border:2px dashed #c7d2fe;border-radius:16px;padding:52px 32px;text-align:center;background:#fafaff;transition:.2s;cursor:pointer}
.ws-dropzone:hover,.ws-dropzone.dragover{border-color:#4f46e5;background:#eef2ff}
.dz-icon{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;display:grid;place-items:center;font-size:1.9rem;margin:0 auto 18px}
.doc-upload-title{font-size:1.3rem;font-weight:700;letter-spacing:-.02em;margin-bottom:10px}
.doc-upload-subtitle{color:#3f3f46;margin-bottom:22px;font-size:.95rem}
.doc-upload-formats{color:#71717a;font-size:.82rem;margin-top:16px}
.ws-body input[type="text"],.ws-body input[type="number"],.ws-body input[type="password"],.ws-body select,.ws-body textarea:not(.ws-textarea),.doc-settings-select,.cv-form-input,.cv-form-select,.cv-form-textarea,.form-control,.formula-input{width:100%;border:1.5px solid #e4e4e7;border-radius:12px;padding:11px 14px;font-size:.92rem;font-family:Inter,system-ui,sans-serif;background:#fff;color:#0a0a0b;outline:none;transition:.2s}
.ws-body input:focus,.ws-body select:focus,.ws-body textarea:focus{border-color:#4f46e5;box-shadow:0 0 0 4px rgba(79,70,229,.08)}
input[type="range"],.doc-settings-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:99px;background:#e4e4e7;outline:none;padding:0;border:none}
input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#4f46e5;cursor:pointer}
input[type="checkbox"]{width:18px;height:18px;accent-color:#4f46e5}
.doc-settings-panel{background:#fafafa;border:1px solid #e4e4e7;border-radius:16px;padding:26px;margin-top:24px}
.doc-settings-title{font-weight:700;font-size:.95rem;margin-bottom:18px}
.doc-settings-group{margin-bottom:14px}
.doc-settings-label{display:block;font-size:.82rem;font-weight:600;color:#3f3f46;margin-bottom:8px}
.doc-settings-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;font-size:.9rem}
.doc-toggle-switch,.toggle-switch,.toggle-slider{width:44px;height:24px;border-radius:99px;background:#d4d4d8;position:relative;cursor:pointer;transition:.2s;flex-shrink:0}
.doc-toggle-switch::after,.toggle-switch::after,.toggle-slider::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.doc-toggle-switch.active,.toggle-switch.active,.toggle-slider.active,.toggle-switch.on{background:#4f46e5}
.doc-toggle-switch.active::after,.toggle-switch.active::after,.toggle-slider.active::after{left:23px}
.doc-preview-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.doc-toolbar-divider{width:1px;height:24px;background:#e4e4e7}
.doc-action-bar{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap}
.doc-stats-bar{display:grid;gap:12px;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:18px;margin-top:16px}
.doc-stat-item{text-align:center}
.doc-stat-value,.stat-value{display:block;font-size:1.6rem;font-weight:700;letter-spacing:-.02em}
.doc-stat-label{font-size:.72rem;color:#71717a;text-transform:uppercase;letter-spacing:.05em;font-weight:600}
.spreadsheet-wrapper{overflow:auto;border:1px solid #e4e4e7;border-radius:12px;max-height:440px;margin-top:16px;background:#fff}
.spreadsheet-table{border-collapse:collapse;font-size:.85rem;min-width:100%}
.spreadsheet-table th,.spreadsheet-table td{border:1px solid #e4e4e7;padding:8px 12px;white-space:nowrap}
.spreadsheet-table thead th{background:#f4f4f5;font-weight:600;position:sticky;top:0;cursor:pointer;z-index:1}
.spreadsheet-table td.cell-selected{background:#eef2ff}
.compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.compare-pane{border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;background:#fff}
.pane-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #f4f4f5;background:#fafafa}
.pane-content{min-height:240px;padding:24px}
.compare-placeholder{border:2px dashed #d4d4d8;border-radius:12px;padding:52px 20px;text-align:center;color:#71717a;cursor:pointer;transition:.2s}
.compare-placeholder:hover{border-color:#4f46e5;background:#fafaff}
.doc-main-area{margin-bottom:8px}
.doc-preview-area{margin-top:16px}
.doc-tool-container{display:flex;flex-direction:column;gap:8px}
.modal{display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.5);align-items:center;justify-content:center}
.modal.open,.modal.show{display:flex}
.modal-content{background:#fff;border-radius:20px;max-width:580px;width:calc(100% - 40px);max-height:86vh;overflow:auto;box-shadow:0 24px 64px -12px rgba(0,0,0,.3)}
.modal-header,.modal-footer{padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.modal-title{font-size:1.05rem;font-weight:700}
.modal-body{padding:0 24px 24px}
.filter-btn,.format-option{border:1.5px solid #e4e4e7;background:#fff;border-radius:12px;padding:10px 18px;font-size:.88rem;font-weight:600;cursor:pointer;font-family:Inter,system-ui,sans-serif;transition:.15s}
.filter-btn.active,.format-option.selected,.format-option.active{border-color:#4f46e5;background:#eef2ff;color:#4f46e5}
.merger-list,.file-list{display:flex;flex-direction:column;gap:10px;margin-top:16px}
.option-label{font-size:.85rem;font-weight:600;color:#3f3f46}
.scanner-viewport{position:relative;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;background:#111;min-height:280px;display:grid;place-items:center;color:#71717a}
.scan-overlay{position:absolute;inset:0;pointer-events:none}
.scanning-line{position:absolute;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#4f46e5,transparent);animation:scanline 2s linear infinite}
@keyframes scanline{0%{top:0}100%{top:100%}}
.image-preview-container img{max-width:100%;border-radius:12px;display:block}
.signature-canvas-wrapper{border:1.5px solid #e4e4e7;border-radius:12px;background:#fff;overflow:hidden}
.signature-canvas-wrapper canvas{max-width:100%;display:block;touch-action:none}
.pages-strip{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
.editor-toolbar{display:flex;flex-wrap:wrap;gap:6px;padding:12px;border:1px solid #e4e4e7;border-bottom:none;border-radius:16px 16px 0 0;background:#fafafa}
.toolbar-group{display:flex;gap:2px;padding-right:8px;margin-right:6px;border-right:1px solid #e4e4e7}
.toolbar-group:last-child{border-right:none}
.icon-btn{min-width:34px;height:34px;border:none;background:transparent;border-radius:8px;cursor:pointer;color:#3f3f46;font-size:.9rem;display:inline-flex;align-items:center;justify-content:center}
.icon-btn:hover,.icon-btn.active{background:#e4e4e7}
.editor-area{min-height:320px;border:1px solid #e4e4e7;border-radius:0 0 16px 16px;padding:20px;background:#fff;outline:none;font-size:1rem;line-height:1.7}
.status-bar{display:flex;gap:20px;flex-wrap:wrap;margin-top:14px;font-size:.82rem;color:#71717a}
.notepad-container{background:#fff;border:1px solid #e4e4e7;border-radius:16px}
.notepad-header{display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid #f4f4f5;font-weight:700}
.panel-section{padding:16px 0;border-top:1px solid #f4f4f5}
.panel-title{font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#71717a;margin-bottom:10px}
.editor-main{display:flex;gap:20px}
.side-panel{width:280px;flex-shrink:0}
.saving-badge{font-size:.75rem;color:#22c55e;font-weight:600}
.color-palette{display:flex;gap:8px;flex-wrap:wrap}
.color-option,.cv-color-option{width:36px;height:36px;border-radius:50%;cursor:pointer;border:2px solid #fff;box-shadow:0 0 0 1px #e4e4e7}
.color-option.selected,.cv-color-option.selected{box-shadow:0 0 0 2px #4f46e5}
.theme-options{display:flex;gap:10px;flex-wrap:wrap}
.theme-option{border:1.5px solid #e4e4e7;border-radius:12px;padding:10px 16px;cursor:pointer;font-size:.85rem;font-weight:600}
.theme-option.active{border-color:#4f46e5;background:#eef2ff}
.code-editor{border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;background:#fff}
.code-header{display:flex;align-items:center;gap:8px;padding:10px 16px;background:#f4f4f5;font-size:.82rem;font-weight:600}
.code-body{display:flex}
.line-numbers{padding:16px 12px;background:#fafafa;color:#a1a1aa;font-size:.85rem;text-align:right;user-select:none;font-family:monospace}
.code-content{flex:1;padding:16px;font-size:.9rem;font-family:monospace;white-space:pre;overflow:auto}
.cv-form-section{background:#fff;border:1px solid #e4e4e7;border-radius:16px;margin-bottom:16px;overflow:hidden}
.cv-section-header{padding:18px 24px;cursor:pointer;display:flex;align-items:center;justify-content:space-between}
.cv-section-title{font-size:1rem;font-weight:700}
.cv-section-content{padding:4px 24px 24px}
.cv-form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cv-form-group{margin-bottom:14px}
.cv-form-label{display:block;font-size:.82rem;font-weight:600;margin-bottom:6px;color:#3f3f46}
.cv-wizard-steps{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}
.cv-wizard-step{display:flex;align-items:center;gap:10px;padding:10px 16px;border:1px solid #e4e4e7;border-radius:99px;font-size:.85rem;font-weight:600;background:#fff}
.cv-wizard-step.active{background:#0a0a0b;color:#fff;border-color:#0a0a0b}
.cv-wizard-step-number{width:26px;height:26px;border-radius:50%;background:#e4e4e7;display:grid;place-items:center;font-size:.75rem;font-weight:700}
.cv-wizard-step.active .cv-wizard-step-number{background:#4f46e5;color:#fff}
.cv-industry-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}
.cv-industry-card{border:1.5px solid #e4e4e7;border-radius:14px;padding:22px 12px;text-align:center;cursor:pointer;transition:.15s;background:#fff}
.cv-industry-card:hover{border-color:#c7d2fe}
.cv-industry-card.selected{border-color:#4f46e5;background:#eef2ff}
.cv-industry-icon{font-size:1.6rem;margin-bottom:10px}
.cv-industry-name{font-size:.85rem;font-weight:600}
.cv-input-methods{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.cv-input-card{border:1.5px solid #e4e4e7;border-radius:14px;padding:22px;cursor:pointer;transition:.15s;background:#fff}
.cv-input-card:hover{border-color:#4f46e5;transform:translateY(-2px)}
.cv-input-icon{font-size:1.5rem;margin-bottom:10px}
.cv-input-title{font-weight:700;margin-bottom:6px}
.cv-input-desc{font-size:.85rem;color:#71717a}
.cv-export-options{display:flex;gap:12px;flex-wrap:wrap}
.cv-export-btn{display:flex;align-items:center;gap:10px;border:1.5px solid #e4e4e7;border-radius:14px;padding:16px 20px;background:#fff;cursor:pointer;font-weight:600;font-size:.9rem;transition:.15s}
.cv-export-btn:hover{border-color:#4f46e5}
.cv-color-schemes{display:flex;gap:10px;flex-wrap:wrap}
.cv-template-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px}
.cv-preview-container{border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;background:#fff;padding:24px}
.cv-ats-meter{height:10px;border-radius:99px;background:#f4f4f5;overflow:hidden;margin:10px 0}
.cv-ats-fill{height:100%;background:linear-gradient(90deg,#4f46e5,#7c3aed);border-radius:99px;transition:.5s}
.cv-progress{height:8px;border-radius:99px;background:#f4f4f5;overflow:hidden;margin:12px 0}
.cv-progress-fill,.cv-progress-bar{height:100%;background:linear-gradient(90deg,#4f46e5,#7c3aed)}
.cv-add-entry-btn,.cv-entry-list,.cv-step-panel{margin-top:14px}
.cv-tool-card{border:1px solid #e4e4e7;border-radius:14px;overflow:hidden;background:#fff}
.cv-tool-header{padding:16px 20px;display:flex;align-items:center;gap:12px}
.cv-tool-icon{width:40px;height:40px;border-radius:12px;background:#eef2ff;color:#4f46e5;display:grid;place-items:center}
.cv-tool-title{font-weight:700}
.cv-tool-content{padding:0 20px 20px}
.cv-photo-placeholder{width:110px;height:110px;border-radius:50%;background:#f4f4f5;display:grid;place-items:center;color:#a1a1aa;font-size:2rem;margin:0 auto 12px}
.repair-status-box,.ocr-result,.compress-info{border:1px solid #e4e4e7;border-radius:12px;padding:18px;background:#fafafa;margin-top:16px;font-size:.92rem}
.format-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
.format-section{margin-bottom:18px}
.section-title{font-weight:700;margin-bottom:10px}
.quick-actions{display:flex;gap:10px;flex-wrap:wrap}
.quick-action-btn,.account-btns button{border:1px solid #e4e4e7;background:#fff;border-radius:10px;padding:9px 16px;font-size:.85rem;font-weight:600;cursor:pointer}
.quick-action-btn:hover{border-color:#4f46e5}
.filename{font-weight:600;font-size:.9rem}
.dots{display:flex;gap:6px}
.dot{width:10px;height:10px;border-radius:50%;background:#d4d4d8}
.dot.red{background:#ef4444}.dot.yellow{background:#eab308}.dot.green{background:#22c55e}
.toc-sidebar{background:#fafafa;border:1px solid #e4e4e7;border-radius:12px;padding:16px;font-size:.88rem}
#toc-list{list-style:none;margin:0}
#toc-list li{padding:6px 0;cursor:pointer}
#toc-list li:hover{color:#4f46e5}
#word-content{background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:32px;min-height:300px;line-height:1.8}
.doc-preview-content{margin-top:8px}
.chart-modal canvas{max-width:100%}
.size-box{text-align:center;padding:14px;border:1px solid #e4e4e7;border-radius:12px;background:#fff}
.size-label{font-size:.75rem;color:#71717a;text-transform:uppercase;letter-spacing:.05em}
.size-value{font-size:1.4rem;font-weight:700}
@media(max-width:700px){.compare-grid,.cv-form-row,.editor-main{grid-template-columns:1fr;flex-direction:column}.side-panel{width:100%}.ws-dropzone{padding:36px 20px}}
</style>
"""

# ---------- per-page metadata ----------
ICON = {
 'csv-viewer.html': 'fa-file-excel',
 'cv-builder.html': 'fa-id-card',
 'document-compare.html': 'fa-code-compare',
 'document-compressor.html': 'fa-compress',
 'document-merger.html': 'fa-layer-group',
 'document-repair.html': 'fa-screwdriver-wrench',
 'document-scanner.html': 'fa-camera',
 'document-signer.html': 'fa-pen-nib',
 'excel-editor.html': 'fa-file-excel',
 'excel-viewer.html': 'fa-file-excel',
 'online-notepad.html': 'fa-note-sticky',
 'text-viewer.html': 'fa-file-lines',
 'word-viewer.html': 'fa-file-word',
}
SHORT = {
 'csv-viewer.html': 'CSV Viewer',
 'cv-builder.html': 'CV Builder',
 'document-compare.html': 'Document Compare',
 'document-compressor.html': 'Document Compressor',
 'document-merger.html': 'Document Merger',
 'document-repair.html': 'Document Repair',
 'document-scanner.html': 'Document Scanner',
 'document-signer.html': 'Document Signer',
 'excel-editor.html': 'Excel Editor',
 'excel-viewer.html': 'Excel Viewer',
 'online-notepad.html': 'Online Notepad',
 'text-viewer.html': 'Text Viewer',
 'word-viewer.html': 'Word Viewer',
}
H1 = {
 'csv-viewer.html': 'Read CSV files, <em>instantly.</em>',
 'cv-builder.html': 'Build your CV, <em>beautifully.</em>',
 'document-compare.html': 'Spot every difference, <em>instantly.</em>',
 'document-compressor.html': 'Shrink documents, <em>effortlessly.</em>',
 'document-merger.html': 'Merge files into one, <em>in seconds.</em>',
 'document-repair.html': 'Recover broken files, <em>free.</em>',
 'document-scanner.html': 'Scan & digitize, <em>anywhere.</em>',
 'document-signer.html': 'Sign documents, <em>digitally.</em>',
 'excel-editor.html': 'Edit spreadsheets, <em>online.</em>',
 'excel-viewer.html': 'Open Excel files, <em>no Excel needed.</em>',
 'online-notepad.html': 'A notepad that <em>does more.</em>',
 'text-viewer.html': 'Read any text file, <em>beautifully.</em>',
 'word-viewer.html': 'Open Word docs, <em>no Office needed.</em>',
}
DECK = {
 'csv-viewer.html': "Your spreadsheet data, safe from Excel's helpful mangling.",
 'cv-builder.html': 'Beat the bots, impress the humans.',
 'document-compare.html': 'Never miss a changed word again.',
 'document-compressor.html': 'Smaller files, same documents.',
 'document-merger.html': 'One file to rule them all.',
 'document-repair.html': "Don't give up on that file just yet.",
 'document-scanner.html': 'Your camera is now a document scanner.',
 'document-signer.html': 'Sign on the dotted line — digitally.',
 'excel-editor.html': 'A spreadsheet editor that lives in your browser.',
 'excel-viewer.html': 'Excel files, minus Excel.',
 'online-notepad.html': 'A notepad that remembers everything.',
 'text-viewer.html': 'Read anything, understand everything.',
 'word-viewer.html': 'Word documents, no Word required.',
}
NOTEPAD_DESC = 'Free online notepad with rich text editing, autosave, and one-click export — everything runs in your browser.'
REL_DESC = {
 'csv-viewer.html': 'View CSVs as clean tables.',
 'cv-builder.html': 'Create a job-winning resume.',
 'document-compare.html': 'Spot differences between two documents.',
 'document-compressor.html': 'Shrink PDFs and Office documents.',
 'document-merger.html': 'Combine files into one document.',
 'document-repair.html': 'Fix corrupted documents.',
 'document-scanner.html': 'Scan pages and extract text with OCR.',
 'document-signer.html': 'Add electronic signatures to PDFs.',
 'excel-editor.html': 'Edit XLSX spreadsheets in your browser.',
 'excel-viewer.html': 'Open XLSX spreadsheets with charts.',
 'online-notepad.html': 'A notepad that saves your work automatically.',
 'text-viewer.html': 'Read TXT files with syntax highlighting.',
 'word-viewer.html': 'Open DOCX files without Microsoft Word.',
}
RELATED = {
 'csv-viewer.html': ['excel-viewer.html','document-compare.html','text-viewer.html','document-compressor.html'],
 'cv-builder.html': ['document-signer.html','online-notepad.html','word-viewer.html','text-viewer.html'],
 'document-compare.html': ['document-merger.html','document-repair.html','text-viewer.html','csv-viewer.html'],
 'document-compressor.html': ['document-merger.html','document-repair.html','document-signer.html','document-scanner.html'],
 'document-merger.html': ['document-compressor.html','document-signer.html','document-repair.html','document-scanner.html'],
 'document-repair.html': ['document-compressor.html','document-compare.html','document-merger.html','text-viewer.html'],
 'document-scanner.html': ['document-signer.html','document-compressor.html','text-viewer.html','word-viewer.html'],
 'document-signer.html': ['document-scanner.html','document-compressor.html','cv-builder.html','word-viewer.html'],
 'excel-editor.html': ['excel-viewer.html','csv-viewer.html','word-viewer.html','text-viewer.html'],
 'excel-viewer.html': ['excel-editor.html','csv-viewer.html','document-compressor.html','document-compare.html'],
 'online-notepad.html': ['text-viewer.html','word-viewer.html','cv-builder.html','document-compare.html'],
 'text-viewer.html': ['online-notepad.html','word-viewer.html','csv-viewer.html','document-compare.html'],
 'word-viewer.html': ['document-signer.html','text-viewer.html','excel-viewer.html','cv-builder.html'],
}

OLD_JS = ('th-interactions.js', 'tu-unified.js')


def esc(s):
    return html.escape(s, quote=True)


def transform_tool(root):
    """Apply v3 patterns to extracted tool HTML. root = soup element."""
    # drop old in-workspace hero
    for el in root.select('.doc-hero'):
        el.decompose()
    # upload zones -> ws-dropzone + dz-icon
    for dz in root.select('.doc-upload-section'):
        cls = dz.get('class', [])
        if 'ws-dropzone' not in cls:
            cls.append('ws-dropzone')
        dz['class'] = cls
        icon = dz.find(class_='doc-upload-icon')
        if icon is not None:
            icls = icon.get('class', [])
            if 'dz-icon' not in icls:
                icls = ['dz-icon'] + [c for c in icls if c != 'doc-upload-icon']
            icon['class'] = icls
    # buttons -> btn btn-dark / btn btn-light (keep originals as JS hooks)
    btn_targets = ('tu-btn', 'doc-upload-btn', 'doc-action-btn', 'doc-toolbar-btn',
                   'cv-btn', 'btn-primary', 'btn-secondary', 'btn-success',
                   'btn-warning', 'btn-dark', 'btn-light')
    skip = ('icon-btn', 'filter-btn', 'format-option', 'color-option',
            'cv-color-option', 'theme-option', 'quick-action-btn',
            'cv-export-btn', 'cv-industry-card')
    for b in root.find_all('button'):
        cls = b.get('class', [])
        if not any(c in btn_targets for c in cls):
            continue
        if any(c in skip for c in cls):
            continue
        dark = any('primary' in c or 'success' in c for c in cls)
        # browse/choose CTAs default dark
        if not dark and not any('secondary' in c or 'ghost' in c for c in cls):
            dark = any(c in ('doc-upload-btn', 'cv-btn') for c in cls)
        v3 = ['btn', 'btn-dark' if dark else 'btn-light']
        b['class'] = v3 + [c for c in cls if c not in ('btn', 'btn-dark', 'btn-light')]
    return root


def build_page(fname):
    raw = open(os.path.join(BASE, fname), encoding='utf-8').read()
    soup = bs4.BeautifulSoup(raw, 'html.parser')

    title = (soup.title.string or '').strip()
    desc_tag = soup.find('meta', attrs={'name': 'description'})
    desc = (desc_tag.get('content') or '').strip() if desc_tag else ''
    if not desc:
        desc = NOTEPAD_DESC

    # --- tool HTML ---
    tool = soup.find('main', class_='tool-main') or soup.find('div', class_='tu-workspace')
    assert tool is not None, 'no tool container in ' + fname
    tool = transform_tool(tool)
    tool_html = ''.join(str(c) for c in tool.children).strip()

    # --- scripts: CDN libs (drop old design-system js) ---
    cdn_head = []
    for s in soup.head.find_all('script', src=True):
        src = s.get('src', '')
        if any(o in src for o in OLD_JS):
            continue
        cdn_head.append('<script src="%s"></script>' % esc(src))
    cdn_body = []
    for s in soup.body.find_all('script', src=True):
        src = s.get('src', '')
        if any(o in src for o in OLD_JS):
            continue
        if src not in [re.search(r'src="([^"]+)"', t).group(1) for t in cdn_head]:
            cdn_body.append('<script src="%s"></script>' % esc(src))
    # --- inline tool scripts (verbatim) ---
    inline = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', raw, re.S)

    # --- steps ---
    steps_box = soup.select_one('.tu-steps')
    step_items = steps_box.select('.tu-step') if steps_box else soup.select('.tu-step')
    steps_html = ''
    for i, st in enumerate(step_items[:6]):
        h = st.find('h3').get_text(' ', strip=True) if st.find('h3') else ''
        p = st.find('p').get_text(' ', strip=True) if st.find('p') else ''
        steps_html += (
            '<div class="step"><div class="step-n">%s</div><h3>%s</h3><p>%s</p></div>'
            % (ROMAN[i], esc(h), esc(p)))

    # --- FAQ ---
    faq_html = ''
    for i, it in enumerate(soup.select('.tu-faq-item')):
        q = it.select_one('.tu-faq-q')
        a = it.select_one('.tu-faq-a')
        qtxt = q.get_text(' ', strip=True) if q else ''
        # drop the trailing chevron icon text if any (icons have no text anyway)
        atxt = ''.join(str(c) for c in a.children).strip() if a else ''
        open_cls = ' open' if i == 0 else ''
        faq_html += (
            '<div class="faq-item%s"><div class="faq-q">%s <i class="fa-solid fa-plus"></i></div>'
            '<div class="faq-a">%s</div></div>' % (open_cls, esc(qtxt), atxt))

    # --- article ---
    art_sec = soup.find('section', class_=re.compile('seo-article'))
    art = art_sec.find('article') if art_sec else None
    art_h2 = ''
    art_body = ''
    if art:
        h2 = art.find('h2')
        art_h2 = h2.get_text(' ', strip=True) if h2 else ''
        kids = list(art.children)
        seen_first_p = False
        parts = []
        for k in kids:
            name = getattr(k, 'name', None)
            if name is None:
                continue
            if name == 'h2':
                continue
            if name == 'ol':
                name = 'ul'
                k.name = 'ul'
            if name == 'p' and not seen_first_p and k.get_text(strip=True):
                seen_first_p = True
                k['class'] = (k.get('class', []) + ['lead']) if k.get('class') else ['lead']
            parts.append(str(k))
        art_body = '\n'.join(parts).strip()
    words = len(re.sub(r'<[^>]+>', ' ', art_body).split())
    read_min = max(3, words // 200)
    name = SHORT[fname]
    avatar = name[0]

    # --- related ---
    rels = []
    colors = ['#4f46e5', '#7c3aed']
    for i, r in enumerate(RELATED[fname]):
        rels.append(
            '<a class="rel" href="%s"><i class="fa-solid %s" style="color:%s"></i>'
            '<h3>%s</h3><p>%s</p></a>'
            % (r, ICON[r], colors[i % 2], esc(SHORT[r]), esc(REL_DESC[r])))
    rel_html = '\n'.join(rels)

    out = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%s</title>
<meta name="description" content="%s">
<!-- MONETAG-VERIFICATION: paste verification meta tag here -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="../image-tools/css/v3-design.css">
%s
%s
</head>
<body>

<header class="hd"><div class="hd-in">
  <a class="logo" href="../index.html"><span class="logo-mark">T</span>TOOLSHUB</a>
  <nav class="nav"><a href="../index.html#tools">All Tools</a><a href="../about-us.html">About</a></nav>
  <div class="hd-right"><a class="hd-cta" href="../index.html#tools">Explore Tools</a></div>
</div></header>

<nav class="crumbs"><a href="../index.html">Home</a> &nbsp;/&nbsp; <span>%s</span></nav>

<section class="hero">
  <span class="hero-eyebrow">Document Tools</span>
  <h1>%s</h1>
  <p>%s</p>
  <div class="hero-meta">
    <span><i class="fa-solid fa-bolt"></i> Instant results</span>
    <span><i class="fa-solid fa-lock"></i> 100%% private</span>
    <span><i class="fa-solid fa-check"></i> No sign-up</span>
  </div>
</section>

<div class="ws-wrap"><div class="ws">
  <div class="ws-bar"><span class="ws-dot"></span><b>%s</b><span>v3.0 &middot; local</span></div>
  <div class="ws-body">
%s
  </div>
</div></div>

<section class="sec">
  <div class="sec-head"><span class="sec-num">01 &mdash; HOW IT WORKS</span><h2>Three steps, zero learning curve</h2></div>
  <div class="steps">
%s
  </div>
</section>

<div class="article-wrap"><article class="article">
  <div class="article-hero">
    <span class="article-tag">Guide</span>
    <h2>%s</h2>
    <p class="deck">%s</p>
    <div class="article-meta">
      <div class="avatar">%s</div>
      <div><b>TOOLSHUB Editorial</b><span>%d min read &middot; Updated Oct 2026</span></div>
    </div>
  </div>
  <div class="article-body">
%s
    <h3>Frequently asked</h3>
    <div class="faq">
%s
    </div>
  </div>
</article></div>

<section class="sec">
  <div class="sec-head"><span class="sec-num">02 &mdash; KEEP EXPLORING</span><h2>Related tools</h2></div>
  <div class="rel-grid">
%s
  </div>
</section>

<footer class="ft">
  <div class="ft-in">
    <div class="ft-brand"><a class="logo" href="../index.html"><span class="logo-mark">T</span>TOOLSHUB</a>
      <p>203 free tools that run entirely in your browser. No sign-up, no tracking.</p></div>
    <div><h4>Tools</h4><ul><li><a href="../index.html#tools">All 203 tools</a></li><li><a href="../pdf-tools/">PDF tools</a></li><li><a href="../image-tools/">Image tools</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="../about-us.html">About</a></li><li><a href="../contact-us.html">Contact</a></li></ul></div>
    <div><h4>Legal</h4><ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
  </div>
  <div class="ft-bot"><span>&copy; 2026 TOOLSHUB</span><span>Made for the open web</span></div>
</footer>

<!-- MONETAG-ZONE: popunder - paste zone script here -->
<!-- MONETAG-ZONE: in-page-push - paste zone script here -->
%s
%s
<script src="../image-tools/js/v3.js"></script>
</body>
</html>
''' % (esc(title), esc(desc), '\n'.join(cdn_head), CSS_BLOCK, esc(name),
       H1[fname], esc(desc), esc(name), tool_html, steps_html,
       esc(art_h2), esc(DECK[fname]), avatar, read_min, art_body, faq_html,
       rel_html, '\n'.join(cdn_body),
       '\n'.join('<script>%s</script>' % b for b in inline))

    dest = os.path.join(BASE, fname)
    open(dest, 'w', encoding='utf-8').write(out)
    print('wrote', fname, len(out), 'bytes | steps:', len(step_items[:6]),
          '| faqs:', len(soup.select('.tu-faq-item')),
          '| inline:', len(inline), '| cdn:', len(cdn_head) + len(cdn_body))


if __name__ == '__main__':
    for f in sorted(SHORT):
        build_page(f)
