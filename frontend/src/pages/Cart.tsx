import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

const Cart = () => {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()
  const [isGeneratingQuotation, setIsGeneratingQuotation] = useState(false)

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

  const handleGenerateQuotation = async () => {
    setIsGeneratingQuotation(true)
    try {
      // Prepare items for API
      const items = state.items.map(item => ({
        productId: parseInt(item.product.id),
        providerId: parseInt(item.provider.id),
        quantity: item.quantity
      }))

      // Get token if user is logged in
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Create quotation via API
      const response = await fetch('http://localhost:5000/api/quotations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: 'Cliente Naova',
          customerEmail: 'cliente@naova.com',
          customerPhone: '+573001234567',
          items: items,
          notes: 'Cotización generada desde Naova'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quotation = await response.json()
      console.log('Quotation created:', quotation)
      
      // Navigate to quotation page
      navigate(`/quotation/${quotation.id}`)
    } catch (error) {
      console.error('Error generating quotation:', error)
      alert('Error al generar la cotización. Intenta nuevamente.')
    } finally {
      setIsGeneratingQuotation(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <ShoppingCart className="w-16 h-16 text-naova-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-naova-gray-900 mb-4">
          Tu carrito está vacío
        </h2>
        <p className="text-naova-gray-600 mb-8">
          Agrega productos para generar una cotización
        </p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la búsqueda
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-naova-gray-900 mb-2">
            Carrito de Compras
          </h1>
          <p className="text-naova-gray-600">
            {state.totalItems} producto{state.totalItems !== 1 ? 's' : ''} en tu carrito
          </p>
        </div>
        <button 
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {state.items.map((item, index) => (
              <div key={`${item.product.id}-${item.selectedProvider}`} className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-naova-gray-900 mb-2">
                      {item.product.name}
                    </h3>
                    <p className="text-naova-gray-600 mb-3">
                      {item.product.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-naova-gray-500 mb-3">
                      <span className="bg-naova-blue-100 text-naova-blue-800 px-2 py-1 rounded">
                        {item.product.category}
                      </span>
                      <span>Proveedor: {item.provider.name}</span>
                      <span className="text-naova-yellow-600">
                        ⭐ {item.provider.rating}
                      </span>
                    </div>
                    <div className="text-sm text-naova-gray-600">
                      Entrega en {formatDeliveryTime(item.deliveryTime)}
                    </div>
                  </div>

                  {/* Price and Quantity */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-naova-gray-900">
                        {formatPrice(item.price)}
                      </div>
                      <div className="text-sm text-naova-gray-600">
                        por {item.product.unit}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-naova-gray-100 rounded transition-colors duration-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-naova-gray-100 rounded transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Total for this item */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-naova-blue-800">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <h2 className="text-xl font-semibold text-naova-gray-900 mb-4">
              Resumen de la Cotización
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span>Productos ({state.totalItems})</span>
                <span>{formatPrice(state.totalAmount)}</span>
              </div>
              <div className="border-t border-naova-gray-200 pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-naova-blue-800">{formatPrice(state.totalAmount)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateQuotation}
              disabled={isGeneratingQuotation}
              className="btn-primary w-full mb-3"
            >
              {isGeneratingQuotation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando cotización...
                </>
              ) : (
                'Generar Cotización'
              )}
            </button>

            <button className="btn-outline w-full">
              Contactar por WhatsApp
            </button>

            <div className="mt-4 text-xs text-naova-gray-500">
              * Los precios pueden variar según disponibilidad
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart 