/* Header cart preview: the body of the popover (desktop) / bottom sheet (mobile) that opens from the header cart button.
   Delivery slot, deadline countdown, minimum-order progress, editable lines, totals and the way on to the cart page
   (patterns of the live makro cart panel and the kosik.cz preview). Placed by index.html into <makro-header>'s "cart" slot.
   Styles: css/chrome.css (.mk-cp-*). */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''

  Makro.CartPreview = {
    emits: ['close', 'open-cart'],
    setup(props, { emit }) {
      const store = Makro.store
      const left = Makro.useCountdown()
      const lines = Vue.computed(() =>
        Object.keys(store.cart).filter((id) => store.cart[id] > 0).map((id) => {
          const p = Makro.byId(id), q = store.cart[id]
          return { p, q, net: Makro.round2(p.net * q), gross: Makro.round2(p.gross * q) }
        }),
      )
      const sum = Vue.computed(() => Makro.summary())
      const missing = Vue.computed(() => Math.max(0, Makro.round2(Makro.minOrder.net - sum.value.goodsNet)))
      const pct = Vue.computed(() => Math.min(100, Math.round((sum.value.goodsNet / Makro.minOrder.net) * 100)))
      const typed = (id, e) => { const n = parseInt(e.target.value, 10); Makro.setQty(id, isNaN(n) ? 0 : n); e.target.value = store.cart[id] || 0 }
      const clear = () => { Makro.clearCart(); Makro.toast('Košík je vyprázdněný.') }
      return { store, left, lines, sum, missing, pct, typed, clear, setQty: Makro.setQty, delivery: Makro.delivery, min: Makro.minOrder, kc: Makro.kc, openProduct: (id) => { emit('close'); Makro.openProduct(id) }, src: (n) => base() + 'assets/' + n }
    },
    template: `
      <div class="mk-cp">
        <div class="mk-cp-head">
          <b>Košík ({{ sum.lines }})</b>
          <button type="button" class="mk-cp-x" aria-label="Zavřít náhled košíku" @click="$emit('close')">✕</button>
        </div>

        <div v-if="!sum.lines" class="mk-cp-empty">
          <p><b>Košík je prázdný</b></p>
          <p>Přidejte produkty z nabídky nebo zopakujte poslední objednávku.</p>
        </div>

        <template v-else>
          <div class="mk-cp-status">
            <div class="mk-cp-row"><span>Doručení</span><b>{{ delivery.date }}, {{ delivery.slot }}</b></div>
            <div class="mk-cp-clock"><span>Do uzávěrky objednávek zbývá</span><b role="timer">{{ left }}</b></div>
            <div class="mk-cp-min" :class="{ ok: !missing }">
              <span v-if="missing">Doplňte o <b>{{ kc(missing) }}</b> do minima {{ kc(min.net) }}. Pod minimem se účtuje {{ kc(min.fee) }}.</span>
              <span v-else>Minimální hodnota objednávky je splněna.</span>
              <span class="mk-os-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="pct"><span :style="{ width: pct + '%' }"></span></span>
            </div>
          </div>

          <ul class="mk-cp-lines">
            <li v-for="l in lines" :key="l.p.id">
              <a :href="'#/produkt/' + l.p.id" class="mk-cp-img" :aria-label="l.p.name" @click="$emit('close')"><img :src="l.p.image" alt="" width="48" height="48"></a>
              <div class="mk-cp-info">
                <a :href="'#/produkt/' + l.p.id" class="mk-cp-name" @click="$emit('close')">{{ l.p.name }}</a>
                <div class="mk-cp-price"><b>{{ store.vat === 'gross' ? kc(l.gross) : kc(l.net) }}</b><small>{{ store.vat === 'gross' ? 'vč. DPH' : 'bez DPH' }}</small></div>
              </div>
              <div class="mk-cp-qty">
                <button type="button" aria-label="Ubrat jeden kus" @click="setQty(l.p.id, l.q - 1)"><img :src="src('icons/minus-blue.svg')" alt="" width="16" height="16"></button>
                <input type="text" inputmode="numeric" :value="l.q" :aria-label="'Množství: ' + l.p.name" @change="typed(l.p.id, $event)">
                <button type="button" class="plus" aria-label="Přidat jeden kus" @click="setQty(l.p.id, l.q + 1)"><img :src="src('icons/plus-white.svg')" alt="" width="16" height="16"></button>
              </div>
            </li>
          </ul>

          <dl class="mk-cp-sum">
            <div><dt>Cena bez DPH</dt><dd>{{ kc(sum.goodsNet) }}</dd></div>
            <div v-if="sum.fee" class="fee"><dt>Poplatky</dt><dd>{{ kc(sum.fee) }}</dd></div>
            <div class="grand"><dt>Celkem vč. DPH</dt><dd>{{ kc(sum.totalGross) }}</dd></div>
          </dl>
        </template>

        <div class="mk-cp-actions">
          <button type="button" class="mk-btn mk-btn-wide" :disabled="!sum.lines" @click="$emit('open-cart')">Zobrazit košík</button>
          <button v-if="sum.lines" type="button" class="mk-link" @click="clear">Vyprázdnit košík</button>
        </div>
      </div>
    `,
  }
})()
