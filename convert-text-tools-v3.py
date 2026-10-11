#!/usr/bin/env python3
"""TOOLSHUB v3 — Rebuild text-tools (20 pages) FROM SCRATCH.
Reads each original page, extracts tool UI / steps / article / FAQ / related,
and emits the v3 template. Keeps all IDs + inline JS exact, no old CSS.
"""
import glob, os, re, html as htmlmod
from bs4 import BeautifulSoup, Tag

SRC = os.path.dirname(os.path.abspath(__file__)) + '/text-tools'
BADGE_ICONS = {'⚡': 'fa-bolt', '🔒': 'fa-lock', '✨': 'fa-check'}
ROMAN = ['i.', 'ii.', 'iii.']
REL_COLORS = ['#4f46e5', '#7c3aed']

def esc(t): return htmlmod.escape(t, quote=True)

# ---------- hero ----------
def hero_h1(h1tag):
    inner = h1tag.decode_contents()
    inner = re.sub(r'<span class="grad">(.*?)</span>', r'<em>\1</em>', inner, flags=re.S)
    if '<em>' not in inner:
        words = inner.rsplit(' ', 1)
        inner = words[0] + ' <em>' + words[1] + '</em>' if len(words) == 2 else '<em>' + inner + '</em>'
    return inner.strip()

def hero_meta(hero):
    items = []
    for b in hero.select('.tu-badge'):
        txt = b.get_text(' ', strip=True)
        icon = 'fa-check'
        for em, ic in BADGE_ICONS.items():
            if txt.startswith(em):
                icon = ic
                txt = txt[len(em):].strip()
                break
        items.append(f'<span><i class="fa-solid {icon}"></i> {esc(txt)}</span>')
    return '\n    '.join(items)

# ---------- workspace ----------
def convert_workspace(ws):
    """Mutate a copy of .tool-workspace: v3 classes added, IDs/attrs/JS untouched."""
    for ta in ws.find_all('textarea'):
        cls = ta.get('class', []) or []
        if 'ws-textarea' not in cls:
            cls.append('ws-textarea')
        ta['class'] = cls
    btns = ws.find_all('button')
    for btn in btns:
        cls = btn.get('class', []) or []
        primary = any(c in ('btn-primary', 'tu-btn-primary') for c in cls)
        for c in ('btn', 'btn-dark' if primary else 'btn-light'):
            if c not in cls:
                cls.append(c)
        btn['class'] = cls
    if btns and not any('btn-dark' in (b.get('class') or []) for b in btns):
        cls = btns[0].get('class', []) or []
        if 'btn-light' in cls: cls.remove('btn-light')
        if 'btn-dark' not in cls: cls.append('btn-dark')
        btns[0]['class'] = cls
    for sp in ws.select('.stats-panel'):
        cls = sp.get('class', []) or []
        if 'stats' not in cls:
            cls.append('stats')
        sp['class'] = cls
    for item in ws.select('.stat-item'):
        val = item.select_one('.stat-value')
        lab = item.select_one('.stat-label')
        if val is None or lab is None:
            continue
        b = Tag(name='b')
        b['class'] = (val.get('class', []) or [])
        if val.get('id'):
            b['id'] = val['id']
        b.string = val.get_text()
        span = Tag(name='span')
        span['class'] = (lab.get('class', []) or [])
        span.string = lab.get_text()
        item.clear()
        cls = item.get('class', []) or []
        if 'stat' not in cls:
            cls.append('stat')
        item['class'] = cls
        item.append(b)
        item.append(span)
    return ws.decode_contents()

# ---------- article ----------
def convert_article(art):
    kids = [c for c in art.children if isinstance(c, Tag)]
    h2 = art.find('h2')
    title = h2.get_text(' ', strip=True)
    # body: everything after h2, dropping trailing FAQ block
    body = []
    past_h2 = False
    first_p_done = False
    for c in kids:
        if not past_h2:
            if c == h2:
                past_h2 = True
            continue
        if c.name == 'h3' and 'frequently asked' in c.get_text(strip=True).lower():
            break  # drop article's own FAQ (tu-faq is the canonical FAQ now)
        if c.name in ('h3', 'h4', 'p', 'ul', 'ol', 'table', 'blockquote'):
            if c.name == 'p' and not first_p_done:
                c['class'] = 'lead'
                first_p_done = True
            c.attrs.pop('class', None) if c.name != 'p' else None
            if c.name == 'p' and not first_p_done:
                pass
            body.append(str(c))
    words = len(re.findall(r'\S+', art.get_text(' ')))
    readtime = max(1, round(words / 200))
    return title, '\n'.join(body), readtime

def convert_faq(soup):
    sec = None
    for s in soup.select('.tu-section'):
        h = s.find('h2')
        if h and 'frequently asked' in h.get_text(strip=True).lower():
            sec = s
            break
    if not sec:
        return ''
    items = []
    for i, it in enumerate(sec.select('.tu-faq-item')):
        q = it.select_one('.tu-faq-q')
        a = it.select_one('.tu-faq-a')
        qtext = q.get_text(' ', strip=True) if q else ''
        ahtml = a.decode_contents().strip() if a else ''
        # ensure answers are paragraphs
        if ahtml and not ahtml.startswith('<'):
            ahtml = f'<p>{ahtml}</p>'
        items.append(
            f'<div class="faq-item{" open" if i == 0 else ""}">'
            f'<div class="faq-q">{esc(qtext)} <i class="fa-solid fa-plus"></i></div>'
            f'<div class="faq-a">{ahtml}</div></div>'
        )
    if not items:
        return ''
    return '<h3>Frequently asked</h3>\n<div class="faq">\n' + '\n'.join(items) + '\n</div>'

def convert_steps(soup):
    sec = None
    for s in soup.select('.tu-section'):
        h = s.find('h2')
        if h and 'how to use' in h.get_text(strip=True).lower():
            sec = s
            break
    out = []
    for i, st in enumerate(sec.select('.tu-step') if sec else []):
        h3 = st.find('h3')
        p = st.find('p')
        out.append(
            f'<div class="step"><div class="step-n">{ROMAN[i] if i < 3 else str(i+1)+"."}</div>'
            f'<h3>{esc(h3.get_text(strip=True))}</h3>'
            f'<p>{esc(p.get_text(strip=True))}</p></div>'
        )
    return '\n'.join(out)

def convert_related(soup):
    cards = soup.select('.tu-rel-card')[:4]
    out = []
    for i, a in enumerate(cards):
        icon = a.find('i')
        icls = ' '.join(icon.get('class', [])) if icon else 'fa-solid fa-wrench'
        h3 = a.find('h3')
        p = a.find('p')
        out.append(
            f'<a class="rel" href="{esc(a.get("href", "#"))}">'
            f'<i class="{esc(icls)}" style="color:{REL_COLORS[i % 2]}"></i>'
            f'<h3>{esc(h3.get_text(strip=True)) if h3 else ""}</h3>'
            f'<p>{esc(p.get_text(strip=True)) if p else ""}</p></a>'
        )
    return '\n'.join(out)

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<!-- MONETAG-VERIFICATION: paste verification meta tag here -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="../image-tools/css/v3-design.css">
</head>
<body>

<header class="hd"><div class="hd-in">
  <a class="logo" href="../index.html"><span class="logo-mark">T</span>TOOLSHUB</a>
  <nav class="nav"><a href="../index.html#tools">All Tools</a><a href="../about-us.html">About</a></nav>
  <div class="hd-right"><a class="hd-cta" href="../index.html#tools">Explore Tools</a></div>
</div></header>
<!-- MONETAG-ZONE: vignette/banner - paste zone script here -->

<nav class="crumbs"><a href="../index.html">Home</a> &nbsp;/&nbsp; <a href="index.html">Text Tools</a> &nbsp;/&nbsp; <span>{pagename}</span></nav>

<section class="hero">
  <span class="hero-eyebrow">Text Tools</span>
  <h1>{h1}</h1>
  <p>{lede}</p>
  <div class="hero-meta">
    {hero_meta}
  </div>
</section>

<div class="ws-wrap"><div class="ws">
  <div class="ws-bar"><span class="ws-dot"></span><b>{ws_title}</b><span>v3.0 &middot; local</span></div>
  <div class="ws-body">
{tool_html}
  </div>
</div></div>

<section class="sec">
  <div class="sec-head"><span class="sec-num">01 &mdash; HOW IT WORKS</span><h2>Three steps, zero learning curve</h2></div>
  <div class="steps">
{steps}
  </div>
</section>

<div class="article-wrap"><article class="article">
  <div class="article-hero">
    <span class="article-tag">Guide</span>
    <h2>{art_h2}</h2>
    <p class="deck">{deck}</p>
    <div class="article-meta">
      <div class="avatar">T</div>
      <div><b>TOOLSHUB Editorial</b><span>{readtime} min read &middot; Updated Oct 2026</span></div>
    </div>
  </div>
  <div class="article-body">
{art_body}
{faq}
  </div>
</article></div>

<section class="sec">
  <div class="sec-head"><span class="sec-num">02 &mdash; KEEP EXPLORING</span><h2>Related tools</h2></div>
  <div class="rel-grid">
{rels}
  </div>
</section>

<footer class="ft">
  <div class="ft-in">
    <div class="ft-brand"><a class="logo" href="../index.html"><span class="logo-mark">T</span>TOOLSHUB</a>
      <p>203 free tools that run entirely in your browser. No sign-up, no tracking.</p></div>
    <div><h4>Tools</h4><ul><li><a href="../index.html#tools">All 203 tools</a></li><li><a href="index.html">Text tools</a></li><li><a href="../index.html#image-tools">Image tools</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="../about-us.html">About</a></li><li><a href="../contact-us.html">Contact</a></li></ul></div>
    <div><h4>Legal</h4><ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
  </div>
  <div class="ft-bot"><span>&copy; 2026 TOOLSHUB</span><span>Made for the open web</span></div>
</footer>

<!-- MONETAG-ZONE: popunder - paste zone script here -->
<!-- MONETAG-ZONE: in-page-push - paste zone script here -->
<script src="js/text-utils.js"></script>
<script src="js/tool-ui.js"></script>
{inline_scripts}
<script src="../image-tools/js/v3.js"></script>
</body>
</html>
"""

def process(path):
    raw = open(path, encoding='utf-8').read()
    soup = BeautifulSoup(raw, 'html.parser')
    title = soup.title.get_text(strip=True) if soup.title else ''
    md = soup.find('meta', attrs={'name': 'description'})
    desc = md.get('content', '') if md else ''

    hero = soup.select_one('.tu-hero')
    h1tag = hero.find('h1')
    h1_html = hero_h1(h1tag)
    pagename = h1tag.get_text(' ', strip=True)
    lede = hero.select_one('.lede').get_text(' ', strip=True) if hero.select_one('.lede') else ''
    hmeta = hero_meta(hero)

    ws = soup.select_one('.tool-workspace')
    extra = []
    # sibling panels with functional IDs (e.g. .history-panel) live outside .tool-workspace
    sib = ws.find_next_sibling() if ws else None
    while sib:
        if isinstance(sib, Tag) and sib.name == 'section' and \
                sib.find(id=True) and 'seo-content' not in (sib.get('class') or []):
            extra.append(str(sib))
        sib = sib.find_next_sibling()
    tool_html = convert_workspace(ws) + '\n' + '\n'.join(extra)

    art = soup.select_one('section.seo-article article.tool-article')
    art_h2, art_body, readtime = convert_article(art)
    faq = convert_faq(soup)
    steps = convert_steps(soup)
    rels = convert_related(soup)

    inline = '\n'.join(
        f'<script>\n{s.get_text()}\n</script>'
        for s in soup.find_all('script', src=False)
        if s.get_text().strip()
    )

    out = PAGE.format(
        title=esc(title), desc=esc(desc), pagename=esc(pagename),
        h1=h1_html, lede=esc(lede), hero_meta=hmeta,
        ws_title=esc(pagename), tool_html=tool_html,
        steps=steps, art_h2=esc(art_h2), deck=esc(lede),
        readtime=readtime, art_body=art_body, faq=faq, rels=rels,
        inline_scripts=inline,
    )
    # sanity
    for old in ['global.css', 'components.css', 'tool-page.css', 'tu-unified.css',
                'tu-beautiful.css', 'th-interactions.js', 'tu-unified.js', 'th-header-footer.css']:
        assert old not in out, f'{path}: old asset leak {old}'
    return out

def main():
    files = sorted(glob.glob(SRC + '/*.html'))
    files = [f for f in files if os.path.basename(f) != 'index.html']
    for f in files:
        out = process(f)
        open(f, 'w', encoding='utf-8').write(out)
        print('OK', os.path.basename(f), len(out), 'bytes')

if __name__ == '__main__':
    main()
