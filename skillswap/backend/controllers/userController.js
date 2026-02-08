const User = require('../models/User')
const Progress = require('../models/Progress')
const VideoProgress = require('../models/VideoProgress')
const Lecture = require('../models/Lecture')
const Video = require('../models/Video')

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

    const { name, bio, isTeacher, skills, projects, socialLinks, aiInsights } = req.body

    const updateData = {
      name: name || user.name,
      bio: bio || user.bio,
      isTeacher: isTeacher !== undefined ? isTeacher : user.isTeacher,
    }

    if (skills !== undefined) updateData.skills = skills
    if (projects !== undefined) updateData.projects = projects
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks
    if (aiInsights !== undefined) updateData.aiInsights = aiInsights

    await user.update(updateData)

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        isTeacher: user.isTeacher,
        skills: user.skills,
        projects: user.projects,
        socialLinks: user.socialLinks,
        aiInsights: user.aiInsights,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.getProgress = async (req, res, next) => {
  try {
    const lectureProgress = await Progress.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Lecture,
          attributes: ['id', 'title', 'category', 'duration'],
        },
      ],
      order: [['updatedAt', 'DESC']],
    })

    const videoProgress = await VideoProgress.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Video,
          attributes: ['id', 'title', 'skillTag', 'level', 'duration'],
        },
      ],
      order: [['updatedAt', 'DESC']],
    })

    const progress = [
      ...lectureProgress.map((item) => ({
        ...item.toJSON(),
        type: 'lecture',
      })),
      ...videoProgress.map((item) => ({
        ...item.toJSON(),
        type: 'video',
      })),
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    const user = await User.findByPk(req.userId)

    res.json({
      progress,
      stats: {
        lecturesCompleted: user.lecturesCompleted,
        tasksCompleted: user.tasksCompleted,
        totalHours: user.totalHours,
        lectureProgressCount: lectureProgress.length,
        videoProgressCount: videoProgress.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.updateProgress = async (req, res, next) => {
  try {
    const { lectureId, videoId, completionPercentage } = req.body
    const normalizedCompletion = Math.max(0, Math.min(100, Number(completionPercentage) || 0))

    if (!lectureId && !videoId) {
      return res.status(400).json({ message: 'lectureId or videoId is required' })
    }

    let progress
    if (lectureId) {
      const [record, created] = await Progress.findOrCreate({
        where: { userId: req.userId, lectureId },
        defaults: { completionPercentage: normalizedCompletion, isCompleted: normalizedCompletion === 100 },
      })

      if (!created) {
        await record.update({
          completionPercentage: normalizedCompletion,
          isCompleted: normalizedCompletion === 100,
        })
      }

      progress = record
    } else {
      const [record, created] = await VideoProgress.findOrCreate({
        where: { userId: req.userId, videoId },
        defaults: { completionPercentage: normalizedCompletion, isCompleted: normalizedCompletion === 100 },
      })

      if (!created) {
        await record.update({
          completionPercentage: normalizedCompletion,
          isCompleted: normalizedCompletion === 100,
        })
      }

      progress = record
    }

    const io = req.app.get('io')
    if (io) {
      io.to(`user:${req.userId}`).emit('progress:updated', {
        type: lectureId ? 'lecture' : 'video',
        lectureId: lectureId || null,
        videoId: videoId || null,
        completionPercentage: normalizedCompletion,
        isCompleted: normalizedCompletion === 100,
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
