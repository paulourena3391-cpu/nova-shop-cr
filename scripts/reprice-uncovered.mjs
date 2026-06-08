import fs from 'fs';
import { buildCostMap } from './cj-costs.mjs';
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
const LOG = 'C:/Users/Administrator/Documents/nova-shop-cr/repricelog.txt';
const log = (m) => fs.appendFileSync(LOG, m + '\n');
fs.writeFileSync(LOG, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function rest(p, m, b) {
  for (let a = 0; a < 5; a++) {
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 15000);
    try {
      const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, {
        method: m || 'GET', headers: { 'X-Shopify-Access-Token': T, 'Content-Type': 'application/json' },
        body: b ? JSON.stringify(b) : undefined, signal: ctrl.signal,
      });
      clearTimeout(to);
      if (r.status === 429) { await sleep(2500); continue; }
      return await r.json();
    } catch { clearTimeout(to); await sleep(1500); }
  }
  return {};
}
const round99 = (x) => Math.max(0.99, Math.ceil(x) - 0.01);
function shippingCR(kg) {
  if (kg < 0.3) return 6.5; if (kg < 1.0) return 7.5; if (kg < 2.0) return 10; if (kg < 3.0) return 13; return 16;
}

const DRY = process.argv.includes('--dry');
const costMap = buildCostMap();
log('SKUs con costo (se omiten): ' + Object.keys(costMap).length + (DRY ? ' [DRY RUN]' : ''));

let prods = [], since = 0;
for (let pg = 0; pg < 12; pg++) {
  const j = await rest(`products.json?limit=250&fields=id,title,tags,variants&since_id=${since}`);
  const l = j.products || []; if (!l.length) break;
  prods = prods.concat(l.filter((p) => (p.tags || '').includes('market-cr')));
  since = l[l.length - 1].id; if (l.length < 250) break;
}
log('productos market-cr: ' + prods.length);

let touchedProds = 0, touchedVars = 0, done = 0;
for (const p of prods) {
  // omitir productos que tienen costo conocido (sanos)
  const anyCovered = p.variants.some((v) => v.sku && costMap[v.sku]);
  if (anyCovered) continue;

  const newVariants = [];
  for (const v of p.variants) {
    const cur = parseFloat(v.price) || 0;
    if (cur <= 0) continue;
    const kg = (parseInt(v.grams, 10) || 300) / 1000;
    const floor = shippingCR(kg) + 6;          // cubre envío + ~$6 (producto+ganancia)
    const restored = cur / 0.76;               // revierte el recorte -24%
    let np = round99(Math.max(restored, floor));
    np = Math.min(np, round99(cur * 1.9));      // tope: no más de +90% de golpe
    if (np > cur + 0.001) {
      newVariants.push({ id: v.id, price: np.toFixed(2), compare_at_price: round99(np * 1.3).toFixed(2) });
      touchedVars++;
      if (DRY && touchedVars <= 16) log(`  ${p.title.slice(0, 32)} | ${v.sku} | ${cur.toFixed(2)} → ${np.toFixed(2)} (kg ${kg})`);
    }
  }
  if (newVariants.length) {
    if (DRY) { touchedProds++; done++; continue; }
    await rest(`products/${p.id}.json`, 'PUT', { product: { id: p.id, variants: newVariants } });
    touchedProds++;
    if (touchedProds % 25 === 0) log('  reprecios: ' + touchedProds + ' productos');
    await sleep(420);
  }
  done++;
}
log('FIN | productos reprecio: ' + touchedProds + ' | variantes: ' + touchedVars);
