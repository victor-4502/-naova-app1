import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Quotation } from '../types'
import toast from 'react-hot-toast'

const QuotationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchQuotation(id)
    }
  }, [id])

  const fetchQuotation = async (quotationId: string) => {
    setLoading(true)
    try {
      // Fetch quotation from API
      const response = await fetch(`http://localhost:5000/api/quotations/${quotationId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setQuotation(data)
    } catch (error) {
      console.error('Error fetching quotation:', error)
      // Mock data for development
      setQuotation({
        id: quotationId,
        customerName: 'Cliente Naova',
        customerEmail: 'cliente@naova.com',
        customerPhone: '+573001234567',
        items: [
          {
            id: '1',
            product: {
              id: '1',
              name: 'Tornillos Phillips #8 x 1"',
              description: 'Tornillos de cabeza Phillips, acero inoxidable',
              category: 'Fasteners',
              unit: 'unidad',
              keywords: ['tornillos', 'phillips', 'acero'],
              specifications: 'Material: Acero inoxidable, Cabeza: Phillips, Longitud: 1 pulgada'
            },
            quantity: 10,
            unitPrice: 0.15,
            totalPrice: 1.50,
            deliveryTime: 4,
            provider: {
              id: '1',
              name: 'Hardware Store A',
              rating: 4.8
            }
          }
        ],
        totalAmount: 1.50,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDeliveryTime = (hours: number) => {
    if (hours < 24) {
      return `${hours} horas`
    } else {
      const days = Math.ceil(hours / 24)
      return `${days} día${days > 1 ? 's' : ''}`
    }
  }

  // Nueva función para confirmar pedido
  const handleConfirmOrder = async () => {
    if (!quotation) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Debes iniciar sesión para confirmar el pedido');
        return;
      }
      const response = await fetch(`http://localhost:5000/api/quotations/${quotation.id}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Error al confirmar el pedido');
        return;
      }
      toast.success('¡Pedido confirmado!');
      // Refrescar cotización
      fetchQuotation(quotation.id);
    } catch (error) {
      toast.error('Error al confirmar el pedido');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naova-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cotización...</p>
        </div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cotización no encontrada</h1>
          <Link to="/" className="text-naova-blue-600 hover:text-naova-blue-800">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-naova-gray-900 mb-2">
                Cotización #{quotation.id}
              </h1>
              <p className="text-naova-gray-600">
                Generada el {formatDate(quotation.createdAt)}
              </p>
              {quotation.customerName && (
                <p className="text-naova-gray-600">
                  Cliente: {quotation.customerName}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Volver al inicio
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Volver a mis pedidos
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-naova-blue-600 hover:bg-naova-blue-700"
              >
                Imprimir
              </button>
              {/* Estados de la cotización */}
              <div className="flex flex-col gap-2">
                {/* Estado principal */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Estado:</span>
                  {quotation.status === 'pendiente' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-yellow-700 bg-yellow-100 border border-yellow-200">
                      Pendiente
                    </span>
                  )}
                  {quotation.status === 'pedido' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-green-700 bg-green-100 border border-green-200">
                      Pedido confirmado
                    </span>
                  )}
                  {quotation.status === 'finalizada' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200">
                      Finalizada
                    </span>
                  )}
                </div>

                {/* Estado de pago */}
                {quotation.paymentStatus && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Pago:</span>
                    {quotation.paymentStatus === 'pendiente' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-red-700 bg-red-100 border border-red-200">
                        Pendiente
                      </span>
                    )}
                    {quotation.paymentStatus === 'pagado' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-green-700 bg-green-100 border border-green-200">
                        Pagado
                      </span>
                    )}
                  </div>
                )}

                {/* Sub-estado (solo para pedidos) */}
                {quotation.status === 'pedido' && quotation.subStatus && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Entrega:</span>
                    {quotation.subStatus === 'procesando envío' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200">
                        Procesando envío
                      </span>
                    )}
                    {quotation.subStatus === 'en camino' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-orange-700 bg-orange-100 border border-orange-200">
                        En camino
                      </span>
                    )}
                    {quotation.subStatus === 'entregado' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-green-700 bg-green-100 border border-green-200">
                        Entregado
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Botón Confirmar pedido */}
              {quotation.status !== 'pedido' && (
                <button
                  onClick={handleConfirmOrder}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-naova-yellow-500 hover:bg-naova-yellow-600"
                >
                  Confirmar pedido
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Quotation Header */}
          <div className="px-6 py-4 bg-naova-blue-50 border-b border-naova-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-naova-gray-900">
                  Cotización de Productos
                </h2>
                <p className="text-naova-gray-600">
                  Válida hasta {formatDate(quotation.expiresAt)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-naova-blue-800">
                  {formatPrice(quotation.totalAmount)}
                </div>
                <div className="text-sm text-naova-gray-600">
                  Total
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-naova-gray-900 mb-4">
              Productos Cotizados
            </h3>
            <div className="space-y-4">
              {quotation.items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-naova-gray-900">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-naova-gray-600 mt-1">
                        {item.product.description}
                      </p>
                      {item.product.specifications && (
                        <p className="text-xs text-naova-gray-500 mt-1">
                          {item.product.specifications}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm text-naova-gray-600">
                        <span>Proveedor: {item.provider.name}</span>
                        <span>•</span>
                        <span>Entrega: {formatDeliveryTime(item.deliveryTime)}</span>
                        <span>•</span>
                        <span>Calificación: ⭐ {item.provider.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-naova-gray-900">
                        {item.quantity} {item.product.unit}
                      </div>
                      <div className="text-sm text-naova-gray-600">
                        {formatPrice(item.unitPrice)} c/u
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-naova-gray-600">
                        Subtotal
                      </span>
                      <span className="font-medium text-naova-gray-900">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-naova-gray-900">
                  Resumen de la Cotización
                </h3>
                <p className="text-sm text-naova-gray-600 mt-1">
                  {quotation.items.length} producto{quotation.items.length > 1 ? 's' : ''} cotizado{quotation.items.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-naova-blue-800">
                  {formatPrice(quotation.totalAmount)}
                </div>
                <div className="text-sm text-naova-gray-600">
                  Total
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="px-6 py-4 bg-naova-blue-50">
            <h3 className="text-lg font-medium text-naova-gray-900 mb-3">
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-naova-gray-900">Naova</p>
                    <p className="text-naova-gray-600">Sistema de Cotizaciones</p>
                    <p className="text-naova-gray-600">contacto@naova.com</p>
                  </div>
                  <div>
                    <p className="font-medium text-naova-gray-900">Cliente</p>
                    <p className="text-naova-gray-600">{quotation.customerName || 'Cliente Naova'}</p>
                    <p className="text-naova-gray-600">{quotation.customerEmail || 'cliente@naova.com'}</p>
                    <p className="text-naova-gray-600">{quotation.customerPhone || '+573001234567'}</p>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuotationPage 