/* Cart page (no Figma frame): structure of the live makro cart (title + cart actions, quick add by article number,
   delivery date / slot / address, minimum-order notice with fee, item rows with net and gross prices, order summary with
   terms checkbox) in the look of this prototype. Route: /kosik. Mock data and state from js/store.js. Styles: css/cart.css. */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''

  Makro.CartPage = {
    components: { MakroOrderStatus: Makro.OrderStatus, MakroProductRail: Makro.ProductRail },
    setup() {
      const store = Makro.store
      const lines = Vue.computed(() =>
        Object.keys(store.cart)
          .filter((id) => store.cart[id] > 0)
          .map((id) => {
            const p = Makro.byId(id), q = store.cart[id]
            return { p, q, net: Makro.round2(p.net * q), gross: Makro.round2(p.gross * q) }
          }),
      )
      const sum = Vue.computed(() => Makro.summary())
      const missing = Vue.computed(() => Math.max(0, Makro.round2(Makro.minOrder.net - sum.value.goodsNet)))
      const slotKey = Vue.ref(0)
      Vue.watch(slotKey, (i) => Object.assign(Makro.delivery, { date: Makro.slots[i].date, slot: Makro.slots[i].slot }))

      const accepted = Vue.computed({ get: () => store.terms, set: (v) => (store.terms = v) })
      const showTermsError = Vue.ref(false)
      Vue.watch(accepted, (v) => v && (showTermsError.value = false))
      const proceed = () => {
        if (!accepted.value) { showTermsError.value = true; return }
        location.hash = '#/pokladna'
      }

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

      const setQty = (id, q) => Makro.setQty(id, q)
      const typed = (id, e) => { const n = parseInt(e.target.value, 10); setQty(id, isNaN(n) ? 0 : n); e.target.value = store.cart[id] || 0 }
      const soon = (what) => Makro.toast(what + ' zatím není součástí prototypu.')
      const clear = () => { Makro.clearCart(); Makro.toast('Košík je vyprázdněný.') }
      const usual = Vue.computed(() => Makro.products.filter((p) => !store.cart[p.id] && p.cat === 'ovoce' && p.today).slice(0, 7))

      return { store, lines, sum, missing, slots: Makro.slots, slotKey, delivery: Makro.delivery, min: Makro.minOrder, accepted, showTermsError, proceed, code, quick, quickAdd, setQty, typed, soon, clear, usual, kc: Makro.kc, num: Makro.num, openProduct: Makro.openProduct, src: (n) => base() + 'assets/' + n }
    },
    template: `
      <main class="mk-wrap mk-page mk-cartpage" data-tid="cart-page">
        <nav aria-label="Drobečková navigace">
          <ol class="mk-crumbs">
            <li><a href="#/">Hlavní stránka</a></li>
            <li><img :src="src('icons/breadcrumb-sep.svg')" alt="" width="8" height="16"><span aria-current="page">Košík</span></li>
          </ol>
        </nav>

        <div class="mk-cart-head">
          <h1 class="mk-title">Košík ({{ sum.lines }})</h1>
          <div class="mk-cart-actions">
            <button type="button" class="mk-link" :disabled="!sum.lines" @click="clear">Vymazat košík</button>
            <button type="button" class="mk-link" @click="soon('Tisk košíku')">Vytisknout košík</button>
            <button type="button" class="mk-link" @click="soon('Uložení košíku do seznamu')">Uložit jako seznam</button>
            <button type="button" class="mk-link" @click="soon('Nahrání souboru CSV')">Nahrát soubor CSV</button>
          </div>
        </div>

        <div class="mk-cart-grid">
          <div class="mk-cart-main">
            <form class="mk-quick" @submit.prevent="quickAdd">
              <label for="quick-code">Rychlé přidání do košíku</label>
              <div class="mk-quick-row">
                <input id="quick-code" v-model="code" type="text" inputmode="numeric" autocomplete="off" placeholder="Zadejte kód produktu, např. 241626">
                <button type="submit" class="mk-btn mk-btn-sec">Přidat</button>
              </div>
              <p v-if="quick.msg" class="mk-quick-msg" :class="{ err: quick.err }" role="status">{{ quick.msg }}</p>
            </form>

            <section class="mk-card mk-deliv" aria-labelledby="h-deliv">
              <h2 id="h-deliv">Doručení</h2>
              <div class="mk-deliv-row">
                <label class="mk-field"><span>Datum a čas doručení</span>
                  <select v-model.number="slotKey"><option v-for="(s, i) in slots" :key="i" :value="i">{{ s.date }}, {{ s.slot }}</option></select>
                </label>
                <div class="mk-field"><span>Doručovací adresa</span><div class="mk-addr-val">{{ delivery.address }} <button type="button" class="mk-link" @click="soon('Změna adresy')">Změnit</button></div></div>
              </div>
            </section>

            <makro-order-status></makro-order-status>

            <div v-if="!sum.lines" class="mk-card mk-cart-empty">
              <h2>Váš košík je prázdný</h2>
              <p>Přidejte produkty z nabídky nebo zopakujte poslední objednávku.</p>
              <a class="mk-btn" href="#/">Pokračovat v nákupu</a>
            </div>

            <ul v-else class="mk-lines" aria-label="Položky v košíku">
              <li v-for="l in lines" :key="l.p.id" class="mk-line">
                <a :href="'#/produkt/' + l.p.id" class="mk-line-img" :aria-label="l.p.name"><img :src="l.p.image" alt="" width="72" height="72"></a>
                <div class="mk-line-info">
                  <a :href="'#/produkt/' + l.p.id" class="mk-line-name">{{ l.p.name }}</a>
                  <div class="mk-line-meta"><span>{{ l.p.code }}</span><span class="mk-pill">{{ l.p.pack }}</span></div>
                  <div class="mk-line-avail" :class="l.p.today ? 'ok' : 'no'"><span class="mk-dot-s" aria-hidden="true"></span>{{ l.p.today ? 'Dostupné' : 'Dnes nedostupné, doručíme po 2. 11. 2026' }}</div>
                </div>
                <div class="mk-line-unit">
                  <div class="mk-line-lab">Cena za kus</div>
                  <b :class="{ off: store.vat === 'gross' }">{{ kc(l.p.net) }}</b><small>bez DPH</small>
                  <span>{{ kc(l.p.gross) }}</span><small>vč. DPH</small>
                </div>
                <div class="mk-line-qty">
                  <div class="mk-qty mk-qty-sm">
                    <button type="button" class="mk-qty-btn" aria-label="Ubrat jeden kus" @click="setQty(l.p.id, l.q - 1)"><img :src="src('icons/minus-blue.svg')" alt="" width="20" height="20"></button>
                    <input class="mk-qty-in" type="text" inputmode="numeric" :value="l.q" :aria-label="'Množství: ' + l.p.name" @change="typed(l.p.id, $event)">
                    <button type="button" class="mk-qty-btn" aria-label="Přidat jeden kus" @click="setQty(l.p.id, l.q + 1)"><img :src="src('icons/plus-white.svg')" alt="" width="20" height="20"></button>
                  </div>
                </div>
                <div class="mk-line-total">
                  <div class="mk-line-lab">Celkem</div>
                  <b :class="{ off: store.vat === 'gross' }">{{ kc(l.net) }}</b><small>bez DPH</small>
                  <span>{{ kc(l.gross) }}</span><small>vč. DPH</small>
                </div>
                <button type="button" class="mk-line-del" :aria-label="'Odebrat z košíku: ' + l.p.name" @click="setQty(l.p.id, 0)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>
                </button>
              </li>
            </ul>
          </div>

          <aside class="mk-sum" aria-labelledby="h-sum">
            <h2 id="h-sum">Objednávka celkem</h2>
            <p class="mk-sum-sub">{{ sum.lines }} počet řádků objednávky, {{ sum.units }} počet objednaných jednotek</p>
            <dl class="mk-sum-rows">
              <div><dt>Cena bez DPH</dt><dd>{{ kc(sum.goodsNet) }}</dd></div>
              <div><dt>Záloha za obaly</dt><dd>{{ kc(sum.returnable) }}</dd></div>
              <div :class="{ fee: sum.fee }"><dt>{{ sum.fee ? 'Poplatek za objednávku pod minimem' : 'Poplatky' }} <span v-if="sum.fee" class="mk-info" title="Poplatek za nedosažení minimální hodnoty objednávky" aria-label="Poplatek za nedosažení minimální hodnoty objednávky">i</span></dt><dd>{{ kc(sum.fee) }}</dd></div>
              <div class="mk-sum-total"><dt>Celkem bez DPH<small>včetně zálohy za obaly a poplatků</small></dt><dd>{{ kc(sum.totalNet) }}</dd></div>
              <div><dt>DPH</dt><dd>{{ kc(sum.vat) }}</dd></div>
              <div class="mk-sum-grand"><dt>Celkem vč. DPH</dt><dd>{{ kc(sum.totalGross) }}</dd></div>
            </dl>
            <label class="mk-terms"><input type="checkbox" v-model="accepted" :aria-describedby="showTermsError ? 'terms-err' : undefined"><span>Souhlasím se <a href="#" @click.prevent="soon('Smluvní podmínky')">Smluvními podmínkami</a> a <a href="#" @click.prevent="soon('Zásady ochrany osobních údajů')">Zásadami ochrany osobních údajů</a>.</span></label>
            <p v-if="showTermsError" id="terms-err" class="mk-terms-err" role="alert">Chcete-li pokračovat, přijměte prosím podmínky.</p>
            <button type="button" class="mk-btn mk-btn-wide" :disabled="!sum.lines" @click="proceed">Pokračovat k rekapitulaci objednávky</button>
          </aside>
        </div>

        <makro-product-rail v-if="usual.length" title="Položky, které obvykle také kupujete" :products="usual" more="" ></makro-product-rail>
      </main>
    `,
  }
})()
