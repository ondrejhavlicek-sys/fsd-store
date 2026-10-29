/* Shared prototype state + mock data (Czech, mock only; nothing here is real makro data).
   window.Makro.store is a Vue.reactive object: pages and the header read it, product boxes write to it.
   VAT is a flat 12 % in the mock (food), like the selfcare prototype. */
(function () {
  const Makro = (window.Makro = window.Makro || {})
  const nbsp = ' '
  const VAT = 0.12

  const dec2 = new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const num = (n) => dec2.format(n).replace(/ /g, nbsp) // 19278.8 -> "19 278,80"
  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100
  const gross = (net) => round2(net * (1 + VAT))

  /* 1 produkt / 2–4 produkty / 5+ produktů */
  const plural = (n, one, few, many) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)

  /* ---------- category: Párky, špekáčky, točené salámy (Figma "category page" 18:5253) ---------- */
  const category = {
    title: 'Párky, špekáčky, točené salámy',
    breadcrumbs: ['Hlavní stránka', 'Potraviny', 'Čerstvé, chlazené', 'Masné výrobky', 'Párky, špekáčky, točené salámy'],
    subcategories: [
      { id: 'parky', name: 'Párky', image: 'assets/tiles/parky.png' },
      { id: 'spekacky', name: 'Špekáčky', image: 'assets/tiles/spekacky.png' },
      { id: 'salamy', name: 'Točené salámy', image: 'assets/tiles/tocene-salamy.png' },
    ],
  }

  /* net = price without VAT; old = original net price when on sale; unitPrice is printed as given */
  const P = (n, code, name, sub, o) =>
    Object.assign({ id: 'p' + n, code, name, sub, image: 'assets/products/p' + String(n).padStart(2, '0') + '.png', pack: 'cca 1 kg / ks', weight: 'cca 1 kg', unitPrice: '202,90 Kč/kg', net: 202.9, today: true }, o)

  const products = [
    P(1, '241626', 'METRO Chef Vídeňské párky chlaz. cca 1 kg', 'parky', { net: 139.9, old: 173.9, sale: '-20 % do 10. 6.', unitPrice: '139,90 Kč/kg' }),
    P(2, '241627', 'PRANTL Párky vídeňské mini chlaz. váž. cca 1 kg', 'parky', {}),
    P(3, '215657', 'KOSTELECKÉ UZENINY Párky tenké chlaz. váž. cca 2,5 kg', 'parky', { net: 89.9, old: 110.9, sale: '-20 % do 10. 6.', pack: 'cca 2,5 kg / ks', weight: 'cca 2,5 kg', unitPrice: '93,00 Kč/kg' }),
    P(4, '241628', 'PRANTL Párky vídeňské mini chlaz. váž. cca 1 kg', 'parky', { multikup: true }),
    P(5, '241629', 'PRANTL Párky vídeňské mini chlaz. váž. cca 1 kg', 'parky', { today: false }),
    P(6, '241630', 'METRO Chef Hot Dog párky chlaz. váž. cca 1 kg', 'parky', {}),
    P(7, '241631', 'Párky tenké chlaz. váž. cca 1 kg', 'parky', {}),
    P(8, '241632', 'PRANTL Párky vídeňské mini chlaz. váž. cca 1 kg', 'parky', { multikup: true }),
    P(9, '241633', 'PRANTL Párky vídeňské mini chlaz. váž. cca 1 kg', 'parky', { today: false }),
    P(10, '241634', 'PRANTL Špekáčky chlaz. váž. cca 1 kg', 'spekacky', {}),
    P(11, '241635', 'Špekáčky grilovací chlaz. váž. cca 1 kg', 'spekacky', {}),
    P(12, '241636', 'Párky 80 % masa chlaz. váž. cca 1 kg', 'spekacky', {}),
    P(13, '241637', 'Točené salámy chlaz. váž. cca 1 kg', 'salamy', {}),
    P(14, '241638', 'BERLINKI Classic párky chlaz. cca 1 kg', 'salamy', {}),
  ]
  products.forEach((p) => (p.cat = 'masne'))

  /* fruit range for the homepage rails (photos from the selfcare prototype); prices are net */
  const F = (n, name, pack, net, unitPrice, o) => {
    const p = Object.assign({ id: 'f' + n, code: String(310000 + n * 13), name, sub: 'ovoce', cat: 'ovoce', image: 'assets/products/f' + String(n).padStart(2, '0') + '.png', pack, weight: pack, unitPrice: unitPrice || '', net, today: true }, o)
    if (p.old) p.sale = '-' + Math.round((1 - p.net / p.old) * 100) + ' % do 2. 11.'
    return p
  }
  const fruit = [
    F(1, 'Hrozny červené bezsemenné', '500 g', 59.9, '119,80 Kč/kg'),
    F(2, 'Jablko Gala, 1 ks', 'cca 170 g', 8.9, '49,90 Kč/kg'),
    F(3, 'Meloun Galia, 1 ks', 'cca 1,14 kg', 62.9, '54,90 Kč/kg', { old: 89.9 }),
    F(4, 'Blumy modré, vanička', '500 g', 44.9, '89,80 Kč/kg', { old: 89.9 }),
    F(5, 'Mandarinky, síťka', '1 kg', 59.9, '59,90 Kč/kg'),
    F(6, 'Meruňky, vanička', '500 g', 79.9, '159,80 Kč/kg'),
    F(7, 'Avokádo Hass „Ready to Eat“ velké, 1 ks', '250 g', 57.9, '231,60 Kč/kg'),
    F(8, 'Mango „Ready to Eat“, 1 ks', '500 g', 59.9, '119,80 Kč/kg'),
    F(9, 'Hrozny tmavé extra sladké, vanička', '300 g', 69.9, '233,00 Kč/kg'),
    F(10, 'Jablka červená balená', '1 kg', 39.9, '39,90 Kč/kg'),
    F(11, 'Švestky, vanička', '1 kg', 59.9, '59,90 Kč/kg'),
    F(12, 'BIO Kokos Drink&Eat', '1 ks', 66.9, '66,90 Kč/ks', { old: 99.9 }),
    F(13, 'Pomeranč, 1 ks', 'cca 250 g', 12.9, '49,90 Kč/kg'),
    F(14, 'METRO Chef Limeta, 1 ks', '1 ks', 9.9, '12,90 Kč/ks', { multikup: true }),
    F(15, 'Avokádo Hass „Ready to Eat“, 2 ks', '330 g', 64.9, '196,67 Kč/kg'),
    F(16, 'Borůvky kanadské, vanička', '125 g', 44.9, '359,20 Kč/kg'),
    F(17, 'Meruňky, vanička', '1 kg', 97.9, '97,90 Kč/kg', { today: false }),
    F(18, 'Hrozny bílé bezsemenné', '500 g', 69.9, '139,80 Kč/kg'),
    F(19, 'Kiwi „Ready to Eat“, tácek', '4 ks', 67.9, '16,98 Kč/ks'),
    F(20, 'Granátové jablko vyloupané', '250 g', 118.9, '475,60 Kč/kg', { old: 179.9 }),
    F(21, 'Citrony, síť', '500 g', 39.9, '79,80 Kč/kg'),
  ]
  const sausages = products.slice()
  products.push(...fruit)
  products.forEach((p) => (p.gross = gross(p.net), p.oldGross = p.old ? gross(p.old) : null))

  /* ---------- product detail extras (all mock) ---------- */
  const BRAND = { p1: 'METRO Chef', p2: 'PRANTL', p3: 'KOSTELECKÉ UZENINY', p4: 'PRANTL', p5: 'PRANTL', p6: 'METRO Chef', p8: 'PRANTL', p9: 'PRANTL', p10: 'PRANTL', p14: 'BERLINKI' }
  products.forEach((p, i) => {
    p.brand = BRAND[p.id] || null
    p.supplierRef = String(329000 + i * 37)
    p.origin = p.cat === 'ovoce' ? 'Dle aktuální nabídky' : 'Česká republika'
  })
  /* the next free delivery slot of the selected address (mock; today is Thu 29. 10. 2026) */
  const slots = [
    { date: 'pá 30. 10. 2026', slot: '8:00–11:00' },
    { date: 'pá 30. 10. 2026', slot: '11:00–14:00' },
    { date: 'po 2. 11. 2026', slot: '8:00–11:00' },
    { date: 'po 2. 11. 2026', slot: '11:00–14:00' },
  ]
  const delivery = Vue.reactive({ date: slots[0].date, slot: slots[0].slot, nextAfter: 'po 2. 11. 2026', address: 'Evropská 2758/11, 160 00 Praha 6' })
  const detail = (p) => ({
    description: p.cat === 'ovoce'
      ? [p.name + '. Čerstvé ovoce vybírané podle kvality a zralosti, vhodné pro gastronomii i maloobchod.', 'Původ a odrůda se mohou podle aktuální nabídky lišit. Zboží uchovávejte v chladu a před konzumací omyjte.']
      : [
          p.name + '. Chlazený masný výrobek určený pro gastronomii a maloobchod, vhodný k ohřevu ve vodě nebo na grilu.',
          'Vyrobeno z kvalitního masa, bez lepku. Výrobek je prodáván vážený; skutečná hmotnost se může od uvedené lišit a fakturuje se podle skutečné hmotnosti.',
        ],
    storage: p.cat === 'ovoce' ? 'Skladujte při teplotě od +8 °C do +12 °C.' : 'Skladujte při teplotě od 0 °C do +4 °C.',
    shelfLife: p.cat === 'ovoce' ? 'Minimální trvanlivost od doručení: 5 dní' : 'Minimální trvanlivost od doručení: 14 dní',
    supplier: 'Makro Cash & Carry ČR s.r.o., Jeremiášova 1249/7, 150 00 Praha 5, Česká republika',
    composition: p.cat === 'ovoce' ? 'Ovoce.' : 'Vepřové maso (62 %), voda, hovězí maso (12 %), vepřový tuk, sůl, dextróza, stabilizátory (difosforečnany), koření, extrakty koření, antioxidant (askorbát sodný), konzervant (dusitan sodný).',
    allergens: p.cat === 'ovoce' ? 'Neobsahuje.' : 'Může obsahovat stopy hořčice a celeru.',
    nutrition: [
      ['Energetická hodnota', '1 010 kJ / 243 kcal'],
      ['Tuky', '21 g'],
      ['z toho nasycené mastné kyseliny', '8,5 g'],
      ['Sacharidy', '1,2 g'],
      ['z toho cukry', '0,5 g'],
      ['Bílkoviny', '12 g'],
      ['Sůl', '2,1 g'],
    ],
    facts: [
      ['Kód produktu', p.code],
      ['Balení', p.pack],
      ['Země původu', p.origin],
      ['Značka', p.brand || '—'],
      ['Skladování', p.cat === 'ovoce' ? 'Chladno, +8 až +12 °C' : 'Chlazené, 0 až +4 °C'],
      ['Číslo dodavatele', p.supplierRef],
    ],
  })
  const similar = (p) => products.filter((x) => x.id !== p.id && x.cat === p.cat && x.sub === p.sub).concat(products.filter((x) => x.id !== p.id && x.cat === p.cat && x.sub !== p.sub)).slice(0, 7)
  const sameBrand = (p) => (p.brand ? products.filter((x) => x.id !== p.id && x.brand === p.brand).slice(0, 7) : [])
  /* ---------- homepage mock data ---------- */
  const home = {
    banners: [
      { id: 'b1', theme: 'navy', kicker: 'Vánoce', title: 'Objednejte vánoční sortiment s předstihem', text: 'Cukrovinky, ryby, víno i dekorace. Dodáme přesně na vaši provozovnu.', cta: 'Zobrazit nabídku' },
      { id: 'b2', theme: 'blue', kicker: 'Akce týdne', title: 'Čerstvé ovoce za výhodné ceny', text: 'Vybrané druhy ovoce a zeleniny se slevou až 30 % do 2. 11.', cta: 'Zobrazit akce' },
      { id: 'b3', theme: 'yellow', kicker: 'Rychle a jednoduše', title: 'Zopakujte poslední objednávku jedním klikem', text: 'Stejné položky, stejná provozovna, nový termín dodání.', cta: 'Znovu objednat' },
    ],
    lastOrder: { no: '9-100000123', date: 'čt 22. 10. 2026', status: 'Doručeno', net: 2684.4, lines: [['p2', 2], ['f2', 12], ['f10', 4], ['f13', 6], ['f21', 3]] },
    lists: [{ id: 'l1', name: 'Týdenní nákup', count: 5 }, { id: 'l2', name: 'Víkendové menu', count: 4 }],
    promoGroups: [
      { id: 'sale', title: 'Akce do 2. 11.', ids: ['f3', 'f4', 'f12', 'f20', 'p1', 'p3', 'f14'] },
      { id: 'fruit', title: 'Čerstvé ovoce', ids: ['f1', 'f2', 'f5', 'f6', 'f7', 'f8', 'f9'] },
      { id: 'meat', title: 'Masné výrobky', ids: ['p2', 'p6', 'p10', 'p14', 'p7', 'p11', 'p13'] },
    ],
    tiles: [
      { name: 'Banány a exotické', image: 'assets/tiles/t01.png', fruit: true }, { name: 'Citrusy', image: 'assets/tiles/t02.png', fruit: true },
      { name: 'Hrozny', image: 'assets/tiles/t03.png', fruit: true }, { name: 'Jablka', image: 'assets/tiles/t04.png', fruit: true },
      { name: 'Jahody a bobuloviny', image: 'assets/tiles/t05.png', fruit: true }, { name: 'Hrušky', image: 'assets/tiles/t06.png', fruit: true },
      { name: 'Peckoviny', image: 'assets/tiles/t07.png', fruit: true }, { name: 'Melouny', image: 'assets/tiles/t08.png', fruit: true },
      { name: 'Párky', image: 'assets/tiles/parky.png' }, { name: 'Špekáčky', image: 'assets/tiles/spekacky.png' }, { name: 'Točené salámy', image: 'assets/tiles/tocene-salamy.png' },
    ],
    promos: [
      { id: 'card', theme: 'navy', title: 'Získejte makro kartu', text: 'Bonusový program a speciální ceny pro vaše podnikání.' },
      { id: 'flyer', theme: 'blue', title: 'Letáky a akce', text: 'Aktuální nabídky pro gastronomii a maloobchod.' },
      { id: 'gastro', theme: 'yellow', title: 'Vše pro gastronomii', text: 'Suroviny, vybavení a služby na jednom místě.' },
    ],
  }
  /* order deadline for the next delivery (mock): today 23:00, or tomorrow when that has passed */
  const deadline = () => { const d = new Date(); d.setHours(23, 0, 0, 0); if (d <= new Date()) d.setDate(d.getDate() + 1); return d }
  /* HH:MM:SS left until the order deadline; ticks while the calling component is mounted */
  const useCountdown = () => {
    const now = Vue.ref(Date.now()), end = deadline().getTime()
    let t
    Vue.onMounted(() => { t = setInterval(() => (now.value = Date.now()), 1000) })
    Vue.onUnmounted(() => clearInterval(t))
    const p2 = (n) => String(n).padStart(2, '0')
    return Vue.computed(() => {
      const sec = Math.max(0, Math.floor((end - now.value) / 1000))
      return p2(Math.floor(sec / 3600)) + ':' + p2(Math.floor((sec % 3600) / 60)) + ':' + p2(sec % 60)
    })
  }
  const minOrder = { net: 5000, fee: 500 }
  const reorder = () => {
    let n = 0
    home.lastOrder.lines.forEach(([id, q]) => { setQty(id, (store.cart[id] || 0) + q); n++ })
    return n
  }
  /* ---------- checkout (mock) ---------- */
  /* the logged-in user; REG-12 roles, REG-14/15 purchase limit with approval (should-have, unconfirmed) */
  const user = { name: 'Jan Malý', role: 'Nákupčí', limit: 10000 }
  /* only the payment methods the customer is allowed to use are listed (REG-08, unconfirmed) */
  const payments = [
    { id: 'invoice', label: 'Faktura', text: 'Splatnost 14 dní, fakturu pošleme e-mailem.', preferred: true },
    { id: 'card-delivery', label: 'Platba kartou při doručení', text: 'Platba terminálem u řidiče.' },
    { id: 'cash', label: 'Hotově při doručení', text: 'Připravte prosím odpočítanou částku.' },
  ]
  const today = () => new Date().toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' })
  const placeOrder = () => {
    const sum = summary()
    const needsApproval = sum.totalNet > user.limit
    const no = '9-' + String(100000000 + Math.floor(Math.random() * 899999999))
    const c = store.checkout
    const lines = cartLines().map((id) => ({ id, name: byId(id).name, qty: store.cart[id], net: round2(byId(id).net * store.cart[id]) }))
    store.placed = {
      no, date: today(), needsApproval, sum, lines,
      delivery: { date: delivery.date, slot: delivery.slot, address: delivery.address },
      contact: { name: c.name, phone: c.phone, email: c.email }, po: c.po, costCenter: c.costCenter, note: c.note,
      payment: payments.find((x) => x.id === c.payment).label,
    }
    home.lastOrder = { no, date: today(), status: needsApproval ? 'Čeká na schválení' : 'Přijato', lines: lines.map((l) => [l.id, l.qty]) }
    clearCart()
    store.terms = false
    return no
  }
  const openProduct = (id) => { location.hash = '#/produkt/' + id }

  /* ---------- state ---------- */
  const safe = { get: (k) => { try { return localStorage.getItem(k) } catch (e) { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch (e) {} } }

  const store = Vue.reactive({
    vat: safe.get('fsd-vat') === 'gross' ? 'gross' : 'net', // which price is the headline price
    /* product id -> pieces. Mock starting cart: 7 lines, just under the 5 000 Kč minimum order so the fee pattern is visible */
    cart: { p2: 1, f1: 12, f5: 10, f10: 20, f13: 48, p6: 3, f21: 10 },
    fav: {},
    terms: false, // terms accepted on the cart page
    checkout: { name: 'Jan Malý', phone: '+420 777 123 456', email: 'jan.maly@example.cz', po: '', costCenter: '', note: '', payment: 'invoice' },
    placed: null, // snapshot of the order just placed (confirmation page)
    toast: '',
  })

  const byId = (id) => products.find((p) => p.id === id)
  const cartLines = () => Object.keys(store.cart).filter((id) => store.cart[id] > 0)
  const totals = () => {
    let net = 0, gr = 0
    cartLines().forEach((id) => { const p = byId(id); net += p.net * store.cart[id]; gr += p.gross * store.cart[id] })
    return { lines: cartLines().length, net: round2(net), gross: round2(gr) }
  }
  /* order summary as on the live makro cart: goods, returnable packaging, fees (VAT 21 % on the fee), totals */
  const FEE_VAT = 0.21
  const summary = () => {
    const t = totals()
    const units = cartLines().reduce((a, id) => a + store.cart[id], 0)
    const fee = t.lines && t.net < minOrder.net ? minOrder.fee : 0
    const totalNet = round2(t.net + fee)
    const vat = round2(t.gross - t.net + fee * FEE_VAT)
    return { lines: t.lines, units, goodsNet: t.net, returnable: 0, fee, totalNet, vat, totalGross: round2(totalNet + vat) }
  }
  const clearCart = () => Object.keys(store.cart).forEach((id) => delete store.cart[id])
  const addByCode = (code) => {
    const p = products.find((x) => x.code === code.trim())
    if (!p) return null
    setQty(p.id, (store.cart[p.id] || 0) + 1)
    return p
  }
  const setQty = (id, qty) => { qty = Math.max(0, Math.min(99, qty)); if (qty) store.cart[id] = qty; else delete store.cart[id] }
  const setVat = (v) => { store.vat = v; safe.set('fsd-vat', v) }
  let toastTimer
  const toast = (msg) => { store.toast = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => (store.toast = ''), 2600) }

  Object.assign(Makro, { useCountdown, user, payments, placeOrder, slots, summary, clearCart, addByCode, categoryHash: '#/kategorie/parky-spekacky-tocene-salamy', home, deadline, minOrder, reorder, sausages, delivery, detail, similar, sameBrand, openProduct, VAT, num, kc: (n) => num(n) + nbsp + 'Kč', round2, gross, plural, category, products, store, byId, totals, setQty, setVat, toast })
})()
