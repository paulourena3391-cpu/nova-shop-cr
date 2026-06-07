// Reclasificador CR v2: vaciar "Varios", traducir títulos, arreglar precios ₡0. Idempotente.
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
if (!T) { console.error('FALTA SHOPIFY_ADMIN_TOKEN'); process.exit(1); }
async function rest(p, m, b) {
  for (let a = 0; a < 6; a++) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 12000);
    try {
      const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, {
        method: m || 'GET',
        headers: { 'X-Shopify-Access-Token': T, 'Content-Type': 'application/json' },
        body: b ? JSON.stringify(b) : undefined,
        signal: ctrl.signal,
      });
      clearTimeout(to);
      if (r.status === 429) { await sleep(2000); continue; }
      return m === 'DELETE' ? {} : r.json();
    } catch (e) {
      clearTimeout(to);
      await sleep(1500); // timeout o error de red -> reintenta
    }
  }
  return {};
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Clasificador amplio -> una de las 10 categorías del menú (o Varios)
function classify(title) {
  const t = ' ' + title.toLowerCase() + ' ';
  const has = (re) => re.test(t);
  if (has(/\bbbq\b|grill|barbecue|skewer|basting|meat claw|charcoal|spatula|grilling|kebab|rotisserie|smoker|griddle/)) return 'BBQ';
  if (has(/\bdog\b|\bcat\b|\bpet\b|puppy|kitten|leash|aquarium|fish tank|\bbird\b|\bpaw\b|kennel|collar|chew toy|litter|harness|grooming.*(pet|dog|cat)|feeder|scratch/)) return 'Pet Supplies';
  if (has(/smartwatch|smart watch|wristwatch|fitness tracker|fitness band|\bwatch\b|reloj/)) return 'Watches';
  if (has(/\bshoe|sneaker|loafer|sandal|\bboot|\bheel|footwear|slipper|\bclog|trainers|flip ?flop|moccasin|espadrille/)) return 'Footwear';
  if (has(/makeup|\bnail|\bhair\b|facial|\blash|eyebrow|cosmetic|\bbeauty|epilator|lipstick|eyeshadow|mascara|skincare|serum|moisturizer|shaver|trimmer|razor|hair (dryer|clipper|curler|straighten)|perfume|brow|comb|manicure|pedicure|tweezer|blackhead|pore|wax\b/)) return 'Beauty';
  if (has(/\bcar\b|\bauto\b|vehicle|\btire|\btyre|dash ?cam|windshield|steering|seat cover|car (charger|mount|holder|organizer)|license plate|wiper|car wash|motorcycle|truck|garage|engine|tire pressure|jump starter/)) return 'Auto';
  if (has(/fitness|\byoga|workout|resistance band|dumbbell|\bgym\b|posture|jump rope|muscle|exercise|abdominal|massage gun|treadmill|pull up|push up|weight|barbell|kettlebell|boxing|cycling|running|hiking|camping|tent|fishing|sport|athletic|knee pad|ankle/)) return 'Sports & Fitness';
  if (has(/\busb|charger|\bcable|power bank|earphone|earbud|headphone|bluetooth|phone (case|holder|stand|mount|grip)|\bled\b|hdmi|adapter|speaker|flash drive|\bmemory|gamepad|\bmouse\b|keyboard|projector|charging|wireless (charger|mouse|keyboard)|tripod|selfie|camera|webcam|microphone|laptop|tablet|router|smart home|monitor|drone|fan\b|\bgps\b|sd card|controller|console|gaming|screen protector|ring light|smart bulb|doorbell|surveillance|night vision/)) return 'Electronics';
  if (has(/organizer|storage|kitchen|drawer|\brack\b|\bholder|hanger|dispenser|\bshelf|\bhook\b|closet|\btowel|curtain|pillow|\bcup\b|bottle|\bjar\b|cleaning|\bmop\b|cutting board|spice|\bbin\b|\bvase|\blamp\b|candle|blanket|bedding|sheet|mattress|sofa|cushion|tablecloth|coaster|napkin|kitchenware|cookware|\bpan\b|\bpot\b|knife|utensil|bowl|plate|mug|peeler|grater|strainer|colander|funnel|tray|basket|garden|plant|flower pot|doormat|rug|wall (sticker|art|decor)|frame|mirror|clock\b|broom|duster|laundry|trash|toilet|bathroom|shower|faucet|soap/)) return 'Home & Living';
  // Ropa -> por género
  const isClothing = has(/dress|vestido|skirt|falda|blouse|blusa|\bshirt|camisa|sweater|sueter|cardigan|jumpsuit|romper|swimsuit|swimwear|bikini|jacket|chaqueta|\bcoat\b|hoodie|sweatshirt|t-?camisa|tank top|trousers|pantal[oó]n|\bpants\b|\bjeans\b|\bshorts\b|underwear|lingerie|nightgown|pajama|pijama|\bbra\b|legging|blazer|\bsuit\b|\bpolo\b|knit|long-sleeve|short-sleeve|sleeveless|v-neck|crew neck|outfit|two-piece|maxi|tunic|vestido|camis[oó]n|bodysuit|leotard|kimono/);
  if (isClothing) {
    const isMen = has(/\bhombre\b|\bmen\b|\bmens\b|\bmale\b|\bboys?\b/);
    const isWomen = has(/\bmujer\b|\bwomen\b|\bwomens\b|\blad(y|ies)\b|\bfemale\b|\bgirls?\b|dress|vestido|skirt|falda|blouse|blusa|bikini|swimsuit|lingerie|nightgown|maxi/);
    if (isMen && !isWomen) return "Men's Clothing";
    return "Women's Clothing"; // por defecto la ropa va a Mujer
  }
  return 'Varios';
}

const DIC = {
  'stainless steel': 'Acero Inoxidable', 'fast charging': 'Carga Rápida', 'power bank': 'Power Bank',
  'smart watch': 'Reloj Inteligente', 'heavy duty': 'Resistente', 'non-slip': 'Antideslizante',
  'multi-functional': 'Multifuncional', multifunctional: 'Multifuncional', 'high quality': 'Alta Calidad',
  'led light': 'Luz LED', 'night light': 'Luz Nocturna', 'remote control': 'Control Remoto',
  'water bottle': 'Botella de Agua', 'cutting board': 'Tabla de Cortar', 'storage box': 'Caja Organizadora',
  'phone holder': 'Soporte de Celular', 'car charger': 'Cargador de Auto', 'dash cam': 'Cámara para Auto',
  wireless: 'Inalámbrico', portable: 'Portátil', rechargeable: 'Recargable', waterproof: 'Impermeable',
  adjustable: 'Ajustable', foldable: 'Plegable', automatic: 'Automático', leather: 'Cuero', silicone: 'Silicona',
  for: 'para', with: 'con', and: 'y', the: '', men: 'Hombre', mens: 'Hombre', women: 'Mujer', womens: 'Mujer',
  kids: 'Niños', baby: 'Bebé', dog: 'Perro', dogs: 'Perros', cat: 'Gato', cats: 'Gatos', pet: 'Mascota', pets: 'Mascotas',
  charger: 'Cargador', cable: 'Cable', earphones: 'Audífonos', earphone: 'Audífonos', headphones: 'Audífonos',
  earbuds: 'Audífonos', phone: 'Celular', holder: 'Soporte', stand: 'Soporte', case: 'Estuche', watch: 'Reloj',
  smartwatch: 'Reloj Inteligente', shoes: 'Zapatos', shoe: 'Zapato', sneakers: 'Zapatillas', sandals: 'Sandalias',
  boots: 'Botas', slippers: 'Pantuflas', car: 'Auto', organizer: 'Organizador', storage: 'Almacenamiento',
  kitchen: 'Cocina', bed: 'Cama', toy: 'Juguete', toys: 'Juguetes', brush: 'Cepillo', cleaning: 'Limpieza',
  grill: 'Parrilla', cover: 'Funda', set: 'Set', mini: 'Mini', new: 'Nuevo', black: 'Negro', white: 'Blanco',
  red: 'Rojo', blue: 'Azul', green: 'Verde', pink: 'Rosa', gray: 'Gris', grey: 'Gris', brown: 'Café',
  silver: 'Plateado', gold: 'Dorado', makeup: 'Maquillaje', hair: 'Cabello', nail: 'Uñas', massage: 'Masaje',
  massager: 'Masajeador', light: 'Luz', fitness: 'Fitness', yoga: 'Yoga', resistance: 'Resistencia',
  bands: 'Bandas', outdoor: 'Exterior', indoor: 'Interior', large: 'Grande', small: 'Pequeño',
  bottle: 'Botella', cup: 'Vaso', lamp: 'Lámpara', mirror: 'Espejo', clock: 'Reloj de Pared', knife: 'Cuchillo',
  towel: 'Toalla', pillow: 'Almohada', blanket: 'Cobija', curtain: 'Cortina', basket: 'Canasta',
  speaker: 'Parlante', keyboard: 'Teclado', mouse: 'Mouse', camera: 'Cámara', tripod: 'Trípode',
  necklace: 'Collar', bracelet: 'Pulsera', ring: 'Anillo', earrings: 'Aretes', wallet: 'Billetera',
  backpack: 'Mochila', bag: 'Bolso', hat: 'Gorra', glasses: 'Lentes', sunglasses: 'Lentes de Sol',
  jacket: 'Chaqueta', shirt: 'Camisa', dress: 'Vestido', pants: 'Pantalón', socks: 'Medias',
  electric: 'Eléctrico', smart: 'Inteligente', digital: 'Digital', professional: 'Profesional',
  waterproof: 'Impermeable', cordless: 'Inalámbrico', usb: 'USB', led: 'LED',
};
const cap = (w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w);
function translate(title) {
  let s = title;
  for (const k of Object.keys(DIC)) {
    if (!k.includes(' ')) continue;
    let i;
    while ((i = s.toLowerCase().indexOf(k)) >= 0) s = s.slice(0, i) + cap(DIC[k]) + s.slice(i + k.length);
  }
  s = s.split(/(\W+)/).map((tok) => {
    const d = DIC[tok.toLowerCase()];
    if (d === undefined) return tok;
    return /^[A-Z]/.test(tok) ? cap(d) : d;
  }).join('');
  s = s.replace(/\s+[A-Z]{2,}\d{3,}\s*$/, '').replace(/\s{2,}/g, ' ').trim();
  return s.slice(0, 140) || title.slice(0, 140);
}

(async () => {
  let prods = [], sinceId = 0;
  for (let pg = 0; pg < 20; pg++) {
    const r = await rest(`products.json?limit=250&fields=id,title,product_type,tags,variants&since_id=${sinceId}`);
    const l = r.products || [];
    if (!l.length) break;
    prods = prods.concat(l.filter((p) => (p.tags || '').includes('market-cr')));
    sinceId = l[l.length - 1].id;
    if (l.length < 250) break;
  }
  console.log('productos market-cr:', prods.length);
  const seen = new Set();
  let dup = 0, changed = 0, trans = 0, priced = 0, done = 0;
  const tc = {};
  for (const p of prods) {
    const norm = (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
    if (seen.has(norm)) { await rest(`products/${p.id}.json`, 'DELETE'); dup++; await sleep(550); continue; }
    seen.add(norm);
    const type = classify(p.title);
    tc[type] = (tc[type] || 0) + 1;
    const newTitle = translate(p.title);
    const valid = p.variants.map((v) => parseFloat(v.price)).filter((x) => x > 0);
    const floor = valid.length ? Math.min(...valid) : 9.99;
    const fixVars = p.variants.filter((v) => !(parseFloat(v.price) > 0)).map((v) => ({ id: v.id, price: floor.toFixed(2) }));
    const needType = p.product_type !== type;
    const needTitle = newTitle !== p.title;
    if (!needType && !needTitle && !fixVars.length) { done++; if (done % 100 === 0) console.log('...', done); continue; }
    const body = { product: { id: p.id, title: newTitle, product_type: type, tags: `market-cr,product_type:${type}` } };
    if (fixVars.length) { body.product.variants = fixVars; priced += fixVars.length; }
    await rest(`products/${p.id}.json`, 'PUT', body);
    changed++;
    if (needTitle) trans++;
    done++;
    if (done % 100 === 0) console.log('...', done);
    await sleep(550);
  }
  console.log('FIN | dup:', dup, '| modificados:', changed, '| títulos traducidos:', trans, '| precios ₡0 arreglados:', priced);
  console.log('CATEGORIAS:', JSON.stringify(tc));
})();
