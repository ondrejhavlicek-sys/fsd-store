# selfcare/: account area copied from the fsd-selfcare prototype

One-way copy of the company account ("Firemní účet") from `fsd-selfcare` (commit `f2a58c7`), so the store runs standalone on a static host. The selfcare repository stays the source of truth; do not edit the copied files here.

| Path | What | Generated? |
|---|---|---|
| `js/data.js`, `js/shop-data.js`, `js/ui.js` | mock data (`MockData`, `ShopData`), `UI` helpers | copied, header comment added |
| `js/account.js`, `js/acctmenu.js`, `js/addrdrawer.js` | account island (`Acct`), header account menu (`AcctMenu`), delivery-address drawer (`AddrDrawer`) | copied |
| `js/pages/*.js` | the 12 account pages (company, authorized, addresses, users, roles, payments, contracts, terms, orders + credits/savings/favorites/notifications, personal, security, privacy) | copied |
| `css/account.css`, `components.css`, `base.css`, `shop.css` | styles; every selector prefixed with `:where(.sc)` and only the rules the account area needs are kept | generated |
| `bridge.js` | recreates the small part of selfcare's `App` the islands use, keeps the delivery address in sync with `Makro.delivery`, tags teleported Fresh content with `sc` | own |
| `i18n-stub.js` | Czech-only `I18N` (the 90 KB CS/EN/VI dictionary is not copied) | own |
| `tools/sync.py` | copies and scopes everything above from `../fsd-selfcare` | own |
| `../assets/icons/building-outline.svg`, `../assets/icons/shop/chevron-down.svg` | icons the account menu loads (same relative paths as upstream) | copied |

Store-side files: `components/makro-account-page.js` (route component + scenario panel), `css/mk-account.css` (company button, page frame, panel, small Fresh fixes), header changes in `components/makro-chrome.js`, routes in `index.html`.

## Re-sync from upstream

```bash
python3 selfcare/tools/sync.py            # reads ../fsd-selfcare (or pass its path), rewrites js/ and css/
git diff selfcare/                         # review what changed upstream
```

If upstream starts using more of `App` (new members) or new global CSS, extend `bridge.js` and the keep/drop lists in `tools/sync.py`. The script never writes outside `selfcare/` and `assets/icons/`.

## How the scoping works

The islands live inside an element with the class `sc` (the header wrapper `.mk-co`, the account page frame). Fresh renders menus, drawers and dialogs into `<body>`, outside that wrapper, so `bridge.js` adds `sc` to every direct child of `<body>` that was created by one of the three islands (recognised by the Vue app container, or by account-only class names as a fallback). Prefixing with `:where()` keeps the original specificity.
