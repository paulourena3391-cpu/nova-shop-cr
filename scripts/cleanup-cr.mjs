// Auditoría/limpieza de catálogo CR: dedup, re-categorizar, traducir títulos, fix precios ₡0
const T = process.env.SHOPIFY_ADMIN_TOKEN, H = 'yd7u79-bt.myshopify.com';
async function rest(p, m, b) {
  const r = await fetch(`https://${H}/admin/api/2024-10/${p}`, {
    method: m || 'GET',
    headers: { 'X-Shopify-Access-Token': T, 'Content-Type': 'application/json' },
    body: b ? JSON.stringify(b) : undefined,
  });
  return m === 'DELETE' ? {} : r.json();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function classify(title) {
  const t = ' ' + title.toLowerCase() + ' ';
  if (/\bbbq\b|grill|barbecue|skewer|basting|meat claw|charcoal|spatula/.test(t)) return 'BBQ';
  if (/\bdog\b|\bcat\b|\bpet\b|puppy|kitten|leash|aquarium|fish tank|\bbird\b|\bpaw\b|kennel/.test(t)) return 'Pet Supplies';
  if (/watch|reloj|wristwatch|smartwatch/.test(t)) return 'Watches';
  if (/\bshoe|sneaker|loafer|sandal|\bboot|\bheel|footwear|slipper|\bclog/.test(t)) return 'Footwear';
  if (/makeup|\bnail|\bhair|facial|\blash|eyebrow|cosmetic|\bbeauty|massager|curler|straighten|epilator|lipstick|eyeshadow|mascara/.test(t)) return 'Beauty';
  if (/\bcar\b|\bauto\b|vehicle|\btire|\btyre|dash ?cam|windshield|steering|seat cover/.test(t)) return 'Auto';
  if (/fitness|\byoga|workout|resistance band|dumbbell|\bgym\b|posture|jump rope|muscle|exercise|abdominal/.test(t)) return 'Sports & Fitness';
  if (/\busb|charger|\bcable|power bank|earphone|earbud|headphone|bluetooth|phone (case|holder|stand|mount)|\bled\b|hdmi|adapter|speaker|flash drive|\bmemory|gamepad|\bmouse\b|keyboard|projector|charging|wireless|tripod|selfie/.test(t)) return 'Electronics';
  if (/organizer|storage|kitchen|drawer|\brack\b|\bholder|hanger|dispenser|\bshelf|\bhook\b|closet|\btowel|curtain|pillow|\bcup\b|bottle|\bjar\b|cleaning|\bmop\b|cutting board|spice|\bbin\b/.test(t)) return 'Home & Living';
  return 'Varios';
}

const DIC = {
  'stainless steel': 'Acero Inoxidable', 'fast charging': 'Carga Rápida', 'power bank': 'Power Bank',
  'smart watch': 'Reloj Inteligente', 'heavy duty': 'Resistente', 'non-slip': 'Antideslizante',
  'multi-functional': 'Multifuncional', 'multifunctional': 'Multifuncional',
  wireless: 'Inalámbrico', portable: 'Portátil', rechargeable: 'Recargable', waterproof: 'Impermeable',
  adjustable: 'Ajustable', foldable: 'Plegable', automatic: 'Automático', leather: 'Cuero', silicone: 'Silicona',
  for: 'para', with: 'con', and: 'y', the: '', men: 'Hombre', mens: 'Hombre', women: 'Mujer', womens: 'Mujer',
  kids: 'Niños', baby: 'Bebé', dog: 'Perro', dogs: 'Perro', cat: 'Gato', cats: 'Gato', pet: 'Mascota',
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
  let dup = 0, recat = 0, trans = 0, priced = 0;
  const tc = {};
  for (const p of prods) {
    const norm = (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
    if (seen.has(norm)) { await rest(`products/${p.id}.json`, 'DELETE'); dup++; await sleep(350); continue; }
    seen.add(norm);
    const type = classify(p.title);
    tc[type] = (tc[type] || 0) + 1;
    const newTitle = translate(p.title);
    const valid = p.variants.map((v) => parseFloat(v.price)).filter((x) => x > 0);
    const floor = valid.length ? Math.min(...valid) : 9.99;
    const fixVars = p.variants.filter((v) => !(parseFloat(v.price) > 0)).map((v) => ({ id: v.id, price: floor.toFixed(2) }));
    const body = { product: { id: p.id, title: newTitle, product_type: type, tags: `market-cr,product_type:${type}` } };
    if (fixVars.length) { body.product.variants = fixVars; priced += fixVars.length; }
    await rest(`products/${p.id}.json`, 'PUT', body);
    recat++;
    if (newTitle !== p.title) trans++;
    await sleep(350);
  }
  console.log('✅ dup borrados:', dup, '| recategorizados:', recat, '| títulos traducidos:', trans, '| precios ₡0 arreglados:', priced);
  console.log('categorías:', JSON.stringify(tc));
})();
