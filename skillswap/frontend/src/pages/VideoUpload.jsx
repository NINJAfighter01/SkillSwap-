import React, { useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import videoService from '../services/videoService'
import { X } from 'lucide-react'

const VideoUpload = () => {
  const { isDark } = useContext(ThemeContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)
  const videoRef = useRef(null)

  // BASIC SECTION
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    skillType: 'Offer',
    
    // ADVANCED SECTION
    level: 'Beginner',
    location: 'Mumbai',
    tags: [],
    
    // PRIVACY & SETTINGS
    visibility: 'public',
    tokensRequired: 0,
    allowComments: true,
    wantSkillInReturn: false,
  })

  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [tagInput, setTagInput] = useState('')
  const [activeSection, setActiveSection] = useState('basic')
  
  const canManageVideos = user?.role === 'admin' || user?.role === 'developer'

  // Category options
  const categories = [
    'Programming',
    'Design',
    'Music',
    'Electronics',
    'Communication',
    'Business',
    'Education',
    'Healthcare',
    'Sports',
    'Other'
  ]

  // Location options
  const locations = [
    'Mumbai',
    'Delhi',
    'Pune',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Ahmedabad',
    'Jaipur',
    'Online',
    'Other'
  ]

  // Skill Type options
  const skillTypes = ['Offer', 'Request']

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    })
  }

  // Handle tag input and addition
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (!formData.tags.includes(newTag) && formData.tags.length < 10) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] })
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    })
  }

  // Handle video duration detection
  const handleVideoLoadedMetadata = (e) => {
    const duration = Math.floor(e.target.duration)
    setVideoDuration(duration)
  }

  // Format duration for display
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
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

  // Handle thumbnail file selection
  const handleThumbnailSelect = (file) => {
    if (!file) return

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validImageTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WebP)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Thumbnail size must be less than 5MB')
      return
    }

    setThumbnailFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setThumbnailPreview(url)
  }

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // Handle thumbnail file input change

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!videoFile) {
      alert('Please select a video file')
      return
    }

    if (!formData.title || !formData.category) {
      alert('Please fill in all required fields')
      return
    }

    // Character limit validation
    if (formData.title.length > 100) {
      alert('Title must be less than 100 characters')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('video', videoFile)

      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile)
      }
      
      // Basic section
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('skillType', formData.skillType)
      
      // Advanced section
      formDataToSend.append('level', formData.level)
      formDataToSend.append('location', formData.location)
      formDataToSend.append('tags', JSON.stringify(formData.tags))
      formDataToSend.append('duration', videoDuration)
      
      // Privacy & Settings
      formDataToSend.append('visibility', formData.visibility)
      formDataToSend.append('tokensRequired', formData.tokensRequired)
      formDataToSend.append('allowComments', formData.allowComments)
      formDataToSend.append('wantSkillInReturn', formData.wantSkillInReturn)

      console.log('Starting video upload...')
      console.log('File size:', (videoFile.size / (1024 * 1024)).toFixed(2), 'MB')
      console.log('Duration:', formatDuration(videoDuration))

      const response = await videoService.uploadVideo(formDataToSend, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(progress)
        console.log('Upload progress:', progress + '%')
      })

      console.log('Upload successful!', response.data)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📤 Upload Teaching Video</h1>
          <p className="text-gray-400">Share your knowledge with the SkillSwap community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload Area - Always First */}
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
                <div className="bg-black/50 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    controls
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    className="w-full max-h-80 mx-auto"
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-green-400">✓ {videoFile.name}</p>
                  {videoDuration > 0 && (
                    <p className="text-blue-400">⏱️ Duration: {formatDuration(videoDuration)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null)
                    setPreviewUrl(null)
                    setVideoDuration(0)
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
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0])
                    }
                  }}
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
                  📁 Supported formats: MP4, WebM, OGG, MOV | 📦 Max size: 100MB
                </p>
              </>
            )}
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            {['basic', 'advanced', 'privacy'].map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
                className={`px-6 py-3 font-semibold transition border-b-2 ${
                  activeSection === section
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {section === 'basic' && '🎯 Basic'}
                {section === 'advanced' && '⚡ Advanced'}
                {section === 'privacy' && '🔒 Privacy & Settings'}
              </button>
            ))}
          </div>

          {/* ================= BASIC SECTION ================= */}
          {activeSection === 'basic' && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 space-y-6">
              <h3 className="text-2xl font-bold">Basic Information</h3>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  📝 Video Title <span className="text-red-500">*</span>
                </label>
                <div className="flex items-end gap-2">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter an engaging video title"
                    maxLength="100"
                    required
                    className="flex-1 bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none"
                  />
                  <span className="text-xs text-gray-500">{formData.title.length}/100</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">📄 Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn from this video..."
                  rows="4"
                  className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none resize-none"
                />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2">🖼️ Video Thumbnail</label>
                <div className="flex gap-4">
                  {thumbnailPreview ? (
                    <div className="relative w-32 h-32">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover rounded-lg border border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null)
                          setThumbnailPreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 hover:bg-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-white/5 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
                      <span className="text-2xl">📷</span>
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleThumbnailSelect(e.target.files[0])
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                    >
                      Upload Custom Thumbnail
                    </button>
                    <p className="text-xs text-gray-400">
                      JPG, PNG, WebP | Max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  🏷️ Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill Type */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  💡 Skill Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {skillTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="skillType"
                        value={type}
                        checked={formData.skillType === type}
                        onChange={handleChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span>{type === 'Offer' ? '🎓 Offering Skill' : '🤝 Requesting Skill'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= ADVANCED SECTION ================= */}
          {activeSection === 'advanced' && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 space-y-6">
              <h3 className="text-2xl font-bold">Advanced Settings</h3>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-semibold mb-2">📊 Skill Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none"
                >
                  <option value="Beginner">🟢 Beginner</option>
                  <option value="Intermediate">🟡 Intermediate</option>
                  <option value="Advanced">🔴 Advanced</option>
                  <option value="Expert">⭐ Expert</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2">📍 Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  🏷️ Tags (Max 10)
                </label>
                <div className="bg-white/10 rounded-lg border border-white/20 p-4 space-y-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type a tag and press Enter (e.g., React, Java, Guitar)"
                    disabled={formData.tags.length >= 10}
                    className="w-full bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20 focus:border-blue-400 outline-none disabled:opacity-50"
                  />
                  
                  {/* Tags Display */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-300"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    {formData.tags.length}/10 tags added
                  </p>
                </div>
              </div>

              {/* Duration Info */}
              {videoDuration > 0 && (
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
                  <p className="text-sm font-semibold">
                    ⏱️ Video Duration: <span className="text-cyan-400">{formatDuration(videoDuration)}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= PRIVACY & SETTINGS SECTION ================= */}
          {activeSection === 'privacy' && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 space-y-6">
              <h3 className="text-2xl font-bold">Privacy & Settings</h3>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-semibold mb-2">👁️ Visibility</label>
                <div className="space-y-3">
                  {[
                    { value: 'public', label: '🌍 Public (Free for all)', desc: 'Anyone can watch' },
                    { value: 'premium', label: '💎 Premium (Requires tokens)', desc: 'Users need tokens to watch' },
                    { value: 'private', label: '🔒 Private (Only you)', desc: 'Only visible to you' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-4 p-4 border border-white/20 rounded-lg hover:border-blue-400 cursor-pointer transition">
                      <input
                        type="radio"
                        name="visibility"
                        value={option.value}
                        checked={formData.visibility === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-xs text-gray-400">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tokens Required (only for premium) */}
              {formData.visibility === 'premium' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">💰 Tokens Required</label>
                  <input
                    type="number"
                    name="tokensRequired"
                    value={formData.tokensRequired}
                    onChange={handleChange}
                    min="1"
                    placeholder="How many tokens to access this video?"
                    className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none"
                  />
                </div>
              )}

              {/* Comments Enable/Disable */}
              <div className="border border-white/20 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowComments"
                    checked={formData.allowComments}
                    onChange={handleChange}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold">💬 Allow Comments</p>
                    <p className="text-xs text-gray-400">Let viewers comment on this video</p>
                  </div>
                </label>
              </div>

              {/* Swap Preference */}
              <div className="border border-white/20 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="wantSkillInReturn"
                    checked={formData.wantSkillInReturn}
                    onChange={handleChange}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold">🤝 Want Skill in Return?</p>
                    <p className="text-xs text-gray-400">Are you looking for someone to teach you a skill in exchange?</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></span>
                  📤 Uploading in progress...
                </span>
                <span className="text-sm font-bold text-blue-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden relative">
                <div
                  className="h-full transition-all duration-300 relative"
                  style={{
                    width: `${uploadProgress}%`,
                    backgroundImage: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 50%, #2563eb 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'pulse 1.2s ease-in-out infinite',
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Please wait, your video is being processed securely...</p>
            </div>
          )}

          {/* Summary Card Before Submit */}
          {videoFile && !uploading && (
            <div className="backdrop-blur-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-6 border border-blue-500/30">
              <h3 className="text-lg font-bold mb-3">✅ Upload Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Title</p>
                  <p className="font-semibold">{formData.title || '(Not set)'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Category</p>
                  <p className="font-semibold">{formData.category}</p>
                </div>
                <div>
                  <p className="text-gray-400">Level</p>
                  <p className="font-semibold">{formData.level}</p>
                </div>
                <div>
                  <p className="text-gray-400">Visibility</p>
                  <p className="font-semibold capitalize">{formData.visibility}</p>
                </div>
                <div>
                  <p className="text-gray-400">Duration</p>
                  <p className="font-semibold">{videoDuration > 0 ? formatDuration(videoDuration) : 'Detecting...'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Tags</p>
                  <p className="font-semibold">{formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}</p>
                </div>
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
              {uploading ? `📤 Uploading... ${uploadProgress}%` : '📤 Upload Video'}
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
