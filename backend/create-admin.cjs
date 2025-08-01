const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('../naova.sqlite');

const username = 'admin';
const email = 'admin@naova.com';
const password = 'admin123';
const role = 'admin';

const hashedPassword = bcrypt.hashSync(password, 10);

const stmt = db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
const info = stmt.run(username, email, hashedPassword, role);

if (info.changes > 0) {
  console.log('✅ Usuario admin creado correctamente');
} else {
  console.log('ℹ️  El usuario admin ya existía o no se pudo crear');
}

db.close(); 