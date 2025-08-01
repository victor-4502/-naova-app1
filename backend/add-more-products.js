import Database from 'better-sqlite3';

const db = new Database('./naova.sqlite');

console.log('Agregando más productos a la base de datos...\n');

const additionalProducts = [
  // Fasteners
  {
    name: 'Tornillos Hex #12 x 3"',
    description: 'Tornillos de cabeza hexagonal, acero galvanizado, 3 pulgadas',
    category: 'Fasteners',
    unit: 'unidad',
    keywords: 'tornillos,hex,galvanizado,fasteners',
    specifications: 'Material: Acero galvanizado, Cabeza: Hexagonal, Longitud: 3 pulgadas'
  },
  {
    name: 'Tuercas hexagonales 3/8"',
    description: 'Tuercas hexagonales de acero inoxidable',
    category: 'Fasteners',
    unit: 'unidad',
    keywords: 'tuercas,hexagonales,acero,inoxidable,fasteners',
    specifications: 'Tamaño: 3/8 pulgada, Material: Acero inoxidable'
  },
  {
    name: 'Arandelas planas 1/4"',
    description: 'Arandelas planas de acero',
    category: 'Fasteners',
    unit: 'unidad',
    keywords: 'arandelas,planas,acero,fasteners',
    specifications: 'Tamaño: 1/4 pulgada, Material: Acero'
  },
  {
    name: 'Clavos de construcción 4"',
    description: 'Clavos de construcción de 4 pulgadas, acero galvanizado',
    category: 'Fasteners',
    unit: 'libra',
    keywords: 'clavos,construcción,galvanizado,fasteners',
    specifications: 'Longitud: 4 pulgadas, Material: Acero galvanizado'
  },

  // Tools
  {
    name: 'Destornillador Phillips #1',
    description: 'Destornillador Phillips de 4 pulgadas',
    category: 'Tools',
    unit: 'unidad',
    keywords: 'destornillador,phillips,herramientas',
    specifications: 'Punta: Phillips #1, Longitud: 4 pulgadas, Mango: Aislamiento'
  },
  {
    name: 'Alicate de corte diagonal',
    description: 'Alicate de corte diagonal de 7 pulgadas',
    category: 'Tools',
    unit: 'unidad',
    keywords: 'alicate,corte,diagonal,herramientas',
    specifications: 'Longitud: 7 pulgadas, Material: Acero templado'
  },
  {
    name: 'Llave ajustable 10"',
    description: 'Llave ajustable de 10 pulgadas',
    category: 'Tools',
    unit: 'unidad',
    keywords: 'llave,ajustable,herramientas',
    specifications: 'Longitud: 10 pulgadas, Material: Acero cromado'
  },
  {
    name: 'Sierra de mano 24"',
    description: 'Sierra de mano de 24 pulgadas',
    category: 'Tools',
    unit: 'unidad',
    keywords: 'sierra,mano,herramientas',
    specifications: 'Longitud: 24 pulgadas, Dientes: 8 TPI'
  },

  // Electrical
  {
    name: 'Cable eléctrico 10 AWG',
    description: 'Cable eléctrico para instalaciones comerciales',
    category: 'Electrical',
    unit: 'metro',
    keywords: 'cable,eléctrico,10awg,instalación',
    specifications: 'Calibre: 10 AWG, Aislamiento: PVC, Color: Rojo'
  },
  {
    name: 'Cable eléctrico 14 AWG',
    description: 'Cable eléctrico para instalaciones residenciales',
    category: 'Electrical',
    unit: 'metro',
    keywords: 'cable,eléctrico,14awg,instalación',
    specifications: 'Calibre: 14 AWG, Aislamiento: PVC, Color: Blanco'
  },
  {
    name: 'Tomacorriente doble',
    description: 'Tomacorriente doble de 120V',
    category: 'Electrical',
    unit: 'unidad',
    keywords: 'tomacorriente,120v,eléctrico',
    specifications: 'Voltaje: 120V, Amperaje: 15A, Tipo: Doble'
  },
  {
    name: 'Caja de conexión 4x4"',
    description: 'Caja de conexión metálica 4x4 pulgadas',
    category: 'Electrical',
    unit: 'unidad',
    keywords: 'caja,conexión,metálica,eléctrico',
    specifications: 'Tamaño: 4x4 pulgadas, Material: Acero galvanizado'
  },

  // Plumbing
  {
    name: 'Tubo PVC 2" x 10ft',
    description: 'Tubo de PVC para plomería de 2 pulgadas',
    category: 'Plumbing',
    unit: 'unidad',
    keywords: 'tubo,pvc,plomería,2pulgadas',
    specifications: 'Diámetro: 2 pulgadas, Longitud: 10 pies, Material: PVC'
  },
  {
    name: 'Codo PVC 90° 1"',
    description: 'Codo PVC de 90 grados, 1 pulgada',
    category: 'Plumbing',
    unit: 'unidad',
    keywords: 'codo,pvc,90grados,plomería',
    specifications: 'Diámetro: 1 pulgada, Ángulo: 90°, Material: PVC'
  },
  {
    name: 'Válvula de bola 1/2"',
    description: 'Válvula de bola de latón, 1/2 pulgada',
    category: 'Plumbing',
    unit: 'unidad',
    keywords: 'válvula,bola,latón,plomería',
    specifications: 'Diámetro: 1/2 pulgada, Material: Latón, Tipo: Bola'
  },
  {
    name: 'Cinta teflón 1/2"',
    description: 'Cinta de teflón para sellado de roscas',
    category: 'Plumbing',
    unit: 'rollo',
    keywords: 'cinta,teflón,sellado,plomería',
    specifications: 'Ancho: 1/2 pulgada, Longitud: 50 pies'
  },

  // Safety
  {
    name: 'Guantes de trabajo',
    description: 'Guantes de trabajo de cuero',
    category: 'Safety',
    unit: 'par',
    keywords: 'guantes,trabajo,cuero,seguridad',
    specifications: 'Material: Cuero, Tamaño: L, Uso: Trabajo general'
  },
  {
    name: 'Gafas de seguridad',
    description: 'Gafas de seguridad transparentes',
    category: 'Safety',
    unit: 'unidad',
    keywords: 'gafas,seguridad,transparentes',
    specifications: 'Material: Policarbonato, Color: Transparente, Certificación: ANSI'
  },
  {
    name: 'Botas de seguridad',
    description: 'Botas de seguridad con punta de acero',
    category: 'Safety',
    unit: 'par',
    keywords: 'botas,seguridad,punta,acero',
    specifications: 'Material: Cuero, Punta: Acero, Certificación: ASTM'
  },
  {
    name: 'Chaleco reflectivo',
    description: 'Chaleco reflectivo de alta visibilidad',
    category: 'Safety',
    unit: 'unidad',
    keywords: 'chaleco,reflectivo,visibilidad,seguridad',
    specifications: 'Color: Amarillo/Naranja, Material: Poliéster, Certificación: ANSI'
  }
];

try {
  // Insertar productos
  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (name, description, category, unit, keywords, specifications)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  let insertedCount = 0;
  for (const product of additionalProducts) {
    const result = insertProduct.run(
      product.name,
      product.description,
      product.category,
      product.unit,
      product.keywords,
      product.specifications
    );
    if (result.changes > 0) {
      insertedCount++;
    }
  }

  console.log(`✅ Se agregaron ${insertedCount} productos nuevos`);

  // Obtener todos los productos y proveedores para crear precios
  const allProducts = db.prepare('SELECT id, name FROM products').all();
  const allProviders = db.prepare('SELECT id, name FROM providers').all();

  console.log(`📦 Total de productos: ${allProducts.length}`);
  console.log(`🏢 Total de proveedores: ${allProviders.length}`);

  // Crear precios para los nuevos productos
  const insertPrice = db.prepare(`
    INSERT OR IGNORE INTO product_prices (product_id, provider_id, price, stock_quantity, delivery_time_hours)
    VALUES (?, ?, ?, ?, ?)
  `);

  let priceCount = 0;
  for (const product of allProducts) {
    // Cada producto tendrá precios de 2-3 proveedores diferentes
    const numProviders = Math.floor(Math.random() * 2) + 2; // 2-3 proveedores
    const selectedProviders = allProviders
      .sort(() => 0.5 - Math.random())
      .slice(0, numProviders);

    for (const provider of selectedProviders) {
      const price = Math.floor(Math.random() * 50000) + 1000; // $1,000 - $50,000
      const stock = Math.floor(Math.random() * 100) + 10; // 10-110 unidades
      const delivery = Math.floor(Math.random() * 48) + 2; // 2-50 horas

      const result = insertPrice.run(
        product.id,
        provider.id,
        price,
        stock,
        delivery
      );
      if (result.changes > 0) {
        priceCount++;
      }
    }
  }

  console.log(`💰 Se crearon ${priceCount} precios nuevos`);
  console.log(`🎉 Base de datos actualizada exitosamente!`);

} catch (error) {
  console.error('❌ Error al agregar productos:', error);
} finally {
  db.close();
} 