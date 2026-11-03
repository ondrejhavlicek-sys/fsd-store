/* copied from fsd-selfcare @ f2a58c7 (js/account.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Company account (self-care) area built from Fresh components (one persistent Vue island).
   Shell: breadcrumbs, sidebar (company block + grouped navigation), mobile hub, page host, shared dialogs.
   Pages register themselves with App.register(id, { label, icon, comp, ... }) in js/pages/*.js.
   Data: App.S is a Vue reactive object, so templates re-render when the (vanilla) shell or pages mutate it. */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons;
  /* reading App.S.lang inside templates makes every t() call re-translate on a language switch */
  const t = s => { void App.S.lang; return I18N.t(s); };

  const state = reactive({ route: { id: 'company', hub: false }, mobile: false, dlg: null, req: { open: false, topic: '', note: '', err: '' } });

  /* sidebar groups (kosik.cz profile structure; Dodací adresy and Role are our additions in "Firemní profil") */
  const GROUPS = [
    { key: 'company', label: 'Firemní profil', pages: ['company', 'authorized', 'addresses', 'users', 'roles', 'payments', 'contracts', 'terms'] },
    { key: 'shop', label: 'Nakupování', pages: ['orders', 'credits', 'savings', 'lists', 'favorites'] },
    { key: 'user', label: 'Uživatelský účet', pages: ['personal', 'security', 'privacy', 'notifications'] }
  ];
  /* nav entries that are not account pages */
  const EXTRA = { lists: { label: 'Nákupní seznamy', icon: 'ShoppingListSolid', href: '#/seznamy' } };
  const meta = id => EXTRA[id] || App.pages[id];
  /* page access: `admin` = owner + account administrator; `roles` = explicit list */
  const isLocked = p => p.roles ? !p.roles.includes(App.S.role) : !!(p.admin && !App.isAdmin());

  /* ---- shared small components ---- */
  const PageHead = {
    props: { title: String },
    setup: () => ({ t }),
    template: `<div class="head"><h1>{{ t(title) }}</h1><div class="head-act"><slot></slot></div></div>`
  };

  const EmptyState = {
    props: { title: String, text: String },
    setup: () => ({ t }),
    template: `<div class="empty"><h2>{{ t(title) }}</h2><p>{{ t(text) }}</p><slot></slot></div>`
  };

  /* list-state wrapper: loading / error scenarios for every page */
  const PageState = {
    props: { title: String },
    setup() {
      return { App, t, retry: () => { App.S.scenario = 'normal'; App.render(); } };
    },
    template: `
      <div>
        <page-head :title="title"><slot v-if="App.S.scenario !== 'loading' && App.S.scenario !== 'error'" name="action"></slot></page-head>
        <div v-if="App.S.scenario === 'loading'" class="loading" role="status" :aria-label="t('Načítání')"><i></i><i></i><i></i></div>
        <ds-message v-else-if="App.S.scenario === 'error'" variant="error" :title="t('Stránku se nepodařilo načíst')"
          :body="t('Zkuste to prosím znovu. Pokud potíže přetrvají, zavolejte nám na +420 271 005 005.')">
          <template #action><ds-button variant="secondary" size="sm" @click="retry">{{ t('Zkusit znovu') }}</ds-button></template>
        </ds-message>
        <slot v-else></slot>
      </div>`,
    components: { PageHead }
  };

  /* modal for forms and confirmations: Fresh AdaptableModal (modal on desktop, bottom sheet on mobile).
     Fields stay in the default slot; `submit` may return { field, msg } or a string, shown by the host page. */
  const FormModal = {
    props: { open: Boolean, title: String, subtitle: String, submitLabel: { type: String, default: 'Uložit' }, cancelLabel: { type: String, default: 'Zrušit' },
      danger: Boolean, hideSubmit: Boolean, size: { type: String, default: 'md' } },
    emits: ['update:open', 'submit'],
    setup(props, { emit }) { return { t, emit }; },
    template: `
      <ds-adaptable-modal :open="open" @update:open="emit('update:open', $event)" :title="t(title)" :subtitle="subtitle ? t(subtitle) : undefined" :size="size" scroll-body>
        <form novalidate @submit.prevent="emit('submit')"><slot></slot><button type="submit" hidden tabindex="-1"></button></form>
        <template #actions="{ close }">
          <ds-button v-if="!hideSubmit" size="lg" :class="danger && 'acct-danger'" @click="emit('submit')">{{ t(submitLabel) }}</ds-button>
          <ds-button size="lg" variant="ghost" @click="close">{{ t(cancelLabel) }}</ds-button>
        </template>
      </ds-adaptable-modal>`
  };

  /* labelled field with message: Fresh FieldLabel + TextField/Textarea + FieldMessage */
  const Field = {
    props: { label: String, modelValue: [String, Number], error: String, type: { type: String, default: 'text' }, placeholder: String, req: Boolean, id: String, textarea: Boolean, readonly: Boolean, hint: String },
    emits: ['update:modelValue'],
    setup() { return { t, uid: 'f' + Math.random().toString(36).slice(2, 8) }; },
    template: `
      <div class="fld2">
        <ds-field-label :for="id || uid" :invalid="!!error">{{ t(label) }}<span v-if="req" class="opt"> ({{ t('povinné') }})</span></ds-field-label>
        <ds-textarea v-if="textarea" :id="id || uid" :model-value="modelValue" :invalid="!!error" :rows="3" @update:model-value="$emit('update:modelValue', $event)"></ds-textarea>
        <ds-text-field v-else :id="id || uid" :type="type" :model-value="modelValue" :placeholder="placeholder ? t(placeholder) : undefined" :invalid="!!error" :readonly="readonly" autocomplete="off"
          @update:model-value="$emit('update:modelValue', $event)"></ds-text-field>
        <ds-field-message v-if="error" role="alert" class="fld-err">{{ t(error) }}</ds-field-message>
        <p v-else-if="hint" class="fld-hint">{{ t(hint) }}</p>
      </div>`
  };


  /* tag marking non-MVP items ("Později", "Nice to have") and unconfirmed fields ("Ověřit") */
  const LaterTag = {
    props: { label: { type: String, default: 'Později' } },
    setup: () => ({ t }),
    template: `<product-tag class="later-tag" variant="neutral" :label="t(label)"></product-tag>`
  };

  /* block set by makro staff (not editable by the customer): lock icon, "Spravuje makro" hint, "Požádat o změnu" */
  const StaffCard = {
    props: { title: String, topic: String, noRequest: Boolean },
    setup: () => ({ t, I, App, request: topic => { state.req = { open: true, topic, note: '', err: '' }; } }),
    template: `
      <section class="acct-card staff">
        <div class="rows">
          <div class="staff-h"><h2>{{ t(title) }}</h2><span class="staff-lock"><component :is="I.PadlockSolid" class="lock-ico"></component>{{ t('Spravuje makro') }}</span></div>
          <slot></slot>
        </div>
        <ds-button v-if="App.isAdmin() && !noRequest" variant="secondary" size="sm" @click="request(topic || title)">{{ t('Požádat o změnu') }}</ds-button>
      </section>`
  };


  /* labelled Fresh Select; options: [{ value, label }] (labels are Czech source strings) */
  const SelField = {
    props: { label: String, modelValue: [String, Number, null], options: Array, error: String, placeholder: { type: String, default: 'Vyberte' } },
    emits: ['update:modelValue'],
    setup(props) {
      const opts = computed(() => props.options.map(o => ({ value: o.value, label: t(o.label) })));
      return { t, opts, uid: 's' + Math.random().toString(36).slice(2, 8) };
    },
    template: `
      <div class="fld2">
        <ds-field-label :for="uid" :invalid="!!error">{{ t(label) }}</ds-field-label>
        <ds-select :id="uid" :model-value="modelValue" :options="opts" option-value="value" option-label="label" :invalid="!!error" popover
            :aria-label="t(label)" :labels="{ placeholder: t(placeholder) }" @update:model-value="$emit('update:modelValue', $event)"></ds-select>
        <ds-field-message v-if="error" role="alert" class="fld-err">{{ t(error) }}</ds-field-message>
      </div>`
  };

  const initials = u => ((u.first || '').charAt(0) + (u.last || '').charAt(0)).toUpperCase() || (u.email || '?').charAt(0).toUpperCase();
  const fullName = u => (u.first + ' ' + u.last).trim() || u.email;

  /* administration menu: company block, shopping, user block (same order and labels as the header account menu) */
  const SideNav = {
    setup() {
      const c = computed(() => App.S.company);
      const me = computed(() => App.me());
      const cur = computed(() => state.route.hub ? '' : state.route.id);
      const count = id => id === 'users' ? App.S.users.length : null;
      const href = id => (meta(id).href || '#/ucet/' + id);
      const lock = id => !!(App.pages[id] && isLocked(App.pages[id]));
      const edit = () => { location.hash = '#/ucet/company'; };
      return { t, c, me, cur, count, href, lock, meta, GROUPS, I, edit, App, state, initials, fullName, MockData };
    },
    template: `
      <aside class="side" :aria-label="t('Firemní účet')">
        <template v-for="g in GROUPS" :key="g.key">
          <div v-if="g.key === 'company'" class="who-box">
            <div class="who"><div><b>{{ c.name }}</b><span>{{ t('IČO') }}: {{ c.ico }} · {{ t(MockData.roles[App.S.role].label) }}</span></div>
              <ds-icon-button v-if="App.isAdmin()" variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit firemní informace')" @click="edit"></ds-icon-button></div>
          </div>
          <div v-if="g.key === 'user'" class="who-box user-box">
            <div class="who"><span class="avatar" aria-hidden="true">{{ initials(me) }}</span><div><b>{{ fullName(me) }}</b><span>{{ me.email }}</span></div></div>
          </div>
          <nav class="nav-group" :aria-label="t(g.label)">
            <h3>{{ t(g.label) }}</h3>
            <a v-for="id in g.pages" :key="id" class="nav-a" :href="href(id)" :aria-current="cur === id ? 'page' : undefined">
              <component :is="I[meta(id).icon]" class="nav-ico"></component>
              <span class="nav-lbl">{{ t(meta(id).label) }}</span>
              <span v-if="count(id) != null" class="nav-cnt">{{ count(id) }}</span>
              <component v-if="lock(id)" :is="I.Padlock" class="nav-lock" :aria-label="t('Omezený přístup')"></component>
            </a>
          </nav>
        </template>
      </aside>`
  };

  /* confirmation / info dialog shared by all pages: Acct.confirm({ title, text, label, danger, onYes }) */
  const SharedDialog = {
    setup() {
      const d = computed(() => state.dlg);
      const yes = () => { const f = state.dlg.onYes; state.dlg = null; if (f) f(); };
      return { d, yes, state, t };
    },
    template: `
      <ds-adaptable-modal :open="!!d" @update:open="v => { if (!v) state.dlg = null }" :title="d ? t(d.title) : ''" :subtitle="d && d.text ? t(d.text) : undefined" size="sm">
        <template #actions="{ close }">
          <ds-button v-if="d && d.label" size="lg" :class="d.danger && 'acct-danger'" @click="yes">{{ t(d.label) }}</ds-button>
          <ds-button size="lg" variant="ghost" @click="close">{{ t(d && d.cancel || 'Zrušit') }}</ds-button>
        </template>
      </ds-adaptable-modal>`
  };

  const Crumbs = {
    setup() {
      const items = computed(() => {
        const r = state.route, out = [{ text: t('Hlavní stránka'), url: '#/' }, { text: t('Firemní účet'), url: '#/ucet/company' }];
        if (!r.hub && App.pages[r.id]) out.push({ text: t(App.pages[r.id].label), url: '#/ucet/' + r.id });
        return out;
      });
      return { items };
    },
    template: `<ds-breadcrumbs :items="items" items-as="a" without-home class="acct-crumbs"></ds-breadcrumbs>`
  };

  const AccountArea = {
    components: { SideNav, SharedDialog, Crumbs, PageHead },
    setup() {
      const comp = computed(() => { const p = App.pages[state.route.id]; return p && p.comp; });
      const locked = computed(() => { const p = App.pages[state.route.id]; return p && isLocked(p); });
      const sendRequest = () => {
        if (!state.req.note.trim()) return state.req.err = 'Napište nám, co chcete změnit.';
        state.req.open = false; UI.toast('Žádost jsme poslali vašemu obchodnímu zástupci.');
      };
      return { state, comp, locked, t, App, I, sendRequest };
    },
    template: `
      <div class="acct" :class="{ 'on-hub': state.route.hub }">
        <crumbs v-if="!state.mobile"></crumbs>
        <div class="shell">
          <side-nav v-if="!state.mobile || state.route.hub"></side-nav>
          <main v-if="!state.mobile || !state.route.hub" class="content" id="main">
            <a v-if="state.mobile" class="back" href="#/ucet"><i aria-hidden="true">←</i>{{ t('Firemní účet') }}</a>
            <template v-if="locked">
              <page-head :title="App.pages[state.route.id].label"></page-head>
              <ds-message variant="warning" :title="t('K této stránce nemáte oprávnění')"
                :body="t('Zobrazit ji může jen správce firmy. Požádejte správce o změnu role nebo o úpravu, kterou potřebujete.')"></ds-message>
            </template>
            <component v-else-if="comp" :is="comp" :key="state.route.id"></component>
          </main>
        </div>
        <shared-dialog></shared-dialog>
        <form-modal v-model:open="state.req.open" title="Požádat o změnu" :subtitle="state.req.topic" submit-label="Odeslat žádost" @submit="sendRequest">
          <field label="Co chcete změnit?" textarea v-model="state.req.note" :error="state.req.err"></field>
        </form-modal>
      </div>`
  };

  const host = document.createElement('div');
  host.id = 'acct-host';
  host.setAttribute('data-no-i18n', '');
  let mounted = false;

  window.Acct = {
    state, t, isLocked, initials, fullName, PageHead, EmptyState, PageState, FormModal, Field, LaterTag, StaffCard,
    sync(r) { state.route = { id: r.id || 'company', hub: !!r.hub }; state.mobile = matchMedia('(max-width: 768px)').matches; },
    confirm(o) { state.dlg = o; },
    detach() { if (host.parentNode) host.remove(); },
    attach(slot) {
      if (!slot) return;
      slot.replaceWith(host);
      if (!mounted) {
        mounted = true;
        Fresh.mount(AccountArea, host, app => {
          app.component('page-head', PageHead); app.component('empty-state', EmptyState); app.component('page-state', PageState);
          app.component('form-modal', FormModal); app.component('field', Field); app.component('later-tag', LaterTag); app.component('sel-field', SelField); app.component('staff-card', StaffCard);
          (Acct.register || []).forEach(f => f(app));
        });
      }
    }
  };
  window.Acct.register = [];
})();
