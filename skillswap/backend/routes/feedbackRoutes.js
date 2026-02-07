const express = require('express')
const feedbackController = require('../controllers/feedbackController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.post('/', authMiddleware, feedbackController.submitFeedback)
router.get('/', feedbackController.getFeedback)

module.exports = router
