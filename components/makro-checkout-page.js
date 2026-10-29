/* Checkout (order recap) and order confirmation. No Figma frame; fields follow the data model draft hooks (all unconfirmed):
   ORD-43 delivery address and slot of the selected site, ORD-01 recipient contact (pre-filled, editable per order),
   ORD-42 PO number, ORD-41 cost centre, REG-08 allowed payment methods, ORD-32 returnable packaging as information only,
   REG-14/15 purchase limit with approval flow. Routes: /pokladna and /objednavka. Styles: css/checkout.css. */
;(function () {
  const Makro = (window.Makro = window.Makro || {})
  const base = () => window.MAKRO_BASE || ''
  const STEPS = ['Košík', 'Rekapitulace a platba', 'Hotovo']

  const Steps = {
    props: { current: Number },
    setup: () => ({ STEPS }),
    template: `
      <ol class="mk-steps" aria-label="Postup objednávky">
        <li v-for="(s, i) in STEPS" :key="s" :class="{ done: i < current, on: i === current }" :aria-current="i === current ? 'step' : undefined"><span class="mk-step-n">{{ i < current ? '✓' : i + 1 }}</span>{{ s }}</li>
      </ol>`,
  }

  Makro.CheckoutPage = {
    components: { MakroSteps: Steps },
    setup() {
      const store = Makro.store
      const c = store.checkout
      const sum = Vue.computed(() => Makro.summary())
      const lines = Vue.computed(() => Object.keys(store.cart).filter((id) => store.cart[id] > 0).map((id) => ({ p: Makro.byId(id), q: store.cart[id] })))
      const allLines = Vue.ref(false)
      const shown = Vue.computed(() => (allLines.value ? lines.value : lines.value.slice(0, 3)))
      const needsApproval = Vue.computed(() => sum.value.totalNet > Makro.user.limit)
      const errors = Vue.reactive({})
      const touched = Vue.ref(false)

      const validate = () => {
        const e = {}
        if (!c.name.trim()) e.name = 'Vyplňte jméno kontaktní osoby.'
        if (!/^\+?[\d\s]{9,16}$/.test(c.phone.trim())) e.phone = 'Zadejte telefon ve tvaru +420 777 123 456.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())) e.email = 'Zadejte platný e-mail, například jmeno@firma.cz.'
        if (c.note.length > 200) e.note = 'Poznámka může mít nejvýše 200 znaků.'
        if (!store.terms) e.terms = 'Chcete-li pokračovat, přijměte prosím podmínky.'
        Object.keys(errors).forEach((k) => delete errors[k])
        Object.assign(errors, e)
        return e
      }
      Vue.watch(() => [c.name, c.phone, c.email, c.note, store.terms], () => touched.value && validate())

      const submit = async () => {
        touched.value = true
        const e = validate()
        const first = Object.keys(e)[0]
        if (first) {
          await Vue.nextTick()
          const el = document.getElementById('f-' + first)
          if (el) { el.scrollIntoView({ block: 'center' }); el.focus() }
          return
        }
        Makro.placeOrder()
        location.hash = '#/objednavka'
      }
      const soon = (what) => Makro.toast(what + ' zatím není součástí prototypu.')
      return { store, c, sum, lines, shown, allLines, needsApproval, errors, submit, soon, user: Makro.user, payments: Makro.payments, delivery: Makro.delivery, kc: Makro.kc, src: (n) => base() + 'assets/' + n }
    },
    template: `
      <main class="mk-wrap mk-page mk-checkout-page" data-tid="checkout-page">
        <makro-steps :current="1"></makro-steps>
        <h1 class="mk-title">Rekapitulace objednávky</h1>

        <div v-if="!sum.lines" class="mk-card mk-cart-empty">
          <h2>Košík je prázdný</h2>
          <p>Není co objednat. Přidejte produkty z nabídky.</p>
          <a class="mk-btn" href="#/">Pokračovat v nákupu</a>
        </div>

        <form v-else class="mk-co-grid" novalidate @submit.prevent="submit">
          <div class="mk-co-main">
            <section class="mk-card" aria-labelledby="h-del">
              <div class="mk-co-h"><h2 id="h-del">Doručení</h2><a href="#/kosik" class="mk-more">Změnit</a></div>
              <dl class="mk-co-facts">
                <div><dt>Adresa provozovny</dt><dd>{{ delivery.address }}</dd></div>
                <div><dt>Datum a čas doručení</dt><dd>{{ delivery.date }}, {{ delivery.slot }}</dd></div>
              </dl>
              <p class="mk-note">Záloha za obaly se v objednávce neúčtuje. Obaly se zálohou vám případně předá řidič při doručení.</p>
            </section>

            <section class="mk-card" aria-labelledby="h-contact">
              <h2 id="h-contact">Kontakt pro doručení</h2>
              <p class="mk-note">Kontaktní osoba, které řidič zavolá. Platí jen pro tuto objednávku.</p>
              <div class="mk-co-fields">
                <div class="mk-fld"><label for="f-name">Jméno a příjmení</label><input id="f-name" v-model="c.name" type="text" autocomplete="name" :aria-invalid="!!errors.name" :aria-describedby="errors.name ? 'e-name' : undefined"><p v-if="errors.name" id="e-name" class="mk-err">{{ errors.name }}</p></div>
                <div class="mk-fld"><label for="f-phone">Telefon</label><input id="f-phone" v-model="c.phone" type="tel" autocomplete="tel" :aria-invalid="!!errors.phone" :aria-describedby="errors.phone ? 'e-phone' : undefined"><p v-if="errors.phone" id="e-phone" class="mk-err">{{ errors.phone }}</p></div>
                <div class="mk-fld mk-fld-wide"><label for="f-email">E-mail</label><input id="f-email" v-model="c.email" type="email" autocomplete="email" :aria-invalid="!!errors.email" :aria-describedby="errors.email ? 'e-email' : undefined"><p v-if="errors.email" id="e-email" class="mk-err">{{ errors.email }}</p></div>
              </div>
            </section>

            <section class="mk-card" aria-labelledby="h-ref">
              <h2 id="h-ref">Údaje k objednávce</h2>
              <p class="mk-note">Nepovinné. Uvedeme je na objednávce a faktuře.</p>
              <div class="mk-co-fields">
                <div class="mk-fld"><label for="f-po">Číslo objednávky zákazníka</label><input id="f-po" v-model="c.po" type="text" autocomplete="off" placeholder="např. PO-2026-0412"></div>
                <div class="mk-fld"><label for="f-cc">Nákladové středisko</label><input id="f-cc" v-model="c.costCenter" type="text" autocomplete="off" list="cost-centers" placeholder="např. Kuchyně"><datalist id="cost-centers"><option value="Kuchyně"></option><option value="Bar"></option><option value="Restaurace"></option><option value="Sklad"></option></datalist></div>
                <div class="mk-fld mk-fld-wide"><label for="f-note">Poznámka pro řidiče</label><textarea id="f-note" v-model="c.note" rows="3" maxlength="260" :aria-invalid="!!errors.note" placeholder="např. zadní vstup, volat 15 minut předem"></textarea><div class="mk-count-note">{{ c.note.length }}/200</div><p v-if="errors.note" id="e-note" class="mk-err">{{ errors.note }}</p></div>
              </div>
            </section>

            <section class="mk-card" aria-labelledby="h-pay">
              <h2 id="h-pay">Platba</h2>
              <p class="mk-note">Nabízíme jen platební metody, které máte pro svůj účet povolené.</p>
              <fieldset class="mk-pays">
                <legend class="mk-sr">Způsob platby</legend>
                <label v-for="m in payments" :key="m.id" class="mk-pay" :class="{ on: c.payment === m.id }">
                  <input type="radio" name="payment" :value="m.id" v-model="c.payment">
                  <span><b>{{ m.label }}<em v-if="m.preferred">Preferovaná</em></b><small>{{ m.text }}</small></span>
                </label>
              </fieldset>
            </section>
          </div>

          <aside class="mk-sum" aria-labelledby="h-os">
            <h2 id="h-os">Vaše objednávka</h2>
            <ul class="mk-mini">
              <li v-for="l in shown" :key="l.p.id"><img :src="l.p.image" alt="" width="40" height="40"><span class="n">{{ l.p.name }}</span><span class="q">{{ l.q }} ks</span></li>
            </ul>
            <button v-if="lines.length > 3" type="button" class="mk-link" @click="allLines = !allLines">{{ allLines ? 'Zobrazit méně' : 'Zobrazit všech ' + lines.length + ' položek' }}</button>
            <dl class="mk-sum-rows">
              <div><dt>Cena bez DPH</dt><dd>{{ kc(sum.goodsNet) }}</dd></div>
              <div><dt>Záloha za obaly</dt><dd>{{ kc(sum.returnable) }}</dd></div>
              <div :class="{ fee: sum.fee }"><dt>{{ sum.fee ? 'Poplatek za objednávku pod minimem' : 'Poplatky' }}</dt><dd>{{ kc(sum.fee) }}</dd></div>
              <div class="mk-sum-total"><dt>Celkem bez DPH<small>včetně zálohy za obaly a poplatků</small></dt><dd>{{ kc(sum.totalNet) }}</dd></div>
              <div><dt>DPH</dt><dd>{{ kc(sum.vat) }}</dd></div>
              <div class="mk-sum-grand"><dt>Celkem vč. DPH</dt><dd>{{ kc(sum.totalGross) }}</dd></div>
            </dl>

            <div v-if="needsApproval" class="mk-approval" role="status">
              <b>Objednávka přesahuje váš limit {{ kc(user.limit) }}.</b> Odešleme ji ke schválení správci účtu a teprve potom půjde do zpracování.
            </div>

            <label class="mk-terms"><input id="f-terms" type="checkbox" v-model="store.terms" :aria-invalid="!!errors.terms" :aria-describedby="errors.terms ? 'e-terms' : undefined"><span>Souhlasím se <a href="#" @click.prevent="soon('Smluvní podmínky')">Smluvními podmínkami</a> a <a href="#" @click.prevent="soon('Zásady ochrany osobních údajů')">Zásadami ochrany osobních údajů</a>.</span></label>
            <p v-if="errors.terms" id="e-terms" class="mk-terms-err" role="alert">{{ errors.terms }}</p>
            <button type="submit" class="mk-btn mk-btn-wide">{{ needsApproval ? 'Odeslat ke schválení' : 'Odeslat objednávku' }}</button>
            <a href="#/kosik" class="mk-back">Zpět do košíku</a>
          </aside>
        </form>
      </main>
    `,
  }

  Makro.OrderDonePage = {
    components: { MakroSteps: Steps },
    setup() {
      return { o: Vue.computed(() => Makro.store.placed), kc: Makro.kc, soon: (w) => Makro.toast(w + ' zatím není součástí prototypu.'), src: (n) => base() + 'assets/' + n }
    },
    template: `
      <main class="mk-wrap mk-page mk-done" data-tid="order-done-page">
        <makro-steps :current="3"></makro-steps>
        <div v-if="!o" class="mk-card mk-cart-empty">
          <h1 class="mk-title">Objednávku jsme nenašli</h1>
          <p>Pokud jste ji právě odeslali, najdete ji v přehledu objednávek.</p>
          <a class="mk-btn" href="#/">Zpět na úvodní stránku</a>
        </div>
        <template v-else>
          <div class="mk-done-hero" :class="{ wait: o.needsApproval }">
            <span class="mk-done-ico" aria-hidden="true">{{ o.needsApproval ? '⏳' : '✓' }}</span>
            <div>
              <h1 class="mk-title">{{ o.needsApproval ? 'Objednávka čeká na schválení' : 'Děkujeme, objednávku jsme přijali' }}</h1>
              <p v-if="o.needsApproval">Objednávka {{ o.no }} překročila váš limit. Správce účtu ji schválí a pak ji zpracujeme. Doručení: {{ o.delivery.date }}, {{ o.delivery.slot }}, pokud bude schválena před uzávěrkou.</p>
              <p v-else>Číslo objednávky <b>{{ o.no }}</b>. Potvrzení jsme poslali na {{ o.contact.email }}. Doručíme {{ o.delivery.date }}, {{ o.delivery.slot }}.</p>
            </div>
          </div>

          <div class="mk-done-grid">
            <section class="mk-card">
              <h2>Shrnutí</h2>
              <dl class="mk-co-facts">
                <div><dt>Číslo objednávky</dt><dd>{{ o.no }}</dd></div>
                <div><dt>Datum objednání</dt><dd>{{ o.date }}</dd></div>
                <div><dt>Doručení</dt><dd>{{ o.delivery.date }}, {{ o.delivery.slot }}<br>{{ o.delivery.address }}</dd></div>
                <div><dt>Kontakt</dt><dd>{{ o.contact.name }}, {{ o.contact.phone }}<br>{{ o.contact.email }}</dd></div>
                <div v-if="o.po"><dt>Číslo objednávky zákazníka</dt><dd>{{ o.po }}</dd></div>
                <div v-if="o.costCenter"><dt>Nákladové středisko</dt><dd>{{ o.costCenter }}</dd></div>
                <div v-if="o.note"><dt>Poznámka pro řidiče</dt><dd>{{ o.note }}</dd></div>
                <div><dt>Platba</dt><dd>{{ o.payment }}</dd></div>
              </dl>
            </section>
            <section class="mk-card">
              <h2>Položky ({{ o.lines.length }})</h2>
              <ul class="mk-done-lines"><li v-for="l in o.lines" :key="l.id"><span>{{ l.name }}</span><span>{{ l.qty }} ks</span><b>{{ kc(l.net) }}</b></li></ul>
              <dl class="mk-sum-rows">
                <div v-if="o.sum.fee"><dt>Poplatky</dt><dd>{{ kc(o.sum.fee) }}</dd></div>
                <div><dt>Celkem bez DPH</dt><dd>{{ kc(o.sum.totalNet) }}</dd></div>
                <div><dt>DPH</dt><dd>{{ kc(o.sum.vat) }}</dd></div>
                <div class="mk-sum-grand"><dt>Celkem vč. DPH</dt><dd>{{ kc(o.sum.totalGross) }}</dd></div>
              </dl>
            </section>
          </div>

          <div class="mk-done-actions">
            <a class="mk-btn" href="#/">Zpět na úvodní stránku</a>
            <button type="button" class="mk-btn mk-btn-sec" @click="soon('Přehled objednávek')">Mé objednávky</button>
            <button type="button" class="mk-link" @click="soon('Tisk objednávky')">Vytisknout objednávku</button>
          </div>
        </template>
      </main>
    `,
  }
})()
