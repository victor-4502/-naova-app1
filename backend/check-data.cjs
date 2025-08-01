const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 Revisando datos en la base de datos...\n');

try {
  const dbPath = path.join(__dirname, 'naova.sqlite');
  const db = new Database(dbPath);
  
  // Revisar cotizaciones
  console.log('=== COTIZACIONES ===');
  const quotations = db.prepare('SELECT * FROM quotations').all();
  console.log(`Total: ${quotations.length} cotizaciones`);
  
  quotations.forEach((q, i) => {
    console.log(`${i+1}. ${q.customer_name} - ${q.customer_email} - ${q.status} - $${q.total_amount}`);
  });
  
  console.log('\n=== PRODUCTOS ===');
  const products = db.prepare('SELECT * FROM products').all();
  console.log(`Total: ${products.length} productos`);
  
  console.log('\n=== PROVEEDORES ===');
  const providers = db.prepare('SELECT * FROM providers').all();
  console.log(`Total: ${providers.length} proveedores`);
  
  console.log('\n=== USUARIOS ===');
  const users = db.prepare('SELECT username, email, role FROM users').all();
  console.log(`Total: ${users.length} usuarios`);
  users.forEach(u => console.log(`- ${u.username} (${u.role})`));
  
  console.log('\n=== ITEMS DE COTIZACIÓN ===');
  const items = db.prepare('SELECT * FROM quotation_items').all();
  console.log(`Total: ${items.length} items`);
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error.message);
} 