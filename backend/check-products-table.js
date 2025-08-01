import { db } from './src/database/connection.js'

async function checkProductsTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla products...')
    
    // Verificar si la tabla existe
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      )
    `)
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla products no existe')
      return
    }
    
    console.log('✅ La tabla products existe')
    
    // Obtener estructura de la tabla
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `)
    
    console.log('📋 Columnas de la tabla products:')
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`)
    })
    
    // Contar productos
    const countResult = await db.query('SELECT COUNT(*) as total FROM products')
    console.log(`📊 Total de productos: ${countResult.rows[0].total}`)
    
    // Mostrar algunos productos de ejemplo
    const sampleProducts = await db.query('SELECT * FROM products LIMIT 3')
    console.log('📝 Primeros 3 productos:')
    sampleProducts.rows.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ${product.category}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkProductsTable() 