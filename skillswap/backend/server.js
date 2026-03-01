require('dotenv').config({ path: require('path').resolve(__dirname, '.env') })
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const path = require('path')
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
const inviteRoutes = require('./routes/inviteRoutes')

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
const VideoComment = require('./models/VideoComment')
const VideoReport = require('./models/VideoReport')
const VideoNote = require('./models/VideoNote')
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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
app.use('/api/invitations', inviteRoutes)

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

    Video.hasMany(VideoComment, { foreignKey: 'videoId', as: 'comments' })
    VideoComment.belongsTo(Video, { foreignKey: 'videoId' })
    User.hasMany(VideoComment, { foreignKey: 'userId' })
    VideoComment.belongsTo(User, { foreignKey: 'userId', as: 'user' })

    Video.hasMany(VideoReport, { foreignKey: 'videoId', as: 'reports' })
    VideoReport.belongsTo(Video, { foreignKey: 'videoId' })
    User.hasMany(VideoReport, { foreignKey: 'userId' })
    VideoReport.belongsTo(User, { foreignKey: 'userId', as: 'user' })

    Video.hasMany(VideoNote, { foreignKey: 'videoId', as: 'notes' })
    VideoNote.belongsTo(Video, { foreignKey: 'videoId' })
    User.hasMany(VideoNote, { foreignKey: 'userId' })
    VideoNote.belongsTo(User, { foreignKey: 'userId', as: 'user' })

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
      const hasTags = columns.some((col) => col.name === 'tags')
      const hasFolder = columns.some((col) => col.name === 'folder')
      const hasIsPinned = columns.some((col) => col.name === 'isPinned')
      const hasIsShared = columns.some((col) => col.name === 'isShared')
      const lectureColumn = columns.find((col) => col.name === 'lectureId')
      const lectureNotNull = lectureColumn ? lectureColumn.notnull === 1 : false

      if (!hasTopicName && !lectureNotNull) {
        await sequelize.query('ALTER TABLE Notes ADD COLUMN topicName TEXT')
      }

      if (!hasTags) {
        await sequelize.query("ALTER TABLE Notes ADD COLUMN tags TEXT DEFAULT '[]'")
      }

      if (!hasFolder) {
        await sequelize.query("ALTER TABLE Notes ADD COLUMN folder TEXT DEFAULT 'General'")
      }

      if (!hasIsPinned) {
        await sequelize.query('ALTER TABLE Notes ADD COLUMN isPinned BOOLEAN DEFAULT 0')
      }

      if (!hasIsShared) {
        await sequelize.query('ALTER TABLE Notes ADD COLUMN isShared BOOLEAN DEFAULT 0')
      }

      if (!lectureNotNull && hasTopicName) return

      await sequelize.query('CREATE TABLE IF NOT EXISTS Notes_new (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, topicName TEXT, lectureId INTEGER, userId INTEGER NOT NULL, files TEXT, tags TEXT DEFAULT "[]", folder TEXT DEFAULT "General", isPinned BOOLEAN DEFAULT 0, isShared BOOLEAN DEFAULT 0, createdAt DATETIME, updatedAt DATETIME, FOREIGN KEY(lectureId) REFERENCES Lectures(id), FOREIGN KEY(userId) REFERENCES Users(id))')
      if (hasTopicName) {
        await sequelize.query('INSERT INTO Notes_new (id, content, topicName, lectureId, userId, files, tags, folder, isPinned, isShared, createdAt, updatedAt) SELECT id, content, topicName, lectureId, userId, files, COALESCE(tags, "[]"), COALESCE(folder, "General"), COALESCE(isPinned, 0), COALESCE(isShared, 0), createdAt, updatedAt FROM Notes')
      } else {
        await sequelize.query('INSERT INTO Notes_new (id, content, topicName, lectureId, userId, files, tags, folder, isPinned, isShared, createdAt, updatedAt) SELECT id, content, NULL as topicName, lectureId, userId, files, COALESCE(tags, "[]"), COALESCE(folder, "General"), COALESCE(isPinned, 0), COALESCE(isShared, 0), createdAt, updatedAt FROM Notes')
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

    // Migrate Users table to include role and location columns
    const migrateUsersTable = async () => {
      const [columns] = await sequelize.query("PRAGMA table_info('Users')")
      if (!columns || columns.length === 0) return

      const hasRole = columns.some((col) => col.name === 'role')
      const hasLocation = columns.some((col) => col.name === 'location')

      if (hasRole && hasLocation) return

      if (!hasRole) {
        console.log('Migrating Users table: adding role column...')
        await sequelize.query("ALTER TABLE Users ADD COLUMN role TEXT DEFAULT 'user'")
        await sequelize.query("UPDATE Users SET role = 'user' WHERE role IS NULL OR role = ''")
      }

      if (!hasLocation) {
        console.log('Migrating Users table: adding location column...')
        await sequelize.query("ALTER TABLE Users ADD COLUMN location TEXT DEFAULT 'Mumbai, India'")
        await sequelize.query("UPDATE Users SET location = 'Mumbai, India' WHERE location IS NULL OR location = ''")
      }

      console.log('Users table migrated successfully')
    }

    await migrateUsersTable()

    // Migrate Videos table to include lectureId (required by Lecture-Video association)
    const migrateVideosTable = async () => {
      const [columns] = await sequelize.query("PRAGMA table_info('Videos')")
      if (!columns || columns.length === 0) return

      const hasLectureId = columns.some((col) => col.name === 'lectureId')
      if (hasLectureId) {
        // Table already has lectureId, check for new columns
        const newColumns = [
          'category',
          'skillType',
          'location',
          'tags',
          'allowComments',
          'wantSkillInReturn'
        ]
        
        for (const col of newColumns) {
          const hasColumn = columns.some((c) => c.name === col)
          if (!hasColumn) {
            console.log(`Adding column ${col} to Videos table...`)
            if (col === 'tags') {
              await sequelize.query(`ALTER TABLE Videos ADD COLUMN ${col} JSON DEFAULT '[]'`)
            } else if (col === 'allowComments' || col === 'wantSkillInReturn') {
              await sequelize.query(`ALTER TABLE Videos ADD COLUMN ${col} BOOLEAN DEFAULT 1`)
            } else {
              await sequelize.query(`ALTER TABLE Videos ADD COLUMN ${col} TEXT`)
            }
          }
        }
        return
      }

      console.log('Migrating Videos table: adding lectureId column...')
      await sequelize.query('ALTER TABLE Videos ADD COLUMN lectureId INTEGER')
      
      // Also add new columns during initial migration
      const newColumns = [
        'category',
        'skillType',
        'location',
        'tags',
        'allowComments',
        'wantSkillInReturn'
      ]
      
      for (const col of newColumns) {
        console.log(`Adding column ${col} to Videos table...`)
        if (col === 'tags') {
          await sequelize.query(`ALTER TABLE Videos ADD COLUMN ${col} JSON DEFAULT '[]'`)
        } else if (col === 'allowComments' || col === 'wantSkillInReturn') {
          await sequelize.query(`ALTER TABLE Videos ADD COLUMN ${col} BOOLEAN DEFAULT 1`)
        } else {
          await sequelize.query(`ALTER TABLE Videos ADD COLUMN ${col} TEXT`)
        }
      }
      
      console.log('Videos table migrated successfully')
    }

    await migrateVideosTable()
    
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
          videoUrl: '/video/motivational-quote.3840x2160.mp4',

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
          videoUrl: '/video/motivational-quote.3840x2160.mp4',
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
          videoUrl: '/video/motivational-quote.3840x2160.mp4',
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
          videoUrl: '/video/motivational-quote.3840x2160.mp4'
          ,
        },
      ])
      console.log('Sample lectures created')
    }

    server.on('error', (listenError) => {
      if (listenError.code === 'EADDRINUSE') {
        console.log(`⚠ Port ${PORT} is already in use.`)
        console.log('⚠ Backend is likely already running on this port.')
        process.exit(0)
      }

      console.error('Error starting server:', listenError)
      process.exit(1)
    })

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
