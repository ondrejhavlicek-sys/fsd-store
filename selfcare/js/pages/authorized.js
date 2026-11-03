/* copied from fsd-selfcare @ f2a58c7 (js/pages/authorized.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Oprávněná osoba: who may act for the company, how that was verified, and the supporting documents */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const STATUS = { verified: ['Ověřeno', 'green'], manual: ['Čeká na ruční kontrolu', 'neutral'], pending: ['Čeká na ověření', 'neutral'] };
  const TYPES = [{ value: 'statutory', label: 'Za firmu jednám samostatně' }, { value: 'poa', label: 'Jednám na základě plné moci' }];

  App.register('authorized', {
    label: 'Oprávněná osoba', icon: 'UserActiveOutline', admin: true,
    comp: {
      setup() {
        const a = computed(() => App.S.authz);
        const f = reactive({ open: false, type: 'statutory', person: '', position: '', err: {} });
        const up = reactive({ open: false, kind: 'Plná moc', file: '', err: '' });
        const kinds = ['Výpis z rejstříku', 'Plná moc', 'Doklad o podnikání', 'Jiný dokument'].map(x => ({ value: x, label: x }));
        const open = () => { const x = App.S.authz; Object.assign(f, { open: true, type: x.type, person: x.person, position: x.position, err: {} }); };
        const save = () => {
          f.err = {};
          if (!f.person.trim()) return f.err = { person: 'Zadejte jméno oprávněné osoby.' };
          const x = App.S.authz; x.type = f.type; x.person = f.person.trim(); x.position = f.position.trim();
          if (f.type === 'poa' && !x.docs.some(d => d.kind === 'Plná moc')) { x.status = 'pending'; toast('Nahrajte prosím plnou moc, abychom oprávnění ověřili.'); }
          else toast('Změny jsou uložené.');
          f.open = false;
        };
        const pick = e => { const file = e.target.files && e.target.files[0]; up.file = file ? file.name : ''; };
        const upload = () => {
          if (!up.file) return up.err = 'Vyberte soubor, který chcete nahrát.';
          App.S.authz.docs.push({ id: 'd' + Date.now(), name: up.file, kind: up.kind, date: '16. 10. 2026', status: 'pending' });
          up.open = false; up.file = ''; toast('Dokument je nahraný. Zkontrolujeme ho.');
        };
        const del = d => Acct.confirm({ title: 'Odebrat dokument?', text: d.name + ' zmizí z firemního účtu.', label: 'Odebrat', danger: true, onYes: () => { App.S.authz.docs = App.S.authz.docs.filter(x => x.id !== d.id); toast('Dokument je odebraný.'); } });
        const reverify = () => toast('Nové ověření není součástí prototypu.');
        return { App, I, t, a, f, up, STATUS, TYPES, kinds, open, save, pick, upload, del, reverify, list: computed(() => App.list(App.S.authz.docs)) };
      },
      template: `
        <page-state title="Oprávněná osoba">
          <template #default>
          <p class="muted lead">{{ t('Osoba oprávněná jednat za firmu zakládá firemní účet a odpovídá za objednávky. Jedná buď samostatně, nebo na základě plné moci.') }}</p>
          <section class="acct-card">
            <div class="rows"><h2>{{ t('Osoba oprávněná jednat za firmu') }}</h2>
              <dl class="kv"><dt>{{ t('Jméno') }}</dt><dd><b>{{ a.person }}</b></dd>
                <dt>{{ t('Postavení') }}</dt><dd>{{ a.type === 'statutory' ? t('Jedná samostatně') : t('Jedná na základě plné moci') }}<span v-if="a.position" class="muted"> · {{ a.position }}</span></dd></dl></div>
            <ds-icon-button variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t('oprávněnou osobu')" @click="open"></ds-icon-button>
          </section>
          <section class="acct-card">
            <div class="rows"><h2>{{ t('Ověření totožnosti') }} <later-tag label="Ověřit"></later-tag></h2>
              <dl class="kv"><dt>{{ t('Stav') }}</dt><dd><product-tag :variant="STATUS[a.status][1]" :label="t(STATUS[a.status][0])"></product-tag></dd>
                <dt>{{ t('Způsob ověření') }}</dt><dd>{{ a.method }}</dd>
                <dt>{{ t('Datum ověření') }}</dt><dd>{{ a.verifiedAt }}</dd></dl>
              <span class="note">{{ t('Způsob ověření ještě upřesňujeme. Může jít o Bank iD, nebo o ruční kontrolu dokladů.') }}</span></div>
            <ds-button variant="secondary" size="sm" @click="reverify">{{ t('Ověřit znovu') }}</ds-button>
          </section>
          <div class="head sub-head"><h2>{{ t('Dokumenty') }}</h2><ds-button size="sm" @click="up.open = true">{{ t('Nahrát dokument') }}</ds-button></div>
          <ds-table v-if="list.length" class="acct-tbl">
            <thead><tr><th>{{ t('Dokument') }}</th><th>{{ t('Druh') }}</th><th>{{ t('Datum') }}</th><th>{{ t('Stav') }}</th><th><span class="sr">{{ t('Akce') }}</span></th></tr></thead>
            <tbody><tr v-for="d in list" :key="d.id"><td :data-label="t('Dokument')"><b>{{ t(d.name) }}</b></td><td :data-label="t('Druh')">{{ t(d.kind) }}</td><td :data-label="t('Datum')">{{ d.date }}</td>
              <td :data-label="t('Stav')"><product-tag :variant="d.status === 'ok' ? 'green' : 'neutral'" :label="t(d.status === 'ok' ? 'Zkontrolováno' : 'Čeká na kontrolu')"></product-tag></td>
              <td class="acts-td"><ds-button variant="ghost" size="sm" class="acct-danger-text" @click="del(d)">{{ t('Odebrat') }}</ds-button></td></tr></tbody>
          </ds-table>
          <empty-state v-else title="Zatím tu nejsou žádné dokumenty" text="Nahrajte výpis z rejstříku nebo plnou moc, ať můžeme oprávnění ověřit."></empty-state>

          <form-modal v-model:open="f.open" title="Upravit oprávněnou osobu" @submit="save">
            <fieldset class="fset"><legend class="lbl-t">{{ t('Postavení') }}</legend>
              <ds-radio-group v-model="f.type" class="radios"><ds-inline-field-label v-for="o in TYPES" :key="o.value" class="acct-radio" :for="'ty-' + o.value"><ds-radio :id="'ty-' + o.value" :value="o.value"></ds-radio><template #label>{{ t(o.label) }}</template></ds-inline-field-label></ds-radio-group></fieldset>
            <field label="Jméno" req v-model="f.person" :error="f.err.person"></field>
            <field label="Funkce" v-model="f.position" placeholder="např. jednatel"></field>
            <ds-message v-if="f.type === 'poa'" variant="info" :title="t('Plná moc')" :body="t('Při jednání na základě plné moci potřebujeme její kopii. Nahrajte ji níže v sekci Dokumenty.')"></ds-message>
          </form-modal>
          <form-modal v-model:open="up.open" title="Nahrát dokument" submit-label="Nahrát" @submit="upload">
            <sel-field label="Druh dokumentu" v-model="up.kind" :options="kinds"></sel-field>
            <div class="fld2"><span class="lbl-t">{{ t('Soubor') }}</span>
              <label class="upslot" :class="{ on: up.file }"><input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="pick"><span>{{ up.file || t('Vyberte soubor (PDF, JPG nebo PNG)') }}</span></label>
              <ds-field-message v-if="up.err" role="alert" class="fld-err">{{ t(up.err) }}</ds-field-message></div>
          </form-modal>
          </template>
        </page-state>`
    }
  });
})();
