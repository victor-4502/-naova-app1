import { db } from './src/database/connection.js'
import fs from 'fs'
import { parse } from 'csv-parse'

async function importProducts() {
  try {
    console.log('📦 Importando productos desde CSV...')
    
    // Leer el archivo CSV
    const csvData = fs.readFileSync('../productos-ferreteria.csv', 'utf-8')
    
    // Parsear el CSV
    const records = await new Promise((resolve, reject) => {
      parse(csvData, {
        columns: true,
        skip_empty_lines: true
      }, (err, records) => {
        if (err) reject(err)
        else resolve(records)
      })
    })
    
    console.log(`📋 Encontrados ${records.length} productos para importar`)
    
    // Importar cada producto
    for (const record of records) {
      try {
        // Insertar el producto
        const result = await db.query(`
          INSERT INTO products (name, description, category, unit, keywords, specifications, image_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          record.product_name,
          record.description,
          record.category,
          record.unit,
          record.keywords,
          record.specifications,
          null // image_url
        ])
        
        const productId = result.rows[0].id
        
        // Buscar o crear el proveedor
        let providerResult = await db.query('SELECT id FROM providers WHERE name = $1', [record.provider_name])
        
        let providerId
        if (providerResult.rows.length === 0) {
          // Crear nuevo proveedor
          const newProvider = await db.query(`
            INSERT INTO providers (name, contact_person, phone, email, address, delivery_time_hours, rating)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
          `, [
            record.provider_name,
            record.provider_contact,
            record.provider_phone,
            record.provider_email,
            record.provider_address,
            parseInt(record.delivery_time_hours) || 24,
            4.5
          ])
          providerId = newProvider.rows[0].id
        } else {
          providerId = providerResult.rows[0].id
        }
        
        // Insertar precio
        await db.query(`
          INSERT INTO product_prices (product_id, provider_id, price, stock_quantity, delivery_time_hours)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          productId,
          providerId,
          parseFloat(record.price),
          parseInt(record.stock_quantity) || 100,
          parseInt(record.delivery_time_hours) || 24
        ])
        
        console.log(`✅ Importado: ${record.product_name}`)
      } catch (error) {
        console.error(`❌ Error importando ${record.product_name}:`, error.message)
      }
    }
    
    console.log('🎉 Importación completada!')
    
    // Verificar el resultado
    const totalProducts = await db.query('SELECT COUNT(*) as total FROM products')
    console.log(`📊 Total de productos en la base de datos: ${totalProducts.rows[0].total}`)
    
  } catch (error) {
    console.error('Error durante la importación:', error)
  } finally {
    process.exit(0)
  }
}

importProducts() 