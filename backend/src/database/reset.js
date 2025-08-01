import { db } from './connection.js'

console.log('🔄 Resetting SQLite database...')

try {
  // Drop all tables
  console.log('🗑️  Dropping all tables...')
  
  db.exec('DROP TABLE IF EXISTS quotation_items')
  db.exec('DROP TABLE IF EXISTS quotations')
  db.exec('DROP TABLE IF EXISTS product_prices')
  db.exec('DROP TABLE IF EXISTS products')
  db.exec('DROP TABLE IF EXISTS providers')

  console.log('✅ All tables dropped successfully')
  console.log('🔄 Database reset completed!')
  console.log('💡 Run "npm run db:setup" to recreate tables and sample data')

} catch (error) {
  console.error('❌ Error resetting database:', error.message)
  process.exit(1)
} finally {
  db.close()
} 