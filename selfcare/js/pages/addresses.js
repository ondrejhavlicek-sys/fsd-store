/* copied from fsd-selfcare @ f2a58c7 (js/pages/addresses.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Dodací adresy: one flat list of delivery addresses. Per address: optional "Název provozovny", street/city/zip/country, map pin,
   main flag, active flag, contact, handover details, preferred delivery days/times, restrictions, seasonal validity and 0..n licences.
   Add/edit in a Fresh Drawer: the first view is just name + address (+ map); everything else sits in collapsed accordion sections. */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const tm = s => String(s).replace(/^0/, '');
  const dayText = s => s.days.length === 7 ? t('každý den') : s.days.map(i => t(DAYS[i])).join(', ');
  /* licence types: extend this list to add more kinds */
  const KINDS = [{ value: 'alcohol', label: 'Alkohol' }, { value: 'tobacco', label: 'Tabák' }];
  const KIND_LABEL = KINDS.reduce((o, k) => (o[k.value] = k.label, o), {});
  const dcz = iso => iso ? iso.split('-').reverse().map(x => String(+x)).join('. ') : '';
  const soon = l => !!l.expiry && l.expiry < '2027-01-16';
  const uid = p => p + Date.now() + Math.round(Math.random() * 999);
  const blank = () => ({ id: null, name: '', street: '', city: '', zip: '', country: 'CZ', pin: [50, 50], contact: '', phone: '', entrance: '', floor: '', door: '', note: '',
    days: [0, 1, 2, 3, 4], from: '06:00', to: '12:00', restrictions: [], validFrom: '', validTo: '', licences: [], copyFrom: 'none' });
  const zipOk = (zip, c) => (c === 'CZ' || c === 'SK') ? /^\d{3}\s?\d{2}$/.test(zip.trim()) : zip.trim().length > 0;
  const sugText = x => x.street + ', ' + x.zip + ' ' + x.city;

  App.register('addresses', {
    label: 'Dodací adresy', icon: 'LocationPinSolid',
    comp: {
      setup() {
        const list = computed(() => App.list(App.S.addresses));
        const f = reactive(Object.assign(blank(), { open: false, err: {}, sug: [], acc: [] }));
        const mapEl = Vue.ref(null); let drag = false;
        const otherAddr = computed(() => [{ value: 'none', label: 'Nekopírovat' }].concat(App.S.addresses.filter(a => a.id !== f.id).map(a => ({ value: a.id, label: App.addrTitle(a) }))));
        const openForm = a => {
          const src = a ? JSON.parse(JSON.stringify(a)) : blank();
          Object.assign(f, blank(), src, { open: true, err: {}, sug: [], acc: [], copyFrom: 'none', licences: (src.licences || []).map(l => Object.assign({}, l)) });
        };
        const onStreet = v => {
          f.street = v; const q = String(v).trim().toLowerCase();
          f.sug = q.length < 2 ? [] : MockData.addressSuggestions.filter(x => x.street.toLowerCase().includes(q)).slice(0, 5);
        };
        const pick = x => { f.street = x.street; f.city = x.city; f.zip = x.zip; f.country = 'CZ'; f.sug = []; f.pin = [30 + Math.round(Math.random() * 40), 40 + Math.round(Math.random() * 30)]; };
        const move = e => { const r = mapEl.value.getBoundingClientRect(); f.pin = [Math.round(Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100))), Math.round(Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100)))]; };
        const down = e => { drag = true; mapEl.value.setPointerCapture(e.pointerId); move(e); };
        const mv = e => { if (drag) move(e); };
        const up = () => { drag = false; };
        const toggleDay = i => { f.days = f.days.includes(i) ? f.days.filter(x => x !== i) : f.days.concat(i); };
        const toggleRestr = (k, on) => { f.restrictions = on ? f.restrictions.concat(k) : f.restrictions.filter(x => x !== k); };
        const addLic = () => { f.licences.push({ id: uid('l'), kind: 'alcohol', code: '', expiry: '' }); if (!f.acc.includes('lic')) f.acc.push('lic'); };
        const delLic = l => { f.licences = f.licences.filter(x => x !== l); };
        const fail = (key, msg, section) => { f.err = { [key]: msg }; if (section && !f.acc.includes(section)) f.acc.push(section); };
        const submit = () => {
          f.err = {};
          if (!f.street.trim()) return fail('street', 'Zadejte ulici a číslo domu.');
          if (!f.city.trim()) return fail('city', 'Zadejte město.');
          if (!zipOk(f.zip, f.country)) return fail('zip', 'Zadejte PSČ ve tvaru 110 00.');
          if (f.phone && !/^\+?[\d\s]{9,16}$/.test(f.phone)) return fail('phone', 'Zadejte telefon ve tvaru +420 777 000 111.', 'contact');
          if (!f.days.length) return fail('days', 'Vyberte alespoň jeden den doručení.', 'delivery');
          if (f.from && f.to && f.from >= f.to) return fail('to', 'Konec příjmu musí být později než začátek.', 'delivery');
          if (f.validFrom && f.validTo && f.validFrom > f.validTo) return fail('valid', 'Konec platnosti adresy musí být později než začátek.', 'validity');
          if (f.licences.some(l => !l.code.trim())) return fail('lic', 'Zadejte číslo každé licence.', 'lic');
          const data = { name: f.name.trim(), street: f.street.trim(), city: f.city.trim(), zip: f.zip.trim(), country: f.country, pin: f.pin.slice(), contact: f.contact.trim(), phone: f.phone.trim(),
            entrance: f.entrance.trim(), floor: f.floor.trim(), door: f.door.trim(), note: f.note.trim(), days: f.days.slice().sort(), from: f.from || '06:00', to: f.to || '12:00',
            restrictions: f.restrictions.slice(), validFrom: f.validFrom, validTo: f.validTo, licences: f.licences.map(l => ({ id: l.id, kind: l.kind, code: l.code.trim(), expiry: l.expiry })) };
          const isNew = !f.id;
          if (f.id) Object.assign(App.S.addresses.find(a => a.id === f.id), data);
          else {
            const id = 'a' + Date.now();
            App.S.addresses.push(Object.assign({ id, blocked: false, main: !App.S.addresses.some(a => a.main) }, data));
            if (f.copyFrom && f.copyFrom !== 'none') App.S.users.forEach(u => { if (Array.isArray(u.addresses) && u.addresses.includes(f.copyFrom)) u.addresses.push(id); });
          }
          f.open = false; toast(isNew ? 'Dodací adresa je přidaná.' : 'Změny jsou uložené.');
        };
        const active = () => App.S.addresses.filter(a => !a.blocked);
        const setMain = a => { App.S.addresses.forEach(x => { x.main = x === a; }); toast('Hlavní dodací adresa je změněná.'); };
        const block = a => {
          if (a.blocked) { a.blocked = false; return toast('Dodací adresa je znovu aktivní.'); }
          if (active().length < 2) return Acct.confirm({ title: 'Adresu nelze deaktivovat', text: 'Alespoň jedna dodací adresa musí zůstat aktivní. Nejdřív přidejte nebo aktivujte jinou.', cancel: 'Rozumím' });
          if (a.main) return Acct.confirm({ title: 'Adresu nelze deaktivovat', text: 'Je to hlavní dodací adresa. Nejdřív nastavte jako hlavní jinou adresu.', cancel: 'Rozumím' });
          Acct.confirm({ title: 'Deaktivovat dodací adresu?', text: 'Na tuto adresu nepůjde objednávat, dokud ji znovu neaktivujete. Otevřené objednávky zůstanou beze změny.', label: 'Deaktivovat', danger: true,
            onYes: () => { a.blocked = true; toast('Dodací adresa je deaktivovaná.'); } });
        };
        const del = a => {
          if (App.S.orders.some(o => o.address === a.id && o.status !== 'Doručeno'))
            return Acct.confirm({ title: 'Adresu nelze odebrat', text: 'Má otevřené objednávky. Počkejte na jejich doručení, nebo adresu zatím deaktivujte.', cancel: 'Rozumím' });
          if (a.main && App.S.addresses.length > 1) return Acct.confirm({ title: 'Adresu nelze odebrat', text: 'Je to hlavní dodací adresa. Nejdřív nastavte jako hlavní jinou adresu.', cancel: 'Rozumím' });
          if (!a.blocked && active().length < 2) return Acct.confirm({ title: 'Adresu nelze odebrat', text: 'Alespoň jedna dodací adresa musí zůstat aktivní. Nejdřív přidejte nebo aktivujte jinou.', cancel: 'Rozumím' });
          Acct.confirm({ title: 'Odebrat dodací adresu?', text: App.addrTitle(a) + ' zmizí z nabídky doručení a kolegům se odebere přístup.', label: 'Odebrat', danger: true, onYes: () => {
            App.S.addresses = App.S.addresses.filter(x => x.id !== a.id);
            App.S.users.forEach(u => { if (Array.isArray(u.addresses)) u.addresses = u.addresses.filter(id => id !== a.id); });
            toast('Dodací adresa je odebraná.');
          } });
        };
        const handover = a => [a.entrance, a.floor, a.door, a.note].filter(Boolean).map(x => t(x)).join(' · ');
        const validity = a => a.validFrom || a.validTo ? t('Platí') + ' ' + (dcz(a.validFrom) || '…') + '–' + (dcz(a.validTo) || '…') : '';
        const country = a => t((MockData.countries.find(c => c.value === a.country) || {}).label || a.country);
        return { App, I, t, list, f, DAYS, dayText, tm, MockData, KINDS, KIND_LABEL, dcz, soon, handover, validity, country, sugText, otherAddr, mapEl,
          openForm, onStreet, pick, down, mv, up, toggleDay, toggleRestr, addLic, delLic, submit, setMain, block, del };
      },
      template: `
        <page-state title="Dodací adresy">
          <template #action><ds-button v-if="App.isAdmin()" @click="openForm(null)">{{ t('Přidat dodací adresu') }}</ds-button></template>
          <template #default>
            <ds-message v-if="!App.isAdmin()" variant="info" class="mb" :title="t('Dodací adresy vidíte jen ke čtení')" :body="t('Přidat nebo upravit je může správce firmy.')"></ds-message>
            <div v-if="list.length" class="acct-grid">
              <section v-for="a in list" :key="a.id" class="acct-card">
                <div class="top"><h2>{{ App.addrTitle(a) }}</h2><div class="tags"><product-tag v-if="a.main" variant="green" :label="t('Hlavní')"></product-tag><product-tag :variant="a.blocked ? 'red' : 'green'" :label="t(a.blocked ? 'Deaktivovaná' : 'Aktivní')"></product-tag></div></div>
                <div class="rows">
                  <span><b>{{ App.addrLine(a) }}</b><template v-if="a.country !== 'CZ'">, {{ country(a) }}</template></span>
                  <span v-if="handover(a)" class="muted">{{ handover(a) }}</span>
                  <span v-if="a.contact" class="muted">{{ t('Kontakt') }}: {{ a.contact }}<template v-if="a.phone">, {{ a.phone }}</template></span>
                  <span class="muted">{{ t('Preferovaný čas doručení') }}: {{ dayText(a) }}, {{ tm(a.from) }}–{{ tm(a.to) }}</span>
                  <span v-if="validity(a)" class="muted">{{ validity(a) }} <later-tag label="Sezónní adresa"></later-tag></span>
                </div>
                <div v-if="a.licences.length" class="tags">
                  <template v-for="l in a.licences" :key="l.id"><product-tag variant="neutral" :label="t(KIND_LABEL[l.kind]) + ' · ' + l.code + (l.expiry ? ' · ' + t('platí do') + ' ' + dcz(l.expiry) : '')"></product-tag><product-tag v-if="soon(l)" variant="red" :label="t('Brzy vyprší')"></product-tag></template>
                  <later-tag v-if="a.licences.some(l => l.expiry)" label="Hlídání platnosti"></later-tag>
                </div>
                <div v-if="a.restrictions.length" class="tags"><product-tag v-for="r in a.restrictions" :key="r" variant="neutral" :label="t(MockData.restrictionLabels[r])"></product-tag></div>
                <div v-if="App.isAdmin()" class="acts">
                  <ds-button variant="tertiary" size="sm" @click="openForm(a)">{{ t('Upravit') }}</ds-button>
                  <ds-button v-if="!a.main && !a.blocked" variant="ghost" size="sm" @click="setMain(a)">{{ t('Nastavit jako hlavní') }}</ds-button>
                  <ds-button variant="ghost" size="sm" @click="block(a)">{{ a.blocked ? t('Aktivovat') : t('Deaktivovat') }}</ds-button>
                  <ds-button variant="ghost" size="sm" class="acct-danger-text" @click="del(a)">{{ t('Odebrat') }}</ds-button>
                </div>
              </section>
            </div>
            <empty-state v-else title="Zatím tu nemáte žádnou dodací adresu" text="Dodací adresa je místo, kam vám doručujeme. Přidejte první a určete, kdo na ni smí nakupovat.">
              <ds-button v-if="App.isAdmin()" @click="openForm(null)">{{ t('Přidat dodací adresu') }}</ds-button>
            </empty-state>

            <ds-drawer v-model:open="f.open" :title="t(f.id ? 'Upravit dodací adresu' : 'Přidat dodací adresu')" :subtitle="f.id ? App.addrTitle(f) : undefined" class="acct-drawer">
              <form novalidate @submit.prevent="submit">
                <field label="Název provozovny" v-model="f.name" placeholder="např. Restaurace U Mostu" hint="Nepovinné. Když ho nevyplníte, použijeme obchodní název firmy."></field>
                <div class="fld2 addr">
                  <ds-field-label for="ad-street" :invalid="!!f.err.street">{{ t('Ulice') }} <span class="opt">({{ t('povinné') }})</span></ds-field-label>
                  <ds-text-field id="ad-street" :model-value="f.street" :invalid="!!f.err.street" :placeholder="t('např. Evropská 2758/11')" autocomplete="off" role="combobox" :aria-expanded="f.sug.length > 0" aria-controls="ad-sug" @update:model-value="onStreet"></ds-text-field>
                  <div v-if="f.sug.length" id="ad-sug" class="sug" role="listbox"><button v-for="x in f.sug" :key="sugText(x)" type="button" role="option" @click="pick(x)">{{ sugText(x) }}</button></div>
                  <ds-field-message v-if="f.err.street" role="alert" class="fld-err">{{ t(f.err.street) }}</ds-field-message>
                </div>
                <div class="row2"><field label="PSČ" req v-model="f.zip" placeholder="110 00" :error="f.err.zip"></field><field label="Město" req v-model="f.city" :error="f.err.city"></field></div>
                <sel-field label="Země" v-model="f.country" :options="MockData.countries"></sel-field>
                <div class="fld2"><span class="lbl-t">{{ t('Přesné místo doručení (přetáhněte špendlík)') }}</span>
                  <div class="map" ref="mapEl" @pointerdown="down" @pointermove="mv" @pointerup="up">
                    <svg class="pin" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" :style="{ left: f.pin[0] + '%', top: f.pin[1] + '%' }"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zm0-9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                    <small>{{ t('Zjednodušená mapa prototypu') }}</small></div></div>

                <ds-accordion v-model="f.acc" type="multiple" class="addr-acc">
                  <ds-accordion-item value="handover" :title="t('Předání zboží')">
                    <div class="row3"><field label="Vchod" v-model="f.entrance"></field><field label="Patro" v-model="f.floor"></field><field label="Číslo dveří" v-model="f.door"></field></div>
                    <field label="Poznámka k předání zboží" v-model="f.note" placeholder="např. zvonek Kuchyně"></field>
                  </ds-accordion-item>
                  <ds-accordion-item value="contact" :title="t('Kontakt')">
                    <div class="row2"><field label="Kontaktní osoba" v-model="f.contact"></field><field label="Telefon" type="tel" v-model="f.phone" :error="f.err.phone"></field></div>
                  </ds-accordion-item>
                  <ds-accordion-item value="delivery" :title="t('Dny a časy doručení')">
                    <p class="note">{{ t('Jde o vaše přání, ne o garantovaný čas doručení. Přesný čas potvrdíme při objednávce.') }}</p>
                    <div class="fld2"><span class="lbl-t" id="days-l">{{ t('Dny doručení') }}</span>
                      <div class="days" role="group" aria-labelledby="days-l"><button v-for="(d, i) in DAYS" :key="d" type="button" :aria-pressed="f.days.includes(i)" :class="{ on: f.days.includes(i) }" @click="toggleDay(i)">{{ t(d) }}</button></div>
                      <ds-field-message v-if="f.err.days" role="alert" class="fld-err">{{ t(f.err.days) }}</ds-field-message></div>
                    <div class="row2"><field label="Čas doručení od" type="time" v-model="f.from"></field><field label="Čas doručení do" type="time" v-model="f.to" :error="f.err.to"></field></div>
                    <fieldset class="fset"><legend class="lbl-t">{{ t('Omezení doručení') }}</legend>
                      <ds-inline-field-label v-for="(label, k) in MockData.restrictionLabels" :key="k" class="acct-radio" :for="'r-' + k">
                        <ds-checkbox :id="'r-' + k" :checked="f.restrictions.includes(k)" @update:checked="toggleRestr(k, $event)"></ds-checkbox>
                        <template #label>{{ t(label) }}</template>
                      </ds-inline-field-label></fieldset>
                  </ds-accordion-item>
                  <ds-accordion-item value="lic" :title="t('Licence') + (f.licences.length ? ' (' + f.licences.length + ')' : '')">
                    <p v-if="!f.licences.length" class="note">{{ t('Tato adresa nemá žádné licence.') }}</p>
                    <div v-for="(l, i) in f.licences" :key="l.id" class="addr-box">
                      <div class="addr-box-h"><b>{{ t('Licence') }} {{ i + 1 }}</b><ds-button variant="ghost" size="sm" class="acct-danger-text" @click="delLic(l)">{{ t('Odebrat licenci') }}</ds-button></div>
                      <sel-field label="Druh licence" v-model="l.kind" :options="KINDS"></sel-field>
                      <field label="Číslo licence nebo odkaz na dokument" req v-model="l.code"></field>
                      <field label="Platnost licence do" type="date" v-model="l.expiry"></field>
                    </div>
                    <ds-field-message v-if="f.err.lic" role="alert" class="fld-err">{{ t(f.err.lic) }}</ds-field-message>
                    <p class="note"><later-tag label="Hlídání platnosti"></later-tag> {{ t('Před koncem platnosti vám dáme vědět, ať licenci včas obnovíte.') }}</p>
                    <ds-button variant="secondary" size="sm" @click="addLic">{{ t('Přidat licenci') }}</ds-button>
                  </ds-accordion-item>
                  <ds-accordion-item value="validity" :title="t('Platnost adresy')">
                    <p class="note"><later-tag label="Sezónní adresa"></later-tag> {{ t('Nepovinné. Mimo toto období se adresa v objednávce nenabízí, například sklad v zimě nebo zahrádka v létě.') }}</p>
                    <div class="row2"><field label="Adresa platí od" type="date" v-model="f.validFrom"></field><field label="Adresa platí do" type="date" v-model="f.validTo" :error="f.err.valid"></field></div>
                  </ds-accordion-item>
                  <ds-accordion-item v-if="!f.id" value="copy" :title="t('Zkopírovat přístup z jiné adresy')">
                    <p class="note"><later-tag></later-tag> {{ t('Kolegové, kteří nakupují na vybranou adresu, budou moct nakupovat i na tuto.') }}</p>
                    <sel-field label="Zkopírovat přístup z jiné adresy" v-model="f.copyFrom" :options="otherAddr" placeholder="Nekopírovat"></sel-field>
                  </ds-accordion-item>
                </ds-accordion>
                <button type="submit" hidden tabindex="-1"></button>
              </form>
              <template #actions="{ close }">
                <ds-button size="lg" @click="submit">{{ t('Uložit') }}</ds-button>
                <ds-button size="lg" variant="ghost" @click="close">{{ t('Zrušit') }}</ds-button>
              </template>
            </ds-drawer>
          </template>
        </page-state>`
    }
  });
})();
