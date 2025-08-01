import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  itemId: number;
  productId: number;
  productName: string;
  productDescription: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: number;
  providerId: number; // <-- Agregado
}

interface ProviderOrder {
  quotationId: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  notes: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const ProviderOrders: React.FC = () => {
  const [orders, setOrders] = useState<ProviderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ProviderOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<{ [id: number]: ProviderOrder | null }>({});
  const navigate = useNavigate();

  // Estado para el filtro de status
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const statusOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'pedido', label: 'Pedido' },
    { value: 'finalizada', label: 'Finalizada' },
    { value: 'rechazado', label: 'Rechazado' },
  ];

  // Opciones de sub-estado
  const subStatusOptions = [
    { value: 'procesando envío', label: 'Procesando envío' },
    { value: 'en camino', label: 'En camino' },
    { value: 'entregado', label: 'Entregado' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders(token);
    // eslint-disable-next-line
  }, [navigate]);

  const fetchOrders = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/quotations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map((q: any) => ({
          quotationId: q.id,
          customer: {
            name: q.customer_name,
            email: q.customer_email,
            phone: q.customer_phone,
          },
          notes: q.notes || '',
          status: q.status,
          createdAt: q.created_at,
          items: [],
        }));
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = async (quotationId: number) => {
    setExpandedOrders(prev => {
      // Si ya está expandido, colapsar
      if (prev[quotationId]) {
        const copy = { ...prev };
        delete copy[quotationId];
        return copy;
      }
      // Si no, cargar detalle y expandir
      return { ...prev, [quotationId]: null };
    });
    if (!expandedOrders[quotationId]) {
      setDetailLoading(true);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/quotations/${quotationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const q = await response.json();
          const detail: ProviderOrder = {
            quotationId: q.id,
            customer: {
              name: q.customer_name,
              email: q.customer_email,
              phone: q.customer_phone,
            },
            notes: q.notes || '',
            status: q.status,
            createdAt: q.created_at,
            items: (q.items || []).map((item: any) => ({
              itemId: item.id,
              productId: item.product?.id || item.product_id,
              productName: item.product?.name || item.product_name || '',
              productDescription: item.product?.description || item.product_description || '',
              productCategory: item.product?.category || item.product_category || '',
              quantity: item.quantity,
              unitPrice: item.unitPrice ?? item.unit_price,
              totalPrice: item.totalPrice ?? item.total_price,
              deliveryTime: item.deliveryTime ?? item.delivery_time_hours,
              providerId: item.provider?.id || item.provider_id,
            })),
          };
          setExpandedOrders(prev => ({ ...prev, [quotationId]: detail }));
        }
      } catch (error) {
        setExpandedOrders(prev => ({ ...prev, [quotationId]: null }));
      } finally {
        setDetailLoading(false);
      }
    }
  };

  // Filtrar solo los pedidos que el proveedor puede ver y por status
  const visibleStatuses = ['pedido', 'finalizada', 'rechazado'];
  const filteredOrders = orders.filter((order: any) => {
    if (!visibleStatuses.includes(order.status)) return false;
    if (statusFilter === 'todos') return true;
    return order.status === statusFilter;
  });

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando pedidos...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pedidos asignados a mi proveedor</h1>
      {/* Filtro de status */}
      <div className="flex gap-2 mb-6">
        {statusOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-3 py-1 rounded text-sm font-medium border transition-colors duration-150 ${statusFilter === option.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {filteredOrders.length === 0 ? (
        <div className="text-center text-gray-500">No tienes pedidos en este estatus.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 border">ID</th>
                <th className="px-2 py-2 border">Cliente</th>
                <th className="px-2 py-2 border">Email</th>
                <th className="px-2 py-2 border">Teléfono</th>
                <th className="px-2 py-2 border">Fecha</th>
                <th className="px-2 py-2 border">Estatus</th>
                <th className="px-2 py-2 border">Sub-Estatus</th>
                <th className="px-2 py-2 border">Notas</th>
                <th className="px-2 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order: any) => (
                <React.Fragment key={order.quotationId}>
                  <tr className="bg-white hover:bg-blue-50 transition-colors">
                    <td className="px-2 py-2 border font-mono">{order.quotationId}</td>
                    <td className="px-2 py-2 border">{order.customer.name}</td>
                    <td className="px-2 py-2 border">{order.customer.email}</td>
                    <td className="px-2 py-2 border">{order.customer.phone}</td>
                    <td className="px-2 py-2 border">{new Date(order.createdAt).toLocaleString('es-ES')}</td>
                    <td className="px-2 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'pedido' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'finalizada' ? 'bg-green-100 text-green-800' :
                        order.status === 'rechazado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs">
                      {order.status === 'pedido' ? (
                        <select
                          className="border rounded px-1 py-0.5 text-xs"
                          value={order.sub_status || 'procesando envío'}
                          onChange={async (e) => {
                            const newSubStatus = e.target.value;
                            try {
                              const res = await fetch(`http://localhost:5000/api/quotations/${order.quotationId}/sub-status`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                                },
                                body: JSON.stringify({ sub_status: newSubStatus }),
                              });
                              if (res.ok) {
                                // Actualizar en frontend (puedes recargar pedidos o actualizar localmente)
                                order.sub_status = newSubStatus;
                                setOrders([...orders]);
                              } else {
                                alert('Error al actualizar sub-estado');
                              }
                            } catch (err) {
                              alert('Error de red al actualizar sub-estado');
                            }
                          }}
                        >
                          {subStatusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{order.sub_status || '-'}</span>
                      )}
                    </td>
                    <td className="px-2 py-2 border">{order.notes}</td>
                    <td className="px-2 py-2 border">
                      <button
                        className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                        onClick={() => handleToggleExpand(order.quotationId)}
                        disabled={detailLoading && expandedOrders[order.quotationId] === null}
                      >
                        {expandedOrders[order.quotationId] ? 'Ocultar productos' : 'Ver productos'}
                      </button>
                    </td>
                  </tr>
                  {expandedOrders[order.quotationId] && (
                    <tr className="bg-blue-50">
                      <td colSpan={8} className="px-4 py-4 border-t">
                        <span className="font-semibold">Productos a surtir:</span>
                        {detailLoading && expandedOrders[order.quotationId] === null ? (
                          <div className="text-gray-500">Cargando productos...</div>
                        ) : expandedOrders[order.quotationId]?.items.length === 0 ? (
                          <div className="text-gray-500">No tienes productos asignados en esta cotización.</div>
                        ) : (
                          <ul className="mt-2 space-y-1">
                            {expandedOrders[order.quotationId]?.items.map(item => (
                              <li key={item.itemId} className="border-b last:border-b-0 py-2 flex justify-between items-center">
                                <div>
                                  <span className="font-medium">{item.productName}</span> <span className="text-xs text-gray-500">({item.productCategory})</span>
                                  <div className="text-xs text-gray-600">{item.productDescription}</div>
                                  <div className="text-xs text-blue-700">Proveedor ID: {item.providerId}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono">Cantidad: {item.quantity}</div>
                                  <div className="text-xs">Entrega: {item.deliveryTime} h</div>
                                  <div className="text-xs">Total: ${item.totalPrice.toFixed(2)}</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProviderOrders; 