/* copied from fsd-selfcare @ f2a58c7 (js/pages/terms.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Obchodní podmínky: contracted prices, assortment rules, discount segment, contracted alternatives. Read-only, set by makro staff. */
(function () {
  const t = Acct.t;

  App.register('terms', {
    label: 'Obchodní podmínky', icon: 'ShoppingBagsSolid', roles: ['owner', 'admin', 'buyer'],
    comp: {
      setup() { return { t, st: Vue.computed(() => App.S.staff) }; },
      template: `
        <page-state title="Obchodní podmínky">
          <p class="muted lead">{{ t('Zde vidíte, co jste si s makro dohodli. Podmínky nastavuje makro. Pokud je potřeba je změnit, pošlete žádost obchodnímu zástupci.') }}</p>
          <staff-card title="Smluvní ceny" topic="Smluvní ceny">
            <dl class="kv"><dt>{{ t('Typ cen') }}</dt><dd>{{ t(st.priceMode) }}</dd>
              <dt>{{ t('Produkty se smluvní cenou') }}</dt><dd>{{ st.pricedItems }}</dd>
              <dt>{{ t('Značka v obchodě') }}</dt><dd><product-tag variant="neutral" :label="t('Vaše cena')"></product-tag></dd></dl>
            <span class="note">{{ t('Smluvní ceny zatím vedeme jako cenové úrovně, ne jako individuální cenu u každého produktu.') }} <later-tag label="Ověřit"></later-tag></span>
          </staff-card>
          <staff-card title="Pravidla sortimentu" topic="Pravidla sortimentu">
            <dl class="kv"><dt>{{ t('Režim') }}</dt><dd>{{ t(st.assortment) }}</dd><dt>{{ t('Povolené skupiny') }}</dt><dd><div class="tags"><product-tag v-for="g in st.assortmentGroups" :key="g" variant="neutral" :label="t(g)"></product-tag></div></dd></dl>
          </staff-card>
          <staff-card title="Slevový segment" topic="Slevový segment">
            <dl class="kv"><dt>{{ t('Segment') }}</dt><dd>{{ t(st.segmentDiscount) }}</dd></dl>
          </staff-card>
          <staff-card title="Smluvní náhrady" topic="Smluvní náhrady">
            <ds-table class="acct-tbl">
              <thead><tr><th>{{ t('Když zboží není skladem') }}</th><th>{{ t('Nabídneme') }}</th></tr></thead>
              <tbody><tr v-for="a in st.alternatives" :key="a.item"><td :data-label="t('Když zboží není skladem')">{{ t(a.item) }}</td><td :data-label="t('Nabídneme')">{{ t(a.alt) }}</td></tr></tbody>
            </ds-table>
          </staff-card>
          <p class="muted">{{ t('Máte dotaz? Napište obchodnímu zástupci:') }} <a :href="'mailto:' + st.rep.email">{{ st.rep.name }}, {{ st.rep.email }}</a></p>
        </page-state>`
    }
  });
})();
