import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function associateProviderUser() {
  try {
    console.log('🔧 Asociando usuario proveedor1 con Hardware Store A...')
    
    // Buscar el usuario proveedor1
    const userResult = await pool.query('SELECT id FROM users WHERE username = $1', ['proveedor1'])
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario proveedor1 no encontrado')
      return
    }
    const userId = userResult.rows[0].id
    console.log(`✅ Usuario proveedor1 encontrado con ID: ${userId}`)
    
    // Buscar el proveedor Hardware Store A
    const providerResult = await pool.query('SELECT id FROM providers WHERE name = $1', ['Hardware Store A'])
    if (providerResult.rows.length === 0) {
      console.log('❌ Proveedor Hardware Store A no encontrado')
      return
    }
    const providerId = providerResult.rows[0].id
    console.log(`✅ Proveedor Hardware Store A encontrado con ID: ${providerId}`)
    
    // Actualizar el proveedor para asociarlo con el usuario
    await pool.query('UPDATE providers SET user_id = $1 WHERE id = $2', [userId, providerId])
    console.log(`✅ Usuario ${userId} asociado con proveedor ${providerId}`)
    
    // Verificar la asociación
    const verificationResult = await pool.query(`
      SELECT p.id, p.name, p.user_id, u.username 
      FROM providers p 
      LEFT JOIN users u ON p.user_id = u.id 
      WHERE p.name = $1
    `, ['Hardware Store A'])
    
    if (verificationResult.rows.length > 0) {
      const provider = verificationResult.rows[0]
      console.log(`✅ Verificación: Proveedor "${provider.name}" (ID: ${provider.id}) asociado con usuario "${provider.username}" (ID: ${provider.user_id})`)
    }
    
    // Mostrar todos los proveedores con sus usuarios
    const allProviders = await pool.query(`
      SELECT p.id, p.name, p.user_id, u.username 
      FROM providers p 
      LEFT JOIN users u ON p.user_id = u.id 
      ORDER BY p.id
    `)
    
    console.log('\n📋 Todos los proveedores con sus usuarios:')
    allProviders.rows.forEach(provider => {
      console.log(`  - ID: ${provider.id}, Nombre: ${provider.name}, Usuario: ${provider.username || 'Sin usuario'}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

associateProviderUser() 