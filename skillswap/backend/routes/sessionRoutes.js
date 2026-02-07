const express = require('express')
const router = express.Router()
const sessionController = require('../controllers/sessionController')
const authMiddleware = require('../middleware/auth')

// All routes require authentication
router.use(authMiddleware)

// Create session request (learner)
router.post('/', sessionController.createSessionRequest)

// Get sessions
router.get('/mentor', sessionController.getMentorSessions)
router.get('/learner', sessionController.getLearnerSessions)
router.get('/all', sessionController.getAllSessions)

// Approve/Reject session (mentor)
router.put('/:sessionId/approve', sessionController.approveSession)
router.put('/:sessionId/reject', sessionController.rejectSession)

// Complete session
router.put('/:sessionId/complete', sessionController.completeSession)

// Cancel session
router.delete('/:sessionId/cancel', sessionController.cancelSession)

module.exports = router
