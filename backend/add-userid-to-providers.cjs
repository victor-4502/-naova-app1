const Database = require('better-sqlite3');
const path = require('path');

console.log('🔧 Agregando columna user_id a providers...');

try {
  const dbPath = path.join(__dirname, 'naova.sqlite');
  const db = new Database(dbPath);
  
  // Verificar si la columna ya existe
  const columns = db.prepare("PRAGMA table_info(providers)").all();
  const hasUserId = columns.some(col => col.name === 'user_id');
  
  if (hasUserId) {
    console.log('ℹ️  La columna user_id ya existe en providers.');
  } else {
    // Agregar la columna user_id
    db.prepare('ALTER TABLE providers ADD COLUMN user_id INTEGER').run();
    console.log('✅ Columna user_id agregada correctamente.');
    
    // Vincular proveedores existentes con usuarios
    const providers = db.prepare('SELECT id, name FROM providers').all();
    const users = db.prepare('SELECT id, username FROM users WHERE role = "proveedor"').all();
    
    console.log(`📦 Vinculando ${providers.length} proveedores con usuarios...`);
    
    providers.forEach((provider, index) => {
      const user = users[index];
      if (user) {
        db.prepare('UPDATE providers SET user_id = ? WHERE id = ?').run(user.id, provider.id);
        console.log(`✅ ${provider.name} -> ${user.username}`);
      }
    });
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error agregando columna user_id:', error.message);
} 