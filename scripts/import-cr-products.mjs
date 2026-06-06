/**
 * import-cr-products.mjs — Nova Shop CR
 * Mismo método que el importador USA (probado y funciona).
 * Copia fotos, variantes, tallas, descripción de CJ → Shopify colecciones cr-*
 * Precio = (costo_producto + envío_CR_estimado) × markup  →  envío gratis para cliente
 *
 * Envío CR estimado (fijo por peso, basado en CJ hacia Costa Rica):
 *   < 0.3 kg  → $6.50
 *   0.3–1 kg  → $7.50
 *   > 1 kg    → $9.00
 *
 * Uso:
 *   SHOPIFY_TOKEN=shpat_xxx node --dns-result-order=ipv4first scripts/import-cr-products.mjs
 *   SHOPIFY_TOKEN=shpat_xxx ONLY=cr-tecnologia node --dns-result-order=ipv4first scripts/import-cr-products.mjs
 */

import https from 'https';

const CJ_EMAIL    = 'paulourena3391@gmail.com';
const CJ_PASSWORD = 'CJ1121382@api@5501fed4f561429bbd58116e7a6d02d2';
const SHOPIFY_STORE = 'yd7u79-bt.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN;

if (!SHOPIFY_TOKEN) {
  console.error('❌  Falta SHOPIFY_TOKEN');
  process.exit(1);
}

const PUB_ONLINE   = 'gid://shopify/Publication/155260485802';
const PUB_HEADLESS = 'gid://shopify/Publication/155432157354';

// ─── Colecciones CR y sus fuentes en CJ ──────────────────────────────────────
const CR_CATEGORIES = [
  { handle: 'cr-tecnologia',   cjIds: ['C83EF2A0-8FA3-4713-9901-2FD6E4554D97','6DB79FAF-593D-4F52-B6FF-AB1D14331862'], keywords: ['smart watch','bluetooth earphone','phone case','led light','usb gadget','wireless charger','ring light','power bank'], type: 'Electronics', count: 20 },
  { handle: 'cr-moda-mujer',   cjIds: ['2FE8A083-5E7B-4179-896D-561EA116F730'],                                        type: "Women's Clothing",       count: 20 },
  { handle: 'cr-moda-hombre',  cjIds: ['B8302697-CF47-4211-9BD0-DFE8995AEB30'],                                        type: "Men's Clothing",         count: 20 },
  { handle: 'cr-calzado',      cjIds: ['AAB54987-4E92-40C7-B0F5-5E814C1E6980','0F0296D6-F057-4FD4-9E06-95D5DBCCE6EB'], type: 'Footwear',               count: 20 },
  { handle: 'cr-hogar',        cjIds: ['7B975B46-46DF-4C3A-BC58-1F4F2DDB9413','E448A723-43DC-4BD8-A9AD-2FB9699338B4'], keywords: ['wall clock','throw pillow','kitchen organizer','candle holder','desk lamp','storage box','shower curtain','door mat'], type: 'Home & Living', count: 20 },
  { handle: 'cr-deportes',     cjIds: ['4B397425-26C1-4D0E-B6D2-96B0B03689DB'],                                        type: 'Sports & Fitness',       count: 20 },
  { handle: 'cr-belleza',      cjIds: [], keywords: ['serum vitamin c','eyelash curler','foundation brush','epilator women','clay mask','press on nails','jade roller','hair straightener','mascara','contour palette'], type: 'Beauty', count: 20 },
  { handle: 'cr-mascotas',     cjIds: [], keywords: ['dog harness','cat toy','pet feeder','dog collar','pet grooming','pet bed','dog leash','cat litter','pet bowl','dog toy'], type: 'Pet Supplies', count: 20 },
  { handle: 'cr-calzado-hombre', cjIds: ['0F0296D6-F057-4FD4-9E06-95D5DBCCE6EB'], keywords: ['mens sneakers','mens leather shoes','mens boots','mens loafers','mens running shoes','mens casual shoes'], type: "Men's Footwear", count: 18 },
  { handle: 'cr-herramientas',   cjIds: [], keywords: ['cordless drill','tool set','car vacuum cleaner','tire inflator','tactical flashlight','screwdriver set','wrench set','angle grinder','laser level','soldering iron','multimeter','heat gun'], type: 'Tools', count: 18 },
];

// ─── Envío CR estimado por peso ───────────────────────────────────────────────
function shippingCR(weightKg) {
  if (weightKg < 0.3) return 6.50;
  if (weightKg < 1.0) return 7.50;
  return 9.00;
}

// ─── Precio con envío incluido ────────────────────────────────────────────────
function getMarkup(cost) {
  if (cost <= 6)  return 3.2;
  if (cost <= 12) return 2.8;
  if (cost <= 20) return 2.4;
  return 2.0;
}

function salePrice(productCost, weightKg) {
  const ship  = shippingCR(weightKg);
  const total = productCost + ship;
  const price = total * getMarkup(total);
  // Redondear a .99
  return (Math.ceil(price) - 0.01);
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────
function apiRequest(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method, headers, timeout: 20000 }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout ' + path.slice(0, 40))); });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── CJ ──────────────────────────────────────────────────────────────────────
async function getCJToken() {
  const res = await apiRequest('developers.cjdropshipping.com',
    '/api2.0/v1/authentication/getAccessToken', 'POST',
    { 'Content-Type': 'application/json' },
    { email: CJ_EMAIL, password: CJ_PASSWORD });
  if (!res.data?.accessToken) throw new Error('CJ auth failed');
  return res.data.accessToken;
}

async function listByCategory(token, cjId, count) {
  await sleep(1500);
  const params = new URLSearchParams({ categoryId: cjId, pageNum: 1, pageSize: count + 10, orderBy: 'totalSold' });
  const res = await apiRequest('developers.cjdropshipping.com',
    '/api2.0/v1/product/list?' + params, 'GET', { 'CJ-Access-Token': token });
  return res.data?.list || [];
}

async function listByKeyword(token, keyword, count) {
  await sleep(1500);
  const params = new URLSearchParams({ productName: keyword, pageNum: 1, pageSize: count, orderBy: 'totalSold' });
  const res = await apiRequest('developers.cjdropshipping.com',
    '/api2.0/v1/product/list?' + params, 'GET', { 'CJ-Access-Token': token });
  return res.data?.list || [];
}

async function getDetail(token, pid) {
  await sleep(1500);
  const res = await apiRequest('developers.cjdropshipping.com',
    '/api2.0/v1/product/query?pid=' + pid, 'GET', { 'CJ-Access-Token': token });
  return res.data;
}

// ─── Variantes (igual que importador USA que funciona) ────────────────────────
const SIZE_RX = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|5XL|\d{1,2}(\.\d)?|\d{2,3}cm|EU\d+|US\d+)$/i;
function isSize(s) { return SIZE_RX.test((s || '').trim()); }

function buildVariantData(cjVariants, basePrice) {
  const variants = cjVariants.slice(0, 100);
  const parsed = variants.map(v => {
    const key = (v.variantKey || v.variantNameEn || 'Default').trim();
    const parts = key.split('-').map(s => s.trim()).filter(Boolean);
    return { v, parts };
  });

  const maxParts = Math.max(...parsed.map(p => p.parts.length), 1);
  let optionNames;
  if (maxParts >= 2) {
    optionNames = ['Color', 'Talla'];
  } else {
    const allSizes = parsed.every(p => p.parts[0] && isSize(p.parts[0]));
    optionNames = [allSizes ? 'Talla' : 'Color'];
  }

  const seen = new Set();
  const shopifyVariants = [];
  const baseCost = variants[0]?.variantSellPrice || 0;

  for (const { v, parts } of parsed) {
    const opt1 = parts[0] || 'Default';
    const opt2 = optionNames.length > 1 ? (parts[1] || 'Único') : undefined;
    const key  = opt1 + '|' + (opt2 || '');
    if (seen.has(key)) continue;
    seen.add(key);

    // Ajustar precio proporcional por variante si tiene costo diferente
    const varCost = v.variantSellPrice || 0;
    const price = (varCost > 0 && baseCost > 0)
      ? parseFloat((basePrice * (varCost / baseCost)).toFixed(2))
      : basePrice;

    const variant = {
      option1: opt1,
      price:   String(price > 0 ? price : basePrice),
      sku:     v.variantSku || v.vid || '',
      inventory_management: null,
      inventory_policy:    'continue',
      inventory_quantity:  999,
      requires_shipping:   true,
      taxable:             false,
      weight:              (v.variantWeight || 300) / 1000,
      weight_unit:         'kg',
    };
    if (opt2) variant.option2 = opt2;
    shopifyVariants.push(variant);
  }

  return {
    options:  optionNames.map(n => ({ name: n })),
    variants: shopifyVariants,
  };
}

// ─── Shopify ──────────────────────────────────────────────────────────────────
async function getCollectionId(handle) {
  const res = await apiRequest(SHOPIFY_STORE,
    '/admin/api/2024-01/custom_collections.json?handle=' + handle, 'GET',
    { 'X-Shopify-Access-Token': SHOPIFY_TOKEN });
  return res.custom_collections?.[0]?.id || null;
}

function buildImages(full) {
  const seen = new Set(), imgs = [];
  // 1. productImageSet (array)
  for (const url of (full.productImageSet || [])) {
    if (url && !seen.has(url)) { seen.add(url); imgs.push({ src: url }); }
  }
  // 2. productImage (JSON string o URL directa)
  try {
    const p = JSON.parse(full.productImage || '');
    (Array.isArray(p) ? p : [p]).forEach(u => {
      if (u && !seen.has(u)) { seen.add(u); imgs.push({ src: u }); }
    });
  } catch {
    if (full.productImage && !seen.has(full.productImage)) imgs.push({ src: full.productImage });
  }
  // 3. bigImage como fallback
  if (!imgs.length && full.bigImage) imgs.push({ src: full.bigImage });
  return imgs.slice(0, 8);
}

async function createProduct(full, cat) {
  const weightKg  = (full.productWeight || 300) / 1000;
  const price     = salePrice(full.sellPrice || 5, weightKg);
  const images    = buildImages(full);
  if (!images.length) return null;

  const { options, variants } = buildVariantData(full.variants || [], price);
  let finalVariants = variants, finalOptions = options;
  if (!finalVariants.length) {
    finalVariants = [{
      price: String(price), sku: '',
      inventory_management: null, inventory_policy: 'continue',
      inventory_quantity: 999, requires_shipping: true, taxable: false,
    }];
    finalOptions = undefined;
  }

  const ship = shippingCR(weightKg);
  const tags  = `market-cr,cj-pid:${full.pid},envio-cr-est:${ship.toFixed(2)}`;

  const product = {
    title:        full.productNameEn || full.productName || 'Producto CR',
    body_html:    '<p>' + (full.description || full.productNameEn || '') + '</p>',
    vendor:       'CJDropshipping',
    product_type: cat.type,
    tags,
    status:       'active',
    images,
    variants:     finalVariants,
  };
  if (finalOptions) product.options = finalOptions;

  const res = await apiRequest(SHOPIFY_STORE, '/admin/api/2024-01/products.json', 'POST',
    { 'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json' },
    { product });
  return res.product || null;
}

async function attachAndPublish(product, collectionId) {
  const pid = product.id;
  await apiRequest(SHOPIFY_STORE, '/admin/api/2024-01/collects.json', 'POST',
    { 'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json' },
    { collect: { product_id: pid, collection_id: collectionId } });

  const gid = 'gid://shopify/Product/' + pid;
  await apiRequest(SHOPIFY_STORE, '/admin/api/2024-01/graphql.json', 'POST',
    { 'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json' },
    { query: `mutation{publishablePublish(id:"${gid}",input:[{publicationId:"${PUB_ONLINE}"},{publicationId:"${PUB_HEADLESS}"}]){userErrors{message}}}` });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🇨🇷  Nova Shop CR — Importador (mismo método que USA, probado)\n');

  const cjToken = await getCJToken();
  console.log('✅  CJ autenticado\n');

  const only  = process.env.ONLY ? process.env.ONLY.split(',').map(s => s.trim()) : null;
  let   total = 0;

  for (const cat of CR_CATEGORIES) {
    if (only && !only.includes(cat.handle)) continue;

    console.log(`\n━━━ ${cat.handle.toUpperCase()} ━━━`);

    const collectionId = await getCollectionId(cat.handle);
    if (!collectionId) { console.log('  ⚠️  Colección no encontrada'); continue; }

    // Recopilar candidatos
    let candidates = [];
    for (const id of (cat.cjIds || [])) {
      candidates = candidates.concat(await listByCategory(cjToken, id, cat.count + 10));
    }
    if (candidates.length < cat.count && cat.keywords) {
      for (const kw of cat.keywords) {
        candidates = candidates.concat(await listByKeyword(cjToken, kw, 12));
      }
    }

    // Deduplicar y filtrar precio razonable para CR
    const seen = new Set();
    candidates = candidates.filter(p => {
      if (!p.pid || seen.has(p.pid)) return false;
      if (!p.sellPrice || p.sellPrice <= 0 || p.sellPrice > 50) return false;
      seen.add(p.pid);
      return true;
    });

    console.log(`  📋  ${candidates.length} candidatos`);

    let imported = 0;
    for (const p of candidates) {
      if (imported >= cat.count) break;
      try {
        const full = await getDetail(cjToken, p.pid);
        if (!full?.pid) continue;

        const created = await createProduct(full, cat);
        if (!created?.id) continue;

        await attachAndPublish(created, collectionId);
        imported++;

        const nVars = created.variants?.length || 1;
        const opts  = created.options?.map(o => o.name).join('+') || 'simple';
        console.log(`  ✅ [${imported}] ${created.title?.slice(0, 40).padEnd(40)} | ${nVars} var (${opts}) | $${created.variants?.[0]?.price}`);
        await sleep(400);
      } catch (e) {
        console.log(`  ⚠️  ${e.message?.slice(0, 60)}`);
      }
    }

    total += imported;
    console.log(`  🎉  ${imported}/${cat.count} importados\n`);
  }

  console.log(`${'═'.repeat(50)}`);
  console.log(`✅  TOTAL: ${total} productos CR en tienda`);
  console.log(`   Vendor: CJDropshipping | Tags: market-cr`);
  console.log(`   Envío incluido en precio — GRATIS para cliente`);
  console.log(`${'═'.repeat(50)}\n`);
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
