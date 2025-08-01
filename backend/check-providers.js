import { db } from './src/database/connection.js'

console.log('Verificando proveedores en la base de datos...\n')

try {
  const providers = db.prepare('SELECT * FROM providers ORDER BY id').all()
  console.log(`Total de proveedores: ${providers.length}`)
  console.log('Proveedores disponibles:')
  providers.forEach(p => {
    console.log(`ID: ${p.id}, Nombre: ${p.name}`)
  })

} catch (error) {
  console.error('Error:', error)
} finally {
  db.close()
} 