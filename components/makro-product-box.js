/* makro product box (Figma "Product Box makro" 18:7852 / 18:8151): product code, name, pack chip,
   net price with "vč. DPH" line, unit price, add-to-cart / stepper with in-cart feedback.
   Own component instead of the kit's product-item: the kit box has no product code, no net/VAT lines and is Košík-styled.
   Props: product (see js/store.js), qty, vat ('net' | 'gross' = which price is the headline), favorite.
   Emits: update:qty (number), favorite, open. Styles: css/store.css (.mk-box). */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''
  const nbsp = ' '

  Makro.ProductBox = {
    props: {
      product: { type: Object, required: true },
      qty: { type: Number, default: 0 },
      vat: { type: String, default: 'net' },
      favorite: { type: Boolean, default: false },
    },
    emits: ['update:qty', 'favorite', 'open'],
    setup(props) {
      const parts = (n) => {
        const [i, d] = n.toFixed(2).split('.')
        return { i, d }
      }
      const isGross = Vue.computed(() => props.vat === 'gross')
      const head = Vue.computed(() => (isGross.value ? props.product.gross : props.product.net))
      const headOld = Vue.computed(() => (isGross.value ? props.product.oldGross : props.product.old))
      const second = Vue.computed(() =>
        isGross.value ? 'bez' + nbsp + 'DPH ' + Makro.num(props.product.net) : 'vč.' + nbsp + 'DPH ' + Makro.num(props.product.gross),
      )
      const line = Vue.computed(() => Makro.kc(head.value * props.qty))
      return { parts, head, headOld, second, line, num: Makro.num, src: (n) => base() + 'assets/' + n }
    },
    template: `
      <article class="mk-box" :data-tid="'product-box-' + product.id">
        <div class="mk-box-img">
          <button type="button" class="mk-box-open" :aria-label="product.name" @click="$emit('open', product)"><img :src="product.image" alt="" loading="lazy"></button>
          <div class="mk-tags" v-if="product.sale || product.multikup">
            <span v-if="product.sale" class="mk-tag mk-tag-sale">Akce</span>
            <span v-if="product.multikup" class="mk-tag mk-tag-multi">Multikup</span>
          </div>
          <button type="button" class="mk-heart" :class="{ on: favorite }" :aria-pressed="favorite" :aria-label="favorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'" @click="$emit('favorite', product.id)"><svg v-if="favorite" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-5-9.7-10C1.1 7.3 3.1 4 6.6 4c2 0 3.8 1 5.4 3 1.6-2 3.4-3 5.4-3 3.5 0 5.5 3.3 4.3 7C20 16 12 21 12 21z"/></svg><img v-else :src="src('icons/heart.svg')" alt="" width="20" height="20"></button>
          <div class="mk-cta">
            <button v-if="!qty" type="button" class="mk-add" :aria-label="'Přidat do košíku: ' + product.name" @click="$emit('update:qty', 1)"><img :src="src('icons/plus-white.svg')" alt="" width="20" height="20"></button>
            <template v-else>
              <div class="mk-incart" aria-live="polite"><span><img :src="src('icons/cart-solid-green.svg')" alt="" width="16" height="16">{{ qty }} ks</span><b>{{ line }}</b></div>
              <div class="mk-step">
                <button type="button" class="mk-step-btn mk-minus" aria-label="Ubrat jeden kus" @click="$emit('update:qty', qty - 1)"><img :src="src('icons/minus-blue.svg')" alt="" width="20" height="20"></button>
                <span class="mk-step-qty">{{ qty }}</span>
                <button type="button" class="mk-step-btn mk-plus" aria-label="Přidat jeden kus" @click="$emit('update:qty', qty + 1)"><img :src="src('icons/plus-white.svg')" alt="" width="20" height="20"></button>
              </div>
            </template>
          </div>
        </div>
        <div class="mk-box-data">
          <div class="mk-code">{{ product.code }}</div>
          <a :href="'#/produkt/' + product.id" class="mk-name">{{ product.name }}</a>
          <div class="mk-pack"><span>Balení</span><span class="mk-pill">{{ product.pack }}</span></div>
          <div class="mk-price">
            <div class="mk-price-row">
              <span class="mk-now" :class="{ sale: product.sale }"><b>{{ parts(head).i }}</b><sup>{{ parts(head).d }}</sup></span>
              <s v-if="headOld" class="mk-old">{{ num(headOld) }}</s>
            </div>
            <div class="mk-second">{{ second }}</div>
            <div v-if="product.sale" class="mk-sale-note">{{ product.sale }}</div>
          </div>
          <div class="mk-unit"><span>{{ product.weight }}</span><span>{{ product.unitPrice }}</span></div>
        </div>
      </article>
    `,
  }
})()
