import { db } from './src/database/connection.js';

const clients = db.prepare('SELECT username, email FROM users WHERE role = ?').all('cliente');
if (clients.length === 0) {
  console.log('No hay usuarios cliente en la base de datos.');
} else {
  console.log('Usuarios cliente:');
  clients.forEach(u => console.log(`Usuario: ${u.username} | Email: ${u.email}`));
}
db.close(); 