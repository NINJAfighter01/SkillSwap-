const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all lectures
router.get('/', lectureController.getAllLectures);

// Get lecture by ID
router.get('/:id', lectureController.getLectureById);

// Create a new lecture
router.post('/', authMiddleware, lectureController.createLecture);

// Update a lecture
router.put('/:id', authMiddleware, lectureController.updateLecture);

// Delete a lecture
router.delete('/:id', authMiddleware, lectureController.deleteLecture);

// Watch a lecture
router.post('/:id/watch', authMiddleware, lectureController.watchLecture);

// Get lectures by teacher
router.get('/teacher/list', authMiddleware, lectureController.getTeacherLectures);

module.exports = router;