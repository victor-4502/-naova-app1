import { db } from './src/database/connection.js';

console.log('PROVIDERS (con user_id):');
db.prepare('SELECT id, name, email, user_id FROM providers').all().forEach(p =>
  console.log(`ProviderID: ${p.id} | Nombre: ${p.name} | Email: ${p.email} | user_id: ${p.user_id}`)
);

console.log('\nUSERS (proveedor):');
db.prepare('SELECT id, username, email FROM users WHERE role = ?').all('proveedor').forEach(u =>
  console.log(`UserID: ${u.id} | Username: ${u.username} | Email: ${u.email}`)
);

console.log('\nULTIMOS 10 QUOTATION_ITEMS:');
db.prepare('SELECT id, quotation_id, product_id, provider_id FROM quotation_items ORDER BY id DESC LIMIT 10').all().forEach(qi =>
  console.log(`ItemID: ${qi.id} | QuotationID: ${qi.quotation_id} | ProductID: ${qi.product_id} | ProviderID: ${qi.provider_id}`)
);

console.log('\nPROVIDERS de productos:');
db.prepare('SELECT pp.product_id, pp.provider_id, p.name as product_name FROM product_prices pp JOIN products p ON pp.product_id = p.id LIMIT 10').all().forEach(row =>
  console.log(`ProductID: ${row.product_id} | ProviderID: ${row.provider_id} | Product: ${row.product_name}`)
);

db.close(); 