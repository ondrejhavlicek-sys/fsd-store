# makro eshop prototype: notes and open decisions

Written 2026-10-29. Clickable mockup of the makro B2B eshop (mock data only, Czech UI, no backend).
Start it with `python3 serve.py 5190` and open `http://localhost:5190/index.html`.

## Screens

| Route | Screen | Reference used |
|---|---|---|
| `#/` | Homepage | no Figma frame; kit homepage, kosik.cz, live makro homepage |
| `#/kategorie/parky-spekacky-tocene-salamy` | Category page | Figma FSD-Store `18:5253` |
| `#/produkt/:id` | Product detail (35 mock products) | no Figma frame; kosik.cz and live makro product page |
| `#/kosik` | Cart | no Figma frame; live makro cart |
| `#/pokladna` | Checkout (order recap) | data model draft hooks; no live reference |
| `#/objednavka` | Order confirmation | – |
| header cart button | Cart preview (popover, bottom sheet on mobile) | live makro cart panel, kosik.cz preview |

Shell: header, navigation bar and footer from the Figma draft (`18:5299`, `18:5319`, `18:5392`).

## How it is built

- No build step. Static files, classic scripts, Vue 3 (dev build, in-DOM compiler) and the Fresh design system (`vendor/kosik-ui.js`) for the dropdown menus, with the Tailwind runtime.
- `components/makro-*.js` are the prototype's own components (header and footer, product box, one file per page, cart preview). All state and mock data live in `js/store.js` (`window.Makro`).
- Styles: `css/store.css` (page layout, category page, product box), `chrome.css`, `product.css`, `home.css`, `cart.css`, `checkout.css`. `makro-fresh.css` and `js/makro-theme.js` restyle Fresh components to makro blue and square corners.
- Prices are net (without VAT) in the data; VAT is a flat 12 % on goods and 21 % on the minimum-order fee. The Bez DPH / Včetně DPH switch changes which price is the headline price.

## Deviations from the Figma draft and the kit

- **Product box** is an own component: the kit box has no product code, no net/VAT lines and is Košík-styled.
- **Category page** shows 12 of 14 products because "Dostupné dnes" is selected and two mock products are unavailable today.
- **Corner radius**: the Figma draft uses 8 px / 12 px / round shapes; Fresh components keep the older square makro style.
- **Sale tag** uses `#e01f56` from this draft (earlier selfcare work used `#990052`); one variable, `--mk-sale`.
- Product 3 shows an unit price (93,00 Kč/kg) copied from the Figma that does not match its price.
- Product photos are 206 px wide, soft when enlarged.
- Contrast: a few colours were darkened from the Figma values to reach 4.5:1 (sale note text, unavailable text, form placeholders).

## Not built

Search suggestions and results, category mega-menu, Filtry drawer, shopping lists, order history and detail, account area (link out to the selfcare prototype planned), contract prices ("Vaše cena"), role switch (Prohlížející), language switch (CS / EN / VI), online card payment, persistence (everything resets on reload).

## Open decisions

1. **Page scope and Figma frames.** Homepage, product detail, cart, checkout have no frames. Are the live makro and kosik.cz structures the right target, or do designs exist?
2. **VAT wording.** Figma and live makro use "vč. DPH"; the Košík voice guide's default is "s DPH". Same for "Vybraná dodací adresa" (Figma) versus "doručení" in the guide (it avoids "dodací/dodání"). Pick one for the whole shop.
3. **Corner radius.** Square (earlier makro style) or rounded as in this draft? Today the shell and boxes are rounded, Fresh dropdowns square.
4. **Contract prices and assortment rules** (PA-17, PA-20, ADM-03/04/05, SCOPE-02 open): "Vaše cena" marker, "Zobrazit pouze smluvní položky" filter, contracted alternatives (PA-29). Not shown anywhere yet.
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
17. **Public repository.** `vendor/` holds Košík's Fresh design system and Vue/Tailwind builds, and `docs/ESHOP-PROJECT-HANDOFF.md` mentions internal paths, IDs and hosts. Decide what may be public before anything is committed.
