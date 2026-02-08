const Video = require('../models/Video')
const User = require('../models/User')
const TokenHistory = require('../models/TokenHistory')
const sequelize = require('../config/database')
const { Op } = require('sequelize')

// Get all videos with filters
exports.getAllVideos = async (req, res) => {
  try {
    const { skillTag, level, visibility, search, page = 1, limit = 12 } = req.query
    const offset = (page - 1) * limit

    let where = {}
    
    // Only show public videos to non-authenticated users
    if (!req.userId) {
      where.visibility = 'public'
    } else {
      // Authenticated users can see public and premium videos
      where.visibility = { [Op.in]: ['public', 'premium'] }
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

    // Increment view count
    await video.increment('views')

    res.json({ video })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching video', error: error.message })
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
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' })
    }

    const { title, description, skillTag, level, visibility, tokensRequired } = req.body

    if (!title || !skillTag) {
      return res.status(400).json({ message: 'Title and skill tag are required' })
    }

    // Cloudinary has already uploaded the file, we get the URL and metadata
    const videoUrl = req.file.path
    const cloudinaryPublicId = req.file.filename
    const duration = Math.round(req.file.resource_type === 'video' ? (req.file.duration || 0) : 0)

    // Create thumbnail URL from Cloudinary video
    const thumbnailUrl = videoUrl.replace('/upload/', '/upload/f_jpg,q_auto/')

    const video = await Video.create({
      uploaderId: req.userId,
      title,
      description: description || '',
      skillTag,
      level: level || 'Beginner',
      videoUrl,
      thumbnailUrl,
      duration,
      visibility: visibility || 'public',
      tokensRequired: parseInt(tokensRequired) || 0,
      cloudinaryPublicId,
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

    // Check authorization: only uploader or admin can update
    const user = await User.findByPk(req.userId)
    const isOwner = video.uploaderId === req.userId
    const isAdmin = user?.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own videos' })
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

    // Check authorization: only uploader or admin can delete
    const user = await User.findByPk(req.userId)
    const isOwner = video.uploaderId === req.userId
    const isAdmin = user?.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own videos' })
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

    res.json({ message: 'Video liked', likes: video.likes + 1 })
  } catch (error) {
    res.status(500).json({ message: 'Error liking video', error: error.message })
  }
}
