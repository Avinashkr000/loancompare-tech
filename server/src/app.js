import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './routes/auth.js'
import lenderRoutes from './routes/lenders.js'
import applicationRoutes from './routes/applications.js'
import profileRoutes from './routes/profile.js'
import adminRoutes from './routes/admin.js'

export const app = express()
app.use(helmet())
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8080').split(',').map((v) => v.trim()).filter(Boolean)
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('CORS origin blocked')) } }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('combined'))

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'loancompare-api', time: new Date().toISOString() }))
app.use('/api/auth', authRoutes)
app.use('/api/lenders', lenderRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }))
app.use((error, _req, res, _next) => {
  console.error(error)
  if (error?.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: error.issues })
  if (error?.message === 'CORS origin blocked') return res.status(403).json({ error: 'Origin not allowed' })
  res.status(500).json({ error: 'Internal server error' })
})
