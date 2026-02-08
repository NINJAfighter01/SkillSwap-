import React, { useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import videoService from '../services/videoService'

const VideoUpload = () => {
  const { isDark } = useContext(ThemeContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillTag: '',
    level: 'Beginner',
    visibility: 'public',
    tokensRequired: 0,
  })

  const [videoFile, setVideoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid video file (MP4, WebM, OGG, MOV)')
      return
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size must be less than 100MB')
      return
    }

    setVideoFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!videoFile) {
      alert('Please select a video file')
      return
    }

    if (!formData.title || !formData.skillTag) {
      alert('Please fill in all required fields')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('video', videoFile)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('skillTag', formData.skillTag)
      formDataToSend.append('level', formData.level)
      formDataToSend.append('visibility', formData.visibility)
      formDataToSend.append('tokensRequired', formData.tokensRequired)

      console.log('Starting video upload...');
      console.log('File size:', (videoFile.size / (1024 * 1024)).toFixed(2), 'MB');

      const response = await videoService.uploadVideo(formDataToSend, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(progress)
        console.log('Upload progress:', progress + '%');
      })

      console.log('Upload successful!', response.data);
      alert('Video uploaded successfully!')
      navigate('/videos')
    } catch (error) {
      console.error('Upload error:', error)
      
      let errorMessage = 'Failed to upload video'
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Upload timeout - Video is too large or internet is slow. Please try a smaller video.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  // Check if user is teacher
  if (!user?.isTeacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">Only teachers can upload videos</p>
          <button
            onClick={() => navigate('/videos')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Browse Videos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Upload Teaching Video</h1>
          <p className="text-gray-400">Share your knowledge with the SkillSwap community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            } ${videoFile ? 'border-green-500' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-96 rounded-lg mx-auto"
                />
                <p className="text-sm text-green-400">✓ {videoFile.name}</p>
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null)
                    setPreviewUrl(null)
                  }}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove Video
                </button>
              </div>
            ) : (
              <>
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-xl font-bold mb-2">Drag & Drop Your Video</h3>
                <p className="text-gray-400 mb-4">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                >
                  Select Video File
                </button>
                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: MP4, WebM, OGG, MOV (Max 100MB)
                </p>
              </>
            )}
          </div>

          {/* Video Details */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-xl font-bold mb-4">Video Details</h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter video title"
                required
                className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what students will learn..."
                rows="4"
                className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none resize-none"
              />
            </div>

            {/* Skill Tag */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Skill Tag <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="skillTag"
                value={formData.skillTag}
                onChange={handleChange}
                placeholder="e.g., React, Python, UI/UX Design"
                required
                className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none"
              />
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold mb-2">Difficulty Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-semibold mb-2">Visibility</label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none"
              >
                <option value="public">Public (Free for all)</option>
                <option value="premium">Premium (Requires tokens)</option>
                <option value="private">Private (Only you)</option>
              </select>
            </div>

            {/* Tokens Required (only for premium) */}
            {formData.visibility === 'premium' && (
              <div>
                <label className="block text-sm font-semibold mb-2">Tokens Required</label>
                <input
                  type="number"
                  name="tokensRequired"
                  value={formData.tokensRequired}
                  onChange={handleChange}
                  min="0"
                  placeholder="Number of tokens required to access"
                  className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none"
                />
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Uploading...</span>
                <span className="text-sm font-bold text-blue-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading || !videoFile}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/videos')}
              disabled={uploading}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VideoUpload
