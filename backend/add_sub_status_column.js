const Database = require('better-sqlite3');
const db = new Database('naova.sqlite');

try {
  db.prepare('ALTER TABLE quotations ADD COLUMN sub_status TEXT DEFAULT NULL').run();
  console.log('✅ Columna sub_status agregada correctamente.');
} catch (error) {
  if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
    console.log('ℹ️  La columna sub_status ya existe, no se hizo nada.');
  } else {
    console.error('❌ Error al agregar la columna sub_status:', error.message);
    process.exit(1);
  }
}
db.close(); 