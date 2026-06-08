import { buildCostMap } from './cj-costs.mjs';
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
async function rest(p) {
  const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, { headers: { 'X-Shopify-Access-Token': T } });
  return r.json();
}
const map = buildCostMap();
let prods = [], since = 0;
for (let pg = 0; pg < 12; pg++) {
  const j = await rest(`products.json?limit=250&fields=id,variants,tags&since_id=${since}`);
  const l = j.products || [];
  if (!l.length) break;
  prods = prods.concat(l.filter((p) => (p.tags || '').includes('market-cr')));
  since = l[l.length - 1].id;
  if (l.length < 250) break;
}
let n = 0, belowCost = 0, marginSum = 0, exBelow = [];
for (const p of prods) {
  for (const v of p.variants) {
    const c = v.sku && map[v.sku];
    if (!c || !c.total) continue;
    const price = parseFloat(v.price);
    n++;
    const margin = price - c.total;
    marginSum += margin;
    if (price < c.total) { belowCost++; if (exBelow.length < 8) exBelow.push({ sku: v.sku, precio: price, costo: +c.total.toFixed(2), pierde: +(c.total - price).toFixed(2) }); }
  }
}
console.log('variantes con costo conocido:', n);
console.log('vendiéndose BAJO COSTO:', belowCost, `(${Math.round(belowCost / n * 100)}%)`);
console.log('margen promedio actual ($):', (marginSum / n).toFixed(2));
console.log('ejemplos bajo costo:', JSON.stringify(exBelow, null, 0));
// simulación de precios con distintos márgenes (sobre costo total)
function rnd(x){return Math.max(0, Math.ceil(x) - 0.01);} // .99
const sample = prods.flatMap(p=>p.variants).map(v=>v.sku&&map[v.sku]).filter(Boolean).slice(0,1);
console.log('ejemplo regla precio = costo×1.6 (.99): costo', sample[0]?.total?.toFixed(2), '→', sample[0]?rnd(sample[0].total*1.6).toFixed(2):'');
