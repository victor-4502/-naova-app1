import { db } from './src/database/connection.js';

console.log('PROVIDERS (id, name, email, user_id):');
db.prepare('SELECT id, name, email, user_id FROM providers').all().forEach(p =>
  console.log(`ProviderID: ${p.id} | Nombre: ${p.name} | Email: ${p.email} | user_id: ${p.user_id}`)
);

console.log('\nQUOTATION_ITEMS:');
db.prepare('SELECT id, quotation_id, product_id, provider_id FROM quotation_items ORDER BY id').all().forEach(qi =>
  console.log(`ItemID: ${qi.id} | QuotationID: ${qi.quotation_id} | ProductID: ${qi.product_id} | ProviderID: ${qi.provider_id}`)
);

db.close(); 