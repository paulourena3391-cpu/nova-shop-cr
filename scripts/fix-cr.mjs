// fix-cr: reclasifica/traduce/arregla precios. Log a archivo (flush inmediato), robusto.
import fs from 'fs';
const LOG = 'C:/Users/Administrator/Documents/nova-shop-cr/fixlog.txt';
const log = (m) => { fs.appendFileSync(LOG, m + '\n'); };
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
      if (m === 'DELETE') return {};
      return await r.json();
    } catch (e) { clearTimeout(to); log('  retry rest: ' + e.message); await sleep(1500); }
  }
  return {};
}

function classify(title) {
  const t = ' ' + title.toLowerCase() + ' ';
  const has = (re) => re.test(t);
  if (has(/\bbbq\b|grill|barbecue|skewer|basting|meat claw|charcoal|spatula|grilling|kebab|rotisserie|smoker|griddle/)) return 'BBQ';
  if (has(/\bdog\b|\bcat\b|\bpet\b|puppy|kitten|leash|aquarium|fish tank|\bbird\b|\bpaw\b|kennel|chew toy|litter|harness|feeder|scratch/)) return 'Pet Supplies';
  if (has(/smartwatch|smart watch|wristwatch|fitness tracker|fitness band|\bwatch\b|reloj inteligente|reloj/)) return 'Watches';
  if (has(/\bshoe|sneaker|loafer|sandal|\bboot|\bheel|footwear|slipper|\bclog|trainers|flip ?flop|moccasin|espadrille|zapato|zapatilla/)) return 'Footwear';
  if (has(/makeup|maquillaje|\bnail|\bu[ñn]as|\bhair\b|cabello|facial|\blash|eyebrow|cosmetic|\bbeauty|epilator|lipstick|eyeshadow|mascara|skincare|serum|moisturizer|shaver|trimmer|razor|hair dryer|perfume|brow|comb|manicure|pedicure|tweezer|blackhead|pore|\bwax\b/)) return 'Beauty';
  if (has(/\bcar\b|\bauto\b|vehicle|\btire|\btyre|dash ?cam|windshield|steering|seat cover|license plate|wiper|car wash|motorcycle|truck|garage|engine|tire pressure|jump starter/)) return 'Auto';
  if (has(/fitness|\byoga|workout|resistance band|dumbbell|\bgym\b|posture|jump rope|muscle|exercise|abdominal|massage gun|treadmill|pull up|push up|barbell|kettlebell|boxing|cycling|hiking|camping|tent|fishing|knee pad/)) return 'Sports & Fitness';
  if (has(/\busb|charger|cargador|\bcable|power bank|earphone|earbud|headphone|aud[ií]fonos|bluetooth|phone (case|holder|stand|mount|grip)|\bled\b|hdmi|adapter|speaker|parlante|flash drive|\bmemory|gamepad|\bmouse\b|keyboard|teclado|projector|charging|wireless|tripod|tr[ií]pode|selfie|camera|c[áa]mara|webcam|microphone|laptop|tablet|router|monitor|drone|\bgps\b|sd card|controller|console|gaming|screen protector|ring light|smart bulb|doorbell|night vision/)) return 'Electronics';
  if (has(/organizer|organizador|storage|kitchen|cocina|drawer|\brack\b|\bholder|hanger|dispenser|\bshelf|\bhook\b|closet|\btowel|toalla|curtain|cortina|pillow|almohada|\bcup\b|bottle|botella|\bjar\b|cleaning|limpieza|\bmop\b|cutting board|spice|\bbin\b|\bvase|\blamp\b|l[áa]mpara|candle|blanket|cobija|bedding|sheet|mattress|sofa|cushion|tablecloth|coaster|napkin|cookware|\bpan\b|\bpot\b|knife|cuchillo|utensil|bowl|plate|mug|peeler|grater|strainer|tray|basket|canasta|garden|plant|doormat|rug|wall (sticker|art|decor)|frame|mirror|espejo|broom|laundry|trash|toilet|bathroom|shower|faucet|soap/)) return 'Home & Living';
  const isClothing = has(/dress|vestido|skirt|falda|blouse|blusa|\bshirt|camisa|sweater|su[ée]ter|cardigan|jumpsuit|romper|swimsuit|swimwear|bikini|jacket|chaqueta|\bcoat\b|hoodie|sweatshirt|tank top|trousers|pantal[oó]n|\bpants\b|\bjeans\b|\bshorts\b|underwear|lingerie|nightgown|pajama|pijama|\bbra\b|legging|blazer|\bsuit\b|\bpolo\b|knit|long-sleeve|short-sleeve|sleeveless|v-neck|crew neck|outfit|two-piece|maxi|tunic|camis[oó]n|bodysuit|leotard|kimono/);
  if (isClothing) {
    const isMen = has(/\bhombre\b|\bmen\b|\bmens\b|\bmale\b|\bboys?\b/);
    const isWomen = has(/\bmujer\b|\bwomen\b|\bwomens\b|\blad(y|ies)\b|\bfemale\b|\bgirls?\b|dress|vestido|skirt|falda|blouse|blusa|bikini|swimsuit|lingerie|nightgown|maxi/);
    if (isMen && !isWomen) return "Men's Clothing";
    return "Women's Clothing";
  }
  return 'Varios';
}

(async () => {
  try {
    let prods = [], sinceId = 0;
    for (let pg = 0; pg < 20; pg++) {
      const r = await rest(`products.json?limit=250&fields=id,title,product_type,tags,variants&since_id=${sinceId}`);
      const l = r.products || [];
      if (!l.length) break;
      prods = prods.concat(l.filter((p) => (p.tags || '').includes('market-cr')));
      sinceId = l[l.length - 1].id;
      if (l.length < 250) break;
    }
    log('productos market-cr: ' + prods.length);
    const seen = new Set();
    let dup = 0, changed = 0, priced = 0, i = 0;
    const tc = {};
    for (const p of prods) {
      i++;
      try {
        const norm = (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
        if (seen.has(norm)) { await rest(`products/${p.id}.json`, 'DELETE'); dup++; await sleep(400); continue; }
        seen.add(norm);
        const type = classify(p.title);
        tc[type] = (tc[type] || 0) + 1;
        const valid = p.variants.map((v) => parseFloat(v.price)).filter((x) => x > 0);
        const floor = valid.length ? Math.min(...valid) : 9.99;
        const fixVars = p.variants.filter((v) => !(parseFloat(v.price) > 0)).map((v) => ({ id: v.id, price: floor.toFixed(2) }));
        if (p.product_type === type && !fixVars.length) { if (i % 50 === 0) log('  .. ' + i + '/' + prods.length); continue; }
        const body = { product: { id: p.id, product_type: type, tags: `market-cr,product_type:${type}` } };
        if (fixVars.length) { body.product.variants = fixVars; priced += fixVars.length; }
        await rest(`products/${p.id}.json`, 'PUT', body);
        changed++;
        if (changed % 25 === 0) log('  cambiados ' + changed + ' (item ' + i + ')');
        await sleep(450);
      } catch (e) { log('  ERROR item ' + i + ': ' + e.message); }
    }
    log('FIN | dup:' + dup + ' | cambiados:' + changed + ' | precios:' + priced);
    log('CATEGORIAS: ' + JSON.stringify(tc));
  } catch (e) { log('CRASH: ' + (e && e.stack || e)); }
})();
