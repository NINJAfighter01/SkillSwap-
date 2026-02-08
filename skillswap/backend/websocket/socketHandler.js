const jwt = require('jsonwebtoken')

const userSockets = new Map() // userId -> socket.id mapping

const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      next()
    } catch (error) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected via WebSocket`)
    
    // Store user-socket mapping
    userSockets.set(socket.userId, socket.id)
    
    // Join user to their personal room
    socket.join(`user:${socket.userId}`)

    // Handle token updates from client
    socket.on('token:update', (data) => {
      console.log(`Token update for user ${socket.userId}:`, data)
      // Broadcast to all connected clients of this user (multiple tabs)
      io.to(`user:${socket.userId}`).emit('token:updated', data)
    })

    // Handle activity log updates
    socket.on('activity:update', (data) => {
      console.log(`Activity update for user ${socket.userId}:`, data)
      io.to(`user:${socket.userId}`).emit('activity:updated', data)
    })

    // Handle course enrollment (token deduction)
    socket.on('course:enroll', async (data) => {
      const { courseId, tokensRequired } = data
      console.log(`User ${socket.userId} enrolling in course ${courseId}`)
      
      try {
        const User = require('../models/User')
        const user = await User.findByPk(socket.userId)
        
        if (!user) {
          socket.emit('course:enroll:error', { message: 'User not found' })
          return
        }

        if (user.tokens < tokensRequired) {
          socket.emit('course:enroll:error', { message: 'Insufficient tokens' })
          return
        }

        // Deduct tokens
        await user.update({ tokens: user.tokens - tokensRequired })

        // Broadcast token update to all user's connections
        io.to(`user:${socket.userId}`).emit('token:updated', {
          tokens: user.tokens,
          delta: -tokensRequired,
          reason: 'course_enrollment',
          courseId
        })

        socket.emit('course:enroll:success', {
          tokens: user.tokens,
          courseId
        })
      } catch (error) {
        console.error('Course enrollment error:', error)
        socket.emit('course:enroll:error', { message: 'Enrollment failed' })
      }
    })

    // Handle course completion (activity logging)
    socket.on('course:complete', async (data) => {
      const { courseId, timeSpent, tokensEarned = 0 } = data
      console.log(`User ${socket.userId} completed course ${courseId}`)

      try {
        const User = require('../models/User')
        const user = await User.findByPk(socket.userId)

        if (user && tokensEarned > 0) {
          await user.update({ 
            tokens: user.tokens + tokensEarned,
            lecturesCompleted: user.lecturesCompleted + 1,
            totalHours: user.totalHours + timeSpent
          })

          // Broadcast token update
          io.to(`user:${socket.userId}`).emit('token:updated', {
            tokens: user.tokens,
            delta: tokensEarned,
            reason: 'course_completion',
            courseId
          })
        }

        // Broadcast activity update
        io.to(`user:${socket.userId}`).emit('activity:updated', {
          type: 'course_completion',
          courseId,
          timeSpent,
          tokensEarned,
          timestamp: new Date()
        })

        socket.emit('course:complete:success', { message: 'Course completion logged' })
      } catch (error) {
        console.error('Course completion error:', error)
        socket.emit('course:complete:error', { message: 'Failed to log completion' })
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`)
      userSockets.delete(socket.userId)
    })
  })

  return io
}

// Helper function to emit to specific user
const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data)
}

module.exports = { socketHandler, emitToUser }
