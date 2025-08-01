import { db } from './src/database/connection.js';

// 1. Obtener todos los providers actuales (id, name, email)
const providers = db.prepare('SELECT id, name, email FROM providers').all();
const providerMap = {};
providers.forEach(p => {
  providerMap[`${p.name}|${p.email}`] = p.id;
});

// 2. Obtener todos los quotation_items y sus providers
const items = db.prepare('SELECT qi.id, qi.provider_id, pv.name, pv.email FROM quotation_items qi JOIN providers pv ON qi.provider_id = pv.id').all();
let updated = 0;
for (const item of items) {
  const key = `${item.name}|${item.email}`;
  const correctId = providerMap[key];
  if (correctId && item.provider_id !== correctId) {
    db.prepare('UPDATE quotation_items SET provider_id = ? WHERE id = ?').run(correctId, item.id);
    updated++;
  }
}

console.log(`quotation_items actualizados: ${updated}`);
db.close(); 