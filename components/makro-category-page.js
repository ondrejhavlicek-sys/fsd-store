/* Category page body (Figma "category page" 18:5253, body 18:5377): breadcrumbs + title, subcategory tiles,
   filter bar, product count, price display switch (Bez DPH / Včetně DPH), sorting and the product grid.
   Mock data and shared cart state come from js/store.js (window.Makro.store). Styles: css/store.css. */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''
  const SORTS = [
    { key: 'recommended', label: 'Doporučené' },
    { key: 'cheapest', label: 'Nejlevnější' },
    { key: 'priciest', label: 'Nejdražší' },
    { key: 'name', label: 'Název A–Z' },
  ]

  Makro.CategoryPage = {
    components: { MakroProductBox: Makro.ProductBox },
    setup() {
      const { store, category } = Makro
      const f = Vue.reactive({ today: true, sale: false, multi: false, sub: null, sort: 'recommended' })

      const list = Vue.computed(() => {
        let r = Makro.sausages.filter(
          (p) => (!f.today || p.today) && (!f.sale || p.sale) && (!f.multi || p.multikup) && (!f.sub || p.sub === f.sub),
        )
        const price = (p) => p.net
        if (f.sort === 'cheapest') r = r.slice().sort((a, b) => price(a) - price(b))
        else if (f.sort === 'priciest') r = r.slice().sort((a, b) => price(b) - price(a))
        else if (f.sort === 'name') r = r.slice().sort((a, b) => a.name.localeCompare(b.name, 'cs'))
        return r
      })
      const count = Vue.computed(() => list.value.length + ' ' + Makro.plural(list.value.length, 'produkt', 'produkty', 'produktů'))
      const sortLabel = Vue.computed(() => SORTS.find((s) => s.key === f.sort).label)

      const pickSub = (id) => (f.sub = f.sub === id ? null : id)
      const reset = () => Object.assign(f, { today: false, sale: false, multi: false, sub: null })
      const soon = (what) => Makro.toast(what + ' zatím není součástí prototypu.')

      return { store, category, f, list, count, SORTS, sortLabel, pickSub, reset, soon, setQty: Makro.setQty, openProduct: Makro.openProduct, setVat: Makro.setVat, src: (n) => base() + 'assets/' + n }
    },
    template: `
      <main class="mk-wrap mk-page" data-tid="category-page">
        <header class="mk-pnav">
          <nav aria-label="Drobečková navigace">
            <ol class="mk-crumbs">
              <li v-for="(c, i) in category.breadcrumbs" :key="c">
                <img v-if="i" :src="src('icons/breadcrumb-sep.svg')" alt="" width="8" height="16">
                <a v-if="i === 0" href="#/">{{ c }}</a>
                <a v-else-if="i < category.breadcrumbs.length - 1" href="#" @click.prevent="soon('Navigace')">{{ c }}</a>
                <span v-else aria-current="page">{{ c }}</span>
              </li>
            </ol>
          </nav>
          <h1 class="mk-title">{{ category.title }}</h1>
          <ul class="mk-tiles" aria-label="Podkategorie">
            <li v-for="s in category.subcategories" :key="s.id">
              <button type="button" class="mk-tile" :class="{ on: f.sub === s.id }" :aria-pressed="f.sub === s.id" @click="pickSub(s.id)">
                <img :src="s.image" alt="" width="92" height="92">
                <span>{{ s.name }}</span>
              </button>
            </li>
          </ul>
        </header>

        <section class="mk-list" aria-label="Produkty">
          <div class="mk-toolbar">
            <div class="mk-filters">
              <button type="button" class="mk-fbtn" @click="soon('Filtry')"><img :src="src('icons/filter.svg')" alt="" width="24" height="24">Filtry</button>
              <button type="button" class="mk-fpill" :class="{ on: f.today }" :aria-pressed="f.today" @click="f.today = !f.today"><img :src="src('icons/calendar.svg')" alt="" width="20" height="20">Dostupné dnes</button>
              <button type="button" class="mk-fpill" :class="{ on: f.sale }" :aria-pressed="f.sale" @click="f.sale = !f.sale"><img :src="src('icons/discount.svg')" alt="" width="20" height="20">Akce</button>
              <button type="button" class="mk-fpill" :class="{ on: f.multi }" :aria-pressed="f.multi" @click="f.multi = !f.multi"><img :src="src('icons/multikup.svg')" alt="" width="20" height="20">Multikup</button>
            </div>
            <div class="mk-utils">
              <b class="mk-count" aria-live="polite">{{ count }}</b>
              <div class="mk-utils-r">
                <div class="mk-seg" role="group" aria-label="Zobrazení cen">
                  <button type="button" :class="{ on: store.vat === 'net' }" :aria-pressed="store.vat === 'net'" @click="setVat('net')">Bez DPH</button>
                  <button type="button" :class="{ on: store.vat === 'gross' }" :aria-pressed="store.vat === 'gross'" @click="setVat('gross')">Včetně DPH</button>
                </div>
                <ds-dropdown-menu align="end">
                  <template #trigger>
                    <span class="mk-split" role="button" tabindex="0" :aria-label="'Řazení: ' + sortLabel">
                      <span class="mk-split-l"><img :src="src('icons/sort.svg')" alt="" width="20" height="20">{{ sortLabel }}</span>
                      <span class="mk-split-r"><img :src="src('icons/chevron-down-dark.svg')" alt="" width="20" height="20"></span>
                    </span>
                  </template>
                  <ds-dropdown-menu-item v-for="s in SORTS" :key="s.key" :label="s.label" @select="f.sort = s.key"></ds-dropdown-menu-item>
                </ds-dropdown-menu>
              </div>
            </div>
          </div>

          <ul v-if="list.length" class="mk-grid">
            <li v-for="p in list" :key="p.id">
              <makro-product-box
                :product="p"
                :qty="store.cart[p.id] || 0"
                :vat="store.vat"
                :favorite="!!store.fav[p.id]"
                @update:qty="setQty(p.id, $event)"
                @favorite="store.fav[p.id] = !store.fav[p.id]"
                @open="openProduct($event.id)"></makro-product-box>
            </li>
          </ul>
          <div v-else class="mk-empty">
            <p><b>Žádný produkt neodpovídá zvoleným filtrům.</b></p>
            <button type="button" class="mk-fbtn" @click="reset">Zrušit filtry</button>
          </div>
        </section>
      </main>
    `,
  }
})()
