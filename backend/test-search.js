import { db } from './src/database/connection.js'

console.log('Testing search...')

// Check products
const products = db.prepare('SELECT * FROM products').all()
console.log('Products count:', products.length)
console.log('First product:', products[0])

// Check prices
const prices = db.prepare('SELECT * FROM product_prices LIMIT 3').all()
console.log('Prices count:', prices.length)
console.log('First price:', prices[0])

// Check providers
const providers = db.prepare('SELECT * FROM providers').all()
console.log('Providers count:', providers.length)
console.log('First provider:', providers[0])

// Test simple search
const results = db.prepare(`
  SELECT p.name, pp.price, pv.name as provider 
  FROM products p 
  JOIN product_prices pp ON p.id = pp.product_id 
  JOIN providers pv ON pp.provider_id = pv.id 
  WHERE p.name LIKE '%Tornillos%'
`).all()

console.log('Search results:', results)

// Test with keywords
const keywordResults = db.prepare(`
  SELECT p.name, pp.price, pv.name as provider 
  FROM products p 
  JOIN product_prices pp ON p.id = pp.product_id 
  JOIN providers pv ON pp.provider_id = pv.id 
  WHERE p.keywords LIKE '%tornillos%'
`).all()

console.log('Keyword results:', keywordResults) 