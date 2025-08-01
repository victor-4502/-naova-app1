const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(__dirname, '../naova.sqlite');
  const db = new Database(dbPath);

  const users = db.prepare('SELECT * FROM users').all();

  console.log('Usuarios en la base de datos:');
  if (users.length === 0) {
    console.log('(ninguno)');
  } else {
    users.forEach(u => {
      console.log(u);
    });
  }

  db.close();
} catch (err) {
  console.error('Error al leer la base de datos:', err);
} 