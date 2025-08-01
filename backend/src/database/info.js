import { db } from './connection.js'

console.log('📊 SQLite Database Information')
console.log('==============================')

try {
  // Get database file info
  const dbPath = db.name
  console.log(`📁 Database file: ${dbPath}`)
  
  // Get table names
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all()
  
  console.log(`📋 Tables found: ${tables.length}`)
  
  if (tables.length > 0) {
    console.log('\n📋 Table Details:')
    console.log('-----------------')
    
    tables.forEach(table => {
      const tableName = table.name
      
      // Get row count
      const countResult = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get()
      const rowCount = countResult.count
      
      // Get table schema
      const schema = db.prepare(`PRAGMA table_info(${tableName})`).all()
      const columns = schema.map(col => col.name).join(', ')
      
      console.log(`\n${tableName}:`)
      console.log(`  Rows: ${rowCount}`)
      console.log(`  Columns: ${columns}`)
    })
  }
  
  // Show some sample data
  console.log('\n📦 Sample Data Preview:')
  console.log('------------------------')
  
  // Products
  const products = db.prepare('SELECT id, name, category FROM products LIMIT 3').all()
  if (products.length > 0) {
    console.log('\nProducts:')
    products.forEach(product => {
      console.log(`  ${product.id}. ${product.name} (${product.category})`)
    })
  }
  
  // Providers
  const providers = db.prepare('SELECT id, name, delivery_time_hours FROM providers LIMIT 3').all()
  if (providers.length > 0) {
    console.log('\nProviders:')
    providers.forEach(provider => {
      console.log(`  ${provider.id}. ${provider.name} (${provider.delivery_time_hours}h delivery)`)
    })
  }
  
  // Product prices
  const prices = db.prepare(`
    SELECT p.name as product, pr.name as provider, pp.price, pp.delivery_time_hours
    FROM product_prices pp
    JOIN products p ON pp.product_id = p.id
    JOIN providers pr ON pp.provider_id = pr.id
    LIMIT 3
  `).all()
  
  if (prices.length > 0) {
    console.log('\nSample Prices:')
    prices.forEach(price => {
      console.log(`  ${price.product} at ${price.provider}: $${price.price} (${price.delivery_time_hours}h)`)
    })
  }

} catch (error) {
  console.error('❌ Error getting database info:', error.message)
  process.exit(1)
} finally {
  db.close()
} 