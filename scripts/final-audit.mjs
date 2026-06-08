import { buildCostMap } from './cj-costs.mjs';
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
async function rest(p) {
  for (let a = 0; a < 5; a++) {
    try { const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, { headers: { 'X-Shopify-Access-Token': T } }); return await r.json(); }
    catch { await new Promise((r) => setTimeout(r, 1500)); }
  }
  return {};
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

let nVar = 0, loss = 0, thin = 0, marginSum = 0, withCost = 0, assumed = 0;
const lossEx = [], thinEx = [];
const minByType = {};
for (const p of prods) {
  for (const v of p.variants) {
    const price = parseFloat(v.price); if (!(price > 0)) continue;
    nVar++;
    const c = v.sku && map[v.sku];
    const base = c ? (c.total || c.base) : 6;       // costo real o asumido $6
    if (c) withCost++; else assumed++;
    const kg = (parseInt(v.grams, 10) || 300) / 1000;
    const landed = base + shipEst(kg, p.product_type);
    const margin = price - landed;
    const pct = margin / landed;
    marginSum += pct;
    if (margin < 0) { loss++; if (lossEx.length < 12) lossEx.push({ t: p.title.slice(0, 30), type: p.product_type, precio: +price.toFixed(2), costoEst: +landed.toFixed(2), pierde: +(-margin).toFixed(2) }); }
    else if (pct < 0.12) { thin++; if (thinEx.length < 10) thinEx.push({ t: p.title.slice(0, 30), precio: +price.toFixed(2), costoEst: +landed.toFixed(2), margenPct: Math.round(pct * 100) }); }
    const mt = minByType[p.product_type];
    if (!mt || pct < mt.pct) minByType[p.product_type] = { pct, t: p.title.slice(0, 28), price: +price.toFixed(2), landed: +landed.toFixed(2) };
  }
}
console.log('===== AUDITORÍA DE PRECIOS (todos los productos) =====');
console.log('Variantes:', nVar, '| con costo real:', withCost, '| costo asumido $6:', assumed);
console.log('💀 BAJO COSTO (pierde plata):', loss);
console.log('⚠️  margen fino (<12%):', thin);
console.log('✅ margen promedio:', Math.round(marginSum / nVar * 100) + '%');
if (lossEx.length) { console.log('\n-- ejemplos BAJO COSTO --'); lossEx.forEach((e) => console.log(JSON.stringify(e))); }
if (thinEx.length) { console.log('\n-- ejemplos margen fino --'); thinEx.forEach((e) => console.log(JSON.stringify(e))); }
console.log('\n-- margen MÍNIMO por categoría --');
for (const [k, v] of Object.entries(minByType).sort((a, b) => a[1].pct - b[1].pct)) console.log(`${k.padEnd(18)} ${Math.round(v.pct * 100)}%  (${v.t} $${v.price} vs costo $${v.landed})`);
