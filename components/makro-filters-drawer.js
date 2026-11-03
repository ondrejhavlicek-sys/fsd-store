/* "Filtry a řazení" drawer of the category page (structure and behaviour of kosik.cz: right-hand drawer, here a bottom sheet
   on phones; switches on top, accordion groups with the chosen values as subtitle, sorting last on desktop and first on mobile,
   footer with the primary button and "Zrušit filtry"). Filters apply live; state and counts come from js/makro-filters.js.
   The container is the Fresh Drawer / BottomSheet (dialog role, focus trap, Escape, focus back to the trigger, scroll lock);
   the rows are own markup (native inputs) so counts are part of the accessible names. Styles: css/filters.css.
   Use: <makro-filters-drawer v-model:open="open" :filters="Makro.categoryFilters"><template #trigger>button</template></makro-filters-drawer> */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const int = (n) => Math.round(n).toLocaleString('cs-CZ').replace(/\s/g, ' ')

  Makro.FiltersDrawer = {
    props: { open: { type: Boolean, default: false }, filters: { type: Object, required: true } },
    emits: ['update:open'],
    setup(props, { emit }) {
      const f = props.filters
      const cfg = Makro.filterConfig
      /* bottom sheet at 768 px and below, like the rest of the prototype */
      const mq = window.matchMedia('(max-width: 768px)')
      const mobile = Vue.ref(mq.matches)
      const onMq = (e) => (mobile.value = e.matches)
      Vue.onMounted(() => mq.addEventListener('change', onMq))
      Vue.onUnmounted(() => mq.removeEventListener('change', onMq))

      const more = Vue.reactive({}) // groups whose full list is shown
      const query = Vue.reactive({}) // search text per group
      const searchable = (g) => g.options.length >= cfg.searchMin
      const needsMore = (g) => !query[g.id] && g.options.length > cfg.moreLimit
      const shown = (g) => {
        const q = norm(query[g.id] || '')
        if (q) return g.options.filter((o) => norm(o.label).includes(q))
        if (!needsMore(g) || more[g.id]) return g.options
        return g.options.filter((o, i) => i < cfg.moreShown || o.selected)
      }
      const hidden = (g) => g.options.length - shown(g).length

      const total = Vue.computed(() => f.list.length + ' ' + Makro.plural(f.list.length, 'produkt', 'produkty', 'produktů'))
      const showLabel = Vue.computed(() => (f.list.length ? 'Zobrazit ' + total.value : 'Žádné produkty'))
      const live = Vue.computed(() => (f.list.length ? 'Odpovídá ' + total.value + '.' : 'Žádný produkt neodpovídá zvoleným filtrům.'))
      const vatLabel = () => (Makro.store.vat === 'gross' ? 'včetně DPH' : 'bez DPH')
      const priceSubtitle = Vue.computed(() => (f.price.on ? int(f.price.min) + '–' + int(f.price.max) + ' Kč ' + vatLabel() : ''))
      const sortLabel = Vue.computed(() => f.sorts.find((s) => s.key === f.state.sort).label)

      const onMin = (e) => {
        const v = parseFloat(e.target.value)
        f.setPrice(isNaN(v) ? f.price.lo : v, f.price.max)
        e.target.value = f.price.min
      }
      const onMax = (e) => {
        const v = parseFloat(e.target.value)
        f.setPrice(f.price.min, isNaN(v) ? f.price.hi : v)
        e.target.value = f.price.max
      }
      const dragMin = (e) => f.setPrice(Math.min(+e.target.value, f.price.max), f.price.max)
      const dragMax = (e) => f.setPrice(f.price.min, Math.max(+e.target.value, f.price.min))
      /* edges of the track fill in percent */
      const span = Vue.computed(() => {
        const { lo, hi, min, max } = f.price
        return { '--from': ((min - lo) / (hi - lo)) * 100 + '%', '--to': ((hi - max) / (hi - lo)) * 100 + '%' }
      })
      const minOnTop = Vue.computed(() => f.price.min - f.price.lo > (f.price.hi - f.price.lo) / 2)

      /* the Fresh containers do not forward attributes to the dialog element: mark it modal here
         (the DS already hides the rest of the page from assistive technology while it is open) */
      Vue.watch(() => props.open, (v) => {
        if (v) setTimeout(() => { const d = document.querySelector('[data-cid="ds-drawer"], [data-cid="ds-bottom-sheet"]'); if (d) d.setAttribute('aria-modal', 'true') }, 50)
      })
      const close = () => emit('update:open', false)
      const resetAll = () => { f.reset(); close() }
      const accordionClasses = {
        headerWrapper: 'has-[[data-state=open]]:tw-min-h-[72px]',
        header: 'tw-py-4 tw-pl-4 tw-pr-2',
        toggleIcon: 'tw-self-start',
        body: 'tw-pt-1 tw-pl-4 tw-pr-2 tw-pb-2',
        title: 'tw-text-style-strong',
      }
      return { f, mobile, more, query, searchable, needsMore, shown, hidden, total, showLabel, live, priceSubtitle, sortLabel, onMin, onMax, dragMin, dragMax, span, minOnTop, close, resetAll, accordionClasses, setVat: Makro.setVat, store: Makro.store }
    },
    template: `
      <component
        :is="mobile ? 'ds-bottom-sheet' : 'ds-drawer'"
        :open="open"
        title="Filtry a řazení"
        :class="mobile ? 'mk-fsheet' : 'mk-fdrawer'"
        :classes="mobile
          ? { header: 'tw-pt-4', title: 'tw-text-style-lg-strong', body: 'mk-fbody', footer: 'tw-px-4 tw-pt-3' }
          : { header: 'tw-py-4 tw-items-center', title: 'tw-text-style-lg-strong', body: 'tw-px-2 tw-py-1 tw-overflow-y-auto', footer: 'tw-py-3' }"
        data-tid="filters-drawer"
        @update:open="$emit('update:open', $event)">
        <template v-if="$slots.trigger" #trigger><slot name="trigger"></slot></template>

        <div class="mk-fd">
          <p class="mk-sr" role="status" aria-live="polite">{{ live }}</p>

          <ul class="mk-fd-toggles" aria-label="Rychlé filtry">
            <li v-for="t in f.toggles" :key="t.key">
              <label class="mk-fd-row" :class="{ dis: t.disabled }">
                <span class="mk-fd-lbl">{{ t.label }} <span class="mk-fd-n">({{ t.count }})</span></span>
                <input type="checkbox" role="switch" class="mk-switch" :checked="t.on" :disabled="t.disabled" :data-tid="'filter-toggle-' + t.key" @change="f.setToggle(t.key, $event.target.checked)">
                <span class="mk-switch-ui" aria-hidden="true"></span>
              </label>
            </li>
          </ul>

          <ds-accordion type="multiple" item-style="divider" :scroll-into-view="true" :item-classes="accordionClasses" disable-animation>
            <ds-accordion-item v-if="mobile" title="Řazení produktů" :subtitle="sortLabel" data-tid="filter-order-by">
              <fieldset class="mk-fd-list">
                <legend class="mk-sr">Řazení produktů</legend>
                <label v-for="s in f.sorts" :key="s.key" class="mk-fd-opt">
                  <input type="radio" name="mk-fd-sort" class="mk-radio" :checked="f.state.sort === s.key" @change="f.state.sort = s.key">
                  <span class="mk-fd-ui" aria-hidden="true"></span>
                  <span class="mk-fd-name">{{ s.label }}</span>
                </label>
              </fieldset>
            </ds-accordion-item>

            <ds-accordion-item title="Cena" :subtitle="priceSubtitle" data-tid="filter-price">
              <fieldset class="mk-fd-price">
                <legend class="mk-sr">Cena</legend>
                <div class="mk-seg mk-fd-vat" role="group" aria-label="Zobrazení cen">
                  <button type="button" :class="{ on: store.vat === 'net' }" :aria-pressed="store.vat === 'net'" @click="setVat('net')">Bez DPH</button>
                  <button type="button" :class="{ on: store.vat === 'gross' }" :aria-pressed="store.vat === 'gross'" @click="setVat('gross')">Včetně DPH</button>
                </div>
                <div class="mk-fd-fields">
                  <label class="mk-fd-num"><span>Od</span><input type="number" inputmode="numeric" :min="f.price.lo" :max="f.price.hi" step="1" :value="f.price.min" @change="onMin"><span aria-hidden="true">Kč</span></label>
                  <label class="mk-fd-num"><span>Do</span><input type="number" inputmode="numeric" :min="f.price.lo" :max="f.price.hi" step="1" :value="f.price.max" @change="onMax"><span aria-hidden="true">Kč</span></label>
                </div>
                <div class="mk-fd-slider" :style="span">
                  <div class="mk-fd-track" aria-hidden="true"></div>
                  <input type="range" class="mk-fd-thumb" :class="{ top: minOnTop }" aria-label="Cena od" :min="f.price.lo" :max="f.price.hi" step="1" :value="f.price.min" @input="dragMin">
                  <input type="range" class="mk-fd-thumb" aria-label="Cena do" :min="f.price.lo" :max="f.price.hi" step="1" :value="f.price.max" @input="dragMax">
                </div>
                <div class="mk-fd-ends" aria-hidden="true"><span>{{ f.price.lo }}&nbsp;Kč</span><span>{{ f.price.hi }}&nbsp;Kč</span></div>
              </fieldset>
            </ds-accordion-item>

            <ds-accordion-item v-for="g in f.groups" :key="g.id" :title="g.title" :subtitle="g.subtitle" :data-tid="'filter-group-' + g.id">
              <fieldset class="mk-fd-list">
                <legend class="mk-sr">{{ g.title }}</legend>
                <div v-if="searchable(g)" class="mk-fd-find">
                  <label class="mk-sr" :for="'mk-fd-q-' + g.id">Hledat ve skupině {{ g.title }}</label>
                  <input :id="'mk-fd-q-' + g.id" type="search" placeholder="Hledat" autocomplete="off" v-model="query[g.id]">
                </div>
                <label v-for="o in shown(g)" :key="o.id" class="mk-fd-opt" :class="{ dis: o.disabled }">
                  <input type="checkbox" class="mk-check" :checked="o.selected" :disabled="o.disabled" :data-tid="'filter-' + g.id + '-' + o.id" @change="f.setItem(g.id, o.id, $event.target.checked)">
                  <span class="mk-fd-ui" aria-hidden="true"></span>
                  <span class="mk-fd-name">{{ o.label }} <span class="mk-fd-n">({{ o.count }})</span></span>
                </label>
                <p v-if="query[g.id] && !shown(g).length" class="mk-fd-none">Nic jsme nenašli.</p>
                <button v-if="needsMore(g) && (hidden(g) > 0 || more[g.id])" type="button" class="mk-fd-more" :aria-expanded="!!more[g.id]" @click="more[g.id] = !more[g.id]">
                  {{ more[g.id] ? 'Zobrazit méně' : 'Zobrazit více (' + hidden(g) + ')' }}
                </button>
              </fieldset>
            </ds-accordion-item>

            <ds-accordion-item v-if="!mobile" title="Řazení produktů" :subtitle="sortLabel" data-tid="filter-order-by">
              <fieldset class="mk-fd-list">
                <legend class="mk-sr">Řazení produktů</legend>
                <label v-for="s in f.sorts" :key="s.key" class="mk-fd-opt">
                  <input type="radio" name="mk-fd-sort" class="mk-radio" :checked="f.state.sort === s.key" @change="f.state.sort = s.key">
                  <span class="mk-fd-ui" aria-hidden="true"></span>
                  <span class="mk-fd-name">{{ s.label }}</span>
                </label>
              </fieldset>
            </ds-accordion-item>
          </ds-accordion>
        </div>

        <template #actions>
          <ds-button :label="showLabel" class="tw-h-10" size="md" data-tid="filter-apply" @click="close"></ds-button>
          <ds-button :disabled="!f.count" variant="secondary" class="tw-h-10" size="md" label="Zrušit filtry" data-tid="filter-clear-filters-all" @click="resetAll"></ds-button>
        </template>
      </component>
    `,
  }
})()
