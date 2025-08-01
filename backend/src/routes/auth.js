import express from 'express'
import { db } from '../database/connection.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'naova_secret'

// Registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await db.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id', [username, email, hashedPassword])
    return res.status(201).json({ message: 'Usuario registrado correctamente' })
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'El email o nombre de usuario ya está en uso' })
    }
    return res.status(500).json({ error: 'Error al registrar usuario' })
  }
})

// Login (email o username)
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body // identifier = email o username
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  }
  try {
    // Imprimir ruta de la base de datos y todos los usuarios
    console.log('--- LOGIN DEBUG ---')
    console.log('DB path:', db.name)
    const allUsersResult = await db.query('SELECT id, username, email, role FROM users')
    console.log('Usuarios en la base:', allUsersResult.rows)
    console.log('Intentando login con identifier:', identifier)
    const userResult = await db.query('SELECT * FROM users WHERE email = $1 OR username = $1', [identifier])
    const user = userResult.rows[0]
    if (!user) {
      console.log('Usuario no encontrado para:', identifier)
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      console.log('Contraseña incorrecta para usuario:', identifier)
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } })
  } catch (err) {
    console.error('Error en login:', err)
    return res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

// Middleware para verificar JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' })
    req.user = user
    next()
  })
}

// Middleware para verificar rol
export function checkRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No autorizado' })
    }
    next()
  }
}

export default router 