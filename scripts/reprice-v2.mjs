import fs from 'fs';
import { buildCostMap } from './cj-costs.mjs';
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
const LOG = 'C:/Users/Administrator/Documents/nova-shop-cr/reprice2log.txt';
const log = (m) => fs.appendFileSync(LOG, m + '\n');
fs.writeFileSync(LOG, '');
const DRY = process.argv.includes('--dry');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function rest(p, m, b) {
  for (let a = 0; a < 5; a++) {
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
  if (BULKY.has(type)) {
    if (kg < 0.5) return 11; if (kg < 1.0) return 14; if (kg < 2.0) return 18; return 22;
  }
  if (kg < 0.3) return 7; if (kg < 1.0) return 8.5; if (kg < 2.0) return 11; if (kg < 3.0) return 14; return 17;
}

const map = buildCostMap();
log('SKUs con costo: ' + Object.keys(map).length + (DRY ? ' [DRY]' : ''));
let prods = [], since = 0;
for (let pg = 0; pg < 12; pg++) {
  const j = await rest(`products.json?limit=250&fields=id,title,product_type,tags,variants&since_id=${since}`);
  const l = j.products || []; if (!l.length) break;
  prods = prods.concat(l.filter((p) => (p.tags || '').includes('market-cr')));
  since = l[l.length - 1].id; if (l.length < 250) break;
}
log('productos: ' + prods.length);

let raised = 0, prodsTouched = 0, noCost = 0, sampleShown = 0;
const jumps = { '<5': 0, '5-10': 0, '10-15': 0, '>15': 0 };
for (const p of prods) {
  const nv = [];
  for (const v of p.variants) {
    const c = v.sku && map[v.sku];
    const cur = parseFloat(v.price) || 0;
    if (!c) { noCost++; continue; }
    if (cur <= 0) continue;
    const kg = (parseInt(v.grams, 10) || 300) / 1000;
    const base = c.total || c.base || 0;
    const ship = shipEst(kg, p.product_type);
    const landed = base + ship;
    const target = round99(landed + Math.max(4, landed * 0.25)); // ~25% margen o $4 min
    if (target > cur + 0.01) {
      const inc = target - cur;
      jumps[inc < 5 ? '<5' : inc < 10 ? '5-10' : inc < 15 ? '10-15' : '>15']++;
      nv.push({ id: v.id, price: target.toFixed(2), compare_at_price: round99(target * 1.3).toFixed(2) });
      raised++;
      if (DRY && sampleShown < 18) { log(`  ${p.product_type.padEnd(16)} ${v.sku} | base ${base.toFixed(2)} ship~${ship} | ${cur.toFixed(2)} → ${target.toFixed(2)}`); sampleShown++; }
    }
  }
  if (nv.length) {
    prodsTouched++;
    if (!DRY) { await rest(`products/${p.id}.json`, 'PUT', { product: { id: p.id, variants: nv } }); await sleep(420);
      if (prodsTouched % 25 === 0) log('  ...' + prodsTouched + ' productos'); }
  }
}
log('FIN | variantes subidas: ' + raised + ' | productos: ' + prodsTouched + ' | variantes sin costo (sin tocar): ' + noCost);
log('Magnitud de subidas $: ' + JSON.stringify(jumps));
