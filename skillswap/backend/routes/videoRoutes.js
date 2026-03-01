const express = require('express')
const router = express.Router()
const videoController = require('../controllers/videoController')
const authMiddleware = require('../middleware/auth')
const optionalAuth = require('../middleware/optionalAuth')
const upload = require('../middleware/upload')
const noteUpload = require('../middleware/noteUpload')

// Public routes (optional auth to include premium videos for logged-in users)
router.get('/', optionalAuth, videoController.getAllVideos)

// Protected routes (require authentication) - SPECIFIC ROUTES FIRST!
router.get('/my/videos', authMiddleware, videoController.getMyVideos)
router.get('/dashboard/analytics', authMiddleware, videoController.getDashboardAnalytics)
router.post('/upload', authMiddleware, upload.fields([
	{ name: 'video', maxCount: 1 },
	{ name: 'thumbnail', maxCount: 1 },
]), videoController.uploadVideo)
router.post('/:id/watch', authMiddleware, videoController.watchVideo)
router.get('/:id/comments', optionalAuth, videoController.getVideoComments)
router.post('/:id/comments', authMiddleware, videoController.addVideoComment)
router.post('/:id/report', authMiddleware, videoController.reportVideo)
router.get('/:id/notes', optionalAuth, videoController.getVideoNotes)
router.post('/:id/notes', authMiddleware, noteUpload.single('noteFile'), videoController.addVideoNote)

// Generic routes - LAST!
router.get('/:id', optionalAuth, videoController.getVideoById)
router.post('/', authMiddleware, videoController.createVideo)
router.put('/:id', authMiddleware, videoController.updateVideo)
router.delete('/:id', authMiddleware, videoController.deleteVideo)
router.post('/:id/like', authMiddleware, videoController.likeVideo)

module.exports = router
