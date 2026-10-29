/* makro shell: header (topbar + navigation bar with cart summary) and footer.
   Built from the Figma draft "FSD-Store" (category page 18:5253): header 18:5299, subheader 18:5319, footer 18:5392.
   Registers as ProtoKit.MakroHeader / ProtoKit.MakroFooter, so pages can use <makro-header> / <makro-footer>
   (the page boot code registers every ProtoKit component). Styles live in css/chrome.css.
   Needs KosikUI (Fresh) for DropdownMenu and the icon set. window.MAKRO_BASE is the path prefix to assets/
   (default '', e.g. '../' for pages one folder down). */
(function () {
  const ProtoKit = (window.ProtoKit = window.ProtoKit || {})
  const ICONS = KosikUI.icons
  const base = () => window.MAKRO_BASE || ''
  const nbsp = ' '

  /* 19278.8 -> "19 278,80 Kč" (non-breaking spaces, as in the Czech UI) */
  const money = (n) =>
    new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .format(n)
      .replace(/ /g, nbsp) + nbsp + 'Kč'

  const DEFAULT_MENUS = {
    food: ['Ovoce a zelenina', 'Čerstvé, chlazené', 'Mražené', 'Trvanlivé potraviny', 'Nápoje', 'Pečivo a cukrářské výrobky'],
    nonfood: ['Úklid a hygiena', 'Obaly a jednorázové nádobí', 'Kuchyňské vybavení', 'Kancelář a papír'],
  }

  ProtoKit.MakroHeader = {
    props: {
      /** search term (v-model) */
      modelValue: { type: String, default: '' },
      deliveryAddress: { type: String, default: 'Evropská 2758/11, Praha 6' },
      /** initials in the account button */
      userInitials: { type: String, default: 'JM' },
      notificationCount: { type: Number, default: 0 },
      cartCount: { type: Number, default: 0 },
      /** cart total without VAT, in CZK */
      cartNet: { type: Number, default: 0 },
      /** cart total including VAT, in CZK */
      cartGross: { type: Number, default: 0 },
      /** { food: [labels], nonfood: [labels] } for the two category dropdowns */
      menus: { type: Object, default: () => DEFAULT_MENUS },
      /** the cart preview panel (slot "cart") is open */
      cartOpen: { type: Boolean, default: false },
    },
    emits: ['update:modelValue', 'search', 'address', 'notifications', 'user-menu', 'cart-toggle', 'checkout', 'navigate', 'repeat-order', 'shopping-lists'],
    setup(props, { emit }) {
      const term = Vue.computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
      const submit = () => emit('search', props.modelValue)
      return { ICONS, term, submit, money, src: (name) => base() + 'assets/' + name }
    },
    template: `
      <header class="mk-header" data-tid="app-header">
        <div class="mk-top">
          <div class="mk-wrap mk-top-in">
            <a class="mk-logo" href="#/" aria-label="makro"><img :src="src('brand/makro-logo.svg')" alt="makro" width="129" height="32"></a>
            <button type="button" class="mk-addr" @click="$emit('address')">
              <span class="mk-addr-txt"><small>Vybraná dodací adresa</small><b>{{ deliveryAddress }}</b></span>
              <img :src="src('icons/chevron-right.svg')" alt="" width="20" height="20">
            </button>
            <form class="mk-search" role="search" @submit.prevent="submit">
              <input type="search" v-model="term" placeholder="Hledejte produkt, kategorii nebo značku" aria-label="Hledat produkt, kategorii nebo značku">
              <button type="button" class="mk-mic" aria-label="Hlasové vyhledávání"><img :src="src('icons/mic.svg')" alt="" width="20" height="20"></button>
              <button type="submit" class="mk-go" aria-label="Hledat"><img :src="src('icons/search.svg')" alt="" width="24" height="24"></button>
            </form>
            <div class="mk-ctl">
              <button type="button" class="mk-circ" aria-label="Oznámení" @click="$emit('notifications')">
                <img :src="src('icons/bell.svg')" alt="" width="20" height="20">
                <span v-if="notificationCount" class="mk-dot">{{ notificationCount }}</span>
              </button>
              <button type="button" class="mk-circ mk-user" aria-label="Můj účet" @click="$emit('user-menu')">{{ userInitials }}</button>
            </div>
          </div>
          <button type="button" class="mk-addr-bar" @click="$emit('address')">
            <span>Doručení: <b>{{ deliveryAddress }}</b></span>
            <img :src="src('icons/chevron-right.svg')" alt="" width="18" height="18">
          </button>
        </div>

        <div class="mk-sub">
          <div class="mk-wrap mk-sub-in">
            <nav class="mk-nav" aria-label="Hlavní navigace">
              <ds-dropdown-menu v-for="k in ['food', 'nonfood']" :key="k" align="start">
                <template #trigger>
                  <button type="button" class="mk-nav-item"><span>{{ k === 'food' ? 'Potraviny' : 'Nepotravinové zboží' }}</span><component :is="ICONS.ChevronDownSolid" class="mk-chev tw-icon-ds-20"></component></button>
                </template>
                <ds-dropdown-menu-item v-for="l in menus[k]" :key="l" :label="l" @select="$emit('navigate', { label: l })"></ds-dropdown-menu-item>
              </ds-dropdown-menu>
              <button type="button" class="mk-nav-item" @click="$emit('shopping-lists')"><span>Nákupní seznamy</span><img :src="src('icons/shopping-list.svg')" alt="" width="24" height="24"></button>
              <button type="button" class="mk-nav-item" title="Zopakovat poslední objednávku" aria-label="Zopakovat poslední objednávku" @click="$emit('repeat-order')"><img :src="src('icons/rotate.svg')" alt="" width="24" height="24"><span>Zopakovat poslední objednávku</span></button>
            </nav>
            <div class="mk-cart">
              <button type="button" class="mk-cart-btn" aria-label="Náhled košíku" aria-haspopup="true" aria-controls="cart-preview" :aria-expanded="cartOpen" @click="$emit('cart-toggle')">
                <component :is="ICONS.ChevronDownSolid" class="mk-dd tw-icon-ds-20"></component>
                <span class="mk-ci"><img :src="src('icons/cart.svg')" alt="" width="24" height="24"><span class="mk-cnt">{{ cartCount }}</span></span>
              </button>
              <div class="mk-tot"><b>{{ money(cartNet) }}</b><small>{{ money(cartGross) }} včetně DPH</small></div>
              <button type="button" class="mk-checkout" @click="$emit('checkout')">K pokladně</button>
              <div v-if="cartOpen" class="mk-cart-pop" id="cart-preview" role="region" aria-label="Náhled košíku"><slot name="cart"></slot></div>
              <div v-if="cartOpen" class="mk-cart-backdrop" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </header>
    `,
  }

  const DEFAULT_COLUMNS = [
    { title: 'Pro vaše podnikání', links: ['Můj obchod', 'Vzor plné moci ke stažení', 'Vše pro maloobchod', 'Vše pro gastronomii', 'Track & Trace', 'ProTrace', 'Kvalita a standardy', 'Compliance'] },
    { title: 'O nás', links: ['O makro', 'Pro dodavatele', 'Pro novináře', 'Nejčastější otázky', 'Kariéra', 'Udržitelnost', 'Metro AG'] },
    { title: 'Užitečné odkazy', links: ['Získat makro kartu', 'Bonusový program', 'Energetické štítky', 'Informace o stažení výrobku', 'makro akademie', 'makro newsletter'] },
  ]

  ProtoKit.MakroFooter = {
    props: {
      columns: { type: Array, default: () => DEFAULT_COLUMNS },
      phone: { type: String, default: '+420 271 005 005' },
      hours: { type: String, default: 'Po - Pá: 7:00–19:00 Ne: 12:00–19:00' },
      email: { type: String, default: 'info@makro.cz' },
    },
    emits: ['link'],
    setup() {
      return { src: (name) => base() + 'assets/' + name }
    },
    template: `
      <footer class="mk-footer" data-tid="app-footer">
        <div class="mk-wrap">
          <div class="mk-fcols">
            <section v-for="c in columns" :key="c.title">
              <h2>{{ c.title }}</h2>
              <ul><li v-for="l in c.links" :key="l"><a href="#" @click.prevent="$emit('link', { label: l })">{{ l }}</a></li></ul>
            </section>
            <section>
              <h2>Kontakty</h2>
              <ul>
                <li><a :href="'tel:' + phone.replace(/\\s/g, '')">{{ phone }}</a></li>
                <li>{{ hours }}</li>
                <li><a :href="'mailto:' + email">{{ email }}</a></li>
              </ul>
              <h2 class="mk-follow">Sledujte nás</h2>
              <div class="mk-soc">
                <a href="#" aria-label="Facebook" @click.prevent><img :src="src('brand/social-facebook.svg')" alt="" height="23"></a>
                <a href="#" aria-label="Instagram" @click.prevent><img :src="src('brand/social-instagram.svg')" alt="" height="24"></a>
                <a href="#" aria-label="YouTube" @click.prevent><img :src="src('brand/social-youtube.svg')" alt="" height="18"></a>
              </div>
            </section>
          </div>
          <p class="mk-copy">© Makro Cash &amp; Carry ČR, s.r.o.</p>
        </div>
      </footer>
    `,
  }
})()
