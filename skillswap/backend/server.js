require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./config/database')
const errorHandler = require('./middleware/errorHandler')

// Import routes
const authRoutes = require('./routes/authRoutes')
const lectureRoutes = require('./routes/lectureRoutes')
const notesRoutes = require('./routes/notesRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const userRoutes = require('./routes/userRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes')
const contactRoutes = require('./routes/contactRoutes')
const skillRoutes = require('./routes/skillRoutes')
const sessionRoutes = require('./routes/sessionRoutes')
const reviewRoutes = require('./routes/reviewRoutes')

// Import models
const User = require('./models/User')
const Lecture = require('./models/Lecture')
const Note = require('./models/Note')
const Subscription = require('./models/Subscription')
const Payment = require('./models/Payment')
const TokenHistory = require('./models/TokenHistory')
const Progress = require('./models/Progress')
const Feedback = require('./models/Feedback')
const Contact = require('./models/Contact')
const Skill = require('./models/Skill')
const UserSkill = require('./models/UserSkill')
const Session = require('./models/Session')
const Review = require('./models/Review')
const Rating = require('./models/Rating')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/auth', authRoutes)
app.use('/lectures', lectureRoutes)
app.use('/notes', notesRoutes)
app.use('/payments', paymentRoutes)
app.use('/users', userRoutes)
app.use('/feedback', feedbackRoutes)
app.use('/contact', contactRoutes)
app.use('/api/skills', skillRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/reviews', reviewRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' })
})

// Error handling
app.use(errorHandler)

// Database sync and server start
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // Set up associations
    User.hasMany(Lecture, { foreignKey: 'teacherId', as: 'teacher' })
    Lecture.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' })

    User.hasMany(Note, { foreignKey: 'userId' })
    Note.belongsTo(User, { foreignKey: 'userId' })

    Lecture.hasMany(Note, { foreignKey: 'lectureId' })
    Note.belongsTo(Lecture, { foreignKey: 'lectureId' })

    User.hasMany(Subscription, { foreignKey: 'userId' })
    Subscription.belongsTo(User, { foreignKey: 'userId' })

    User.hasMany(Payment, { foreignKey: 'userId' })
    Payment.belongsTo(User, { foreignKey: 'userId' })

    User.hasMany(TokenHistory, { foreignKey: 'userId' })
    TokenHistory.belongsTo(User, { foreignKey: 'userId' })

    User.hasMany(Progress, { foreignKey: 'userId' })
    Progress.belongsTo(User, { foreignKey: 'userId' })

    Lecture.hasMany(Progress, { foreignKey: 'lectureId' })
    Progress.belongsTo(Lecture, { foreignKey: 'lectureId' })

    User.hasMany(Feedback, { foreignKey: 'userId' })
    Feedback.belongsTo(User, { foreignKey: 'userId' })

    // Disable foreign keys for sync
    await sequelize.query('PRAGMA foreign_keys = OFF')
    
    // Sync database
    await sequelize.sync({ force: true })
    
    // Enable foreign keys
    await sequelize.query('PRAGMA foreign_keys = ON')
    console.log('Database synced successfully')

    // Create sample teacher if none exists
    let teacherId = 1
    const existingUsers = await User.count()
    if (existingUsers === 0) {
      const teacher = await User.create({
        name: 'Sample Teacher',
        email: 'teacher@example.com',
        password: 'password123',
        tokens: 1000,
        isTeacher: true
      })
      teacherId = teacher.id
    }

    // Insert sample data
    const existingLectureCount = await Lecture.count()
    if (existingLectureCount === 0) {
      await Lecture.bulkCreate([
        {
          title: 'Introduction to Web Development',
          description: 'Learn the basics of HTML, CSS, and JavaScript',
          fullDescription: 'Complete guide to starting your web development journey with responsive design patterns and modern frameworks',
          tokens: 10,
          category: 'Web Development',
          duration: 45,
          teacherId: teacherId,
          isPremium: false,
          isLive: false,
          views: 0,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
        {
          title: 'React.js Fundamentals',
          description: 'Master React components and hooks',
          fullDescription: 'Deep dive into React for building modern web applications with JSX and state management',
          tokens: 15,
          category: 'Frontend',
          duration: 60,
          teacherId: teacherId,
          isPremium: false,
          isLive: false,
          views: 0,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
        {
          title: 'Node.js Backend Development',
          description: 'Build scalable server-side applications',
          fullDescription: 'Learn Express.js and create RESTful APIs with proper error handling and authentication',
          tokens: 20,
          category: 'Backend',
          duration: 90,
          teacherId: teacherId,
          isPremium: true,
          isLive: false,
          views: 0,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
        {
          title: 'Database Design with SQL',
          description: 'Create efficient databases and write queries',
          fullDescription: 'Master SQL and database optimization with proper indexing and query performance tuning',
          tokens: 12,
          category: 'Databases',
          duration: 75,
          teacherId: teacherId,
          isPremium: false,
          isLive: false,
          views: 0,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
      ])
      console.log('Sample lectures created')
    }

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app
