/* copied from fsd-selfcare @ f2a58c7 (js/data.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Mock data (fictional). Exposed as window.MockData; copied fresh by App.reset().
   Shape follows docs/DATA-MODEL-DRAFT.md (Company, Location, User). Fields set by makro staff live under `staff`. */
window.MockData = {
  /* four roles per company (REG-12); one role per user + a list of locations the user can buy for */
  roles: {
    owner: { label: 'Vlastník', desc: 'Nejvyšší role. Spravuje vše, včetně dalších vlastníků. Ve firmě vždy zůstává alespoň jeden.' },
    admin: { label: 'Správce účtu', desc: 'Spravuje firmu, kolegy, dodací adresy a platby. Nemůže měnit ani odebrat vlastníka.' },
    buyer: { label: 'Nákupčí', desc: 'Nakupuje pro přiřazené dodací adresy. Nastavení firmy vidí jen ke čtení.' },
    viewer: { label: 'Prohlížející', desc: 'Vidí objednávky a nastavení firmy, ale nenakupuje ani nic nemění.' }
  },
  /* business segments are an administrable list (REG-31); it drives the starter catalogue */
  segments: ['Restaurace', 'Kavárna', 'Pizzerie', 'Hotel', 'Bar', 'Obchod', 'Jiné'],
  sizes: ['1–5 zaměstnanců', '6–20 zaměstnanců', '21–100 zaměstnanců', 'Více než 100 zaměstnanců'],
  company: {
    name: 'Fidel Gastro s.r.o.',
    legalForm: 's.r.o.',
    country: 'CZ',
    ico: '12345678',
    dic: 'CZ12345678',
    address: 'Ukázková 123/4, 110 00 Praha 1',
    seatAddress: '',
    tradeName: 'Restaurace U Mostu',
    segment: 'Restaurace',
    size: '6–20 zaměstnanců',
    contactPhone: '+420 777 000 222',
    contactEmail: 'objednavky@ukazkova-firma.example',
    onlyCompanyEmail: false,
    domains: ['ukazkova-firma.example']
  },
  /* set by makro staff, read-only for the customer */
  staff: {
    customerNo: '4 512 337',
    status: 'Stávající zákazník',
    linked: [{ ico: '87654321', name: 'Ukázkový hotel a.s.' }, { ico: '24681357', name: 'Ukázkové bistro s.r.o.' }],
    rep: { name: 'Tereza Obchodní', email: 'tereza.obchodni@makro.example', phone: '+420 271 005 123' },
    segmentDiscount: 'Gastro B – 3 % na vybraný sortiment',
    priceMode: 'Smluvní ceny',
    pricedItems: 42,
    assortment: 'Omezený sortiment',
    assortmentGroups: ['Čerstvé ovoce a zelenina', 'Maso a ryby', 'Mléčné výrobky a vejce', 'Nápoje'],
    alternatives: [
      { item: 'Jablko Gala, 1 ks', alt: 'Jablko Golden Delicious, 1 ks' },
      { item: 'Hrozny červené, bezsemenné', alt: 'Hrozny bílé, bezsemenné' },
      { item: 'Avokádo Hass „Ready to Eat“', alt: 'Avokádo Hass, tvrdé' }
    ],
    methodsAllowed: ['invoice', 'cod', 'bonus', 'voucher'],
    credit: { status: 'approved', limit: 50000, terms: 'Splatnost faktur 14 dní', balance: 12340 }
  },
  /* representative authorisation and verification (REG-02, REG-03) */
  authz: {
    type: 'statutory', person: 'Ondřej Ukázkový', position: 'Jednatel',
    method: 'Bank iD', verifiedAt: '2. 9. 2026', status: 'verified',
    docs: [
      { id: 'd1', name: 'Výpis z obchodního rejstříku.pdf', kind: 'Výpis z rejstříku', date: '2. 9. 2026', status: 'ok' },
      { id: 'd2', name: 'Živnostenský list.pdf', kind: 'Doklad o podnikání', date: '2. 9. 2026', status: 'ok' }
    ]
  },
  payments: {
    preferred: ['invoice'],
    invoicePhone: '+420 777 000 111',
    invoiceEmail: 'fakturace@ukazkova-firma.example'
  },
  /* consents and agreements (REG-27/28/32/29); marketing consent is per user (REG-32) */
  agreements: {
    terms: [
      { version: '2.1', country: 'CZ', lang: 'Čeština', date: '2. 9. 2026', user: 'Ondřej Ukázkový' },
      { version: '2.0', country: 'CZ', lang: 'Čeština', date: '14. 3. 2026', user: 'Ondřej Ukázkový' }
    ],
    pendingTerms: { version: '2.2', date: '1. 11. 2026' },
    cookies: { analytics: true, marketing: false },
    proofDocs: [{ id: 'p1', name: 'Výpis z obchodního rejstříku.pdf', date: '2. 9. 2026' }],
    proofMin: 1, proofMax: 3
  },
  /* flat list of delivery addresses (no site layer). name = optional "Název provozovny"; licences 0..n per address */
  addresses: [
    { id: 'a1', area: 'praha', name: 'Restaurace U Mostu', street: 'Na Příkopě 15', city: 'Praha 1', zip: '110 00', country: 'CZ', pin: [50, 60], main: true, blocked: false,
      contact: 'Jana Nováková', phone: '+420 777 111 222', entrance: 'Boční ulice', floor: 'Přízemí', door: '', note: 'Zvonek „Kuchyně“.',
      days: [0, 1, 2, 3, 4], from: '06:00', to: '10:00', restrictions: ['avizo'], validFrom: '', validTo: '',
      licences: [{ id: 'l1', kind: 'alcohol', code: 'ALK-2024-0815', expiry: '2026-12-15' }, { id: 'l2', kind: 'tobacco', code: 'TAB-2024-0007', expiry: '2027-06-30' }] },
    { id: 'a2', area: 'praha', name: 'Letní zahrádka', street: 'Na Příkopě 22', city: 'Praha 1', zip: '110 00', country: 'CZ', pin: [42, 48], main: false, blocked: false,
      contact: 'Jana Nováková', phone: '+420 777 111 222', entrance: 'Vstup z nádvoří', floor: '', door: '', note: '',
      days: [0, 1, 2, 3, 4], from: '06:00', to: '10:00', restrictions: [], validFrom: '2026-05-01', validTo: '2026-09-30', licences: [] },
    { id: 'a3', area: 'brno', name: 'Bistro Brno', street: 'Masarykova 28', city: 'Brno', zip: '602 00', country: 'CZ', pin: [40, 45], main: false, blocked: false,
      contact: 'Petr Dvořák', phone: '+420 777 333 444', entrance: 'Zadní dvůr', floor: '', door: 'č. 3', note: '',
      days: [0, 1, 2, 3, 4, 5], from: '07:00', to: '12:00', restrictions: ['rampa', 'vyska'], validFrom: '', validTo: '', licences: [] },
    { id: 'a4', area: 'plzen', name: 'Hotel Plzeň', street: 'Americká 42', city: 'Plzeň', zip: '301 00', country: 'CZ', pin: [60, 50], main: false, blocked: true,
      contact: 'Marie Svobodová', phone: '+420 777 555 666', entrance: 'Recepce', floor: '', door: '', note: 'Příjem zboží u recepce.',
      days: [1, 3], from: '08:00', to: '14:00', restrictions: [], validFrom: '', validTo: '', licences: [{ id: 'l3', kind: 'tobacco', code: 'TAB-2025-0042', expiry: '2026-11-20' }] }
  ],
  /* status: active | invited | blocked (shown as Deaktivovaný) */
  users: [
    { id: 'u1', email: 'majitel@ukazkova-firma.example', first: 'Ondřej', last: 'Ukázkový', phone: '+420 777 100 001', role: 'owner', addresses: 'all', status: 'active', lastActive: '16. 10. 2026',
      limit: null, approval: false, approver: '', gdpr: { date: '2. 9. 2026', version: '3.0', stats: true }, marketing: { on: true, channels: ['email', 'phone'], date: '2. 9. 2026' } },
    { id: 'u6', email: 'sprava@ukazkova-firma.example', first: 'Lenka', last: 'Správcová', phone: '+420 777 100 006', role: 'admin', addresses: 'all', status: 'active', lastActive: '15. 10. 2026',
      limit: null, approval: false, approver: '', gdpr: { date: '10. 9. 2026', version: '3.0', stats: true }, marketing: { on: false, channels: [], date: '' } },
    { id: 'u2', email: 'jana.novakova@ukazkova-firma.example', first: 'Jana', last: 'Nováková', phone: '+420 777 111 222', role: 'buyer', addresses: ['a1', 'a2'], status: 'active', lastActive: '16. 10. 2026',
      limit: 20000, approval: true, approver: 'u1', gdpr: { date: '12. 9. 2026', version: '3.0', stats: false }, marketing: { on: true, channels: ['email'], date: '12. 9. 2026' } },
    { id: 'u3', email: 'petr.dvorak@ukazkova-firma.example', first: 'Petr', last: 'Dvořák', phone: '+420 777 333 444', role: 'buyer', addresses: ['a3'], status: 'active', lastActive: '12. 10. 2026',
      limit: null, approval: false, approver: '', gdpr: { date: '12. 9. 2026', version: '3.0', stats: true }, marketing: { on: false, channels: [], date: '' } },
    { id: 'u7', email: 'eva.ucetni@ukazkova-firma.example', first: 'Eva', last: 'Účetní', phone: '', role: 'viewer', addresses: 'all', status: 'active', lastActive: '9. 10. 2026',
      limit: null, approval: false, approver: '', gdpr: { date: '15. 9. 2026', version: '3.0', stats: false }, marketing: { on: false, channels: [], date: '' } },
    { id: 'u4', email: 'ucetni@ukazkova-firma.example', first: '', last: '', phone: '', role: 'viewer', addresses: 'all', status: 'invited', lastActive: '',
      limit: null, approval: false, approver: '', gdpr: null, marketing: { on: false, channels: [], date: '' } },
    { id: 'u5', email: 'marie.svobodova@ukazkova-firma.example', first: 'Marie', last: 'Svobodová', phone: '+420 777 555 666', role: 'buyer', addresses: ['a4'], status: 'blocked', lastActive: '2. 8. 2026',
      limit: null, approval: false, approver: '', gdpr: { date: '12. 9. 2026', version: '3.0', stats: false }, marketing: { on: false, channels: [], date: '' } }
  ],
  orders: [
    { id: '2026-104512', date: '14. 10. 2026', address: 'a1', total: 18420, status: 'Doručeno' },
    { id: '2026-104377', date: '12. 10. 2026', address: 'a3', total: 9860, status: 'Doručeno' },
    { id: '2026-104201', date: '9. 10. 2026', address: 'a1', total: 22150, status: 'Doručeno' },
    { id: '2026-104688', date: '16. 10. 2026', address: 'a3', total: 12340, status: 'Na cestě' }
  ],
  credits: { balance: 12500, history: [
    { date: '2. 10. 2026', text: 'Dobití firemních kreditů', amount: 15000 },
    { date: '9. 10. 2026', text: 'Úhrada objednávky 2026-104201', amount: -2500 }
  ] },
  card: { brand: 'Visa', last4: '4242', exp: '12/28' }
};
window.MockData.restrictionLabels = {
  avizo: 'Řidič má před doručením zavolat',
  rampa: 'K dispozici je nakládací rampa',
  vyska: 'Maximální výška vozidla 3,5 m',
  zakaz: 'Zákaz vjezdu nákladních vozidel'
};
window.MockData.addressSuggestions = [
  { street: 'Na Příkopě 15', city: 'Praha 1', zip: '110 00' }, { street: 'Na Příkopě 22', city: 'Praha 1', zip: '110 00' }, { street: 'Evropská 2758/11', city: 'Praha 6', zip: '160 00' },
  { street: 'Masarykova 28', city: 'Brno', zip: '602 00' }, { street: 'Masarykova 5', city: 'Brno', zip: '602 00' }, { street: 'Americká 42', city: 'Plzeň', zip: '301 00' },
  { street: 'Náměstí Republiky 1', city: 'Plzeň', zip: '306 32' }, { street: 'Zlatnická 10', city: 'Praha 1', zip: '110 00' }
];
/* ILLUSTRATIVE MOCK (not from a requirement): delivery area / distribution centre per address, used for the area banner in the address drawer */
window.MockData.areas = { praha: 'Praha', brno: 'Brno', plzen: 'Plzeň' };
window.MockData.countries = [{ value: 'CZ', label: 'Česko' }, { value: 'SK', label: 'Slovensko' }, { value: 'PL', label: 'Polsko' }, { value: 'DE', label: 'Německo' }, { value: 'AT', label: 'Rakousko' }, { value: 'HU', label: 'Maďarsko' }];
/* per-user settings (docs/DATA-MODEL-DRAFT.md section 3): display toggles, SSO identities, e-mail verification, password */
window.MockData.users.forEach(u => Object.assign(u, {
  display: { vat: 'excl', pack: 'piece', unit: 'kg' },
  sso: { google: false, microsoft: false },
  emailVerified: u.status !== 'invited',
  passwordChanged: u.status === 'invited' ? '' : '1. 9. 2026'
}));
window.MockData.users.find(u => u.id === 'u1').sso.google = true;
