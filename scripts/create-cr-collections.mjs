/**
 * create-cr-collections.mjs
 *
 * Creates the 8 Costa Rica market collections in Shopify (cr- prefix).
 * Publishes each to both Online Store + Headless publications.
 *
 * Usage:
 *   node scripts/create-cr-collections.mjs
 *
 * Requires env var SHOPIFY_TOKEN (Admin API token with write_products + write_publications).
 */

import { setTimeout as sleep } from 'timers/promises';

const STORE        = 'yd7u79-bt.myshopify.com';
const TOKEN        = process.env.SHOPIFY_TOKEN;
if (!TOKEN) {
  console.error('Error: SHOPIFY_TOKEN env var required. Set it before running this script.');
  process.exit(1);
}
const API_VERSION  = '2024-10';
const ADMIN_URL    = `https://${STORE}/admin/api/${API_VERSION}`;

// Shopify publication GIDs
const PUB_ONLINE_STORE = 'gid://shopify/Publication/155260485802';
const PUB_HEADLESS     = 'gid://shopify/Publication/155432157354';

const CR_COLLECTIONS = [
  { title: 'Tecnología CR',          handle: 'cr-tecnologia',   description: 'Accesorios y gadgets tecnológicos disponibles en Costa Rica.' },
  { title: 'Belleza CR',             handle: 'cr-belleza',      description: 'Productos de belleza y cuidado personal con envío en CR.' },
  { title: 'Moda Mujer CR',          handle: 'cr-moda-mujer',   description: 'Ropa y accesorios de moda para mujer, envío rápido en CR.' },
  { title: 'Moda Hombre CR',         handle: 'cr-moda-hombre',  description: 'Ropa y accesorios de moda para hombre en Costa Rica.' },
  { title: 'Calzado CR',             handle: 'cr-calzado',      description: 'Zapatos, zapatillas y sandalias con envío en Costa Rica.' },
  { title: 'Hogar CR',               handle: 'cr-hogar',        description: 'Artículos para el hogar y decoración disponibles en CR.' },
  { title: 'Deportes y Fitness CR',  handle: 'cr-deportes',     description: 'Equipamiento deportivo y fitness con envío local en CR.' },
  { title: 'Mascotas CR',            handle: 'cr-mascotas',     description: 'Productos para mascotas disponibles en Costa Rica.' },
];

async function adminFetch(path, method = 'GET', body) {
  const res = await fetch(`${ADMIN_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function adminGraphQL(query, variables = {}) {
  const res = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

async function publishCollection(gid) {
  const mutation = `
    mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        publishable { availablePublicationCount publishedOnCurrentPublication }
        userErrors { field message }
      }
    }
  `;
  return adminGraphQL(mutation, {
    id: gid,
    input: [
      { publicationId: PUB_ONLINE_STORE },
      { publicationId: PUB_HEADLESS },
    ],
  });
}

async function main() {
  console.log('Creating CR collections...\n');

  for (const col of CR_COLLECTIONS) {
    process.stdout.write(`→ ${col.handle} ... `);

    const data = await adminFetch('/custom_collections.json', 'POST', {
      custom_collection: {
        title: col.title,
        handle: col.handle,
        body_html: col.description,
        published: true,
      },
    });

    if (data.errors || !data.custom_collection) {
      const msg = data.errors
        ? JSON.stringify(data.errors)
        : `handle may already exist — skipping`;
      console.log(`⚠  ${msg}`);
    } else {
      const colId    = data.custom_collection.id;
      const colGID   = `gid://shopify/Collection/${colId}`;
      console.log(`created (ID ${colId})`);

      // Publish to both channels
      const pub = await publishCollection(colGID);
      const errs = pub.data?.publishablePublish?.userErrors ?? [];
      if (errs.length) {
        console.log(`  ⚠  publish errors: ${errs.map((e) => e.message).join(', ')}`);
      } else {
        console.log(`  ✓ published to Online Store + Headless`);
      }
    }

    await sleep(1200); // stay under rate limit
  }

  console.log('\nDone. Collections created and published.');
  console.log('\nNext: add products to each collection from Dropi or manually via Shopify Admin.');
}

main().catch(console.error);
