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
| header cart button | Cart preview (popover, bottom sheet on mobile) | live makro cart panel, kosik.cz preview |
| Potraviny, Nepotravinové zboží | Category mega-menu: group list on the left, blocks with their children on the right (desktop; basic sheet on mobile) | kosik.cz "Produkty" menu, category tree of sortiment.makro.cz (`js/nav-data.js`, read 2026-11-03) |

Shell: header, navigation bar (Potraviny, Nepotravinové zboží, then Nákupní seznamy and Poslední objednávky with leading icons, in the way of the selfcare prototype) and footer from the Figma draft (`18:5299`, `18:5319`, `18:5392`).

## How it is built

- No build step. Static files, classic scripts, Vue 3 (dev build, in-DOM compiler) and the Fresh design system (`vendor/kosik-ui.js`) for the dropdown menus, with the Tailwind runtime.
- `components/makro-*.js` are the prototype's own components (header and footer, product box, one file per page, cart preview, filters drawer). All state and mock data live in `js/store.js` (`window.Makro`); the category filter state and counts live in `js/makro-filters.js`.
- Styles: `css/store.css` (page layout, category page, product box), `css/filters.css` (filter bar extras, drawer), `chrome.css`, `product.css`, `home.css`, `cart.css`, `checkout.css`. `makro-fresh.css` and `js/makro-theme.js` restyle Fresh components to makro blue and square corners.
- Prices are net (without VAT) in the data; VAT is a flat 12 % on goods and 21 % on the minimum-order fee. The Bez DPH / Včetně DPH switch changes which price is the headline price.

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

Search suggestions and results, mobile category menu (only a basic sheet), filters on other categories (only this category has the drawer data), shopping lists, order history and detail, account area (link out to the selfcare prototype planned), contract prices ("Vaše cena" marker; the filter switch exists, see Filters), role switch (Prohlížející), language switch (CS / EN / VI), online card payment, persistence (everything resets on reload).

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
15. **Connection to the selfcare prototype**: link out only (decided), but the two prototypes are not hosted together yet.
16. **Hosting and file size**: about 3 MB of vendor files. Hosting limits unknown.
17. **Public repository.** `vendor/` (Košík's Fresh design system, Vue and Tailwind builds) is committed so the site runs from a plain static host. Confirm that Fresh may be public. The handoff document with internal paths, IDs and hosts is deliberately not committed.
18. **Filter state in the URL.** Košík.cz keeps filters in `?filters=` and in localStorage (back button, shareable links). The prototype keeps them in memory only. Wanted in the real shop?
19. **Filter groups for makro.** Which of the live makro groups are needed (Nákupní režim, Propagace, Typy stravování, Certifikáty, "pouze vlastní značky Makro") and are price and weight band wanted at all (Košík.cz has no price filter). "Multikup" as a filter name is a Košík term, see 13.
20. **Filters on phones.** Bottom sheet (brief) versus the full-screen drawer Košík.cz uses; apply live or with an apply button.
