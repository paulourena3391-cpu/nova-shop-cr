import fs from 'fs';
const DIR = 'C:/Users/Administrator/Downloads';

function parseCSV(t) {
  const rows = []; let i = 0, f = '', row = [], q = false;
  while (i < t.length) {
    const c = t[i];
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else {
      if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && t[i + 1] === '\n') i++;
        if (f !== '' || row.length) { row.push(f); rows.push(row); row = []; f = ''; }
      } else f += c;
    }
    i++;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows;
}

// Construye mapa SKU -> { base, ship, total }
export function buildCostMap() {
  const files = fs.readdirSync(DIR).filter((f) => /^Added-Products-.*\.csv$/.test(f) && !/\(1\)/.test(f));
  const map = {};
  for (const file of files) {
    const rows = parseCSV(fs.readFileSync(DIR + '/' + file, 'utf8'));
    const h = rows[0]; const ci = (n) => h.indexOf(n);
    const cSku = ci('SKU'), cBase = ci('Product Base Price ($)'), cShip = ci('Shipping Fee ($)'), cTot = ci('Total Cost ($)');
    for (const r of rows.slice(1)) {
      const sku = r[cSku];
      if (!sku) continue;
      const base = parseFloat(r[cBase]) || 0;
      const ship = parseFloat(r[cShip]) || 0;
      const total = parseFloat(r[cTot]) || (base + ship);
      map[sku] = { base, ship, total };
    }
  }
  return map;
}

// Si se ejecuta directo: muestra ejemplos
if (process.argv[2] === '--demo') {
  const map = buildCostMap();
  console.log('SKUs totales en CSVs:', Object.keys(map).length);
  for (const sku of ['CJLY146220301AZ', 'CJLY146220305EV', 'CJLY146220306FU', 'CJLY146220308HS']) {
    console.log(sku, JSON.stringify(map[sku]));
  }
}
