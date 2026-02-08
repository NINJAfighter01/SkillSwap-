const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validateRequest');

// User registration
router.post('/register', validateRequest, authController.register);

// User login
router.post('/login', validateRequest, authController.login);

// User logout
router.post('/logout', authController.logout);

// Get current user profile
router.get('/me', authController.getCurrentUser);

// Google OAuth login
router.post('/google', authController.googleLogin);

// Facebook OAuth login
router.post('/facebook', authController.facebookLogin);

// Microsoft OAuth login
router.post('/microsoft', authController.microsoftLogin);

module.exports = router;