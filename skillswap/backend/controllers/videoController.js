const Video = require('../models/Video')
const User = require('../models/User')
const TokenHistory = require('../models/TokenHistory')
const VideoComment = require('../models/VideoComment')
const VideoReport = require('../models/VideoReport')
const VideoNote = require('../models/VideoNote')
const Note = require('../models/Note')
const Session = require('../models/Session')
const sequelize = require('../config/database')
const { Op } = require('sequelize')

const toPublicUploadUrl = (req, filePath) => {
  if (!filePath) return null
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }

  const normalizedPath = filePath.replace(/\\/g, '/')
  const marker = '/uploads/'
  const markerIndex = normalizedPath.lastIndexOf(marker)
  if (markerIndex === -1) return filePath

  const relativeUploadPath = normalizedPath.slice(markerIndex)
  return `${req.protocol}://${req.get('host')}${relativeUploadPath}`
}

// Prevent accidental duplicate view increments from rapid duplicate requests
const viewIncrementTracker = new Map()
const VIEW_INCREMENT_COOLDOWN_MS = 15000

const emitDashboardRefresh = (req, uploaderId) => {
  const io = req.app.get('io')
  if (!io || !uploaderId) return
  io.to(`user:${uploaderId}`).emit('dashboard:refresh', {
    uploaderId,
    timestamp: new Date().toISOString(),
  })
}

// Get all videos with filters
exports.getAllVideos = async (req, res) => {
  try {
    const { skillTag, level, visibility, search, page = 1, limit = 12 } = req.query
    const offset = (page - 1) * limit

    let where = {}
    
    // Visibility access control
    if (!req.userId) {
      // Guests can only see public videos
      where.visibility = 'public'
    } else {
      const requestingUser = await User.findByPk(req.userId, {
        attributes: ['id', 'role'],
      })

      const isPrivilegedUser = requestingUser?.role === 'admin' || requestingUser?.role === 'developer'

      if (!isPrivilegedUser) {
        // Normal authenticated users can see public and premium videos
        where.visibility = { [Op.in]: ['public', 'premium'] }
      }
    }

    if (skillTag) where.skillTag = skillTag
    if (level) where.level = level
    if (visibility && req.userId) where.visibility = visibility
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ]
    }

    const videos = await Video.findAll({
      where,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'profilePicture', 'isTeacher'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    })

    const total = await Video.count({ where })

    res.json({
      videos,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message })
  }
}

// Get single video by ID
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params

    const video = await Video.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'profilePicture', 'bio', 'isTeacher'],
        },
      ],
    })

    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
    const viewerKey = req.userId ? `user:${req.userId}` : `guest:${clientIp}`
    const viewKey = `${viewerKey}:video:${id}`
    const now = Date.now()
    const lastIncrementAt = viewIncrementTracker.get(viewKey) || 0

    if (now - lastIncrementAt > VIEW_INCREMENT_COOLDOWN_MS) {
      await video.increment('views')
      viewIncrementTracker.set(viewKey, now)
      emitDashboardRefresh(req, video.uploaderId)
    }

    res.json({ video })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching video', error: error.message })
  }
}

// Dashboard analytics for current user videos
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const uploadedVideos = await Video.findAll({
      where: { uploaderId: req.userId },
      attributes: ['id', 'title', 'views', 'likes', 'location', 'createdAt'],
      order: [['createdAt', 'DESC']],
    })

    const videoIds = uploadedVideos.map((video) => video.id)

    const totalViews = uploadedVideos.reduce((sum, video) => sum + (video.views || 0), 0)
    const totalLikes = uploadedVideos.reduce((sum, video) => sum + (video.likes || 0), 0)

    let totalComments = 0
    if (videoIds.length > 0) {
      totalComments = await VideoComment.count({
        where: { videoId: { [Op.in]: videoIds } },
      })
    }

    const swapRequests = await Session.count({
      where: {
        mentorId: req.userId,
        status: 'Pending',
      },
    })

    const locationMap = {}
    uploadedVideos.forEach((video) => {
      const location = video.location || 'Unknown'
      if (!locationMap[location]) {
        locationMap[location] = 0
      }
      locationMap[location] += video.views || 0
    })

    const locationWiseViewers = Object.entries(locationMap)
      .map(([location, viewers]) => ({ location, viewers }))
      .sort((a, b) => b.viewers - a.viewers)

    const topVideos = uploadedVideos
      .map((video) => ({
        id: video.id,
        title: video.title,
        views: video.views || 0,
        likes: video.likes || 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8)

    res.json({
      totals: {
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        swapRequests,
      },
      locationWiseViewers,
      topVideos,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard analytics', error: error.message })
  }
}

// Get videos uploaded by current user
exports.getMyVideos = async (req, res) => {
  try {
    const videos = await Video.findAll({
      where: { uploaderId: req.userId },
      order: [['createdAt', 'DESC']],
    })

    res.json({ videos })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your videos', error: error.message })
  }
}

// Watch premium video and transfer tokens
exports.watchVideo = async (req, res) => {
  try {
    const { id } = req.params

    const video = await Video.findByPk(id)
    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    if (video.visibility !== 'premium' || !video.tokensRequired || video.tokensRequired <= 0) {
      return res.json({ message: 'Free video', tokensDeducted: 0 })
    }

    if (Number(video.uploaderId) === Number(req.userId)) {
      return res.json({ message: 'Uploader watching own video', tokensDeducted: 0 })
    }

    const viewer = await User.findByPk(req.userId)
    if (!viewer) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (viewer.tokens < video.tokensRequired) {
      return res.status(400).json({ message: 'Insufficient tokens' })
    }

    const uploader = await User.findByPk(video.uploaderId)
    if (!uploader) {
      return res.status(404).json({ message: 'Uploader not found' })
    }

    await sequelize.transaction(async (transaction) => {
      viewer.tokens -= video.tokensRequired
      await viewer.save({ transaction })

      uploader.tokens += video.tokensRequired
      await uploader.save({ transaction })

      await TokenHistory.create({
        userId: req.userId,
        type: 'spent',
        amount: video.tokensRequired,
        reason: `Watched premium video: ${video.title}`,
        relatedId: video.id,
      }, { transaction })

      await TokenHistory.create({
        userId: video.uploaderId,
        type: 'earned',
        amount: video.tokensRequired,
        reason: `Tokens from premium video view: ${video.title}`,
        relatedId: video.id,
      }, { transaction })
    })

    res.json({
      message: 'Video watched successfully',
      tokensDeducted: video.tokensRequired,
      viewerTokens: viewer.tokens,
      uploaderTokens: uploader.tokens,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error watching video', error: error.message })
  }
}

// Create video (metadata only - actual upload handled separately)
exports.createVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      skillTag,
      level,
      videoUrl,
      thumbnailUrl,
      duration,
      visibility,
      tokensRequired,
      cloudinaryPublicId,
    } = req.body

      if (!title || !skillTag || !videoUrl) {
        console.error('Video create failed: Missing field', { title, skillTag, videoUrl })
      return res.status(400).json({ message: 'Title, skill tag, and video URL are required' })
    }

    const video = await Video.create({
      uploaderId: req.userId,
      title,
      description,
      skillTag,
      level: level || 'Beginner',
      videoUrl,
      thumbnailUrl,
      duration: duration || 0,
      visibility: visibility || 'public',
      tokensRequired: tokensRequired || 0,
      cloudinaryPublicId,
    })

    // Broadcast new video to all connected users via WebSocket
    if (req.io) {
      req.io.emit('video:new', {
        video: {
          ...video.toJSON(),
          uploader: {
            id: req.user?.id,
            name: req.user?.name,
            profilePicture: req.user?.profilePicture,
          },
        },
      })
    }

    res.status(201).json({
      message: 'Video created successfully',
      video,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error creating video', error: error.message })
  }
}

// Upload video to Cloudinary
exports.uploadVideo = async (req, res) => {
  try {
    const videoFile = req.files?.video?.[0]
    const thumbnailFile = req.files?.thumbnail?.[0]

    if (!videoFile) {
      return res.status(400).json({ message: 'No video file uploaded' })
    }

    const {
      title,
      description,
      category,
      skillType,
      level,
      location,
      tags,
      duration,
      visibility,
      tokensRequired,
      allowComments,
      wantSkillInReturn,
    } = req.body

    if (!title || !category || !videoFile || !videoFile.path) {
      console.error('Video upload failed: Missing field', { title, category, file: videoFile })
      return res.status(400).json({ message: 'Title and category are required' })
    }

    // Cloudinary or local disk URL and metadata
    const videoUrl = toPublicUploadUrl(req, videoFile.path)
    const cloudinaryPublicId =
      videoFile.path && (videoFile.path.startsWith('http://') || videoFile.path.startsWith('https://'))
        ? videoFile.filename
        : null
    const videoDuration = parseInt(duration) || Math.round(videoFile.resource_type === 'video' ? (videoFile.duration || 0) : 0)

    // Use custom thumbnail if uploaded, else create thumbnail URL from video (Cloudinary only)
    const thumbnailUrl = thumbnailFile?.path
      ? toPublicUploadUrl(req, thumbnailFile.path)
      : (videoUrl && videoUrl.includes('/upload/') ? videoUrl.replace('/upload/', '/upload/f_jpg,q_auto/') : null)

    // Parse tags if it's a string
    let parsedTags = []
    try {
      parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : []
    } catch (e) {
      parsedTags = []
    }

    const video = await Video.create({
      uploaderId: req.userId,
      title,
      description: description || '',
      skillTag: category, // Use category as skillTag for backward compatibility
      category: category || 'Programming',
      skillType: skillType || 'Offer',
      location: location || 'Online',
      tags: parsedTags,
      level: level || 'Beginner',
      videoUrl,
      thumbnailUrl,
      duration: videoDuration,
      visibility: visibility || 'public',
      tokensRequired: parseInt(tokensRequired) || 0,
      cloudinaryPublicId,
      allowComments: allowComments !== 'false', // Handle string to boolean
      wantSkillInReturn: wantSkillInReturn === 'true', // Handle string to boolean
    })

    // Get uploader info
    const uploader = await User.findByPk(req.userId, {
      attributes: ['id', 'name', 'profilePicture', 'isTeacher'],
    })

    // Broadcast new video to all connected users (only for public videos)
    if (video.visibility === 'public') {
      const io = req.app.get('io')
      if (io) {
        io.emit('video:new', {
          video: {
            ...video.toJSON(),
            uploader: uploader.toJSON(),
          },
        })
      }
    }

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        ...video.toJSON(),
        uploader: uploader.toJSON(),
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Error uploading video', error: error.message })
  }
}

// Update video
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params
    const video = await Video.findByPk(id)

    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    // Check authorization: owner OR admin can update
    const user = await User.findByPk(req.userId)
    const isAdmin = user?.role === 'admin'
    const isOwner = Number(video.uploaderId) === Number(req.userId)

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only video owner or admin can update videos' })
    }

    const { title, description, skillTag, level, thumbnailUrl, visibility, tokensRequired } = req.body

    await video.update({
      title: title || video.title,
      description: description !== undefined ? description : video.description,
      skillTag: skillTag || video.skillTag,
      level: level || video.level,
      thumbnailUrl: thumbnailUrl || video.thumbnailUrl,
      visibility: visibility || video.visibility,
      tokensRequired: tokensRequired !== undefined ? tokensRequired : video.tokensRequired,
    })

    // Broadcast update via WebSocket
    if (req.io) {
      req.io.emit('video:updated', { videoId: id, video })
    }

    res.json({
      message: 'Video updated successfully',
      video,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error updating video', error: error.message })
  }
}

// Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params
    const video = await Video.findByPk(id)

    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    // Check authorization: owner OR admin can delete
    const user = await User.findByPk(req.userId)
    const isAdmin = user?.role === 'admin'
    const isOwner = Number(video.uploaderId) === Number(req.userId)

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only video owner or admin can delete videos' })
    }

    // TODO: Delete from Cloudinary using cloudinaryPublicId
    // const cloudinary = require('../config/cloudinary')
    // if (video.cloudinaryPublicId) {
    //   await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' })
    // }

    await video.destroy()

    // Broadcast delete via WebSocket
    if (req.io) {
      req.io.emit('video:deleted', { videoId: id })
    }

    res.json({ message: 'Video deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting video', error: error.message })
  }
}

// Like video
exports.likeVideo = async (req, res) => {
  try {
    const { id } = req.params
    const video = await Video.findByPk(id)

    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    await video.increment('likes')
    emitDashboardRefresh(req, video.uploaderId)

    res.json({ message: 'Video liked', likes: video.likes + 1 })
  } catch (error) {
    res.status(500).json({ message: 'Error liking video', error: error.message })
  }
}

// Get comments for a video
exports.getVideoComments = async (req, res) => {
  try {
    const { id } = req.params
    const comments = await VideoComment.findAll({
      where: { videoId: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    res.json({ comments })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message })
  }
}

// Add comment to a video
exports.addVideoComment = async (req, res) => {
  try {
    const { id } = req.params
    const { comment } = req.body

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' })
    }

    const video = await Video.findByPk(id)
    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    if (video.allowComments === false) {
      return res.status(403).json({ message: 'Comments are disabled for this video' })
    }

    const created = await VideoComment.create({
      videoId: id,
      userId: req.userId,
      comment: comment.trim(),
    })

    const createdWithUser = await VideoComment.findByPk(created.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profilePicture'],
        },
      ],
    })

    emitDashboardRefresh(req, video.uploaderId)

    res.status(201).json({ message: 'Comment added', comment: createdWithUser })
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message })
  }
}

// Report a video
exports.reportVideo = async (req, res) => {
  try {
    const { id } = req.params
    const { reason, details } = req.body

    const video = await Video.findByPk(id)
    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    await VideoReport.create({
      videoId: id,
      userId: req.userId,
      reason: reason || 'Other',
      details: details || '',
    })

    emitDashboardRefresh(req, video.uploaderId)

    res.status(201).json({ message: 'Report submitted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error reporting video', error: error.message })
  }
}

// Get uploaded notes for a video
exports.getVideoNotes = async (req, res) => {
  try {
    const { id } = req.params

    const notes = await VideoNote.findAll({
      where: { videoId: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    res.json({ notes })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching video notes', error: error.message })
  }
}

// Upload note file/text for a video
exports.addVideoNote = async (req, res) => {
  try {
    const { id } = req.params
    const { title, noteText } = req.body

    const video = await Video.findByPk(id)
    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Note title is required' })
    }

    const noteUrl = req.file ? `/uploads/video-notes/${req.file.filename}` : null
    const noteFileName = req.file ? req.file.originalname : null

    if (!noteUrl && (!noteText || !noteText.trim())) {
      return res.status(400).json({ message: 'Upload a note file or provide note text' })
    }

    const created = await VideoNote.create({
      videoId: id,
      userId: req.userId,
      title: title.trim(),
      noteUrl,
      noteFileName,
      noteText: noteText || '',
    })

    const interactiveContent = noteText && noteText.trim()
      ? noteText.trim()
      : noteUrl
        ? `Video note uploaded: ${noteFileName || 'Attachment'}\n\nFile: ${noteUrl}`
        : `Video note: ${title.trim()}`

    await Note.create({
      userId: req.userId,
      lectureId: null,
      topicName: `Video Note • ${video.title || 'Untitled Video'} • ${title.trim()}`,
      content: interactiveContent,
      files: [],
    })

    const io = req.app.get('io')
    if (io) {
      io.to(`user:${req.userId}`).emit('notes:updated', {
        action: 'create',
        source: 'video',
        videoId: id,
      })
    }

    const createdWithUser = await VideoNote.findByPk(created.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profilePicture'],
        },
      ],
    })

    res.status(201).json({ message: 'Video note uploaded successfully', note: createdWithUser })
  } catch (error) {
    res.status(500).json({ message: 'Error uploading video note', error: error.message })
  }
}
