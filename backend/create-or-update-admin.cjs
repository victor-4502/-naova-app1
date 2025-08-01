const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

try {
  const dbPath = path.join(__dirname, '../naova.sqlite');
  const db = new Database(dbPath);

  const username = 'admin';
  const email = 'admin@naova.com';
  const password = 'admin123';
  const role = 'admin';
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Verificar si ya existe
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    // Actualizar contraseña y rol
    db.prepare('UPDATE users SET password = ?, role = ? WHERE id = ?').run(hashedPassword, role, existing.id);
    console.log('🔄 Usuario admin actualizado correctamente.');
  } else {
    // Insertar nuevo
    db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run(username, email, hashedPassword, role);
    console.log('✅ Usuario admin creado correctamente.');
  }

  db.close();
} catch (err) {
  console.error('❌ Error al crear/actualizar el usuario admin:', err);
} 