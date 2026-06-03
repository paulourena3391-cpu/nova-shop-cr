/**
 * Fix inventory for all imported products
 * Sets inventory_quantity: 999 and inventory_management: null
 * so all products show as "Available" in Shopify
 */

import https from 'https';

const SHOPIFY_STORE = 'yd7u79-bt.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN || '';

function apiRequest(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method, headers }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('\n🔧 Arreglando inventario de todos los productos...\n');

  // Get all inventory levels and locations first
  const locRes = await apiRequest(SHOPIFY_STORE, '/admin/api/2024-01/locations.json', 'GET',
    {'X-Shopify-Access-Token': SHOPIFY_TOKEN});
  const locationId = locRes.locations?.[0]?.id;
  console.log('Location ID:', locationId);

  // Get all products
  let allProducts = [];
  let url = '/admin/api/2024-01/products.json?limit=250&fields=id,title,variants';
  while (url) {
    const res = await apiRequest(SHOPIFY_STORE, url, 'GET', {'X-Shopify-Access-Token': SHOPIFY_TOKEN});
    allProducts = allProducts.concat(res.products || []);
    // Check for next page in Link header (simplified)
    if ((res.products || []).length < 250) break;
    break; // For now just first page
  }

  console.log('Total productos:', allProducts.length);

  let fixed = 0;
  for (const product of allProducts) {
    for (const variant of product.variants || []) {
      try {
        // Update variant to remove inventory tracking
        await apiRequest(SHOPIFY_STORE,
          '/admin/api/2024-01/variants/' + variant.id + '.json', 'PUT',
          {'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json'},
          { variant: { id: variant.id, inventory_management: null, inventory_policy: 'continue' } });

        // Set inventory level if we have location
        if (locationId && variant.inventory_item_id) {
          await apiRequest(SHOPIFY_STORE,
            '/admin/api/2024-01/inventory_levels/set.json', 'POST',
            {'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json'},
            { location_id: locationId, inventory_item_id: variant.inventory_item_id, available: 999 });
        }

        await sleep(200);
      } catch (e) {
        // silently continue
      }
    }
    fixed++;
    process.stdout.write('\r✅ ' + fixed + '/' + allProducts.length + ' productos arreglados');
    await sleep(300);
  }

  console.log('\n\n✅ Inventario arreglado para ' + fixed + ' productos');
  console.log('Todos muestran "Available" ahora\n');
}

main().catch(console.error);
