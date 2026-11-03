/* copied from fsd-selfcare @ f2a58c7 (js/pages/contracts.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Smlouvy a doklady (company level): T&C acceptance history + pending version, business-proof documents */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const name = u => (u.first + ' ' + u.last).trim() || u.email;
  const TODAY = '16. 10. 2026';

  App.register('contracts', {
    label: 'Smlouvy a doklady', icon: 'ListSolid',
    comp: {
      setup() {
        const ag = computed(() => App.S.agreements);
        const up = reactive({ open: false, file: '', err: '' });
        const acceptTerms = () => {
          const a = App.S.agreements, m = App.me();
          a.terms.unshift({ version: a.pendingTerms.version, country: 'CZ', lang: 'Čeština', date: TODAY, user: name(m) }); a.pendingTerms = null; toast('Nové obchodní podmínky jste přijali.');
        };
        const pick = e => { const file = e.target.files && e.target.files[0]; up.file = file ? file.name : ''; };
        const upload = () => {
          if (!up.file) return up.err = 'Vyberte soubor, který chcete nahrát.';
          if (App.S.agreements.proofDocs.length >= App.S.agreements.proofMax) return up.err = 'Dosáhli jste nejvyššího počtu dokladů.';
          App.S.agreements.proofDocs.push({ id: 'p' + Date.now(), name: up.file, date: TODAY }); up.open = false; up.file = ''; toast('Doklad je nahraný.');
        };
        const delDoc = d => {
          if (App.S.agreements.proofDocs.length <= App.S.agreements.proofMin) return Acct.confirm({ title: 'Doklad nelze odebrat', text: 'Potřebujeme alespoň jeden doklad o podnikání. Nejdřív nahrajte nový.', cancel: 'Rozumím' });
          Acct.confirm({ title: 'Odebrat doklad?', text: d.name + ' zmizí z firemního účtu.', label: 'Odebrat', danger: true, onYes: () => { App.S.agreements.proofDocs = App.S.agreements.proofDocs.filter(x => x.id !== d.id); toast('Doklad je odebraný.'); } });
        };
        return { App, I, t, ag, up, acceptTerms, pick, upload, delDoc };
      },
      template: `
        <page-state title="Smlouvy a doklady">
          <ds-message v-if="ag.pendingTerms" variant="warning" class="mb" :title="t('Nová verze obchodních podmínek')" :body="t('Od ' + ag.pendingTerms.date + ' platí obchodní podmínky ve verzi ' + ag.pendingTerms.version + '. Potvrďte, že s nimi souhlasíte.')">
            <template #action><ds-button size="sm" @click="acceptTerms">{{ t('Přijmout') }}</ds-button></template>
          </ds-message>

          <h2 class="sec-h first">{{ t('Obchodní podmínky') }}</h2>
          <p class="muted lead2">{{ t('Evidujeme, kdy a kdo odsouhlasil kterou verzi podmínek. Podmínky jsou pro každou zemi a jazyk zvlášť.') }} <later-tag label="Ověřit"></later-tag></p>
          <ds-table class="acct-tbl">
            <thead><tr><th>{{ t('Verze') }}</th><th>{{ t('Jazyk') }}</th><th>{{ t('Země') }}</th><th>{{ t('Datum') }}</th><th>{{ t('Přijal(a)') }}</th></tr></thead>
            <tbody><tr v-for="x in ag.terms" :key="x.version"><td :data-label="t('Verze')"><b>{{ x.version }}</b></td><td :data-label="t('Jazyk')">{{ t(x.lang) }}</td><td :data-label="t('Země')">{{ t('Česko') }}</td><td :data-label="t('Datum')">{{ x.date }}</td><td :data-label="t('Přijal(a)')">{{ x.user }}</td></tr></tbody>
          </ds-table>

          <h2 class="sec-h">{{ t('Doklady o podnikání') }}</h2>
          <p class="muted lead2">{{ t('Pro Česko evidujeme 1–3 doklady o podnikání.') }}</p>
          <ds-table v-if="ag.proofDocs.length" class="acct-tbl">
            <thead><tr><th>{{ t('Dokument') }}</th><th>{{ t('Datum') }}</th><th><span class="sr">{{ t('Akce') }}</span></th></tr></thead>
            <tbody><tr v-for="d in ag.proofDocs" :key="d.id"><td :data-label="t('Dokument')"><b>{{ t(d.name) }}</b></td><td :data-label="t('Datum')">{{ d.date }}</td>
              <td class="acts-td"><ds-button v-if="App.isAdmin()" variant="ghost" size="sm" class="acct-danger-text" @click="delDoc(d)">{{ t('Odebrat') }}</ds-button></td></tr></tbody>
          </ds-table>
          <div v-if="App.isAdmin()" class="mb-btn"><ds-button size="sm" variant="secondary" @click="up.open = true">{{ t('Nahrát doklad') }}</ds-button></div>

          <form-modal v-model:open="up.open" title="Nahrát doklad" submit-label="Nahrát" @submit="upload">
            <div class="fld2"><span class="lbl-t">{{ t('Soubor') }}</span>
              <label class="upslot" :class="{ on: up.file }"><input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="pick"><span>{{ up.file || t('Vyberte soubor (PDF, JPG nebo PNG)') }}</span></label>
              <ds-field-message v-if="up.err" role="alert" class="fld-err">{{ t(up.err) }}</ds-field-message></div>
          </form-modal>
        </page-state>`
    }
  });
})();
