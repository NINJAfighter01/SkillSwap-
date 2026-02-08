const jwt = require('jsonwebtoken')

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization
  if (!header) {
    return next()
  }

  const token = header.split(' ')[1]
  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    req.user = decoded
  } catch (error) {
    // Ignore invalid token for optional auth
  }

  next()
}

module.exports = optionalAuth
