/* copied from fsd-selfcare @ f2a58c7 (js/pages/security.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Přihlášení a zabezpečení (per user): login e-mail + verification, password change/reset, SSO identities (later) */
(function () {
  const { reactive, computed } = Vue;
  const t = Acct.t, toast = UI.toast;

  App.register('security', {
    label: 'Přihlášení a zabezpečení', icon: 'Shield',
    comp: {
      setup() {
        const me = computed(() => App.me());
        const f = reactive({ open: false, cur: '', next: '', again: '', err: {} });
        const open = () => Object.assign(f, { open: true, cur: '', next: '', again: '', err: {} });
        const submit = () => {
          f.err = {};
          if (!f.cur) return f.err = { cur: 'Zadejte své stávající heslo.' };
          if (f.next.length < 8) return f.err = { next: 'Heslo musí mít alespoň 8 znaků.' };
          if (f.next !== f.again) return f.err = { again: 'Hesla se neshodují.' };
          App.me().passwordChanged = '16. 10. 2026'; f.open = false; toast('Heslo je změněné.');
        };
        const reset = () => toast('Poslali jsme vám e-mail s odkazem pro obnovení hesla.');
        const verify = () => { App.me().emailVerified = true; toast('E-mail je ověřený.'); };
        const sso = (k, on) => { App.me().sso[k] = on; toast(on ? 'Účet je propojený.' : 'Propojení je zrušené.'); };
        return { App, t, me, f, open, submit, reset, verify, sso, PROVIDERS: { google: 'Google', microsoft: 'Microsoft' } };
      },
      template: `
        <page-state title="Přihlášení a zabezpečení">
          <section class="acct-card">
            <div class="rows"><h2>{{ t('Přihlašovací e-mail') }}</h2><span><b>{{ me.email }}</b></span>
              <span><product-tag :variant="me.emailVerified ? 'green' : 'neutral'" :label="t(me.emailVerified ? 'E-mail je ověřený' : 'E-mail není ověřený')"></product-tag></span>
              <span class="muted src">{{ t('Ověření probíhá jednorázovým odkazem v e-mailu. Do ověření nejde objednávat.') }}</span></div>
            <ds-button v-if="!me.emailVerified" variant="secondary" size="sm" @click="verify">{{ t('Ověřit e-mail') }}</ds-button>
          </section>

          <section class="acct-card">
            <div class="rows"><h2>{{ t('Heslo') }}</h2>
              <span class="muted">{{ me.passwordChanged ? t('Naposledy změněno') + ' ' + me.passwordChanged : t('Heslo jste zatím nenastavili.') }}</span>
              <div class="acts"><ds-button variant="secondary" size="sm" @click="open">{{ t('Změnit heslo') }}</ds-button><ds-button variant="ghost" size="sm" @click="reset">{{ t('Obnovit heslo e-mailem') }}</ds-button></div></div>
          </section>

          <section class="acct-card"><div class="rows"><h2>{{ t('Přihlášení přes jiný účet') }} <later-tag></later-tag></h2>
            <ds-inline-field-label v-for="(label, k) in PROVIDERS" :key="k" class="acct-radio" :for="'sso-' + k"><ds-switch :id="'sso-' + k" :checked="me.sso[k]" @update:checked="sso(k, $event)"></ds-switch><template #label>{{ label }} <span class="muted">({{ t(me.sso[k] ? 'propojeno' : 'nepropojeno') }})</span></template></ds-inline-field-label>
            <span class="muted src">{{ t('Přihlášení přes Google nebo Microsoft je ukázka. Zatím nefunguje.') }}</span></div></section>

          <form-modal v-model:open="f.open" title="Změnit heslo" submit-label="Změnit heslo" @submit="submit">
            <field label="Stávající heslo" type="password" req v-model="f.cur" :error="f.err.cur"></field>
            <field label="Nové heslo" type="password" req v-model="f.next" :error="f.err.next" hint="Alespoň 8 znaků."></field>
            <field label="Nové heslo znovu" type="password" req v-model="f.again" :error="f.err.again"></field>
          </form-modal>
        </page-state>`
    }
  });
})();
