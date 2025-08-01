import { Link } from 'react-router-dom'
import { Brain, Menu, X, ShoppingCart, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { state } = useCart()
  const [user, setUser] = useState<{ id: number; role: string } | null>(null)

  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log('User token payload:', payload)
          setUser({ id: payload.id, role: payload.role })
        } catch {
          console.log('Invalid token, clearing user')
          setUser(null)
        }
      } else {
        console.log('No token found, clearing user')
        setUser(null)
      }
    }

    // Check user on mount
    checkUser()

    // Listen for storage changes (when login/logout happens)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also check when window gains focus (in case of same-tab login)
    const handleFocus = () => {
      checkUser()
    }
    
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setUserMenuOpen(false)
    window.location.reload()
  }

  return (
    <header className="bg-white shadow-sm border-b border-naova-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-naova-blue-800 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-naova-blue-800">Naova</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-naova-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Inicio
            </Link>
            <Link
              to="/bulk-quotation"
              className="text-gray-700 hover:text-naova-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Cotización Masiva
            </Link>
            {user && user.role === 'cliente' && (
              <Link
                to="/profile"
                className="text-gray-700 hover:text-naova-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Mis Pedidos
              </Link>
            )}
            {user && user.role === 'proveedor' && (
              <Link
                to="/provider-orders"
                className="text-gray-700 hover:text-naova-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Pedidos Proveedor
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link 
                to="/admin" 
                className="text-naova-gray-600 hover:text-naova-blue-800 transition-colors duration-200"
              >
                Admin
              </Link>
            )}
            
            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className="relative text-naova-gray-600 hover:text-naova-blue-800 transition-colors duration-200"
            >
              <ShoppingCart className="w-6 h-6" />
              {state.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-naova-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {state.totalItems > 99 ? '99+' : state.totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center px-3 py-2 rounded-md text-naova-gray-600 hover:text-naova-blue-800 hover:bg-naova-gray-100 transition-colors duration-200"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User className="w-6 h-6 mr-1" />
                {user ? `Usuario (${user.role})` : 'Usuario'}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                  {!user ? (
                    <>
                      <Link to="/login" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>Iniciar sesión</Link>
                      <Link to="/register" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>Registrarse</Link>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-gray-700">Usuario ({user.role})</div>
                      <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>Mi Perfil</Link>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleLogout}>Cerrar sesión</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-naova-gray-600 hover:text-naova-blue-800 hover:bg-naova-gray-100 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-naova-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-naova-gray-600 hover:text-naova-blue-800 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              {user && user.role === 'cliente' && (
                <Link 
                  to="/profile" 
                  className="text-naova-gray-600 hover:text-naova-blue-800 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mis Pedidos
                </Link>
              )}
              {user && user.role === 'proveedor' && (
                <Link 
                  to="/provider-orders" 
                  className="text-naova-gray-600 hover:text-naova-blue-800 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pedidos Proveedor
                </Link>
              )}
              {user && user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="text-naova-gray-600 hover:text-naova-blue-800 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <Link 
                to="/cart" 
                className="flex items-center justify-between text-naova-gray-600 hover:text-naova-blue-800 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Carrito</span>
                {state.totalItems > 0 && (
                  <span className="bg-naova-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {state.totalItems > 99 ? '99+' : state.totalItems}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 