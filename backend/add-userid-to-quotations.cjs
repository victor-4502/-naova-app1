// Script para agregar la columna user_id a quotations si no existe
try {
  const Database = require('better-sqlite3');
  const db = new Database('naova.sqlite');

  // Verificar si la columna user_id ya existe
  const pragma = db.prepare("PRAGMA table_info(quotations)").all();
  const hasUserId = pragma.some(col => col.name === 'user_id');

  if (!hasUserId) {
    db.prepare('ALTER TABLE quotations ADD COLUMN user_id INTEGER').run();
    console.log('Columna user_id agregada a quotations.');
  } else {
    console.log('La columna user_id ya existe en quotations.');
  }
  db.close();
} catch (err) {
  console.error('Error al modificar la base de datos:', err.message);
  process.exit(1);
} 