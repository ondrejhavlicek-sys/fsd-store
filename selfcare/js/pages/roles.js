/* copied from fsd-selfcare @ f2a58c7 (js/pages/roles.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Role a oprávnění: read-only matrix for the four roles (one role per user, per company) */
(function () {
  const t = Acct.t;

  App.register('roles', {
    label: 'Role a oprávnění', icon: 'Shield', admin: true,
    comp: {
      setup() {
        const R = MockData.roles, cols = ['owner', 'admin', 'buyer', 'viewer'];
        /* [permission, owner, admin, buyer, viewer, later?] */
        const rows = [
          ['Nakupovat pro firmu', 'Všechny dodací adresy', 'Všechny dodací adresy', 'Přiřazené dodací adresy', '—'],
          ['Prohlížet objednávky', '✓', '✓', '✓', '✓'],
          ['Upravovat firemní informace', '✓', '✓', '—', '—'],
          ['Upravovat oprávněnou osobu', '✓', '—', '—', '—'],
          ['Přidávat a spravovat kolegy', '✓', '✓', '—', '—'],
          ['Přidělit roli Vlastník nebo ji změnit', '✓', '—', '—', '—'],
          ['Spravovat dodací adresy', '✓', '✓', '—', '—'],
          ['Kupovat firemní kredity', '✓', '✓', '—', '—'],
          ['Spravovat platby a fakturaci', '✓', '✓', '—', '—'],
          ['Prohlížet obchodní podmínky', '✓', '✓', '✓', '—'],
          ['Spravovat vlastní souhlasy a cookies', '✓', '✓', '✓', '✓'],
          ['Nastavit limit objednávky nákupčímu', '✓', '✓', '—', '—', true],
          ['Schvalovat objednávky nad limit', '✓', '✓', '—', '—', true],
          ['Objednávat nad svůj limit', '—', '—', 'Jen po schválení', '—', true],
          ['Zkopírovat přístup z jiné adresy', '✓', '✓', '—', '—', true]
        ];
        return { t, R, cols, rows };
      },
      template: `
        <page-state title="Role a oprávnění">
          <p class="muted lead">{{ t('Každý kolega má právě jednu roli pro celou firmu. Role se nastavuje u kolegy v sekci Uživatelé. U nákupčího navíc určíte dodací adresy, pro které smí nakupovat.') }}</p>
          <div class="acct-grid mb"><section v-for="k in cols" :key="k" class="acct-card"><div class="rows"><h2>{{ t(R[k].label) }}</h2><span class="muted">{{ t(R[k].desc) }}</span></div></section></div>
          <ds-table class="acct-tbl">
            <thead><tr><th>{{ t('Oprávnění') }}</th><th v-for="k in cols" :key="k">{{ t(R[k].label) }}</th></tr></thead>
            <tbody><tr v-for="r in rows" :key="r[0]"><td :data-label="t('Oprávnění')"><b>{{ t(r[0]) }}</b> <later-tag v-if="r[5]"></later-tag></td>
              <td v-for="(k, i) in cols" :key="k" :data-label="t(R[k].label)">{{ t(r[i + 1]) }}</td></tr></tbody>
          </ds-table>
        </page-state>`
    }
  });
})();
