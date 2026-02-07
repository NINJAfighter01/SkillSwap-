const User = require('../models/User')
const Progress = require('../models/Progress')

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    next(error)
  }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { name, bio, isTeacher } = req.body

    await user.update({
      name: name || user.name,
      bio: bio || user.bio,
      isTeacher: isTeacher !== undefined ? isTeacher : user.isTeacher,
    })

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        isTeacher: user.isTeacher,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: require('../models/Lecture'),
          attributes: ['title', 'category'],
        },
      ],
    })

    const user = await User.findByPk(req.userId)

    res.json({
      progress,
      stats: {
        lecturesCompleted: user.lecturesCompleted,
        tasksCompleted: user.tasksCompleted,
        totalHours: user.totalHours,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.updateProgress = async (req, res, next) => {
  try {
    const { lectureId, completionPercentage } = req.body

    const [progress, created] = await Progress.findOrCreate({
      where: { userId: req.userId, lectureId },
      defaults: { completionPercentage, isCompleted: completionPercentage === 100 },
    })

    if (!created) {
      await progress.update({
        completionPercentage,
        isCompleted: completionPercentage === 100,
      })
    }

    res.json({
      message: 'Progress updated',
      progress,
    })
  } catch (error) {
    next(error)
  }
}

exports.getPortfolio = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId)

    const Lecture = require('../models/Lecture')
    const lectures = await Lecture.findAll({
      where: { teacherId: req.userId },
    })

    res.json({
      portfolio: {
        name: user.name,
        bio: user.bio,
        isTeacher: user.isTeacher,
        lecturesCount: lectures.length,
        totalViews: lectures.reduce((sum, l) => sum + l.views, 0),
        lecturesCreated: lectures,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.updatePortfolio = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId)

    const { bio, isTeacher } = req.body

    await user.update({
      bio: bio || user.bio,
      isTeacher: isTeacher !== undefined ? isTeacher : user.isTeacher,
    })

    res.json({
      message: 'Portfolio updated',
      user: {
        name: user.name,
        bio: user.bio,
        isTeacher: user.isTeacher,
      },
    })
  } catch (error) {
    next(error)
  }
}
