const express = require('express')
const router = express.Router()
const skillController = require('../controllers/skillController')
const authMiddleware = require('../middleware/auth')

// Public routes
router.get('/all', skillController.getAllSkills)
router.get('/categories', skillController.getCategories)
router.get('/trending', skillController.getTrendingSkills)
router.get('/:id', skillController.getSkillById)

// Protected routes
router.post('/', authMiddleware, skillController.createSkill)
router.post('/add-to-user', authMiddleware, skillController.addSkillToUser)
router.get('/user/:userId/teaching', skillController.getUserTeachingSkills)
router.get('/user/learning', authMiddleware, skillController.getUserLearningSkills)

module.exports = router
