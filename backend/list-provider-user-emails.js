import { db } from './src/database/connection.js';

console.log('PROVIDERS:');
const providers = db.prepare('SELECT id, name, email FROM providers').all();
providers.forEach(p => console.log(`ID: ${p.id} | Nombre: ${p.name} | Email: ${p.email}`));

console.log('\nUSERS (proveedor):');
const users = db.prepare('SELECT id, username, email FROM users WHERE role = ?').all('proveedor');
users.forEach(u => console.log(`ID: ${u.id} | Username: ${u.username} | Email: ${u.email}`));

db.close(); 