import { buildCostMap } from './cj-costs.mjs';
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
async function rest(p) {
  const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, { headers: { 'X-Shopify-Access-Token': T } });
  return r.json();
}
const BULKY = new Set(['BBQ', 'Auto', 'Pet Supplies', 'Home & Living']);
function shipEst(kg, type) {
  if (BULKY.has(type)) { if (kg < 0.5) return 11; if (kg < 1.0) return 14; if (kg < 2.0) return 18; return 22; }
  if (kg < 0.3) return 7; if (kg < 1.0) return 8.5; if (kg < 2.0) return 11; if (kg < 3.0) return 14; return 17;
}
const map = buildCostMap();
let prods = [], since = 0;
for (let pg = 0; pg < 12; pg++) {
  const j = await rest(`products.json?limit=250&fields=id,title,product_type,tags,variants&since_id=${since}`);
  const l = j.products || []; if (!l.length) break;
  prods = prods.concat(l.filter((p) => (p.tags || '').includes('market-cr')));
  since = l[l.length - 1].id; if (l.length < 250) break;
}
const uncovered = prods.filter((p) => !p.variants.some((v) => v.sku && map[v.sku]));
const byType = {};
let risky = [];
for (const p of uncovered) {
  byType[p.product_type] = (byType[p.product_type] || 0) + 1;
  // precio mínimo y peso de la variante más barata
  const vs = p.variants.filter((v) => parseFloat(v.price) > 0);
  if (!vs.length) continue;
  const minV = vs.reduce((a, b) => (parseFloat(a.price) < parseFloat(b.price) ? a : b));
  const kg = (parseInt(minV.grams, 10) || 300) / 1000;
  const ship = shipEst(kg, p.product_type);
  const floor = ship + 8; // envío + ~$8 (producto+margen). Si está por debajo, RIESGO.
  const price = parseFloat(minV.price);
  if (price < floor) risky.push({ t: p.title.slice(0, 34), type: p.product_type, precio: price, kg, ship, pisoSeguro: floor });
}
console.log('UNCOVERED:', uncovered.length, '| por categoría:', JSON.stringify(Object.entries(byType).sort((a,b)=>b[1]-a[1])));
console.log('EN RIESGO (precio < envío+8):', risky.length);
console.log(JSON.stringify(risky.slice(0, 40), null, 0));
