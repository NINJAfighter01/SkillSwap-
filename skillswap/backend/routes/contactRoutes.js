const express = require('express')
const feedbackController = require('../controllers/feedbackController')

const router = express.Router()

router.post('/', feedbackController.submitContact)

module.exports = router
