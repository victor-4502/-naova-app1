import Database from 'better-sqlite3';

const db = new Database('./naova.sqlite');

console.log('Revisando base de datos...\n');

try {
  // Contar productos
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  console.log('Total de productos:', productCount.count);
  
  // Mostrar algunos productos
  const products = db.prepare('SELECT id, name, category FROM products LIMIT 5').all();
  console.log('\nPrimeros 5 productos:');
  products.forEach(product => {
    console.log(`- ${product.id}: ${product.name} (${product.category})`);
  });
  
  // Contar proveedores
  const providerCount = db.prepare('SELECT COUNT(*) as count FROM providers').get();
  console.log('\nTotal de proveedores:', providerCount.count);
  
  // Contar precios
  const priceCount = db.prepare('SELECT COUNT(*) as count FROM product_prices').get();
  console.log('Total de precios:', priceCount.count);
  
} catch (error) {
  console.error('Error al revisar la base de datos:', error);
} finally {
  db.close();
} 