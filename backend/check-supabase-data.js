import { db } from './src/database/connection.js'

async function checkSupabaseData() {
  try {
    console.log('🔍 Verificando datos en Supabase...')
    
    // Verificar productos
    console.log('\n📦 Verificando productos:')
    const products = await db.query('SELECT COUNT(*) as total FROM products')
    console.log(`Total de productos: ${products.rows[0].total}`)
    
    if (products.rows[0].total > 0) {
      const sampleProducts = await db.query('SELECT id, name, category FROM products LIMIT 5')
      console.log('Primeros 5 productos:')
      sampleProducts.rows.forEach(p => {
        console.log(`  - ${p.id}: ${p.name} (${p.category})`)
      })
    }
    
    // Verificar proveedores
    console.log('\n🏪 Verificando proveedores:')
    const providers = await db.query('SELECT COUNT(*) as total FROM providers')
    console.log(`Total de proveedores: ${providers.rows[0].total}`)
    
    if (providers.rows[0].total > 0) {
      const sampleProviders = await db.query('SELECT id, name FROM providers LIMIT 5')
      console.log('Primeros 5 proveedores:')
      sampleProviders.rows.forEach(p => {
        console.log(`  - ${p.id}: ${p.name}`)
      })
    }
    
    // Verificar precios
    console.log('\n💰 Verificando precios:')
    const prices = await db.query('SELECT COUNT(*) as total FROM product_prices')
    console.log(`Total de precios: ${prices.rows[0].total}`)
    
    if (prices.rows[0].total > 0) {
      const samplePrices = await db.query(`
        SELECT pp.id, pp.price, p.name as product_name, pv.name as provider_name
        FROM product_prices pp
        JOIN products p ON pp.product_id = p.id
        JOIN providers pv ON pp.provider_id = pv.id
        LIMIT 5
      `)
      console.log('Primeros 5 precios:')
      samplePrices.rows.forEach(p => {
        console.log(`  - ${p.id}: ${p.product_name} - ${p.provider_name} - $${p.price}`)
      })
    }
    
    // Verificar estructura de tablas
    console.log('\n📋 Verificando estructura de tablas:')
    
    const tables = ['products', 'providers', 'product_prices']
    for (const table of tables) {
      const columns = await db.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table])
      
      console.log(`\nTabla ${table}:`)
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`)
      })
    }
    
  } catch (error) {
    console.error('Error al verificar datos:', error)
  } finally {
    process.exit(0)
  }
}

checkSupabaseData() 