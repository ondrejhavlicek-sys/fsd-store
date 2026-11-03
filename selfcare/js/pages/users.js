/* copied from fsd-selfcare @ f2a58c7 (js/pages/users.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Uživatelé: four roles, location access, status and activity, purchase limit + approval (later), invitation flow */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  const phoneOk = v => !v || /^\+?[\d\s]{9,16}$/.test(v);
  const STATUS = { active: ['Aktivní', 'green'], invited: ['Pozvánka odeslána', 'neutral'], blocked: ['Deaktivovaný', 'red'] };
  const wide = r => r === 'owner' || r === 'admin';
  const kc = n => n.toLocaleString('cs-CZ').replace(/\s/g, ' ') + ' Kč';
  const owners = () => App.S.users.filter(x => x.role === 'owner' && x.status !== 'blocked');

  const sitesText = u => {
    if (wide(u.role) || u.addresses === 'all') return 'Všechny dodací adresy';
    return u.addresses.length ? u.addresses.map(id => t(App.addressName(id))).join(', ') : 'Žádná dodací adresa';
  };

  App.register('users', {
    label: 'Uživatelé', icon: 'Users', admin: true,
    comp: {
      setup() {
        const list = computed(() => App.list(App.S.users));
        const f = reactive({ open: false, id: null, email: '', first: '', last: '', phone: '', role: 'buyer', scope: 'all', addresses: [], limit: '', approval: false, approver: '', err: {} });
        const roles = computed(() => Object.keys(MockData.roles).filter(k => k !== 'owner' || App.isOwner()).reduce((o, k) => (o[k] = MockData.roles[k], o), {}));
        const approvers = computed(() => App.S.users.filter(u => wide(u.role) && u.status === 'active').map(u => ({ value: u.id, label: (u.first + ' ' + u.last).trim() || u.email })));
        const locked = u => u.role === 'owner' && !App.isOwner();
        const openForm = u => {
          const all = !u || wide(u.role) || u.addresses === 'all';
          Object.assign(f, { open: true, id: u ? u.id : null, err: {}, email: u ? u.email : '', first: u ? u.first : '', last: u ? u.last : '', phone: u ? u.phone : '',
            role: u ? u.role : 'buyer', scope: all ? 'all' : 'some', addresses: all ? [] : u.addresses.slice(), limit: u && u.limit ? String(u.limit) : '', approval: u ? !!u.approval : false, approver: u ? u.approver : '' });
        };
        const collect = base => {
          base.first = f.first.trim(); base.last = f.last.trim(); base.phone = f.phone.trim(); base.role = f.role;
          base.addresses = wide(f.role) || f.scope === 'all' ? 'all' : f.addresses.slice();
          base.limit = f.role === 'buyer' && f.limit ? +f.limit : null; base.approval = f.role === 'buyer' && !!f.limit && f.approval; base.approver = base.approval ? f.approver : '';
        };
        const submit = () => {
          f.err = {}; const c = App.S.company;
          if (!phoneOk(f.phone)) return f.err = { phone: 'Zadejte telefon ve tvaru +420 777 000 111.' };
          if (f.limit && !(+f.limit > 0)) return f.err = { limit: 'Zadejte limit jako kladné číslo v korunách.' };
          if (f.limit && f.approval && !f.approver) return f.err = { approver: 'Vyberte, kdo objednávky nad limit schvaluje.' };
          if (!f.id) {
            const email = f.email.trim().toLowerCase();
            if (!emailOk(email)) return f.err = { email: 'Zadejte e-mail ve tvaru jmeno@firma.cz.' };
            if (App.S.users.some(u => u.email === email)) return f.err = { email: 'Tento kolega už ve firmě je.' };
            if (c.onlyCompanyEmail && !c.domains.includes(email.split('@')[1])) return f.err = { email: 'Použijte firemní e-mail (' + c.domains.map(x => '@' + x).join(', ') + ').' };
            const u = { id: 'u' + Date.now(), email, status: 'invited', lastActive: '', gdpr: null, marketing: { on: false, channels: [], date: '' } }; collect(u); App.S.users.push(u);
            f.open = false; toast('Pozvánka byla odeslána na ' + email + '.');
          } else {
            const u = App.S.users.find(x => x.id === f.id);
            if (u.role === 'owner' && f.role !== 'owner' && owners().length < 2) return f.err = { role: 'Ve firmě musí zůstat alespoň jeden vlastník. Nejdřív určete vlastníkem jiného kolegu.' };
            collect(u); f.open = false; toast('Změny jsou uložené.');
          }
        };
        const toggleAddr = (id, on) => { f.addresses = on ? f.addresses.concat(id) : f.addresses.filter(x => x !== id); };
        const resend = u => toast('Pozvánka byla odeslána znovu na ' + u.email + '.');
        const block = u => {
          if (u.status === 'blocked') { u.status = 'active'; return toast('Kolega je znovu aktivní.'); }
          if (u.role === 'owner' && owners().length < 2)
            return Acct.confirm({ title: 'Vlastníka nelze deaktivovat', text: 'Ve firmě musí zůstat alespoň jeden aktivní vlastník. Nejdřív určete vlastníkem jiného kolegu.', cancel: 'Rozumím' });
          Acct.confirm({ title: 'Deaktivovat kolegu?', text: 'Kolega se nebude moct přihlásit ani nakupovat. Znovu ho aktivovat můžete kdykoli.', label: 'Deaktivovat', danger: true,
            onYes: () => { u.status = 'blocked'; toast('Kolega je deaktivovaný.'); } });
        };
        const del = u => {
          if (u.role === 'owner' && owners().length + (u.status === 'blocked' ? 1 : 0) < 2)
            return Acct.confirm({ title: 'Vlastníka nelze odebrat', text: 'Ve firmě musí zůstat alespoň jeden vlastník. Nejdřív určete vlastníkem jiného kolegu.', cancel: 'Rozumím' });
          Acct.confirm({ title: 'Odebrat kolegu?', text: u.email + ' ztratí přístup do firemního účtu. Jeho objednávky zůstanou zachované.', label: 'Odebrat', danger: true,
            onYes: () => { App.S.users = App.S.users.filter(x => x.id !== u.id); toast('Kolega je odebraný.'); } });
        };
        const name = u => (u.first + ' ' + u.last).trim();
        return { App, I, t, list, f, roles, approvers, STATUS, wide, kc, sitesText, locked, name, openForm, submit, toggleAddr, resend, block, del, MockData };
      },
      template: `
        <page-state title="Uživatelé">
          <template #action><ds-button @click="openForm(null)">{{ t('Přidat kolegu') }}</ds-button></template>
          <template #default>
            <ds-message v-if="App.S.company.onlyCompanyEmail" variant="info" class="mb" :title="t('Kolegy půjde přidat jen s firemním e-mailem')"
              :body="t('Povolené domény:') + ' ' + App.S.company.domains.map(d => '@' + d).join(', ') + '. ' + t('Změníte je ve Firemních informacích.')">
              <template #action><ds-button variant="secondary" size="sm" as="a" href="#/ucet/company">{{ t('Otevřít Firemní informace') }}</ds-button></template>
            </ds-message>
            <ds-table v-if="list.length" class="acct-tbl">
              <thead><tr><th>{{ t('E-mail') }}</th><th>{{ t('Jméno') }}</th><th>{{ t('Role') }}</th><th>{{ t('Dodací adresy') }}</th><th>{{ t('Stav') }}</th><th><span class="sr">{{ t('Akce kolegy') }}</span></th></tr></thead>
              <tbody>
                <tr v-for="u in list" :key="u.id">
                  <td :data-label="t('E-mail')"><span class="email">{{ u.email }}</span></td>
                  <td :data-label="t('Jméno')">{{ name(u) || '—' }}<span v-if="u.phone" class="cell-sub">{{ u.phone }}</span></td>
                  <td :data-label="t('Role')">{{ t(MockData.roles[u.role].label) }}
                    <span v-if="u.limit" class="cell-sub">{{ t('Limit objednávky') }}: {{ kc(u.limit) }}<later-tag></later-tag></span></td>
                  <td :data-label="t('Dodací adresy')">{{ t(sitesText(u)) }}</td>
                  <td :data-label="t('Stav')"><product-tag :variant="STATUS[u.status][1]" :label="t(STATUS[u.status][0])"></product-tag>
                    <span v-if="u.status === 'invited'" class="cell-sub">{{ t('Do ověření e-mailu nemůže objednávat.') }}</span>
                    <span v-else-if="u.lastActive" class="cell-sub">{{ t('Poslední aktivita') }}: {{ u.lastActive }}</span></td>
                  <td class="acts-td">
                    <span v-if="locked(u)" class="note" :title="t('Vlastníka může měnit jen vlastník.')">{{ t('Jen vlastník') }}</span>
                    <ds-dropdown-menu v-else align="end">
                      <template #trigger><ds-icon-button variant="ghost" size="sm" :icon="I.KebabMenuSolid" :aria-label="t('Akce kolegy') + ': ' + u.email"></ds-icon-button></template>
                      <ds-dropdown-menu-item :label="t('Upravit')" @select="openForm(u)"></ds-dropdown-menu-item>
                      <ds-dropdown-menu-item v-if="u.status === 'invited'" :label="t('Odeslat znovu')" @select="resend(u)"></ds-dropdown-menu-item>
                      <ds-dropdown-menu-item v-else :label="u.status === 'blocked' ? t('Aktivovat') : t('Deaktivovat')" @select="block(u)"></ds-dropdown-menu-item>
                      <ds-dropdown-menu-item :label="t('Odebrat')" class="acct-danger-text" @select="del(u)"></ds-dropdown-menu-item>
                    </ds-dropdown-menu>
                  </td>
                </tr>
              </tbody>
            </ds-table>
            <empty-state v-else title="Zatím tu nemáte žádné kolegy" text="Přidejte kolegu a určete, co smí ve firemním účtu dělat.">
              <ds-button @click="openForm(null)">{{ t('Přidat kolegu') }}</ds-button>
            </empty-state>

            <form-modal v-model:open="f.open" :title="f.id ? 'Upravit kolegu' : 'Přidat kolegu'" :subtitle="f.id ? undefined : 'Kolega dostane e-mail s jednorázovým odkazem. Má vlastní přihlášení a do ověření e-mailu nemůže objednávat.'"
              :submit-label="f.id ? 'Uložit' : 'Odeslat pozvánku'" @submit="submit">
              <div v-if="f.id" class="fld2"><span class="lbl-t">{{ t('E-mail') }}</span><b>{{ f.email }}</b></div>
              <field v-else label="E-mail kolegy" type="email" req v-model="f.email" placeholder="např. jmeno@firma.cz" :error="f.err.email"></field>
              <div class="row2"><field label="Jméno" v-model="f.first"></field><field label="Příjmení" v-model="f.last"></field></div>
              <field label="Telefon" type="tel" v-model="f.phone" placeholder="+420 777 000 111" :error="f.err.phone"></field>
              <fieldset class="fset">
                <legend class="lbl-t">{{ t('Role') }}</legend>
                <ds-radio-group v-model="f.role" class="radios">
                  <ds-inline-field-label v-for="(r, k) in roles" :key="k" class="acct-radio" :for="'role-' + k">
                    <ds-radio :id="'role-' + k" :value="k"></ds-radio>
                    <template #label><span><b>{{ t(r.label) }}</b><span class="rdesc">{{ t(r.desc) }}</span></span></template>
                  </ds-inline-field-label>
                </ds-radio-group>
                <ds-field-message v-if="f.err.role" role="alert" class="fld-err">{{ t(f.err.role) }}</ds-field-message>
              </fieldset>
              <fieldset v-if="!wide(f.role)" class="fset">
                <legend class="lbl-t">{{ t('Dodací adresy, pro které smí nakupovat') }}</legend>
                <ds-radio-group v-model="f.scope" class="radios">
                  <ds-inline-field-label class="acct-radio" for="scope-all"><ds-radio id="scope-all" value="all"></ds-radio><template #label>{{ t('Všechny dodací adresy') }}</template></ds-inline-field-label>
                  <ds-inline-field-label class="acct-radio" for="scope-some"><ds-radio id="scope-some" value="some"></ds-radio><template #label>{{ t('Jen vybrané dodací adresy') }}</template></ds-inline-field-label>
                </ds-radio-group>
                <div v-if="f.scope === 'some'" class="site-pick">
                  <ds-inline-field-label v-for="s in App.S.addresses" :key="s.id" class="acct-radio" :for="'sp-' + s.id">
                    <ds-checkbox :id="'sp-' + s.id" :checked="f.addresses.includes(s.id)" @update:checked="toggleAddr(s.id, $event)"></ds-checkbox>
                    <template #label>{{ App.addrTitle(s) }}<span v-if="s.blocked" class="muted"> ({{ t('deaktivovaná') }})</span></template>
                  </ds-inline-field-label>
                </div>
              </fieldset>
              <div v-if="f.role === 'buyer'" class="sub-sec">
                <h3>{{ t('Limit objednávky') }} <later-tag></later-tag></h3>
                <field label="Nejvyšší hodnota jedné objednávky (Kč)" type="number" v-model="f.limit" placeholder="např. 20000" :error="f.err.limit" hint="Nepovinné. Nákupčí nad limit nemůže objednat bez schválení."></field>
                <ds-inline-field-label v-if="f.limit" class="acct-radio" for="appr-on"><ds-switch id="appr-on" :checked="f.approval" @update:checked="f.approval = $event"></ds-switch><template #label>{{ t('Objednávky nad limit schvaluje vybraná osoba') }}</template></ds-inline-field-label>
                <sel-field v-if="f.limit && f.approval" label="Objednávky nad limit schvaluje" v-model="f.approver" :options="approvers" :error="f.err.approver"></sel-field>
              </div>
            </form-modal>
          </template>
        </page-state>`
    }
  });
})();
