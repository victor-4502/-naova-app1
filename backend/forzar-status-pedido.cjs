const Database = require('better-sqlite3');
const db = new Database('naova.sqlite');
const info = db.prepare("UPDATE quotations SET status = 'pedido'").run();
console.log(`Cotizaciones actualizadas: ${info.changes}`); 