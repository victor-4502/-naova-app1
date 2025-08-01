import { db } from './src/database/connection.js';
import bcrypt from 'bcryptjs';

function main() {
  const providers = db.prepare('SELECT id, name, email FROM providers').all();
  const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
  const selectUser = db.prepare('SELECT id FROM users WHERE email = ? AND role = ?');
  const updateProvider = db.prepare('UPDATE providers SET user_id = ? WHERE id = ?');
  const password = 'proveedor123';
  const hashedPassword = bcrypt.hashSync(password, 10);
  let created = 0, linked = 0;

  for (const provider of providers) {
    if (!provider.email) continue;
    const base = provider.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = base.length > 0 ? base : `proveedor${provider.id}`;
    insertUser.run(username, provider.email, hashedPassword, 'proveedor');
    const user = selectUser.get(provider.email, 'proveedor');
    if (user) {
      updateProvider.run(user.id, provider.id);
      linked++;
      created++;
      console.log(`Proveedor: ${provider.name} | Usuario: ${username} | Email: ${provider.email} | Contraseña: ${password}`);
    }
  }
  console.log(`\nTotal proveedores vinculados: ${linked}`);
  db.close();
}

main(); 