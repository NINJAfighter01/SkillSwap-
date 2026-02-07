const express = require('express')
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/profile', authMiddleware, userController.getProfile)
router.put('/profile', authMiddleware, userController.updateProfile)
router.get('/progress', authMiddleware, userController.getProgress)
router.put('/progress', authMiddleware, userController.updateProgress)
router.get('/portfolio', authMiddleware, userController.getPortfolio)
router.put('/portfolio', authMiddleware, userController.updatePortfolio)

module.exports = router
