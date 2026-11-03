/* copied from fsd-selfcare @ f2a58c7 (js/acctmenu.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Header account menu built from a Fresh Popover (Vue island, persistent across App.render()).
   Order follows the makro.cz account menu: title, company row (highlighted), company links, two action rows,
   user row, user links, sign out. The trigger keeps the existing light-blue company button. */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons;
  const t = s => { void App.S.lang; return I18N.t(s); };
  const state = reactive({ mobile: false });
  const COMPANY_LINKS = ['company', 'addresses', 'users', 'payments', 'contracts'];
  const USER_LINKS = ['personal', 'security', 'privacy', 'notifications'];

  const AcctMenu = {
    setup() {
      const c = computed(() => App.S.company), me = computed(() => App.me());
      const open = ids => ids.filter(id => App.pages[id] && !Acct.isLocked(App.pages[id]));
      const links = computed(() => ({ company: open(COMPANY_LINKS), user: open(USER_LINKS) }));
      const soon = msg => UI.toast(msg);
      const hub = () => { location.hash = '#/ucet'; };
      const out = () => UI.toast('Odhlášení není součástí prototypu.');
      return { t, c, me, links, App, I, soon, hub, out, state, MockData, initials: Acct.initials, fullName: Acct.fullName };
    },
    template: `
      <ds-popover v-if="!state.mobile" align="end" side="bottom" :side-offset="8" class="am-popover">
        <template #trigger>
          <button type="button" class="co-btn" :aria-label="t('Firemní účet') + ': ' + c.name"><img class="ico-building" src="assets/icons/building-outline.svg" width="24" height="24" alt="" aria-hidden="true"><span>{{ c.name }}</span><img class="chev" src="assets/icons/shop/chevron-down.svg" alt="" aria-hidden="true"></button>
        </template>
        <template #default="{ close }">
          <div class="am">
            <div class="am-title">{{ t('Uživatelský účet') }}</div>
            <a class="am-co" href="#/ucet/company" @click="close()"><img src="assets/icons/building-outline.svg" width="24" height="24" alt="" aria-hidden="true"><span><b>{{ c.name }}</b><small>{{ t('IČO') }} {{ c.ico }} · {{ t(MockData.roles[App.S.role].label) }}</small></span></a>
            <nav class="am-links" :aria-label="t('Firemní profil')"><a v-for="id in links.company" :key="id" :href="'#/ucet/' + id" @click="close()">{{ t(App.pages[id].label) }}</a></nav>
            <button type="button" class="am-act" @click="soon('Přidání dalšího podnikání není součástí prototypu.'); close()"><component :is="I.BuildingOutline" class="am-ico"></component>{{ t('Přidat další podnikání') }}</button>
            <button type="button" class="am-act" @click="soon('Přidání makro karty není součástí prototypu.'); close()"><component :is="I.CreditCardPlus" class="am-ico"></component>{{ t('Přidat makro kartu') }}</button>
            <div class="am-user"><span class="avatar" aria-hidden="true">{{ initials(me) }}</span><b>{{ fullName(me) }}</b></div>
            <nav class="am-links" :aria-label="t('Uživatelský účet')"><a v-for="id in links.user" :key="id" :href="'#/ucet/' + id" @click="close()">{{ t(App.pages[id].label) }}</a>
              <a href="tel:+420271005005" @click="close()">{{ t('Zákaznická podpora') }}</a></nav>
            <button type="button" class="am-out" @click="out(); close()"><svg class="am-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/></svg>{{ t('Odhlásit se') }}</button>
          </div>
        </template>
      </ds-popover>
      <button v-else type="button" class="co-btn" :aria-label="t('Firemní účet') + ': ' + c.name" @click="hub"><img class="ico-building" src="assets/icons/building-outline.svg" width="24" height="24" alt="" aria-hidden="true"><span>{{ c.name }}</span><img class="chev" src="assets/icons/shop/chevron-down.svg" alt="" aria-hidden="true"></button>`
  };

  const host = document.createElement('div');
  host.id = 'acct-menu-host';
  host.setAttribute('data-no-i18n', '');
  host.style.display = 'contents';
  let mounted = false;

  window.AcctMenu = {
    sync() { state.mobile = matchMedia('(max-width: 768px)').matches; },
    detach() { if (host.parentNode) host.remove(); },
    attach(slot) {
      if (!slot) return;
      slot.replaceWith(host);
      if (!mounted) { mounted = true; Fresh.mount(AcctMenu, host); }
    }
  };
})();
