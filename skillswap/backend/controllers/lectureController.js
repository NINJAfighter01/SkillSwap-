const Lecture = require('../models/Lecture')
const User = require('../models/User')
const Progress = require('../models/Progress')
const TokenHistory = require('../models/TokenHistory')

exports.getAllLectures = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search = '' } = req.query
    const offset = (page - 1) * limit

    const where = search ? { title: { $like: `%${search}%` } } : {}

    const { count, rows } = await Lecture.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'profilePicture'],
        },
      ],
    })

    const lectures = rows.map((lecture) => ({
      ...lecture.toJSON(),
      teacherName: lecture.teacher?.name || 'Unknown',
    }))

    res.json({
      lectures,
      total: count,
      pages: Math.ceil(count / limit),
    })
  } catch (error) {
    next(error)
  }
}

exports.getLectureById = async (req, res, next) => {
  try {
    const lecture = await Lecture.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'profilePicture'],
        },
      ],
    })

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' })
    }

    const lectureData = lecture.toJSON()
    lectureData.teacherName = lecture.teacher?.name || 'Unknown'

    res.json(lectureData)
  } catch (error) {
    next(error)
  }
}

exports.createLecture = async (req, res, next) => {
  try {
    const { title, description, fullDescription, videoUrl, tokens, category, duration, isPremium, isLive } = req.body

    const lecture = await Lecture.create({
      title,
      description,
      fullDescription,
      videoUrl,
      tokens,
      category,
      duration,
      isPremium,
      isLive,
      teacherId: req.userId,
    })

    res.status(201).json({
      message: 'Lecture created successfully',
      lecture,
    })
  } catch (error) {
    next(error)
  }
}

exports.updateLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findByPk(req.params.id)

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' })
    }

    if (lecture.teacherId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    await lecture.update(req.body)

    res.json({
      message: 'Lecture updated successfully',
      lecture,
    })
  } catch (error) {
    next(error)
  }
}

exports.deleteLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findByPk(req.params.id)

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' })
    }

    if (lecture.teacherId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    await lecture.destroy()

    res.json({ message: 'Lecture deleted successfully' })
  } catch (error) {
    next(error)
  }
}

exports.watchLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findByPk(req.params.id)

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' })
    }

    const user = await User.findByPk(req.userId)

    if (user.tokens < lecture.tokens) {
      return res.status(400).json({ message: 'Insufficient tokens' })
    }

    // Deduct tokens from student
    user.tokens -= lecture.tokens
    await user.save()

    // Add tokens to teacher
    const teacher = await User.findByPk(lecture.teacherId)
    teacher.tokens += lecture.tokens
    await teacher.save()

    // Record token history
    await TokenHistory.create({
      userId: req.userId,
      type: 'spent',
      amount: lecture.tokens,
      reason: `Watched lecture: ${lecture.title}`,
      relatedId: lecture.id,
    })

    await TokenHistory.create({
      userId: lecture.teacherId,
      type: 'earned',
      amount: lecture.tokens,
      reason: `Tokens from lecture view: ${lecture.title}`,
      relatedId: lecture.id,
    })

    // Update progress
    await Progress.findOrCreate({
      where: { userId: req.userId, lectureId: lecture.id },
      defaults: { completionPercentage: 100, isCompleted: true },
    })

    const io = req.app.get('io')
    if (io) {
      io.to(`user:${req.userId}`).emit('progress:updated', {
        type: 'lecture',
        lectureId: lecture.id,
        completionPercentage: 100,
        isCompleted: true,
      })
    }

    // Update lecture views
    lecture.views += 1
    await lecture.save()

    res.json({
      message: 'Lecture watched successfully',
      tokensDeducted: lecture.tokens,
    })
  } catch (error) {
    next(error)
  }
}

exports.getTeacherLectures = async (req, res, next) => {
  try {
    const lectures = await Lecture.findAll({
      where: { teacherId: req.userId },
    })

    res.json({ lectures })
  } catch (error) {
    next(error)
  }
}
