import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function checkProvidersAndProducts() {
  try {
    console.log('🔍 Verificando proveedores y productos en cotizaciones...')
    
    // Verificar todos los proveedores
    const providersResult = await pool.query('SELECT id, name, user_id FROM providers ORDER BY id')
    console.log('\n📋 Proveedores en la base de datos:')
    providersResult.rows.forEach(provider => {
      console.log(`  - ID: ${provider.id}, Nombre: ${provider.name}, User ID: ${provider.user_id}`)
    })
    
    // Verificar productos en cotizaciones
    const quotationsResult = await pool.query(`
      SELECT DISTINCT q.id, q.customer_name, q.status, q.payment_status
      FROM quotations q
      ORDER BY q.id
    `)
    
    console.log('\n📊 Cotizaciones existentes:')
    quotationsResult.rows.forEach(quotation => {
      console.log(`  - ID: ${quotation.id}, Cliente: ${quotation.customer_name}, Status: ${quotation.status}, Payment: ${quotation.payment_status}`)
    })
    
    // Verificar productos por cotización
    for (const quotation of quotationsResult.rows) {
      const itemsResult = await pool.query(`
        SELECT qi.id, qi.product_id, qi.provider_id, qi.quantity, qi.unit_price, qi.total_price,
               p.name as product_name, pv.name as provider_name
        FROM quotation_items qi
        JOIN products p ON qi.product_id = p.id
        JOIN providers pv ON qi.provider_id = pv.id
        WHERE qi.quotation_id = $1
        ORDER BY qi.id
      `, [quotation.id])
      
      console.log(`\n📦 Productos en cotización ${quotation.id}:`)
      if (itemsResult.rows.length === 0) {
        console.log('  - No hay productos')
      } else {
        itemsResult.rows.forEach(item => {
          console.log(`  - Producto: ${item.product_name}, Proveedor: ${item.provider_name}, Cantidad: ${item.quantity}, Precio: $${item.unit_price}`)
        })
      }
    }
    
    // Verificar específicamente para proveedor1
    const provider1Result = await pool.query('SELECT id FROM providers WHERE name = $1', ['Hardware Store A'])
    if (provider1Result.rows.length > 0) {
      const provider1Id = provider1Result.rows[0].id
      console.log(`\n🔍 Verificando productos del proveedor Hardware Store A (ID: ${provider1Id}):`)
      
      const provider1Items = await pool.query(`
        SELECT qi.quotation_id, qi.product_id, qi.quantity, qi.unit_price,
               p.name as product_name, q.status, q.payment_status
        FROM quotation_items qi
        JOIN products p ON qi.product_id = p.id
        JOIN quotations q ON qi.quotation_id = q.id
        WHERE qi.provider_id = $1
        ORDER BY qi.quotation_id
      `, [provider1Id])
      
      if (provider1Items.rows.length === 0) {
        console.log('  - No tiene productos asignados en ninguna cotización')
      } else {
        provider1Items.rows.forEach(item => {
          console.log(`  - Cotización ${item.quotation_id}: ${item.product_name}, Cantidad: ${item.quantity}, Status: ${item.status}, Payment: ${item.payment_status}`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

checkProvidersAndProducts() 