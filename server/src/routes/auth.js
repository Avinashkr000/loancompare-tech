import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { signToken } from '../lib/tokens.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8), fullName: z.string().min(2).max(100), phone: z.string().optional() })
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })

const safeUser = (user) => ({ id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, creditScore: user.creditScore, role: user.role })

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body)
    const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (exists) return res.status(409).json({ error: 'Email already registered' })
    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({ data: { ...data, email: data.email.toLowerCase(), passwordHash } })
    const token = signToken(user)
    res.status(201).json({ token, user: safeUser(user) })
  } catch (error) { next(error) }
})

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' })
    await prisma.auditLog.create({ data: { userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id } })
    res.json({ token: signToken(user), user: safeUser(user) })
  } catch (error) { next(error) }
})

router.get('/me', requireAuth, (req, res) => res.json({ user: safeUser(req.user) }))
export default router
