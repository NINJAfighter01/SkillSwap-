const Feedback = require('../models/Feedback')
const Contact = require('../models/Contact')

exports.submitFeedback = async (req, res, next) => {
  try {
    const { category, subject, rating, message, email } = req.body

    const feedback = await Feedback.create({
      userId: req.userId,
      category,
      subject,
      rating,
      message,
      email,
      status: 'pending',
    })

    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('feedback:new', feedback)
    }

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback,
    })
  } catch (error) {
    next(error)
  }
}

exports.getFeedback = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const { count, rows } = await Feedback.findAndCountAll({
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: require('../models/User'),
          attributes: ['name', 'profilePicture'],
        },
      ],
    })

    res.json({
      feedback: rows,
      total: count,
      pages: Math.ceil(count / limit),
    })
  } catch (error) {
    next(error)
  }
}

exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body

    const contact = await Contact.create({
      name,
      email,
      message,
    })

    res.status(201).json({
      message: 'Contact form submitted successfully',
      contact,
    })
  } catch (error) {
    next(error)
  }
}
