import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import Header from './components/Header'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import Cart from './pages/Cart'
import Quotation from './pages/Quotation'
import BulkQuotation from './pages/BulkQuotation'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ProviderOrders from './pages/ProviderOrders'

// Helper para obtener el rol del usuario desde el token
function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch {
    return null;
  }
}

// Rutas protegidas por rol
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const role = getUserRole();
  if (!role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/quotation/:id" element={<Quotation />} />
          <Route path="/bulk-quotation" element={<BulkQuotation />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={["cliente"]}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/provider-orders" element={
            <ProtectedRoute allowedRoles={["proveedor"]}>
              <ProviderOrders />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </CartProvider>
  )
}

export default App 