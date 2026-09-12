import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { buildOffer } from '../lib/loan.js'

const router = Router()
const compareSchema = z.object({ amount: z.coerce.number().min(50000).max(2500000), tenureMonths: z.coerce.number().int().min(6).max(84), creditScore: z.coerce.number().int().min(300).max(900).default(750), purpose: z.string().optional() })

router.get('/', async (_req, res, next) => {
  try { res.json({ lenders: await prisma.lender.findMany({ where: { active: true }, orderBy: { baseRate: 'asc' } }) }) } catch (e) { next(e) }
})

router.post('/compare', async (req, res, next) => {
  try {
    const data = compareSchema.parse(req.body)
    const lenders = await prisma.lender.findMany({ where: { active: true } })
    const offers = lenders
      .filter((l) => data.amount >= Number(l.minAmount) && data.amount <= Number(l.maxAmount) && data.tenureMonths <= l.maxTenureMonths)
      .map((lender) => ({ lender, ...buildOffer(lender, data.amount, data.tenureMonths, data.creditScore) }))
      .sort((a, b) => a.totalPayable - b.totalPayable)
    res.json({ scenario: data, offers })
  } catch (e) { next(e) }
})

export default router
