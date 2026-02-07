const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/reviewController')
const authMiddleware = require('../middleware/auth')

// Create review (require authentication)
router.post('/', authMiddleware, reviewController.createReview)

// Create rating (require authentication)
router.post('/rating', authMiddleware, reviewController.createRating)

// Get mentor reviews (public)
router.get('/mentor/:mentorId', reviewController.getMentorReviews)

// Get mentor profile with reviews
router.get('/profile/:mentorId', reviewController.getMentorProfile)

// Get top mentors
router.get('/top-mentors', reviewController.getTopMentors)

module.exports = router
