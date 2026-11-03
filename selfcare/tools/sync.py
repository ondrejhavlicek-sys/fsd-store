#!/usr/bin/env python3
"""Re-sync the copied account area from the fsd-selfcare prototype (one-way copy, read-only source).

    python3 selfcare/tools/sync.py [path/to/fsd-selfcare]      (default: ../fsd-selfcare next to this repo)

What it does
  * copies the JS files listed in JS_FILES to selfcare/js/ and prepends a "do not edit" header with the source commit
  * generates selfcare/css/*.css from the upstream stylesheets: every selector gets the prefix `:where(.sc)`,
    so the rules only apply inside an element with the class `sc` (the island hosts and the teleported Fresh roots,
    see selfcare/bridge.js). `:where()` keeps the original specificity. Rules the store does not need (shell, header,
    scenario box ...) are dropped, keyframes get an `sc-` prefix.
  * copies the two icons the account menu needs into assets/icons/
Not copied (own files, edit them by hand): selfcare/bridge.js, selfcare/i18n-stub.js, css/account.css.
"""
import os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.abspath(os.path.join(ROOT, '..', 'fsd-selfcare'))
COMMIT = subprocess.run(['git', '-C', SRC, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip() or 'unknown'

JS_FILES = ['data.js', 'shop-data.js', 'ui.js', 'account.js', 'acctmenu.js', 'addrdrawer.js'] + ['pages/' + n for n in
    ['company', 'orders', 'authorized', 'roles', 'payments', 'contracts', 'personal', 'security', 'privacy', 'terms', 'users', 'addresses']
    for n in [n + '.js']]
ASSETS = [('assets/icons/building-outline.svg', 'assets/icons/building-outline.svg'),
          ('assets/icons/shop/chevron-down.svg', 'assets/icons/shop/chevron-down.svg')]

# per stylesheet: selectors to drop (regex on the single selector) or keep-only
CSS = {
    'account.css': {'drop': [r'\.acct-page']},
    'components.css': {'drop': [r'^\.toast$']},
    'base.css': {'keep': [r'^h1$', r'^h2$', r'^h3$', r'^html\[data-type="makro"\] h2$', r'^p$', r'^a$', r'^button$', r'^\[hidden\]$', r'^:focus-visible$', r'^\.head( h1)?$']},
    'shop.css': {'keep': [r'^\.am\b', r'^\.addr-drawer\b', r'^\.ad-']},
}
ALWAYS_DROP = [r'^\*', r'^html$', r'^body$', r'^html, body$']
SCOPE = ':where(.sc)'


def header(kind, rel):
    msg = f'copied from fsd-selfcare @ {COMMIT} ({rel}), do not edit upstream here; re-run selfcare/tools/sync.py to update'
    return f'/* {msg} */\n' if kind == 'js' else f'/* {msg}; generated: every selector is scoped with {SCOPE}; unused shell rules dropped */\n'


def split_top(s, sep=','):
    out, depth, cur, q = [], 0, '', None
    for ch in s:
        if q:
            cur += ch
            if ch == q: q = None
            continue
        if ch in '"\'': q = ch; cur += ch; continue
        if ch in '([': depth += 1
        elif ch in ')]': depth -= 1
        if ch == sep and depth == 0: out.append(cur); cur = ''
        else: cur += ch
    out.append(cur)
    return [x.strip() for x in out if x.strip()]


# elements Fresh teleports to <body> that carry these selectors get the `sc` class themselves (selfcare/bridge.js),
# so for them the scope must also match the same element, not only an ancestor
ROOTS = r'^(\.addr-drawer|\.acct-drawer|\[role="dialog"\])(?=[\s.:\[]|$)'


def scope_selector(sel):
    r = re.match(ROOTS, sel)
    if r: return SCOPE + sel + ', ' + SCOPE + ' ' + sel
    # selectors that start with html/body compounds: the scope goes after them (html body :where(.sc) ...)
    m = re.match(r'^((?:(?:html|body)(?:\[[^\]]*\])?(?:\.[\w-]+)*\s+)+)(.*)$', sel)
    if m: return m.group(1) + SCOPE + ' ' + m.group(2)
    return SCOPE + ' ' + sel


def parse_blocks(css):
    """top-level items: ('comment', text) | ('rule', prelude, body)"""
    items, i, n = [], 0, len(css)
    while i < n:
        if css[i].isspace(): i += 1; continue
        if css.startswith('/*', i):
            j = css.index('*/', i) + 2; items.append(('comment', css[i:j])); i = j; continue
        j, depth, q = i, 0, None
        while j < n:
            c = css[j]
            if q:
                if c == q: q = None
            elif c in '"\'': q = c
            elif c == '(': depth += 1
            elif c == ')': depth -= 1
            elif c == '{' and depth == 0: break
            j += 1
        prelude = css[i:j].strip()
        k, d = j + 1, 1
        while k < n and d:
            if css.startswith('/*', k): k = css.index('*/', k) + 2; continue
            c = css[k]
            if c in '"\'':
                qq = c; k += 1
                while css[k] != qq: k += 1
            elif c == '{': d += 1
            elif c == '}': d -= 1
            k += 1
        items.append(('rule', prelude, css[j + 1:k - 1])); i = k
    return items


def process(css, cfg, kf):
    out = []
    for it in parse_blocks(css):
        if it[0] == 'comment':
            if 'keep' not in cfg: out.append(it[1])
            continue
        _, pre, body = it
        if pre.startswith('@keyframes'):
            name = pre.split()[1]; kf.add(name)
            out.append(f'@keyframes sc-{name} {{{body}}}'); continue
        if pre.startswith('@media') or pre.startswith('@supports'):
            inner = process(body, cfg, kf)
            if inner.strip() and not all(l.startswith('/*') for l in inner.strip().splitlines()):
                out.append(f'{pre} {{\n{inner}\n}}')
            continue
        sels = []
        for s in split_top(pre):
            if any(re.search(p, s) for p in ALWAYS_DROP + cfg.get('drop', [])): continue
            if 'keep' in cfg and not any(re.search(p, s) for p in cfg['keep']): continue
            sels.append(scope_selector(s))
        if sels: out.append(', '.join(sels) + ' {' + body.strip().join([' ', ' ']) + '}')
    return '\n'.join(out)


def main():
    os.makedirs(os.path.join(ROOT, 'selfcare/js/pages'), exist_ok=True)
    os.makedirs(os.path.join(ROOT, 'selfcare/css'), exist_ok=True)
    for f in JS_FILES:
        txt = open(os.path.join(SRC, 'js', f), encoding='utf-8').read()
        open(os.path.join(ROOT, 'selfcare/js', f), 'w', encoding='utf-8').write(header('js', 'js/' + f) + txt)
    for name, cfg in CSS.items():
        kf = set()
        css = open(os.path.join(SRC, 'css', name), encoding='utf-8').read()
        res = process(css, cfg, kf)
        for k in kf:  # rename animation references
            res = re.sub(r'(animation(?:-name)?\s*:[^;}]*?)\b' + re.escape(k) + r'\b', r'\1sc-' + k, res)
        open(os.path.join(ROOT, 'selfcare/css', name), 'w', encoding='utf-8').write(header('css', 'css/' + name) + res + '\n')
    for s, d in ASSETS:
        os.makedirs(os.path.dirname(os.path.join(ROOT, d)), exist_ok=True)
        shutil.copyfile(os.path.join(SRC, s), os.path.join(ROOT, d))
    print('synced from', SRC, '@', COMMIT)


main()
