/* copied from fsd-selfcare @ f2a58c7 (js/addrdrawer.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Delivery address picker: a Fresh Drawer opened from the header ("Vybraná dodací adresa" / the mobile "Doručení" bar),
   modelled on the kosik.cz checkout drawer. Cards are radio items (Fresh RadioGroup/Radio), so arrow keys, Space and Enter work.
   Only active addresses the current user may buy for are listed (App.selectable()). Deactivated addresses are hidden.
   The "area" banner is an ILLUSTRATIVE MOCK (MockData.areas), not from a requirement. */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons;
  const t = s => { void App.S.lang; return I18N.t(s); };
  const state = reactive({ open: false, pending: null });
  let trigger = null;

  const AddrDrawer = {
    setup() {
      const list = computed(() => App.selectable());
      const cur = computed(() => App.currentAddress());
      const area = a => a.area && cur.value && a.area !== cur.value.area;
      const cartCount = () => App.cart.count();
      const apply = a => {
        App.S.addressId = a.id; state.pending = null; state.open = false; App.render(); UI.toast('Dodací adresa je změněná.');
      };
      const choose = id => {
        const a = list.value.find(x => x.id === id);
        if (!a || (cur.value && a.id === cur.value.id)) return;
        if (area(a) && cartCount() > 0) { state.pending = a; return; }   /* different delivery area + non-empty cart: ask first */
        apply(a);
      };
      const go = () => { state.open = false; };
      return { state, list, cur, area, choose, apply, go, t, I, App, MockData };
    },
    template: `
      <ds-drawer v-model:open="state.open" :title="t('Vyberte dodací adresu')" content-standout class="addr-drawer" @after-leave="state.pending = null">
        <div v-if="state.pending" class="ad-confirm">
          <ds-message variant="warning" :title="t('Změnit dodací adresu?')" :body="t('Změna adresy může změnit nabídku zboží a ceny. Zkontrolujte prosím obsah košíku.')"></ds-message>
          <p class="ad-confirm-addr"><b>{{ App.addrTitle(state.pending) }}</b><br>{{ App.addrLine(state.pending) }}</p>
          <div class="ad-confirm-btns"><ds-button size="lg" @click="apply(state.pending)">{{ t('Změnit adresu') }}</ds-button><ds-button size="lg" variant="ghost" @click="state.pending = null">{{ t('Ponechat stávající adresu') }}</ds-button></div>
        </div>
        <template v-else>
          <ds-radio-group v-if="list.length" :model-value="cur ? cur.id : ''" class="ad-list" :aria-label="t('Dodací adresy')" @update:model-value="choose">
            <label v-for="a in list" :key="a.id" class="ad-card" :class="{ on: cur && cur.id === a.id }" :for="'ads-' + a.id">
              <span v-if="area(a)" class="ad-area">{{ t('Oblast doručení s odlišnou nabídkou zboží') }}</span>
              <span class="ad-row">
                <span class="ad-pin" aria-hidden="true"><component :is="I.LocationPinSolid" class="ad-pin-ico"></component></span>
                <span class="ad-txt">
                  <span v-if="a.name" class="ad-name">{{ a.name }}</span>
                  <span v-if="a.contact" class="ad-contact">{{ a.contact }}</span>
                  <span class="ad-line">{{ App.addrLine(a) }}</span>
                  <span v-if="a.phone" class="ad-phone">{{ a.phone }}</span>
                  <product-tag v-if="a.main" variant="green" :label="t('Hlavní')" class="ad-main"></product-tag>
                </span>
                <ds-radio :id="'ads-' + a.id" :value="a.id" :aria-label="App.addrTitle(a) + ', ' + App.addrLine(a)"></ds-radio>
              </span>
            </label>
          </ds-radio-group>
          <div v-else class="ad-empty">
            <p>{{ t('Nemáte žádnou dodací adresu, pro kterou smíte nakupovat.') }}</p>
            <ds-button v-if="App.isAdmin()" as="a" href="#/ucet/addresses" @click="go">{{ t('Přidat dodací adresu') }}</ds-button>
            <p v-else class="muted">{{ t('Požádejte správce firmy, ať vám nějakou přidá.') }}</p>
          </div>
        </template>
        <template #actions>
          <ds-button v-if="App.isAdmin()" variant="secondary" size="lg" as="a" href="#/ucet/addresses" @click="go">{{ t('Spravovat dodací adresy') }}</ds-button>
        </template>
      </ds-drawer>`
  };

  const host = document.createElement('div');
  host.id = 'addr-drawer-host';
  host.setAttribute('data-no-i18n', '');
  let mounted = false;
  const mark = () => document.querySelectorAll('.hdr-addr, .deliv-bar').forEach(b => b.setAttribute('aria-expanded', String(state.open)));

  window.AddrDrawer = {
    isOpen: () => state.open,
    open() {
      if (!mounted) { mounted = true; document.body.appendChild(host); Fresh.mount(AddrDrawer, host); Vue.watch(() => state.open, o => { mark(); if (!o) refocus(); }); }
      trigger = matchMedia('(max-width: 768px)').matches ? '.deliv-bar' : '.hdr-addr';
      state.pending = null; state.open = true; mark();
    },
    close(silent) { if (state.open) { state.open = false; if (silent) trigger = null; } }
  };
  /* the header is re-rendered by App.render(), so return focus to the (new) trigger element */
  function refocus() { const sel = trigger; trigger = null; if (sel) setTimeout(() => { const b = document.querySelector(sel); if (b) b.focus(); }, 60); }
})();
