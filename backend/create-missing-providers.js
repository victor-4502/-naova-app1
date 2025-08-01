import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function createMissingProviders() {
  try {
    console.log('🔧 Creando proveedores faltantes...')
    
    // Lista de proveedores que necesitamos crear
    const providersToCreate = [
      {
        name: 'Hardware Store A',
        contact_person: 'Juan Pérez',
        phone: '+573001234567',
        email: 'contacto@hardwarestorea.com',
        address: 'Calle 123 #45-67, Bogotá',
        delivery_time_hours: 24,
        rating: 4.5
      },
      {
        name: 'Hardware Store B',
        contact_person: 'María García',
        phone: '+573001234568',
        email: 'contacto@hardwarestoreb.com',
        address: 'Carrera 78 #90-12, Medellín',
        delivery_time_hours: 48,
        rating: 4.3
      }
    ]
    
    for (const provider of providersToCreate) {
      // Verificar si ya existe
      const existingResult = await pool.query('SELECT id FROM providers WHERE name = $1', [provider.name])
      
      if (existingResult.rows.length > 0) {
        console.log(`✅ El proveedor "${provider.name}" ya existe`)
        continue
      }
      
      // Crear el proveedor
      const result = await pool.query(`
        INSERT INTO providers (name, contact_person, phone, email, address, delivery_time_hours, rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [provider.name, provider.contact_person, provider.phone, provider.email, provider.address, provider.delivery_time_hours, provider.rating])
      
      console.log(`✅ Proveedor "${provider.name}" creado con ID: ${result.rows[0].id}`)
    }
    
    // Verificar todos los proveedores
    const allProviders = await pool.query('SELECT id, name FROM providers ORDER BY id')
    console.log('\n📋 Todos los proveedores en la base de datos:')
    allProviders.rows.forEach(provider => {
      console.log(`  - ID: ${provider.id}, Nombre: ${provider.name}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

createMissingProviders() 