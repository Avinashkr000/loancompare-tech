import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const updateSchema = z.object({ fullName: z.string().min(2).max(100), phone: z.string().optional(), creditScore: z.coerce.number().int().min(300).max(900).optional(), currentPassword: z.string().min(8).optional(), newPassword: z.string().min(8).optional() })

router.get('/', (req, res) => res.json({ user: { id: req.user.id, email: req.user.email, fullName: req.user.fullName, phone: req.user.phone, creditScore: req.user.creditScore, role: req.user.role } }))

router.put('/', async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body)
    const update = { fullName: data.fullName, phone: data.phone, creditScore: data.creditScore }
    if (data.newPassword) {
      if (!data.currentPassword || !(await bcrypt.compare(data.currentPassword, req.user.passwordHash))) return res.status(400).json({ error: 'Current password is incorrect' })
      update.passwordHash = await bcrypt.hash(data.newPassword, 12)
    }
    const user = await prisma.user.update({ where: { id: req.user.id }, data: update })
    res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, creditScore: user.creditScore, role: user.role } })
  } catch (e) { next(e) }
})

export default router
