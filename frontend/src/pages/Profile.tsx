import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Quotation {
  id: number
  customer_name: string
  customer_email: string
  total_amount: number
  status: string
  created_at: string
}

// Estado de status para mostrar bonito
const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  pending: 'Pendiente',
  pedido: 'Pedido',
  finalizada: 'Finalizada',
};

const Profile = () => {
  const [user, setUser] = useState<{ id: number; role: string } | null>(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  // Estado para el filtro de status
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const statusOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'pedido', label: 'Pedido' },
    { value: 'finalizada', label: 'Finalizada' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser({ id: payload.id, role: payload.role })
      fetchUserQuotations(token)
    } catch {
      navigate('/login')
    }
  }, [navigate])

  const fetchUserQuotations = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/quotations/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuotations(data)
      } else {
        console.error('Error fetching quotations')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOrder = async (quotationId: number) => {
    setConfirmingId(quotationId);
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/quotations/${quotationId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setQuotations((prev) => prev.map(q => q.id === quotationId ? { ...q, status: 'pedido' } : q));
      } else {
        alert('Error al confirmar el pedido.');
      }
    } catch (error) {
      alert('Error de red al confirmar el pedido.');
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const filteredQuotations = statusFilter === 'todos'
    ? quotations
    : quotations.filter(q => {
        if (statusFilter === 'pendiente') return q.status === 'pendiente' || q.status === 'pending';
        return q.status === statusFilter;
      });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tus cotizaciones y pedidos</p>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar con información del usuario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID de Usuario</label>
                  <p className="mt-1 text-lg font-mono">{user.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                    {user.role}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cotizaciones</label>
                  <p className="mt-1 text-2xl font-bold text-blue-600">{quotations.length}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => navigate('/')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Crear Nueva Cotización
                </button>
              </div>
            </div>
          </div>

          {/* Lista de cotizaciones */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Mis Cotizaciones</h2>
              {/* Filtro de status */}
              <div className="flex gap-2 mb-6">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-3 py-1 rounded text-sm font-medium border transition-colors duration-150 ${
                      statusFilter === option.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {/* Lista filtrada */}
              {filteredQuotations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cotizaciones aún</h3>
                  <p className="text-gray-500 mb-6">Comienza creando tu primera cotización</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Crear mi primera cotización
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuotations.map((quotation) => (
                    <div key={quotation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Cotización #{quotation.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Cliente: {quotation.customer_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ${quotation.total_amount.toFixed(2)}
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            quotation.status === 'pendiente' || quotation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : quotation.status === 'pedido'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {STATUS_LABELS[quotation.status] || quotation.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Creada: {new Date(quotation.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <button 
                          onClick={() => navigate(`/quotation/${quotation.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver detalles →
                        </button>
                      </div>
                      {/* Botón para realizar pedido si está pendiente */}
                      {(quotation.status === 'pendiente' || quotation.status === 'pending') && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleConfirmOrder(quotation.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                            disabled={confirmingId === quotation.id}
                          >
                            {confirmingId === quotation.id ? 'Confirmando...' : 'Realizar pedido'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 