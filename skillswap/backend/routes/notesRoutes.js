const express = require('express')
const notesController = require('../controllers/notesController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/all', authMiddleware, notesController.getAllUserNotes)
router.get('/lecture/:lectureId', authMiddleware, notesController.getNotes)
router.post('/', authMiddleware, notesController.createNote)
router.put('/:id', authMiddleware, notesController.updateNote)
router.delete('/:id', authMiddleware, notesController.deleteNote)
router.get('/lecture/:lectureId/download', authMiddleware, notesController.downloadNotes)

module.exports = router
