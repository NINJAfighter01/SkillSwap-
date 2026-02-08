const express = require('express');
const { getUserProfile, updateUserProfile, getUserProgress, updateUserProgress, getUserPortfolio, updateUserPortfolio } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, getUserProfile);

// Update user profile
router.put('/profile', authenticate, updateUserProfile);

// Get user learning progress
router.get('/progress', authenticate, getUserProgress);

// Update user learning progress
router.put('/progress', authenticate, updateUserProgress);

// Get user portfolio
router.get('/portfolio', authenticate, getUserPortfolio);

// Update user portfolio
router.put('/portfolio', authenticate, updateUserPortfolio);

module.exports = router;