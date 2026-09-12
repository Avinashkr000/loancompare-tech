import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/overview', async (_req, res, next) => {
  try {
    const [users, applications, lenders, recentApplications] = await Promise.all([
      prisma.user.count(),
      prisma.loanApplication.count(),
      prisma.lender.count({ where: { active: true } }),
      prisma.loanApplication.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { fullName: true, email: true } }, offers: true } }),
    ])
    res.json({ metrics: { users, applications, activeLenders: lenders }, recentApplications })
  } catch (e) { next(e) }
})

export default router
