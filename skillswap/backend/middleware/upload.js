const multer = require('multer')
const cloudinary = require('../config/cloudinary')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

// Configure Cloudinary storage for videos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillswap/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    transformation: [{ quality: 'auto' }],
    timeout: 600000, // 10 minutes timeout for cloudinary upload
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
})

module.exports = upload
