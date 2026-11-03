/* Content of the navigation-bar popovers: "Nákupní seznamy" and "Poslední objednávky".
   They hold what the homepage cards "Moje seznamy" and "Poslední objednávka" show (those cards stay available in the
   alternative homepage layout, #/?variant=cards). Placed into <makro-header>'s "lists" and "orders" slots by index.html.
   Styles: css/chrome.css (.mk-np-*). */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''
  const soon = (what) => Makro.toast(what + ' zatím není součástí prototypu.')

  Makro.ListsPop = {
    emits: ['close'],
    setup(props, { emit }) {
      return { lists: Makro.home.lists, soon: (w) => { emit('close'); soon(w) }, src: (n) => base() + 'assets/' + n }
    },
    template: `
      <div class="mk-np">
        <div class="mk-np-head"><b>Nákupní seznamy</b><a href="#" class="mk-more" @click.prevent="soon('Přehled seznamů')">Zobrazit vše</a></div>
        <ul class="mk-np-grid">
          <li><button type="button" class="mk-np-new" @click="soon('Nový seznam')"><span>Nový seznam</span><b aria-hidden="true">+</b></button></li>
          <li v-for="l in lists" :key="l.id"><button type="button" class="mk-np-list" @click="soon('Seznam ' + l.name)"><img :src="src('icons/shopping-list.svg')" alt="" width="24" height="24"><b>{{ l.name }}</b><span>Položky: {{ l.count }}</span></button></li>
        </ul>
      </div>`,
  }

  Makro.OrdersPop = {
    emits: ['close'],
    setup(props, { emit }) {
      const orders = Vue.computed(() => Makro.recentOrders())
      const again = (o) => {
        const n = Makro.reorder(o)
        emit('close')
        Makro.toast('Do košíku jsme přidali ' + n + ' ' + Makro.plural(n, 'položku', 'položky', 'položek') + ' z objednávky ' + o.no + '.')
      }
      return { orders, again, plural: Makro.plural, kc: Makro.kc, soon: (w) => { emit('close'); soon(w) } }
    },
    template: `
      <div class="mk-np">
        <div class="mk-np-head"><b>Poslední objednávky</b><a href="#" class="mk-more" @click.prevent="soon('Přehled objednávek')">Zobrazit vše</a></div>
        <ul class="mk-np-orders">
          <li v-for="(o, i) in orders" :key="o.no" class="mk-np-order">
            <div class="mk-np-order-top"><b>{{ o.no }}</b><span class="mk-chip-ok" :class="{ wait: o.status === 'Čeká na schválení' }">{{ o.status }}</span></div>
            <div class="mk-np-order-meta"><span>{{ o.date }}</span><span>{{ o.lines.length }} {{ plural(o.lines.length, 'položka', 'položky', 'položek') }}</span><b>{{ kc(o.net) }}</b><small>bez DPH</small></div>
            <div class="mk-np-order-act">
              <button type="button" class="mk-np-btn" @click="soon('Detail objednávky')">Detail</button>
              <button type="button" class="mk-np-btn primary" @click="again(o)">Znovu objednat</button>
            </div>
          </li>
        </ul>
      </div>`,
  }
})()
