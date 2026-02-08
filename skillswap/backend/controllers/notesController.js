const Note = require('../models/Note')
const Lecture = require('../models/Lecture')

exports.getAllUserNotes = async (req, res, next) => {
  try {
    const notes = await Note.findAll({
      where: {
        userId: req.userId,
      },
      include: [
        {
          model: Lecture,
          attributes: ['id', 'title', 'description'],
        },
      ],
      order: [['updatedAt', 'DESC']],
    })

    res.json({ notes })
  } catch (error) {
    next(error)
  }
}

exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.findAll({
      where: {
        lectureId: req.params.lectureId,
        userId: req.userId,
      },
    })

    if (notes.length === 0) {
      return res.json({ notes: [] })
    }

    res.json({ notes })
  } catch (error) {
    next(error)
  }
}

exports.createNote = async (req, res, next) => {
  try {
    const { lectureId, content, files, topicName } = req.body

    if (!lectureId && !topicName) {
      return res.status(400).json({ message: 'Topic name is required' })
    }

    if (lectureId) {
      const lecture = await Lecture.findByPk(lectureId)
      if (!lecture) {
        return res.status(404).json({ message: 'Lecture not found' })
      }
    }

    const note = await Note.create({
      lectureId: lectureId || null,
      topicName: topicName ? String(topicName).trim() : null,
      userId: req.userId,
      content,
      files: files || [],
    })

    const io = req.app.get('io')
    if (io) {
      io.to(`user:${req.userId}`).emit('notes:updated', {
        action: 'create',
        noteId: note.id,
        lectureId: note.lectureId,
      })
    }

    res.status(201).json({
      message: 'Note created successfully',
      note,
    })
  } catch (error) {
    next(error)
  }
}

exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findByPk(req.params.id)

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    if (note.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    await note.update(req.body)

    const io = req.app.get('io')
    if (io) {
      io.to(`user:${req.userId}`).emit('notes:updated', {
        action: 'update',
        noteId: note.id,
        lectureId: note.lectureId,
      })
    }

    res.json({
      message: 'Note updated successfully',
      note,
    })
  } catch (error) {
    next(error)
  }
}

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findByPk(req.params.id)

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    if (note.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    await note.destroy()

    const io = req.app.get('io')
    if (io) {
      io.to(`user:${req.userId}`).emit('notes:updated', {
        action: 'delete',
        noteId: note.id,
        lectureId: note.lectureId,
      })
    }

    res.json({ message: 'Note deleted successfully' })
  } catch (error) {
    next(error)
  }
}

exports.downloadNotes = async (req, res, next) => {
  try {
    const notes = await Note.findAll({
      where: {
        lectureId: req.params.lectureId,
        userId: req.userId,
      },
    })

    const lecture = await Lecture.findByPk(req.params.lectureId)

    if (notes.length === 0) {
      return res.status(404).json({ message: 'No notes found' })
    }

    const content = notes.map((note) => note.content).join('\n---\n')

    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Content-Disposition', `attachment; filename="notes-${lecture.id}.txt"`)
    res.send(content)
  } catch (error) {
    next(error)
  }
}
