require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const sequelize = require('./config/database')
const errorHandler = require('./middleware/errorHandler')
const { socketHandler } = require('./websocket/socketHandler')

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
const videoRoutes = require('./routes/videoRoutes')
const supportRoutes = require('./routes/supportRoutes')

// Import models
const User = require('./models/User')
const Lecture = require('./models/Lecture')
const Note = require('./models/Note')
const Subscription = require('./models/Subscription')
const Payment = require('./models/Payment')
const TokenHistory = require('./models/TokenHistory')
const Progress = require('./models/Progress')
const VideoProgress = require('./models/VideoProgress')
const Feedback = require('./models/Feedback')
const Contact = require('./models/Contact')
const Skill = require('./models/Skill')
const UserSkill = require('./models/UserSkill')
const Session = require('./models/Session')
const Review = require('./models/Review')
const Rating = require('./models/Rating')
const Video = require('./models/Video')
const Support = require('./models/Support')
const SupportMessage = require('./models/SupportMessage')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Initialize WebSocket handler
socketHandler(io)

// Make io accessible to routes
app.set('io', io)

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' })) // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/lectures', lectureRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/skills', skillRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/support', supportRoutes)

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

    User.hasMany(VideoProgress, { foreignKey: 'userId' })
    VideoProgress.belongsTo(User, { foreignKey: 'userId' })

    Video.hasMany(VideoProgress, { foreignKey: 'videoId' })
    VideoProgress.belongsTo(Video, { foreignKey: 'videoId' })

    User.hasMany(Feedback, { foreignKey: 'userId' })
    Feedback.belongsTo(User, { foreignKey: 'userId' })

    User.hasMany(Video, { foreignKey: 'uploaderId', as: 'videos' })
    Video.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' })

    // Support associations
    User.hasMany(Support, { foreignKey: 'userId' })
    Support.belongsTo(User, { foreignKey: 'userId' })

    Support.hasMany(SupportMessage, { foreignKey: 'supportId' })
    SupportMessage.belongsTo(Support, { foreignKey: 'supportId' })

    User.hasMany(SupportMessage, { foreignKey: 'senderId' })
    SupportMessage.belongsTo(User, { foreignKey: 'senderId' })

    // Disable foreign keys for sync
    await sequelize.query('PRAGMA foreign_keys = OFF')
    
    // Sync database (creates tables if they don't exist, doesn't alter existing ones)
    await sequelize.sync()

    // Migrate Notes table to support topic-based notes
    const migrateNotesTable = async () => {
      const [columns] = await sequelize.query("PRAGMA table_info('Notes')")
      if (!columns || columns.length === 0) return

      const hasTopicName = columns.some((col) => col.name === 'topicName')
      const lectureColumn = columns.find((col) => col.name === 'lectureId')
      const lectureNotNull = lectureColumn ? lectureColumn.notnull === 1 : false

      if (!hasTopicName && !lectureNotNull) {
        await sequelize.query('ALTER TABLE Notes ADD COLUMN topicName TEXT')
        return
      }

      if (!lectureNotNull && hasTopicName) return

      await sequelize.query('CREATE TABLE IF NOT EXISTS Notes_new (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, topicName TEXT, lectureId INTEGER, userId INTEGER NOT NULL, files TEXT, createdAt DATETIME, updatedAt DATETIME, FOREIGN KEY(lectureId) REFERENCES Lectures(id), FOREIGN KEY(userId) REFERENCES Users(id))')
      if (hasTopicName) {
        await sequelize.query('INSERT INTO Notes_new (id, content, topicName, lectureId, userId, files, createdAt, updatedAt) SELECT id, content, topicName, lectureId, userId, files, createdAt, updatedAt FROM Notes')
      } else {
        await sequelize.query('INSERT INTO Notes_new (id, content, topicName, lectureId, userId, files, createdAt, updatedAt) SELECT id, content, NULL as topicName, lectureId, userId, files, createdAt, updatedAt FROM Notes')
      }
      await sequelize.query('DROP TABLE Notes')
      await sequelize.query('ALTER TABLE Notes_new RENAME TO Notes')
    }

    await migrateNotesTable()
    
    // Migrate Feedback table to support new professional feedback fields
    const migrateFeedbackTable = async () => {
      const [columns] = await sequelize.query("PRAGMA table_info('Feedbacks')")
      if (!columns || columns.length === 0) return

      const hasCategory = columns.some((col) => col.name === 'category')
      const hasSubject = columns.some((col) => col.name === 'subject')
      const hasStatus = columns.some((col) => col.name === 'status')
      const hasEmail = columns.some((col) => col.name === 'email')

      if (hasCategory && hasSubject && hasStatus && hasEmail) return

      console.log('Migrating Feedback table...')
      await sequelize.query('CREATE TABLE IF NOT EXISTS Feedbacks_new (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, category TEXT DEFAULT "general", subject TEXT NOT NULL, rating INTEGER NOT NULL, message TEXT NOT NULL, status TEXT DEFAULT "pending", email TEXT, createdAt DATETIME, updatedAt DATETIME, FOREIGN KEY(userId) REFERENCES Users(id))')
      
      if (hasCategory && hasSubject && hasStatus && hasEmail) {
        await sequelize.query('INSERT INTO Feedbacks_new SELECT * FROM Feedbacks')
      } else if (hasCategory && hasSubject) {
        await sequelize.query('INSERT INTO Feedbacks_new (id, userId, category, subject, rating, message, status, email, createdAt, updatedAt) SELECT id, userId, category, subject, rating, message, "pending" as status, NULL as email, createdAt, updatedAt FROM Feedbacks')
      } else if (hasSubject) {
        await sequelize.query('INSERT INTO Feedbacks_new (id, userId, category, subject, rating, message, status, email, createdAt, updatedAt) SELECT id, userId, "general" as category, subject, rating, message, "pending" as status, NULL as email, createdAt, updatedAt FROM Feedbacks')
      } else {
        await sequelize.query('INSERT INTO Feedbacks_new (id, userId, category, subject, rating, message, status, email, createdAt, updatedAt) SELECT id, userId, "general" as category, "Feedback" as subject, rating, message, "pending" as status, NULL as email, createdAt, updatedAt FROM Feedbacks')
      }
      
      await sequelize.query('DROP TABLE Feedbacks')
      await sequelize.query('ALTER TABLE Feedbacks_new RENAME TO Feedbacks')
      console.log('Feedback table migrated successfully')
    }

    await migrateFeedbackTable()
    
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
          duration: 60,
          teacherId: teacherId,
          isPremium: false,
          isLive: false,
          views: 0,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
      ])
      console.log('Sample lectures created')
    }

    server.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`)
      console.log(`✓ WebSocket server ready`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app
