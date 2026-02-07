const Review = require('../models/Review')
const Rating = require('../models/Rating')
const User = require('../models/User')
const UserSkill = require('../models/UserSkill')
const { Op } = require('sequelize')

// Create review for mentor
exports.createReview = async (req, res) => {
  try {
    const reviewerId = req.user.id
    const { mentorId, skillId, rating, title, comment, category } = req.body

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    // Check if mentor exists
    const mentor = await User.findByPk(mentorId)
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' })
    }

    // Create review
    const review = await Review.create({
      reviewerId,
      mentorId,
      skillId,
      rating,
      title,
      comment,
      category: category || 'Overall',
    })

    // Update mentor's average rating
    const mentorReviews = await Review.findAll({ where: { mentorId } })
    const avgRating = mentorReviews.reduce((sum, r) => sum + r.rating, 0) / mentorReviews.length

    await User.update({ averageRating: avgRating }, { where: { id: mentorId } })

    // If skillId provided, update UserSkill rating
    if (skillId) {
      const userSkill = await UserSkill.findOne({ where: { userId: mentorId, skillId, type: 'teach' } })
      if (userSkill) {
        const skillReviews = await Review.findAll({ where: { mentorId, skillId } })
        const skillAvgRating = skillReviews.reduce((sum, r) => sum + r.rating, 0) / skillReviews.length
        await userSkill.update({ rating: skillAvgRating })
      }
    }

    res.status(201).json({ message: 'Review created successfully', review })
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message })
  }
}

// Get mentor reviews
exports.getMentorReviews = async (req, res) => {
  try {
    const { mentorId } = req.params
    const { skillId } = req.query

    let where = { mentorId }
    if (skillId) where.skillId = skillId

    const reviews = await Review.findAll({
      where,
      include: [
        {
          model: User,
          foreignKey: 'reviewerId',
          as: 'reviewer',
          attributes: ['id', 'name', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    res.json({ reviews })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message })
  }
}

// Create rating
exports.createRating = async (req, res) => {
  try {
    const ratedById = req.user.id
    const { mentorId, userSkillId, rating, feedback, isAnonymous } = req.body

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    const ratingRecord = await Rating.create({
      ratedById,
      mentorId,
      userSkillId,
      rating,
      feedback,
      isAnonymous: isAnonymous || false,
    })

    res.status(201).json({ message: 'Rating created successfully', rating: ratingRecord })
  } catch (error) {
    res.status(500).json({ message: 'Error creating rating', error: error.message })
  }
}

// Get mentor profile with reviews/ratings
exports.getMentorProfile = async (req, res) => {
  try {
    const { mentorId } = req.params

    const mentor = await User.findByPk(mentorId, {
      attributes: ['id', 'name', 'email', 'profilePicture', 'bio', 'isTeacher', 'totalHours', 'averageRating'],
      include: [
        {
          model: UserSkill,
          where: { type: 'teach' },
          include: [
            {
              model: Skill,
              attributes: ['id', 'title', 'category', 'averageRating'],
            },
          ],
        },
        {
          model: Review,
          as: 'receivedReviews',
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              foreignKey: 'reviewerId',
              as: 'reviewer',
              attributes: ['id', 'name', 'profilePicture'],
            },
          ],
        },
      ],
    })

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' })
    }

    // Get statistics
    const totalReviews = await Review.count({ where: { mentorId } })
    const completedSessions = await Session.count({
      where: { mentorId, status: 'Completed' },
    })

    res.json({
      mentor,
      stats: {
        totalReviews,
        completedSessions,
        averageRating: mentor.averageRating || 0,
        isTopMentor: mentor.averageRating >= 4.0,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentor profile', error: error.message })
  }
}

// Get top mentors
exports.getTopMentors = async (req, res) => {
  try {
    const { skillId, limit = 10 } = req.query

    let where = { isTeacher: true }
    
    // If no skillId, get all top mentors
    if (skillId) {
      const mentors = await UserSkill.findAll({
        where: { skillId, type: 'teach' },
        attributes: ['userId'],
        raw: true,
      })
      const mentorIds = mentors.map(m => m.userId)
      where.id = { [Op.in]: mentorIds }
    }

    const topMentors = await User.findAll({
      where: { ...where, [Op.where]: sequelize.where(sequelize.col('averageRating'), Op.gte, 4.0) },
      limit: parseInt(limit),
      order: [['averageRating', 'DESC']],
      attributes: ['id', 'name', 'profilePicture', 'bio', 'averageRating', 'isTeacher'],
    })

    res.json({ mentors: topMentors })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top mentors', error: error.message })
  }
}

module.exports = exports
