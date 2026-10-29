/* Homepage (no Figma frame): layout after the kit's homepage / live kosik.cz, with the logged-in B2B blocks of the live makro shop
   (order status with deadline and minimum order, last order with "Znovu objednat", lists, recently ordered items).
   All content is mock (js/store.js). Styles: css/home.css. Route: / */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''
  const pad2 = (n) => String(n).padStart(2, '0')

  /* ---- delivery slot, order deadline countdown, minimum order value (live makro shows these in the cart panel) ---- */
  Makro.OrderStatus = {
    setup() {
      const store = Makro.store
      const left = Makro.useCountdown()
      const net = Vue.computed(() => Makro.totals().net)
      const missing = Vue.computed(() => Math.max(0, Makro.round2(Makro.minOrder.net - net.value)))
      const pct = Vue.computed(() => Math.min(100, Math.round((net.value / Makro.minOrder.net) * 100)))
      return { store, left, missing, pct, min: Makro.minOrder, delivery: Makro.delivery, kc: Makro.kc }
    },
    template: `
      <section class="mk-os" aria-label="Stav objednávky">
        <div class="mk-os-cell">
          <span class="mk-os-k">Datum doručení</span>
          <b>{{ delivery.date }}, {{ delivery.slot }}</b>
        </div>
        <div class="mk-os-cell mk-os-clock">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          <span><span class="mk-os-k">Do uzávěrky objednávek zbývá</span><b class="mk-os-time" role="timer">{{ left }}</b></span>
        </div>
        <div class="mk-os-cell mk-os-min" :class="{ ok: !missing }">
          <span v-if="missing" class="mk-os-k">Doplňte košík o <b>{{ kc(missing) }}</b> pro splnění minimální hodnoty objednávky ({{ kc(min.net) }} bez DPH). Pod minimem se účtuje poplatek {{ kc(min.fee) }}.</span>
          <span v-else class="mk-os-k">Minimální hodnota objednávky ({{ kc(min.net) }} bez DPH) je splněna, poplatek se neúčtuje.</span>
          <span class="mk-os-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="pct"><span :style="{ width: pct + '%' }"></span></span>
        </div>
      </section>
    `,
  }

  /* ---- a titled row of product boxes ---- */
  Makro.ProductRail = {
    components: { MakroProductBox: Makro.ProductBox },
    props: { title: String, products: Array, more: { type: String, default: 'Zobrazit všechny položky' } },
    emits: ['more'],
    setup() {
      return { store: Makro.store, setQty: Makro.setQty, openProduct: Makro.openProduct }
    },
    template: `
      <section class="mk-rail-sec">
        <div class="mk-rail-head">
          <h2>{{ title }}</h2>
          <a v-if="more" href="#" class="mk-more" @click.prevent="$emit('more')">{{ more }}</a>
        </div>
        <ul class="mk-rail">
          <li v-for="p in products" :key="p.id">
            <makro-product-box :product="p" :qty="store.cart[p.id] || 0" :vat="store.vat" :favorite="!!store.fav[p.id]" @update:qty="setQty(p.id, $event)" @favorite="store.fav[p.id] = !store.fav[p.id]" @open="openProduct($event.id)"></makro-product-box>
          </li>
        </ul>
      </section>
    `,
  }

  Makro.HomePage = {
    components: { MakroOrderStatus: Makro.OrderStatus, MakroProductRail: Makro.ProductRail },
    setup() {
      const home = Makro.home
      const slide = Vue.ref(0)
      const go = (d) => (slide.value = (slide.value + d + home.banners.length) % home.banners.length)
      const soon = (what) => Makro.toast(what + ' zatím není součástí prototypu.')
      const order = Vue.computed(() => {
        const lines = home.lastOrder.lines.map(([id, q]) => ({ p: Makro.byId(id), q }))
        const net = lines.reduce((a, l) => a + l.p.net * l.q, 0)
        const gross = lines.reduce((a, l) => a + l.p.gross * l.q, 0)
        return { lines, net: Makro.round2(net), gross: Makro.round2(gross) }
      })
      const reorder = () => {
        const n = Makro.reorder()
        Makro.toast('Do košíku jsme přidali ' + n + ' ' + Makro.plural(n, 'položku', 'položky', 'položek') + ' z objednávky ' + home.lastOrder.no + '.')
      }
      const bannerAction = (b) => (b.id === 'b3' ? reorder() : b.id === 'b2' ? soon('Akční nabídka') : soon('Vánoční nabídka'))
      const goCategory = () => { location.hash = Makro.categoryHash }
      const tile = (t) => (t.fruit ? soon('Kategorie ' + t.name) : goCategory())
      const group = (g) => g.ids.map((id) => Makro.byId(id))
      return { home, slide, go, soon, order, reorder, bannerAction, tile, goCategory, group, store: Makro.store, kc: Makro.kc, src: (n) => base() + 'assets/' + n }
    },
    template: `
      <main class="mk-wrap mk-page mk-home" data-tid="homepage">
        <h1 class="mk-sr">Úvodní stránka</h1>
        <makro-order-status></makro-order-status>

        <section class="mk-hero" :class="'on-' + home.banners[slide].theme" aria-roledescription="carousel" aria-label="Aktuální nabídky">
          <div class="mk-slide" v-for="(b, i) in home.banners" :key="b.id" v-show="i === slide" :class="'t-' + b.theme" role="group" :aria-label="(i + 1) + ' z ' + home.banners.length">
            <div class="mk-slide-txt">
              <span class="mk-kicker">{{ b.kicker }}</span>
              <h2>{{ b.title }}</h2>
              <p>{{ b.text }}</p>
              <button type="button" class="mk-btn" :class="b.theme === 'yellow' ? 'mk-btn-navy' : 'mk-btn-yellow'" @click="bannerAction(b)">{{ b.cta }}</button>
            </div>
          </div>
          <button type="button" class="mk-hero-nav prev" aria-label="Předchozí nabídka" @click="go(-1)"><img :src="src('icons/chevron-down.svg')" alt="" width="20" height="20"></button>
          <button type="button" class="mk-hero-nav next" aria-label="Další nabídka" @click="go(1)"><img :src="src('icons/chevron-down.svg')" alt="" width="20" height="20"></button>
          <div class="mk-dots" role="group" aria-label="Výběr nabídky"><button v-for="(b, i) in home.banners" :key="b.id" type="button" :aria-current="i === slide ? 'true' : undefined" :aria-label="'Nabídka ' + (i + 1)" :class="{ on: i === slide }" @click="slide = i"></button></div>
        </section>

        <div class="mk-h-split">
          <section class="mk-card mk-lastorder" aria-labelledby="h-last">
            <h2 id="h-last">Poslední objednávka</h2>
            <div class="mk-lo-body">
              <dl class="mk-lo-info">
                <div><dt>Číslo objednávky</dt><dd>{{ home.lastOrder.no }}</dd></div>
                <div><dt>Datum doručení</dt><dd>{{ home.lastOrder.date }}</dd></div>
                <div><dt>Položek</dt><dd>{{ order.lines.length }}</dd></div>
                <div><dt>Stav</dt><dd><span class="mk-chip-ok" :class="{ wait: home.lastOrder.status === 'Čeká na schválení' }">{{ home.lastOrder.status }}</span></dd></div>
              </dl>
              <div class="mk-lo-price"><b>{{ kc(order.net) }}</b><small>bez DPH · {{ kc(order.gross) }} vč. DPH</small></div>
            </div>
            <div class="mk-lo-actions">
              <button type="button" class="mk-btn mk-btn-sec" @click="soon('Detail objednávky')">Detail objednávky</button>
              <button type="button" class="mk-btn" @click="reorder"><img :src="src('icons/rotate.svg')" alt="" width="20" height="20" class="mk-ico-inv">Znovu objednat</button>
            </div>
          </section>

          <section class="mk-card mk-lists" aria-labelledby="h-lists">
            <div class="mk-rail-head"><h2 id="h-lists">Moje seznamy</h2><a href="#" class="mk-more" @click.prevent="soon('Nákupní seznamy')">Zobrazit vše</a></div>
            <ul class="mk-list-tiles">
              <li><button type="button" class="mk-list-new" @click="soon('Nový seznam')"><span>Nový seznam</span><b aria-hidden="true">+</b></button></li>
              <li v-for="l in home.lists" :key="l.id"><button type="button" class="mk-list-tile" @click="soon('Seznam ' + l.name)"><b>{{ l.name }}</b><span>Položky: {{ l.count }}</span></button></li>
            </ul>
          </section>
        </div>

        <makro-product-rail title="Nedávno objednané položky" :products="order.lines.map((l) => l.p)" more="Zobrazit vše" @more="soon('Historie objednávek')"></makro-product-rail>

        <section class="mk-cats" aria-labelledby="h-cats">
          <h2 id="h-cats">Oblíbené kategorie</h2>
          <ul class="mk-tiles">
            <li v-for="t in home.tiles" :key="t.name"><button type="button" class="mk-tile" @click="tile(t)"><img :src="t.image" alt="" width="92" height="92"><span>{{ t.name }}</span></button></li>
          </ul>
        </section>

        <makro-product-rail v-for="g in home.promoGroups" :key="g.id" :title="g.title" :products="group(g)" @more="g.id === 'meat' ? goCategory() : soon('Seznam produktů')"></makro-product-rail>

        <section class="mk-promos" aria-label="Další nabídky">
          <a v-for="p in home.promos" :key="p.id" href="#" class="mk-promo" :class="'t-' + p.theme" @click.prevent="soon(p.title)"><b>{{ p.title }}</b><span>{{ p.text }}</span></a>
        </section>
      </main>
    `,
  }
})()
