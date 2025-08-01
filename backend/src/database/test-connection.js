import { db } from './connection.js'

console.log('Valor de process.env.DATABASE_URL:', process.env.DATABASE_URL)

async function testConnection() {
  try {
    const res = await db.query('SELECT NOW()')
    console.log('✅ ¡Conexión exitosa a Supabase! Fecha y hora del servidor:', res.rows[0].now)
  } catch (err) {
    console.error('❌ Error al conectar a Supabase:', err)
  } finally {
    await db.end()
  }
}

testConnection() 