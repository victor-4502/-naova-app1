import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Import routes
import productRoutes from './routes/products.js'
import providerRoutes from './routes/providers.js'
import quotationRoutes from './routes/quotations.js'
import searchRoutes from './routes/search.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'

// Import database connection
import { db } from './database/connection.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Naova API',
    database: 'Supabase (PostgreSQL)'
  })
})

// API Routes
app.use('/api/products', productRoutes)
app.use('/api/providers', providerRoutes)
app.use('/api/quotations', quotationRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Naova API server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`🗄️  Database: Supabase (PostgreSQL)`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  db.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  db.close()
  process.exit(0)
}) 