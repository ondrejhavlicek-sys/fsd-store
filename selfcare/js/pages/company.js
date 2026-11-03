/* copied from fsd-selfcare @ f2a58c7 (js/pages/company.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Firemní informace: identity (from the register), trading name, segment, contact, company-email-only switch,
   and read-only blocks set by makro staff (customer number, linked IČOs, sales representative). */
(function () {
  const { reactive, ref } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  const phoneOk = v => /^\+?[\d\s]{9,16}$/.test(v || '');
  const TITLES = { seat: 'Sídlo firmy', trade: 'Obchodní název', segment: 'Zaměření firmy', contact: 'Kontakt firmy', domains: 'E-mail jen s firemní doménou' };

  App.register('company', {
    label: 'Firemní informace', icon: 'BuildingOutline',
    comp: {
      setup() {
        const c = Vue.computed(() => App.S.company), st = Vue.computed(() => App.S.staff), refreshing = ref(false);
        const f = reactive({ open: false, kind: '', seatDiff: false, seat: '', trade: '', segment: '', size: '', phone: '', email: '', domains: '', err: {} });
        const segs = MockData.segments.map(x => ({ value: x, label: x })), sizes = MockData.sizes.map(x => ({ value: x, label: x }));
        const open = kind => {
          const co = App.S.company;
          Object.assign(f, { open: true, kind, err: {}, seatDiff: !!co.seatAddress, seat: co.seatAddress, trade: co.tradeName, segment: co.segment, size: co.size,
            phone: co.contactPhone, email: co.contactEmail, domains: co.domains.join(', ') });
        };
        const refresh = () => { refreshing.value = true; setTimeout(() => { refreshing.value = false; toast('Údaje jsou aktuální podle obchodního rejstříku.'); }, 900); };
        const toggle = on => { if (on) open('domains'); else { App.S.company.onlyCompanyEmail = false; toast('Nastavení je uložené.'); } };
        const submit = () => {
          const co = App.S.company, k = f.kind; f.err = {};
          if (k === 'domains') {
            const domains = f.domains.split(',').map(s => s.trim().replace(/^@/, '').toLowerCase()).filter(Boolean);
            if (!domains.length) return f.err = { domains: 'Zadejte alespoň jednu doménu.' };
            co.onlyCompanyEmail = true; co.domains = domains;
          } else if (k === 'contact') {
            if (!phoneOk(f.phone)) return f.err = { phone: 'Zadejte telefon ve tvaru +420 777 000 111.' };
            if (!emailOk(f.email)) return f.err = { email: 'Zadejte e-mail ve tvaru jmeno@firma.cz.' };
            co.contactPhone = f.phone.trim(); co.contactEmail = f.email.trim();
          } else if (k === 'seat') {
            if (f.seatDiff && !f.seat.trim()) return f.err = { seat: 'Zadejte adresu sídla.' };
            co.seatAddress = f.seatDiff ? f.seat.trim() : '';
          } else if (k === 'trade') co.tradeName = f.trade.trim();
          else if (k === 'segment') { co.segment = f.segment; co.size = f.size; }
          f.open = false; toast(k === 'contact' ? 'Kontakty jsou uložené.' : 'Nastavení je uložené.');
        };
        return { App, I, t, c, st, f, TITLES, segs, sizes, open, refresh, refreshing, toggle, submit };
      },
      template: `
        <page-state title="Firemní informace">
          <ds-message v-if="!App.isAdmin()" variant="info" class="mb" :title="t('Nastavení firmy vidíte jen ke čtení')" :body="t('Změny může provést správce firmy.')"></ds-message>

          <section class="acct-card">
            <div class="rows"><h2>{{ t('Identifikace firmy') }}</h2>
              <dl class="kv">
                <dt>{{ t('Obchodní jméno') }}</dt><dd><b>{{ c.name }}</b></dd>
                <dt>{{ t('Právní forma') }}</dt><dd>{{ c.legalForm }}</dd>
                <dt>{{ t('IČO') }}</dt><dd>{{ c.ico }}</dd>
                <dt>{{ t('DIČ') }}</dt><dd>{{ c.dic }}</dd>
                <dt>{{ t('Země') }}</dt><dd>{{ t('Česko') }}</dd>
                <dt>{{ t('Fakturační adresa') }}</dt><dd>{{ c.address }}</dd>
              </dl>
              <span class="muted src">{{ t('Údaje pocházejí z obchodního rejstříku (ARES).') }}</span></div>
            <ds-button v-if="App.isAdmin()" variant="tertiary" size="sm" :loading="refreshing" @click="refresh">{{ t('Aktualizovat z rejstříku') }}</ds-button>
          </section>

          <section class="acct-card">
            <div class="rows"><h2>{{ t('Sídlo firmy') }}</h2>
              <span>{{ c.seatAddress || t('Sídlo je shodné s fakturační adresou.') }}</span></div>
            <ds-icon-button v-if="App.isAdmin()" variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t('sídlo firmy')" @click="open('seat')"></ds-icon-button>
          </section>

          <section class="acct-card">
            <div class="rows"><h2>{{ t('Obchodní název') }}</h2>
              <span>{{ c.tradeName || t('Nezadáno') }}</span>
              <span class="muted">{{ t('Zobrazí se u dodacích adres, které nemají vlastní název provozovny.') }}</span></div>
            <ds-icon-button v-if="App.isAdmin()" variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t('obchodní název')" @click="open('trade')"></ds-icon-button>
          </section>

          <section class="acct-card">
            <div class="rows"><h2>{{ t('Zaměření firmy') }}</h2>
              <dl class="kv"><dt>{{ t('Obor podnikání') }}</dt><dd>{{ t(c.segment) }}</dd>
                <dt>{{ t('Velikost firmy') }}</dt><dd>{{ t(c.size) }} <later-tag label="Ověřit"></later-tag></dd></dl>
              <span class="muted">{{ t('Podle oboru vám připravíme úvodní sortiment.') }}</span></div>
            <ds-icon-button v-if="App.isAdmin()" variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t('zaměření firmy')" @click="open('segment')"></ds-icon-button>
          </section>

          <section class="acct-card">
            <div class="rows"><h2>{{ t('Kontakt firmy') }}</h2><span>{{ c.contactEmail }}</span><span>{{ c.contactPhone }}</span>
              <span class="muted">{{ t('Hlavní kontakt pro provoz a objednávky. Marketingové souhlasy se nastavují zvlášť.') }}</span></div>
            <ds-icon-button v-if="App.isAdmin()" variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t('kontakt firmy')" @click="open('contact')"></ds-icon-button>
          </section>

          <section class="acct-card">
            <div class="rows"><h2>{{ t('Přidávat kolegy jen s firemním e-mailem') }}</h2>
              <span class="muted">{{ c.onlyCompanyEmail ? t('Zapnuto. Kolegy půjde přidat jen s e-mailem v těchto doménách:') : t('Vypnuto. Kolegu půjde přidat s jakýmkoli e-mailem.') }}</span>
              <div v-if="c.onlyCompanyEmail" class="tags"><product-tag v-for="d in c.domains" :key="d" variant="neutral" :label="'@' + d"></product-tag></div></div>
            <div class="card-act">
              <ds-switch :checked="c.onlyCompanyEmail" :disabled="!App.isAdmin()" :aria-label="t('Přidávat kolegy jen s firemním e-mailem')" @update:checked="toggle"></ds-switch>
              <ds-icon-button v-if="App.isAdmin()" variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t('e-mail jen s firemní doménou')" @click="open('domains')"></ds-icon-button>
            </div>
          </section>

          <h2 class="sec-h">{{ t('Údaje, které spravuje makro') }}</h2>
          <p class="muted lead2">{{ t('Tyto údaje nastavuje makro. Pokud je potřeba je změnit, pošlete nám žádost.') }}</p>
          <staff-card title="Zákaznické číslo" topic="Zákaznické číslo">
            <dl class="kv"><dt>{{ t('Číslo zákazníka makro') }}</dt><dd><b>{{ st.customerNo }}</b></dd><dt>{{ t('Stav registrace') }}</dt><dd><product-tag variant="green" :label="t(st.status)"></product-tag></dd></dl>
          </staff-card>
          <staff-card title="Propojená IČO" topic="Propojená IČO">
            <ul class="plain"><li v-for="l in st.linked" :key="l.ico">{{ l.name }} <span class="muted">· {{ t('IČO') }} {{ l.ico }}</span></li></ul>
            <span class="muted">{{ t('Firmy propojené pod jednu obchodní skupinu, například hotelový řetězec.') }}</span>
          </staff-card>
          <staff-card title="Obchodní zástupce" topic="Obchodní zástupce">
            <dl class="kv"><dt>{{ t('Jméno') }}</dt><dd><b>{{ st.rep.name }}</b></dd><dt>{{ t('E-mail') }}</dt><dd><a :href="'mailto:' + st.rep.email">{{ st.rep.email }}</a></dd><dt>{{ t('Telefon') }}</dt><dd><a :href="'tel:' + st.rep.phone.replace(/\\s/g, '')">{{ st.rep.phone }}</a></dd></dl>
            <span class="muted">{{ t('Kontakt na obchodního zástupce najdete také v patičce stránky.') }} <later-tag label="Ověřit"></later-tag></span>
          </staff-card>

          <form-modal v-model:open="f.open" :title="TITLES[f.kind] || ''" :subtitle="f.kind === 'domains' ? 'Přidání kolegy půjde dokončit jen s e-mailem v povolené doméně.' : undefined" @submit="submit">
            <template v-if="f.kind === 'domains'"><field label="Povolené domény (oddělte čárkou)" v-model="f.domains" placeholder="firma.cz, firma.com" :error="f.err.domains"></field></template>
            <template v-else-if="f.kind === 'contact'">
              <field label="E-mail" type="email" req v-model="f.email" :error="f.err.email"></field>
              <field label="Mobilní telefon" type="tel" req v-model="f.phone" :error="f.err.phone"></field>
            </template>
            <template v-else-if="f.kind === 'seat'">
              <ds-inline-field-label class="acct-radio" for="seat-diff"><ds-checkbox id="seat-diff" :checked="f.seatDiff" @update:checked="f.seatDiff = $event"></ds-checkbox><template #label>{{ t('Sídlo se liší od fakturační adresy') }}</template></ds-inline-field-label>
              <field v-if="f.seatDiff" label="Adresa sídla" req v-model="f.seat" :error="f.err.seat"></field>
            </template>
            <template v-else-if="f.kind === 'trade'">
              <field label="Obchodní název" v-model="f.trade" placeholder="např. Restaurace U Mostu" hint="Nepovinné. Zobrazí se u dodacích adres bez vlastního názvu provozovny."></field>
            </template>
            <template v-else-if="f.kind === 'segment'">
              <sel-field label="Obor podnikání" v-model="f.segment" :options="segs"></sel-field>
              <sel-field label="Velikost firmy" v-model="f.size" :options="sizes"></sel-field>
            </template>
          </form-modal>
        </page-state>`
    }
  });
})();
