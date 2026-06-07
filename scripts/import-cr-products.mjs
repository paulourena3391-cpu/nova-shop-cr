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
// Import POR CATEGORÍA (IDs reales de CJ) → productos relevantes, sin junk de keywords.
const CR_CATEGORIES = [
  { handle: 'cr-tecnologia',     type: 'Electronics',      count: 35, cjIds: ['B200FABB-A76B-4750-9957-FEA3DCB21F1F','00134C46-B7DF-4500-A3D9-ABB7B779EFD0','491E5474-524C-4666-BDD7-4E35E38900EA','9170B3F9-5B9C-4C39-8CD6-7DC00E481D47','DAECCC3B-13D8-4978-86A8-61D3DF186134','C83EF2A0-8FA3-4713-9901-2FD6E4554D97','C1AB7563-AED4-44D8-9F01-05BD91C65307'] },
  { handle: 'cr-mascotas',       type: 'Pet Supplies',     count: 35, cjIds: ['2410110341061612000','2410110358051626100','2410110352471611400','2410110352591600400','2410110339451623300','2410110354491625800','2410110341451628800'] },
  { handle: 'cr-parrillas',      type: 'BBQ',              count: 35, cjIds: ['E448A723-43DC-4BD8-A9AD-2FB9699338B4','23ADD7CB-065A-4A02-B8E8-43D3F041B90B','BEDFD1CC-E7CC-438F-9050-D7737904203D'] },
  { handle: 'cr-calzado-hombre', type: "Men's Footwear",   count: 35, cjIds: ['F419006D-AE55-4691-93FC-52FEBB459DBA','0F0296D6-F057-4FD4-9E06-95D5DBCCE6EB','11C9DE73-0438-40E2-80B8-72697795C9F2'] },
  { handle: 'cr-calzado-mujer',  type: "Women's Footwear", count: 35, cjIds: ['AAB54987-4E92-40C7-B0F5-5E814C1E6980','F35FC838-1CFE-49D1-A8CA-CF7401F9C444','1988B912-7A18-4ED2-B1E1-61ED290A0E82','638284D0-3651-4FC9-9F25-B0A0BA323D83'] },
  { handle: 'cr-hogar',          type: 'Home & Living',    count: 35, cjIds: ['56845C3D-4D9E-4729-B5D4-6D7DE310C031','2502140315331600200','B62EE40F-7650-4715-A7A5-BA227540593C','A0E89009-FFD6-4B2E-906A-8076DF45B32C','C1394E10-1EDF-4107-AA93-F142B44C3136'] },
  { handle: 'cr-deportes',       type: 'Sports & Fitness', count: 35, cjIds: ['C20B25A2-348C-48C8-A2C8-FE33749A40DE','79F47CD1-F813-4B4D-8D21-2B35966FBA66'] },
  { handle: 'cr-auto',           type: 'Auto',             count: 35, cjIds: ['D44C3391-0AF1-455A-A671-29214DA68F27','00E6FC51-B865-4D50-9EF9-21E7050F5653','2A64C22F-F04A-4AAA-9C1C-8AF89323FB63','5559DD57-7F12-44BC-9C29-9E9BD1CDB029','77A90826-779B-47DD-AB79-8FEE91AE0A3E'] },
  { handle: 'cr-belleza',        type: 'Beauty',           count: 35, cjIds: ['A30E8F55-DC2C-4842-9372-91B96DEFDCC2','2502140311201613700','AB11F624-D292-4A8E-9284-BD368B893A2C','6D086E0D-8C3F-4B99-BA44-140F3F7C444E','EADB666A-12A5-4FA1-AD1F-BC351A7E7AF5','47D355FB-E6C1-4E0B-AE31-0B1696A4B68E'] },
  { handle: 'cr-virales',        type: 'Trending',         count: 35, cjIds: ['538CB48E-B7A0-46F7-B5A2-BB8183247B23','EDB5F43E-EAC0-489A-8355-5188EAB72D08','0AC6B44A-12CC-456F-831F-54064C77D303','7E431502-1275-4FF3-A236-B97C107C3AFA'] },
];

// ─── Relevancia: el título DEBE matchear la categoría (filtra junk irrelevante) ──
const CATEGORY_MUST = {
  'cr-tecnologia':     /phone|charger|cable|usb|watch|bluetooth|earphone|earbud|headphone|airpod|led|power ?bank|adapter|speaker|wireless|charging|hub|tripod|ring light|gaming|mouse|keyboard|projector|gadget/i,
  'cr-mascotas':       /\bdog|\bcat\b|\bpet|puppy|kitten|aquarium|bird|paw|leash|collar|kennel/i,
  'cr-parrillas':      /bbq|grill|barbecue|\bmeat|skewer|thermometer|basting|apron|charcoal|smoker|spatula/i,
  'cr-calzado-hombre': /shoe|sneaker|loafer|\bboot|footwear|\bmen/i,
  'cr-calzado-mujer':  /shoe|sneaker|sandal|\bheel|\bflat|loafer|women/i,
  'cr-hogar':          /organizer|storage|\brack|kitchen|drawer|closet|\bhook|holder|\bbox|shelf|cabinet|household|sink|hanger|dispenser/i,
  'cr-deportes':       /fitness|resistance|yoga|workout|\bgym|muscle|massage|exercise|training|\bband|roller|posture|waist|\babs?\b|sport|skipping|dumbbell/i,
  'cr-auto':           /\bcar\b|\bauto|vehicle|tire|tyre|\bdash|windshield|\bseat/i,
  'cr-belleza':        /makeup|brush|\bhair|\bnail|\bface|facial|beauty|\bskin|\blash|eyebrow|cosmetic|mirror|massager|curler|straighten|epilator|blackhead/i,
  'cr-virales':        /\bled|light|projector|\blamp|magnetic|portable|fidget|\btoy|gadget|\bmini|\brgb|night|galaxy|levitat|flying/i,
};

// ─── Envío CR estimado por peso ───────────────────────────────────────────────
function shippingCR(weightKg) {
  if (weightKg < 0.3) return 6.50;
  if (weightKg < 1.0) return 7.50;
  if (weightKg < 2.0) return 10.00;
  if (weightKg < 3.0) return 13.00;
  return 16.00;
}

// ─── Precio con envío incluido ────────────────────────────────────────────────
function getMarkup(cost) {
  if (cost <= 6)  return 2.0;
  if (cost <= 12) return 1.7;
  if (cost <= 20) return 1.5;
  return 1.4;
}

function salePrice(productCost, weightKg) {
  const ship = shippingCR(weightKg);
  // Markup on the PRODUCT only, shipping added at cost (not multiplied) →
  // impulse-friendly prices that still cover shipping + leave margin.
  let price = productCost * getMarkup(productCost) + ship;
  // Safety floor: never below cost + real shipping + $3 profit
  price = Math.max(price, productCost + ship + 3);
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
  // Quality/risk filters: skip heavy items (expensive/slow shipping to CR)
  if (weightKg > 3.0) return null;
  const price     = salePrice(full.sellPrice || 5, weightKg);
  const images    = buildImages(full);
  // Require at least 2 images → avoids cheap-looking single-photo listings
  if (images.length < 2) return null;

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

// Trae los cj-pid ya importados a Shopify → evita duplicados al re-correr/top-up
async function getExistingPids() {
  const pids = new Set();
  let url = `/admin/api/2024-01/products.json?limit=250&fields=id,tags&vendor=CJDropshipping`;
  for (let page = 0; page < 20 && url; page++) {
    const res = await apiRequest(SHOPIFY_STORE, url, 'GET',
      { 'X-Shopify-Access-Token': SHOPIFY_TOKEN });
    const list = res.products || [];
    for (const p of list) {
      const m = (p.tags || '').match(/cj-pid:([^,\s]+)/);
      if (m) pids.add(m[1]);
    }
    url = list.length === 250 ? `/admin/api/2024-01/products.json?limit=250&fields=id,tags&vendor=CJDropshipping&since_id=${list[list.length - 1].id}` : null;
  }
  return pids;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🇨🇷  Nova Shop CR — Importador (mismo método que USA, probado)\n');

  const cjToken = await getCJToken();
  console.log('✅  CJ autenticado\n');

  const existingPids = await getExistingPids();
  console.log(`📦  ${existingPids.size} cj-pid ya en Shopify (se omiten para no duplicar)\n`);

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

    // Deduplicar + filtrar precio impulso (productos ya relevantes por categoría)
    const seen = new Set();
    candidates = candidates.filter(p => {
      if (!p.pid || seen.has(p.pid)) return false;
      if (existingPids.has(p.pid)) return false;  // dedup ANTES de gastar getDetail
      if (!p.sellPrice || p.sellPrice <= 0 || p.sellPrice > 22) return false;
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
        if (existingPids.has(full.pid)) continue;  // ya importado → no duplicar

        const created = await createProduct(full, cat);
        if (!created?.id) continue;

        await attachAndPublish(created, collectionId);
        existingPids.add(full.pid);
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
