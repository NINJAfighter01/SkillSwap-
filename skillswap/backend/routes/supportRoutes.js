const express = require('express')
const supportController = require('../controllers/supportController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

// Create support ticket
router.post('/tickets', supportController.createTicket)

// Send message in ticket
router.post('/messages', supportController.sendMessage)

// Get user's support tickets
router.get('/tickets', supportController.getUserTickets)

// Get support stats
router.get('/stats', supportController.getSupportStats)

// Get ticket details
router.get('/tickets/:ticketId', supportController.getTicketDetails)

// Close ticket
router.put('/tickets/:ticketId/close', supportController.closeTicket)

// Reopen ticket
router.put('/tickets/:ticketId/reopen', supportController.reopenTicket)

module.exports = router
