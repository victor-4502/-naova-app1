import { db } from './connection.js'

const seedData = () => {
  // Seed products
  const products = [
    {
      name: 'Tornillos Phillips #8 x 1"',
      description: 'Tornillos de cabeza Phillips, acero inoxidable, 1 pulgada de longitud',
      category: 'Fasteners',
      unit: 'unidad',
      keywords: 'tornillos,phillips,acero,inoxidable,fasteners',
      specifications: 'Material: Acero inoxidable, Cabeza: Phillips, Longitud: 1 pulgada'
    },
    {
      name: 'Tornillos Hex #10 x 2"',
      description: 'Tornillos de cabeza hexagonal, acero galvanizado, 2 pulgadas',
      category: 'Fasteners',
      unit: 'unidad',
      keywords: 'tornillos,hex,galvanizado,fasteners',
      specifications: 'Material: Acero galvanizado, Cabeza: Hexagonal, Longitud: 2 pulgadas'
    },
    {
      name: 'Martillo de Carpintero 16oz',
      description: 'Martillo de carpintero con mango de madera, peso 16 onzas',
      category: 'Herramientas',
      unit: 'unidad',
      keywords: 'martillo,carpintero,herramientas,16oz',
      specifications: 'Peso: 16 onzas, Mango: Madera, Uso: Carpintería'
    },
    {
      name: 'Martillo de Bola 2lb',
      description: 'Martillo de bola para metalurgia, peso 2 libras',
      category: 'Herramientas',
      unit: 'unidad',
      keywords: 'martillo,bola,metalurgia,herramientas',
      specifications: 'Peso: 2 libras, Uso: Metalurgia, Material: Acero'
    },
    {
      name: 'Cemento Gris 50kg',
      description: 'Cemento Portland tipo I, bulto de 50kg',
      category: 'Cementos',
      unit: 'bulto',
      keywords: 'cemento,gris,portland,construcción',
      specifications: 'Tipo: Portland I, Peso: 50kg, Uso: Construcción'
    },
    {
      name: 'Varilla #4 6m',
      description: 'Varilla de acero corrugado #4, 6 metros de longitud',
      category: 'Construcción',
      unit: 'unidad',
      keywords: 'varilla,acero,corrugado,construcción',
      specifications: 'Diámetro: #4, Longitud: 6m, Material: Acero corrugado'
    },
    {
      name: 'Pintura Blanca Interior 4L',
      description: 'Pintura blanca para interiores, galón de 4 litros',
      category: 'Pinturas',
      unit: 'galón',
      keywords: 'pintura,blanca,interior,pinturas',
      specifications: 'Color: Blanco, Uso: Interior, Volumen: 4L'
    },
    {
      name: 'Clavos de Construcción 3"',
      description: 'Clavos de construcción de 3 pulgadas, acero galvanizado',
      category: 'Fasteners',
      unit: 'libra',
      keywords: 'clavos,construcción,acero,fasteners',
      specifications: 'Longitud: 3 pulgadas, Material: Acero galvanizado'
    }
  ]

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (name, description, category, unit, keywords, specifications)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  for (const p of products) {
    insertProduct.run(p.name, p.description, p.category, p.unit, p.keywords, p.specifications)
  }

  // Proveedores
  const providers = [
    {
      name: 'Ferretería Central',
      address: 'Calle 123 #45-67, Centro',
      phone: '3001234567',
      email: 'info@ferreteriacentral.com',
      rating: 4.5,
      delivery_time_hours: 24
    },
    {
      name: 'ConstruMax Express',
      address: 'Avenida 78 #90-12, Norte',
      phone: '3009876543',
      email: 'ventas@construMax.com',
      rating: 4.2,
      delivery_time_hours: 4
    },
    {
      name: 'Materiales Pro',
      address: 'Carrera 56 #34-89, Sur',
      phone: '3005551234',
      email: 'contacto@materialespro.com',
      rating: 4.7,
      delivery_time_hours: 12
    },
    {
      name: 'Ferretería Express',
      address: 'Calle 15 #23-45, Este',
      phone: '3007778888',
      email: 'pedidos@ferreteriaexpress.com',
      rating: 4.0,
      delivery_time_hours: 2
    }
  ]
  const insertProvider = db.prepare(`
    INSERT OR IGNORE INTO providers (name, address, phone, email, rating, delivery_time_hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  for (const p of providers) {
    insertProvider.run(p.name, p.address, p.phone, p.email, p.rating, p.delivery_time_hours)
  }

  // Obtener IDs
  const productsData = db.prepare('SELECT id, name FROM products').all()
  const providersData = db.prepare('SELECT id, name FROM providers').all()

  // Precios
  const prices = [
    { productName: 'Cemento Gris 50kg', providerName: 'Ferretería Central', price: 85000, delivery_time_hours: 24 },
    { productName: 'Cemento Gris 50kg', providerName: 'ConstruMax Express', price: 90000, delivery_time_hours: 4 },
    { productName: 'Cemento Gris 50kg', providerName: 'Materiales Pro', price: 82000, delivery_time_hours: 12 },
    { productName: 'Cemento Gris 50kg', providerName: 'Ferretería Express', price: 95000, delivery_time_hours: 2 },
    { productName: 'Cemento Blanco 25kg', providerName: 'Ferretería Central', price: 45000, delivery_time_hours: 24 },
    { productName: 'Cemento Blanco 25kg', providerName: 'ConstruMax Express', price: 48000, delivery_time_hours: 4 },
    { productName: 'Cemento Blanco 25kg', providerName: 'Materiales Pro', price: 42000, delivery_time_hours: 12 },
    { productName: 'Cemento Blanco 25kg', providerName: 'Ferretería Express', price: 52000, delivery_time_hours: 2 },
    { productName: 'Ladrillo 6 huecos', providerName: 'Ferretería Central', price: 1200, delivery_time_hours: 24 },
    { productName: 'Ladrillo 6 huecos', providerName: 'ConstruMax Express', price: 1300, delivery_time_hours: 4 },
    { productName: 'Ladrillo 6 huecos', providerName: 'Materiales Pro', price: 1150, delivery_time_hours: 12 },
    { productName: 'Ladrillo 6 huecos', providerName: 'Ferretería Express', price: 1400, delivery_time_hours: 2 },
    { productName: 'Varilla 3/8"', providerName: 'Ferretería Central', price: 8500, delivery_time_hours: 24 },
    { productName: 'Varilla 3/8"', providerName: 'ConstruMax Express', price: 9000, delivery_time_hours: 4 },
    { productName: 'Varilla 3/8"', providerName: 'Materiales Pro', price: 8200, delivery_time_hours: 12 },
    { productName: 'Varilla 3/8"', providerName: 'Ferretería Express', price: 9500, delivery_time_hours: 2 }
  ]
  const insertPrice = db.prepare(`
    INSERT OR REPLACE INTO prices (product_id, provider_id, price, delivery_time_hours)
    VALUES (?, ?, ?, ?)
  `)
  for (const price of prices) {
    const product = productsData.find(p => p.name === price.productName)
    const provider = providersData.find(p => p.name === price.providerName)
    if (product && provider) {
      insertPrice.run(product.id, provider.id, price.price, price.delivery_time_hours)
    }
  }

  console.log('✅ Datos de ejemplo insertados en SQLite')
}

const runSeed = () => {
  try {
    console.log('🌱 Insertando datos de ejemplo en SQLite...')
    seedData()
    console.log('✅ Seed completado')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

runSeed() 