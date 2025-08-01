const Database = require('better-sqlite3');
const db = new Database('naova.sqlite');

function hasUserIdColumn() {
  const columns = db.prepare("PRAGMA table_info(providers)").all();
  return columns.some(col => col.name === 'user_id');
}

if (!hasUserIdColumn()) {
  try {
    db.prepare("ALTER TABLE providers ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL").run();
    console.log('✅ Columna user_id agregada a providers');
  } catch (e) {
    console.error('❌ Error agregando columna user_id:', e.message);
  }
} else {
  console.log('ℹ️  La columna user_id ya existe en providers');
}

db.close(); 