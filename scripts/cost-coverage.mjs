import { buildCostMap } from './cj-costs.mjs';
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function rest(p) {
  const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, { headers: { 'X-Shopify-Access-Token': T } });
  return r.json();
}

const map = buildCostMap();
console.log('SKUs con costo en CSV:', Object.keys(map).length);

let prods = [], since = 0;
for (let pg = 0; pg < 12; pg++) {
  const j = await rest(`products.json?limit=250&fields=id,title,tags,variants&since_id=${since}`);
  const l = j.products || [];
  if (!l.length) break;
  prods = prods.concat(l.filter((p) => (p.tags || '').includes('market-cr')));
  since = l[l.length - 1].id;
  if (l.length < 250) break;
}
console.log('productos market-cr:', prods.length);

let totalVars = 0, covered = 0, prodCovered = 0, prodUncovered = 0;
const uncoveredEx = [];
for (const p of prods) {
  let anyCov = false;
  for (const v of p.variants) {
    totalVars++;
    if (v.sku && map[v.sku]) { covered++; anyCov = true; }
  }
  if (anyCov) prodCovered++;
  else { prodUncovered++; if (uncoveredEx.length < 10) uncoveredEx.push({ t: p.title.slice(0, 40), sku: p.variants[0]?.sku }); }
}
console.log('variantes totales:', totalVars, '| con costo CSV:', covered, `(${Math.round(covered / totalVars * 100)}%)`);
console.log('productos con algún costo:', prodCovered, '| sin costo:', prodUncovered);
console.log('ejemplos sin costo:', JSON.stringify(uncoveredEx, null, 0));
