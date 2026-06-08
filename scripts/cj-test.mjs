import https from 'https';
const CJ_EMAIL = 'paulourena3391@gmail.com';
const CJ_PASSWORD = 'CJ1121382@api@5501fed4f561429bbd58116e7a6d02d2';
function api(path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: 'developers.cjdropshipping.com', path, method, headers, timeout: 25000 }, (res) => {
      let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d.slice(0, 200) }); } });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const auth = await api('/api2.0/v1/authentication/getAccessToken', 'POST', { 'Content-Type': 'application/json' }, { email: CJ_EMAIL, password: CJ_PASSWORD });
  const token = auth.data?.accessToken;
  console.log('token?', !!token, auth.message || '');
  if (!token) { console.log(JSON.stringify(auth).slice(0, 300)); return; }
  const tests = ['CJLY146220301AZ', 'CJQL280008101AZ'];
  for (const sku of tests) {
    for (const cand of [sku, sku.slice(0, -4), sku.slice(0, -2)]) {
      await sleep(1500);
      const r = await api('/api2.0/v1/product/query?productSku=' + encodeURIComponent(cand), 'GET', { 'CJ-Access-Token': token });
      const d = r.data;
      const vars = d?.variants;
      console.log(`SKU ${sku} (productSku=${cand}) → code=${r.code} msg=${r.message || ''} variants=${vars ? vars.length : 'none'} weight=${d?.productWeight}`);
      if (vars && vars.length) {
        console.log('   ej variante:', JSON.stringify({ sku: vars[0].variantSku, cost: vars[0].variantSellPrice, w: vars[0].variantWeight }));
        break;
      }
    }
  }
})();
