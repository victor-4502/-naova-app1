import { db } from './src/database/connection.js';
import bcrypt from 'bcryptjs';

async function main() {
  const username = 'cliente';
  const email = 'cliente@naova.com';
  const password = 'cliente123';
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?');
  const exists = selectUser.get(username, email);
  if (exists) {
    console.log('El usuario cliente ya existe.');
  } else {
    db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
      .run(username, email, hashedPassword, 'cliente');
    console.log('Usuario cliente creado:');
    console.log(`Usuario: ${username} | Email: ${email} | Contraseña: ${password}`);
  }
  db.close();
}

main(); 