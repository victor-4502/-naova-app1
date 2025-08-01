import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Download, Search } from 'lucide-react'

interface BulkProduct {
  name: string
  description?: string
  quantity: number
  unit?: string
  category?: string
}

const BulkQuotationPage: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<BulkProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [autoSearchResults, setAutoSearchResults] = useState<any[]>([])
  const [searchingAll, setSearchingAll] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const lines = content.split('\n').filter(line => line.trim())
        
        // Ignorar la primera línea (títulos) y procesar el resto
        const dataLines = lines.slice(1)
        
        const parsedProducts: BulkProduct[] = dataLines.map((line, index) => {
          const parts = line.split(',').map(part => part.trim())
          return {
            name: parts[0] || `Producto ${index + 1}`,
            description: parts[1] || '',
            quantity: parseInt(parts[2]) || 1,
            unit: parts[3] || 'unidad',
            category: parts[4] || ''
          }
        })

        setProducts(parsedProducts)
      } catch (error) {
        alert('Error al procesar el archivo. Asegúrate de que esté en formato CSV.')
      }
    }
    reader.readAsText(file)
  }

  const handleManualInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value
    const lines = content.split('\n').filter(line => line.trim())
    
    // Ignorar la primera línea (títulos) y procesar el resto
    const dataLines = lines.slice(1)
    
    const parsedProducts: BulkProduct[] = dataLines.map((line, index) => {
      const parts = line.split(',').map(part => part.trim())
      return {
        name: parts[0] || `Producto ${index + 1}`,
        description: parts[1] || '',
        quantity: parseInt(parts[2]) || 1,
        unit: parts[3] || 'unidad',
        category: parts[4] || ''
      }
    })

    setProducts(parsedProducts)
  }

  const searchProducts = async (productName: string) => {
    if (!productName.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(productName)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchAllProducts = async () => {
    if (products.length === 0) {
      alert('Primero importa una lista de productos')
      return
    }

    setSearchingAll(true)
    setAutoSearchResults([])
    
    try {
      const allResults: any[] = []
      
      for (const product of products) {
        try {
          const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(product.name)}`)
          if (response.ok) {
            const data = await response.json()
            if (data.length > 0) {
              // Si hay múltiples resultados, mostrar todos
              if (data.length > 1) {
                // Agrupar por nombre de producto similar
                const groupedResults = data.reduce((acc: any[], result: any) => {
                  const existing = acc.find(item => 
                    item.product.name.toLowerCase().includes(product.name.toLowerCase()) ||
                    product.name.toLowerCase().includes(item.product.name.toLowerCase())
                  )
                  if (existing) {
                    existing.alternatives = existing.alternatives || []
                    existing.alternatives.push(result)
                  } else {
                    acc.push({
                      ...result,
                      requestedQuantity: product.quantity,
                      requestedUnit: product.unit,
                      originalProduct: product,
                      alternatives: []
                    })
                  }
                  return acc
                }, [])
                
                allResults.push(...groupedResults)
              } else {
                // Un solo resultado
                allResults.push({
                  ...data[0],
                  requestedQuantity: product.quantity,
                  requestedUnit: product.unit,
                  originalProduct: product,
                  alternatives: []
                })
              }
            } else {
              // Producto no encontrado
              allResults.push({
                product: {
                  id: `not-found-${Date.now()}`,
                  name: product.name,
                  description: product.description || 'Producto no encontrado',
                  category: product.category || 'Sin categoría',
                  unit: product.unit || 'unidad',
                  keywords: []
                },
                bestPrice: {
                  price: 0,
                  deliveryTime: 0,
                  provider: { id: '0', name: 'No disponible', rating: 0 }
                },
                fastestDelivery: {
                  price: 0,
                  deliveryTime: 0,
                  provider: { id: '0', name: 'No disponible', rating: 0 }
                },
                requestedQuantity: product.quantity,
                requestedUnit: product.unit,
                originalProduct: product,
                notFound: true,
                alternatives: []
              })
            }
          }
        } catch (error) {
          console.error(`Error searching for ${product.name}:`, error)
        }
      }
      
      setAutoSearchResults(allResults)
    } catch (error) {
      console.error('Error searching all products:', error)
      alert('Error al buscar productos. Intenta nuevamente.')
    } finally {
      setSearchingAll(false)
    }
  }

  const addToSelection = (product: any, quantity: number, option: 'bestPrice' | 'fastestDelivery' = 'bestPrice') => {
    const existingIndex = selectedProducts.findIndex(p => p.product.id === product.product.id)
    
    if (existingIndex >= 0) {
      const updated = [...selectedProducts]
      updated[existingIndex].quantity += quantity
      updated[existingIndex].provider = product[option].provider
      updated[existingIndex].price = product[option].price
      updated[existingIndex].deliveryTime = product[option].deliveryTime
      setSelectedProducts(updated)
    } else {
      setSelectedProducts([...selectedProducts, { 
        product: product.product, 
        quantity, 
        provider: product[option].provider,
        price: product[option].price,
        deliveryTime: product[option].deliveryTime
      }])
    }
  }

  const addAlternativeToSelection = (product: any, alternative: any, quantity: number, option: 'bestPrice' | 'fastestDelivery' = 'bestPrice') => {
    const existingIndex = selectedProducts.findIndex(p => p.product.id === alternative.product.id)
    
    if (existingIndex >= 0) {
      const updated = [...selectedProducts]
      updated[existingIndex].quantity += quantity
      updated[existingIndex].provider = alternative[option].provider
      updated[existingIndex].price = alternative[option].price
      updated[existingIndex].deliveryTime = alternative[option].deliveryTime
      setSelectedProducts(updated)
    } else {
      setSelectedProducts([...selectedProducts, { 
        product: alternative.product, 
        quantity, 
        provider: alternative[option].provider,
        price: alternative[option].price,
        deliveryTime: alternative[option].deliveryTime
      }])
    }
  }

  const removeFromSelection = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.product.id !== productId))
  }

  const addAllToSelection = (option: 'bestPrice' | 'fastestDelivery') => {
    const validResults = autoSearchResults.filter(result => !result.notFound)
    
    const itemsToAdd = validResults.map(result => ({
      product: result.product,
      quantity: result.requestedQuantity,
      provider: result[option].provider,
      price: result[option].price,
      deliveryTime: result[option].deliveryTime
    }))
    
    setSelectedProducts(itemsToAdd)
  }

  const updateSelectionOption = (productId: string, option: 'bestPrice' | 'fastestDelivery') => {
    const result = autoSearchResults.find(r => r.product.id === productId)
    if (!result) return

    const updated = selectedProducts.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          provider: result[option].provider,
          price: result[option].price,
          deliveryTime: result[option].deliveryTime
        }
      }
      return item
    })
    
    setSelectedProducts(updated)
  }

  const generateQuotation = async () => {
    if (selectedProducts.length === 0) {
      alert('Agrega productos a la selección antes de generar la cotización')
      return
    }

    setLoading(true)
    try {
      const items = selectedProducts.map(item => ({
        productId: parseInt(item.product.id),
        providerId: parseInt(item.provider.id),
        quantity: item.quantity
      }))

      const response = await fetch('http://localhost:5000/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: 'Cliente Bulk',
          customerEmail: 'cliente@bulk.com',
          customerPhone: '+573001234567',
          items: items,
          notes: 'Cotización generada desde lista masiva'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quotation = await response.json()
      navigate(`/quotation/${quotation.id}`)
    } catch (error) {
      console.error('Error generating quotation:', error)
      alert('Error al generar la cotización. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const generateQuotationFromAutoSearch = async () => {
    if (selectedProducts.length === 0) {
      alert('Agrega productos a la selección antes de generar la cotización')
      return
    }

    setLoading(true)
    try {
      const items = selectedProducts.map(item => ({
        productId: parseInt(item.product.id),
        providerId: parseInt(item.provider.id),
        quantity: item.quantity
      }))

      const response = await fetch('http://localhost:5000/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: 'Cliente Bulk',
          customerEmail: 'cliente@bulk.com',
          customerPhone: '+573001234567',
          items: items,
          notes: 'Cotización generada desde lista masiva automática'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quotation = await response.json()
      navigate(`/quotation/${quotation.id}`)
    } catch (error) {
      console.error('Error generating quotation:', error)
      alert('Error al generar la cotización. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'Nombre del Producto,Descripción,Cantidad,Unidad,Categoría\nTornillos Phillips #8,1 pulgada acero inoxidable,100,unidad,Fasteners\nCemento Gris,Portland tipo I,10,bulto,Cementos'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_productos.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cotización Masiva
          </h1>
          <p className="text-gray-600">
            Importa una lista de productos y genera cotizaciones automáticamente
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Import */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Importar Lista de Productos
              </h2>
              
              <div className="space-y-4">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="text-sm text-gray-600 mb-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="font-medium text-naova-blue-600 hover:text-naova-blue-500">
                        Sube un archivo CSV
                      </span>
                      {' '}o arrastra y suelta
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    CSV con columnas: Nombre, Descripción, Cantidad, Unidad, Categoría
                  </p>
                </div>

                {/* Manual Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    O ingresa manualmente (formato CSV):
                  </label>
                  <textarea
                    rows={6}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-naova-blue-500"
                    placeholder="Nombre,Descripción,Cantidad,Unidad,Categoría&#10;Tornillos Phillips #8,1 pulgada acero inoxidable,100,unidad,Fasteners&#10;Cemento Gris,Portland tipo I,10,bulto,Cementos"
                    onChange={handleManualInput}
                  />
                </div>

                {/* Download Template */}
                <button
                  onClick={downloadTemplate}
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Plantilla CSV
                </button>
              </div>
            </div>

            {/* Products List */}
            {products.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Productos Importados ({products.length})
                </h2>
                
                {/* Auto Search Button */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Búsqueda Automática
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Busca automáticamente todos los productos y encuentra los mejores precios
                  </p>
                  <button
                    onClick={searchAllProducts}
                    disabled={searchingAll}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {searchingAll ? 'Buscando...' : 'Buscar Todos los Productos'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <p className="text-xs text-gray-500">
                          {product.quantity} {product.unit} • {product.category}
                        </p>
                      </div>
                      <button
                        onClick={() => searchProducts(product.name)}
                        className="ml-4 px-3 py-1 text-sm bg-naova-blue-600 text-white rounded hover:bg-naova-blue-700"
                      >
                        Buscar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Search Results & Selection */}
          <div className="space-y-6">
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Resultados de Búsqueda
                </h2>
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{result.product.name}</h3>
                          <p className="text-sm text-gray-600">{result.product.description}</p>
                          <p className="text-sm text-gray-500">
                            Proveedor: {result.bestPrice.provider.name} • 
                            Entrega: {result.bestPrice.deliveryTime}h
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-naova-blue-600">
                            ${result.bestPrice.price}
                          </div>
                          <button
                            onClick={() => addToSelection(result, 1)}
                            className="mt-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Auto Search Results */}
            {autoSearchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Resultados de Búsqueda Automática ({autoSearchResults.length} productos)
                </h2>
                
                {/* Quick Selection Buttons */}
                <div className="mb-4 flex gap-3">
                  <button
                    onClick={() => addAllToSelection('bestPrice')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Seleccionar Mejor Precio
                  </button>
                  <button
                    onClick={() => addAllToSelection('fastestDelivery')}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Seleccionar Entrega Rápida
                  </button>
                </div>
                
                <div className="space-y-3">
                  {autoSearchResults.map((result, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${result.notFound ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{result.product.name}</h3>
                          <p className="text-sm text-gray-600">{result.product.description}</p>
                          <p className="text-sm text-gray-500">
                            Cantidad solicitada: {result.requestedQuantity} {result.requestedUnit}
                          </p>
                          {result.notFound ? (
                            <p className="text-sm text-red-600 font-medium">Producto no encontrado</p>
                          ) : (
                            <div className="mt-3 space-y-3">
                              {/* Opciones principales */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-50 p-3 rounded border border-green-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="font-medium text-green-800">Mejor Precio</p>
                                    <button
                                      onClick={() => addToSelection(result, result.requestedQuantity, 'bestPrice')}
                                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                      Seleccionar
                                    </button>
                                  </div>
                                  <p className="text-lg font-bold text-green-600">${result.bestPrice.price}</p>
                                  <p className="text-xs text-green-600">{result.bestPrice.deliveryTime}h • {result.bestPrice.provider.name}</p>
                                </div>
                                <div className="bg-orange-50 p-3 rounded border border-orange-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="font-medium text-orange-800">Entrega Rápida</p>
                                    <button
                                      onClick={() => addToSelection(result, result.requestedQuantity, 'fastestDelivery')}
                                      className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                                    >
                                      Seleccionar
                                    </button>
                                  </div>
                                  <p className="text-lg font-bold text-orange-600">${result.fastestDelivery.price}</p>
                                  <p className="text-xs text-orange-600">{result.fastestDelivery.deliveryTime}h • {result.fastestDelivery.provider.name}</p>
                                </div>
                              </div>
                              
                              {/* Alternativas si existen */}
                              {result.alternatives && result.alternatives.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Otras opciones:</p>
                                  <div className="space-y-3">
                                    {result.alternatives.map((alt: any, altIndex: number) => (
                                      <div key={altIndex} className="bg-gray-50 p-3 rounded border">
                                        <div className="mb-2">
                                          <p className="text-sm font-medium">{alt.product.name}</p>
                                          <p className="text-xs text-gray-600">{alt.product.description}</p>
                                        </div>
                                        
                                        {/* Opciones para cada alternativa */}
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                          <div className="bg-green-50 p-2 rounded border border-green-200">
                                            <div className="flex justify-between items-start mb-1">
                                              <p className="text-xs font-medium text-green-800">Mejor Precio</p>
                                              <button
                                                onClick={() => addAlternativeToSelection(result, alt, result.requestedQuantity, 'bestPrice')}
                                                className="px-1 py-0.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                              >
                                                Elegir
                                              </button>
                                            </div>
                                            <p className="text-sm font-bold text-green-600">${alt.bestPrice.price}</p>
                                            <p className="text-xs text-green-600">{alt.bestPrice.deliveryTime}h • {alt.bestPrice.provider.name}</p>
                                          </div>
                                          <div className="bg-orange-50 p-2 rounded border border-orange-200">
                                            <div className="flex justify-between items-start mb-1">
                                              <p className="text-xs font-medium text-orange-800">Entrega Rápida</p>
                                              <button
                                                onClick={() => addAlternativeToSelection(result, alt, result.requestedQuantity, 'fastestDelivery')}
                                                className="px-1 py-0.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                                              >
                                                Elegir
                                              </button>
                                            </div>
                                            <p className="text-sm font-bold text-orange-600">${alt.fastestDelivery.price}</p>
                                            <p className="text-xs text-orange-600">{alt.fastestDelivery.deliveryTime}h • {alt.fastestDelivery.provider.name}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={generateQuotationFromAutoSearch}
                  disabled={loading || selectedProducts.length === 0}
                  className="w-full mt-4 px-4 py-2 bg-naova-blue-600 text-white rounded-md hover:bg-naova-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Generando...' : `Generar Cotización (${selectedProducts.length} productos)`}
                </button>
              </div>
            )}

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Productos Seleccionados ({selectedProducts.length})
                </h2>
                
                {/* Total calculation */}
                {(() => {
                  const total = selectedProducts.reduce((sum, item) => {
                    const itemTotal = (item.price || 0) * (item.quantity || 1)
                    return sum + itemTotal
                  }, 0)
                  
                  return (
                    <div className="mb-4 p-4 bg-naova-blue-50 rounded-lg border border-naova-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-naova-blue-800">
                          Total de la Cotización:
                        </span>
                        <span className="text-2xl font-bold text-naova-blue-600">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })()}
                <div className="space-y-3">
                  {selectedProducts.map((item, index) => {
                    const result = autoSearchResults.find(r => r.product.id === item.product.id)
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                            <p className="text-sm text-gray-600">{item.product.description}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} {item.product.unit} • {item.provider.name}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-bold text-naova-blue-600 text-lg">
                              ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </div>
                            <p className="text-xs text-gray-500">
                              ${item.price || 0} c/u • {item.quantity || 1} {item.product.unit}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.deliveryTime || 0}h entrega
                            </p>
                            <button
                              onClick={() => removeFromSelection(item.product.id)}
                              className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                        
                        {/* Opciones para cambiar si hay alternativas */}
                        {result && !result.notFound && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700 mb-2">Cambiar opción:</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateSelectionOption(item.product.id, 'bestPrice')}
                                className={`px-3 py-1 text-xs rounded ${
                                  item.provider.id === result.bestPrice.provider.id 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                Mejor Precio: ${result.bestPrice.price}
                              </button>
                              <button
                                onClick={() => updateSelectionOption(item.product.id, 'fastestDelivery')}
                                className={`px-3 py-1 text-xs rounded ${
                                  item.provider.id === result.fastestDelivery.provider.id 
                                    ? 'bg-orange-600 text-white' 
                                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                }`}
                              >
                                Rápida: ${result.fastestDelivery.price}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                <button
                  onClick={generateQuotation}
                  disabled={loading}
                  className="w-full mt-4 px-4 py-2 bg-naova-blue-600 text-white rounded-md hover:bg-naova-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Generando...' : 'Generar Cotización'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkQuotationPage 