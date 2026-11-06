/* Search tools of the cart pages (both layouts):
   - Makro.CartFinder: the "global" product search that adds products to the cart (by name or product code, with suggestions),
     replaces the code-only "Rychlé přidání".
   - Makro.CartFilter: local search ("Vyhledávání položek") that filters the items already in the cart, for checking the
     completeness of big B2B orders; the page applies Makro.matches to its lines and highlights hits with Makro.highlight.
   Styles: css/cart-tools.css. */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''

  /* lower case without diacritics; NFD minus the combining marks keeps the length of precomposed text, so indices map 1:1 */
  const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const words = (q) => norm(q).trim().split(/\s+/).filter(Boolean)
  Makro.norm = norm
  /* every typed word must occur in the name, code or brand */
  Makro.matches = (p, q) => {
    const w = words(q)
    if (!w.length) return true
    const hay = norm(p.name + ' ' + p.code + ' ' + (p.brand || ''))
    return w.every((x) => hay.includes(x))
  }
  /* split text into [{ t, m }] where m marks the parts that match the query words */
  Makro.highlight = (text, q) => {
    const w = words(q), t = String(text)
    if (!w.length) return [{ t, m: false }]
    const n = norm(t), mark = new Array(t.length).fill(false)
    w.forEach((x) => { let i = n.indexOf(x); while (i >= 0) { for (let k = i; k < i + x.length; k++) mark[k] = true; i = n.indexOf(x, i + x.length) } })
    const out = []
    for (let i = 0; i < t.length; i++) {
      const last = out[out.length - 1]
      if (last && last.m === mark[i]) last.t += t[i]; else out.push({ t: t[i], m: mark[i] })
    }
    return out
  }

  let uid = 0

  Makro.CartFinder = {
    props: { label: { type: String, default: 'Přidat produkt do košíku' } },
    emits: ['added'],
    setup(props, { emit }) {
      const id = 'cf-' + ++uid
      const store = Makro.store
      const q = Vue.ref('')
      const open = Vue.ref(false)
      const active = Vue.ref(-1)
      const msg = Vue.reactive({ text: '', err: false })
      const results = Vue.computed(() => {
        const t = norm(q.value).trim()
        if (!t) return []
        const score = (p) => (norm(p.code).startsWith(t) ? 0 : norm(p.name).startsWith(t) ? 1 : 2)
        return Makro.products.filter((p) => Makro.matches(p, q.value)).sort((a, b) => score(a) - score(b)).slice(0, 8)
      })
      Vue.watch(q, (v) => { active.value = -1; if (v) { open.value = true; msg.text = '' } }) /* the confirmation after an add (which clears the field) stays */
      const price = (p) => Makro.kc(store.vat === 'gross' ? p.gross : p.net)
      const add = (p) => {
        const n = (store.cart[p.id] || 0) + 1
        Makro.setQty(p.id, n)
        msg.err = false
        msg.text = 'Přidáno do košíku: ' + p.name + ' (v košíku ' + n + ' ks).'
        q.value = ''
        open.value = false
        active.value = -1
        emit('added', p)
      }
      const enter = () => {
        const list = results.value
        if (active.value >= 0 && list[active.value]) return add(list[active.value])
        const t = q.value.trim()
        const exact = list.find((p) => p.code === t)
        if (exact) return add(exact)
        if (list.length === 1) return add(list[0])
        if (!t) return
        msg.err = true
        msg.text = list.length ? 'Vyberte produkt ze seznamu.' : 'Produkt jsme nenašli. Zkuste jiný název nebo kód, například 241626.'
      }
      const key = (e) => {
        const n = results.value.length
        if (e.key === 'ArrowDown') { e.preventDefault(); open.value = true; if (n) active.value = (active.value + 1) % n }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (n) active.value = (active.value - 1 + n) % n }
        else if (e.key === 'Enter') { e.preventDefault(); enter() }
        else if (e.key === 'Escape' && (open.value || q.value)) { e.stopPropagation(); open.value ? (open.value = false) : (q.value = '') }
      }
      const blur = () => setTimeout(() => (open.value = false), 120)
      const showList = Vue.computed(() => open.value && results.value.length > 0)
      const showEmpty = Vue.computed(() => open.value && q.value.trim() && !results.value.length)
      return { id, q, open, active, msg, results, price, add, key, blur, showList, showEmpty, hl: (t) => Makro.highlight(t, q.value), store, src: (n) => base() + 'assets/' + n }
    },
    template: `
      <div class="mk-find">
        <label :for="id" class="mk-find-label">{{ label }}</label>
        <div class="mk-find-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
          <input :id="id" v-model="q" type="text" role="combobox" aria-autocomplete="list" autocomplete="off" :aria-expanded="showList" :aria-controls="id + '-list'" :aria-activedescendant="active >= 0 ? id + '-o' + active : undefined" placeholder="Hledejte produkt podle názvu nebo kódu, např. 241626" @focus="open = true" @blur="blur" @keydown="key">
          <button v-if="q" type="button" class="mk-find-x" aria-label="Vymazat hledání" @mousedown.prevent @click="q = ''">✕</button>
        </div>
        <ul v-if="showList" :id="id + '-list'" class="mk-find-list" role="listbox" aria-label="Nalezené produkty">
          <li v-for="(p, i) in results" :id="id + '-o' + i" :key="p.id" role="option" :aria-selected="i === active" :class="{ on: i === active }" @mousedown.prevent="add(p)" @mousemove="active = i">
            <img :src="p.image" alt="" width="40" height="40">
            <span class="mk-find-txt"><b><template v-for="s in hl(p.name)"><mark v-if="s.m">{{ s.t }}</mark><template v-else>{{ s.t }}</template></template></b><small>{{ p.code }} · {{ p.pack }}<em v-if="store.cart[p.id]"> · v košíku {{ store.cart[p.id] }} ks</em></small></span>
            <span class="mk-find-price">{{ price(p) }}<small>{{ store.vat === 'gross' ? 'vč. DPH' : 'bez DPH' }}</small></span>
            <span class="mk-find-add" aria-hidden="true">+</span>
          </li>
        </ul>
        <p v-else-if="showEmpty" class="mk-find-empty" role="status">Nic jsme nenašli. Zkuste jiný název nebo kód produktu.</p>
        <p class="mk-find-msg" :class="{ err: msg.err }" role="status">{{ msg.text }}</p>
      </div>`,
  }

  Makro.CartFilter = {
    props: { modelValue: { type: String, default: '' }, shown: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    emits: ['update:modelValue'],
    setup(props) {
      const id = 'cflt-' + ++uid
      const info = Vue.computed(() => (props.modelValue.trim() ? 'Zobrazeno ' + props.shown + ' z ' + props.total + ' ' + (props.total === 1 ? 'položky' : 'položek') + '.' : ''))
      return { id, info }
    },
    template: `
      <div class="mk-flt" role="search" aria-label="Vyhledávání položek v košíku">
        <label :for="id" class="mk-sr">Vyhledávání položek v košíku</label>
        <div class="mk-flt-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
          <input :id="id" type="search" :value="modelValue" autocomplete="off" placeholder="Vyhledávání položek v košíku (název nebo kód)" @input="$emit('update:modelValue', $event.target.value)" @keydown.esc="$emit('update:modelValue', '')">
          <button v-if="modelValue" type="button" class="mk-flt-x" aria-label="Zrušit vyhledávání položek" @click="$emit('update:modelValue', '')">✕</button>
        </div>
        <p class="mk-flt-info" role="status">{{ info }}</p>
      </div>`,
  }
})()
