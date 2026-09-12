import { PrismaClient } from '@prisma/client'

export const prisma = globalThis.__loancompare_prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.__loancompare_prisma = prisma
