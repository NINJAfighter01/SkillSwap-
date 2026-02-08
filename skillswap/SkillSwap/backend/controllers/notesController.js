const Note = require('../models/Note');

// Create a new note
exports.createNote = async (req, res) => {
    try {
        const { lectureId, content } = req.body;
        const newNote = await Note.create({ lectureId, content, userId: req.user.id });
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ message: 'Error creating note', error });
    }
};

// Get notes for a specific lecture
exports.getNotesByLecture = async (req, res) => {
    try {
        const notes = await Note.findAll({ where: { lectureId: req.params.lectureId, userId: req.user.id } });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes', error });
    }
};

// Update a note
exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const note = await Note.findByPk(id);

        if (!note || note.userId !== req.user.id) {
            return res.status(404).json({ message: 'Note not found or not authorized' });
        }

        note.content = content;
        await note.save();
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Error updating note', error });
    }
};

// Delete a note
exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findByPk(id);

        if (!note || note.userId !== req.user.id) {
            return res.status(404).json({ message: 'Note not found or not authorized' });
        }

        await note.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting note', error });
    }
};