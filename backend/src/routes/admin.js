import express from 'express'
import multer from 'multer'
import { db } from '../database/connection.js'
import { authenticateToken, checkRole } from './auth.js'
import { parse as csvParse } from 'csv-parse/sync'

const router = express.Router()

// Proteger todas las rutas de admin
router.use(authenticateToken, checkRole(['admin']))

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {}

    // Count products
    const productsResult = await db.query('SELECT COUNT(*) as count FROM products')
    stats.totalProducts = parseInt(productsResult.rows[0].count)

    // Count providers
    const providersResult = await db.query('SELECT COUNT(*) as count FROM providers')
    stats.totalProviders = parseInt(providersResult.rows[0].count)

    // Count prices
    const pricesResult = await db.query('SELECT COUNT(*) as count FROM product_prices')
    stats.totalPrices = parseInt(pricesResult.rows[0].count)

    // Count quotations
    const quotationsResult = await db.query('SELECT COUNT(*) as count FROM quotations')
    stats.totalQuotations = parseInt(quotationsResult.rows[0].count)

    // Recent quotations
    const recentQuotationsResult = await db.query(`
      SELECT id, total_amount as total_price, created_at
      FROM quotations
      ORDER BY created_at DESC
      LIMIT 5
    `)
    stats.recentQuotations = recentQuotationsResult.rows

    // Products by category
    const categoriesResult = await db.query(`
      SELECT category, COUNT(*) as count
      FROM products
      GROUP BY category
      ORDER BY count DESC
    `)
    stats.productsByCategory = categoriesResult.rows

    res.json(stats)
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Import products from CSV/Excel
router.post('/import/products', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Parse CSV
    const csvString = req.file.buffer.toString('utf-8')
    let records
    try {
      records = csvParse(csvString, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
    } catch (parseErr) {
      return res.status(400).json({ error: 'Invalid CSV format', details: parseErr.message })
    }

    let imported = 0
    const errors = []
    const insert = db.prepare(`
      INSERT INTO products (name, description, category, unit, keywords, specifications)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const insertPrice = db.prepare(`
      INSERT INTO product_prices (product_id, provider_id, price, stock_quantity, delivery_time_hours)
      VALUES (?, ?, ?, ?, ?)
    `)

    for (const row of records) {
      // Validar campos mínimos
      if (!row.name || !row.category) {
        errors.push({ row, error: 'Missing required fields: name or category' })
        continue
      }
      try {
        const result = insert.run(
          row.name,
          row.description || '',
          row.category,
          row.unit || 'unidad',
          row.keywords || '',
          row.specifications || ''
        )
        imported++
        // Si hay datos de precio y proveedor válidos, crear el precio
        const price = parseFloat(row.price || '0')
        const providerId = parseInt(row.provider_id || '0')
        if (price > 0 && providerId > 0) {
          try {
            insertPrice.run(
              result.lastInsertRowid,
              providerId,
              price,
              parseInt(row.stock_quantity || '0'),
              parseInt(row.delivery_time_hours || '24')
            )
          } catch (err) {
            errors.push({ row, error: 'Error al crear precio: ' + err.message })
          }
        }
      } catch (err) {
        errors.push({ row, error: err.message })
      }
    }

    res.json({
      message: 'File processed',
      filename: req.file.originalname,
      size: req.file.size,
      imported,
      errors
    })
  } catch (error) {
    console.error('Import products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Import prices from CSV/Excel
router.post('/import/prices', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // TODO: Implement CSV/Excel parsing
    // For now, return a mock response
    res.json({ 
      message: 'File uploaded successfully',
      filename: req.file.originalname,
      size: req.file.size,
      imported: 0 // TODO: Implement actual import logic
    })
  } catch (error) {
    console.error('Import prices error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Export data
router.get('/export/products', async (req, res) => {
  try {
    const products = db.prepare(`
      SELECT id, name, description, category, unit, keywords, created_at, updated_at
      FROM products
      ORDER BY name
    `).all()

    // TODO: Implement CSV/Excel export
    // For now, return JSON
    res.json(products)
  } catch (error) {
    console.error('Export products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/export/prices', async (req, res) => {
  try {
    const prices = db.prepare(`
      SELECT 
        p.name as product_name,
        p.category as product_category,
        pv.name as provider_name,
        pr.price,
        pr.currency,
        pr.available,
        pr.min_quantity,
        pr.delivery_time_hours,
        pr.created_at,
        pr.updated_at
      FROM prices pr
      JOIN products p ON pr.product_id = p.id
      JOIN providers pv ON pr.provider_id = pv.id
      ORDER BY p.name, pv.name
    `).all()

    // TODO: Implement CSV/Excel export
    // For now, return JSON
    res.json(prices)
  } catch (error) {
    console.error('Export prices error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Bulk operations
router.post('/bulk/delete-products', async (req, res) => {
  try {
    const { productIds } = req.body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Product IDs array is required' })
    }

    const placeholders = productIds.map(() => '?').join(',')
    const deleteProducts = db.prepare(`
      DELETE FROM products
      WHERE id IN (${placeholders})
    `)
    
    const result = deleteProducts.run(...productIds)

    res.json({ 
      message: `${result.changes} products deleted successfully`,
      deletedIds: productIds
    })
  } catch (error) {
    console.error('Bulk delete products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/bulk/update-prices', async (req, res) => {
  try {
    const { updates } = req.body

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' })
    }

    const updatePrice = db.prepare(`
      UPDATE prices
      SET price = ?,
          delivery_time_hours = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    let updatedCount = 0

    for (const update of updates) {
      const { priceId, price, deliveryTime } = update
      const result = updatePrice.run(price, deliveryTime, priceId)
      if (result.changes > 0) {
        updatedCount++
      }
    }

    res.json({ 
      message: `${updatedCount} prices updated successfully`
    })
  } catch (error) {
    console.error('Bulk update prices error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get price range
router.get('/price-range', (req, res) => {
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
      sql += ' WHERE p.category = ?'
      params.push(category)
    }

    const result = db.prepare(sql).get(params)

    res.json({
      min_price: parseFloat(result.min_price || 0),
      max_price: parseFloat(result.max_price || 0),
      avg_price: parseFloat(result.avg_price || 0)
    })
  } catch (error) {
    console.error('Get price range error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// NUEVO: Endpoint para unir productos
router.post('/merge-products', (req, res) => {
  try {
    const { sourceProductId, targetProductId } = req.body

    if (!sourceProductId || !targetProductId) {
      return res.status(400).json({ error: 'Se requieren sourceProductId y targetProductId' })
    }

    if (sourceProductId === targetProductId) {
      return res.status(400).json({ error: 'No se puede unir un producto consigo mismo' })
    }

    console.log(`Uniendo producto ${sourceProductId} con ${targetProductId}`)

    // Verificar que ambos productos existen
    const sourceProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(sourceProductId)
    const targetProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(targetProductId)

    if (!sourceProduct || !targetProduct) {
      return res.status(404).json({ error: 'Uno o ambos productos no existen' })
    }

    // Obtener todos los precios del producto origen
    const sourcePrices = db.prepare('SELECT * FROM product_prices WHERE product_id = ?').all(sourceProductId)
    const targetPrices = db.prepare('SELECT * FROM product_prices WHERE product_id = ?').all(targetProductId)

    console.log(`Producto origen tiene ${sourcePrices.length} precios`)
    console.log(`Producto destino tiene ${targetPrices.length} precios`)

    // Iniciar transacción
    const transaction = db.transaction(() => {
      // Mover todos los precios del producto origen al producto destino
      for (const price of sourcePrices) {
        // Verificar si ya existe un precio para el mismo proveedor en el producto destino
        const existingPrice = db.prepare(`
          SELECT * FROM product_prices 
          WHERE product_id = ? AND provider_id = ?
        `).get(targetProductId, price.provider_id)

        if (existingPrice) {
          // Si ya existe, actualizar con el precio más bajo
          const newPrice = Math.min(existingPrice.price, price.price)
          const newStock = existingPrice.stock_quantity + price.stock_quantity
          const newDeliveryTime = Math.min(existingPrice.delivery_time_hours, price.delivery_time_hours)

          db.prepare(`
            UPDATE product_prices 
            SET price = ?, stock_quantity = ?, delivery_time_hours = ?
            WHERE id = ?
          `).run(newPrice, newStock, newDeliveryTime, existingPrice.id)

          // Eliminar el precio del producto origen
          db.prepare('DELETE FROM product_prices WHERE id = ?').run(price.id)
        } else {
          // Si no existe, mover el precio al producto destino
          db.prepare(`
            UPDATE product_prices 
            SET product_id = ?
            WHERE id = ?
          `).run(targetProductId, price.id)
        }
      }

      // Eliminar el producto origen
      db.prepare('DELETE FROM products WHERE id = ?').run(sourceProductId)

      console.log(`Productos unidos exitosamente. Producto ${sourceProductId} eliminado.`)
    })

    // Ejecutar transacción
    transaction()

    res.json({ 
      message: 'Productos unidos exitosamente',
      sourceProductId,
      targetProductId,
      movedPrices: sourcePrices.length
    })

  } catch (error) {
    console.error('Error merging products:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// NUEVO: Endpoint para obtener órdenes de pedido por cotización
router.get('/orders/by-quotation/:quotationId', (req, res) => {
  try {
    const { quotationId } = req.params
    if (!quotationId) {
      return res.status(400).json({ error: 'Falta quotationId' })
    }

    // Obtener cotización y cliente
    const quotation = db.prepare(`
      SELECT * FROM quotations WHERE id = ?
    `).get(quotationId)
    if (!quotation) {
      return res.status(404).json({ error: 'Cotización no encontrada' })
    }

    // Obtener items de la cotización
    const items = db.prepare(`
      SELECT qi.*, p.name as product_name, p.description as product_description, p.category as product_category, p.unit as product_unit,
             pr.name as provider_name, pr.email as provider_email, pr.phone as provider_phone, pr.address as provider_address
      FROM quotation_items qi
      JOIN products p ON qi.product_id = p.id
      JOIN providers pr ON qi.provider_id = pr.id
      WHERE qi.quotation_id = ?
    `).all(quotationId)

    // Agrupar por proveedor
    const ordersByProvider = {}
    for (const item of items) {
      if (!ordersByProvider[item.provider_id]) {
        ordersByProvider[item.provider_id] = {
          provider: {
            id: item.provider_id,
            name: item.provider_name,
            email: item.provider_email,
            phone: item.provider_phone,
            address: item.provider_address
          },
          customer: {
            name: quotation.customer_name,
            email: quotation.customer_email,
            phone: quotation.customer_phone
          },
          deliveryAddress: quotation.delivery_address || '',
          quotationId: quotation.id,
          orderItems: []
        }
      }
      ordersByProvider[item.provider_id].orderItems.push({
        product_id: item.product_id,
        name: item.product_name,
        description: item.product_description,
        category: item.product_category,
        unit: item.product_unit,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        deliveryTime: item.delivery_time_hours
      })
    }

    // Convertir a array
    const orders = Object.values(ordersByProvider)
    res.json({ orders })
  } catch (error) {
    console.error('Error al obtener órdenes por cotización:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router 