import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const lenders = [
  { name: 'HDFC Bank', slug: 'hdfc-bank', baseRate: 10.75, processingFee: 1.5, minAmount: 50000, maxAmount: 2000000, maxTenureMonths: 84 },
  { name: 'ICICI Bank', slug: 'icici-bank', baseRate: 11.1, processingFee: 1.25, minAmount: 50000, maxAmount: 2500000, maxTenureMonths: 84 },
  { name: 'Axis Bank', slug: 'axis-bank', baseRate: 11.35, processingFee: 1.0, minAmount: 75000, maxAmount: 2000000, maxTenureMonths: 72 },
  { name: 'Kotak Mahindra', slug: 'kotak-mahindra', baseRate: 11.6, processingFee: 0.75, minAmount: 50000, maxAmount: 1500000, maxTenureMonths: 72 },
]

async function main() {
  for (const lender of lenders) {
    await prisma.lender.upsert({ where: { slug: lender.slug }, update: lender, create: lender })
  }

  const passwordHash = await bcrypt.hash('Admin@12345', 12)
  await prisma.user.upsert({
    where: { email: 'admin@loancompare.local' },
    update: { passwordHash, role: 'ADMIN', fullName: 'LoanCompare Admin' },
    create: { email: 'admin@loancompare.local', passwordHash, role: 'ADMIN', fullName: 'LoanCompare Admin' },
  })

  console.log('Seed complete')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
