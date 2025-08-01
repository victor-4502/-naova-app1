import React from 'react'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Bienvenido a Naova</h1>
        <button
          className="w-full py-3 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => navigate('/home')}
        >
          Hacer pedido sin registrarse
        </button>
        <button
          className="w-full py-3 mb-4 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={() => navigate('/login')}
        >
          Iniciar sesión / Registrarse como cliente
        </button>
        <button
          className="w-full py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          onClick={() => navigate('/provider-login')}
        >
          Acceso proveedores
        </button>
      </div>
    </div>
  )
}

export default Landing 