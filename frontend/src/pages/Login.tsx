import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error de autenticación')
      
      console.log('Login successful:', data)
      localStorage.setItem('token', data.token)
      
      // Redirigir según rol
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else if (data.user.role === 'proveedor') {
        navigate('/provider-orders')
      } else if (data.user.role === 'cliente') {
        navigate('/profile')
      } else {
        navigate('/')
      }
      
      // Force page reload to update header
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Iniciar sesión</h2>
        <input
          className="w-full mb-4 px-4 py-2 border rounded"
          placeholder="Email o usuario"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
        />
        <input
          className="w-full mb-4 px-4 py-2 border rounded"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition" type="submit">
          Entrar
        </button>
        <div className="mt-4 text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <span className="text-blue-600 cursor-pointer underline" onClick={() => navigate('/register')}>
            Regístrate
          </span>
        </div>
      </form>
    </div>
  )
}

export default Login 