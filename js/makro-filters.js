/* Category-page filters: ONE state object read by the toolbar pills, the subcategory tiles, the chips,
   the "Filtry" drawer and the product list. Everything is computed client side from the mock products
   (counts too), nothing is real makro data. UI: components/makro-filters-drawer.js, css/filters.css.
   Behaviour copied from kosik.cz: filters apply live (the drawer button only closes it), options are counted
   against all OTHER active filters, options without results are disabled and sorted last, the active count
   adds one per selected value, the quick pills are the same state as the matching drawer toggles.
   The state lives here (not in the page component), so it survives a visit to a product page and back. */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const EPS = 0.005
  const cz = new Intl.Collator('cs')
  const int = (n) => Math.round(n).toLocaleString('cs-CZ').replace(/\s/g, ' ')

  /* thresholds of the checkbox lists (Košík: search from 10 options; makro: first 8 brands, then "Zobrazit vše") */
  Makro.filterConfig = { searchMin: 10, moreLimit: 6, moreShown: 5 }

  /* yes/no filters: shown as switches in the drawer; today, sale and multi are also quick pills in the toolbar */
  const TOGGLES = [
    { key: 'today', label: 'Dostupné dnes', test: (p) => !!p.today, pill: true },
    { key: 'sale', label: 'Akce', test: (p) => !!p.sale, pill: true },
    { key: 'multi', label: 'Multikup', test: (p) => !!p.multikup, pill: true },
    { key: 'contract', label: 'Zobrazit pouze smluvní položky', chip: 'Smluvní položky', test: (p) => !!p.contract },
  ]
  const BANDS = [
    { id: 'w1', label: 'Do 1 kg', test: (kg) => kg <= 1 },
    { id: 'w2', label: 'Nad 1 kg do 2,5 kg', test: (kg) => kg > 1 && kg <= 2.5 },
    { id: 'w3', label: 'Nad 2,5 kg', test: (kg) => kg > 2.5 },
  ]
  const SORTS = [
    { key: 'recommended', label: 'Doporučené' },
    { key: 'cheapest', label: 'Nejlevnější' },
    { key: 'priciest', label: 'Nejdražší' },
    { key: 'name', label: 'Název A–Z' },
  ]

  function createFilters(products, subs) {
    const store = Makro.store
    const blank = () => ({ today: false, sale: false, multi: false, contract: false, sub: [], brand: [], origin: [], weight: [], cert: [], diet: [], min: null, max: null })
    /* price bounds min / max are NET prices (null = open), so a VAT switch keeps the meaning of the filter */
    const state = Vue.reactive(Object.assign(blank(), { today: true, sort: 'recommended' }))
    const stamps = Vue.reactive({ today: 0 }) // activation order of the chips
    let seq = 0
    const stamp = (key) => (stamps[key] = ++seq)

    /* list groups: values come from the products, ordered by how many products carry them */
    const byFreq = (get) => {
      const n = {}
      products.forEach((p) => get(p).forEach((v) => (n[v] = (n[v] || 0) + 1)))
      return Object.keys(n).sort((a, b) => n[b] - n[a] || cz.compare(a, b)).map((v) => ({ id: v, label: v }))
    }
    const GROUPS = [
      { id: 'sub', title: 'Podkategorie', get: (p) => [p.sub], options: subs.map((s) => ({ id: s.id, label: s.name })) },
      { id: 'brand', title: 'Značka', get: (p) => (p.brand ? [p.brand] : []) },
      { id: 'origin', title: 'Země původu', get: (p) => (p.origin ? [p.origin] : []) },
      { id: 'weight', title: 'Hmotnost balení', get: (p) => BANDS.filter((b) => p.weightKg != null && b.test(p.weightKg)).map((b) => b.id), options: BANDS.map((b) => ({ id: b.id, label: b.label })) },
      { id: 'diet', title: 'Typy stravování', get: (p) => p.diet || [] },
      { id: 'cert', title: 'Certifikáty', get: (p) => p.certs || [] },
    ]
    GROUPS.forEach((g) => { if (!g.options) g.options = byFreq(g.get) })
    const labelOf = (g, v) => (g.options.find((o) => o.id === v) || { label: v }).label

    /* ---------- price (shown in the current VAT mode, whole Kč) ---------- */
    const rate = () => 1 + Makro.VAT
    const gross = () => store.vat === 'gross'
    const shownOf = (p) => (gross() ? p.gross : p.net)
    const toShown = (net) => Math.round(gross() ? net * rate() : net)
    const fromShown = (v) => (gross() ? v / rate() : v)
    const bounds = Vue.computed(() => {
      const v = products.map(shownOf)
      return { lo: Math.floor(Math.min(...v)), hi: Math.ceil(Math.max(...v)) }
    })
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
    const price = Vue.computed(() => {
      const { lo, hi } = bounds.value
      return {
        lo, hi,
        min: state.min == null ? lo : clamp(toShown(state.min), lo, hi),
        max: state.max == null ? hi : clamp(toShown(state.max), lo, hi),
        on: state.min != null || state.max != null,
      }
    })
    /* min / max in the shown unit; a value on the edge of the range means "open" */
    const setPrice = (min, max) => {
      const { lo, hi } = bounds.value
      min = clamp(Math.round(min), lo, hi)
      max = clamp(Math.round(max), lo, hi)
      if (min > max) min = max
      const was = state.min != null || state.max != null
      state.min = min <= lo ? null : fromShown(min)
      state.max = max >= hi ? null : fromShown(max)
      const on = state.min != null || state.max != null
      if (on && !was) stamp('price')
      if (!on) delete stamps.price
    }

    /* ---------- matching and counts ---------- */
    const match = (p, skip) => {
      for (const t of TOGGLES) if (skip !== t.key && state[t.key] && !t.test(p)) return false
      for (const g of GROUPS) {
        if (skip !== g.id && state[g.id].length && !g.get(p).some((v) => state[g.id].includes(v))) return false
      }
      if (skip !== 'price') {
        if (state.min != null && p.net < state.min - EPS) return false
        if (state.max != null && p.net > state.max + EPS) return false
      }
      return true
    }
    const list = Vue.computed(() => {
      let r = products.filter((p) => match(p))
      if (state.sort === 'cheapest') r = r.slice().sort((a, b) => a.net - b.net)
      else if (state.sort === 'priciest') r = r.slice().sort((a, b) => b.net - a.net)
      else if (state.sort === 'name') r = r.slice().sort((a, b) => a.name.localeCompare(b.name, 'cs'))
      return r
    })

    /* a toggle or option is counted against every other active filter, but not against its own group */
    const toggles = Vue.computed(() =>
      TOGGLES.map((t) => {
        const count = products.filter((p) => match(p, t.key) && t.test(p)).length
        return { key: t.key, label: t.label, pill: !!t.pill, on: state[t.key], count, disabled: !state[t.key] && count === 0 }
      }),
    )
    const groups = Vue.computed(() =>
      GROUPS.map((g) => {
        const sel = state[g.id]
        const pool = products.filter((p) => match(p, g.id))
        const options = g.options
          .map((o) => {
            const count = pool.filter((p) => g.get(p).includes(o.id)).length
            const selected = sel.includes(o.id)
            return { id: o.id, label: o.label, count, selected, disabled: !selected && count === 0 }
          })
          .sort((a, b) => Number(a.disabled) - Number(b.disabled)) // stable: disabled options go last
        return { id: g.id, title: g.title, options, subtitle: sel.map((v) => labelOf(g, v)).join(', ') }
      }),
    )

    /* ---------- actions (all of them record the chip order) ---------- */
    const setToggle = (key, on) => {
      if (on && !state[key]) stamp(key)
      if (!on) delete stamps[key]
      state[key] = !!on
    }
    const setItem = (gid, id, on) => {
      const a = state[gid], i = a.indexOf(id)
      if (on && i < 0) { a.push(id); stamp(gid + ':' + id) }
      if (!on && i >= 0) { a.splice(i, 1); delete stamps[gid + ':' + id] }
    }
    /* subcategory tile: select just this one, or clear when it already is the only one selected */
    const pickSub = (id) => {
      const only = state.sub.length === 1 && state.sub[0] === id
      state.sub.slice().forEach((v) => setItem('sub', v, false))
      if (!only) setItem('sub', id, true)
    }
    const reset = () => {
      Object.assign(state, blank())
      Object.keys(stamps).forEach((k) => delete stamps[k])
    }

    /* ---------- chips ---------- */
    const priceLabel = () => {
      const p = price.value
      return (state.min != null && state.max != null ? 'Cena ' + int(p.min) + '–' + int(p.max) : state.min != null ? 'Cena od ' + int(p.min) : 'Cena do ' + int(p.max)) + ' Kč'
    }
    const active = Vue.computed(() => {
      const a = []
      TOGGLES.forEach((t) => { if (state[t.key]) a.push({ key: t.key, label: t.chip || t.label, remove: () => setToggle(t.key, false) }) })
      GROUPS.forEach((g) => state[g.id].forEach((v) => a.push({ key: g.id + ':' + v, label: labelOf(g, v), remove: () => setItem(g.id, v, false) })))
      if (price.value.on) a.push({ key: 'price', label: priceLabel(), remove: () => { state.min = state.max = null; delete stamps.price } })
      return a.sort((x, y) => (stamps[x.key] || 0) - (stamps[y.key] || 0))
    })

    /* reactive() unwraps the computeds, so templates read filters.list, filters.count ... directly */
    return Vue.reactive({ state, list, toggles, groups, price, setPrice, setToggle, setItem, pickSub, reset, active, count: Vue.computed(() => active.value.length), sorts: SORTS })
  }

  Makro.createFilters = createFilters
  Makro.categoryFilters = createFilters(Makro.sausages, Makro.category.subcategories)
})()
