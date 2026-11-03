/* copied from fsd-selfcare @ f2a58c7 (js/pages/payments.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Platby a fakturace: allowed methods (staff, read-only), preferred methods, credit and payment terms, invoice contacts, saved cards */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const METHODS = { invoice: 'Faktura', cod: 'Dobírka', bonus: 'Bonus a kredity', voucher: 'Stravenky', debit: 'Inkaso' };
  const CREDIT = { approved: ['Schváleno', 'green'], pending: ['Čeká na schválení', 'neutral'], none: ['Bez úvěru', 'neutral'] };
  const kc = n => n.toLocaleString('cs-CZ').replace(/\s/g, ' ') + ' Kč';
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  const phoneOk = v => /^\+?[\d\s]{9,16}$/.test(v || '');

  App.register('payments', {
    label: 'Platby a fakturace', icon: 'CreditCard', admin: true,
    comp: {
      setup() {
        const st = computed(() => App.S.staff), pay = computed(() => App.S.payments);
        const card = computed(() => App.S.scenario === 'empty' ? null : App.S.card);
        const f = reactive({ open: false, kind: '', pref: [], phone: '', email: '', err: {} });
        const open = kind => { const p = App.S.payments; Object.assign(f, { open: true, kind, err: {}, pref: p.preferred.slice(), phone: p.invoicePhone, email: p.invoiceEmail }); };
        const togglePref = (k, on) => { f.pref = on ? f.pref.concat(k) : f.pref.filter(x => x !== k); };
        const submit = () => {
          f.err = {}; const p = App.S.payments;
          if (f.kind === 'pref') {
            if (!f.pref.length) return f.err = { pref: 'Vyberte alespoň jeden způsob platby.' };
            p.preferred = f.pref.slice(); toast('Nastavení je uložené.');
          } else {
            if (!phoneOk(f.phone)) return f.err = { phone: 'Zadejte telefon ve tvaru +420 777 000 111.' };
            if (!emailOk(f.email)) return f.err = { email: 'Zadejte e-mail ve tvaru jmeno@firma.cz.' };
            p.invoicePhone = f.phone.trim(); p.invoiceEmail = f.email.trim(); toast('Kontakty jsou uložené.');
          }
          f.open = false;
        };
        const askCredit = () => { App.S.staff.credit.status = 'pending'; toast('Žádost o úvěr jsme přijali. Ozveme se vám.'); };
        const delCard = () => Acct.confirm({ title: 'Odebrat kartu?', text: 'Kartu budete moci kdykoli uložit znovu při placení.', label: 'Odebrat', danger: true, onYes: () => { App.S.card = null; toast('Karta je odebraná.'); } });
        return { App, I, t, st, pay, card, f, METHODS, CREDIT, kc, open, togglePref, submit, askCredit, delCard };
      },
      template: `
        <page-state title="Platby a fakturace">
          <staff-card title="Povolené způsoby platby" topic="Povolené způsoby platby">
            <div class="tags"><product-tag v-for="m in st.methodsAllowed" :key="m" variant="green" :label="t(METHODS[m])"></product-tag></div>
            <span class="muted">{{ t('Ne každý zákazník má k dispozici všechny způsoby platby. Ty vaše nastavuje makro.') }}</span>
          </staff-card>

          <section class="acct-card">
            <div class="rows"><h2>{{ t('Preferované způsoby platby') }}</h2>
              <div class="tags"><product-tag v-for="m in pay.preferred" :key="m" variant="neutral" :label="t(METHODS[m])"></product-tag></div>
              <span class="muted">{{ t('Vybírat můžete jen z povolených způsobů. Záloha za vratné obaly je jen informace, není to způsob platby.') }}</span></div>
            <ds-icon-button variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t('preferované způsoby platby')" @click="open('pref')"></ds-icon-button>
          </section>

          <staff-card title="Úvěr a platební podmínky" topic="Úvěr a platební podmínky" :no-request="st.credit.status === 'none'">
            <dl class="kv"><dt>{{ t('Stav úvěru') }}</dt><dd><product-tag :variant="CREDIT[st.credit.status][1]" :label="t(CREDIT[st.credit.status][0])"></product-tag> <later-tag label="Ověřit"></later-tag></dd>
              <template v-if="st.credit.status === 'approved'">
                <dt>{{ t('Úvěrový limit') }}</dt><dd>{{ kc(st.credit.limit) }}</dd>
                <dt>{{ t('Čerpáno') }}</dt><dd>{{ kc(st.credit.balance) }}</dd>
                <dt>{{ t('Platební podmínky') }}</dt><dd>{{ t(st.credit.terms) }}</dd>
              </template></dl>
            <ds-button v-if="st.credit.status === 'none'" size="sm" @click="askCredit">{{ t('Požádat o úvěr') }}</ds-button>
            <span class="note">{{ t('U stávajících zákazníků přebíráme podmínky z evidence makro.') }}</span>
          </staff-card>

          <section class="acct-card">
            <div class="rows"><h2>{{ t('Kontakty pro zasílání faktur') }}</h2><span>{{ pay.invoiceEmail }}</span><span>{{ pay.invoicePhone }}</span></div>
            <ds-icon-button variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t('kontakty pro zasílání faktur')" @click="open('invoice')"></ds-icon-button>
          </section>

          <h2 class="sec-h">{{ t('Uložené karty') }}</h2>
          <template v-if="card">
            <section class="acct-card"><div class="rows"><h2>{{ card.brand }} •••• {{ card.last4 }}</h2><span class="muted">{{ t('Platí do ' + card.exp) }}</span></div>
              <ds-button variant="ghost" size="sm" class="acct-danger-text" @click="delCard">{{ t('Odebrat') }}</ds-button></section>
            <p class="muted">{{ t('Novou kartu uložíte při placení v obchodě. Platba probíhá přes zabezpečenou bankovní bránu.') }}</p>
          </template>
          <empty-state v-else title="Zatím nemáte uloženou žádnou kartu" text="Kartu můžete uložit při placení, ať ji nemusíte zadávat znovu. Platba probíhá přes zabezpečenou bankovní bránu."></empty-state>

          <form-modal v-model:open="f.open" :title="f.kind === 'pref' ? 'Preferované způsoby platby' : 'Kontakty pro zasílání faktur'" @submit="submit">
            <fieldset v-if="f.kind === 'pref'" class="fset"><legend class="lbl-t">{{ t('Vyberte, čím platíte nejraději') }}</legend>
              <ds-inline-field-label v-for="m in st.methodsAllowed" :key="m" class="acct-radio" :for="'pm-' + m"><ds-checkbox :id="'pm-' + m" :checked="f.pref.includes(m)" @update:checked="togglePref(m, $event)"></ds-checkbox><template #label>{{ t(METHODS[m]) }}</template></ds-inline-field-label>
              <ds-field-message v-if="f.err.pref" role="alert" class="fld-err">{{ t(f.err.pref) }}</ds-field-message></fieldset>
            <template v-else>
              <field label="Telefon" type="tel" req v-model="f.phone" :error="f.err.phone"></field>
              <field label="E-mail" type="email" req v-model="f.email" :error="f.err.email"></field>
            </template>
          </form-modal>
        </page-state>`
    }
  });
})();
