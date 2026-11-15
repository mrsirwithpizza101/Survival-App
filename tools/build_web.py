#!/usr/bin/env python3
"""Inline Tailwind CSS and Lucide icons into the app page so it works with no internet.

Usage: build_web.py SRC_HTML TAILWIND_CSS LUCIDE_JS OUT_HTML [OUT_HTML ...]
"""
import json, os, re, sys

src, css, js = (open(p, encoding='utf-8').read() for p in sys.argv[1:4])
js = js.replace('</script', '<\\/script')
page = src.replace('/*TAILWIND_CSS*/', css, 1).replace('/*LUCIDE_JS*/', js, 1).replace('__APP_VERSION__', os.environ.get('APP_VERSION', 'dev'))
# "What's new": the newest entry under "## Updates" in README.md
notes = []
try:
    readme = open(os.path.join(os.path.dirname(__file__), '..', 'README.md'), encoding='utf-8').read()
    first = readme.split('## Updates', 1)[1].strip().split('\n- ')[0].lstrip('- ').strip()
    first = re.sub(r'^\*\*[^*]+\*\*:\s*', '', first)
    notes = [x.strip() for x in re.split(r'(?<=[.!])\s+(?=[A-Z*])', first) if x.strip()]
except Exception:
    pass
page = page.replace('"__WHATS_NEW__"', json.dumps(notes, ensure_ascii=False))
art = open(os.path.join(os.path.dirname(__file__), 'tile_art.js'), encoding='utf-8').read()
page = page.replace('/*TILE_ART*/', art, 1)
os.makedirs('dist', exist_ok=True)
with open('dist/notes.md', 'w', encoding='utf-8') as f:
    f.write("Tap **Survival-App.apk** below to install, or use **Menu → Find latest update** inside the app.\n\n**What's new**\n\n" + ''.join('- %s\n' % n for n in notes))
assert '/*TAILWIND_CSS*/' not in page and '/*LUCIDE_JS*/' not in page
for out in sys.argv[4:]:
    with open(out, 'w', encoding='utf-8') as f:
        f.write(page)
print('page', len(page), 'bytes')
