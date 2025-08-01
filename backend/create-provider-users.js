import { db } from './src/database/connection.js';
import bcrypt from 'bcryptjs';

async function main() {
  const providers = db.prepare('SELECT id, name, email FROM providers').all();
  const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
  const selectUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?');
  const password = 'proveedor123';
  const hashedPassword = await bcrypt.hash(password, 10);
  const created = [];

  for (const provider of providers) {
    // Generar username y email únicos
    const base = provider.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = base.length > 0 ? base : `proveedor${provider.id}`;
    const email = provider.email && provider.email.includes('@') ? provider.email : `${username}@proveedores.com`;
    // Verificar si ya existe
    const exists = selectUser.get(username, email);
    if (!exists) {
      insertUser.run(username, email, hashedPassword, 'proveedor');
      created.push({ username, email, password });
    }
  }

  if (created.length === 0) {
    console.log('No se crearon nuevos usuarios de proveedor. Ya existen.');
  } else {
    console.log('Usuarios de proveedor creados:');
    created.forEach(u => {
      console.log(`Usuario: ${u.username} | Email: ${u.email} | Contraseña: ${u.password}`);
    });
  }
  db.close();
}

main(); 