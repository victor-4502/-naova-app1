import { db } from './src/database/connection.js'

console.log('Verificando productos en la base de datos...\n')

try {
  // Verificar productos
  const products = db.prepare('SELECT * FROM products ORDER BY id DESC LIMIT 10').all()
  console.log(`Total de productos: ${products.length}`)
  console.log('Últimos productos:')
  products.forEach(p => {
    console.log(`ID: ${p.id}, Nombre: ${p.name}, Categoría: ${p.category}`)
  })

  // Verificar precios
  const prices = db.prepare('SELECT * FROM product_prices ORDER BY id DESC LIMIT 10').all()
  console.log(`\nTotal de precios: ${prices.length}`)
  console.log('Últimos precios:')
  prices.forEach(p => {
    console.log(`ID: ${p.id}, Producto: ${p.product_id}, Proveedor: ${p.provider_id}, Precio: $${p.price}`)
  })

} catch (error) {
  console.error('Error:', error)
} finally {
  db.close()
} 