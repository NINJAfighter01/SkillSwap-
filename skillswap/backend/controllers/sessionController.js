const Session = require('../models/Session')
const User = require('../models/User')
const Skill = require('../models/Skill')
const UserSkill = require('../models/UserSkill')
const { Op } = require('sequelize')

// Create session request (learner requests)
exports.createSessionRequest = async (req, res) => {
  try {
    const learnerId = req.user.id
    const { mentorId, skillId, title, description, scheduleDate, duration } = req.body

    // Validate mentor and skill exist
    const mentor = await User.findByPk(mentorId)
    const skill = await Skill.findByPk(skillId)

    if (!mentor || !skill) {
      return res.status(404).json({ message: 'Mentor or skill not found' })
    }

    // Check if mentor teaches this skill
    const mentorSkill = await UserSkill.findOne({
      where: { userId: mentorId, skillId, type: 'teach' },
    })

    if (!mentorSkill) {
      return res.status(400).json({ message: 'Mentor does not teach this skill' })
    }

    // Create session
    const session = await Session.create({
      mentorId,
      learnerId,
      skillId,
      title,
      description,
      scheduleDate,
      duration: duration || 60,
      status: 'Pending',
    })

    res.status(201).json({ message: 'Session request created', session })
  } catch (error) {
    res.status(500).json({ message: 'Error creating session', error: error.message })
  }
}

// Get sessions for mentor (approve/reject)
exports.getMentorSessions = async (req, res) => {
  try {
    const mentorId = req.user.id
    const { status = 'Pending' } = req.query

    const sessions = await Session.findAll({
      where: { mentorId, status },
      include: [
        { model: User, foreignKey: 'learnerId', as: 'learner', attributes: ['id', 'name', 'profilePicture', 'email'] },
        { model: Skill, attributes: ['id', 'title', 'category'] },
      ],
      order: [['scheduleDate', 'ASC']],
    })

    res.json({ sessions })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message })
  }
}

// Get sessions for learner
exports.getLearnerSessions = async (req, res) => {
  try {
    const learnerId = req.user.id
    const { status } = req.query

    let where = { learnerId }
    if (status) where.status = status

    const sessions = await Session.findAll({
      where,
      include: [
        { model: User, foreignKey: 'mentorId', as: 'mentor', attributes: ['id', 'name', 'profilePicture', 'bio'] },
        { model: Skill, attributes: ['id', 'title', 'category'] },
      ],
      order: [['scheduleDate', 'DESC']],
    })

    res.json({ sessions })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message })
  }
}

// Approve session (mentor)
exports.approveSession = async (req, res) => {
  try {
    const { sessionId } = req.params
    const mentorId = req.user.id

    const session = await Session.findByPk(sessionId)

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    if (session.mentorId !== mentorId) {
      return res.status(403).json({ message: 'You are not authorized to approve this session' })
    }

    await session.update({ status: 'Approved' })

    res.json({ message: 'Session approved', session })
  } catch (error) {
    res.status(500).json({ message: 'Error approving session', error: error.message })
  }
}

// Reject session (mentor)
exports.rejectSession = async (req, res) => {
  try {
    const { sessionId } = req.params
    const mentorId = req.user.id
    const { reason } = req.body

    const session = await Session.findByPk(sessionId)

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    if (session.mentorId !== mentorId) {
      return res.status(403).json({ message: 'You are not authorized to reject this session' })
    }

    await session.update({ status: 'Rejected', notes: reason })

    res.json({ message: 'Session rejected', session })
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting session', error: error.message })
  }
}

// Complete session (mentor or learner)
exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user.id
    const { mentorRating, learnerRating } = req.body

    const session = await Session.findByPk(sessionId)

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    if (session.mentorId !== userId && session.learnerId !== userId) {
      return res.status(403).json({ message: 'You are not part of this session' })
    }

    // If mentor is completing, add their rating
    if (userId === session.mentorId && learnerRating) {
      await session.update({ learnerRating, status: 'Completed' })
    }

    // If learner is completing, add their rating
    if (userId === session.learnerId && mentorRating) {
      await session.update({ mentorRating, status: 'Completed' })
    }

    res.json({ message: 'Session completed', session })
  } catch (error) {
    res.status(500).json({ message: 'Error completing session', error: error.message })
  }
}

// Cancel session
exports.cancelSession = async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user.id

    const session = await Session.findByPk(sessionId)

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    if (session.mentorId !== userId && session.learnerId !== userId) {
      return res.status(403).json({ message: 'You are not part of this session' })
    }

    await session.update({ status: 'Cancelled' })

    res.json({ message: 'Session cancelled', session })
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling session', error: error.message })
  }
}

// Get all sessions (for dashboard)
exports.getAllSessions = async (req, res) => {
  try {
    const userId = req.user.id

    const sessions = await Session.findAll({
      where: {
        [Op.or]: [{ mentorId: userId }, { learnerId: userId }],
      },
      include: [
        { model: User, foreignKey: 'mentorId', as: 'mentor', attributes: ['id', 'name', 'profilePicture'] },
        { model: User, foreignKey: 'learnerId', as: 'learner', attributes: ['id', 'name', 'profilePicture'] },
        { model: Skill, attributes: ['id', 'title', 'category'] },
      ],
      order: [['scheduleDate', 'DESC']],
    })

    res.json({ sessions })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message })
  }
}

module.exports = exports
