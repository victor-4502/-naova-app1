import { db } from './src/database/connection.js'

async function checkQuotationsTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla quotations...')
    
    // Verificar si la tabla existe
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'quotations'
      )
    `)
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla quotations no existe')
      return
    }
    
    console.log('✅ La tabla quotations existe')
    
    // Obtener estructura de la tabla
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'quotations'
      ORDER BY ordinal_position
    `)
    
    console.log('📋 Columnas de la tabla quotations:')
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`)
    })
    
    // Verificar si hay datos
    const count = await db.query('SELECT COUNT(*) as count FROM quotations')
    console.log(`📊 Total de cotizaciones: ${count.rows[0].count}`)
    
    // Intentar obtener algunas cotizaciones
    const quotations = await db.query(`
      SELECT id, customer_name, customer_email, total_amount, status, created_at
      FROM quotations
      LIMIT 5
    `)
    
    console.log('📝 Primeras 5 cotizaciones:')
    quotations.rows.forEach(q => {
      console.log(`  - ID: ${q.id}, Cliente: ${q.customer_name}, Status: ${q.status}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await db.end()
  }
}

checkQuotationsTable() 