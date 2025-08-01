import express from 'express'
import { db } from '../database/connection.js'
import { authenticateToken, checkRole } from './auth.js'

const router = express.Router()

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query

    let query = `
      SELECT id, name, description, category, specifications, image_url, created_at, updated_at
      FROM products
    `
    const params = []

    if (category) {
      query += ' WHERE category = $1'
      params.push(category)
    }

    query += ' ORDER BY name LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    params.push(parseInt(limit), parseInt(offset))

    const result = await db.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all product prices
router.get('/prices', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        pp.id,
        pp.product_id,
        pp.provider_id,
        pp.price,
        pp.stock_quantity,
        pp.delivery_time_hours,
        p.name as product_name,
        p.description as product_description,
        p.category as product_category,
        pv.name as provider_name
      FROM product_prices pp
      JOIN products p ON pp.product_id = p.id
      JOIN providers pv ON pp.provider_id = pv.id
      ORDER BY p.name, pp.price ASC
    `)

    res.json(result.rows)
  } catch (error) {
    console.error('Get product prices error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new product price
router.post('/prices', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { product_id, provider_id, price, stock_quantity, delivery_time_hours } = req.body

    // Validation
    if (!product_id || !provider_id || !price) {
      return res.status(400).json({ error: 'Product ID, provider ID, and price are required' })
    }

    const result = await db.query(`
      INSERT INTO product_prices (product_id, provider_id, price, stock_quantity, delivery_time_hours)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [product_id, provider_id, price, stock_quantity || 0, delivery_time_hours || 24])

    const newPriceResult = await db.query(`
      SELECT 
        pp.id,
        pp.product_id,
        pp.provider_id,
        pp.price,
        pp.stock_quantity,
        pp.delivery_time_hours,
        p.name as product_name,
        pv.name as provider_name
      FROM product_prices pp
      JOIN products p ON pp.product_id = p.id
      JOIN providers pv ON pp.provider_id = pv.id
      WHERE pp.id = $1
    `, [result.rows[0].id])

    res.status(201).json(newPriceResult.rows[0])
  } catch (error) {
    console.error('Create product price error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete product price
router.delete('/prices/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(`
      DELETE FROM product_prices
      WHERE id = $1
    `, [id])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product price not found' })
    }

    res.json({ message: 'Product price deleted successfully' })
  } catch (error) {
    console.error('Delete product price error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update product price
router.put('/prices/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { price, stock_quantity, delivery_time_hours } = req.body

    const result = await db.query(`
      UPDATE product_prices
      SET price = COALESCE($1, price),
          stock_quantity = COALESCE($2, stock_quantity),
          delivery_time_hours = COALESCE($3, delivery_time_hours),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [price, stock_quantity, delivery_time_hours, id])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product price not found' })
    }

    const updatedPriceResult = await db.query(`
      SELECT 
        pp.id,
        pp.product_id,
        pp.provider_id,
        pp.price,
        pp.stock_quantity,
        pp.delivery_time_hours,
        p.name as product_name,
        pv.name as provider_name
      FROM product_prices pp
      JOIN products p ON pp.product_id = p.id
      JOIN providers pv ON pp.provider_id = pv.id
      WHERE pp.id = $1
    `, [id])

    res.json(updatedPriceResult.rows[0])
  } catch (error) {
    console.error('Update product price error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(`
      SELECT id, name, description, category, specifications, image_url, created_at, updated_at
      FROM products
      WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new product
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { name, description, category, specifications, image_url } = req.body

    // Validation
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' })
    }

    const result = await db.query(`
      INSERT INTO products (name, description, category, specifications, image_url)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [name, description, category, specifications, image_url])

    const newProductResult = await db.query(`
      SELECT id, name, description, category, specifications, image_url, created_at, updated_at
      FROM products
      WHERE id = $1
    `, [result.rows[0].id])

    res.status(201).json(newProductResult.rows[0])
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update product
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, category, specifications, image_url } = req.body

    const result = await db.query(`
      UPDATE products
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          specifications = COALESCE($4, specifications),
          image_url = COALESCE($5, image_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [name, description, category, specifications, image_url, id])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const updatedProductResult = await db.query(`
      SELECT id, name, description, category, specifications, image_url, created_at, updated_at
      FROM products
      WHERE id = $1
    `, [id])

    res.json(updatedProductResult.rows[0])
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete product
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(`
      DELETE FROM products
      WHERE id = $1
    `, [id])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get product with prices
router.get('/:id/prices', async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.category,
        p.specifications,
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
      LEFT JOIN product_prices pp ON p.id = pp.product_id
      LEFT JOIN providers pv ON pp.provider_id = pv.id
      WHERE p.id = $1
      ORDER BY pp.price ASC
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const product = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      category: result.rows[0].category,
      specifications: result.rows[0].specifications,
      prices: []
    }

    result.rows.forEach(row => {
      if (row.price_id) {
        product.prices.push({
          id: row.price_id,
          price: parseFloat(row.price),
          stockQuantity: row.stock_quantity,
          deliveryTime: row.delivery_time_hours,
          provider: {
            id: row.provider_id,
            name: row.provider_name,
            address: row.provider_address,
            phone: row.provider_phone,
            email: row.provider_email,
            rating: parseFloat(row.provider_rating)
          }
        })
      }
    })

    res.json(product)
  } catch (error) {
    console.error('Get product prices error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 