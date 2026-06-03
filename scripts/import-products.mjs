/**
 * Nova Shop CR — Auto Product Importer
 * Fetches best-selling products from CJ Dropshipping
 * and creates them in Shopify via Admin API
 *
 * Usage: node scripts/import-products.mjs
 */

import https from 'https';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const CJ_EMAIL    = 'paulourena3391@gmail.com';
const CJ_PASSWORD = 'CJ1121382@api@5501fed4f561429bbd58116e7a6d02d2';
const SHOPIFY_STORE = 'yd7u79-bt.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN || 'PASTE_TOKEN_HERE';

// Pricing rule: multiply CJ price by this factor
function getMarkup(cjPrice) {
  if (cjPrice <= 5)  return 2.5;
  if (cjPrice <= 15) return 2.0;
  if (cjPrice <= 30) return 2.0;
  return 1.8;
}

// CJ Category IDs mapped to our collections
// Women's Clothing: 2FE8A083-5E7B-4179-896D-561EA116F730
// Men's Clothing:   will be searched separately
const CATEGORIES = [
  { handle: 'womens-clothing',  categoryId: '2FE8A083-5E7B-4179-896D-561EA116F730', type: "Women's Clothing",  tags: 'mujer,ropa,moda,women',   count: 25 },
  { handle: 'hombre',           categoryId: 'B8302697-CF47-4211-9BD0-DFE8995AEB30', type: "Men's Clothing",    tags: 'hombre,ropa,men,moda',    count: 25 },
  { handle: 'calzado-de-mujer', categoryId: '2415A90C-5D7B-4CC7-BA8C-C0949F9FF5D8', type: "Women's Footwear",  tags: 'calzado,zapatos,mujer',   count: 20 },
  { handle: 'fitness',          categoryId: '4B397425-26C1-4D0E-B6D2-96B0B03689DB', type: "Sports & Fitness",  tags: 'fitness,deporte,gym',     count: 20 },
  { handle: 'audio',            categoryId: 'D9E66BF8-4E81-4CAB-A425-AEDEC5FBFBF2', type: "Electronics",       tags: 'audio,bluetooth,music',   count: 15 },
  { handle: 'decoracion',       categoryId: '52FC6CA5-669B-4D0B-B1AC-415675931399', type: "Home Decor",        tags: 'hogar,decoracion,home',   count: 15 },
  { handle: 'cocina',           categoryId: '52FC6CA5-669B-4D0B-B1AC-415675931399', type: "Kitchen",           tags: 'cocina,hogar,kitchen',    count: 15 },
];

// ─── HTTP HELPER ──────────────────────────────────────────────────────────────
function apiRequest(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const options = { hostname, path, method, headers };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── CJ API ──────────────────────────────────────────────────────────────────
async function getCJToken() {
  const res = await apiRequest(
    'developers.cjdropshipping.com',
    '/api2.0/v1/authentication/getAccessToken',
    'POST',
    { 'Content-Type': 'application/json' },
    { email: CJ_EMAIL, password: CJ_PASSWORD }
  );
  if (!res.data?.accessToken) throw new Error('CJ auth failed: ' + JSON.stringify(res));
  console.log('✅ CJ authenticated');
  return res.data.accessToken;
}

async function searchCJProducts(token, categoryId, page = 1, limit = 20) {
  const params = new URLSearchParams({
    categoryId,
    pageNum: page,
    pageSize: limit,
    orderBy: 'totalSold',
  });
  const res = await apiRequest(
    'developers.cjdropshipping.com',
    `/api2.0/v1/product/list?${params}`,
    'GET',
    { 'CJ-Access-Token': token }
  );
  return res.data?.list || [];
}

async function getCJProductDetail(token, pid) {
  const res = await apiRequest(
    'developers.cjdropshipping.com',
    `/api2.0/v1/product/query?pid=${pid}`,
    'GET',
    { 'CJ-Access-Token': token }
  );
  return res.data;
}

// ─── SHOPIFY API ──────────────────────────────────────────────────────────────
async function getShopifyCollectionId(handle) {
  const res = await apiRequest(
    SHOPIFY_STORE,
    `/admin/api/2024-01/custom_collections.json?handle=${handle}`,
    'GET',
    { 'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json' }
  );
  const collections = res.custom_collections || [];
  if (collections.length > 0) return collections[0].id;

  // Try smart collections
  const res2 = await apiRequest(
    SHOPIFY_STORE,
    `/admin/api/2024-01/smart_collections.json?handle=${handle}`,
    'GET',
    { 'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json' }
  );
  const smart = res2.smart_collections || [];
  return smart.length > 0 ? smart[0].id : null;
}

async function createShopifyProduct(product, category) {
  const sellPrice = parseFloat(
    (product.sellPrice * getMarkup(product.sellPrice)).toFixed(2)
  );

  const images = (product.productImageSet || [])
    .slice(0, 5)
    .map(url => ({ src: url }));

  const variants = (product.variants || []).slice(0, 50).map(v => ({
    price: sellPrice.toString(),
    sku: v.vid || '',
    option1: v.variantName || 'Default',
    inventory_management: null,
    inventory_policy: 'continue',
    requires_shipping: true,
    taxable: true,
  }));

  if (variants.length === 0) {
    variants.push({
      price: sellPrice.toString(),
      inventory_management: null,
      inventory_policy: 'continue',
      requires_shipping: true,
      taxable: true,
    });
  }

  const shopifyProduct = {
    product: {
      title: product.productNameEn || product.productName,
      body_html: `<p>${product.description || product.productNameEn || ''}</p>`,
      vendor: 'NovaGoods',
      product_type: category.type,
      tags: category.tags,
      status: 'active',
      images,
      variants,
    }
  };

  const res = await apiRequest(
    SHOPIFY_STORE,
    '/admin/api/2024-01/products.json',
    'POST',
    {
      'X-Shopify-Access-Token': SHOPIFY_TOKEN,
      'Content-Type': 'application/json',
    },
    shopifyProduct
  );

  return res.product;
}

async function addProductToCollection(productId, collectionId) {
  await apiRequest(
    SHOPIFY_STORE,
    '/admin/api/2024-01/collects.json',
    'POST',
    {
      'X-Shopify-Access-Token': SHOPIFY_TOKEN,
      'Content-Type': 'application/json',
    },
    { collect: { product_id: productId, collection_id: collectionId } }
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Nova Shop CR — Product Importer\n');

  if (SHOPIFY_TOKEN === 'PASTE_TOKEN_HERE') {
    console.error('❌ Falta el SHOPIFY_TOKEN. Ejecutá: SHOPIFY_TOKEN=xxx node scripts/import-products.mjs');
    process.exit(1);
  }

  const cjToken = await getCJToken();
  let totalImported = 0;

  for (const cat of CATEGORIES) {
    console.log(`\n📦 Importando: ${cat.handle} (${cat.count} productos)`);

    // Get collection ID from Shopify
    const collectionId = await getShopifyCollectionId(cat.handle);
    if (!collectionId) {
      console.log(`  ⚠️  Colección "${cat.handle}" no encontrada en Shopify, saltando...`);
      continue;
    }
    console.log(`  ✅ Colección ID: ${collectionId}`);

    // Search CJ products by category ID
    const products = await searchCJProducts(cjToken, cat.categoryId, 1, cat.count);
    console.log(`  📋 Encontrados ${products.length} productos en CJ`);

    let imported = 0;
    for (const p of products) {
      try {
        // Filter: only products with rating >= 4 and at least 10 orders
        if (p.productEvaluation && p.productEvaluation < 4) continue;
        if (p.sellPrice <= 0) continue;

        const shopifyProduct = await createShopifyProduct(p, cat);
        if (shopifyProduct?.id) {
          await addProductToCollection(shopifyProduct.id, collectionId);
          imported++;
          console.log(`  ✅ [${imported}/${products.length}] ${shopifyProduct.title?.slice(0, 50)}... → $${shopifyProduct.variants?.[0]?.price}`);
        }
        await sleep(500); // Rate limit: 2 req/sec
      } catch (err) {
        console.log(`  ⚠️  Error en producto: ${err.message}`);
      }
    }

    totalImported += imported;
    console.log(`  🎉 ${imported} productos importados a "${cat.handle}"`);
    await sleep(1000);
  }

  console.log(`\n✅ COMPLETADO: ${totalImported} productos importados en total`);
  console.log('🌐 Revisá tu tienda: https://nova-shop-cr.vercel.app\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
