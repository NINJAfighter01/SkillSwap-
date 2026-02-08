const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Get subscription plans
router.get('/plans', paymentController.getSubscriptionPlans);

// Initiate payment
router.post('/initiate', authMiddleware, paymentController.initiatePayment);

// Verify payment
router.post('/verify', authMiddleware, paymentController.verifyPayment);

// Get user subscription
router.get('/subscription', authMiddleware, paymentController.getUserSubscription);

// Get token transaction history
router.get('/token-history', authMiddleware, paymentController.getTokenHistory);

// Get wallet balance
router.get('/wallet', authMiddleware, paymentController.getWalletBalance);

module.exports = router;