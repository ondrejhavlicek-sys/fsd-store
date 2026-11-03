/* Company account area (routes /ucet and /ucet/:id): hosts the Fresh island copied from the fsd-selfcare prototype
   (selfcare/js/account.js, pages in selfcare/js/pages/) inside the store header and footer, plus the small
   "Scénáře prototypu" panel (role of the logged-in user, state of lists, reset of mock data). See docs/PROTOTYPE-NOTES.md.
   The island is mounted once and moved in and out of the page: the wrapper below is owned by Vue and stays empty,
   the placeholder inside it is created by hand, so Vue patching never touches the island's DOM. Styles: css/mk-account.css
   and selfcare/css/*.css (scoped to .sc). */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const mql = matchMedia('(max-width: 768px)')

  /* same rules as selfcare: no id -> company page on desktop, hub (menu) page on phones; unknown id -> company page */
  const resolve = (id) => (!id ? (mql.matches ? { hub: true } : { id: 'company' }) : { id: window.App.pages[id] ? id : 'company' })
  Makro.accountTitle = (id) => { const r = resolve(id); return r.hub ? 'Firemní účet' : window.App.pages[r.id].label }

  /* the island outlives the page (it is detached, not destroyed): a dialog or drawer that is still open (browser Back) would stay on top
     of the store and block it, so close what is open before leaving. Escape dismisses the topmost Fresh layer. */
  const closeOverlays = () => {
    const A = window.Acct
    A.state.dlg = null
    A.state.req.open = false
    for (let i = 0; i < 3 && document.querySelector('body > .sc[role="dialog"], body > .sc [role="dialog"]'); i++) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true, cancelable: true }))
    }
  }

  const ROLES = [['owner', 'Vlastník'], ['admin', 'Správce účtu'], ['buyer', 'Nákupčí'], ['viewer', 'Prohlížející']]
  const STATES = [['normal', 'Běžný'], ['empty', 'Prázdný'], ['loading', 'Načítání'], ['error', 'Chyba']]

  /* role and list-state switch of the prototype, shown on the account routes only */
  const Scenarios = {
    setup() {
      const S = window.App.S
      return { S, ROLES, STATES, reset: () => { window.App.resetData(); Makro.toast('Ukázková data jsou obnovena.') } }
    },
    template: `
      <section class="mk-scn" aria-label="Scénáře prototypu">
        <button type="button" class="mk-scn-t" :aria-expanded="S.scn" aria-controls="mk-scn-body" @click="S.scn = !S.scn"><span aria-hidden="true">{{ S.scn ? '▾' : '▸' }}</span> Scénáře prototypu</button>
        <div v-if="S.scn" id="mk-scn-body" class="mk-scn-body">
          <label>Role přihlášeného uživatele
            <select v-model="S.role"><option v-for="r in ROLES" :key="r[0]" :value="r[0]">{{ r[1] }}</option></select>
          </label>
          <label>Stav seznamů
            <select v-model="S.scenario"><option v-for="r in STATES" :key="r[0]" :value="r[0]">{{ r[1] }}</option></select>
          </label>
          <button type="button" class="mk-scn-reset" @click="reset">Obnovit ukázková data</button>
        </div>
      </section>`,
  }

  Makro.AccountPage = {
    components: { MakroAccountScenarios: Scenarios },
    props: { id: { type: String, default: '' } },
    setup(props) {
      const box = Vue.ref(null)
      const sync = () => window.Acct.sync(resolve(props.id))
      const onMq = () => { window.AcctMenu.sync(); sync() }
      Vue.onMounted(() => {
        const slot = document.createElement('div')
        box.value.appendChild(slot)
        sync()
        window.Acct.attach(slot)
        mql.addEventListener('change', onMq)
      })
      Vue.watch(() => props.id, sync)
      Vue.onBeforeUnmount(() => {
        mql.removeEventListener('change', onMq)
        closeOverlays()
        window.Acct.detach()
      })
      return { box }
    },
    template: `
      <div class="mk-wrap mk-page mk-account sc">
        <div class="mk-account-in" ref="box"></div>
        <makro-account-scenarios></makro-account-scenarios>
      </div>`,
  }
})()
