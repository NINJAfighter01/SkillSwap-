const Support = require('../models/Support')
const SupportMessage = require('../models/SupportMessage')
const User = require('../models/User')

// Advanced AI Support Engine (Like ChatGPT)
class AISupport {
  constructor() {
    // Knowledge base with comprehensive information
    this.knowledgeBase = {
      account: {
        keywords: ['login', 'password', 'account', 'reset', 'forgot', 'email', 'verification', 'sign', 'auth'],
        topics: ['password-reset', 'email-verification', 'account-recovery', 'login-troubleshoot'],
        responses: {
          'password-reset': `I can help you reset your password. Here's what to do:

**Simple Steps:**
1. Go to the login page
2. Click on "Forgot Password?" link
3. Enter the email address associated with your account
4. Check your email (including spam folder) for a password reset link
5. Click the link and create a new password
6. Return to login with your new password

**Didn't receive the email?**
- Check your spam/junk folder
- Make sure you entered the correct email
- Wait 2-3 minutes and try again
- Try refreshing the page

If you're still having trouble, please let me know the exact error message you see.`,
          'email-verification': `Let me help you with email verification:

**To Verify Your Email:**
1. Check the email inbox where you signed up
2. Look for verification email from SkillSwap
3. Check spam/junk folder if not in inbox
4. Click the verification link
5. You're verified! Return and refresh

**Email not arriving?**
- Resend verification email (check account settings)
- Some emails take 5-10 minutes
- Use the exact email you registered with
- Try a different email provider if issues persist`,
        },
      },
      payment: {
        keywords: ['payment', 'tokens', 'billing', 'transaction', 'refund', 'charge', 'wallet', 'balance'],
        topics: ['token-system', 'payment-failed', 'refund-request', 'token-usage'],
        responses: {
          'token-system': `Let me explain our token system:

**How to Earn Tokens:**
- Watch video lectures (1-5 tokens per video)
- Complete courses (10-50 tokens per course)
- Daily login streak (bonus tokens)
- Refer friends (100+ tokens)

**How to Use Tokens:**
- Unlock premium courses
- Get premium notes
- Access exclusive content
- Trade for discounts

**Pricing:**
- 1 Token = ₹1 value
- Bulk purchases available with discounts
- Tokens never expire

**Check Your Balance:**
- Visit your wallet dashboard
- All transactions are tracked in history
- Real-time balance updates

Would you like help earning more tokens or using them?`,
          'payment-failed': `Payment issues can be frustrating. Let's fix this:

**Common Reasons for Failed Payments:**
1. Insufficient funds in account
2. Card expired or blocked
3. Wrong CVV entered
4. Network connectivity issue
5. Server timeout

**What to Try:**
- Try again in 5-10 minutes (server might be busy)
- Use a different payment method
- Check card details are correct
- Ensure 3D Secure (OTP) is verified
- Try on your phone if on desktop (or vice versa)

**Still not working?**
Our support team will help! Contact us with:
- Transaction ID
- Error message you see
- Payment method used
- Exact amount attempted`,
        },
      },
      video: {
        keywords: ['video', 'streaming', 'playback', 'buffer', 'quality', 'freeze', 'lag', 'pause', 'play'],
        topics: ['video-troubleshoot', 'quality-settings', 'browser-support'],
        responses: {
          'video-troubleshoot': `Video playback issues? Let me help you fix them:

**Quick Fixes (Try These First):**
1. Refresh the page (F5 or Ctrl+R)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close other browser tabs
4. Restart your internet router
5. Update your browser to latest version

**If Still Having Issues:**
- **Buffering**: Lower video quality in settings
- **Freezing**: Check internet speed (need 2+ Mbps)
- **No Audio**: Check volume settings and browser permissions
- **Black Screen**: Disable browser extensions temporarily

**Try a Different Browser:**
- Chrome (Recommended) ✓
- Firefox ✓
- Safari ✓
- Edge ✓

**Still not working?** Your connection might be slow. Try on WiFi or check your internet speed.`,
          'quality-settings': `Need help with video quality settings?

**Available Quality Options:**
- 4K Ultra HD (requires fast connection)
- 1080p HD (recommended for most)
- 720p (good quality, less data)
- 480p (basic, minimal buffering)
- Auto (automatically adjusts)

**How to Change Quality:**
1. Click settings icon during playback
2. Select "Quality"
3. Choose your preferred resolution
4. Video will adjust automatically

**Data Usage Tips:**
- Use lower quality on mobile data
- 4K uses ~5GB/hour
- 1080p uses ~1-2GB/hour
- Lower settings save battery`,
        },
      },
      courses: {
        keywords: ['course', 'lecture', 'content', 'syllabus', 'curriculum', 'beginner', 'advanced'],
        topics: ['available-courses', 'course-difficulty', 'learning-path'],
        responses: {
          'available-courses': `Here's what you can learn on SkillSwap:

**Popular Courses:**

📌 **Web Development Basics** (45 min)
- HTML, CSS, JavaScript fundamentals
- Responsive design
- Great for beginners

⚛️ **React.js Mastery** (60 min)
- Components and Hooks
- State management
- Real projects

🚀 **Node.js Backend** (90 min)
- Express.js
- REST APIs
- Database integration

💾 **Database Design** (60 min)
- SQL fundamentals
- Query optimization
- Best practices

**Each Course Includes:**
✅ High-quality video lectures
✅ Interactive notes & code examples
✅ Progress tracking
✅ Token rewards for completion
✅ Certificates upon completion

**Ready to start learning?** Visit our "Explore Courses" section to browse all 50+ courses!`,
          'course-difficulty': `Let me help you find the right course level:

**Beginner Friendly:**
- No prior experience needed
- Step-by-step tutorials
- Covers basics and fundamentals
- Examples: HTML/CSS, Python Basics

**Intermediate:**
- Basic knowledge required
- Builds on fundamentals
- Real-world projects
- Examples: React, Node.js

**Advanced:**
- Strong foundation needed
- Deep dive into concepts
- Architecture & best practices
- Examples: System Design, Performance Optimization

**How to Choose:**
- Start with basics even if experienced
- Progress through intermediate when comfortable
- Jump to advanced once confident
- You can learn at your own pace

What's your current experience level?`,
        },
      },
      features: {
        keywords: ['note', 'progress', 'streak', 'dashboard', 'create', 'feature', 'track'],
        topics: ['interactive-notes', 'progress-tracking', 'daily-streak'],
        responses: {
          'interactive-notes': `Let me show you how to use Interactive Notes:

**Creating a Note:**
1. Go to "Interactive Notes" section
2. Click "Add New Note" button
3. Enter a topic name (e.g., "React Hooks")
4. Optionally link to a lecture
5. Write your notes using the rich text editor
6. Add attachments (screenshots, code files)
7. Click Save - it auto-syncs!

**Note Features:**
📝 Rich text formatting (bold, italic, etc.)
📎 Attach files and images
🔍 Search across all notes
📌 Pin important notes
🏷️ Tag and organize by topic
⏰ Auto-save every 10 seconds

**Pro Tips:**
- Link notes to lectures for better organization
- Use code blocks for programming notes
- Share notes with classmates
- Export notes as PDF

Start taking notes now to enhance your learning!`,
          'progress-tracking': `Everything you need to know about progress tracking:

**What We Track:**
- Video completion percentage
- Lecture progress status
- Your daily learning streak
- Total notes created
- Time spent learning
- Certificates earned

**Your Dashboard Shows:**
✅ Videos watched & percentage complete
✅ Lectures finished
✅ Current learning streak (🔥)
✅ Total learning time
✅ Performance analytics

**Maximize Your Stats:**
- Watch videos completely (100%)
- Keep daily streak going
- Create notes while learning
- Take quizzes when available
- Complete all course modules

**See Your Progress:**
Go to "Track Progress" → View all statistics, charts, and achievements!`,
        },
      },
      general: {
        keywords: [],
        topics: ['help', 'general', 'faq'],
        responses: {
          'help': `Hi! I'm your SkillSwap AI Assistant, available 24/7 to help you.

**What I can help with:**
🔐 Account & Login issues
💳 Payment & Tokens questions
🎥 Video & Streaming problems
📚 Course information
📊 Progress tracking
📝 Notes & learning tips
❓ General questions

**How to get the best answers:**
- Be specific about your problem
- Include error messages if any
- Tell me what you've already tried
- Mention which browser/device you're using

**Quick Links:**
- 📚 Explore Courses → Browse all content
- 📊 Track Progress → See your learning stats
- 💰 Token History → Check earnings
- ❓ FAQ → Common questions

Just type your question naturally, and I'll help! What would you like to know?`,
        },
      },
    }
  }

  // Extract intent from user message
  extractIntent(message) {
    const lowerMessage = message.toLowerCase()
    
    for (const [category, data] of Object.entries(this.knowledgeBase)) {
      for (const keyword of data.keywords) {
        if (lowerMessage.includes(keyword)) {
          return { category, topics: data.topics }
        }
      }
    }
    
    return { category: 'general', topics: ['help'] }
  }

  // Generate contextual response
  generateResponse(message, conversationHistory = []) {
    const intent = this.extractIntent(message)
    const category = this.knowledgeBase[intent.category]
    
    if (!category) {
      return this.getDefault()
    }

    // Select most relevant topic
    let selectedTopic = intent.topics[0]
    const lowerMessage = message.toLowerCase()
    
    for (const topic of intent.topics) {
      const topicKeywords = this.getTopicKeywords(topic)
      if (topicKeywords.some(kw => lowerMessage.includes(kw))) {
        selectedTopic = topic
        break
      }
    }

    const response = category.responses[selectedTopic] || this.getDefault()
    return this.formatResponse(response, message)
  }

  getTopicKeywords(topic) {
    const keywords = {
      'password-reset': ['password', 'reset', 'forgot', 'recover'],
      'email-verification': ['email', 'verify', 'verification'],
      'token-system': ['token', 'earn', 'pricing', 'how', 'work'],
      'payment-failed': ['failed', 'error', 'declined', 'issue'],
      'video-troubleshoot': ['buffer', 'freeze', 'lag', 'not', 'problem'],
      'quality-settings': ['quality', 'resolution', 'hd', '4k', 'sd'],
      'available-courses': ['course', 'learn', 'what', 'available', 'browse'],
      'interactive-notes': ['note', 'create', 'write', 'save'],
      'progress-tracking': ['progress', 'track', 'stats', 'completed'],
    }
    return keywords[topic] || []
  }

  formatResponse(response, userMessage) {
    const empathy = this.getEmpathyResponse(userMessage)
    return `${empathy}\n\n${response}`
  }

  getEmpathyResponse(message) {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('error')) {
      return "I understand! Let me help you solve this. 🔧"
    }
    if (lowerMessage.includes('how') || lowerMessage.includes('?')) {
      return "Great question! Here's what you need to know: 💡"
    }
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! Happy to help! 😊"
    }
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      return "Hello there! 👋 How can I assist you today?"
    }
    
    return "Let me help you with that! 📋"
  }

  getDefault() {
    return `I'm not quite sure about that one. Let me break down what I can help with:

**Common Topics:**
- 🔐 Account & Login help
- 💳 Payment & Tokens
- 🎥 Video & Streaming
- 📚 Courses & Learning
- 📝 Notes & Organization
- 📊 Progress & Achievement

Try asking about any of these topics, or provide more details about your question. I'm here to help! ✨`
  }
}

const aiEngine = new AISupport()

// Create new support ticket
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, category, priority, description } = req.body

    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const support = await Support.create({
      userId: req.userId,
      ticketId,
      subject,
      category,
      priority,
      description,
      status: 'open',
    })

    // Create initial user message
    await SupportMessage.create({
      supportId: support.id,
      senderId: req.userId,
      senderType: 'user',
      message: description,
      isAIGenerated: false,
    })

    const io = req.app.get('io')

    // Emit typing indicator
    if (io) {
      io.to(`support:${support.id}`).emit('support:typing', {
        supportId: support.id,
        isTyping: true,
      })
    }

    // Generate advanced AI response
    setTimeout(async () => {
      const aiResponse = aiEngine.generateResponse(description)
      
      await SupportMessage.create({
        supportId: support.id,
        senderId: req.userId,
        senderType: 'ai',
        message: aiResponse,
        isAIGenerated: true,
      })

      // Stop typing indicator
      if (io) {
        io.to(`support:${support.id}`).emit('support:typing', {
          supportId: support.id,
          isTyping: false,
        })
      }

      // Emit real-time AI response
      if (io) {
        io.to(`support:${support.id}`).emit('support:aiResponse', {
          supportId: support.id,
          message: {
            id: Math.random(),
            supportId: support.id,
            senderId: req.userId,
            senderType: 'ai',
            message: aiResponse,
            isAIGenerated: true,
            createdAt: new Date(),
          },
        })
      }
    }, 300)

    if (io) {
      io.to(`user:${req.userId}`).emit('support:ticketCreated', support)
    }

    res.status(201).json({
      message: 'Support ticket created successfully',
      support,
      ticketId,
    })
  } catch (error) {
    next(error)
  }
}

// Send message in support ticket
exports.sendMessage = async (req, res, next) => {
  try {
    const { supportId, message } = req.body

    const support = await Support.findByPk(supportId)
    if (!support) {
      return res.status(404).json({ message: 'Support ticket not found' })
    }

    if (support.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Create user message
    const userMessage = await SupportMessage.create({
      supportId,
      senderId: req.userId,
      senderType: 'user',
      message,
      isAIGenerated: false,
    })

    const io = req.app.get('io')

    // Emit user message real-time
    if (io) {
      io.to(`support:${supportId}`).emit('support:newMessage', userMessage)
    }

    // Emit typing indicator
    if (io) {
      io.to(`support:${supportId}`).emit('support:typing', {
        supportId,
        isTyping: true,
      })
    }

    // Generate advanced AI response with realistic delay
    const responseDelay = 300 + Math.random() * 1500
    setTimeout(async () => {
      const conversationHistory = await SupportMessage.findAll({
        where: { supportId },
        order: [['createdAt', 'ASC']],
        limit: 10,
      })

      const aiResponse = aiEngine.generateResponse(message, conversationHistory)
      
      const aiMessage = await SupportMessage.create({
        supportId,
        senderId: req.userId,
        senderType: 'ai',
        message: aiResponse,
        isAIGenerated: true,
      })

      // Stop typing indicator
      if (io) {
        io.to(`support:${supportId}`).emit('support:typing', {
          supportId,
          isTyping: false,
        })
      }

      // Emit AI response real-time
      if (io) {
        io.to(`support:${supportId}`).emit('support:aiResponse', aiMessage)
      }
    }, responseDelay)

    res.status(201).json({
      message: 'Message sent successfully',
      userMessage,
    })
  } catch (error) {
    next(error)
  }
}

// Get all support tickets for user
exports.getUserTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query

    let whereClause = { userId: req.userId }
    if (status !== 'all') {
      whereClause.status = status
    }

    const { count, rows } = await Support.findAndCountAll({
      where: whereClause,
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: SupportMessage,
          attributes: ['id', 'message', 'senderType', 'isAIGenerated', 'createdAt'],
          limit: 1,
          order: [['createdAt', 'DESC']],
        },
      ],
    })

    res.json({
      tickets: rows,
      total: count,
      pages: Math.ceil(count / limit),
    })
  } catch (error) {
    next(error)
  }
}

// Get support ticket details with all messages
exports.getTicketDetails = async (req, res, next) => {
  try {
    const { ticketId } = req.params

    const support = await Support.findOne({
      where: { ticketId },
      include: [
        {
          model: SupportMessage,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'profilePicture'],
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    })

    if (!support) {
      return res.status(404).json({ message: 'Support ticket not found' })
    }

    if (support.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    res.json(support)
  } catch (error) {
    next(error)
  }
}

// Close ticket
exports.closeTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params
    const { resolution } = req.body

    const support = await Support.findOne({ where: { ticketId } })
    if (!support) {
      return res.status(404).json({ message: 'Support ticket not found' })
    }

    if (support.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    support.status = 'closed'
    support.resolution = resolution
    support.resolvedAt = new Date()
    await support.save()

    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(`support:${support.id}`).emit('support:ticketClosed', support)
    }

    res.json({
      message: 'Ticket closed successfully',
      support,
    })
  } catch (error) {
    next(error)
  }
}

// Reopen ticket
exports.reopenTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params

    const support = await Support.findOne({ where: { ticketId } })
    if (!support) {
      return res.status(404).json({ message: 'Support ticket not found' })
    }

    if (support.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    support.status = 'open'
    support.resolvedAt = null
    support.resolution = null
    await support.save()

    if (req.app.get('io')) {
      req.app.get('io').to(`support:${support.id}`).emit('support:ticketReopened', support)
    }

    res.json({
      message: 'Ticket reopened successfully',
      support,
    })
  } catch (error) {
    next(error)
  }
}

// Get support stats for dashboard
exports.getSupportStats = async (req, res, next) => {
  try {
    const totalTickets = await Support.count({ where: { userId: req.userId } })
    const openTickets = await Support.count({ where: { userId: req.userId, status: 'open' } })
    const closedTickets = await Support.count({ where: { userId: req.userId, status: 'closed' } })

    res.json({
      total: totalTickets,
      open: openTickets,
      closed: closedTickets,
    })
  } catch (error) {
    next(error)
  }
}
