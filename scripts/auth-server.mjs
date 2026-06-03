/**
 * Nova Shop CR — OAuth Token Generator
 * Runs a local server to get the Shopify Admin API token automatically
 *
 * 1. node scripts/auth-server.mjs
 * 2. Abre http://localhost:3001 en el navegador
 * 3. Se abre Shopify OAuth → aprobas
 * 4. El token se guarda automáticamente en .env.local
 */

import http from 'http';
import https from 'https';
import { readFileSync, writeFileSync } from 'fs';
import { URL } from 'url';

const CLIENT_ID     = '1f0d3b23f78ea6ddd4ed8d5291aa68bb';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'PASTE_SECRET_HERE';
const SHOP          = 'yd7u79-bt.myshopify.com';
const REDIRECT_URI  = 'http://localhost:3001/callback';
const SCOPES        = 'write_products,read_products,write_collections,read_publications,read_product_listings';
const PORT          = 3001;

function httpsPost(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Step 1: Redirect to Shopify OAuth
  if (url.pathname === '/' || url.pathname === '/auth') {
    const authUrl = `https://${SHOP}/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=nova123`;
    res.writeHead(302, { Location: authUrl });
    res.end();
    console.log('\n🔗 Redirigiendo a Shopify OAuth...');
    return;
  }

  // Step 2: Handle OAuth callback
  if (url.pathname === '/callback') {
    const code  = url.searchParams.get('code');
    const shop  = url.searchParams.get('shop');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400); res.end(`Error: ${error}`);
      return;
    }

    if (!code) {
      res.writeHead(400); res.end('No code received');
      return;
    }

    console.log('✅ Código OAuth recibido, obteniendo token...');

    try {
      // Exchange code for token
      const data = await httpsPost(SHOP, '/admin/oauth/access_token', {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      });

      if (!data.access_token) {
        throw new Error('No token received: ' + JSON.stringify(data));
      }

      const token = data.access_token;
      console.log('\n🎉 TOKEN OBTENIDO:', token);

      // Save to .env.local
      let envContent = '';
      try { envContent = readFileSync('.env.local', 'utf8'); } catch {}

      if (envContent.includes('SHOPIFY_ADMIN_TOKEN=')) {
        envContent = envContent.replace(/SHOPIFY_ADMIN_TOKEN=.*/, `SHOPIFY_ADMIN_TOKEN=${token}`);
      } else {
        envContent += `\nSHOPIFY_ADMIN_TOKEN=${token}\n`;
      }
      writeFileSync('.env.local', envContent);
      console.log('✅ Token guardado en .env.local');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#0a0a0a;color:white">
          <h1 style="color:#ff6b1a">✅ ¡Token obtenido!</h1>
          <p>Token guardado automáticamente.</p>
          <pre style="background:#1a1a1a;padding:20px;border-radius:8px;color:#4ade80;word-break:break-all">${token}</pre>
          <p>Podés cerrar esta ventana.<br>Ahora corrés: <code style="color:#ff6b1a">node scripts/import-products.mjs</code></p>
        </body></html>
      `);

      console.log('\n🚀 Ahora corrés: node scripts/import-products.mjs\n');
      setTimeout(() => server.close(), 2000);

    } catch (err) {
      console.error('Error:', err.message);
      res.writeHead(500); res.end('Error: ' + err.message);
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  if (CLIENT_SECRET === 'PASTE_SECRET_HERE') {
    console.error('\n❌ Falta el CLIENT_SECRET.');
    console.error('Usá: CLIENT_SECRET=xxx node scripts/auth-server.mjs\n');
    process.exit(1);
  }
  console.log(`\n🚀 Servidor OAuth listo en http://localhost:${PORT}`);
  console.log('📋 Abrí http://localhost:3001 en tu navegador para autorizar\n');
});
