const express = require('express')
const lectureController = require('../controllers/lectureController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/', lectureController.getAllLectures)
router.get('/:id', lectureController.getLectureById)
router.post('/', authMiddleware, lectureController.createLecture)
router.put('/:id', authMiddleware, lectureController.updateLecture)
router.delete('/:id', authMiddleware, lectureController.deleteLecture)
router.post('/:id/watch', authMiddleware, lectureController.watchLecture)
router.get('/teacher/list', authMiddleware, lectureController.getTeacherLectures)

module.exports = router
