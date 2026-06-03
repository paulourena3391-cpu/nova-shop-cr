/**
 * Nova Shop CR — Product Importer v3 (FINAL)
 * Imports from CJ with FULL variants (Color + Talla), images, description,
 * correct pricing, and auto-publishes to Online Store + Headless publications.
 */

import https from 'https';

const CJ_EMAIL    = 'paulourena3391@gmail.com';
const CJ_PASSWORD = 'CJ1121382@api@5501fed4f561429bbd58116e7a6d02d2';
const SHOPIFY_STORE = 'yd7u79-bt.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN || '';

const PUB_ONLINE   = 'gid://shopify/Publication/155260485802';
const PUB_HEADLESS = 'gid://shopify/Publication/155432157354';

function getMarkup(price) {
  if (price <= 5)  return 2.5;
  if (price <= 30) return 2.0;
  return 1.8;
}

// Each entry: one Shopify collection fed by one or more CJ category IDs
const CATEGORIES = [
  { handle: 'womens-clothing',  cjIds: ['2FE8A083-5E7B-4179-896D-561EA116F730'], type: "Women's Clothing", tags: 'mujer,ropa,moda,women',     count: 20 },
  { handle: 'hombre',           cjIds: ['B8302697-CF47-4211-9BD0-DFE8995AEB30'], type: "Men's Clothing",   tags: 'hombre,ropa,men,moda',      count: 20 },
  { handle: 'calzado-de-mujer', cjIds: ['AAB54987-4E92-40C7-B0F5-5E814C1E6980','1988B912-7A18-4ED2-B1E1-61ED290A0E82'], type: "Women's Footwear", tags: 'calzado,zapatos,mujer', count: 12 },
  { handle: 'calzado-de-hombre',cjIds: ['0F0296D6-F057-4FD4-9E06-95D5DBCCE6EB','D0E37ED0-65C8-43E3-8B84-C973040DCE9C'], type: "Men's Footwear",  tags: 'calzado,zapatos,hombre', count: 12 },
  { handle: 'ninas',            cjIds: ['C421D769-76CC-4515-909E-4E7167EE6ABE','713CBA54-B38E-4C86-9323-1252113E437F'], type: "Girls' Clothing",  tags: 'niñas,girls,ropa,kids',  count: 12 },
  { handle: 'ninos',            cjIds: ['8DA1BB63-9FC2-4817-9271-3474CDBDDB30','C938C806-CB88-46AB-B782-89ECD0B25E25'], type: "Boys' Clothing",   tags: 'niños,boys,ropa,kids',   count: 12 },
  { handle: 'fitness',          cjIds: ['4B397425-26C1-4D0E-B6D2-96B0B03689DB'], type: "Sports & Fitness", tags: 'fitness,deporte,gym',     count: 15 },
  { handle: 'audio',            cjIds: ['DAECCC3B-13D8-4978-86A8-61D3DF186134','C1AB7563-AED4-44D8-9F01-05BD91C65307'], type: "Electronics", tags: 'audio,bluetooth,audifonos', count: 12 },
  { handle: 'consumer-electronics', cjIds: ['C83EF2A0-8FA3-4713-9901-2FD6E4554D97','6DB79FAF-593D-4F52-B6FF-AB1D14331862'], type: "Electronics", tags: 'electronica,tech,smartwatch', count: 12 },
  { handle: 'decoracion',       cjIds: ['7B975B46-46DF-4C3A-BC58-1F4F2DDB9413','2409230854411618700'], type: "Home Decor", tags: 'hogar,decoracion,home', count: 12 },
  { handle: 'cocina',           cjIds: ['E448A723-43DC-4BD8-A9AD-2FB9699338B4','56845C3D-4D9E-4729-B5D4-6D7DE310C031'], type: "Kitchen", tags: 'cocina,hogar,kitchen', count: 12 },
];

function apiRequest(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method, headers }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Variant parsing ──────────────────────────────────────────────────────────
const SIZE_RX = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|5XL|\d{1,2}(\.\d)?|\d{2,3}cm|EU\d+|US\d+)$/i;

function isSize(s) { return SIZE_RX.test(s.trim()); }

// Build Shopify options + variants from CJ variant list
function buildVariantData(cjVariants, markup) {
  const variants = cjVariants.slice(0, 100); // Shopify cap

  // Parse each variantKey ("Color-Size" or "Size" or "Color")
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
    // Single option — detect if it's a size or a color
    const allSizes = parsed.every(p => p.parts[0] && isSize(p.parts[0]));
    optionNames = [allSizes ? 'Talla' : 'Color'];
  }

  const seen = new Set();
  const shopifyVariants = [];

  for (const { v, parts } of parsed) {
    const opt1 = parts[0] || 'Default';
    const opt2 = optionNames.length > 1 ? (parts[1] || 'Único') : undefined;
    const dedupeKey = opt1 + '|' + (opt2 || '');
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const basePrice = v.variantSellPrice || 0;
    const price = parseFloat((basePrice * markup).toFixed(2));

    const variant = {
      option1: opt1,
      price: price > 0 ? price.toString() : undefined,
      sku: v.variantSku || v.vid || '',
      inventory_management: null,
      inventory_policy: 'continue',
      inventory_quantity: 999,
      requires_shipping: true,
      taxable: true,
      weight: (v.variantWeight || 300) / 1000,
      weight_unit: 'kg',
    };
    if (opt2) variant.option2 = opt2;
    shopifyVariants.push(variant);
  }

  return {
    options: optionNames.map(name => ({ name })),
    variants: shopifyVariants,
  };
}

// ─── CJ ──────────────────────────────────────────────────────────────────────
async function getCJToken() {
  const res = await apiRequest('developers.cjdropshipping.com',
    '/api2.0/v1/authentication/getAccessToken', 'POST',
    {'Content-Type': 'application/json'}, {email: CJ_EMAIL, password: CJ_PASSWORD});
  if (!res.data?.accessToken) throw new Error('CJ auth failed');
  return res.data.accessToken;
}

async function listByCategory(token, cjId, count) {
  const params = new URLSearchParams({ categoryId: cjId, pageNum: 1, pageSize: count, orderBy: 'totalSold' });
  await sleep(1500);
  const res = await apiRequest('developers.cjdropshipping.com',
    '/api2.0/v1/product/list?' + params, 'GET', {'CJ-Access-Token': token});
  return res.data?.list || [];
}

async function getDetail(token, pid) {
  await sleep(1500);
  const res = await apiRequest('developers.cjdropshipping.com',
    '/api2.0/v1/product/query?pid=' + pid, 'GET', {'CJ-Access-Token': token});
  return res.data;
}

// ─── Shopify ──────────────────────────────────────────────────────────────────
async function getCollectionId(handle) {
  const res = await apiRequest(SHOPIFY_STORE,
    '/admin/api/2024-01/custom_collections.json?handle=' + handle, 'GET',
    {'X-Shopify-Access-Token': SHOPIFY_TOKEN});
  return res.custom_collections?.[0]?.id || null;
}

function buildImages(full) {
  const seen = new Set();
  const images = [];
  for (const url of (full.productImageSet || [])) {
    if (url && !seen.has(url)) { seen.add(url); images.push({ src: url }); }
  }
  try {
    const parsed = JSON.parse(full.productImage || '');
    (Array.isArray(parsed) ? parsed : [parsed]).forEach(u => {
      if (u && !seen.has(u)) { seen.add(u); images.push({ src: u }); }
    });
  } catch {
    if (full.productImage && !seen.has(full.productImage)) images.push({ src: full.productImage });
  }
  return images.slice(0, 10);
}

async function createProduct(full, cat) {
  const markup = getMarkup(full.sellPrice || 10);
  const images = buildImages(full);
  if (!images.length) return null;

  const { options, variants } = buildVariantData(full.variants || [], markup);

  // Fallback single variant
  let finalVariants = variants;
  let finalOptions = options;
  if (!finalVariants.length) {
    const price = parseFloat(((full.sellPrice || 10) * markup).toFixed(2));
    finalVariants = [{ price: price.toString(), inventory_management: null, inventory_policy: 'continue', inventory_quantity: 999, requires_shipping: true, taxable: true }];
    finalOptions = undefined;
  }

  const product = {
    title: full.productNameEn || full.productName || 'Producto',
    body_html: '<p>' + (full.description || full.productNameEn || '') + '</p>',
    vendor: 'NovaGoods',
    product_type: cat.type,
    tags: cat.tags,
    status: 'active',
    images,
    variants: finalVariants,
  };
  if (finalOptions) product.options = finalOptions;

  const res = await apiRequest(SHOPIFY_STORE, '/admin/api/2024-01/products.json', 'POST',
    {'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json'}, { product });
  return res.product;
}

async function attachAndPublish(productId, collectionId) {
  await apiRequest(SHOPIFY_STORE, '/admin/api/2024-01/collects.json', 'POST',
    {'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json'},
    { collect: { product_id: productId, collection_id: collectionId } });

  const gid = 'gid://shopify/Product/' + productId;
  await apiRequest(SHOPIFY_STORE, '/admin/api/2024-01/graphql.json', 'POST',
    {'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json'},
    { query: 'mutation { publishablePublish(id: "' + gid + '", input: [{publicationId: "' + PUB_ONLINE + '"}, {publicationId: "' + PUB_HEADLESS + '"}]) { userErrors { message } } }' });
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Nova Shop CR — Importador v3 (con tallas, colores y variantes)\n');
  if (!SHOPIFY_TOKEN) { console.error('❌ Falta SHOPIFY_TOKEN'); process.exit(1); }

  const cjToken = await getCJToken();
  console.log('✅ CJ autenticado\n');

  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  let total = 0;

  for (const cat of CATEGORIES) {
    if (only && !only.includes(cat.handle)) continue;

    console.log('📦 ' + cat.handle + ' (meta: ' + cat.count + ')');
    const collectionId = await getCollectionId(cat.handle);
    if (!collectionId) { console.log('  ⚠️ colección no existe\n'); continue; }

    // Gather candidates from all CJ subcategories
    let candidates = [];
    for (const cjId of cat.cjIds) {
      candidates = candidates.concat(await listByCategory(cjToken, cjId, cat.count + 5));
    }

    let imported = 0;
    for (const p of candidates) {
      if (imported >= cat.count) break;
      try {
        if (!p.sellPrice || p.sellPrice <= 0 || p.sellPrice > 120) continue;
        const full = await getDetail(cjToken, p.pid);
        if (!full?.pid) continue;
        const created = await createProduct(full, cat);
        if (created?.id) {
          await attachAndPublish(created.id, collectionId);
          imported++;
          const nVars = created.variants?.length || 1;
          const nOpts = created.options?.map(o => o.name).join('+') || 'simple';
          console.log('  ✅ [' + imported + '] ' + created.title?.slice(0, 38) + ' | ' + nVars + ' var (' + nOpts + ') | $' + created.variants?.[0]?.price);
        }
        await sleep(400);
      } catch (e) { console.log('  ⚠️ ' + e.message?.slice(0, 50)); }
    }
    total += imported;
    console.log('  🎉 ' + imported + ' importados\n');
  }

  console.log('✅ COMPLETADO: ' + total + ' productos con variantes\n');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
