/* copied from fsd-selfcare @ f2a58c7 (js/pages/orders.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Nákupy (orders), Kredity, and the light kosik.cz pages: Přehled úspor, Moje oblíbené, Oznámení, Odběr novinek */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const kc = n => n.toLocaleString('cs-CZ').replace(/\s/g, ' ') + ' Kč';

  App.register('orders', {
    label: 'Objednávky', icon: 'ShoppingBagSolid',
    comp: {
      setup() { return { App, t, kc, list: computed(() => App.list(App.S.orders)) }; },
      template: `
        <page-state title="Objednávky">
          <ds-message variant="info" class="mb" :title="t('Zástupný přehled')" :body="t('Historie objednávek je v této verzi prototypu jen ukázka.')"></ds-message>
          <ds-table v-if="list.length" class="acct-tbl">
            <thead><tr><th>{{ t('Číslo') }}</th><th>{{ t('Datum') }}</th><th>{{ t('Dodací adresa') }}</th><th>{{ t('Částka') }}</th><th>{{ t('Stav') }}</th></tr></thead>
            <tbody><tr v-for="o in list" :key="o.id"><td :data-label="t('Číslo')"><b>{{ o.id }}</b></td><td :data-label="t('Datum')">{{ o.date }}</td><td :data-label="t('Dodací adresa')">{{ App.addressName(o.address) }}</td>
              <td :data-label="t('Částka')">{{ kc(o.total) }}</td><td :data-label="t('Stav')"><product-tag :variant="o.status === 'Doručeno' ? 'green' : 'neutral'" :label="t(o.status)"></product-tag></td></tr></tbody>
          </ds-table>
          <empty-state v-else title="Zatím tu nemáte žádnou objednávku" text="Až nakoupíte, uvidíte tady přehled svých objednávek."></empty-state>
        </page-state>`
    }
  });

  App.register('credits', {
    label: 'Kredity', icon: 'Credits',
    comp: {
      setup() {
        const hist = computed(() => App.list(App.S.credits.history));
        const f = reactive({ open: false, amount: '10000' });
        const amounts = [5000, 10000, 20000, 50000];
        const submit = () => {
          const a = +f.amount; App.S.credits.balance += a; App.S.credits.history.unshift({ date: '16. 10. 2026', text: 'Dobití firemních kreditů', amount: a });
          f.open = false; toast('Kredity jsou připsané (v prototypu bez platby).');
        };
        return { App, t, kc, hist, f, amounts, submit };
      },
      template: `
        <page-state title="Kredity">
          <template #action><ds-button v-if="App.isAdmin()" @click="f.open = true">{{ t('Koupit firemní kredity') }}</ds-button></template>
          <template #default>
            <section class="acct-card"><div class="rows"><h2>{{ t('Zůstatek firemních kreditů') }}</h2><b class="big">{{ kc(App.S.scenario === 'empty' ? 0 : App.S.credits.balance) }}</b>
              <span class="muted">{{ t('Kredity může koupit jen správce firmy. Použít je mohou všichni kolegové při placení.') }}</span></div></section>
            <template v-if="hist.length">
              <h2 class="sec-h">{{ t('Pohyby na účtu') }}</h2>
              <ds-table class="acct-tbl"><thead><tr><th>{{ t('Datum') }}</th><th>{{ t('Popis') }}</th><th>{{ t('Částka') }}</th></tr></thead>
                <tbody><tr v-for="(h, i) in hist" :key="i"><td :data-label="t('Datum')">{{ h.date }}</td><td :data-label="t('Popis')">{{ t(h.text) }}</td>
                  <td :data-label="t('Částka')"><b :class="h.amount < 0 ? 'neg' : 'pos'">{{ h.amount > 0 ? '+' : '' }}{{ kc(h.amount) }}</b></td></tr></tbody></ds-table>
            </template>
            <empty-state v-else title="Zatím nemáte žádné kredity" text="Firemní kredity získáte dobitím nebo vrácením peněz za objednávku."></empty-state>
          <form-modal v-model:open="f.open" title="Koupit firemní kredity" subtitle="Kredity budou připsány po zaplacení." submit-label="Pokračovat k platbě" @submit="submit">
            <ds-radio-group v-model="f.amount" class="radios"><ds-inline-field-label v-for="a in amounts" :key="a" class="acct-radio" :for="'amt-' + a"><ds-radio :id="'amt-' + a" :value="String(a)"></ds-radio><template #label><b>{{ kc(a) }}</b></template></ds-inline-field-label></ds-radio-group>
          </form-modal>
          </template>
        </page-state>`
    }
  });

  App.register('savings', {
    label: 'Přehled úspor', icon: 'Wallet',
    comp: { setup: () => ({}), template: `<page-state title="Přehled úspor"><empty-state title="Zatím tu není co zobrazit" text="Až nakoupíte za akční ceny, ukážeme vám, kolik jste ušetřili."></empty-state></page-state>` }
  });

  App.register('favorites', {
    label: 'Moje oblíbené', icon: 'HeartOutline',
    comp: { setup: () => ({ t }), template: `<page-state title="Moje oblíbené"><empty-state title="Zatím nemáte žádné oblíbené produkty" text="Oblíbené produkty najdete tady a přidáte je do košíku na jedno kliknutí."><ds-button as="a" href="#/">{{ t('Přejít do obchodu') }}</ds-button></empty-state></page-state>` }
  });

  App.register('notifications', {
    label: 'Oznámení', icon: 'BellOutline',
    comp: { setup: () => ({}), template: `<page-state title="Oznámení"><empty-state title="Nemáte žádná nová oznámení" text="Dáme vám vědět, až se u vašich objednávek nebo ve firemním účtu něco změní."></empty-state></page-state>` }
  });
})();
