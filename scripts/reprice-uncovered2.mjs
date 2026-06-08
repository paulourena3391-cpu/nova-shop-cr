import fs from 'fs';
import { buildCostMap } from './cj-costs.mjs';
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
const LOG = 'C:/Users/Administrator/Documents/nova-shop-cr/reprice3log.txt';
const log = (m) => fs.appendFileSync(LOG, m + '\n');
fs.writeFileSync(LOG, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function rest(p, m, b) {
  for (let a = 0; a < 6; a++) {
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 15000);
    try {
      const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, {
        method: m || 'GET', headers: { 'X-Shopify-Access-Token': T, 'Content-Type': 'application/json' },
        body: b ? JSON.stringify(b) : undefined, signal: ctrl.signal });
      clearTimeout(to);
      if (r.status === 429) { await sleep(2500); continue; }
      return await r.json();
    } catch { clearTimeout(to); await sleep(1500); }
  }
  return {};
}
const round99 = (x) => Math.max(0.99, Math.ceil(x) - 0.01);
const BULKY = new Set(['BBQ', 'Auto', 'Pet Supplies', 'Home & Living']);
function shipEst(kg, type) {
  if (BULKY.has(type)) { if (kg < 0.5) return 11; if (kg < 1.0) return 14; if (kg < 2.0) return 18; return 22; }
  if (kg < 0.3) return 7; if (kg < 1.0) return 8.5; if (kg < 2.0) return 11; if (kg < 3.0) return 14; return 17;
}
const ASSUMED_COST = 6; // costo de producto asumido (sin dato real)

const map = buildCostMap();
let prods = [], since = 0;
for (let pg = 0; pg < 12; pg++) {
  const j = await rest(`products.json?limit=250&fields=id,title,product_type,tags,variants&since_id=${since}`);
  const l = j.products || []; if (!l.length) break;
  prods = prods.concat(l.filter((p) => (p.tags || '').includes('market-cr')));
  since = l[l.length - 1].id; if (l.length < 250) break;
}
const uncovered = prods.filter((p) => !p.variants.some((v) => v.sku && map[v.sku]));
log('uncovered: ' + uncovered.length);

let raised = 0, prodsTouched = 0;
for (const p of uncovered) {
  const nv = [];
  for (const v of p.variants) {
    const cur = parseFloat(v.price) || 0; if (cur <= 0) continue;
    const kg = (parseInt(v.grams, 10) || 300) / 1000;
    const landed = shipEst(kg, p.product_type) + ASSUMED_COST;
    const target = round99(landed * 1.25);
    if (target > cur + 0.01) {
      nv.push({ id: v.id, price: target.toFixed(2), compare_at_price: round99(target * 1.3).toFixed(2) });
      raised++;
    }
  }
  if (nv.length) {
    prodsTouched++;
    await rest(`products/${p.id}.json`, 'PUT', { product: { id: p.id, variants: nv } });
    log(`  ${p.title.slice(0, 36)} | ${nv.length} variantes → ${nv[0].price}`);
    await sleep(420);
  }
}
log('FIN | variantes subidas: ' + raised + ' | productos: ' + prodsTouched);
