/* Category page body (Figma "category page" 18:5253, body 18:5377): breadcrumbs + title, subcategory tiles,
   filter bar, product count, price display switch (Bez DPH / Včetně DPH), sorting and the product grid.
   Mock data and shared cart state come from js/store.js (window.Makro.store). Filter state, counts and list come from
   js/makro-filters.js (one state for pills, tiles, chips and the drawer in components/makro-filters-drawer.js). Styles: css/store.css, css/filters.css. */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''
  const ICON = { today: 'icons/calendar.svg', sale: 'icons/discount.svg', multi: 'icons/multikup.svg' }

  Makro.CategoryPage = {
    components: { MakroProductBox: Makro.ProductBox, MakroFiltersDrawer: Makro.FiltersDrawer },
    setup() {
      const { store, category } = Makro
      const flt = Makro.categoryFilters
      const f = flt.state
      const drawer = Vue.ref(false)
      const bar = Vue.ref(null)

      const list = Vue.computed(() => flt.list)
      const count = Vue.computed(() => list.value.length + ' ' + Makro.plural(list.value.length, 'produkt', 'produkty', 'produktů'))
      const sortLabel = Vue.computed(() => flt.sorts.find((s) => s.key === f.sort).label)

      /* chips (active filters, in the order they were set) followed by the quick pills that are still off; a quick pill and
         its chip are the same button with the same key, so a click keeps the focus on it */
      const chips = Vue.computed(() => {
        const quick = (k) => flt.toggles.find((t) => t.key === k && t.pill)
        const on = flt.active.map((a) => ({ key: a.key, label: a.label, quick: !!quick(a.key), on: true, icon: ICON[a.key], act: a.remove }))
        const off = flt.toggles.filter((t) => t.pill && !t.on).map((t) => ({ key: t.key, label: t.label, quick: true, on: false, disabled: t.disabled, icon: ICON[t.key], act: () => flt.setToggle(t.key, true) }))
        return on.concat(off)
      })
      const pressChip = (b) => {
        const els = [...bar.value.querySelectorAll('[data-fkey]')]
        const at = els.findIndex((e) => e.dataset.fkey === b.key)
        b.act()
        Vue.nextTick(() => {
          const now = [...bar.value.querySelectorAll('[data-fkey]')]
          const to = now.find((e) => e.dataset.fkey === b.key) || now[Math.min(at, now.length - 1)] || bar.value.querySelector('.mk-fbtn')
          if (to) to.focus()
        })
      }
      const resetAll = () => { flt.reset(); Vue.nextTick(() => bar.value && bar.value.querySelector('.mk-fbtn').focus()) }
      const soon = (what) => Makro.toast(what + ' zatím není součástí prototypu.')

      return { store, category, flt, f, list, count, sortLabel, drawer, bar, chips, pressChip, resetAll, soon, setQty: Makro.setQty, openProduct: Makro.openProduct, setVat: Makro.setVat, src: (n) => base() + 'assets/' + n }
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
              <button type="button" class="mk-tile" :class="{ on: f.sub.includes(s.id) }" :aria-pressed="f.sub.includes(s.id)" @click="flt.pickSub(s.id)">
                <img :src="s.image" alt="" width="92" height="92">
                <span>{{ s.name }}</span>
              </button>
            </li>
          </ul>
        </header>

        <section class="mk-list" aria-label="Produkty">
          <div class="mk-toolbar">
            <div class="mk-filters" ref="bar" role="group" aria-label="Filtry produktů">
              <makro-filters-drawer v-model:open="drawer" :filters="flt">
                <template #trigger>
                  <button type="button" class="mk-fbtn" data-tid="filters-button">
                    <img :src="src('icons/filter.svg')" alt="" width="24" height="24">Filtry
                    <span v-if="flt.count" class="mk-fbadge" aria-hidden="true">{{ flt.count }}</span>
                    <span v-if="flt.count" class="mk-sr">(aktivní: {{ flt.count }})</span>
                  </button>
                </template>
              </makro-filters-drawer>
              <button v-for="b in chips" :key="b.key" type="button" class="mk-fpill" :class="{ on: b.on }" :data-fkey="b.key" :data-tid="b.on ? 'filter-chip' : 'filter-pill'"
                :aria-pressed="b.quick ? b.on : null" :aria-label="b.quick ? null : 'Zrušit filtr: ' + b.label" :disabled="b.disabled" @click="pressChip(b)">
                <img v-if="b.icon" :src="src(b.icon)" alt="" width="20" height="20">{{ b.label }}<svg v-if="b.on" class="mk-fx" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>
              </button>
              <button v-if="flt.count" type="button" class="mk-fclear" data-tid="filter-clear" @click="resetAll">Zrušit filtry</button>
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
                  <ds-dropdown-menu-item v-for="s in flt.sorts" :key="s.key" :label="s.label" @select="f.sort = s.key"></ds-dropdown-menu-item>
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
            <button type="button" class="mk-fbtn" @click="resetAll">Zrušit filtry</button>
          </div>
        </section>
      </main>
    `,
  }
})()
