#!/usr/bin/env python3
"""TOOLSHUB v3 rebuild for image-tools (33 pages). Reads each original page,
extracts tool HTML (IDs/scripts intact) + article + FAQ + related, and emits
the v3 sample design with ../../ prefixes."""
import re, os, html as htmlmod, glob

BASE = os.path.expanduser('~/workspace/toolshub/image-tools')

DZ_ICONS = {
    'compression/image-compressor.html': 'fa-compress',
    'editing/color-corrector.html': 'fa-sliders',
    'editing/filters-effects.html': 'fa-wand-magic-sparkles',
    'editing/noise-reducer.html': 'fa-broom',
    'editing/sharpness-tool.html': 'fa-crosshairs',
    'editing/watermark-adder.html': 'fa-stamp',
    'resize-crop/bulk-resizer.html': 'fa-expand',
    'resize-crop/crop-image.html': 'fa-crop',
    'resize-crop/canvas-extender.html': 'fa-expand',
    'resize-crop/image-merger.html': 'fa-object-group',
    'resize-crop/image-splitter.html': 'fa-scissors',
    'resize-crop/image-resizer.html': 'fa-expand',
    'resize-crop/photo-resizer.html': 'fa-expand',
    'utilities/color-palette.html': 'fa-eye-dropper',
    'utilities/duplicate-finder.html': 'fa-copy',
    'utilities/exif-viewer.html': 'fa-circle-info',
    'utilities/image-compare.html': 'fa-code-compare',
    'utilities/image-to-text.html': 'fa-file-lines',
    'utilities/metadata-editor.html': 'fa-tags',
}
DEFAULT_DZ = 'fa-arrow-right-arrow-left'  # conversion/*

COMPAT_CSS = r"""
/* ---- TOOLSHUB v3 · image-tool workspace compatibility ---- */
.ws-dropzone-head{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.dz-icon{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;display:grid;place-items:center;font-size:1.05rem;flex:none}
.ws-dropzone-head>span:last-child{font-weight:600;font-size:.95rem;color:#3f3f46}
.ws-dropzone{margin-bottom:8px}
.tool-workspace{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:28px;align-items:start}
.preview-area{min-width:0}.preview-area img{max-width:100%;height:auto}
.control-panel{min-width:0}
.control-section{margin-bottom:24px}.control-section:last-child{margin-bottom:0}
.control-section-title{font-size:.95rem;font-weight:600;margin-bottom:14px;letter-spacing:-.01em}
.control-group{margin-bottom:18px}.control-group:last-child{margin-bottom:0}
.control-label{display:block;font-size:.85rem;font-weight:600;color:#3f3f46;margin-bottom:8px}
.preset-buttons{display:flex;gap:8px;flex-wrap:wrap}
.preset-btn,.mode-btn,.template-btn,.layout-btn{padding:10px 16px;border-radius:10px;border:1px solid #e4e4e7;background:#f4f4f5;font-family:'Inter',system-ui,sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;color:#3f3f46;transition:.15s}
.preset-btn:hover,.mode-btn:hover,.template-btn:hover,.layout-btn:hover{border-color:#c7d2fe}
.preset-btn.active,.mode-btn.active,.template-btn.active,.layout-btn.active{background:#0a0a0b;color:#fff;border-color:#0a0a0b}
.slider-input{width:100%;accent-color:#4f46e5}
.form-select,.form-input{width:100%;padding:12px 14px;border:1.5px solid #e4e4e7;border-radius:12px;font-family:'Inter',system-ui,sans-serif;font-size:.92rem;background:#fafafa;color:#0a0a0b;outline:none}
.form-select:focus,.form-input:focus{border-color:#4f46e5;background:#fff}
.color-picker-wrapper{display:flex;gap:10px;align-items:center}
.color-picker-wrapper input[type=color]{width:48px;height:44px;border:1px solid #e4e4e7;border-radius:10px;padding:4px;background:#fff;cursor:pointer}
.toggle-control{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f4f4f5}
.toggle-label{font-size:.9rem;font-weight:500;color:#3f3f46}
.toggle-switch{width:46px;height:26px;border-radius:99px;background:#e4e4e7;position:relative;cursor:pointer;transition:.2s;flex:none}
.toggle-switch::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.toggle-switch.active{background:#4f46e5}.toggle-switch.active::after{left:23px}
.stats-display{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.stat-item{background:#fafafa;border:1px solid #e4e4e7;border-radius:12px;padding:14px;text-align:center}
.stat-label{font-size:.72rem;color:#71717a;font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px}
.stat-value{font-size:1.25rem;font-weight:700}.stat-value.highlight{color:#4f46e5}
.badge{display:inline-block;font-size:.75rem;font-weight:600;background:#eef2ff;color:#4f46e5;padding:4px 10px;border-radius:99px}
.badge-sm{font-size:.7rem}
.tool-description{color:#3f3f46;font-size:.95rem;margin-bottom:20px}
.checkbox-label{display:flex;align-items:center;gap:10px;font-size:.9rem;color:#3f3f46;cursor:pointer;padding:6px 0}
.checkbox-label input{accent-color:#4f46e5;width:16px;height:16px}
.adjust-group{margin-bottom:14px}
.status-text{font-size:.85rem;color:#71717a;margin-top:12px}
.stat-card{background:#fafafa;border:1px solid #e4e4e7;border-radius:12px;padding:16px}
.stat-val{font-size:1.4rem;font-weight:700}
.stat-lbl,.stat-row{font-size:.85rem;color:#71717a}
.highlight{color:#4f46e5;font-weight:600}
.progress-container{margin:16px 0}
.progress-bar-bg{height:8px;background:#f4f4f5;border-radius:99px;overflow:hidden}
.progress-bar-fill{height:100%;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:99px;transition:width .3s}
.grid-inputs{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.format-selector{display:flex;gap:8px;flex-wrap:wrap}
.format-label{display:flex;align-items:center;gap:6px;font-size:.85rem;padding:8px 12px;border:1px solid #e4e4e7;border-radius:10px;cursor:pointer}
.format-label input{accent-color:#4f46e5}
.btn-primary{background:#0a0a0b;color:#fff}.btn-primary:hover{transform:translateY(-2px)}
.btn-secondary{background:#f4f4f5;color:#0a0a0b;border:1px solid #e4e4e7}
.btn-danger{background:#fee2e2;color:#b91c1c;border:1px solid #fecaca}
.btn-premium-download{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff}
.btn-sm{padding:8px 16px;font-size:.82rem;border-radius:10px}
.w-full{width:100%}.mt-2{margin-top:8px}.mt-3{margin-top:12px}.mt-4{margin-top:16px}.mb-2{margin-bottom:8px}.mb-3{margin-bottom:12px}
.filter-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:10px}
.filter-grid img,.filter-grid canvas{width:100%;border-radius:10px;cursor:pointer;border:2px solid transparent}
.palette-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:10px}
.compare-viewport{position:relative;overflow:hidden;border-radius:16px;border:1px solid #e4e4e7}
.result-card{background:#fafafa;border:1px solid #e4e4e7;border-radius:16px;padding:20px;margin-top:16px}
.ocr-results{background:#fafafa;border:1px solid #e4e4e7;border-radius:12px;padding:16px;margin-top:16px;white-space:pre-wrap}
.meta-table{width:100%;border-collapse:collapse;font-size:.88rem}
.meta-table td{padding:10px 12px;border-bottom:1px solid #f4f4f5}
.meta-table tr td:first-child{font-weight:600;color:#3f3f46;width:40%}
.img-container,.preview-container,.image-wrapper,.merge-canvas-wrapper{max-width:100%;overflow:auto;border-radius:16px}
canvas{max-width:100%;height:auto}
.hist-canvas{width:100%;height:120px}
.privacy-alert{background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:14px 16px;font-size:.88rem;color:#3f3f46;margin:16px 0}
.code-preview{background:#0a0a0b;color:#e4e4e7;border-radius:12px;padding:16px;font-family:monospace;font-size:.82rem;overflow:auto}
@media(max-width:900px){.tool-workspace{grid-template-columns:1fr}}
"""

BTN_TOKEN_MAP = [
    (r'\bbtn-premium-download\b', 'btn-dark'),
    (r'\btu-btn-primary\b', 'btn-dark'),
    (r'\btu-btn-ghost\b', 'btn-light'),
    (r'\bbtn-primary\b', 'btn-dark'),
    (r'\bbtn-secondary\b', 'btn-light'),
    (r'\bbtn-danger\b', 'btn-light'),
]

BADGE_ICONS = [('instant', 'fa-bolt'), ('private', 'fa-lock'), ('sign', 'fa-check'),
               ('free', 'fa-check'), ('browser', 'fa-lock')]
REL_COLORS = ['#4f46e5', '#7c3aed']


def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s).strip()


def extract(path):
    h = open(path, encoding='utf-8').read()
    rel = os.path.relpath(path, BASE)

    title = re.search(r'<title>(.*?)</title>', h, re.S).group(1).strip()
    meta = re.search(r'<meta name="description" content="([^"]*)"', h)
    meta_desc = htmlmod.unescape(meta.group(1)) if meta else ''

    # breadcrumb tool name (strip leading emoji)
    bc = re.search(r'<div class="breadcrumb">(.*?)</div>', h, re.S).group(1)
    tool_name = strip_tags(bc.split('<span>')[-1])
    tool_name = re.sub(r'^[^\w]+', '', tool_name).strip()

    # hero
    hero = re.search(r'<div class="tu-hero">(.*?)</div>\s*<div class="tu-workspace">', h, re.S).group(1)
    h1 = re.search(r'<h1>(.*?)</h1>', hero, re.S).group(1)
    h1 = re.sub(r'<span class="grad">(.*?)</span>', r'<em>\1</em>', h1)
    lede = strip_tags(re.search(r'<p class="lede">(.*?)</p>', hero, re.S).group(1))
    badges = [strip_tags(b) for b in re.findall(r'<span class="tu-badge[^"]*">(.*?)</span>', hero)]

    # workspace: tu-ws-body -> tu-steps
    a = h.find('<div class="tu-ws-body">')
    b = h.find('<div class="tu-steps">')
    ws = h[a + len('<div class="tu-ws-body">'):b]
    ws = re.sub(r'<div id="upload-zone"(/?)>', r'<div id="upload-zone" class="ws-dropzone"\1>', ws)
    for pat, rep in BTN_TOKEN_MAP:
        ws = re.sub(pat, rep, ws)

    # steps
    steps = []
    for m in re.finditer(r'<div class="tu-step"><div class="tu-step-num">\d+</div><h3>(.*?)</h3><p>(.*?)</p></div>', h, re.S):
        steps.append((strip_tags(m.group(1)), strip_tags(m.group(2))))
    assert len(steps) == 3, f'{rel}: steps={len(steps)}'

    # article
    a0 = h.find('<section class="seo-article"')
    a1 = h.find('</section>', a0)
    art = h[a0:a1]
    inner = re.search(r'<article class="tool-article">(.*)</article>', art, re.S).group(1)
    art_title = strip_tags(re.search(r'<h2[^>]*>(.*?)</h2>', inner, re.S).group(1))
    body = inner[re.search(r'<h2[^>]*>.*?</h2>', inner, re.S).end():]
    body = re.sub(r'<p>', '<p class="lead">', body, count=1)
    words = len(strip_tags(body).split())
    read_min = max(3, round(words / 200))

    # faq
    faqs = []
    for m in re.finditer(r'<div class="tu-faq-item">(.*?)</div></div></section>', h, re.S):
        pass
    for m in re.finditer(r'<div class="tu-faq-item"><div class="tu-faq-q">(.*?)</div><div class="tu-faq-a">(.*?)</div></div>', h, re.S):
        q = re.sub(r'<i[^>]*></i>', '', m.group(1)).strip()
        faqs.append((strip_tags(q) if '<' in q else q, m.group(2).strip()))
    assert len(faqs) == 4, f'{rel}: faqs={len(faqs)}'

    # related
    rels = []
    for m in re.finditer(r'<a class="tu-rel-card" href="([^"]+)"><i class="([^"]+)"></i><h3>(.*?)</h3><p>(.*?)</p></a>', h, re.S):
        href, icon, t, d = m.groups()
        target = os.path.normpath(os.path.join(os.path.dirname(path), href))
        if os.path.exists(target):
            th = open(target, encoding='utf-8').read()
            tm = re.search(r'<meta name="description" content="([^"]*)"', th)
            tdesc = htmlmod.unescape(tm.group(1)) if tm else ''
            tdesc = (tdesc[:110] + '…') if len(tdesc) > 110 else tdesc
        else:
            tdesc = strip_tags(d)
        rels.append((href, icon, strip_tags(t), tdesc, os.path.exists(target)))
    assert len(rels) == 4, f'{rel}: rels={len(rels)}'

    # head: cdn scripts + style blocks
    head = h[h.find('<head>'):h.find('</head>')]
    head_scripts = re.findall(r'<script src="[^"]+"></script>', head)
    head_styles = re.findall(r'<style>.*?</style>', head, re.S)

    # body scripts: everything after </footer> (original scripts, exact)
    fpos = h.find('</footer>')
    body_tail = h[fpos + len('</footer>'):]
    scripts = re.findall(r'<script(?:\s[^>]*)?>.*?</script>', body_tail, re.S)

    return dict(rel=rel, title=title, meta_desc=meta_desc, tool_name=tool_name,
                h1=h1, lede=lede, badges=badges, ws=ws, steps=steps,
                art_title=art_title, art_body=body, read_min=read_min,
                faqs=faqs, rels=rels, head_scripts=head_scripts,
                head_styles=head_styles, scripts=scripts)


def hero_meta(badges):
    out = []
    for b in badges:
        icon = 'fa-check'
        bl = b.lower()
        for kw, ic in BADGE_ICONS:
            if kw in bl:
                icon = ic
                break
        out.append(f'    <span><i class="fa-solid {icon}"></i> {htmlmod.escape(b)}</span>')
    return '\n'.join(out)


def build(d):
    dz = DZ_ICONS.get(d['rel'], DEFAULT_DZ)
    steps_html = '\n'.join(
        f'    <div class="step"><div class="step-n">{"i." if i == 0 else "ii." if i == 1 else "iii."}</div><h3>{htmlmod.escape(s)}</h3><p>{htmlmod.escape(p)}</p></div>'
        for i, (s, p) in enumerate(d['steps']))
    faq_html = '\n'.join(
        f'      <div class="faq-item{" open" if i == 0 else ""}"><div class="faq-q">{q} <i class="fa-solid fa-plus"></i></div><div class="faq-a">{a}</div></div>'
        for i, (q, a) in enumerate(d['faqs']))
    rel_html = '\n'.join(
        f'    <a class="rel" href="{href}"><i class="{icon}" style="color:{REL_COLORS[i % 2]}"></i><h3>{htmlmod.escape(t)}</h3><p>{htmlmod.escape(td)}</p></a>'
        for i, (href, icon, t, td, _ok) in enumerate(d['rels']))
    scripts_html = '\n'.join(d['scripts'])
    head_scripts = '\n'.join(d['head_scripts'])
    head_styles = '\n'.join(d['head_styles'])

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{d['title']}</title>
<meta name="description" content="{htmlmod.escape(d['meta_desc'], quote=True)}">
<!-- MONETAG-VERIFICATION: paste verification meta tag here -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="../../image-tools/css/v3-design.css">
{head_scripts}
<style>{COMPAT_CSS}
</style>
{head_styles}
</head>
<body>

<header class="hd"><div class="hd-in">
  <a class="logo" href="../../index.html"><span class="logo-mark">T</span>TOOLSHUB</a>
  <nav class="nav"><a href="../../index.html#tools">All Tools</a><a href="../../about-us.html">About</a></nav>
  <div class="hd-right"><a class="hd-cta" href="../../index.html#tools">Explore Tools</a></div>
</div></header>

<nav class="crumbs"><a href="../../index.html">Home</a> &nbsp;/&nbsp; <span>{htmlmod.escape(d['tool_name'])}</span></nav>

<section class="hero">
  <span class="hero-eyebrow">Image Tools</span>
  <h1>{d['h1']}</h1>
  <p>{htmlmod.escape(d['lede'])}</p>
  <div class="hero-meta">
{hero_meta(d['badges'])}
  </div>
</section>

<div class="ws-wrap"><div class="ws">
  <div class="ws-bar"><span class="ws-dot"></span><b>{htmlmod.escape(d['tool_name'])}</b><span>v3.0 · local</span></div>
  <div class="ws-body">
    <div class="ws-dropzone-head"><span class="dz-icon"><i class="fa-solid {dz}"></i></span><span>Drop your images to get started</span></div>
{d['ws']}
  </div>
</div></div>

<section class="sec">
  <div class="sec-head"><span class="sec-num">01 — HOW IT WORKS</span><h2>Three steps, zero learning curve</h2></div>
  <div class="steps">
{steps_html}
  </div>
</section>

<div class="article-wrap"><article class="article">
  <div class="article-hero">
    <span class="article-tag">Guide</span>
    <h2>{htmlmod.escape(d['art_title'])}</h2>
    <p class="deck">{htmlmod.escape(d['lede'])}</p>
    <div class="article-meta">
      <div class="avatar">T</div>
      <div><b>TOOLSHUB Editorial</b><span>{d['read_min']} min read · Updated Oct 2026</span></div>
    </div>
  </div>
  <div class="article-body">
{d['art_body']}
    <h3>Frequently asked</h3>
    <div class="faq">
{faq_html}
    </div>
  </div>
</article></div>

<section class="sec">
  <div class="sec-head"><span class="sec-num">02 — KEEP EXPLORING</span><h2>Related tools</h2></div>
  <div class="rel-grid">
{rel_html}
  </div>
</section>

<footer class="ft">
  <div class="ft-in">
    <div class="ft-brand"><a class="logo" href="../../index.html"><span class="logo-mark">T</span>TOOLSHUB</a>
      <p>204 free tools that run entirely in your browser. No sign-up, no tracking.</p></div>
    <div><h4>Tools</h4><ul><li><a href="../../index.html#tools">All 204 tools</a></li><li><a href="../../index.html#image-tools">Image tools</a></li><li><a href="../../index.html#pdf-tools">PDF tools</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="../../about-us.html">About</a></li><li><a href="../../contact-us.html">Contact</a></li></ul></div>
    <div><h4>Legal</h4><ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
  </div>
  <div class="ft-bot"><span>© 2026 TOOLSHUB</span><span>Made for the open web</span></div>
</footer>

{scripts_html}
<script src="../../image-tools/js/v3.js"></script>
</body>
</html>
"""


def main():
    files = sorted(glob.glob(os.path.join(BASE, '*', '*.html')))
    assert len(files) == 33, f'expected 33, got {len(files)}'
    for path in files:
        raw = open(path, encoding='utf-8').read()
        if 'v3-design.css' in raw:
            print('SKIP (already v3)', os.path.relpath(path, BASE))
            continue
        d = extract(path)
        missing = [r for r in d['rels'] if not r[4]]
        if missing:
            print('MISSING REL TARGETS', d['rel'], missing)
        open(path, 'w', encoding='utf-8').write(build(d))
        print('OK', d['rel'])


if __name__ == '__main__':
    main()
