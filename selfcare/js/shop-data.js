/* copied from fsd-selfcare @ f2a58c7 (js/shop-data.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Mock shop data (one category only: Ovoce). Photos come from the Figma shop frame. Prices are without VAT. */
window.ShopData = {
  vat: 0.12,
  breadcrumb: ['Hlavní stránka', 'Potraviny', 'Čerstvé, chlazené', 'Ovoce'],
  tiles: [
    { name: 'Banány a exotické', img: 't01' }, { name: 'Citrusy', img: 't02' }, { name: 'Hrozny', img: 't03' },
    { name: 'Jablka', img: 't04' }, { name: 'Jahody a bobuloviny', img: 't05' }, { name: 'Hrušky', img: 't06' },
    { name: 'Peckoviny', img: 't07' }, { name: 'Melouny', img: 't08' }
  ],
  /* kind: undefined = regular, 'sale' = discount (old price), 'multi' = Multikup (cheaper from 2 pcs) */
  products: [
    { id: 1, name: 'Hrozny červené, bezsemenné', pack: '500 g', price: 59.90, unit: '119,80 Kč/kg' },
    { id: 2, name: 'Jablko Gala, 1 ks', pack: 'cca 170 g', price: 8.90, unit: '49,90 Kč/kg' },
    { id: 3, name: 'Meloun Galia, 1 ks', pack: 'cca 1,14 kg', price: 62.90, old: 89.90, kind: 'sale', unit: '54,90 Kč/kg' },
    { id: 4, name: 'Blumy modré, vanička', pack: '500 g', price: 44.90, old: 89.90, kind: 'sale', unit: '89,80 Kč/kg' },
    { id: 5, name: 'Mandarinky, síťka', pack: '1 kg', price: 59.90, unit: '59,90 Kč/kg' },
    { id: 6, name: 'Meruňky vanička 500g', pack: '500 g', price: 79.90, unit: '159,80 Kč/kg' },
    { id: 7, name: 'Avokádo Hass "Ready to Eat" velké, 1 ks', pack: '250 g', price: 57.90, unit: '231,60 Kč/kg' },
    { id: 8, name: 'Mango "Ready to Eat" 1 ks', pack: '500 g', price: 59.90, unit: '119,80 Kč/kg' },
    { id: 9, name: 'Hrozny tmavé extra sladké, vanička', pack: '300 g', price: 69.90, unit: '233,00 Kč/kg' },
    { id: 10, name: 'Jablka červená balená', pack: '1 kg', price: 39.90, unit: '39,90 Kč/kg' },
    { id: 11, name: 'Švestky, vanička', pack: '1 kg', price: 59.90, unit: '59,90 Kč/kg' },
    { id: 12, name: 'BIO Kokos "Drink&Eat"', pack: '', price: 66.90, old: 99.90, kind: 'sale', unit: '66,90 Kč/ks' },
    { id: 13, name: 'Pomeranč, 1 ks', pack: 'cca 250 g', price: 12.90, unit: '49,90 Kč/kg' },
    { id: 14, name: 'Metro Chef Limeta, 1 ks', pack: '', price: 9.90, kind: 'multi', multiFrom: 2, single: '12,90 Kč za 1 ks', unit: '12,90 Kč/ks' },
    { id: 15, name: 'Avokádo Hass "Ready to Eat", 2 ks', pack: '330 g', price: 64.90, unit: '196,67 Kč/kg' },
    { id: 16, name: 'Borůvky kanadské, vanička', pack: '125 g', price: 44.90, unit: '359,20 Kč/kg' },
    { id: 17, name: 'Meruňky, vanička', pack: '1 kg', price: 97.90, unit: '97,90 Kč/kg' },
    { id: 18, name: 'Hrozny bílé, bezsemenné', pack: '500 g', price: 69.90, unit: '139,80 Kč/kg' },
    { id: 19, name: 'Kiwi "Ready to Eat", tácek', pack: '4 ks', price: 67.90, unit: '16,98 Kč/ks' },
    { id: 20, name: 'Granátové jablko, vyloupané', pack: '250 g', price: 118.90, old: 179.90, kind: 'sale', unit: '475,60 Kč/kg' },
    { id: 21, name: 'Citrony, síť', pack: '500 g', price: 39.90, unit: '79,80 Kč/kg' }
  ].map(p => Object.assign(p, { img: 'p' + String(p.id).padStart(2, '0') })),
  lists: [
    { id: 'l1', name: 'Týdenní nákup', items: [{ pid: 1, qty: 2 }, { pid: 2, qty: 10 }, { pid: 10, qty: 3 }, { pid: 13, qty: 6 }, { pid: 21, qty: 2 }] },
    { id: 'l2', name: 'Víkendové menu', items: [{ pid: 7, qty: 4 }, { pid: 8, qty: 2 }, { pid: 16, qty: 2 }, { pid: 19, qty: 3 }] }
  ]
};
