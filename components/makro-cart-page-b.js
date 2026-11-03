/* Cart page, variant B: the Košík.cz basket layout (reference: screenshot of checkout.ondraux.kosik.design "Nákupní košík") with makro B2B features.
   Kept from Košík: simplified header, top bar with "Zpět nakupovat" / title / total, grey page, items grouped by category in white rows with
   remove ×, thumbnail, stepper and price, right column with a progress card and a summary card.
   Makro additions: net and gross prices, minimum order value with fee (instead of free delivery), delivery date and slot with the order
   deadline, quick add by product code, deposit for packaging, terms checkbox. Route: #/kosik?variant=b. Styles: css/cart-b.css. */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''
  const GROUPS = { ovoce: 'Ovoce a zelenina', masne: 'Masné výrobky' }

  Makro.CartPageB = {
    components: { MakroProductRail: Makro.ProductRail },
    setup() {
      const store = Makro.store
      const left = Makro.useCountdown()
      const sum = Vue.computed(() => Makro.summary())
      const lines = Vue.computed(() =>
        Object.keys(store.cart).filter((id) => store.cart[id] > 0).map((id) => {
          const p = Makro.byId(id), q = store.cart[id]
          const gross = store.vat === 'gross'
          const unit = gross ? p.gross : p.net, old = gross ? p.oldGross : p.old
          return { p, q, total: Makro.round2(unit * q), other: Makro.round2((gross ? p.net : p.gross) * q), oldTotal: old ? Makro.round2(old * q) : null, saved: old ? Makro.round2((old - unit) * q) : 0, weighed: p.pack.startsWith('cca') }
        }),
      )
      const groups = Vue.computed(() => {
        const out = []
        lines.value.forEach((l) => {
          const name = GROUPS[l.p.cat] || 'Ostatní'
          let g = out.find((x) => x.name === name)
          if (!g) out.push((g = { name, lines: [] }))
          g.lines.push(l)
        })
        return out
      })
      const saved = Vue.computed(() => Makro.round2(lines.value.reduce((a, l) => a + l.saved, 0)))
      const hasWeighed = Vue.computed(() => lines.value.some((l) => l.weighed))
      const headTotal = Vue.computed(() => (store.vat === 'gross' ? sum.value.totalGross : sum.value.totalNet))
      const split = (n) => { const [i, d] = n.toFixed(2).split('.'); return { i: Makro.num(+i).split(',')[0], d } }

      const missing = Vue.computed(() => Math.max(0, Makro.round2(Makro.minOrder.net - sum.value.goodsNet)))
      const pct = Vue.computed(() => Math.min(100, Math.round((sum.value.goodsNet / Makro.minOrder.net) * 100)))

      const slotKey = Vue.ref(Math.max(0, Makro.slots.findIndex((s) => s.date === Makro.delivery.date && s.slot === Makro.delivery.slot)))
      Vue.watch(slotKey, (i) => Object.assign(Makro.delivery, { date: Makro.slots[i].date, slot: Makro.slots[i].slot }))

      const accepted = Vue.computed({ get: () => store.terms, set: (v) => (store.terms = v) })
      const showTermsError = Vue.ref(false)
      Vue.watch(accepted, (v) => v && (showTermsError.value = false))
      const proceed = () => { if (!accepted.value) { showTermsError.value = true; return } location.hash = '#/pokladna' }

      const code = Vue.ref('')
      const quick = Vue.reactive({ msg: '', err: false })
      const quickAdd = () => {
        const v = code.value.trim()
        if (!v) return
        const p = Makro.addByCode(v)
        quick.err = !p
        quick.msg = p ? 'Přidáno do košíku: ' + p.name : 'Produkt s kódem ' + v + ' jsme nenašli. Zkuste například 241626.'
        if (p) code.value = ''
      }

      const menuOpen = Vue.ref(false)
      const soon = (what) => { menuOpen.value = false; Makro.toast(what + ' zatím není součástí prototypu.') }
      const clear = () => { menuOpen.value = false; Makro.clearCart(); Makro.toast('Košík je vyprázdněný.') }
      const onDoc = (e) => { if (menuOpen.value && !e.target.closest('.mk-cb-menu')) menuOpen.value = false }
      const onKey = (e) => { if (e.key === 'Escape' && menuOpen.value) { menuOpen.value = false; document.querySelector('.mk-cb-dots')?.focus() } }
      Vue.onMounted(() => { document.addEventListener('pointerdown', onDoc); document.addEventListener('keydown', onKey) })
      Vue.onUnmounted(() => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey) })

      const typed = (id, e) => { const n = parseInt(e.target.value, 10); Makro.setQty(id, isNaN(n) ? 0 : n); e.target.value = store.cart[id] || 0 }
      const usual = Vue.computed(() => Makro.products.filter((p) => !store.cart[p.id] && p.cat === 'ovoce' && p.today).slice(0, 7))

      return { store, sum, groups, saved, hasWeighed, headTotal, split, missing, pct, left, slots: Makro.slots, slotKey, delivery: Makro.delivery, min: Makro.minOrder, accepted, showTermsError, proceed, code, quick, quickAdd, menuOpen, soon, clear, typed, usual, setQty: Makro.setQty, setVat: Makro.setVat, plural: Makro.plural, kc: Makro.kc, num: Makro.num, src: (n) => base() + 'assets/' + n }
    },
    template: `
      <div class="mk-cb" data-tid="cart-page-b">
        <div class="mk-cb-bar">
          <div class="mk-cb-bar-in">
            <a href="#/" class="mk-cb-back"><svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 1 1 7l6 6"/></svg>Zpět nakupovat</a>
            <h1 class="mk-cb-title">Košík</h1>
            <div class="mk-cb-total">
              <span class="mk-cb-pill">Celkem <b>{{ split(headTotal).i }}<sup>{{ split(headTotal).d }}</sup> Kč</b><small>{{ store.vat === 'gross' ? 'vč. DPH' : 'bez DPH' }}</small></span>
              <span class="mk-cb-vat">{{ store.vat === 'gross' ? 'bez DPH ' + kc(sum.totalNet) : 'vč. DPH ' + kc(sum.totalGross) }}</span>
              <span v-if="saved" class="mk-cb-save">Ušetříte <b>{{ kc(saved) }}</b></span>
            </div>
          </div>
        </div>

        <main class="mk-cb-main">
          <div class="mk-cb-grid">
            <div class="mk-cb-left">
              <div class="mk-cb-head">
                <h2><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/></svg>Obsah košíku <small>({{ sum.lines }} {{ plural(sum.lines, 'produkt', 'produkty', 'produktů') }})</small></h2>
                <div class="mk-cb-menu">
                  <button type="button" class="mk-cb-dots" aria-label="Akce s košíkem" aria-haspopup="true" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">⋯</button>
                  <ul v-if="menuOpen" class="mk-cb-menu-list" role="menu">
                    <li role="none"><button type="button" role="menuitem" :disabled="!sum.lines" @click="clear">Vymazat košík</button></li>
                    <li role="none"><button type="button" role="menuitem" @click="soon('Tisk košíku')">Vytisknout košík</button></li>
                    <li role="none"><button type="button" role="menuitem" @click="soon('Uložení košíku do seznamu')">Uložit jako seznam</button></li>
                    <li role="none"><button type="button" role="menuitem" @click="soon('Nahrání souboru CSV')">Nahrát soubor CSV</button></li>
                  </ul>
                </div>
                <div class="mk-seg mk-seg-sm" role="group" aria-label="Zobrazení cen">
                  <button type="button" :class="{ on: store.vat === 'net' }" :aria-pressed="store.vat === 'net'" @click="setVat('net')">Bez DPH</button>
                  <button type="button" :class="{ on: store.vat === 'gross' }" :aria-pressed="store.vat === 'gross'" @click="setVat('gross')">Včetně DPH</button>
                </div>
              </div>

              <form class="mk-cb-quick" @submit.prevent="quickAdd">
                <label for="cb-quick">Rychlé přidání</label>
                <input id="cb-quick" v-model="code" type="text" inputmode="numeric" autocomplete="off" placeholder="Kód produktu, např. 241626">
                <button type="submit" class="mk-cb-btn-sec">Přidat</button>
                <span v-if="quick.msg" class="mk-cb-quick-msg" :class="{ err: quick.err }" role="status">{{ quick.msg }}</span>
              </form>

              <div v-if="!sum.lines" class="mk-cb-empty">
                <h2>Váš košík je prázdný</h2>
                <p>Přidejte produkty z nabídky nebo zopakujte poslední objednávku.</p>
                <a class="mk-btn" href="#/">Pokračovat v nákupu</a>
              </div>

              <section v-for="g in groups" :key="g.name" class="mk-cb-group" :aria-label="g.name">
                <h3>{{ g.name }}</h3>
                <ul>
                  <li v-for="l in g.lines" :key="l.p.id" class="mk-cb-row">
                    <button type="button" class="mk-cb-x" :aria-label="'Odebrat z košíku: ' + l.p.name" @click="setQty(l.p.id, 0)">✕</button>
                    <a :href="'#/produkt/' + l.p.id" class="mk-cb-thumb" :aria-label="l.p.name"><img :src="l.p.image" alt="" width="56" height="56"><span>{{ l.p.weight }}</span></a>
                    <div class="mk-cb-name">
                      <a :href="'#/produkt/' + l.p.id">{{ l.p.name }}</a>
                      <small>{{ l.p.code }} · {{ l.p.pack }}</small>
                      <small v-if="!l.p.today" class="mk-cb-warn">Dnes nedostupné, doručíme po 2. 11. 2026</small>
                    </div>
                    <div class="mk-cb-step">
                      <button type="button" class="mk-cb-minus" aria-label="Ubrat jeden kus" @click="setQty(l.p.id, l.q - 1)"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
                      <input type="text" inputmode="numeric" :value="l.q" :aria-label="'Množství: ' + l.p.name" @change="typed(l.p.id, $event)">
                      <button type="button" class="mk-cb-plus" aria-label="Přidat jeden kus" @click="setQty(l.p.id, l.q + 1)"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10M7 2v10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
                    </div>
                    <div class="mk-cb-price">
                      <div class="mk-cb-now"><s v-if="l.oldTotal">{{ num(l.oldTotal) }} Kč</s><b :class="{ sale: l.oldTotal }">{{ l.weighed ? 'cca ' : '' }}{{ kc(l.total) }}</b></div>
                      <small>{{ store.vat === 'gross' ? 'bez DPH ' : 'vč. DPH ' }}{{ kc(l.other) }}</small>
                      <small v-if="l.saved" class="mk-cb-saved">✓ Ušetříte {{ kc(l.saved) }}</small>
                    </div>
                  </li>
                </ul>
              </section>
            </div>

            <aside class="mk-cb-right" aria-label="Souhrn objednávky">
              <section class="mk-cb-card mk-cb-progress" aria-labelledby="cb-prog">
                <p id="cb-prog" class="mk-cb-prog-t" v-if="missing && sum.lines">Zbývá <b>{{ kc(missing) }}</b> do minimální hodnoty objednávky <span class="mk-cb-i" :title="'Pod ' + kc(min.net) + ' bez DPH se účtuje poplatek ' + kc(min.fee) + '.'" aria-label="Pod minimální hodnotou se účtuje poplatek">i</span></p>
                <p id="cb-prog" class="mk-cb-prog-t ok" v-else>Minimální hodnota objednávky je splněna, poplatek se neúčtuje.</p>
                <div class="mk-cb-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="pct" aria-label="Postup k minimální hodnotě objednávky">
                  <span class="mk-cb-dot start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg></span>
                  <span class="mk-cb-line"><span :style="{ width: pct + '%' }"></span></span>
                  <span class="mk-cb-dot end" :class="{ on: !missing }"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg></span>
                </div>
              </section>

              <section class="mk-cb-card mk-cb-deliv" aria-labelledby="cb-del">
                <h2 id="cb-del">Doručení</h2>
                <label class="mk-cb-field"><span>Datum a čas doručení</span><select v-model.number="slotKey"><option v-for="(s, i) in slots" :key="i" :value="i">{{ s.date }}, {{ s.slot }}</option></select></label>
                <p class="mk-cb-addr">{{ delivery.address }} <button type="button" class="mk-link" @click="soon('Změna adresy')">Změnit</button></p>
                <p class="mk-cb-clock"><span>Do uzávěrky objednávek zbývá</span><b role="timer">{{ left }}</b></p>
              </section>

              <section class="mk-cb-card mk-cb-sum" aria-labelledby="cb-sum">
                <h2 id="cb-sum" class="mk-sr">Objednávka celkem</h2>
                <dl>
                  <div><dt>Zboží bez DPH</dt><dd>{{ kc(sum.goodsNet) }}</dd></div>
                  <div><dt>Záloha za obaly</dt><dd>{{ kc(sum.returnable) }}</dd></div>
                  <div v-if="sum.fee" class="fee"><dt>Poplatek za objednávku pod minimem</dt><dd>{{ kc(sum.fee) }}</dd></div>
                  <div v-if="hasWeighed" class="note"><dt>Vážené zboží<small>Cena je orientační, fakturujeme podle skutečné hmotnosti.</small></dt><dd></dd></div>
                  <div class="line"><dt>Celkem bez DPH</dt><dd>{{ kc(sum.totalNet) }}</dd></div>
                  <div><dt>DPH</dt><dd>{{ kc(sum.vat) }}</dd></div>
                  <div class="grand"><dt>Celkem vč. DPH</dt><dd>{{ kc(sum.totalGross) }}</dd></div>
                </dl>
                <label class="mk-terms"><input type="checkbox" v-model="accepted" :aria-describedby="showTermsError ? 'cb-terms-err' : undefined"><span>Souhlasím se <a href="#" @click.prevent="soon('Smluvní podmínky')">Smluvními podmínkami</a> a <a href="#" @click.prevent="soon('Zásady ochrany osobních údajů')">Zásadami ochrany osobních údajů</a>.</span></label>
                <p v-if="showTermsError" id="cb-terms-err" class="mk-terms-err" role="alert">Chcete-li pokračovat, přijměte prosím podmínky.</p>
                <button type="button" class="mk-cb-cta" :disabled="!sum.lines" @click="proceed">Pokračovat k rekapitulaci objednávky</button>
              </section>
            </aside>
          </div>

          <div class="mk-cb-rail" v-if="usual.length"><makro-product-rail title="Položky, které obvykle také kupujete" :products="usual" more=""></makro-product-rail></div>
        </main>
      </div>
    `,
  }

  /* picks the cart variant from the URL: #/kosik (makro layout) or #/kosik?variant=b (Košík layout) */
  Makro.CartRoute = {
    components: { CartA: Makro.CartPage, CartB: Makro.CartPageB },
    template: '<cart-b v-if="$route.query.variant === \'b\'"></cart-b><cart-a v-else></cart-a>',
  }

  /* small switch in the corner to compare the two layouts */
  Makro.VariantSwitch = {
    props: { items: { type: Array, default: () => [] } },
    template: `
      <div class="mk-variant" role="group" aria-label="Varianta rozložení">
        <span>Prototyp:</span>
        <a v-for="i in items" :key="i.label" :href="i.href" :aria-current="i.on ? 'true' : undefined">{{ i.label }}</a>
      </div>`,
  }
})()
