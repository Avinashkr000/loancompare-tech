import { prisma } from '../lib/prisma.js'
import { verifyToken } from '../lib/tokens.js'

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Authentication required' })
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' })
  next()
}
