#!/usr/bin/env python3
"""TOOLSHUB v3 rebuild: convert old tool pages to the v3 design (sample: toolshub-v3-sample.html)."""
import os, re, glob, html as ihtml
from bs4 import BeautifulSoup, Comment

BASE = os.path.expanduser('~/workspace/toolshub')
PREFIX = '../'

ICONS = {
    # code-tools (file -> fa classes)
    'all-in-one-code-compressor.html': 'fa-solid fa-file-zipper',
    'base64-encoder-decoder.html': 'fa-solid fa-lock',
    'code-diff-viewer.html': 'fa-solid fa-code-compare',
    'code-obfuscator.html': 'fa-solid fa-eye-slash',
    'code-quality-checker.html': 'fa-solid fa-list-check',
    'css-minifier.html': 'fa-solid fa-compress',
    'css-validator.html': 'fa-solid fa-circle-check',
    'html-formatter.html': 'fa-solid fa-code',
    'html-minifier.html': 'fa-solid fa-minimize',
    'html-viewer.html': 'fa-solid fa-eye',
    'javascript-beautifier.html': 'fa-solid fa-wand-magic-sparkles',
    'javascript-minifier.html': 'fa-solid fa-bolt',
    'json-formatter.html': 'fa-solid fa-brackets-curly',
    'json-validator.html': 'fa-solid fa-square-check',
    'json-viewer.html': 'fa-solid fa-folder-tree',
    'python-formatter.html': 'fa-brands fa-python',
    'regular-expression-tester.html': 'fa-solid fa-asterisk',
    'sql-formatter.html': 'fa-solid fa-database',
    'syntax-highlighter.html': 'fa-solid fa-highlighter',
    'url-encoder-decoder.html': 'fa-solid fa-link',
    'xml-formatter.html': 'fa-solid fa-file-code',
    # other-tools (existing icons)
    'fake-address-generator.html': 'fa-solid fa-map-pin',
    'fake-number-generator.html': 'fa-solid fa-phone',
    'random-id-generator.html': 'fa-solid fa-id-card',
    'random-name-generator.html': 'fa-solid fa-users',
}

ROMAN = ['i.', 'ii.', 'iii.', 'iv.']

def clean_text(t):
    return re.sub(r'\s+', ' ', t or '').strip()

def page_name(soup, path):
    bc = soup.select_one('.breadcrumb')
    if bc:
        parts = [clean_text(x) for x in bc.stripped_strings if clean_text(x) not in ('>', '/')]
        if parts:
            return parts[-1]
    if soup.title:
        t = soup.title.get_text(strip=True)
        return re.split(r'\s*[-|]\s*', t)[0].strip()
    return os.path.basename(path).replace('.html', '').replace('-', ' ').title()

def page_lede(soup):
    el = soup.select_one('.tu-hero .lede') or soup.select_one('.tool-header .tool-description') or soup.select_one('.tool-header p')
    return clean_text(el.get_text(' ')) if el else ''

def page_desc(soup, lede):
    md = soup.find('meta', attrs={'name': 'description'})
    d = clean_text(md.get('content', '')) if md else ''
    return d or lede

# ---------- catalog (for related cards) ----------
def build_catalog(files):
    cat = {}
    for f in files:
        soup = BeautifulSoup(open(f, encoding='utf-8', errors='ignore'), 'html.parser')
        fn = os.path.basename(f)
        name = page_name(soup, f)
        lede = page_lede(soup)
        desc = page_desc(soup, lede)
        if len(desc) > 90:
            desc = desc[:87].rsplit(' ', 1)[0] + '...'
        cat[fn] = {'name': name, 'icon': ICONS.get(fn, 'fa-solid fa-wrench'), 'desc': desc}
    return cat

# ---------- workspace extraction ----------
def extract_ws(soup):
    cw = soup.select_one('.code-workspace')
    if cw:
        return cw
    tu = soup.select_one('.tu-ws-body')
    if tu:
        return tu
    cands = [d for d in soup.select('.tool-workspace') if d.find(['textarea', 'button', 'select', 'input'])]
    if not cands:
        return None
    def depth(el):
        d = 0
        while el:
            d += 1
            el = el.parent
        return d
    ws = max(cands, key=depth)
    for sec in ws.select('section.tool-content'):
        sec.decompose()
    for c in ws.find_all(string=lambda t: isinstance(t, Comment) and 'MONETAG' in t):
        c.extract()
    return ws

def transform_ws(ws):
    # buttons -> btn-dark / btn-light
    btns = ws.find_all('button')
    for idx, b in enumerate(btns):
        cls = ' '.join(b.get('class', []))
        is_dark = bool(re.search(r'primary', cls, re.I))
        is_light = bool(re.search(r'secondary|ghost|action-btn|toolbar-btn|danger-btn|\btab\b', cls, re.I))
        kind = 'btn-dark' if is_dark else 'btn-light'
        if not is_dark and not is_light:
            kind = 'btn-dark' if idx == 0 else 'btn-light'
        b['class'] = ['btn', kind]
        if re.search(r'toolbar-btn|\btab\b', cls, re.I):
            st = b.get('style', '')
            b['style'] = (st + ';' if st else '') + 'padding:8px 14px;font-size:.82rem;border-radius:10px'
    # <a> styled as buttons
    for a in ws.find_all('a'):
        cls = ' '.join(a.get('class', []))
        if re.search(r'action-btn|btn', cls, re.I):
            a['class'] = ['btn', 'btn-light']
            st = a.get('style', '')
            if 'border-radius' not in st:
                a['style'] = (st + ';' if st else '') + 'border-radius:12px'
    # textareas -> ws-textarea monospace
    for t in ws.find_all('textarea'):
        t['class'] = ['ws-textarea']
        st = t.get('style', '')
        if 'font-family' not in st:
            t['style'] = (st + ';' if st else '') + 'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'
    # selects: strip old classes, ensure usable styling
    for s in ws.find_all('select'):
        if 'class' in s.attrs:
            del s['class']
        if not s.get('style'):
            s['style'] = 'padding:12px 14px;border:1.5px solid #e4e4e7;border-radius:12px;font-size:.95rem;background:#fff;max-width:100%'
    # pre outputs: readable dark block
    for p in ws.find_all('pre'):
        if 'class' in p.attrs:
            del p['class']
        if not p.get('style'):
            p['style'] = 'background:#0a0a0b;color:#e4e4e7;padding:18px;border-radius:12px;overflow-x:auto;font-size:.85rem;line-height:1.7;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word'
    # layout containers: keep side-by-side panes via inline flex (new inline CSS, not old classes)
    for el in [ws] + ws.find_all(True):
        cls = ' '.join(el.get('class', []))
        if re.search(r'code-workspace|diff-grid', cls):
            st = el.get('style', '')
            el['style'] = (st + ';' if st else '') + 'display:flex;flex-wrap:wrap;gap:20px'
        elif re.search(r'editor-container', cls):
            st = el.get('style', '')
            el['style'] = (st + ';' if st else '') + 'flex:1;min-width:280px'
    # strip remaining old classes everywhere else (keep v3 classes already assigned)
    keep = {'btn', 'btn-dark', 'btn-light', 'ws-textarea'}
    for el in [ws] + ws.find_all(True):
        if 'class' in el.attrs and not (set(el.get('class', [])) & keep):
            del el['class']
    return ws

def ws_ids(ws):
    return {el.get('id') for el in ws.find_all(id=True)}

# ---------- steps / faq / article ----------
def extract_steps(soup, category, name):
    steps = []
    for st in soup.select('.tu-steps .tu-step'):
        h3 = st.find('h3')
        p = st.find('p')
        if h3 and p:
            steps.append((clean_text(h3.get_text(' ')), clean_text(p.get_text(' '))))
    if len(steps) >= 3:
        return steps[:3]
    noun = 'code' if category == 'code-tools' else 'data'
    return [
        ('Add your ' + noun, 'Paste or type your %s into the input area above. Nothing leaves your browser — it stays 100%% private.' % noun),
        ('Run the tool', 'Hit the main button and your result appears instantly, right below.'),
        ('Copy the result', 'Use the copy button to grab the finished output for your project.'),
    ]

def extract_faq(soup, category, name):
    faqs = []
    for it in soup.select('.tu-faq-item'):
        q = it.select_one('.tu-faq-q')
        a = it.select_one('.tu-faq-a')
        if q and a:
            a_html = a.decode_contents().strip()
            inner_soup = BeautifulSoup(a_html, 'html.parser')
            kids = [c for c in inner_soup.children if getattr(c, 'name', None) or (isinstance(c, str) and c.strip())]
            if len(kids) == 1 and getattr(kids[0], 'name', None) == 'div':
                a_html = kids[0].decode_contents().strip()
            faqs.append((clean_text(q.get_text(' ')), a_html))
    for it in soup.select('.faq-section .faq-item'):
        q = it.find('strong')
        p = it.find('p')
        if q and p:
            faqs.append((clean_text(q.get_text(' ')), p.decode_contents().strip()))
    if faqs:
        return faqs
    noun = 'code' if category == 'code-tools' else 'data'
    return [
        ('Is the %s free?' % name, 'Yes — completely free with no sign-up and no usage limits.'),
        ('Is my %s private?' % noun, 'Yes. Everything runs locally in your browser — your %s is never uploaded to any server.' % noun),
        ('Do I need to install anything?', 'No. It works in any modern browser on desktop or mobile, no downloads required.'),
    ]

def extract_article(soup):
    art = soup.select_one('.seo-article') or soup
    inner = art.select_one('article') or art
    h2el = inner.find('h2')
    h2 = clean_text(h2el.get_text(' ')) if h2el else ''
    if h2el:
        h2el.decompose()
    for bad in inner.select('.faq-section, .tu-faq, section.tool-content'):
        bad.decompose()
    for c in inner.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    parts = []
    first_p = True
    for k in [c for c in inner.children if getattr(c, 'name', None)]:
        if k.name == 'p' and first_p:
            k['class'] = ['lead']
            first_p = False
        else:
            for t in [k] + k.find_all(True):
                if 'class' in t.attrs:
                    del t['class']
        parts.append(str(k))
    text = inner.get_text(' ')
    words = len(clean_text(text).split())
    read_min = max(1, round(words / 200))
    return h2, '\n'.join(parts), read_min

def extract_related(soup, catalog, self_fn):
    rels = []
    for c in soup.select('.tu-rel-card'):
        a = c if c.name == 'a' else c.find('a')
        if not a:
            continue
        href = a.get('href', '')
        fn = os.path.basename(href)
        icon_el = a.find('i')
        icon = ' '.join(icon_el.get('class', [])) if icon_el else catalog.get(fn, {}).get('icon', 'fa-solid fa-wrench')
        t = a.find(['h3', 'h4', 'strong', 'b'])
        p = a.find('p')
        title = clean_text(t.get_text(' ')) if t else catalog.get(fn, {}).get('name', fn)
        desc = clean_text(p.get_text(' ')) if p else catalog.get(fn, {}).get('desc', '')
        rels.append({'href': href, 'icon': icon, 'title': title, 'desc': desc})
    if len(rels) < 4:
        seen = {os.path.basename(r['href']) for r in rels} | {self_fn}
        for fn in sorted(catalog):
            if fn in seen:
                continue
            rels.append({'href': fn, 'icon': catalog[fn]['icon'], 'title': catalog[fn]['name'], 'desc': catalog[fn]['desc']})
            if len(rels) == 4:
                break
    return rels[:4]

def extract_scripts(soup):
    out = []
    for s in soup.find_all('script'):
        src = s.get('src')
        if src:
            if 'th-interactions' in src or 'tu-unified' in src:
                continue
            out.append('<script src="%s"></script>' % ihtml.escape(src, quote=True))
        else:
            txt = s.get_text()
            if txt and txt.strip():
                out.append('<script>\n' + txt.strip('\n') + '\n</script>')
    return out

# ---------- template ----------
PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%%TITLE%%</title>
<meta name="description" content="%%DESC%%">
<!-- MONETAG-VERIFICATION: paste verification meta tag here -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="../image-tools/css/v3-design.css">
</head>
<body>
<!-- MONETAG-ZONE: popunder - paste zone script here -->
<!-- MONETAG-ZONE: in-page-push - paste zone script here -->

<header class="hd"><div class="hd-in">
  <a class="logo" href="../index.html"><span class="logo-mark">T</span>TOOLSHUB</a>
  <nav class="nav"><a href="../index.html#tools">All Tools</a><a href="../about-us.html">About</a></nav>
  <div class="hd-right"><a class="hd-cta" href="../index.html#tools">Explore Tools</a></div>
</div></header>

<nav class="crumbs"><a href="../index.html">Home</a> &nbsp;/&nbsp; <a href="index.html">%%CAT_LABEL%%</a> &nbsp;/&nbsp; <span>%%NAME%%</span></nav>

<section class="hero">
  <span class="hero-eyebrow">%%EYEBROW%%</span>
  <h1>%%H1%%</h1>
  <p>%%LEDE%%</p>
  <div class="hero-meta">
    <span><i class="fa-solid fa-bolt"></i> Instant results</span>
    <span><i class="fa-solid fa-lock"></i> 100% private</span>
    <span><i class="fa-solid fa-check"></i> No sign-up</span>
  </div>
</section>

<div class="ws-wrap"><div class="ws">
  <div class="ws-bar"><span class="ws-dot"></span><b>%%NAME%%</b><span>v3.0 &middot; local</span></div>
  <div class="ws-body">
%%WS_HTML%%
  </div>
</div></div>

<section class="sec">
  <div class="sec-head"><span class="sec-num">01 &mdash; HOW IT WORKS</span><h2>Three steps, zero learning curve</h2></div>
  <div class="steps">
%%STEPS_HTML%%
  </div>
</section>

<div class="article-wrap"><article class="article">
  <div class="article-hero">
    <span class="article-tag">Guide</span>
    <h2>%%ART_H2%%</h2>
    <p class="deck">%%LEDE%%</p>
    <div class="article-meta">
      <div class="avatar">%%AVATAR%%</div>
      <div><b>TOOLSHUB Editorial</b><span>%%READ_MIN%% min read &middot; Updated Oct 2026</span></div>
    </div>
  </div>
  <div class="article-body">
%%ART_BODY%%
    <h3>Frequently asked</h3>
    <div class="faq">
%%FAQ_HTML%%
    </div>
  </div>
</article></div>

<section class="sec">
  <div class="sec-head"><span class="sec-num">02 &mdash; KEEP EXPLORING</span><h2>Related tools</h2></div>
  <div class="rel-grid">
%%REL_HTML%%
  </div>
</section>

<footer class="ft">
  <div class="ft-in">
    <div class="ft-brand"><a class="logo" href="../index.html"><span class="logo-mark">T</span>TOOLSHUB</a>
      <p>203 free tools that run entirely in your browser. No sign-up, no tracking.</p></div>
    <div><h4>Tools</h4><ul><li><a href="../index.html#tools">All 203 tools</a></li><li><a href="../index.html#image-tools">Image tools</a></li><li><a href="../index.html#pdf-tools">PDF tools</a></li><li><a href="../index.html#seo-tools">SEO tools</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="../about-us.html">About</a></li><li><a href="../contact-us.html">Contact</a></li></ul></div>
    <div><h4>Legal</h4><ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
  </div>
  <div class="ft-bot"><span>&copy; 2026 TOOLSHUB</span><span>Made for the open web</span></div>
</footer>

%%SCRIPTS_HTML%%
<script src="../image-tools/js/v3.js"></script>
</body>
</html>
"""

def build_page(path, catalog, category):
    fn = os.path.basename(path)
    soup = BeautifulSoup(open(path, encoding='utf-8', errors='ignore'), 'html.parser')
    name = page_name(soup, path)
    lede = page_lede(soup)
    desc = page_desc(soup, lede)
    title = soup.title.get_text(strip=True) if soup.title else name

    ws = extract_ws(soup)
    if ws is None:
        raise RuntimeError('no workspace found')
    old_ids = ws_ids(ws)
    transform_ws(ws)
    ws_html = str(ws)

    steps = extract_steps(soup, category, name)
    steps_html = '\n'.join(
        '    <div class="step"><div class="step-n">%s</div><h3>%s</h3><p>%s</p></div>' % (ROMAN[i], ihtml.escape(s[0]), ihtml.escape(s[1]))
        for i, s in enumerate(steps))

    faqs = extract_faq(soup, category, name)
    faq_html = '\n'.join(
        '      <div class="faq-item%s"><div class="faq-q">%s <i class="fa-solid fa-plus"></i></div><div class="faq-a"><p>%s</p></div></div>'
        % (' open' if i == 0 else '', ihtml.escape(q), a) for i, (q, a) in enumerate(faqs))

    art_h2, art_body, read_min = extract_article(soup)
    if not art_h2:
        art_h2 = '%s — Complete Guide' % name

    rels = extract_related(soup, catalog, fn)
    colors = ['#4f46e5', '#7c3aed']
    rel_html = '\n'.join(
        '    <a class="rel" href="%s"><i class="%s" style="color:%s"></i><h3>%s</h3><p>%s</p></a>'
        % (ihtml.escape(r['href'], quote=True), ihtml.escape(r['icon'], quote=True), colors[i % 2],
           ihtml.escape(r['title']), ihtml.escape(r['desc']))
        for i, r in enumerate(rels))

    scripts = extract_scripts(soup)
    scripts_html = '\n'.join(scripts)

    words = name.split()
    h1 = (''.join(ihtml.escape(w) + ' ' for w in words[:-1])) + '<em>' + ihtml.escape(words[-1]) + '</em>'

    eyebrow = 'Developer Tools' if category == 'code-tools' else 'Other Tools'
    cat_label = 'Code Tools' if category == 'code-tools' else 'Other Tools'

    page = PAGE
    page = page.replace('%%TITLE%%', ihtml.escape(title))
    page = page.replace('%%DESC%%', ihtml.escape(desc, quote=True))
    page = page.replace('%%NAME%%', ihtml.escape(name))
    page = page.replace('%%CAT_LABEL%%', cat_label)
    page = page.replace('%%EYEBROW%%', eyebrow)
    page = page.replace('%%H1%%', h1)
    page = page.replace('%%LEDE%%', ihtml.escape(lede))
    page = page.replace('%%WS_HTML%%', ws_html)
    page = page.replace('%%STEPS_HTML%%', steps_html)
    page = page.replace('%%ART_H2%%', ihtml.escape(art_h2))
    page = page.replace('%%READ_MIN%%', str(read_min))
    page = page.replace('%%AVATAR%%', ihtml.escape(name[0].upper()))
    page = page.replace('%%ART_BODY%%', art_body)
    page = page.replace('%%FAQ_HTML%%', faq_html)
    page = page.replace('%%REL_HTML%%', rel_html)
    page = page.replace('%%SCRIPTS_HTML%%', scripts_html)
    return page, old_ids

def main():
    targets = []
    for cat in ('other-tools', 'code-tools'):
        for f in sorted(glob.glob(os.path.join(BASE, cat, '*.html'))):
            if os.path.basename(f) == 'index.html':
                continue
            targets.append((f, cat))
    catalog = {}
    for f, cat in targets:
        catalog.update(build_catalog([f]))
    print('pages:', len(targets))
    for f, cat in targets:
        raw = open(f, encoding='utf-8', errors='ignore').read()
        if 'v3-design.css' in raw:
            print('%-34s SKIP (already v3)' % os.path.basename(f))
            continue
        page, old_ids = build_page(f, catalog, cat)
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(page)
        # verify ids intact
        new_soup = BeautifulSoup(page, 'html.parser')
        ws_el = new_soup.select_one('.ws-body')
        new_ids = {el.get('id') for el in ws_el.find_all(id=True)} if ws_el else set()
        missing = old_ids - new_ids
        print('%-34s ids:%d missing:%s' % (os.path.basename(f), len(old_ids), sorted(missing) if missing else 'none'))

if __name__ == '__main__':
    main()
