import { useState } from 'react'
import { TrendingUp, Clock, Star, Phone, MapPin, Plus, Minus, ShoppingCart } from 'lucide-react'
import { SearchResult } from '../types'
import { useCart } from '../contexts/CartContext'

interface ProductCardProps {
  result: SearchResult
}

const ProductCard = ({ result }: ProductCardProps) => {
  const { product, bestPrice, fastestDelivery, singleProvider } = result
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState<'bestPrice' | 'fastestDelivery'>('bestPrice')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDeliveryTime = (hours: number) => {
    if (hours < 24) {
      return `${hours} horas`
    }
    const days = Math.ceil(hours / 24)
    return `${days} día${days !== 1 ? 's' : ''}`
  }

  const handleAddToCart = () => {
    addToCart(result, quantity, selectedProvider)
    setQuantity(1) // Reset quantity after adding
  }

  // Don't render if no pricing data
  if (!bestPrice) {
    return null
  }

  // Check if we should show single provider view
  const shouldShowSingleProvider = singleProvider || !fastestDelivery || bestPrice.id === fastestDelivery?.id
  
  console.log('ProductCard debug:', {
    productName: product.name,
    singleProvider,
    hasFastestDelivery: !!fastestDelivery,
    bestPriceId: bestPrice.id,
    fastestDeliveryId: fastestDelivery?.id,
    shouldShowSingleProvider
  })

  return (
    <div className="card">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Product Info */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-naova-gray-900 mb-2">
            {product.name}
          </h3>
          <p className="text-naova-gray-600 mb-4">
            {product.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-naova-gray-500">
            <span className="bg-naova-blue-100 text-naova-blue-800 px-2 py-1 rounded">
              {product.category}
            </span>
            <span>Unidad: {product.unit}</span>
          </div>
        </div>

        {/* Price Display */}
        <div className="flex-1">
          {shouldShowSingleProvider ? (
            // Single provider - no comparison needed
            <div className="border-2 border-naova-blue-400 bg-naova-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-naova-blue-800" />
                <h4 className="font-semibold text-naova-blue-800">Oferta Disponible</h4>
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-bold text-naova-blue-800">
                  {formatPrice(bestPrice.price)}
                </div>
                <div className="text-sm text-naova-gray-600">
                  Entrega en {formatDeliveryTime(bestPrice.deliveryTime)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-naova-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{bestPrice.provider.name}</span>
                  <span className="text-sm text-naova-gray-500">({bestPrice.provider.rating})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-naova-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{bestPrice.provider.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-naova-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{bestPrice.provider.phone}</span>
                </div>
              </div>
            </div>
          ) : (
            // Multiple providers - show comparison
            <div className="grid md:grid-cols-2 gap-4">
              {/* Best Price */}
              {bestPrice && (
                <div className={`border-2 rounded-lg p-4 transition-colors duration-200 ${
                  selectedProvider === 'bestPrice' 
                    ? 'border-naova-blue-400 bg-naova-blue-50' 
                    : 'border-naova-blue-200 bg-white'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-naova-blue-800" />
                    <h4 className="font-semibold text-naova-blue-800">Mejor Precio</h4>
                    <input
                      type="radio"
                      name={`provider-${product.id}`}
                      checked={selectedProvider === 'bestPrice'}
                      onChange={() => setSelectedProvider('bestPrice')}
                      className="ml-auto"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-naova-blue-800">
                      {formatPrice(bestPrice.price)}
                    </div>
                    <div className="text-sm text-naova-gray-600">
                      Entrega en {formatDeliveryTime(bestPrice.deliveryTime)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-naova-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{bestPrice.provider.name}</span>
                      <span className="text-sm text-naova-gray-500">({bestPrice.provider.rating})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-naova-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{bestPrice.provider.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-naova-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{bestPrice.provider.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fastest Delivery */}
              {fastestDelivery && (
                <div className={`border-2 rounded-lg p-4 transition-colors duration-200 ${
                  selectedProvider === 'fastestDelivery' 
                    ? 'border-naova-yellow-400 bg-naova-yellow-50' 
                    : 'border-naova-yellow-200 bg-white'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-naova-yellow-600" />
                    <h4 className="font-semibold text-naova-yellow-600">Entrega Más Rápida</h4>
                    <input
                      type="radio"
                      name={`provider-${product.id}`}
                      checked={selectedProvider === 'fastestDelivery'}
                      onChange={() => setSelectedProvider('fastestDelivery')}
                      className="ml-auto"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-naova-yellow-600">
                      {formatPrice(fastestDelivery.price)}
                    </div>
                    <div className="text-sm text-naova-gray-600">
                      Entrega en {formatDeliveryTime(fastestDelivery.deliveryTime)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-naova-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{fastestDelivery.provider.name}</span>
                      <span className="text-sm text-naova-gray-500">({fastestDelivery.provider.rating})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-naova-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{fastestDelivery.provider.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-naova-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{fastestDelivery.provider.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quantity Selector and Add to Cart */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-naova-gray-200">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-naova-gray-700">Cantidad:</label>
          <div className="flex items-center border border-naova-gray-300 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-naova-gray-100 transition-colors duration-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center border-none focus:ring-0"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-naova-gray-100 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar al Carrito
        </button>
        
        <button className="btn-outline flex-1">
          Contactar por WhatsApp
        </button>
      </div>
    </div>
  )
}

export default ProductCard 