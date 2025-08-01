import { db } from './src/database/connection.js';

// Cambiar el status de todas las cotizaciones a 'pedido'
const updated = db.prepare("UPDATE quotations SET status = 'pedido' WHERE status != 'pedido'").run().changes;

console.log(`Cotizaciones actualizadas a 'pedido': ${updated}`);

// Mostrar cotizaciones recientes
console.log('\nCotizaciones recientes:');
db.prepare('SELECT id, customer_name, status, created_at FROM quotations ORDER BY id DESC LIMIT 10').all().forEach(q =>
  console.log(`ID: ${q.id} | Cliente: ${q.customer_name} | Status: ${q.status} | Fecha: ${q.created_at}`)
);

db.close(); 