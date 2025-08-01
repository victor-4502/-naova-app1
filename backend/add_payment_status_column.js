import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function addPaymentStatusColumn() {
  try {
    console.log('🔧 Agregando columna payment_status a la tabla quotations...')
    
    // Verificar si la columna ya existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'quotations' AND column_name = 'payment_status'
    `)
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna payment_status ya existe')
      return
    }
    
    // Agregar la columna payment_status
    await pool.query(`
      ALTER TABLE quotations 
      ADD COLUMN payment_status TEXT DEFAULT 'pendiente'
    `)
    
    console.log('✅ Columna payment_status agregada exitosamente')
    console.log('📋 Valores posibles: pendiente, pagado, cancelado')
    
    // Actualizar las cotizaciones existentes para que tengan un valor por defecto
    await pool.query(`
      UPDATE quotations 
      SET payment_status = 'pendiente' 
      WHERE payment_status IS NULL
    `)
    
    console.log('✅ Cotizaciones existentes actualizadas con payment_status = pendiente')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

addPaymentStatusColumn() 