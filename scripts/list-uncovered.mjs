import fs from 'fs';
import { buildCostMap } from './cj-costs.mjs';
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
async function rest(p) {
  const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, { headers: { 'X-Shopify-Access-Token': T } });
  return r.json();
}
const map = buildCostMap();
let prods = [], since = 0;
for (let pg = 0; pg < 12; pg++) {
  const j = await rest(`products.json?limit=250&fields=id,title,handle,product_type,tags,variants&since_id=${since}`);
  const l = j.products || []; if (!l.length) break;
  prods = prods.concat(l.filter((p) => (p.tags || '').includes('market-cr')));
  since = l[l.length - 1].id; if (l.length < 250) break;
}
const uncovered = prods.filter((p) => !p.variants.some((v) => v.sku && map[v.sku]));
const byType = {};
const rows = ['title,product_type,first_sku,handle'];
for (const p of uncovered) {
  byType[p.product_type || '?'] = (byType[p.product_type || '?'] || 0) + 1;
  const sku = (p.variants.find((v) => v.sku) || {}).sku || '';
  rows.push(`"${(p.title || '').replace(/"/g, "'")}","${p.product_type}","${sku}","${p.handle}"`);
}
fs.writeFileSync('C:/Users/Administrator/Documents/nova-shop-cr/productos-sin-costo.csv', rows.join('\n'));
console.log('Uncovered:', uncovered.length, '→ guardado en productos-sin-costo.csv');
console.log('Por categoría:', JSON.stringify(Object.entries(byType).sort((a, b) => b[1] - a[1]), null, 0));
