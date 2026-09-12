import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'development-secret'
const expiresIn = process.env.JWT_EXPIRES_IN || '2h'

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret, { expiresIn })
}

export function verifyToken(token) {
  return jwt.verify(token, secret)
}
