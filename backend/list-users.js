const Database = require('better-sqlite3');
const db = new Database('../naova.sqlite');

const users = db.prepare('SELECT id, username, email, role FROM users').all();

console.log('Usuarios en la base de datos:');
users.forEach(u => {
  console.log(u);
});

db.close(); 