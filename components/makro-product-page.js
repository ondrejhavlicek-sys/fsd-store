/* Product detail page. No Figma frame yet: layout after the kit's product detail / live kosik.cz (image left, buy box right,
   tabs below, similar products) with the B2B patterns of the live makro shop (net price + VAT line, unit price net and gross,
   pack info, supplier data, delivery slot). Route: /produkt/:id. Mock data from js/store.js. Styles: css/product.css. */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''
  const TABS = [
    { key: 'desc', label: 'Popis produktu' },
    { key: 'comp', label: 'Složení a výživa' },
    { key: 'char', label: 'Charakteristika' },
  ]

  Makro.ProductPage = {
    components: { MakroProductBox: Makro.ProductBox },
    props: { id: { type: String, required: true } },
    setup(props) {
      const { store, category } = Makro
      const p = Vue.computed(() => Makro.byId(props.id))
      const d = Vue.computed(() => (p.value ? Makro.detail(p.value) : null))
      const qty = Vue.computed(() => (p.value && store.cart[p.value.id]) || 0)
      const want = Vue.ref(1)
      const tab = Vue.ref('desc')
      Vue.watch(() => props.id, () => { want.value = 1; tab.value = 'desc' })

      const isGross = Vue.computed(() => store.vat === 'gross')
      const head = Vue.computed(() => (p.value ? (isGross.value ? p.value.gross : p.value.net) : 0))
      const headOld = Vue.computed(() => (p.value ? (isGross.value ? p.value.oldGross : p.value.old) : null))
      const parts = (n) => { const [i, dec] = n.toFixed(2).split('.'); return { i, dec } }
      const second = Vue.computed(() => (isGross.value ? 'bez DPH ' + Makro.num(p.value.net) + ' Kč' : 'vč. DPH ' + Makro.num(p.value.gross) + ' Kč'))
      /* unit price: the mock prints "139,90 Kč/kg" (net); the gross unit price is derived */
      const unitNet = Vue.computed(() => p.value.unitPrice.replace('/', ' / '))
      const unitGross = Vue.computed(() => {
        const n = parseFloat(p.value.unitPrice.replace(/\s/g, '').replace(',', '.'))
        const unit = (p.value.unitPrice.split('/')[1] || 'ks').trim()
        return Makro.num(Makro.gross(n)) + ' Kč / ' + unit
      })
      const lineTotal = Vue.computed(() => Makro.kc(head.value * (qty.value || want.value)))

      const step = (delta) => {
        if (qty.value) Makro.setQty(p.value.id, qty.value + delta)
        else want.value = Math.max(1, Math.min(99, want.value + delta))
      }
      const typed = (e) => {
        const n = parseInt(e.target.value, 10)
        if (qty.value) Makro.setQty(p.value.id, isNaN(n) ? 0 : n)
        else want.value = isNaN(n) ? 1 : Math.max(1, Math.min(99, n))
        e.target.value = qty.value || want.value
      }
      const tabKey = (e) => {
        const i = TABS.findIndex((t) => t.key === tab.value)
        const next = e.key === 'ArrowRight' ? (i + 1) % TABS.length : e.key === 'ArrowLeft' ? (i + TABS.length - 1) % TABS.length : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : -1
        if (next < 0) return
        e.preventDefault()
        tab.value = TABS[next].key
        Vue.nextTick(() => document.getElementById('tab-' + TABS[next].key)?.focus())
      }
      const add = () => { Makro.setQty(p.value.id, want.value); Makro.toast('Přidáno do košíku: ' + want.value + ' ks') }
      const soon = (what) => Makro.toast(what + ' zatím není součástí prototypu.')
      const similar = Vue.computed(() => (p.value ? Makro.similar(p.value) : []))
      const brandProducts = Vue.computed(() => (p.value ? Makro.sameBrand(p.value) : []))

      return { tabKey, store, category, p, d, qty, want, tab, TABS, head, headOld, parts, second, unitNet, unitGross, lineTotal, step, typed, add, soon, similar, brandProducts, categoryHash: Makro.categoryHash, num: Makro.num, delivery: Makro.delivery, setQty: Makro.setQty, openProduct: Makro.openProduct, setVat: Makro.setVat, src: (n) => base() + 'assets/' + n }
    },
    template: `
      <main class="mk-wrap mk-page mk-pdp" data-tid="product-detail-page">
        <nav aria-label="Drobečková navigace">
          <ol class="mk-crumbs">
            <li v-for="(c, i) in category.breadcrumbs" :key="c">
              <img v-if="i" :src="src('icons/breadcrumb-sep.svg')" alt="" width="8" height="16">
              <a v-if="i === 0" href="#/">{{ c }}</a>
              <a v-else-if="i === category.breadcrumbs.length - 1" :href="categoryHash">{{ c }}</a>
              <a v-else href="#" @click.prevent="soon('Navigace')">{{ c }}</a>
            </li>
            <li v-if="p"><img :src="src('icons/breadcrumb-sep.svg')" alt="" width="8" height="16"><span aria-current="page">{{ p.name }}</span></li>
          </ol>
        </nav>

        <div v-if="!p" class="mk-empty">
          <h1 class="mk-title">Produkt jsme nenašli</h1>
          <p>Možná už není v nabídce. Zkuste vyhledávání nebo se vraťte do kategorie.</p>
          <a class="mk-btn" :href="categoryHash">Zpět do kategorie</a>
        </div>

        <template v-else>
          <div class="mk-pdp-top">
            <div class="mk-pdp-media">
              <div class="mk-pdp-img">
                <img :src="p.image" :alt="p.name">
                <div class="mk-tags" v-if="p.sale || p.multikup">
                  <span v-if="p.sale" class="mk-tag mk-tag-sale">Akce</span>
                  <span v-if="p.multikup" class="mk-tag mk-tag-multi">Multikup</span>
                </div>
                <button type="button" class="mk-heart" :class="{ on: store.fav[p.id] }" :aria-pressed="!!store.fav[p.id]" :aria-label="store.fav[p.id] ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'" @click="store.fav[p.id] = !store.fav[p.id]">
                  <svg v-if="store.fav[p.id]" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-5-9.7-10C1.1 7.3 3.1 4 6.6 4c2 0 3.8 1 5.4 3 1.6-2 3.4-3 5.4-3 3.5 0 5.5 3.3 4.3 7C20 16 12 21 12 21z"/></svg>
                  <img v-else :src="src('icons/heart.svg')" alt="" width="20" height="20">
                </button>
              </div>
            </div>

            <div class="mk-pdp-buy">
              <h1 class="mk-pdp-name">{{ p.name }}</h1>
              <div class="mk-pdp-meta">
                <span>Kód {{ p.code }}</span>
                <span class="mk-pill">{{ p.pack }}</span>
                <a v-if="p.brand" href="#" @click.prevent="soon('Stránka značky')">{{ p.brand }}</a>
              </div>

              <div class="mk-pdp-card">
                <div class="mk-pdp-card-head">
                  <span class="mk-pdp-label">Cena</span>
                  <div class="mk-seg mk-seg-sm" role="group" aria-label="Zobrazení cen">
                    <button type="button" :class="{ on: store.vat === 'net' }" :aria-pressed="store.vat === 'net'" @click="setVat('net')">Bez DPH</button>
                    <button type="button" :class="{ on: store.vat === 'gross' }" :aria-pressed="store.vat === 'gross'" @click="setVat('gross')">Včetně DPH</button>
                  </div>
                </div>

                <div class="mk-pdp-price">
                  <span class="mk-now mk-now-lg" :class="{ sale: p.sale }"><b>{{ parts(head).i }}</b><sup>{{ parts(head).dec }}</sup><i>Kč</i></span>
                  <s v-if="headOld" class="mk-old">{{ num(headOld) }} Kč</s>
                  <span v-if="p.sale" class="mk-sale-note">{{ p.sale }}</span>
                </div>
                <div class="mk-pdp-vat">{{ second }}</div>
                <ul class="mk-pdp-unit">
                  <li>{{ unitNet }} bez DPH</li>
                  <li>{{ unitGross }} vč. DPH</li>
                </ul>
                <p v-if="p.pack.startsWith('cca')" class="mk-pdp-note">Zboží se váží při expedici, skutečná hmotnost i cena se mohou mírně lišit.</p>

                <div class="mk-pdp-avail" :class="p.today ? 'ok' : 'no'">
                  <span class="mk-dot-s" aria-hidden="true"></span>
                  <span v-if="p.today"><b>Dostupné</b> · nejbližší doručení {{ delivery.date }}, {{ delivery.slot }}</span>
                  <span v-else><b>Dnes nedostupné</b> · nejbližší doručení {{ delivery.nextAfter }}</span>
                </div>

                <div class="mk-pdp-buyrow">
                  <div class="mk-qty">
                    <button type="button" class="mk-qty-btn" :aria-label="qty ? 'Ubrat jeden kus' : 'Snížit množství'" @click="step(-1)"><img :src="src('icons/minus-blue.svg')" alt="" width="20" height="20"></button>
                    <input class="mk-qty-in" type="text" inputmode="numeric" :value="qty || want" aria-label="Množství v kusech" @change="typed">
                    <button type="button" class="mk-qty-btn" aria-label="Přidat jeden kus" @click="step(1)"><img :src="src('icons/plus-white.svg')" alt="" width="20" height="20"></button>
                  </div>
                  <button v-if="!qty" type="button" class="mk-btn mk-btn-cart" @click="add"><img :src="src('icons/cart.svg')" alt="" width="20" height="20" class="mk-ico-inv">Do košíku</button>
                  <div v-else class="mk-incart mk-incart-lg" aria-live="polite"><span><img :src="src('icons/cart-solid-green.svg')" alt="" width="16" height="16">V košíku {{ qty }} ks</span><b>{{ lineTotal }}</b></div>
                </div>
                <button type="button" class="mk-link" @click="soon('Nákupní seznamy')"><img :src="src('icons/shopping-list.svg')" alt="" width="20" height="20">Přidat do seznamu</button>
              </div>

              <dl class="mk-pdp-facts">
                <template v-for="f in d.facts" :key="f[0]"><dt>{{ f[0] }}</dt><dd>{{ f[1] }}</dd></template>
              </dl>
            </div>
          </div>

          <section class="mk-pdp-tabs" aria-label="Informace o produktu">
            <div class="mk-tablist" role="tablist" aria-label="Informace o produktu" @keydown="tabKey">
              <button v-for="t in TABS" :key="t.key" type="button" role="tab" :id="'tab-' + t.key" :tabindex="tab === t.key ? 0 : -1" :aria-selected="tab === t.key" :aria-controls="'panel-' + t.key" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
            </div>
            <div v-if="tab === 'desc'" class="mk-tabpanel" role="tabpanel" id="panel-desc" aria-labelledby="tab-desc">
              <h2>Popis produktu</h2>
              <p v-for="t in d.description" :key="t">{{ t }}</p>
              <h3>Skladovací podmínky</h3><p>{{ d.storage }}</p>
              <h3>Trvanlivost</h3><p>{{ d.shelfLife }}</p>
              <h3>Adresa dodavatele</h3><p>{{ d.supplier }}</p>
            </div>
            <div v-else-if="tab === 'comp'" class="mk-tabpanel" role="tabpanel" id="panel-comp" aria-labelledby="tab-comp">
              <h2>Složení</h2>
              <p>{{ d.composition }}</p>
              <p><b>Alergeny:</b> {{ d.allergens }}</p>
              <h3>Nutriční hodnoty na 100 g</h3>
              <table class="mk-table"><tbody><tr v-for="r in d.nutrition" :key="r[0]"><th scope="row">{{ r[0] }}</th><td>{{ r[1] }}</td></tr></tbody></table>
              <p class="mk-pdp-note">Údaje jsou ukázkové. Vždy se řiďte etiketou na výrobku.</p>
            </div>
            <div v-else class="mk-tabpanel" role="tabpanel" id="panel-char" aria-labelledby="tab-char">
              <h2>Charakteristika</h2>
              <table class="mk-table"><tbody><tr v-for="f in d.facts" :key="f[0]"><th scope="row">{{ f[0] }}</th><td>{{ f[1] }}</td></tr></tbody></table>
            </div>
          </section>

          <section class="mk-rail-sec" v-if="similar.length" aria-label="Podobné produkty">
            <h2>Podobné produkty</h2>
            <ul class="mk-rail">
              <li v-for="s in similar" :key="s.id">
                <makro-product-box :product="s" :qty="store.cart[s.id] || 0" :vat="store.vat" :favorite="!!store.fav[s.id]" @update:qty="setQty(s.id, $event)" @favorite="store.fav[s.id] = !store.fav[s.id]" @open="openProduct($event.id)"></makro-product-box>
              </li>
            </ul>
          </section>
          <section class="mk-rail-sec" v-if="brandProducts.length" aria-label="Produkty značky">
            <h2>Produkty značky {{ p.brand }}</h2>
            <ul class="mk-rail">
              <li v-for="s in brandProducts" :key="s.id">
                <makro-product-box :product="s" :qty="store.cart[s.id] || 0" :vat="store.vat" :favorite="!!store.fav[s.id]" @update:qty="setQty(s.id, $event)" @favorite="store.fav[s.id] = !store.fav[s.id]" @open="openProduct($event.id)"></makro-product-box>
              </li>
            </ul>
          </section>
        </template>
      </main>
    `,
  }
})()
