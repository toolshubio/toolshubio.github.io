#!/usr/bin/env python3
"""TOOLSHUB v3 — rebuild pdf-tools pages from scratch.

Reads each original page in ~/workspace/toolshub/pdf-tools/, extracts
title/meta/description, tool workspace HTML, how-to steps, SEO article and
scripts, and writes a v3-design page in place.
"""
import re, glob, os, sys
from bs4 import BeautifulSoup, NavigableString

PDF = os.path.expanduser('~/workspace/toolshub/pdf-tools')

# ---- Inline component CSS for the tool workspace (no old-CSS links) ----
COMPONENT_CSS = r"""
/* ---- v3 PDF workspace components ---- */
.pdf-tool-container{display:grid;grid-template-columns:1fr 300px;gap:28px;align-items:start}
@media(max-width:900px){.pdf-tool-container{grid-template-columns:1fr}}
@keyframes borderFlow{to{background-position:100% 100%,300% 0}}
@keyframes floaty{50%{transform:translateY(-8px)}}
@keyframes popIn{from{transform:scale(.9);opacity:0}}
.ws-dropzone,.pdf-upload-zone{position:relative;border-radius:20px;padding:56px 32px;text-align:center;cursor:pointer;
  background:linear-gradient(#fff,#fff) padding-box,
  linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef,#6366f1) border-box;
  background-size:100% 100%,300% 300%;border:2px dashed transparent;
  animation:borderFlow 6s linear infinite;transition:transform .25s,box-shadow .25s}
.ws-dropzone:hover,.pdf-upload-zone:hover{transform:translateY(-3px);box-shadow:0 20px 50px -18px rgba(139,92,246,.4)}
.ws-dropzone.dragover,.pdf-upload-zone.dragover{transform:scale(1.02);box-shadow:0 0 0 6px rgba(139,92,246,.15),0 20px 50px -18px rgba(139,92,246,.5)}
.pdf-upload-icon{display:inline-grid;place-items:center;width:84px;height:84px;border-radius:24px;
  background:linear-gradient(135deg,#6366f1,#8b5cf6 55%,#d946ef);color:#fff;font-size:2.2rem;margin-bottom:20px;
  box-shadow:0 14px 34px -10px rgba(139,92,246,.55);animation:floaty 3.5s ease-in-out infinite}
.ws-dropzone h2,.pdf-upload-zone h2{font-size:1.45rem;letter-spacing:-.02em;margin-bottom:8px}
.ws-dropzone p,.pdf-upload-zone p{color:#64748b;margin-bottom:6px}
.pdf-secure{display:inline-flex;align-items:center;gap:8px;margin-top:16px;font-size:.84rem;color:#059669;
  background:#ecfdf5;border:1px solid #d1fae5;padding:9px 18px;border-radius:99px;font-weight:600}
.ws-body .tu-btn{width:100%;justify-content:center;margin-top:10px}
.btn:disabled{opacity:.55;cursor:not-allowed;transform:none!important}
.btn-download{display:none}
.btn-download.show{display:inline-flex}
.pdf-progress{height:8px;background:#eef2ff;border-radius:99px;overflow:hidden;margin-top:16px;display:none}
.pdf-progress.show{display:block}
.pdf-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#6366f1,#d946ef);border-radius:99px;transition:width .3s}
.pdf-page-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-top:24px}
.pdf-page-item{background:#fff;border:1.5px solid #e6eaf2;border-radius:16px;padding:16px 12px;text-align:center;
  position:relative;transition:.2s;animation:popIn .3s ease}
.pdf-page-item:hover{border-color:#c7d2fe;transform:translateY(-3px);box-shadow:0 12px 30px -12px rgba(99,102,241,.3)}
.pdf-page-number{position:absolute;top:8px;left:8px;min-width:28px;height:28px;border-radius:99px;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:.75rem;font-weight:700;
  display:grid;place-items:center;padding:0 8px}
.pdf-page-thumbnail{font-size:2.2rem;color:#dc2626;margin:6px 0}
.pdf-file-card{background:#fff;border:1.5px solid #e6eaf2;border-radius:16px;padding:18px 14px;text-align:center;
  position:relative;transition:.2s;animation:popIn .3s ease}
.pdf-file-card .pdf-thumb{width:56px;height:70px;margin:0 auto 12px;border-radius:8px;
  background:linear-gradient(135deg,#fef2f2,#fee2e2);display:grid;place-items:center;
  color:#dc2626;font-size:1.6rem;border:1px solid #fecaca}
.pdf-settings-panel{background:linear-gradient(180deg,#fafbff,#fff);border:1px solid #e6eaf2;border-radius:20px;padding:26px}
.pdf-settings-panel .setting-group{margin-bottom:22px}
.pdf-settings-panel .setting-group>label{display:block;font-size:.82rem;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;color:#475569;margin-bottom:14px}
.checkbox-container,.radio-container{display:flex;align-items:center;gap:12px;cursor:pointer;font-size:.92rem;font-weight:500;padding:10px 0}
.checkbox-container input{appearance:none;width:22px;height:22px;border:2px solid #cbd5e1;border-radius:7px;cursor:pointer;
  position:relative;transition:.2s;flex-shrink:0;background:#fff;margin:0}
.checkbox-container input:checked{background:linear-gradient(135deg,#6366f1,#8b5cf6);border-color:#6366f1}
.checkbox-container input:checked::after{content:"✓";position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-size:.8rem;font-weight:700}
.radio-container input{appearance:none;width:22px;height:22px;border:2px solid #cbd5e1;border-radius:50%;cursor:pointer;
  transition:.2s;flex-shrink:0;background:#fff;margin:0}
.radio-container input:checked{border:6px solid #6366f1}
.radio-group{display:flex;flex-direction:column;gap:4px}
.form-control{width:100%;padding:12px 15px;border:1.5px solid #e6eaf2;border-radius:12px;font-size:.92rem;
  font-family:inherit;outline:none;background:#fff;color:#0f172a;transition:.2s}
.form-control:focus{border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.12)}
input[type=range].form-control{padding:0;border:none;background:transparent;accent-color:#6366f1}
.comparison-view{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0}
.comp-box{border:1.5px solid #e6eaf2;border-radius:16px;padding:20px;text-align:center;background:#fff}
.comp-label{display:block;font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin-bottom:8px}
.comp-size{display:block;font-size:1.6rem;font-weight:700}
.savings-badge{display:inline-block;margin-top:10px;background:#4caf50;color:#fff;font-size:.78rem;font-weight:700;padding:6px 14px;border-radius:99px}
.watermark-preview{position:relative;background:#f8fafc;border:1.5px dashed #cbd5e1;border-radius:16px;
  min-height:260px;display:grid;place-items:center;overflow:hidden;margin-top:16px}
.watermark-overlay{position:absolute;font-size:2.2rem;font-weight:800;color:rgba(99,102,241,.28);
  transform:rotate(-24deg);letter-spacing:.1em;pointer-events:none;text-transform:uppercase}
.premium-feature-badge{display:inline-block;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;
  font-size:.7rem;font-weight:700;padding:4px 12px;border-radius:99px;letter-spacing:.06em;margin-left:8px}
.queue-header h4{margin:0;font-size:1rem}
.ws-body table{width:100%;border-collapse:collapse;font-size:.9rem;margin:12px 0}
.ws-body th,.ws-body td{padding:10px;border-bottom:1px solid #eef2ff;text-align:left}
.ws-body th{font-weight:600;color:#475569;font-size:.82rem;text-transform:uppercase;letter-spacing:.04em}
"""

PAGE_TPL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{meta}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="../image-tools/css/v3-design.css">
{m_head}
<style>{css}</style>
</head>
<body>
<header class="hd"><div class="hd-in">
  <a class="logo" href="../index.html"><span class="logo-mark">T</span>TOOLSHUB</a>
  <nav class="nav"><a href="../index.html#tools">All Tools</a><a href="../about-us.html">About</a></nav>
  <div class="hd-right"><a class="hd-cta" href="../index.html#tools">Explore Tools</a></div>
</div></header>
{m_top}
<nav class="crumbs"><a href="../index.html">Home</a> &nbsp;/&nbsp; <span>{tool_name}</span></nav>
<section class="hero">
  <span class="hero-eyebrow">PDF Tools</span>
  <h1>{h1}</h1>
  <p>{meta}</p>
  <div class="hero-meta">
    <span><i class="fa-solid fa-bolt"></i> Instant results</span>
    <span><i class="fa-solid fa-lock"></i> 100% private</span>
    <span><i class="fa-solid fa-check"></i> No sign-up</span>
  </div>
</section>
<div class="ws-wrap"><div class="ws">
  <div class="ws-bar"><span class="ws-dot"></span><b>{tool_name}</b><span>v3.0 · local</span></div>
  <div class="ws-body">
{workspace}
  </div>
</div></div>
<section class="sec">
  <div class="sec-head"><span class="sec-num">01 — HOW IT WORKS</span><h2>Three steps, zero learning curve</h2></div>
  <div class="steps">
{steps}
  </div>
</section>
<div class="article-wrap"><article class="article">
  <div class="article-hero">
    <span class="article-tag">Guide</span>
    <h2>{art_h2}</h2>
    <p class="deck">{deck}</p>
    <div class="article-meta"><div class="avatar">T</div><div><b>TOOLSHUB Editorial</b><span>8 min read · Updated Oct 2026</span></div></div>
  </div>
  <div class="article-body">
{article}
  </div>
</article></div>
<section class="sec">
  <div class="sec-head"><span class="sec-num">02 — KEEP EXPLORING</span><h2>Related tools</h2></div>
  <div class="rel-grid">
{related}
  </div>
</section>
<footer class="ft">
  <div class="ft-in">
    <div class="ft-brand"><a class="logo" href="../index.html"><span class="logo-mark">T</span>TOOLSHUB</a><p>203 free tools that run entirely in your browser. No sign-up, no tracking.</p></div>
    <div><h4>Tools</h4><ul><li><a href="../index.html#tools">All 203 tools</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="../about-us.html">About</a></li><li><a href="../contact-us.html">Contact</a></li></ul></div>
    <div><h4>Legal</h4><ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
  </div>
  <div class="ft-bot"><span>© 2026 TOOLSHUB</span><span>Made for the open web</span></div>
</footer>
{m_bot}
{scripts}
<script src="../image-tools/js/v3.js"></script>
</body>
</html>
"""


def strip_suffix(name):
    return re.sub(r'\s+(Advanced(?:\s+AI)?|Visual|Data Focus|Permanent)$', '', name).strip()


def build_h1(name):
    base = strip_suffix(name)
    if ' ' in base:
        head, tail = base.rsplit(' ', 1)
        return '%s <em>%s.</em>' % (head, tail)
    return '<em>%s.</em>' % base


def extract(path):
    src = open(path, encoding='utf-8').read()
    soup = BeautifulSoup(src, 'html.parser')

    # title / meta (exact originals)
    title = re.search(r'<title>(.*?)</title>', src, re.S).group(1).strip()
    meta_tag = soup.find('meta', attrs={'name': 'description'})
    meta = meta_tag['content'].strip() if meta_tag else ''

    # monetag comments (verbatim)
    m_head = re.search(r'<!--\s*MONETAG-VERIFICATION:.*?-->', src, re.S)
    m_top = re.search(r'<!--\s*MONETAG-ZONE:\s*vignette/banner.*?-->', src, re.S)
    m_bot = re.findall(r'<!--\s*MONETAG-ZONE:\s*(?:popunder|in-page-push).*?-->',
                       src, re.S)

    # tool name from breadcrumb
    cr = soup.select_one('.breadcrumb')
    tool_name = cr.find_all('span')[-1].get_text(strip=True)

    # ---- workspace ----
    ws = soup.select_one('.tool-workspace')
    if ws is None:
        raise RuntimeError('no .tool-workspace')
    dz = ws.select_one('.pdf-upload-zone')
    if dz:
        cls = dz.get('class', [])
        if 'ws-dropzone' not in cls:
            dz['class'] = cls + ['ws-dropzone']
    for btn in ws.select('.tu-btn-primary'):
        btn['class'] = btn.get('class', []) + ['btn-dark']
    for btn in ws.select('.tu-btn-ghost'):
        btn['class'] = btn.get('class', []) + ['btn-light']
    workspace = ws.decode_contents().strip()

    # ---- how-to steps ----
    steps = []
    for st in soup.select('.tu-step'):
        h3 = st.find('h3')
        p = st.find('p')
        steps.append((h3.get_text(strip=True) if h3 else '',
                      p.get_text(strip=True) if p else ''))
    while len(steps) < 3:
        steps.append(('Step %d' % (len(steps) + 1), ''))
    steps_html = '\n'.join(
        '    <div class="step"><div class="step-n">%s.</div><h3>%s</h3><p>%s</p></div>'
        % ({0: 'i', 1: 'ii', 2: 'iii'}[i], h, p)
        for i, (h, p) in enumerate(steps[:3]))

    # ---- article ----
    art = soup.select_one('.tool-article')
    if art is None:
        raise RuntimeError('no .tool-article')
    art_h2 = art.find('h2').get_text(strip=True)
    first_p = art.find('p')
    deck = first_p.get_text(strip=True)
    art.find('h2').decompose()
    first_p.decompose()

    # FAQ: h3 'Frequently Asked...' + following h4/p pairs -> .faq
    faq_h3 = None
    for h3 in art.find_all('h3'):
        if 'frequently asked' in h3.get_text(strip=True).lower():
            faq_h3 = h3
            break
    if faq_h3:
        nodes = []
        n = faq_h3.find_next_sibling()
        while n and n.name != 'h3':
            nodes.append(n)
            n = n.find_next_sibling()
        items = []
        leftover = []
        i = 0
        while i < len(nodes):
            if nodes[i].name == 'h4':
                q = nodes[i].get_text(strip=True)
                ans = []
                leftover.append(nodes[i])
                i += 1
                while i < len(nodes) and nodes[i].name == 'p':
                    ans.append(nodes[i])
                    i += 1
                items.append((q, ans))
            else:
                i += 1
        faq_div = soup.new_tag('div', attrs={'class': 'faq'})
        for qi, (q, ans) in enumerate(items):
            item = soup.new_tag('div',
                                attrs={'class': 'faq-item open' if qi == 0 else 'faq-item'})
            qdiv = soup.new_tag('div', attrs={'class': 'faq-q'})
            qdiv.append(NavigableString(q + ' '))
            qdiv.append(soup.new_tag('i', attrs={'class': 'fa-solid fa-plus'}))
            adiv = soup.new_tag('div', attrs={'class': 'faq-a'})
            for pnode in ans:
                adiv.append(pnode.extract())
            item.append(qdiv)
            item.append(adiv)
            faq_div.append(item)
        faq_h3.replace_with(faq_div)
        for n in leftover:
            n.decompose()

    lead = art.find('p')
    if lead:
        cls = lead.get('class', [])
        if 'lead' not in cls:
            lead['class'] = cls + ['lead']
    article_html = art.decode_contents().strip()

    # ---- related tools ----
    rels = []
    colors = ['#4f46e5', '#7c3aed']
    for i, a in enumerate(soup.select('.tu-related a')[:4]):
        icon = a.find('i')
        icon_cls = ' '.join(icon.get('class', [])) if icon else 'fa-solid fa-wrench'
        href = a.get('href', '#')
        h3 = a.find('h3')
        p = a.find('p')
        rels.append(
            '    <a class="rel" href="%s"><i class="%s" style="color:%s"></i><h3>%s</h3><p>%s</p></a>'
            % (href, icon_cls, colors[i % 2],
               h3.get_text(strip=True) if h3 else '',
               p.get_text(strip=True) if p else ''))
    related_html = '\n'.join(rels)

    # ---- scripts verbatim (original order) ----
    scripts = re.findall(r'<script\b[^>]*>.*?</script>', src, re.S | re.I)

    page = PAGE_TPL.format(
        title=title, meta=meta,
        m_head=(m_head.group(0) if m_head else ''),
        css=COMPONENT_CSS.strip(),
        m_top=(m_top.group(0) if m_top else ''),
        tool_name=tool_name,
        h1=build_h1(tool_name),
        workspace=workspace,
        steps=steps_html,
        art_h2=art_h2, deck=deck,
        article=article_html,
        related=related_html,
        m_bot='\n'.join(m_bot),
        scripts='\n'.join(scripts),
    )
    return page, src


def main():
    files = sorted(glob.glob(os.path.join(PDF, '*.html')))
    files = [f for f in files if not f.endswith('index.html')]
    print('pages:', len(files))
    errors = []
    for f in files:
        try:
            page, _ = extract(f)
            open(f, 'w', encoding='utf-8').write(page)
            print('OK  ', os.path.basename(f))
        except Exception as e:  # noqa
            errors.append((f, e))
            print('FAIL', os.path.basename(f), repr(e))
    if errors:
        sys.exit(1)


if __name__ == '__main__':
    main()
