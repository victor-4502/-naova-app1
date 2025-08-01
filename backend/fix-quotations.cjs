const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

console.log('🔧 Arreglando cotizaciones...');

try {
  const dbPath = path.join(__dirname, 'naova.sqlite');
  const db = new Database(dbPath);
  
  // 1. Crear usuarios cliente
  console.log('👤 Verificando usuarios cliente...');
  const clientCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('cliente');
  
  if (clientCount.count === 0) {
    console.log('Creando usuarios cliente...');
    const hashedPassword = bcrypt.hashSync('cliente123', 10);
    
    db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('cliente1', 'cliente1@naova.com', hashedPassword, 'cliente');
    db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('cliente2', 'cliente2@naova.com', hashedPassword, 'cliente');
    db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('cliente3', 'cliente3@naova.com', hashedPassword, 'cliente');
    console.log('✅ Usuarios cliente creados');
  } else {
    console.log(`✅ Ya existen ${clientCount.count} usuarios cliente`);
  }
  
  // 2. Crear cotizaciones
  console.log('📋 Creando cotizaciones...');
  
  const products = db.prepare('SELECT id FROM products LIMIT 3').all();
  const providers = db.prepare('SELECT id FROM providers').all();
  const users = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 3').all('cliente');
  
  if (products.length === 0 || providers.length === 0 || users.length === 0) {
    console.log('❌ Faltan datos básicos');
    return;
  }
  
  // Crear 3 cotizaciones
  for (let i = 0; i < 3; i++) {
    const customerName = `Cliente ${i + 1}`;
    const customerEmail = `cliente${i + 1}@email.com`;
    const customerPhone = `+57 300 ${100 + i} 4567`;
    
    // Insertar cotización
    const result = db.prepare(`
      INSERT INTO quotations (customer_name, customer_email, customer_phone, total_amount, status, payment_status, sub_status, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(customerName, customerEmail, customerPhone, 0, 'pedido', 'pagado', 'procesando envío', users[i]?.id);
    
    const quotationId = result.lastInsertRowid;
    let total = 0;
    
    // Agregar productos
    for (let j = 0; j < 2; j++) {
      const product = products[j % products.length];
      const provider = providers[j % providers.length];
      
      const priceInfo = db.prepare('SELECT price, delivery_time_hours FROM product_prices WHERE product_id = ? AND provider_id = ?').get(product.id, provider.id);
      
      if (priceInfo) {
        const quantity = 2;
        const unitPrice = priceInfo.price;
        const itemTotal = unitPrice * quantity;
        
        db.prepare(`
          INSERT INTO quotation_items (quotation_id, product_id, provider_id, quantity, unit_price, total_price, delivery_time_hours)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(quotationId, product.id, provider.id, quantity, unitPrice, itemTotal, priceInfo.delivery_time_hours);
        
        total += itemTotal;
      }
    }
    
    // Actualizar total
    db.prepare('UPDATE quotations SET total_amount = ? WHERE id = ?').run(total, quotationId);
  }
  
  console.log('✅ Cotizaciones creadas');
  
  // Verificar
  const quotationCount = db.prepare('SELECT COUNT(*) as count FROM quotations').get();
  const itemCount = db.prepare('SELECT COUNT(*) as count FROM quotation_items').get();
  
  console.log(`📊 Cotizaciones: ${quotationCount.count}`);
  console.log(`📦 Items: ${itemCount.count}`);
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error.message);
} 