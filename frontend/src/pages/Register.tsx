import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error de registro')
      setSuccess('Registro exitoso. Ahora puedes iniciar sesión.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-green-700">Registro</h2>
        <input
          className="w-full mb-4 px-4 py-2 border rounded"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="w-full mb-4 px-4 py-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 px-4 py-2 border rounded"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}
        <button className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition" type="submit">
          Registrarse
        </button>
        <div className="mt-4 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <span className="text-blue-600 cursor-pointer underline" onClick={() => navigate('/login')}>
            Inicia sesión
          </span>
        </div>
      </form>
    </div>
  )
}

export default Register 