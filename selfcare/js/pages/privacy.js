/* copied from fsd-selfcare @ f2a58c7 (js/pages/privacy.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Souhlasy a soukromí (per user): GDPR consent, marketing consent + channels (also covers the newsletter), cookies */
(function () {
  const { reactive, computed } = Vue;
  const t = Acct.t, toast = UI.toast;
  const CHANNELS = { email: 'E-mail', phone: 'Telefon', whatsapp: 'WhatsApp', other: 'Jiný kanál' };
  const name = u => (u.first + ' ' + u.last).trim() || u.email;
  const TODAY = '16. 10. 2026';

  App.register('privacy', {
    label: 'Souhlasy a soukromí', icon: 'PadlockSolid',
    comp: {
      setup() {
        const me = computed(() => App.me());
        const users = computed(() => App.list(App.S.users.filter(u => u.status !== 'invited')));
        const cookies = reactive({ open: false, analytics: false, marketing: false });
        const setMarketing = on => {
          const m = App.me(); m.marketing.on = on; m.marketing.date = on ? TODAY : m.marketing.date;
          if (on && !m.marketing.channels.length) m.marketing.channels = ['email'];
          toast(on ? 'Marketingový souhlas je udělený.' : 'Marketingový souhlas je odvolaný.');
        };
        const setChannel = (k, on) => { const m = App.me(); m.marketing.channels = on ? m.marketing.channels.concat(k) : m.marketing.channels.filter(x => x !== k); if (!m.marketing.channels.length) { m.marketing.on = false; toast('Marketingový souhlas je odvolaný.'); } };
        const setStats = on => { App.me().gdpr.stats = on; toast(on ? 'Souhlas je udělený.' : 'Souhlas je odvolaný.'); };
        const openCookies = () => { Object.assign(cookies, { open: true }, App.S.agreements.cookies); };
        const saveCookies = () => { Object.assign(App.S.agreements.cookies, { analytics: cookies.analytics, marketing: cookies.marketing }); cookies.open = false; toast('Nastavení cookies je uložené.'); };
        const chanText = m => m.on ? m.channels.map(k => t(CHANNELS[k])).join(', ') : '—';
        return { App, t, me, users, cookies, CHANNELS, name, setMarketing, setChannel, setStats, openCookies, saveCookies, chanText };
      },
      template: `
        <page-state title="Souhlasy a soukromí">
          <p class="muted lead">{{ t('Tyto souhlasy platí jen pro vás. Každý kolega má své vlastní.') }}</p>

          <h2 class="sec-h first">{{ t('Zpracování osobních údajů') }}</h2>
          <section class="acct-card"><div class="rows">
            <span v-if="me.gdpr">{{ t('Váš souhlas jste udělili') }} {{ me.gdpr.date }} · {{ t('Zásady zpracování osobních údajů') }} {{ me.gdpr.version }}</span>
            <ds-inline-field-label class="acct-radio" for="g-req"><ds-switch id="g-req" :checked="true" disabled></ds-switch><template #label>{{ t('Zpracování nutné pro objednávky a doručení') }} <span class="muted">({{ t('nelze odvolat') }})</span></template></ds-inline-field-label>
            <ds-inline-field-label v-if="me.gdpr" class="acct-radio" for="g-stats"><ds-switch id="g-stats" :checked="me.gdpr.stats" @update:checked="setStats"></ds-switch><template #label>{{ t('Statistiky a zlepšování služby') }}</template></ds-inline-field-label>
          </div></section>

          <h2 class="sec-h">{{ t('Marketingový souhlas a novinky') }}</h2>
          <ds-message variant="info" class="mb" :title="t('Souhlas ukládáme za každého kolegu')" :body="t('Otevřená otázka: souhlas může být nakonec udělován za celou firmu. Zatím ho ukládáme zvlášť u každého kolegy.')">
            <template #header><later-tag label="Ověřit"></later-tag></template>
          </ds-message>
          <section class="acct-card"><div class="rows">
            <h2>{{ t('Váš souhlas') }}</h2>
            <ds-inline-field-label class="acct-radio" for="m-on"><ds-switch id="m-on" :checked="me.marketing.on" @update:checked="setMarketing"></ds-switch><template #label>{{ t('Chci dostávat nabídky a novinky makro') }}</template></ds-inline-field-label>
            <fieldset v-if="me.marketing.on" class="fset"><legend class="lbl-t">{{ t('Kanály') }}</legend>
              <ds-inline-field-label v-for="(label, k) in CHANNELS" :key="k" class="acct-radio" :for="'mc-' + k"><ds-checkbox :id="'mc-' + k" :checked="me.marketing.channels.includes(k)" @update:checked="setChannel(k, $event)"></ds-checkbox><template #label>{{ t(label) }}</template></ds-inline-field-label></fieldset>
            <span class="note">{{ t('Souhlas můžete kdykoli odvolat.') }}</span>
          </div></section>

          <h2 class="sec-h">{{ t('Cookies') }}</h2>
          <section class="acct-card"><div class="rows"><span class="muted">{{ t('Nastavení cookies platí jen pro vás.') }}</span></div>
            <ds-button variant="secondary" size="sm" @click="openCookies">{{ t('Nastavit cookies') }}</ds-button></section>

          <template v-if="App.isAdmin() && users.length">
            <h2 class="sec-h">{{ t('Souhlasy kolegů') }}</h2>
            <ds-table class="acct-tbl">
              <thead><tr><th>{{ t('Kolega') }}</th><th>{{ t('Marketingový souhlas') }}</th><th>{{ t('Kanály') }}</th><th>{{ t('Souhlas se zpracováním údajů') }}</th></tr></thead>
              <tbody><tr v-for="u in users" :key="u.id"><td :data-label="t('Kolega')">{{ name(u) }}</td>
                <td :data-label="t('Marketingový souhlas')"><product-tag :variant="u.marketing.on ? 'green' : 'neutral'" :label="t(u.marketing.on ? 'Udělen' : 'Neudělen')"></product-tag><span v-if="u.marketing.date" class="cell-sub">{{ u.marketing.date }}</span></td>
                <td :data-label="t('Kanály')">{{ chanText(u.marketing) }}</td>
                <td :data-label="t('Souhlas se zpracováním údajů')">{{ u.gdpr ? u.gdpr.date + ' · ' + u.gdpr.version : '—' }}</td></tr></tbody>
            </ds-table>
          </template>

          <form-modal v-model:open="cookies.open" title="Nastavení cookies" submit-label="Uložit" @submit="saveCookies">
            <ds-inline-field-label class="acct-radio" for="c-n"><ds-switch id="c-n" :checked="true" disabled></ds-switch><template #label>{{ t('Nezbytné cookies') }} <span class="muted">({{ t('nelze vypnout') }})</span></template></ds-inline-field-label>
            <ds-inline-field-label class="acct-radio" for="c-a"><ds-switch id="c-a" :checked="cookies.analytics" @update:checked="cookies.analytics = $event"></ds-switch><template #label>{{ t('Analytické cookies') }}</template></ds-inline-field-label>
            <ds-inline-field-label class="acct-radio" for="c-m"><ds-switch id="c-m" :checked="cookies.marketing" @update:checked="cookies.marketing = $event"></ds-switch><template #label>{{ t('Marketingové cookies') }}</template></ds-inline-field-label>
          </form-modal>
        </page-state>`
    }
  });
})();
