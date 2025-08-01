import { db } from './connection.js'

console.log('🔄 Running database migration...')

try {
  // Add user_id column to quotations table if it doesn't exist
  db.exec(`
    ALTER TABLE quotations ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
  `)
  // Add user_id column to providers table if it doesn't exist
  db.exec(`
    ALTER TABLE providers ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
  `)
  // Add sub_status column to quotations table if it doesn't exist
  try {
    db.exec(`ALTER TABLE quotations ADD COLUMN sub_status TEXT DEFAULT NULL`)
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  sub_status column already exists, skipping...')
    } else {
      throw error
    }
  }
  
  console.log('✅ Migration completed successfully')
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('ℹ️  Column already exists, skipping...')
  } else {
    console.error('❌ Migration error:', error.message)
  }
} finally {
  db.close()
} 