// Aplica mapping_*.psv: product_type + tags(genero) + título español + fix precios ₡0 + borra basura
import fs from 'fs';
const DIR = 'C:/Users/Administrator/Documents/nova-shop-cr';
const LOG = DIR + '/applylog.txt';
const log = (m) => fs.appendFileSync(LOG, m + '\n');
fs.writeFileSync(LOG, '');
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
if (!T) { log('FALTA TOKEN'); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function rest(p, m, b) {
  for (let a = 0; a < 5; a++) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 15000);
    try {
      const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, {
        method: m || 'GET',
        headers: { 'X-Shopify-Access-Token': T, 'Content-Type': 'application/json' },
        body: b ? JSON.stringify(b) : undefined, signal: ctrl.signal,
      });
      clearTimeout(to);
      if (r.status === 429) { await sleep(2500); continue; }
      if (m === 'DELETE') return { ok: true };
      return await r.json();
    } catch (e) { clearTimeout(to); await sleep(1500); }
  }
  return {};
}

// CODE -> { type, genero }
const MAP = {
  'ROPA-M':  { type: "Women's Clothing", g: 'mujer' },
  'ROPA-H':  { type: "Men's Clothing",   g: 'hombre' },
  'ZAPATO-M':{ type: 'Footwear',         g: 'mujer' },
  'ZAPATO-H':{ type: 'Footwear',         g: 'hombre' },
  'RELOJ-M': { type: 'Watches',          g: 'mujer' },
  'RELOJ-H': { type: 'Watches',          g: 'hombre' },
  'TECH':    { type: 'Electronics' },
  'BELLEZA': { type: 'Beauty' },
  'JOYA':    { type: 'Jewelry' },
  'AUTO':    { type: 'Auto' },
  'FITNESS': { type: 'Sports & Fitness' },
  'MASCOTA': { type: 'Pet Supplies' },
  'BBQ':     { type: 'BBQ' },
  'HOGAR':   { type: 'Home & Living' },
  'VARIOS':  { type: 'Varios' },
};

(async () => {
  // cargar variantes de todos los productos para fix de precio
  let prods = [], sinceId = 0;
  for (let pg = 0; pg < 20; pg++) {
    const r = await rest(`products.json?limit=250&fields=id,variants&since_id=${sinceId}`);
    const l = r.products || [];
    if (!l.length) break;
    prods = prods.concat(l);
    sinceId = l[l.length - 1].id;
    if (l.length < 250) break;
  }
  const variantsById = {};
  for (const p of prods) variantsById[p.id] = p.variants || [];
  log('cargados ' + prods.length + ' productos para precios');

  // leer todos los mapping
  let rows = [];
  for (let i = 1; i <= 5; i++) {
    const f = `${DIR}/mapping_${i}.psv`;
    if (!fs.existsSync(f)) continue;
    for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
      if (!line.trim()) continue;
      const idx = line.indexOf('|');
      const id = line.slice(0, idx);
      const rest2 = line.slice(idx + 1);
      const idx2 = rest2.indexOf('|');
      const code = rest2.slice(0, idx2);
      const title = rest2.slice(idx2 + 1);
      rows.push({ id, code, title });
    }
  }
  log('filas mapping: ' + rows.length);

  let done = 0, changed = 0, deleted = 0, priced = 0, err = 0;
  for (const row of rows) {
    done++;
    try {
      if (row.code === 'DELETE') { await rest(`products/${row.id}.json`, 'DELETE'); deleted++; await sleep(400); continue; }
      const m = MAP[row.code];
      if (!m) { log('codigo desconocido ' + row.code + ' (' + row.id + ')'); continue; }
      const tags = ['market-cr', 'product_type:' + m.type];
      if (m.g) tags.push('genero-' + m.g);
      const body = { product: { id: row.id, title: row.title, product_type: m.type, tags: tags.join(',') } };
      // fix precios ₡0
      const vars = variantsById[row.id] || [];
      const valid = vars.map((v) => parseFloat(v.price)).filter((x) => x > 0);
      const floor = valid.length ? Math.min(...valid) : 9.99;
      const fixVars = vars.filter((v) => !(parseFloat(v.price) > 0)).map((v) => ({ id: v.id, price: floor.toFixed(2) }));
      if (fixVars.length) { body.product.variants = fixVars; priced += fixVars.length; }
      await rest(`products/${row.id}.json`, 'PUT', body);
      changed++;
      if (changed % 50 === 0) log('  cambiados ' + changed + '/' + rows.length);
      await sleep(420);
    } catch (e) { err++; log('  ERROR ' + row.id + ': ' + e.message); }
  }
  log('FIN | cambiados:' + changed + ' | borrados:' + deleted + ' | precios:' + priced + ' | errores:' + err);
})();
