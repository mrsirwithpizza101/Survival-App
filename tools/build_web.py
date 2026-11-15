#!/usr/bin/env python3
"""Inline Tailwind CSS and Lucide icons into the app page so it works with no internet.

Usage: build_web.py SRC_HTML TAILWIND_CSS LUCIDE_JS OUT_HTML [OUT_HTML ...]
"""
import os, sys

src, css, js = (open(p, encoding='utf-8').read() for p in sys.argv[1:4])
js = js.replace('</script', '<\\/script')
page = src.replace('/*TAILWIND_CSS*/', css, 1).replace('/*LUCIDE_JS*/', js, 1).replace('__APP_VERSION__', os.environ.get('APP_VERSION', 'dev'))
assert '/*TAILWIND_CSS*/' not in page and '/*LUCIDE_JS*/' not in page
for out in sys.argv[4:]:
    with open(out, 'w', encoding='utf-8') as f:
        f.write(page)
print('page', len(page), 'bytes')
