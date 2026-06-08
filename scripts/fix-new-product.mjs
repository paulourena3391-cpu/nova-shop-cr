import { buildCostMap } from './cj-costs.mjs';
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
const ID = 8453305073834;
const GID = `gid://shopify/Product/${ID}`;
const NEW_TITLE = 'Aceitera de Vidrio 2 en 1 con Atomizador para Cocina';
const NEW_TYPE = 'Home & Living';
const PUB_ONLINE = 'gid://shopify/Publication/155260485802';
const PUB_HEADLESS = 'gid://shopify/Publication/155432157354';

async function rest(p, m, b) {
  const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, {
    method: m || 'GET', headers: { 'X-Shopify-Access-Token': T, 'Content-Type': 'application/json' },
    body: b ? JSON.stringify(b) : undefined });
  return r.json();
}
async function gql(query, variables) {
  const r = await fetch(`https://${H}/admin/api/2024-10/graphql.json`, {
    method: 'POST', headers: { 'X-Shopify-Access-Token': T, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }) });
  return r.json();
}

// 1) Revisar costo
const map = buildCostMap();
const prod = (await rest(`products/${ID}.json`)).product;
const skus = [...new Set(prod.variants.map((v) => v.sku).filter(Boolean))];
const costs = skus.map((s) => map[s]).filter(Boolean);
const base = costs.length ? Math.min(...costs.map((c) => c.total || c.base)) : null;
const price = Math.min(...prod.variants.map((v) => parseFloat(v.price)).filter((x) => x > 0));
const kg = (parseInt(prod.variants[0].grams, 10) || 600) / 1000;
const ship = kg < 0.5 ? 11 : kg < 1 ? 14 : kg < 2 ? 18 : 22; // Home bulky table
console.log('precio mín:', price, '| costo base CSV:', base, '| peso kg:', kg, '| envío est:', ship);
if (base != null) {
  const landed = base + ship;
  console.log('costo total estimado:', landed.toFixed(2), '| margen:', Math.round((price - landed) / landed * 100) + '%');
} else {
  console.log('costo no está en CSV (asumido). Con costo $6 → landed', (6 + ship).toFixed(2), 'margen', Math.round((price - (6 + ship)) / (6 + ship) * 100) + '%');
}

// 2) Actualizar título, categoría, tags
await rest(`products/${ID}.json`, 'PUT', { product: { id: ID, title: NEW_TITLE, product_type: NEW_TYPE, tags: `market-cr,product_type:${NEW_TYPE}` } });
console.log('✅ actualizado: título + categoría Hogar + tag market-cr');

// 3) Publicar a Online Store + Headless
const M = `mutation pub($id: ID!, $pubs: [PublicationInput!]!) { publishablePublish(id: $id, input: $pubs) { userErrors { field message } } }`;
const res = await gql(M, { id: GID, pubs: [{ publicationId: PUB_ONLINE }, { publicationId: PUB_HEADLESS }] });
const errs = res.data?.publishablePublish?.userErrors || [];
console.log(errs.length ? '⚠️ publish errors: ' + JSON.stringify(errs) : '✅ publicado a Online Store + Headless');
