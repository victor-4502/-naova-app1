import { db } from './src/database/connection.js'

console.log('📋 Creando cotizaciones de ejemplo...')

try {
  // Obtener productos y proveedores existentes
  const products = db.prepare('SELECT id, name FROM products LIMIT 10').all()
  const providers = db.prepare('SELECT id, name FROM providers').all()
  const users = db.prepare('SELECT id, username FROM users WHERE role = "cliente" LIMIT 3').all()
  
  // Si no hay usuarios cliente, crear algunos
  if (users.length === 0) {
    console.log('👤 Creando usuarios cliente...')
    const bcrypt = await import('bcryptjs')
    const hashedPassword = bcrypt.hashSync('cliente123', 10)
    
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `)
    
    const clientUsers = [
      { username: 'cliente1', email: 'cliente1@naova.com' },
      { username: 'cliente2', email: 'cliente2@naova.com' },
      { username: 'cliente3', email: 'cliente3@naova.com' }
    ]
    
    clientUsers.forEach(user => {
      insertUser.run(user.username, user.email, hashedPassword, 'cliente')
    })
    
    // Obtener los usuarios cliente recién creados
    const newUsers = db.prepare('SELECT id, username FROM users WHERE role = "cliente" LIMIT 3').all()
    users.push(...newUsers)
  }

  if (products.length === 0 || providers.length === 0 || users.length === 0) {
    console.log('❌ No hay suficientes datos para crear cotizaciones')
    process.exit(1)
  }

  console.log(`📦 Productos disponibles: ${products.length}`)
  console.log(`🏢 Proveedores disponibles: ${providers.length}`)
  console.log(`👤 Usuarios cliente disponibles: ${users.length}`)

  // Crear cotizaciones de ejemplo
  const sampleQuotations = [
    {
      customer_name: 'Juan Pérez',
      customer_email: 'juan.perez@email.com',
      customer_phone: '+57 300 123 4567',
      total_amount: 0,
      status: 'pedido',
      payment_status: 'pagado',
      sub_status: 'procesando envío',
      user_id: users[0]?.id || null
    },
    {
      customer_name: 'María García',
      customer_email: 'maria.garcia@email.com',
      customer_phone: '+57 300 234 5678',
      total_amount: 0,
      status: 'pedido',
      payment_status: 'pagado',
      sub_status: 'en camino',
      user_id: users[1]?.id || null
    },
    {
      customer_name: 'Carlos López',
      customer_email: 'carlos.lopez@email.com',
      customer_phone: '+57 300 345 6789',
      total_amount: 0,
      status: 'pedido',
      payment_status: 'pendiente',
      sub_status: 'procesando envío',
      user_id: users[2]?.id || null
    }
  ]

  // Insertar cotizaciones
  const insertQuotation = db.prepare(`
    INSERT INTO quotations (customer_name, customer_email, customer_phone, total_amount, status, payment_status, sub_status, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertQuotationItem = db.prepare(`
    INSERT INTO quotation_items (quotation_id, product_id, provider_id, quantity, unit_price, total_price, delivery_time_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  let totalQuotations = 0

  sampleQuotations.forEach((quotation, index) => {
    // Insertar cotización
    const result = insertQuotation.run(
      quotation.customer_name,
      quotation.customer_email,
      quotation.customer_phone,
      quotation.total_amount,
      quotation.status,
      quotation.payment_status,
      quotation.sub_status,
      quotation.user_id
    )

    const quotationId = result.lastInsertRowid
    let quotationTotal = 0

    // Agregar 2-4 productos por cotización
    const numProducts = Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < numProducts; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const provider = providers[Math.floor(Math.random() * providers.length)]
      
      // Obtener precio del producto para este proveedor
      const priceInfo = db.prepare(`
        SELECT price, delivery_time_hours 
        FROM product_prices 
        WHERE product_id = ? AND provider_id = ?
      `).get(product.id, provider.id)

      if (priceInfo) {
        const quantity = Math.floor(Math.random() * 5) + 1
        const unitPrice = priceInfo.price
        const totalPrice = unitPrice * quantity
        const deliveryTime = priceInfo.delivery_time_hours

        insertQuotationItem.run(
          quotationId,
          product.id,
          provider.id,
          quantity,
          unitPrice,
          totalPrice,
          deliveryTime
        )

        quotationTotal += totalPrice
      }
    }

    // Actualizar total de la cotización
    db.prepare('UPDATE quotations SET total_amount = ? WHERE id = ?').run(quotationTotal, quotationId)
    totalQuotations++
  })

  console.log(`✅ Se crearon ${totalQuotations} cotizaciones de ejemplo`)
  console.log(`💰 Cotizaciones con status "pedido" creadas para que los proveedores las vean`)

  // Mostrar resumen
  const quotationCount = db.prepare('SELECT COUNT(*) as count FROM quotations').get()
  const itemCount = db.prepare('SELECT COUNT(*) as count FROM quotation_items').get()
  
  console.log(`📊 Total de cotizaciones en la base: ${quotationCount.count}`)
  console.log(`📦 Total de items en cotizaciones: ${itemCount.count}`)

} catch (error) {
  console.error('❌ Error creando cotizaciones:', error.message)
} 