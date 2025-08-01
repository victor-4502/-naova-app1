const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

console.log('📋 Creando cotizaciones de ejemplo...');

try {
  const dbPath = path.join(__dirname, 'naova.sqlite');
  const db = new Database(dbPath);
  
  // Obtener datos existentes
  const products = db.prepare('SELECT id, name FROM products LIMIT 5').all();
  const providers = db.prepare('SELECT id, name FROM providers').all();
  
  console.log(`📦 Productos: ${products.length}`);
  console.log(`🏢 Proveedores: ${providers.length}`);
  
  // Crear usuarios cliente si no existen
  const clientUsers = db.prepare('SELECT id FROM users WHERE role = "cliente"').all();
  if (clientUsers.length === 0) {
    console.log('👤 Creando usuarios cliente...');
    const hashedPassword = bcrypt.hashSync('cliente123', 10);
    
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `);
    
    insertUser.run('cliente1', 'cliente1@naova.com', hashedPassword, 'cliente');
    insertUser.run('cliente2', 'cliente2@naova.com', hashedPassword, 'cliente');
    insertUser.run('cliente3', 'cliente3@naova.com', hashedPassword, 'cliente');
    
    console.log('✅ Usuarios cliente creados');
  }
  
  // Obtener usuarios cliente
  const users = db.prepare('SELECT id FROM users WHERE role = "cliente" LIMIT 3').all();
  console.log(`👤 Usuarios cliente: ${users.length}`);
  
  // Crear cotizaciones
  const insertQuotation = db.prepare(`
    INSERT INTO quotations (customer_name, customer_email, customer_phone, total_amount, status, payment_status, sub_status, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertItem = db.prepare(`
    INSERT INTO quotation_items (quotation_id, product_id, provider_id, quantity, unit_price, total_price, delivery_time_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const customers = [
    { name: 'Juan Pérez', email: 'juan@email.com', phone: '+57 300 123 4567' },
    { name: 'María García', email: 'maria@email.com', phone: '+57 300 234 5678' },
    { name: 'Carlos López', email: 'carlos@email.com', phone: '+57 300 345 6789' }
  ];
  
  let totalCreated = 0;
  
  customers.forEach((customer, index) => {
    // Crear cotización
    const result = insertQuotation.run(
      customer.name,
      customer.email,
      customer.phone,
      0, // total_amount se actualizará después
      'pedido',
      'pagado',
      'procesando envío',
      users[index]?.id || null
    );
    
    const quotationId = result.lastInsertRowid;
    let total = 0;
    
    // Agregar 2-3 productos
    const numProducts = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < numProducts; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      
      // Obtener precio
      const priceInfo = db.prepare(`
        SELECT price, delivery_time_hours 
        FROM product_prices 
        WHERE product_id = ? AND provider_id = ?
      `).get(product.id, provider.id);
      
      if (priceInfo) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = priceInfo.price;
        const itemTotal = unitPrice * quantity;
        
        insertItem.run(
          quotationId,
          product.id,
          provider.id,
          quantity,
          unitPrice,
          itemTotal,
          priceInfo.delivery_time_hours
        );
        
        total += itemTotal;
      }
    }
    
    // Actualizar total
    db.prepare('UPDATE quotations SET total_amount = ? WHERE id = ?').run(total, quotationId);
    totalCreated++;
  });
  
  console.log(`✅ Se crearon ${totalCreated} cotizaciones`);
  
  // Verificar
  const count = db.prepare('SELECT COUNT(*) as count FROM quotations').get();
  const itemCount = db.prepare('SELECT COUNT(*) as count FROM quotation_items').get();
  
  console.log(`📊 Total cotizaciones: ${count.count}`);
  console.log(`📦 Total items: ${itemCount.count}`);
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error.message);
} 