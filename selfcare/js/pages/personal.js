/* copied from fsd-selfcare @ f2a58c7 (js/pages/personal.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Osobní údaje (per user): name, phone, preferred language (synced with the language switch), display toggles */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const phoneOk = v => !v || /^\+?[\d\s]{9,16}$/.test(v);
  const LANGS = [{ value: 'cs', label: 'Čeština' }, { value: 'en', label: 'English' }, { value: 'vi', label: 'Tiếng Việt' }];
  const VAT = [{ value: 'excl', label: 'Ceny bez DPH' }, { value: 'incl', label: 'Ceny s DPH' }];
  const PACK = [{ value: 'piece', label: 'Za kus' }, { value: 'pack', label: 'Za balení' }];
  const UNIT = [{ value: 'kg', label: 'Za kg' }, { value: 'piece', label: 'Za kus' }];

  App.register('personal', {
    label: 'Osobní údaje', icon: 'UserOutline',
    comp: {
      setup() {
        const me = computed(() => App.me());
        const f = reactive({ open: false, first: '', last: '', phone: '', err: {} });
        const open = () => { const u = App.me(); Object.assign(f, { open: true, err: {}, first: u.first, last: u.last, phone: u.phone }); };
        const submit = () => {
          f.err = {};
          if (!f.first.trim() || !f.last.trim()) return f.err = { first: 'Zadejte jméno i příjmení.' };
          if (!phoneOk(f.phone)) return f.err = { phone: 'Zadejte telefon ve tvaru +420 777 000 111.' };
          const u = App.me(); u.first = f.first.trim(); u.last = f.last.trim(); u.phone = f.phone.trim(); f.open = false; toast('Změny jsou uložené.');
        };
        const setLang = l => { App.S.lang = l; I18N.set(l); App.render(); };
        const setDisp = (k, v) => { App.me().display[k] = v; toast('Nastavení je uložené.'); };
        return { App, I, t, me, f, MockData, LANGS, VAT, PACK, UNIT, open, submit, setLang, setDisp };
      },
      template: `
        <page-state title="Osobní údaje">
          <section class="acct-card">
            <div class="rows"><h2>{{ t('Jméno a kontakt') }}</h2>
              <dl class="kv"><dt>{{ t('Jméno') }}</dt><dd><b>{{ me.first }} {{ me.last }}</b></dd><dt>{{ t('Telefon') }}</dt><dd>{{ me.phone || '—' }}</dd><dt>{{ t('Přihlašovací e-mail') }}</dt><dd>{{ me.email }}</dd><dt>{{ t('Role') }}</dt><dd>{{ t(MockData.roles[me.role].label) }}</dd></dl>
              <span class="muted src">{{ t('Roli a přístup k dodacím adresám nastavuje správce firmy.') }}</span></div>
            <ds-icon-button variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t('osobní údaje')" @click="open"></ds-icon-button>
          </section>

          <section class="acct-card"><div class="rows"><h2>{{ t('Jazyk') }}</h2>
            <sel-field label="Preferovaný jazyk" :model-value="App.S.lang" :options="LANGS" @update:model-value="setLang"></sel-field>
            <span class="muted src">{{ t('Jazyk se změní v celém obchodě i ve firemním účtu.') }}</span></div></section>

          <section class="acct-card"><div class="rows"><h2>{{ t('Zobrazení cen a jednotek') }} <later-tag></later-tag></h2>
            <fieldset class="fset"><legend class="lbl-t">{{ t('Ceny') }}</legend>
              <ds-radio-group :model-value="me.display.vat" class="radios" @update:model-value="setDisp('vat', $event)"><ds-inline-field-label v-for="o in VAT" :key="o.value" class="acct-radio" :for="'dv-' + o.value"><ds-radio :id="'dv-' + o.value" :value="o.value"></ds-radio><template #label>{{ t(o.label) }}</template></ds-inline-field-label></ds-radio-group></fieldset>
            <fieldset class="fset"><legend class="lbl-t">{{ t('Cena produktu') }}</legend>
              <ds-radio-group :model-value="me.display.pack" class="radios" @update:model-value="setDisp('pack', $event)"><ds-inline-field-label v-for="o in PACK" :key="o.value" class="acct-radio" :for="'dp-' + o.value"><ds-radio :id="'dp-' + o.value" :value="o.value"></ds-radio><template #label>{{ t(o.label) }}</template></ds-inline-field-label></ds-radio-group></fieldset>
            <fieldset class="fset"><legend class="lbl-t">{{ t('Cena za kg nebo kus') }}</legend>
              <ds-radio-group :model-value="me.display.unit" class="radios" @update:model-value="setDisp('unit', $event)"><ds-inline-field-label v-for="o in UNIT" :key="o.value" class="acct-radio" :for="'du-' + o.value"><ds-radio :id="'du-' + o.value" :value="o.value"></ds-radio><template #label>{{ t(o.label) }}</template></ds-inline-field-label></ds-radio-group></fieldset>
            <span class="muted src">{{ t('Zatím jen ukázka nastavení. Zobrazení v obchodě se podle něj nemění.') }}</span></div></section>

          <form-modal v-model:open="f.open" title="Osobní údaje" @submit="submit">
            <div class="row2"><field label="Jméno" req v-model="f.first" :error="f.err.first"></field><field label="Příjmení" req v-model="f.last"></field></div>
            <field label="Telefon" type="tel" v-model="f.phone" placeholder="+420 777 000 111" :error="f.err.phone"></field>
          </form-modal>
        </page-state>`
    }
  });
})();
