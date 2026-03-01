const jwt = require('jsonwebtoken')
const { getFirebaseAdmin } = require('../config/firebaseAdmin')
const User = require('../models/User')

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const user = await User.create({
      name,
      email,
      password,
      tokens: 100, // Initial tokens
    })

    const token = generateToken(user)

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tokens: user.tokens,
        isTeacher: user.isTeacher,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await user.validatePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tokens: user.tokens,
        isTeacher: user.isTeacher,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    next(error)
  }
}

exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' })
}

exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body
    const admin = getFirebaseAdmin()
    const decoded = await admin.auth().verifyIdToken(token)
    const email = decoded.email
    const name = decoded.name || decoded.email?.split('@')[0] || 'User'
    const picture = decoded.picture
    const googleId = decoded.uid

    if (!email) {
      return res.status(400).json({ message: 'Google account email not available' })
    }

    let user = await User.findOne({ where: { googleId } })

    if (!user) {
      user = await User.findOne({ where: { email } })
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        tokens: 100,
      })
    } else {
      const updates = {}
      if (!user.googleId) updates.googleId = googleId
      if (!user.profilePicture && picture) updates.profilePicture = picture
      if (Object.keys(updates).length > 0) {
        await user.update(updates)
      }
    }

    const jwtToken = generateToken(user)

    res.json({
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tokens: user.tokens,
        isTeacher: user.isTeacher,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.facebookLogin = async (req, res, next) => {
  try {
    const { token } = req.body
    const { email, name, picture } = req.body

    let user = await User.findOne({ where: { facebookId: token } })

    if (!user) {
      user = await User.create({
        name,
        email,
        facebookId: token,
        profilePicture: picture,
        tokens: 100,
      })
    }

    const jwtToken = generateToken(user)

    res.json({
      message: 'Facebook login successful',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tokens: user.tokens,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.microsoftLogin = async (req, res, next) => {
  try {
    const { token } = req.body
    const { email, name, picture } = req.body

    let user = await User.findOne({ where: { microsoftId: token } })

    if (!user) {
      user = await User.create({
        name,
        email,
        microsoftId: token,
        profilePicture: picture,
        tokens: 100,
      })
    }

    const jwtToken = generateToken(user)

    res.json({
      message: 'Microsoft login successful',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tokens: user.tokens,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}
