import express from 'express'
import { db } from '../database/connection.js'
import { authenticateToken, checkRole } from './auth.js'

const router = express.Router()

// Solo proteger rutas de modificación para proveedores
// Las rutas de consulta serán accesibles para admin y proveedor

// GET /api/providers - lista de proveedores (pública para el panel de admin)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const result = await db.query(`
      SELECT id, name, contact_person, phone, email, address, delivery_time_hours, rating, created_at, updated_at
      FROM providers
      ORDER BY name
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), parseInt(offset)])
    res.json(result.rows)
  } catch (error) {
    console.error('Get providers error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/providers/:id - detalle de proveedor (admin y proveedor)
router.get('/:id', authenticateToken, checkRole(['admin', 'proveedor']), async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(`
      SELECT id, name, contact_person, phone, email, address, delivery_time_hours, rating, created_at, updated_at
      FROM providers
      WHERE id = $1
    `, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error('Get provider error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Proteger el resto de rutas solo para proveedores
// Cambiar a: permitir DELETE para admin y proveedor

// Create new provider
router.post('/', async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, delivery_time_hours, rating } = req.body

    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const result = await db.query(`
      INSERT INTO providers (name, contact_person, phone, email, address, delivery_time_hours, rating)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, contact_person, phone, email, address, delivery_time_hours, rating, created_at, updated_at
    `, [name, contact_person, phone, email, address, delivery_time_hours || 24, rating || 5.0])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create provider error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update provider
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, contact_person, phone, email, address, delivery_time_hours, rating } = req.body

    const result = await db.query(`
      UPDATE providers
      SET name = COALESCE($1, name),
          contact_person = COALESCE($2, contact_person),
          phone = COALESCE($3, phone),
          email = COALESCE($4, email),
          address = COALESCE($5, address),
          delivery_time_hours = COALESCE($6, delivery_time_hours),
          rating = COALESCE($7, rating),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id, name, contact_person, phone, email, address, delivery_time_hours, rating, created_at, updated_at
    `, [name, contact_person, phone, email, address, delivery_time_hours, rating, id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update provider error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete provider
router.delete('/:id', authenticateToken, checkRole(['admin', 'proveedor']), async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete all product_prices for this provider
    await db.query(`DELETE FROM product_prices WHERE provider_id = $1`, [id]);

    // 2. Delete all products that no longer have any product_prices (orphaned products)
    await db.query(`DELETE FROM products WHERE id NOT IN (SELECT DISTINCT product_id FROM product_prices)`);

    // 3. Delete the provider
    const result = await db.query(`DELETE FROM providers WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({ message: 'Provider and related data deleted successfully' });
  } catch (error) {
    console.error('Delete provider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get provider with products
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(`
      SELECT 
        pv.id,
        pv.name,
        pv.contact_person,
        pv.phone,
        pv.email,
        pv.address,
        pv.delivery_time_hours,
        pv.rating,
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.category as product_category,
        pp.price,
        pp.stock_quantity,
        pp.delivery_time_hours as product_delivery_time
      FROM providers pv
      LEFT JOIN product_prices pp ON pv.id = pp.provider_id
      LEFT JOIN products p ON pp.product_id = p.id
      WHERE pv.id = $1
      ORDER BY p.name
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' })
    }

    const provider = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      contact_person: result.rows[0].contact_person,
      phone: result.rows[0].phone,
      email: result.rows[0].email,
      address: result.rows[0].address,
      delivery_time_hours: result.rows[0].delivery_time_hours,
      rating: result.rows[0].rating,
      products: []
    }

    result.rows.forEach(row => {
      if (row.product_id) {
        provider.products.push({
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          category: row.product_category,
          price: parseFloat(row.price),
          stockQuantity: row.stock_quantity,
          deliveryTime: row.product_delivery_time
        })
      }
    })

    res.json(provider)
  } catch (error) {
    console.error('Get provider products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Obtener pedidos (cotizaciones confirmadas) para el proveedor autenticado
router.get('/orders', async (req, res) => {
  try {
    // Obtener el user_id del usuario autenticado
    const userId = req.user.id;
    // Buscar el provider_id asociado a este usuario
    const providerResult = await db.query('SELECT id FROM providers WHERE user_id = $1', [userId]);
    if (providerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado para este usuario' });
    }
    const provider = providerResult.rows[0];
    
    // Buscar cotizaciones con status 'pedido' que tengan al menos un item para este provider
    const quotationsResult = await db.query(`
      SELECT DISTINCT q.id, q.customer_name, q.customer_email, q.customer_phone, q.total_amount, q.status, q.created_at
      FROM quotations q
      JOIN quotation_items qi ON qi.quotation_id = q.id
      WHERE q.status = 'pedido' AND qi.provider_id = $1
      ORDER BY q.created_at DESC
    `, [provider.id]);
    
    // Para cada cotización, obtener los items de ese provider
    const result = [];
    for (const q of quotationsResult.rows) {
      const itemsResult = await db.query(`
        SELECT qi.id, qi.product_id, p.name as product_name, qi.quantity, qi.unit_price, qi.total_price, qi.delivery_time_hours
        FROM quotation_items qi
        JOIN products p ON qi.product_id = p.id
        WHERE qi.quotation_id = $1 AND qi.provider_id = $2
      `, [q.id, provider.id]);
      
      result.push({
        ...q,
        items: itemsResult.rows
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Get provider orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router 