const User = require('../models/User')

const adminOrDeveloper = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'role'],
    })

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    if (user.role !== 'admin' && user.role !== 'developer') {
      return res.status(403).json({ message: 'Access denied: admin or developer only' })
    }

    req.userRole = user.role
    next()
  } catch (error) {
    return res.status(500).json({ message: 'Authorization check failed' })
  }
}

module.exports = adminOrDeveloper
