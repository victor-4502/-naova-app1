import { db } from './src/database/connection.js';

// 1. Encontrar providers únicos por nombre/email (el de menor id)
const uniqueProviders = db.prepare('SELECT MIN(id) as id, name, email, user_id FROM providers GROUP BY name, email').all();

// 2. Mapear nombre/email a provider_id correcto
const providerMap = {};
uniqueProviders.forEach(p => {
  providerMap[`${p.name}|${p.email}`] = p.id;
});

// 3. Actualizar quotation_items para que usen el provider_id correcto
const allProviders = db.prepare('SELECT id, name, email FROM providers').all();
let updated = 0;
for (const p of allProviders) {
  const key = `${p.name}|${p.email}`;
  const correctId = providerMap[key];
  if (p.id !== correctId) {
    // Actualizar quotation_items
    updated += db.prepare('UPDATE quotation_items SET provider_id = ? WHERE provider_id = ?').run(correctId, p.id).changes;
  }
}

// 4. Eliminar providers duplicados (que no sean el de menor id)
const idsToKeep = uniqueProviders.map(p => p.id);
const idsToDelete = allProviders.filter(p => !idsToKeep.includes(p.id)).map(p => p.id);
if (idsToDelete.length > 0) {
  db.prepare(`DELETE FROM providers WHERE id IN (${idsToDelete.map(() => '?').join(',')})`).run(...idsToDelete);
}

console.log(`Providers únicos: ${uniqueProviders.length}`);
console.log(`Providers eliminados: ${idsToDelete.length}`);
console.log(`quotation_items actualizados: ${updated}`);

// Mostrar providers finales
console.log('\nProviders finales:');
db.prepare('SELECT id, name, email, user_id FROM providers').all().forEach(p =>
  console.log(`ProviderID: ${p.id} | Nombre: ${p.name} | Email: ${p.email} | user_id: ${p.user_id}`)
);

db.close(); 