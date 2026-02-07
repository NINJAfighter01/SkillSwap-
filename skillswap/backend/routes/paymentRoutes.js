const express = require('express')
const paymentController = require('../controllers/paymentController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/plans', paymentController.getSubscriptionPlans)
router.post('/initiate', authMiddleware, paymentController.initiatePayment)
router.post('/verify', authMiddleware, paymentController.verifyPayment)
router.get('/subscription', authMiddleware, paymentController.getUserSubscription)
router.get('/token-history', authMiddleware, paymentController.getTokenHistory)
router.get('/wallet', authMiddleware, paymentController.getWallet)

module.exports = router
