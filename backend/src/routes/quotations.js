import express from 'express'
import { db } from '../database/connection.js'
import { authenticateToken } from './auth.js'

const router = express.Router()

// Create new quotation
router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, notes } = req.body

    // Validation
    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer name and items are required' })
    }

    // Get user_id from token if authenticated
    let userId = null
    const authHeader = req.headers['authorization']
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1]
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        userId = payload.id
      } catch (error) {
        // Token invalid, continue as anonymous user
        console.log('Invalid token, creating anonymous quotation')
      }
    }

    // Calculate totals
    let totalAmount = 0
    const quotationItems = []

    for (const item of items) {
      const { productId, quantity, providerId } = item
      
             // Get product price from database
       const priceResult = await db.query(`
         SELECT pp.price, pp.delivery_time_hours
         FROM product_prices pp
         WHERE pp.product_id = $1 AND pp.provider_id = $2
       `, [productId, providerId])
       
       const priceData = priceResult.rows[0]

      if (!priceData) {
        return res.status(400).json({ error: `Price not found for product ${productId} and provider ${providerId}` })
      }

      const itemTotal = parseFloat(priceData.price) * quantity
      totalAmount += itemTotal

      quotationItems.push({
        productId,
        providerId,
        quantity,
        unitPrice: parseFloat(priceData.price),
        totalPrice: itemTotal,
        deliveryTime: priceData.delivery_time_hours
      })
    }

         // Insert quotation with user_id if authenticated
     const quotationResult = await db.query(`
       INSERT INTO quotations (customer_name, customer_email, customer_phone, total_amount, notes, status, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id
     `, [customerName, customerEmail, customerPhone, totalAmount, notes, 'pendiente', userId])

     const quotationId = quotationResult.rows[0].id

         // Insert quotation items
     for (const item of quotationItems) {
       await db.query(`
         INSERT INTO quotation_items (quotation_id, product_id, provider_id, quantity, unit_price, total_price, delivery_time_hours)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
       `, [quotationId, item.productId, item.providerId, item.quantity, item.unitPrice, item.totalPrice, item.deliveryTime])
     }

         // Get the created quotation with items
     const quotation = await getQuotationById(quotationId)

    res.status(201).json(quotation)
  } catch (error) {
    console.error('Create quotation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's quotations (authenticated users only)
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    
    const result = await db.query(`
      SELECT id, customer_name, customer_email, total_amount, status, created_at
      FROM quotations
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId])
    
    res.json(result.rows)
  } catch (error) {
    console.error('Get user quotations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET quotation by ID (with provider filtering)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    let quotation = await getQuotationById(id)

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' })
    }

    // Si el usuario autenticado es proveedor, filtrar los items
    if (req.user && req.user.role === 'proveedor') {
      // Log temporal para depuración
      console.log('DEBUG quotation.items antes del filtro:', JSON.stringify(quotation.items, null, 2));
      // Buscar el provider_id correspondiente a este usuario
      const providerResult = await db.query('SELECT id FROM providers WHERE user_id = $1', [req.user.id])
      if (providerResult.rows.length > 0) {
        const provider = providerResult.rows[0]
        quotation.items = quotation.items.filter(item => item.provider.id === provider.id)
      } else {
        // Si el usuario no está vinculado a un proveedor, no mostrar nada
        quotation.items = []
      }
    }

    res.json(quotation)
  } catch (error) {
    console.error('Get quotation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all quotations (pública para el panel de admin)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    
    const result = await db.query(`
      SELECT id, customer_name, customer_email, customer_phone, total_amount, status, sub_status, created_at
      FROM quotations
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), parseInt(offset)])
    
    res.json(result.rows)
  } catch (error) {
    console.error('Get quotations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// NUEVO: Endpoint para actualizar el status de una cotización
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ error: 'Falta status' })
    }
    const validStatuses = ['pendiente', 'finalizada']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' })
    }
    const result = await db.query('UPDATE quotations SET status = $1 WHERE id = $2', [status, id])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' })
    }
    res.json({ message: 'Status actualizado', id, status })
  } catch (error) {
    console.error('Update quotation status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Endpoint para confirmar una cotización (realizar pedido)
router.patch('/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    // Verificar que la cotización pertenece al usuario
    const quotationResult = await db.query('SELECT * FROM quotations WHERE id = $1', [id]);
    if (quotationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    const quotation = quotationResult.rows[0];
    if (quotation.user_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para confirmar este pedido' });
    }
    if (quotation.status === 'pedido') {
      return res.status(400).json({ error: 'La cotización ya fue confirmada como pedido' });
    }
    // Verificar que el pago esté realizado antes de confirmar como pedido
    if (quotation.payment_status !== 'pagado') {
      return res.status(400).json({ error: 'No se puede confirmar el pedido hasta que el pago esté realizado' });
    }
    // Cambiar status a 'pedido'
    await db.query('UPDATE quotations SET status = $1 WHERE id = $2', ['pedido', id]);
    res.json({ message: 'Pedido confirmado', id });
  } catch (error) {
    console.error('Confirm quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para actualizar el payment_status de una cotización
router.put('/:id/payment-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    if (!payment_status) {
      return res.status(400).json({ error: 'Falta payment_status' });
    }
    // Actualizar el payment_status
    const result = await db.query('UPDATE quotations SET payment_status = $1 WHERE id = $2', [payment_status, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    // Si el nuevo payment_status es 'pagado', cambiar status a 'pedido'
    if (payment_status === 'pagado') {
      await db.query('UPDATE quotations SET status = $1 WHERE id = $2', ['pedido', id]);
    }
    res.json({ message: 'payment_status actualizado', id, payment_status });
  } catch (error) {
    console.error('Update payment_status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para actualizar el sub_status de una cotización (solo proveedor asignado y status 'pedido')
router.put('/:id/sub-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { sub_status } = req.body;
    const validSubStatuses = ['procesando envío', 'en camino', 'entregado'];
    if (!sub_status || !validSubStatuses.includes(sub_status)) {
      return res.status(400).json({ error: 'Sub-estado inválido' });
    }
    // Solo proveedores pueden cambiar el sub_status
    if (!req.user || req.user.role !== 'proveedor') {
      return res.status(403).json({ error: 'Solo proveedores pueden cambiar el sub-estado' });
    }
    // Buscar el provider_id correspondiente a este usuario
    const providerResult = await db.query('SELECT id FROM providers WHERE user_id = $1', [req.user.id]);
    if (providerResult.rows.length === 0) {
      return res.status(403).json({ error: 'Proveedor no encontrado para este usuario' });
    }
    const provider = providerResult.rows[0];
    // Verificar que el proveedor esté asignado a la cotización (al menos un item)
    const itemResult = await db.query('SELECT 1 FROM quotation_items WHERE quotation_id = $1 AND provider_id = $2', [id, provider.id]);
    if (itemResult.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta cotización' });
    }
    // Verificar que el status sea 'pedido'
    const quotationResult = await db.query('SELECT status FROM quotations WHERE id = $1', [id]);
    if (quotationResult.rows.length === 0 || quotationResult.rows[0].status !== 'pedido') {
      return res.status(400).json({ error: 'Solo se puede cambiar el sub-estado si el status es "pedido"' });
    }
    // Actualizar el sub_status
    await db.query('UPDATE quotations SET sub_status = $1 WHERE id = $2', [sub_status, id]);
    res.json({ message: 'Sub-estado actualizado', id, sub_status });
  } catch (error) {
    console.error('Update quotation sub_status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para que un proveedor vea todas sus órdenes de pedido (cotizaciones confirmadas con sus productos)
router.get('/provider', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'proveedor') {
      return res.status(403).json({ error: 'Solo proveedores pueden acceder a este recurso' })
    }
    // Buscar el provider_id correspondiente a este usuario
    const providerResult = await db.query('SELECT id FROM providers WHERE user_id = $1', [req.user.id])
    if (providerResult.rows.length === 0) {
      return res.json([])
    }
    const provider = providerResult.rows[0];
    // Buscar todas las cotizaciones con status 'pedido' donde este proveedor tiene productos
    const quotationsResult = await db.query(`
      SELECT DISTINCT q.id, q.customer_name, q.customer_email, q.customer_phone, q.total_amount, q.status, q.created_at
      FROM quotations q
      JOIN quotation_items qi ON q.id = qi.quotation_id
      WHERE qi.provider_id = $1 AND q.status = 'pedido'
      ORDER BY q.created_at DESC
    `, [provider.id])
    
    // Para cada cotización, obtener solo los productos de este proveedor
    const result = [];
    for (const q of quotationsResult.rows) {
      const itemsResult = await db.query(`
        SELECT qi.id, qi.product_id, p.name as product_name, qi.quantity, qi.unit_price, qi.total_price, qi.delivery_time_hours
        FROM quotation_items qi
        JOIN products p ON qi.product_id = p.id
        WHERE qi.quotation_id = $1 AND qi.provider_id = $2
      `, [q.id, provider.id])
      
      result.push({
        ...q,
        items: itemsResult.rows
      });
    }
    res.json(result)
  } catch (error) {
    console.error('Get provider quotations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper function to get quotation by ID with items
async function getQuotationById(id) {
  // Get quotation basic info
  const quotationResult = await db.query(`
    SELECT id, customer_name, customer_email, customer_phone, total_amount, status, notes, created_at, sub_status
    FROM quotations
    WHERE id = $1
  `, [id])
  
  const quotation = quotationResult.rows[0]

  if (!quotation) {
    return null
  }

  // Get quotation items with product and provider details
  const itemsResult = await db.query(`
    SELECT 
      qi.id,
      qi.quantity,
      qi.unit_price,
      qi.total_price,
      qi.delivery_time_hours,
      p.id as product_id,
      p.name as product_name,
      p.description as product_description,
      p.category as product_category,
      p.specifications as product_specifications,
      pv.id as provider_id,
      pv.name as provider_name,
      pv.rating as provider_rating
    FROM quotation_items qi
    JOIN products p ON qi.product_id = p.id
    JOIN providers pv ON qi.provider_id = pv.id
    WHERE qi.quotation_id = $1
    ORDER BY qi.id
  `, [id])
  
  const items = itemsResult.rows

  return {
    ...quotation,
    totalAmount: parseFloat(quotation.total_amount),
    subStatus: quotation.sub_status,
    items: items.map(item => ({
      id: item.id,
      product: {
        id: item.product_id,
        name: item.product_name,
        description: item.product_description,
        category: item.product_category,
        specifications: item.product_specifications
      },
      quantity: item.quantity,
      unitPrice: parseFloat(item.unit_price),
      totalPrice: parseFloat(item.total_price),
      deliveryTime: item.delivery_time_hours,
      provider: {
        id: item.provider_id,
        name: item.provider_name,
        rating: parseFloat(item.provider_rating)
      }
    })),
    expiresAt: new Date(new Date(quotation.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
}

export default router 