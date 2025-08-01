const Database = require('better-sqlite3');
const db = new Database('naova.sqlite');

const rows = db.prepare(`
  SELECT q.id as quotation_id, q.status, q.user_id as cliente_id, qi.id as item_id, qi.product_id, qi.provider_id
  FROM quotations q
  LEFT JOIN quotation_items qi ON qi.quotation_id = q.id
  ORDER BY q.id, qi.id
`).all();

console.log('Todas las cotizaciones y sus items:');
if (rows.length === 0) {
  console.log('No hay cotizaciones en la base de datos.');
} else {
  for (const row of rows) {
    console.log(row);
  }
} 