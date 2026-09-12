import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { buildOffer } from '../lib/loan.js'

const router = Router()
router.use(requireAuth)

const createSchema = z.object({ amount: z.coerce.number().min(50000).max(2500000), tenureMonths: z.coerce.number().int().min(6).max(84), creditScore: z.coerce.number().int().min(300).max(900).optional(), purpose: z.enum(['PERSONAL', 'HOME_RENOVATION', 'EDUCATION', 'MEDICAL', 'DEBT_CONSOLIDATION', 'OTHER']) })

router.get('/', async (req, res, next) => {
  try {
    const applications = await prisma.loanApplication.findMany({ where: { userId: req.user.id }, include: { offers: { include: { lender: true }, orderBy: { totalPayable: 'asc' } } }, orderBy: { updatedAt: 'desc' } })
    res.json({ applications })
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const application = await prisma.loanApplication.findFirst({ where: { id: req.params.id, userId: req.user.id }, include: { offers: { include: { lender: true }, orderBy: { totalPayable: 'asc' } } } })
    if (!application) return res.status(404).json({ error: 'Application not found' })
    res.json({ application })
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const application = await prisma.loanApplication.create({ data: { ...data, userId: req.user.id, creditScore: data.creditScore ?? req.user.creditScore ?? 750, status: 'SUBMITTED' } })
    const lenders = await prisma.lender.findMany({ where: { active: true } })
    const eligible = lenders.filter((l) => data.amount >= Number(l.minAmount) && data.amount <= Number(l.maxAmount) && data.tenureMonths <= l.maxTenureMonths)
    await prisma.loanOffer.createMany({ data: eligible.map((lender) => { const offer = buildOffer(lender, data.amount, data.tenureMonths, data.creditScore ?? req.user.creditScore ?? 750); return { applicationId: application.id, lenderId: lender.id, annualRate: offer.annualRate, processingFeePct: Number(lender.processingFee), emi: offer.emi, totalInterest: offer.totalInterest, totalPayable: offer.totalPayable, eligibilityScore: offer.fitScore } }) })
    const fresh = await prisma.loanApplication.findUnique({ where: { id: application.id }, include: { offers: { include: { lender: true }, orderBy: { totalPayable: 'asc' } } } })
    await prisma.auditLog.create({ data: { userId: req.user.id, action: 'APPLICATION_CREATED', entity: 'LoanApplication', entityId: application.id, payload: { amount: data.amount, purpose: data.purpose } } })
    res.status(201).json({ application: fresh })
  } catch (e) { next(e) }
})

router.post('/:id/select-offer/:offerId', async (req, res, next) => {
  try {
    const application = await prisma.loanApplication.findFirst({ where: { id: req.params.id, userId: req.user.id } })
    if (!application) return res.status(404).json({ error: 'Application not found' })
    const offer = await prisma.loanOffer.findFirst({ where: { id: req.params.offerId, applicationId: application.id } })
    if (!offer) return res.status(404).json({ error: 'Offer not found' })
    const updated = await prisma.loanApplication.update({ where: { id: application.id }, data: { selectedOfferId: offer.id, status: 'OFFER_SELECTED' }, include: { offers: { include: { lender: true } } } })
    await prisma.auditLog.create({ data: { userId: req.user.id, action: 'OFFER_SELECTED', entity: 'LoanApplication', entityId: application.id, payload: { offerId: offer.id } } })
    res.json({ application: updated })
  } catch (e) { next(e) }
})

export default router
