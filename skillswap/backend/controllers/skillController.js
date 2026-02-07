const Skill = require('../models/Skill')
const UserSkill = require('../models/UserSkill')
const User = require('../models/User')
const { Op } = require('sequelize')

// Get all skills with filters
exports.getAllSkills = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query
    const offset = (page - 1) * limit

    let where = {}
    if (category) where.category = category
    if (search) {
      where = {
        ...where,
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      }
    }

    const skills = await Skill.findAll({
      where,
      order: [['isTrending', 'DESC'], ['averageRating', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    })

    const total = await Skill.count({ where })

    res.json({
      skills,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills', error: error.message })
  }
}

// Get skill categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Skill.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      raw: true,
    })

    res.json({
      categories: categories.map(c => c.category).filter(Boolean),
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message })
  }
}

// Get single skill with mentors
exports.getSkillById = async (req, res) => {
  try {
    const { id } = req.params

    const skill = await Skill.findByPk(id, {
      include: [
        {
          model: UserSkill,
          as: 'UserSkills',
          where: { type: 'teach' },
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'name', 'profilePicture', 'bio', 'isTeacher'],
            },
          ],
        },
      ],
    })

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' })
    }

    res.json({ skill })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skill', error: error.message })
  }
}

// Get trending skills
exports.getTrendingSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll({
      where: { isTrending: true },
      limit: 8,
      order: [['averageRating', 'DESC']],
    })

    res.json({ skills })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending skills', error: error.message })
  }
}

// Create skill (admin only)
exports.createSkill = async (req, res) => {
  try {
    const { title, description, category, icon } = req.body

    const skill = await Skill.create({
      title,
      description,
      category,
      icon,
    })

    res.status(201).json({ message: 'Skill created successfully', skill })
  } catch (error) {
    res.status(500).json({ message: 'Error creating skill', error: error.message })
  }
}

// Add skill to user (user becomes mentor/learner)
exports.addSkillToUser = async (req, res) => {
  try {
    const userId = req.user.id
    const { skillId, type, proficiencyLevel } = req.body

    // Check if skill exists
    const skill = await Skill.findByPk(skillId)
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' })
    }

    // Check if user already has this skill with this type
    const existing = await UserSkill.findOne({
      where: { userId, skillId, type },
    })

    if (existing) {
      return res.status(400).json({ message: 'User already has this skill' })
    }

    const userSkill = await UserSkill.create({
      userId,
      skillId,
      type,
      proficiencyLevel: proficiencyLevel || 'Intermediate',
    })

    // If adding teaching skill, update isTeacher flag
    if (type === 'teach') {
      await User.update({ isTeacher: true }, { where: { id: userId } })
    }

    res.status(201).json({ message: 'Skill added successfully', userSkill })
  } catch (error) {
    res.status(500).json({ message: 'Error adding skill', error: error.message })
  }
}

// Get user's teaching skills (mentors)
exports.getUserTeachingSkills = async (req, res) => {
  try {
    const { userId } = req.params

    const skills = await UserSkill.findAll({
      where: { userId, type: 'teach' },
      include: [
        {
          model: Skill,
          attributes: ['id', 'title', 'description', 'category'],
        },
      ],
    })

    res.json({ skills })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teaching skills', error: error.message })
  }
}

// Get user's learning skills
exports.getUserLearningSkills = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId

    const skills = await UserSkill.findAll({
      where: { userId, type: 'learn' },
      include: [
        {
          model: Skill,
          attributes: ['id', 'title', 'description', 'category'],
        },
      ],
    })

    res.json({ skills })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching learning skills', error: error.message })
  }
}

module.exports = exports
