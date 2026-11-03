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

  /* thumbnails for the few mega-menu blocks we have photos for; the makro.cz category data carries no images */
  const THUMBS = { Ovoce: 'assets/tiles/t01.png', 'Masné výrobky': 'assets/tiles/parky.png' }
  const IMPLEMENTED = 'Párky, špekáčky, točené salámy'

  ProtoKit.MakroHeader = {
    props: {
      /** search term (v-model) */
      modelValue: { type: String, default: '' },
      /** fallback label when the account area (selfcare/bridge.js) is not loaded; otherwise the selected delivery address is shown */
      deliveryAddress: { type: String, default: 'Evropská 2758/11, Praha 6' },
      notificationCount: { type: Number, default: 0 },
      cartCount: { type: Number, default: 0 },
      /** cart total without VAT, in CZK */
      cartNet: { type: Number, default: 0 },
      /** cart total including VAT, in CZK */
      cartGross: { type: Number, default: 0 },
      /** category tree for the mega-menu, see js/nav-data.js: [[root, [[group, [[block, n, [children]]]]]]] */
      navTree: { type: Array, default: () => (window.Makro && window.Makro.navTree) || [] },
      /** the cart preview panel (slot "cart") is open */
      cartOpen: { type: Boolean, default: false },
      /** simplified header (logo, search, account) as on the Košík.cz basket page: no address and no navigation bar */
      simple: { type: Boolean, default: false },
    },
    emits: ['update:modelValue', 'search', 'address', 'notifications', 'account-open', 'cart-toggle', 'checkout', 'navigate', 'repeat-order', 'shopping-lists'],
    setup(props, { emit }) {
      const term = Vue.computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
      const submit = () => emit('search', props.modelValue)

      /* ---- mega-menu (Košík.cz "Produkty" pattern): left list of groups, right side blocks with their children ---- */
      const roots = Vue.computed(() =>
        props.navTree.map(([name, groups]) => ({
          name,
          groups: groups.map(([gn, blocks]) => ({ name: gn.trim(), blocks: blocks.map(([bn, n, kids]) => ({ name: bn.trim(), n, kids: kids.map((k) => k.trim()) })) })),
        })),
      )
      const openRoot = Vue.ref(null)
      const activeGroup = Vue.ref(0)
      const group = Vue.computed(() => (openRoot.value === null ? null : roots.value[openRoot.value].groups[activeGroup.value]))
      const focusList = () => Vue.nextTick(() => document.getElementById('mk-l1-' + activeGroup.value)?.focus())
      const closeMenu = (refocus) => {
        const i = openRoot.value
        clearTimer()
        pinned.value = false
        openRoot.value = null
        if (refocus && i !== null) Vue.nextTick(() => document.getElementById('mk-root-' + i)?.focus())
      }
      /* Hover opens the menu after 100 ms and leaving closes it, as on Košík.cz. A click "pins" it open (stays until
         click outside, the overlay, Esc or the trigger again); touch devices only use the click. */
      const pinned = Vue.ref(false)
      let timer = null
      let hoverOpenedAt = 0
      const clearTimer = () => { clearTimeout(timer); timer = null }
      const later = (fn, ms) => { clearTimer(); timer = setTimeout(fn, ms) }
      const isMouse = (e) => !e || !e.pointerType || e.pointerType === 'mouse'
      const hoverOpen = (i, e) => {
        if (!isMouse(e)) return
        clearTimer()
        if (openRoot.value === i) return
        const set = () => { openRoot.value = i; activeGroup.value = 0 }
        if (openRoot.value === null) later(() => { set(); hoverOpenedAt = Date.now() }, 250); else set()
      }
      const hoverLeave = (e) => { if (isMouse(e) && !pinned.value && openRoot.value !== null) later(() => closeMenu(false), 250) }
      const toggleRoot = (i, e) => {
        clearTimer()
        // as on Košík.cz: a click right after the hover opened it pins it, a later click closes it
        if (openRoot.value === i) { if (!pinned.value && Date.now() - hoverOpenedAt < 500) { pinned.value = true; return } return closeMenu(false) }
        openRoot.value = i
        activeGroup.value = 0
        pinned.value = true
        if (e && e.detail === 0) focusList() // opened from the keyboard
      }
      const rootDown = (i) => { clearTimer(); if (openRoot.value !== i) { openRoot.value = i; activeGroup.value = 0 } pinned.value = true; focusList() }
      const listKey = (e) => {
        const n = roots.value[openRoot.value].groups.length
        const move = { ArrowDown: 1, ArrowUp: -1 }[e.key]
        if (move) { e.preventDefault(); activeGroup.value = (activeGroup.value + move + n) % n; focusList() }
        else if (e.key === 'Home') { e.preventDefault(); activeGroup.value = 0; focusList() }
        else if (e.key === 'End') { e.preventDefault(); activeGroup.value = n - 1; focusList() }
        else if (e.key === 'ArrowRight') { e.preventDefault(); document.querySelector('.mk-mega-l2')?.focus() }
      }
      const go = (label) => { emit('navigate', { label }); closeMenu(false) }
      const hrefFor = (label) => (label === IMPLEMENTED && window.Makro ? window.Makro.categoryHash : '#')
      /* ---- popovers of the nav items "Nákupní seznamy" and "Poslední objednávky" ---- */
      const pop = Vue.ref(null)
      const popLeft = Vue.ref(0)
      const closePop = (refocus) => {
        const k = pop.value
        pop.value = null
        if (refocus && k) Vue.nextTick(() => document.getElementById('mk-pop-btn-' + k)?.focus())
      }
      const togglePop = (k, e) => {
        if (pop.value === k) return closePop(false)
        closeMenu(false)
        pop.value = k
        Vue.nextTick(() => {
          const btn = document.getElementById('mk-pop-btn-' + k), sub = subEl.value
          if (btn && sub) popLeft.value = Math.max(0, Math.round(btn.getBoundingClientRect().left - sub.getBoundingClientRect().left))
          if (e && e.detail === 0) document.querySelector('#mk-pop button, #mk-pop a')?.focus()
        })
      }
      Vue.watch(openRoot, (v) => v !== null && closePop(false))
      Vue.watch(() => props.cartOpen, (v) => v && closePop(false))
      const onDoc = (e) => {
        if (pop.value && !e.target.closest('#mk-pop, .mk-nav-item')) closePop(false)
        if (openRoot.value !== null && !e.target.closest('.mk-sub')) closeMenu(false)
      }
      const onKey = (e) => {
        if (e.key === 'Escape' && pop.value) { closePop(true); return }
        if (e.key !== 'Escape' || openRoot.value === null) return
        // Esc inside the right side goes back to the list first, a second Esc closes the menu
        if (document.activeElement && document.activeElement.closest('.mk-mega-body')) { focusList(); return }
        closeMenu(true)
      }
      const onHash = () => { closeMenu(false); closePop(false) }
      /* the overlay starts at the bottom edge of the navigation bar (it fades in below it, like Košík.cz) */
      const subEl = Vue.ref(null)
      const navBottom = Vue.ref(0)
      const measure = () => { if (subEl.value) navBottom.value = Math.max(0, Math.round(subEl.value.getBoundingClientRect().bottom)) }
      /* like Košík.cz: the page does not scroll while the menu is open (the scrollbar width is kept to avoid a layout jump) */
      const lockScroll = (on) => {
        const b = document.body
        if (on) { const sw = window.innerWidth - document.documentElement.clientWidth; b.style.overflow = 'hidden'; if (sw > 0) b.style.paddingRight = sw + 'px' }
        else { b.style.overflow = ''; b.style.paddingRight = '' }
      }
      Vue.watch(openRoot, (v) => { lockScroll(v !== null); if (v !== null) Vue.nextTick(measure) })
      Vue.onMounted(() => {
        window.addEventListener('scroll', measure, { passive: true })
        window.addEventListener('resize', measure)
        document.addEventListener('pointerdown', onDoc)
        document.addEventListener('keydown', onKey)
        window.addEventListener('hashchange', onHash)
      })
      Vue.onUnmounted(() => {
        window.removeEventListener('scroll', measure)
        window.removeEventListener('resize', measure)
        clearTimer()
        lockScroll(false)
        document.removeEventListener('pointerdown', onDoc)
        document.removeEventListener('keydown', onKey)
        window.removeEventListener('hashchange', onHash)
      })
      Vue.watch(() => props.cartOpen, (v) => v && closeMenu(false))

      /* ---- delivery address (selfcare/bridge.js: App.S.addressId is the single source of truth) and the address drawer ---- */
      const addr = Vue.computed(() => (window.App && window.App.S.addresses ? window.App.addrParts() : { name: '', line: props.deliveryAddress }))
      const addrFull = Vue.computed(() => (addr.value.name ? addr.value.name + ' · ' : '') + addr.value.line)
      const addrOpen = Vue.computed(() => (window.AddrDrawer ? window.AddrDrawer.isOpen() : false))

      /* ---- company profile button: the account menu is a Fresh island from the selfcare prototype (selfcare/js/acctmenu.js).
         The wrapper below is empty for Vue; the island placeholder inside it is created by hand, so Vue never patches the island's DOM. ---- */
      const coBox = Vue.ref(null)
      let closing = false
      const closeAccount = () => { const b = coBox.value && coBox.value.querySelector('.co-btn[aria-expanded="true"]'); if (b) { closing = true; b.click(); closing = false } }
      /* opening the account menu closes the other popovers (they close it the same way) */
      const onAccountClick = () => { if (closing) return; closeMenu(false); closePop(false); emit('account-open') }
      Vue.watch(openRoot, (v) => v !== null && closeAccount())
      Vue.watch(pop, (v) => v && closeAccount())
      Vue.watch(() => props.cartOpen, (v) => v && closeAccount())
      const mql = matchMedia('(max-width: 768px)')
      const onMq = () => window.AcctMenu && window.AcctMenu.sync()
      Vue.onMounted(() => {
        if (!window.AcctMenu || !coBox.value) return
        const slot = document.createElement('div')
        coBox.value.appendChild(slot)
        window.AcctMenu.sync()
        window.AcctMenu.attach(slot)
        mql.addEventListener('change', onMq)
      })
      Vue.onUnmounted(() => { mql.removeEventListener('change', onMq); if (window.AcctMenu) window.AcctMenu.detach() })

      return { addr, addrFull, addrOpen, coBox, onAccountClick, ICONS, term, submit, money, pop, popLeft, togglePop, closePop, roots, openRoot, activeGroup, group, subEl, navBottom, hoverOpen, hoverLeave, clearTimer, toggleRoot, rootDown, listKey, closeMenu, go, hrefFor, thumb: (n) => THUMBS[n], src: (name) => base() + 'assets/' + name }
    },
    template: `
      <header class="mk-header" :class="{ 'is-simple': simple }" data-tid="app-header">
        <div class="mk-top">
          <div class="mk-wrap mk-top-in">
            <a class="mk-logo" href="#/" aria-label="makro"><img :src="src('brand/makro-logo.svg')" alt="makro" width="129" height="32"></a>
            <button v-if="!simple" type="button" class="mk-addr hdr-addr" aria-haspopup="dialog" :aria-expanded="addrOpen" :title="addrFull" @click="$emit('address')">
              <span class="mk-addr-txt"><small>Vybraná dodací adresa</small><b><span v-if="addr.name" class="mk-addr-name">{{ addr.name }}</span><span class="mk-addr-line">{{ addr.line }}</span></b></span>
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
              <div class="mk-co sc" ref="coBox" @click.capture="onAccountClick"></div>
            </div>
          </div>
          <button v-if="!simple" type="button" class="mk-addr-bar deliv-bar" aria-haspopup="dialog" :aria-expanded="addrOpen" :title="addrFull" @click="$emit('address')">
            <span>Doručení: <b><span v-if="addr.name" class="mk-addr-name">{{ addr.name }}</span><span class="mk-addr-line">{{ addr.line }}</span></b></span>
            <img :src="src('icons/chevron-right.svg')" alt="" width="18" height="18">
          </button>
        </div>

        <div v-if="!simple" class="mk-sub" ref="subEl" :style="{ '--mk-nav-bottom': navBottom + 'px' }">
          <div class="mk-wrap mk-sub-in">
            <nav class="mk-nav" aria-label="Hlavní navigace">
              <button v-for="(r, i) in roots" :key="r.name" :id="'mk-root-' + i" type="button" class="mk-nav-item" :class="{ open: openRoot === i }" aria-controls="mk-mega" :aria-expanded="openRoot === i" @click="toggleRoot(i, $event)" @keydown.down.prevent="rootDown(i)" @pointerenter="hoverOpen(i, $event)" @pointerleave="hoverLeave($event)">
                <span>{{ r.name }}</span><component :is="ICONS.ChevronDownSolid" class="mk-chev tw-icon-ds-20"></component>
              </button>
              <button id="mk-pop-btn-lists" type="button" class="mk-nav-item" :class="{ 'pop-open': pop === 'lists' }" aria-haspopup="true" aria-controls="mk-pop" :aria-expanded="pop === 'lists'" @click="togglePop('lists', $event)"><img :src="src('icons/shopping-list.svg')" alt="" width="24" height="24"><span>Nákupní seznamy</span></button>
              <button id="mk-pop-btn-orders" type="button" class="mk-nav-item" :class="{ 'pop-open': pop === 'orders' }" aria-haspopup="true" aria-controls="mk-pop" :aria-expanded="pop === 'orders'" @click="togglePop('orders', $event)"><img :src="src('icons/orders.svg')" alt="" width="24" height="24"><span>Poslední objednávky</span></button>
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

          <div v-if="pop" class="mk-pop-backdrop" aria-hidden="true" @click="closePop(true)"></div>
          <div v-if="pop" id="mk-pop" class="mk-pop" role="region" :aria-label="pop === 'lists' ? 'Nákupní seznamy' : 'Poslední objednávky'" :style="{ left: popLeft + 'px' }">
            <button type="button" class="mk-pop-x" aria-label="Zavřít" @click="closePop(true)">✕</button>
            <slot v-if="pop === 'lists'" name="lists" :close="closePop"></slot>
            <slot v-else name="orders" :close="closePop"></slot>
          </div>
          <div v-if="group" class="mk-mega-backdrop" aria-hidden="true" @pointerenter="hoverLeave($event)" @click="closeMenu(false)"></div>
          <div v-if="group" id="mk-mega" class="mk-mega" :class="{ 'is-first': openRoot === 0 }" role="region" :aria-label="roots[openRoot].name" @pointerenter="clearTimer" @pointerleave="hoverLeave($event)">
            <button type="button" class="mk-mega-x" aria-label="Zavřít menu" @click="closeMenu(true)">✕</button>
            <div class="mk-wrap mk-mega-in">
              <ul class="mk-mega-list" aria-label="Kategorie" @keydown="listKey">
                <li v-for="(g, gi) in roots[openRoot].groups" :key="g.name">
                  <button :id="'mk-l1-' + gi" type="button" class="mk-mega-l1" :class="{ on: activeGroup === gi }" :aria-current="activeGroup === gi ? 'true' : undefined" @mouseenter="activeGroup = gi" @focus="activeGroup = gi" @click="go(g.name)">{{ g.name }}</button>
                </li>
              </ul>
              <div class="mk-mega-body">
                <a :href="hrefFor(group.name)" class="mk-mega-all" @click.prevent="go(group.name)">Vše z kategorie {{ group.name }} <span aria-hidden="true">→</span></a>
                <p v-if="!group.blocks.length" class="mk-mega-empty">Tato kategorie zatím nemá podkategorie.</p>
                <ul class="mk-mega-blocks">
                  <li v-for="b in group.blocks" :key="b.name" class="mk-mega-block">
                    <span class="mk-mega-thumb" :class="{ ph: !thumb(b.name) }" aria-hidden="true"><img v-if="thumb(b.name)" :src="thumb(b.name)" alt=""><b v-else>{{ b.name.charAt(0) }}</b></span>
                    <div class="mk-mega-txt">
                      <a :href="hrefFor(b.name)" class="mk-mega-l2" @click.prevent="go(b.name)">{{ b.name }}</a>
                      <ul v-if="b.kids.length">
                        <li v-for="k in b.kids.slice(0, 4)" :key="k"><a :href="hrefFor(k)" @click.prevent="go(k)">{{ k }}</a></li>
                        <li v-if="b.n > 4"><a :href="hrefFor(b.name)" class="mk-mega-more" @click.prevent="go(b.name)">+ Další<span class="mk-sr"> v kategorii {{ b.name }}</span></a></li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
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
