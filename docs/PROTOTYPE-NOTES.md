# makro eshop prototype: notes and open decisions

Written 2026-10-29. Clickable mockup of the makro B2B eshop (mock data only, Czech UI, no backend).
Start it with `python3 serve.py 5190` and open `http://localhost:5190/index.html`.

## Screens

| Route | Screen | Reference used |
|---|---|---|
| `#/` | Homepage: order status, hero carousel (the Christmas slide has an illustrated scene `assets/hero/xmas-scene.svg`, falling snow and category chips), then "Oblíbené kategorie", last order and lists, product rows | no Figma frame; kit homepage, kosik.cz, live makro homepage |
| `#/?variant=cards` | Homepage alternative: the cards "Poslední objednávka" and "Moje seznamy" are shown below the category tiles; in the default layout they are hidden because the same content opens from the nav bar items (popovers). The "Prototyp" pill in the corner switches | – |
| `#/kategorie/parky-spekacky-tocene-salamy` | Category page: subcategory tiles, filter bar (Filtry button with badge, chips, quick pills), "Filtry a řazení" drawer (bottom sheet on phones), count, VAT switch, sorting, product grid | Figma FSD-Store `18:5253`; filters: kosik.cz category page (drawer, chips, pills), live makro filter column (groups) |
| `#/produkt/:id` | Product detail (35 mock products) | no Figma frame; kosik.cz and live makro product page |
| `#/kosik` | Cart, makro layout (variant A) | no Figma frame; live makro cart |
| `#/kosik?variant=b` | Cart, Košík layout (variant B): simplified header, top bar with total, items grouped by category, progress card (minimum order instead of free delivery), delivery card, summary; the "Prototyp" pill in the corner switches between the two | screenshot of the Košík.cz basket (checkout.ondraux.kosik.design) |
| `#/pokladna` | Checkout (order recap) | data model draft hooks; no live reference |
| `#/objednavka` | Order confirmation | – |
| `#/ucet`, `#/ucet/:id` | Company account area copied from the selfcare prototype: company profile (`company`), authorized person, delivery addresses (`addresses`), users, roles, payments, contracts, terms, orders, credits, savings, favourites, notifications, personal data, security, privacy. `#/ucet` opens the company page on desktop and the menu (hub) page up to 768 px; `#/ucet/newsletter` and `#/ucet/sites` redirect as in selfcare | fsd-selfcare prototype (`f2a58c7`), see "Account area" below |
| header company button | Pill with building icon and company name (round icon button up to 1100 px); opens the account menu (dropdown; on phones it goes to `#/ucet`) | selfcare header |
| header delivery address / "Doručení:" bar | Delivery-address drawer (Fresh Drawer), also opened by "Změnit" in both carts | selfcare address drawer, kosik.cz checkout drawer |
| header cart button | Cart preview (popover, bottom sheet on mobile) | live makro cart panel, kosik.cz preview |
| Potraviny, Nepotravinové zboží | Category mega-menu: group list on the left, blocks with their children on the right (desktop; basic sheet on mobile) | kosik.cz "Produkty" menu, category tree of sortiment.makro.cz (`js/nav-data.js`, read 2026-11-03) |

Shell: header, navigation bar (Potraviny, Nepotravinové zboží, then Nákupní seznamy and Poslední objednávky with leading two-tone icons (list, history); both open a popover on hover after 250 ms and on click, like the category menu, in the way of the selfcare prototype) and footer from the Figma draft (`18:5299`, `18:5319`, `18:5392`).

## How it is built

- No build step. Static files, classic scripts, Vue 3 (dev build, in-DOM compiler) and the Fresh design system (`vendor/kosik-ui.js`) for the dropdown menus, with the Tailwind runtime.
- `components/makro-*.js` are the prototype's own components (header and footer, product box, one file per page, cart preview, filters drawer). All state and mock data live in `js/store.js` (`window.Makro`); the category filter state and counts live in `js/makro-filters.js`.
- The account area (company profile, account menu, delivery-address drawer) is copied from the selfcare prototype into `selfcare/` and wired in through `selfcare/bridge.js`, `components/makro-account-page.js` and the header; see "Account area" below.
- Styles: `css/store.css` (page layout, category page, product box), `css/filters.css` (filter bar extras, drawer), `chrome.css`, `product.css`, `home.css`, `cart.css`, `checkout.css`. `makro-fresh.css` and `js/makro-theme.js` restyle Fresh components to makro blue and square corners.
- Prices are net (without VAT) in the data; VAT is a flat 12 % on goods and 21 % on the minimum-order fee. The Bez DPH / Včetně DPH switch changes which price is the headline price.

## Account area (ported from fsd-selfcare)

The company account, the account menu in the header and the delivery-address drawer are **copied** from the selfcare prototype (`../fsd-selfcare`, commit `f2a58c7`) into `selfcare/`; see `selfcare/README.md` for the file list. Selfcare stays a separate repository and the source of truth; this is a one-way copy so the store runs standalone on a static host.

- **What was copied**: the account island (`account.js`), the account menu (`acctmenu.js`), the address drawer (`addrdrawer.js`), the 12 account pages, mock data (`data.js`, `shop-data.js`), `ui.js`, and the CSS they need. The JS files are byte-copies with a header comment; the CSS is generated with every selector prefixed by `:where(.sc)` (specificity unchanged) and unused shell rules dropped.
- **Bridge** (`selfcare/bridge.js`): recreates only the part of selfcare's `App` the islands use (`App.S` reactive state from `MockData` with `reset()`, `register`/`pages`, `isAdmin`/`isOwner`/`me`/`list`, `addrTitle`/`addrLine`/`addressName`, `selectable`/`currentAddress`, `render()` as a re-sync counter, `cart.count()` bound to the store cart). `UI.toast` is replaced by the store toast.
- **One address, one source of truth**: `App.S.addressId`. It is validated by `currentAddress()` (deactivated or not allowed for the role: falls back to the main address), stored in `localStorage` as `sc-address` (try/catch, as in selfcare) and mirrored to `Makro.delivery.address`, so the carts, checkout, order confirmation and product page show the selected address. The sample data replaces the earlier Evropská 2758/11 text (company "Fidel Gastro s.r.o.", three active delivery addresses, one deactivated). The "different delivery area and non-empty cart" confirmation works against the store cart.
- **Styles**: all copied rules apply only inside `.sc`. Fresh renders menus, drawers and dialogs into `<body>`; the bridge adds `sc` to the body children created by the three islands. The store's own styles for the company button, the page frame and the scenario panel are in `css/mk-account.css`. Store pages were fingerprinted (position, size and 17 computed style properties of every element) before and after at 1440 and 375 px: unchanged apart from the header.
- **Page host** (`components/makro-account-page.js`): the island is mounted once and moved in and out of the page; Vue owns an empty wrapper and never patches the island's DOM. Leaving the account area closes dialogs and drawers that are still open. The island brings its own `<main>`, so the page frame is a `<div>`.
- **Scenario panel** ("Scénáře prototypu", bottom right, account routes only): role of the logged-in user (Vlastník, Správce účtu, Nákupčí, Prohlížející), state of lists (běžný, prázdný, načítání, chyba) and "Obnovit ukázková data". It changes what the account pages show and which addresses the drawer offers. It does **not** restrict anything in the store itself.
- **Header changes**: the "JM" avatar is replaced by the company button; the bell stays. Opening the account menu closes the cart preview, the mega-menu and the nav popovers (and the other way round). Up to 1100 px the company button is icon only (selfcare switches at 768 px); the search field may shrink, which also fixes a small horizontal overflow of the header around 800 px.
- **Differences from selfcare**: the address label in the header is limited by the room next to the centred search field (about 190 px at 1440, 320 px at 1728), so "Restaurace U Mostu · Na Příkopě 15, 110 00 Praha 1" is cut off with an ellipsis on narrower screens (full text in the tooltip); typography switch (Inter/Lato), language switch, shop stand-in, search, nav and footer of selfcare are not ported; "Nákupní seznamy" in the account menu and sidebar leads to a toast (no shopping lists page in the store); Vue shows the same dev warning about a missing injection in `Breadcrumbs` as selfcare does; headings (28 px H1 about 5 %, 18 px about 1.5 %) are slightly narrower than on selfcare because the store ships its own Inter font file; body text matches.
- **Not ported**: language switch CS/EN/VI (`selfcare/i18n-stub.js` is Czech only, picking another language on "Osobní údaje" falls back with a toast), typography switch, the selfcare shop pages, its shell, navigation bar and search.
- **How to re-sync from upstream**: `python3 selfcare/tools/sync.py`, then review `git diff selfcare/`. If upstream starts using more of `App`, extend the bridge.
- **Verified** (browser pane, 1728/1440/375 px): computed styles of all 16 account pages are identical to the live selfcare prototype (company, authorized, addresses, users, roles, payments, contracts, terms, orders, credits, savings, favourites, notifications, personal, security, privacy; desktop and the 375 px hub), as are the account menu and the address drawer; address add, deactivation and delivery-area confirmation, role switching, empty/error states and the data reset work; Esc and focus return work for the menu and the drawer; no console errors on any route.

## Deviations from the Figma draft and the kit

- **Product box** is an own component: the kit box has no product code, no net/VAT lines and is Košík-styled.
- **Category page** shows 12 of 14 products because "Dostupné dnes" is selected and two mock products are unavailable today.
- **Corner radius**: the Figma draft uses 8 px / 12 px / round shapes; Fresh components keep the older square makro style.
- **Sale tag** uses `#e01f56` from this draft (earlier selfcare work used `#990052`); one variable, `--mk-sale`.
- Product 3 shows an unit price (93,00 Kč/kg) copied from the Figma that does not match its price.
- Product photos are 206 px wide, soft when enlarged.
- **Mega-menu**: only the category "Párky, špekáčky, točené salámy" opens a page; every other link shows a toast. Block thumbnails exist only for Ovoce and Masné výrobky, the rest show a letter placeholder because makro.cz category data has no images. Each block lists four children and "+ Další", as on Košík.cz. The menu is a card aligned to the page container (max 1430 px, radius 0/8/8/8, light shadow, no gap under the nav bar) with the open trigger as a joined white tab, as measured on Košík.cz. It opens on hover after 250 ms and on click (a click within 500 ms of the hover pins it, a later click closes it); leaving closes it after 250 ms unless pinned. Esc inside the right side goes back to the list, a second Esc closes. The page does not scroll while it is open. The gray overlay copies Košík.cz: transparent at the nav bar, 15 % black from 20 vh below it (`--mk-backdrop-color` in `css/chrome.css`). Not copied: the diagonal-hover cone, 2-D arrow navigation in the right side and the height animation.
- Contrast: a few colours were darkened from the Figma values to reach 4.5:1 (sale note text, unavailable text, form placeholders).

## Filters (category page)

Read from kosik.cz (read-only, 2026-11-03) and the live makro filter column; code in `js/makro-filters.js`, `components/makro-filters-drawer.js`, `css/filters.css`, small hooks in `components/makro-category-page.js`.

- **One state, four views.** `Makro.categoryFilters.state` drives the product list, the quick pills (Dostupné dnes, Akce, Multikup), the subcategory tiles, the chips and the drawer. Starts with "Dostupné dnes" on (see deviations above), so the badge starts at 1. The state lives outside the page component: it survives a visit to a product page and back, but not a reload.
- **Toolbar** (as on Košík.cz): `Filtry` button with a badge (one per selected value, switch or price range), then the active filters as removable chips in the order they were set, then the quick pills that are still off; a quick pill and its chip are the same button. A text button "Zrušit filtry" ends the row. Product count, empty state ("Žádný produkt neodpovídá zvoleným filtrům" with reset) and sorting update; sorting is applied after filtering.
- **Drawer "Filtry a řazení"**: Fresh Drawer on the right (500 px, backdrop, slide in), Fresh BottomSheet at 768 px and below; header with close, switches on top (Dostupné dnes, Akce, Multikup, Zobrazit pouze smluvní položky, each with its count), accordion groups with the chosen values as subtitle, sorting as the last group (first on phones, as on Košík.cz), footer with "Zobrazit N produktů" and "Zrušit filtry" (resets and closes). Filters apply live behind the backdrop; the footer button only closes. Focus goes to the close button on open and back to "Filtry" on close (Esc, close, backdrop, buttons); focus is trapped; the count is announced in a live region.
- **Groups**: Cena (min / max fields and a two-handle slider in the current VAT mode, with its own Bez DPH / Včetně DPH switch), Podkategorie, Značka, Země původu, Hmotnost balení (do 1 kg / nad 1 kg do 2,5 kg / nad 2,5 kg), Typy stravování (Bez lepku, Bez laktózy), Certifikáty (Česká Potravina, KLASA, Regionální potravina). Values inside a group are OR, groups are AND. The price range is stored net, so switching VAT keeps the same filter and only changes the shown numbers.
- **Counts** are computed from the mock products against all other active filters (not the option's own group), as on Košík.cz; options with 0 results are disabled and sorted last (e.g. "Nad 2,5 kg (0)"). Lists get a search field from 10 options and "Zobrazit více (N)" above 6 (`Makro.filterConfig`); the mock data never reaches those sizes, so they were only checked with lowered thresholds.
- **Mock data** (invented, in `js/store.js`): brand and origin completed for all 14 sausage products (so p7, p11, p12, p13 now have a brand on the product page too), `weightKg`, `contract` (6 products), `certs`, `diet`. Diet and certificate values are not backed by the product page texts (every sausage page still says "bez lepku").
- **Differs from Košík.cz**: price group and "smluvní položky" switch (B2B, Košík has neither); makro groups Typy stravování and Certifikáty; button label shows the result count ("Zobrazit 12 produktů", Košík: "Zobrazit produkty"); bottom sheet on phones (Košík uses a full-screen drawer there); "Zrušit filtry" also as a text button in the toolbar (Košík has it only in the drawer); no `?filters=` URL and no localStorage (state is in memory only); no group-level "Akce" list, the pill is the only Akce filter; the page title does not get the " - Značka: ..." suffix.

## Not built

Search suggestions and results, mobile category menu (only a basic sheet), filters on other categories (only this category has the drawer data), shopping lists, order history and detail (the account area has mock order lists, see above), contract prices ("Vaše cena" marker; the filter switch exists, see Filters), role restrictions in the shop itself (the account area has a role switch, see above), language switch (CS / EN / VI), online card payment, persistence (everything resets on reload, except the selected delivery address and the VAT mode).

## Open decisions

1. **Page scope and Figma frames.** Homepage, product detail, cart, checkout have no frames. Are the live makro and kosik.cz structures the right target, or do designs exist?
2. **VAT wording.** Figma and live makro use "vč. DPH"; the Košík voice guide's default is "s DPH". Same for "Vybraná dodací adresa" (Figma) versus "doručení" in the guide (it avoids "dodací/dodání"). Pick one for the whole shop.
3. **Corner radius.** Square (earlier makro style) or rounded as in this draft? Today the shell and boxes are rounded, Fresh dropdowns square.
4. **Contract prices and assortment rules** (PA-17, PA-20, ADM-03/04/05, SCOPE-02 open): the "Zobrazit pouze smluvní položky" switch in the filter drawer works on 6 invented mock products, but there is no "Vaše cena" marker and no contracted alternatives (PA-29). Is the filter wanted as a switch, a chip or a default for contract customers, and what does a contract item look like in the listing?
5. **Purchase limit and approval** (REG-14/15, should-have): the checkout shows an approval path above a mock limit of 10 000 Kč. Confirm it is wanted and who approves.
6. **Roles** (REG-12): Viewer cannot buy, Purchaser buys only for assigned sites. No role switch yet.
7. **Allowed payment methods** (REG-08): three offline methods are mocked (invoice preferred, card and cash on delivery).
8. **Minimum order and fee**: 5 000 Kč and 500 Kč taken from the live shop sample; confirm they apply per customer or per site, and whether the fee is shown net.
9. **Order deadline and delivery slots**: the countdown targets 23:00 today in the mock. Real cut-off rules per slot are unknown.
10. **PO number and cost centre** (ORD-41/42): optional free text in the mock. Are they required for some customers, and are cost centres a managed list?
11. **Returnable packaging** (ORD-32): shown as "Záloha za obaly" 0,00 Kč and an information note only.
12. **Weighed goods ("cca")**: the mock says weight and price may differ slightly; real invoicing rule needed.
13. **Voice guide gaps**: "Rekapitulace objednávky" (stiff?), "Poplatek za objednávku pod minimem" (default term), "uzávěrka objednávek" (default term), "Multikup" (Košík brand term in a makro shop), B2B service name still undecided.
14. **Languages**: CS only today; EN and VI planned in the handoff but not started.
15. **Connection to the selfcare prototype**: the account area is now copied into this prototype (`selfcare/`, see above) instead of linking out. The copy can drift from the selfcare repository; who owns changes to the account pages from now on, and how often is it re-synced?
16. **Hosting and file size**: about 3 MB of vendor files. Hosting limits unknown.
17. **Public repository.** `vendor/` (Košík's Fresh design system, Vue and Tailwind builds) is committed so the site runs from a plain static host. Confirm that Fresh may be public. The handoff document with internal paths, IDs and hosts is deliberately not committed.
18. **Filter state in the URL.** Košík.cz keeps filters in `?filters=` and in localStorage (back button, shareable links). The prototype keeps them in memory only. Wanted in the real shop?
19. **Filter groups for makro.** Which of the live makro groups are needed (Nákupní režim, Propagace, Typy stravování, Certifikáty, "pouze vlastní značky Makro") and are price and weight band wanted at all (Košík.cz has no price filter). "Multikup" as a filter name is a Košík term, see 13.
20. **Filters on phones.** Bottom sheet (brief) versus the full-screen drawer Košík.cz uses; apply live or with an apply button.
21. **Role restrictions in the store.** The role switch (Vlastník, Správce účtu, Nákupčí, Prohlížející) only changes the account pages and the selectable delivery addresses. Should a viewer (Prohlížející) be unable to buy, and a buyer only buy for assigned addresses (REG-12)? The store pages ignore the role today.
22. **Which account pages are wanted in the store.** All 16 selfcare pages came along (including credits, savings, favourites, notifications, contracts). Which belong to the shop, which stay in a separate self-care site? "Nákupní seznamy" and "Moje oblíbené" overlap with shop features that do not exist here yet.
23. **Checkout contact from the user profile.** The checkout still pre-fills the mock buyer "Jan Malý" while the account menu shows "Ondřej Ukázkový" (owner). Should the contact default to the logged-in user (`App.me()`), and should the purchase limit and role label (REG-14/15) come from the role too?
24. **Delivery address label in the header.** With an optional "Název provozovny" the label is long. Show name and street on two lines, shorten, or show only the name when it exists?
25. **Address and cart.** Changing the address to another delivery area asks for confirmation when the cart is not empty (mock areas, illustrative); should the cart prices and availability really change, and should the delivery slots follow the selected address?
26. **Language switch.** CS/EN/VI exists in selfcare and is not ported (see 14).
