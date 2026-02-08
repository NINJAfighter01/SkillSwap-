const express = require('express');
const notesController = require('../controllers/notesController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get notes for a specific lecture
router.get('/lecture/:lectureId', authMiddleware, notesController.getNotesForLecture);

// Create a new note
router.post('/', authMiddleware, notesController.createNote);

// Update an existing note
router.put('/:id', authMiddleware, notesController.updateNote);

// Delete a note
router.delete('/:id', authMiddleware, notesController.deleteNote);

// Download notes for a specific lecture
router.get('/lecture/:lectureId/download', authMiddleware, notesController.downloadNotes);

module.exports = router;