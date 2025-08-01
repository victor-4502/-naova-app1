const Database = require('better-sqlite3');
const db = new Database('naova.sqlite');

const links = [
  { username: 'hardwarestorea', providerName: 'Hardware Store A' },
  { username: 'hardwarestoreb', providerName: 'Hardware Store B' },
  { username: 'hardwarestorec', providerName: 'Hardware Store C' },
];

for (const link of links) {
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(link.username);
  const provider = db.prepare('SELECT id FROM providers WHERE name = ?').get(link.providerName);
  if (user && provider) {
    db.prepare('UPDATE providers SET user_id = ? WHERE id = ?').run(user.id, provider.id);
    console.log(`Vinculado ${link.username} (user_id=${user.id}) a ${link.providerName} (provider_id=${provider.id})`);
  } else {
    console.log(`No se pudo vincular ${link.username} a ${link.providerName}`);
  }
}
db.close(); 