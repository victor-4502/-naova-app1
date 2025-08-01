const Database = require('better-sqlite3');
const path = require('path');

console.log('🔧 Agregando columna payment_status a quotations...');

try {
  const dbPath = path.join(__dirname, 'naova.sqlite');
  const db = new Database(dbPath);
  
  // Verificar si la columna ya existe
  const columns = db.prepare("PRAGMA table_info(quotations)").all();
  const hasPaymentStatus = columns.some(col => col.name === 'payment_status');
  
  if (hasPaymentStatus) {
    console.log('ℹ️  La columna payment_status ya existe en quotations.');
  } else {
    // Agregar la columna payment_status
    db.prepare('ALTER TABLE quotations ADD COLUMN payment_status TEXT DEFAULT "pendiente"').run();
    console.log('✅ Columna payment_status agregada correctamente.');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error agregando columna payment_status:', error.message);
} 