import express from 'express'
import { db } from '../database/connection.js'

const router = express.Router()

// Search products
router.get('/', async (req, res) => {
  try {
    console.log('Search request received:', req.query)
    const { q: query, category, minPrice, maxPrice } = req.query

    if (!query || query.trim().length === 0) {
      console.log('Empty query, returning empty array')
      return res.json([])
    }

    console.log('Searching for query:', query)

    // Build search conditions
    let conditions = []
    let params = []
    let paramIndex = 1

    // More flexible search - search in name, description, and category (case insensitive)
    conditions.push(`(
      LOWER(p.name) LIKE LOWER($${paramIndex}) OR 
      LOWER(p.description) LIKE LOWER($${paramIndex}) OR 
      LOWER(p.category) LIKE LOWER($${paramIndex})
    )`)
    const searchTerm = `%${query}%`
    params.push(searchTerm)
    paramIndex++

    if (category) {
      conditions.push(`p.category = $${paramIndex}`)
      params.push(category)
      paramIndex++
    }

    if (minPrice) {
      conditions.push(`pp.price >= $${paramIndex}`)
      params.push(parseFloat(minPrice))
      paramIndex++
    }

    if (maxPrice) {
      conditions.push(`pp.price <= $${paramIndex}`)
      params.push(parseFloat(maxPrice))
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

    const sql = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.description,
        p.category,
        pp.id as price_id,
        pp.price,
        pp.stock_quantity,
        pp.delivery_time_hours,
        pv.id as provider_id,
        pv.name as provider_name,
        pv.address as provider_address,
        pv.phone as provider_phone,
        pv.email as provider_email,
        pv.rating as provider_rating
      FROM products p
      JOIN product_prices pp ON p.id = pp.product_id
      JOIN providers pv ON pp.provider_id = pv.id
      ${whereClause}
      ORDER BY pp.price ASC
    `

    const result = await db.query(sql, params)
    const results = result.rows
    console.log('Database query results:', results.length, 'rows')

    // Group by product and find best price and fastest delivery
    const productMap = new Map()

    results.forEach(row => {
      const productId = row.id
      
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product: {
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            unit: 'unidad',
            keywords: [row.category.toLowerCase()]
          },
          prices: []
        })
      }

      const product = productMap.get(productId)
      product.prices.push({
        id: row.price_id,
        productId: row.id,
        providerId: row.provider_id,
        price: parseFloat(row.price),
        currency: 'COP',
        available: true,
        minQuantity: row.stock_quantity || 1,
        deliveryTime: row.delivery_time_hours,
        provider: {
          id: row.provider_id,
          name: row.provider_name,
          address: row.provider_address,
          phone: row.provider_phone,
          email: row.provider_email,
          rating: parseFloat(row.provider_rating),
          deliveryTime: row.delivery_time_hours
        }
      })
    })

    // Convert to array and find best price and fastest delivery for each product
    const searchResults = Array.from(productMap.values()).map(item => {
      const prices = item.prices
      
      console.log(`Product ${item.product.name} has ${prices.length} prices`)
      
      // If only one provider, return it as the only option
      if (prices.length === 1) {
        const singlePrice = prices[0]
        console.log(`Single provider for ${item.product.name}: ${singlePrice.provider.name}`)
        return {
          product: item.product,
          bestPrice: singlePrice,
          fastestDelivery: null, // No comparison needed
          singleProvider: true
        }
      }
      
      // Find best price (lowest price)
      const bestPrice = prices.reduce((best, current) => 
        current.price < best.price ? current : best
      )

      // Find fastest delivery
      const fastestDelivery = prices.reduce((fastest, current) => 
        current.deliveryTime < fastest.deliveryTime ? current : fastest
      )

      console.log(`Multiple providers for ${item.product.name}: ${prices.length} providers`)
      return {
        product: item.product,
        bestPrice,
        fastestDelivery,
        singleProvider: false
      }
    })

    console.log('Final search results:', searchResults.length, 'products')
    res.json(searchResults)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query

    if (!q || q.trim().length === 0) {
      return res.json({ suggestions: [] })
    }

    const suggestions = await db.query(`
      SELECT DISTINCT name, category
      FROM products
      WHERE name LIKE $1 OR description LIKE $1
      ORDER BY name
      LIMIT $2
    `, [`%${q}%`, parseInt(limit)])
    
    res.json({ suggestions: suggestions.rows })
  } catch (error) {
    console.error('Get suggestions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT DISTINCT category, COUNT(*) as product_count
      FROM products
      GROUP BY category
      ORDER BY category
    `)
    
    res.json({ categories: categories.rows })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get price range
router.get('/price-range', async (req, res) => {
  try {
    const { category } = req.query

    let sql = `
      SELECT 
        MIN(pp.price) as min_price,
        MAX(pp.price) as max_price,
        AVG(pp.price) as avg_price
      FROM product_prices pp
      JOIN products p ON pp.product_id = p.id
    `

    const params = []

    if (category) {
      sql += ' WHERE p.category = $1'
      params.push(category)
    }

    const result = await db.query(sql, params)
    
    res.json({
      min_price: parseFloat(result.rows[0]?.min_price || 0),
      max_price: parseFloat(result.rows[0]?.max_price || 0),
      avg_price: parseFloat(result.rows[0]?.avg_price || 0)
    })
  } catch (error) {
    console.error('Get price range error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 