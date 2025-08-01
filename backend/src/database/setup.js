import { db } from './connection.js'
import bcrypt from 'bcryptjs'

console.log('🗄️  Setting up SQLite database...')

try {
  // Create tables
  console.log('📋 Creating tables...')
  
  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      unit TEXT DEFAULT 'unidad',
      keywords TEXT,
      specifications TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Providers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      delivery_time_hours INTEGER DEFAULT 24,
      rating REAL DEFAULT 5.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Product prices table (many-to-many relationship)
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      price REAL NOT NULL,
      stock_quantity INTEGER DEFAULT 0,
      delivery_time_hours INTEGER DEFAULT 24,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES providers (id) ON DELETE CASCADE,
      UNIQUE(product_id, provider_id)
    )
  `)

  // Quotations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
  `)

  // Quotation items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotation_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      delivery_time_hours INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id),
      FOREIGN KEY (provider_id) REFERENCES providers (id)
    )
  `)

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cliente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log('✅ Tables created successfully')

  // Insert sample data
  console.log('📦 Inserting sample data...')

  // Insert providers
  const providers = [
    {
      name: 'Hardware Store A',
      contact_person: 'Juan Pérez',
      phone: '+1-555-0101',
      email: 'juan@hardwarea.com',
      address: '123 Main St, City A',
      delivery_time_hours: 4,
      rating: 4.8
    },
    {
      name: 'Hardware Store B',
      contact_person: 'María García',
      phone: '+1-555-0102',
      email: 'maria@hardwareb.com',
      address: '456 Oak Ave, City B',
      delivery_time_hours: 8,
      rating: 4.5
    },
    {
      name: 'Hardware Store C',
      contact_person: 'Carlos López',
      phone: '+1-555-0103',
      email: 'carlos@hardwarec.com',
      address: '789 Pine Rd, City C',
      delivery_time_hours: 24,
      rating: 4.2
    }
  ]

  const insertProvider = db.prepare(`
    INSERT OR IGNORE INTO providers (name, contact_person, phone, email, address, delivery_time_hours, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  providers.forEach(provider => {
    insertProvider.run(
      provider.name,
      provider.contact_person,
      provider.phone,
      provider.email,
      provider.address,
      provider.delivery_time_hours,
      provider.rating
    )
  })

  // Insertar proveedores también como usuarios
  const providerUserPassword = bcrypt.hashSync('proveedor123', 10)
  const insertProviderUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, email, password, role)
    VALUES (?, ?, ?, ?)
  `)
  providers.forEach(provider => {
    // Generar username a partir del nombre (ej: 'Hardware Store A' -> 'hardwarestorea')
    const username = provider.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    insertProviderUser.run(
      username,
      provider.email,
      providerUserPassword,
      'proveedor'
    )
  })

  // Obtener IDs reales de proveedores
  const providerRows = db.prepare('SELECT id, name FROM providers').all()
  const providerMap = {}
  providerRows.forEach(p => { providerMap[p.name] = p.id })

  // Insert products
  const products = [
    {
      name: 'Tornillos Phillips #8 x 1"',
      description: 'Tornillos de cabeza Phillips, acero inoxidable',
      category: 'Fasteners',
      unit: 'unidad',
      keywords: 'tornillos,phillips,acero,inoxidable,fasteners',
      specifications: 'Material: Acero inoxidable, Cabeza: Phillips, Longitud: 1 pulgada'
    },
    {
      name: 'Martillo de 16 oz',
      description: 'Martillo de carpintero con mango de fibra de vidrio',
      category: 'Tools',
      unit: 'unidad',
      keywords: 'martillo,carpintero,herramientas,16oz',
      specifications: 'Peso: 16 oz, Mango: Fibra de vidrio, Material: Acero'
    },
    {
      name: 'Cable eléctrico 12 AWG',
      description: 'Cable eléctrico para instalaciones residenciales',
      category: 'Electrical',
      unit: 'metro',
      keywords: 'cable,eléctrico,12awg,instalación',
      specifications: 'Calibre: 12 AWG, Aislamiento: PVC, Color: Negro'
    },
    {
      name: 'Tubo PVC 1" x 10ft',
      description: 'Tubo de PVC para plomería',
      category: 'Plumbing',
      unit: 'unidad',
      keywords: 'tubo,pvc,plomería,1pulgada',
      specifications: 'Diámetro: 1 pulgada, Longitud: 10 pies, Material: PVC'
    },
    {
      name: 'Casco de seguridad',
      description: 'Casco de seguridad industrial',
      category: 'Safety',
      unit: 'unidad',
      keywords: 'casco,seguridad,industrial,ansi',
      specifications: 'Material: Polietileno, Color: Amarillo, Certificación: ANSI'
    },
    {
      name: 'Destornillador Phillips #2',
      description: 'Destornillador Phillips de 6 pulgadas',
      category: 'Tools',
      unit: 'unidad',
      keywords: 'destornillador,phillips,herramientas',
      specifications: 'Punta: Phillips #2, Longitud: 6 pulgadas, Mango: Aislamiento'
    },
    {
      name: 'Tuercas hexagonales 1/4"',
      description: 'Tuercas hexagonales de acero',
      category: 'Fasteners',
      unit: 'unidad',
      keywords: 'tuercas,hexagonales,acero,fasteners',
      specifications: 'Tamaño: 1/4 pulgada, Material: Acero, Acabado: Zincado'
    },
    {
      name: 'Interruptor de pared',
      description: 'Interruptor de luz simple',
      category: 'Electrical',
      unit: 'unidad',
      keywords: 'interruptor,luz,eléctrico,120v',
      specifications: 'Voltaje: 120V, Amperaje: 15A, Tipo: Simple'
    }
  ]

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (name, description, category, unit, keywords, specifications)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  products.forEach(product => {
    insertProduct.run(
      product.name,
      product.description,
      product.category,
      product.unit,
      product.keywords,
      product.specifications
    )
  })

  // Obtener IDs reales de productos
  const productRows = db.prepare('SELECT id, name FROM products').all()
  const productMap = {}
  productRows.forEach(p => { productMap[p.name] = p.id })

  // Insert product prices usando los IDs reales
  const productPrices = [
    // Hardware Store A (Fast delivery, higher prices)
    { product: 'Tornillos Phillips #8 x 1"', provider: 'Hardware Store A', price: 0.15, stock_quantity: 1000, delivery_time_hours: 4 },
    { product: 'Martillo de 16 oz', provider: 'Hardware Store A', price: 25.99, stock_quantity: 50, delivery_time_hours: 4 },
    { product: 'Cable eléctrico 12 AWG', provider: 'Hardware Store A', price: 0.85, stock_quantity: 500, delivery_time_hours: 4 },
    { product: 'Tubo PVC 1" x 10ft', provider: 'Hardware Store A', price: 12.99, stock_quantity: 25, delivery_time_hours: 4 },
    { product: 'Casco de seguridad', provider: 'Hardware Store A', price: 18.50, stock_quantity: 30, delivery_time_hours: 4 },
    { product: 'Destornillador Phillips #2', provider: 'Hardware Store A', price: 8.99, stock_quantity: 75, delivery_time_hours: 4 },
    { product: 'Tuercas hexagonales 1/4"', provider: 'Hardware Store A', price: 0.08, stock_quantity: 2000, delivery_time_hours: 4 },
    { product: 'Interruptor de pared', provider: 'Hardware Store A', price: 3.99, stock_quantity: 100, delivery_time_hours: 4 },
    // Hardware Store B
    { product: 'Tornillos Phillips #8 x 1"', provider: 'Hardware Store B', price: 0.12, stock_quantity: 800, delivery_time_hours: 8 },
    { product: 'Martillo de 16 oz', provider: 'Hardware Store B', price: 22.50, stock_quantity: 40, delivery_time_hours: 8 },
    { product: 'Cable eléctrico 12 AWG', provider: 'Hardware Store B', price: 0.75, stock_quantity: 400, delivery_time_hours: 8 },
    { product: 'Tubo PVC 1" x 10ft', provider: 'Hardware Store B', price: 11.25, stock_quantity: 20, delivery_time_hours: 8 },
    { product: 'Casco de seguridad', provider: 'Hardware Store B', price: 16.80, stock_quantity: 25, delivery_time_hours: 8 },
    { product: 'Destornillador Phillips #2', provider: 'Hardware Store B', price: 7.50, stock_quantity: 60, delivery_time_hours: 8 },
    { product: 'Tuercas hexagonales 1/4"', provider: 'Hardware Store B', price: 0.06, stock_quantity: 1500, delivery_time_hours: 8 },
    { product: 'Interruptor de pared', provider: 'Hardware Store B', price: 3.25, stock_quantity: 80, delivery_time_hours: 8 },
    // Hardware Store C
    { product: 'Tornillos Phillips #8 x 1"', provider: 'Hardware Store C', price: 0.10, stock_quantity: 600, delivery_time_hours: 24 },
    { product: 'Martillo de 16 oz', provider: 'Hardware Store C', price: 19.99, stock_quantity: 30, delivery_time_hours: 24 },
    { product: 'Cable eléctrico 12 AWG', provider: 'Hardware Store C', price: 0.65, stock_quantity: 300, delivery_time_hours: 24 },
    { product: 'Tubo PVC 1" x 10ft', provider: 'Hardware Store C', price: 9.99, stock_quantity: 15, delivery_time_hours: 24 },
    { product: 'Casco de seguridad', provider: 'Hardware Store C', price: 14.50, stock_quantity: 20, delivery_time_hours: 24 },
    { product: 'Destornillador Phillips #2', provider: 'Hardware Store C', price: 6.25, stock_quantity: 45, delivery_time_hours: 24 },
    { product: 'Tuercas hexagonales 1/4"', provider: 'Hardware Store C', price: 0.05, stock_quantity: 1200, delivery_time_hours: 24 },
    { product: 'Interruptor de pared', provider: 'Hardware Store C', price: 2.75, stock_quantity: 60, delivery_time_hours: 24 }
  ]

  const insertProductPrice = db.prepare(`
    INSERT OR IGNORE INTO product_prices (product_id, provider_id, price, stock_quantity, delivery_time_hours)
    VALUES (?, ?, ?, ?, ?)
  `)

  productPrices.forEach(price => {
    const product_id = productMap[price.product]
    const provider_id = providerMap[price.provider]
    if (product_id && provider_id) {
      insertProductPrice.run(
        product_id,
        provider_id,
        price.price,
        price.stock_quantity,
        price.delivery_time_hours
      )
    }
  })

  // Insert admin user if not exists
  const adminPassword = bcrypt.hashSync('admin123', 10)
  const insertAdmin = db.prepare(`
    INSERT OR IGNORE INTO users (username, email, password, role)
    VALUES (?, ?, ?, ?)
  `)
  insertAdmin.run('admin', 'admin@naova.com', adminPassword, 'admin')

  // Insert sample client users
  const clientPassword = bcrypt.hashSync('cliente123', 10)
  const insertClient = db.prepare(`
    INSERT OR IGNORE INTO users (username, email, password, role)
    VALUES (?, ?, ?, ?)
  `)
  insertClient.run('cliente1', 'cliente1@naova.com', clientPassword, 'cliente')
  insertClient.run('cliente2', 'cliente2@naova.com', clientPassword, 'cliente')
  insertClient.run('cliente3', 'cliente3@naova.com', clientPassword, 'cliente')

  console.log('✅ Sample data inserted successfully')
  console.log('🎉 Database setup completed!')
  console.log('📊 Database file: naova.sqlite')

} catch (error) {
  console.error('❌ Error setting up database:', error.message)
  process.exit(1)
} finally {
  db.close()
} 