const express = require('express')
const router = express.Router()
const videoController = require('../controllers/videoController')
const authMiddleware = require('../middleware/auth')
const optionalAuth = require('../middleware/optionalAuth')
const upload = require('../middleware/upload')

// Public routes (optional auth to include premium videos for logged-in users)
router.get('/', optionalAuth, videoController.getAllVideos)

// Protected routes (require authentication) - SPECIFIC ROUTES FIRST!
router.get('/my/videos', authMiddleware, videoController.getMyVideos)
router.post('/upload', authMiddleware, upload.single('video'), videoController.uploadVideo)
router.post('/:id/watch', authMiddleware, videoController.watchVideo)

// Generic routes - LAST!
router.get('/:id', optionalAuth, videoController.getVideoById)
router.post('/', authMiddleware, videoController.createVideo)
router.put('/:id', authMiddleware, videoController.updateVideo)
router.delete('/:id', authMiddleware, videoController.deleteVideo)
router.post('/:id/like', authMiddleware, videoController.likeVideo)

module.exports = router
