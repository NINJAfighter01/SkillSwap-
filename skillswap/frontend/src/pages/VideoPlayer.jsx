import React, { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import videoService from '../services/videoService'
import userService from '../services/userService'

const VideoPlayer = () => {
  const { id } = useParams()
  const { isDark } = useContext(ThemeContext)
  const { user, updateUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const watchTriggeredRef = useRef(false)
  const videoRef = useRef(null)
  const lastProgressSentRef = useRef(0)
  const lastPercentSentRef = useRef(0)

  // Check if current user is the owner or admin
  const isOwner = Boolean(
    user?.id &&
    video?.uploaderId &&
    Number(user.id) === Number(video.uploaderId)
  )
  const isAdmin = user?.role === 'admin'
  const canModify = isOwner || isAdmin
  
  // Debug logging
  useEffect(() => {
    if (user && video) {
      console.log('=== AUTHORIZATION DEBUG ===');
      console.log('Current user ID:', user.id, 'Type:', typeof user.id);
      console.log('Video uploaderId:', video.uploaderId, 'Type:', typeof video.uploaderId);
      console.log('Number(user.id):', Number(user.id));
      console.log('Number(video.uploaderId):', Number(video.uploaderId));
      console.log('Are they equal?', Number(user.id) === Number(video.uploaderId));
      console.log('isOwner:', isOwner);
      console.log('isAdmin:', isAdmin);
      console.log('canModify:', canModify);
      console.log('========================');
    }
  }, [user, video, isOwner, isAdmin, canModify])

  // Load video
  useEffect(() => {
    loadVideo()
  }, [id])

  useEffect(() => {
    watchTriggeredRef.current = false
  }, [id])

  useEffect(() => {
    lastProgressSentRef.current = 0
    lastPercentSentRef.current = 0
  }, [id])

  // Deduct tokens for premium videos
  useEffect(() => {
    if (!video || !user) return
    if (watchTriggeredRef.current) return
    if (video.visibility !== 'premium') return
    if (!video.tokensRequired || video.tokensRequired <= 0) return
    if (isOwner) return

    watchTriggeredRef.current = true

    const watchPremiumVideo = async () => {
      try {
        const response = await videoService.watchVideo(id)
        if (response.data?.tokensDeducted > 0) {
          const nextTokens = response.data.viewerTokens ?? (user.tokens - response.data.tokensDeducted)
          updateUser({ ...user, tokens: nextTokens })
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message
        alert(message)
        navigate('/videos')
      }
    }

    watchPremiumVideo()
  }, [video, user, id, isOwner, updateUser, navigate])

  const loadVideo = async () => {
    try {
      console.log('Loading video with ID:', id);
      setLoading(true)
      const response = await videoService.getVideoById(id)
      console.log('Video loaded successfully:', response.data.video);
      setVideo(response.data.video)
      setEditData({
        title: response.data.video.title,
        description: response.data.video.description,
        skillTag: response.data.video.skillTag,
        level: response.data.video.level,
        visibility: response.data.video.visibility,
        tokensRequired: response.data.video.tokensRequired,
      })
    } catch (error) {
      console.error('Error loading video:', error)
      console.error('Error details:', error.response?.data || error.message);
      alert('Video not found: ' + (error.response?.data?.message || error.message))
      navigate('/videos')
    } finally {
      setLoading(false)
    }
  }

  // Handle like
  const handleLike = async () => {
    try {
      const response = await videoService.likeVideo(id)
      setVideo(prev => ({ ...prev, likes: response.data.likes }))
    } catch (error) {
      console.error('Error liking video:', error)
    }
  }

  // Handle edit
  const handleEdit = async () => {
    try {
      await videoService.updateVideo(id, editData)
      setVideo(prev => ({ ...prev, ...editData }))
      setIsEditing(false)
      alert('Video updated successfully!')
    } catch (error) {
      console.error('Error updating video:', error)
      alert('Failed to update video')
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return
    }

    try {
      await videoService.deleteVideo(id)
      alert('Video deleted successfully')
      navigate('/videos')
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('Failed to delete video')
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleTimeUpdate = async () => {
    const videoEl = videoRef.current
    if (!videoEl || !video) return
    if (!videoEl.duration || Number.isNaN(videoEl.duration)) return

    const percent = Math.min(100, Math.round((videoEl.currentTime / videoEl.duration) * 100))
    const now = Date.now()

    if (percent < 1) return
    if (percent !== 100 && now - lastProgressSentRef.current < 5000 && Math.abs(percent - lastPercentSentRef.current) < 2) {
      return
    }

    lastProgressSentRef.current = now
    lastPercentSentRef.current = percent

    try {
      await userService.updateProgress({
        videoId: id,
        completionPercentage: percent,
      })
    } catch (error) {
      console.error('Error updating video progress:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/videos"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition"
        >
          ← Back to Videos
        </Link>

        {/* Video Player */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl overflow-hidden border border-white/10 mb-6">
          <div className="aspect-video bg-black">
            <video
              src={video.videoUrl}
              controls
              autoPlay
              ref={videoRef}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full"
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Video Info */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none text-2xl font-bold"
              />
              
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows="4"
                className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 outline-none resize-none"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={editData.skillTag}
                  onChange={(e) => setEditData({ ...editData, skillTag: e.target.value })}
                  placeholder="Skill Tag"
                  className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20 focus:border-blue-400 outline-none"
                />

                <select
                  value={editData.level}
                  onChange={(e) => setEditData({ ...editData, level: e.target.value })}
                  className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20 focus:border-blue-400 outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>

                <select
                  value={editData.visibility}
                  onChange={(e) => setEditData({ ...editData, visibility: e.target.value })}
                  className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20 focus:border-blue-400 outline-none"
                >
                  <option value="public">Public</option>
                  <option value="premium">Premium</option>
                  <option value="private">Private</option>
                </select>

                {editData.visibility === 'premium' && (
                  <input
                    type="number"
                    value={editData.tokensRequired}
                    onChange={(e) => setEditData({ ...editData, tokensRequired: parseInt(e.target.value) })}
                    min="0"
                    placeholder="Tokens"
                    className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20 focus:border-blue-400 outline-none"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">{video.title}</h1>
                
                {canModify && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400 mb-4">
                <span>👁 {video.views || 0} views</span>
                <span>•</span>
                <span>📅 {formatDate(video.createdAt)}</span>
                <span>•</span>
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1 hover:text-red-400 transition"
                >
                  ❤️ {video.likes || 0} likes
                </button>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-semibold">
                  {video.skillTag}
                </span>
                <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-semibold">
                  {video.level}
                </span>
                {video.visibility === 'premium' && (
                  <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm font-semibold">
                    💎 {video.tokensRequired} tokens
                  </span>
                )}
              </div>

              {/* Description */}
              {video.description && (
                <div className="border-t border-white/10 pt-4">
                  <h3 className="font-bold mb-2">Description</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Uploader Info */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="font-bold mb-4">Uploaded By</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {video.uploader?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h4 className="font-bold text-lg">{video.uploader?.name || 'Unknown User'}</h4>
              {video.uploader?.bio && (
                <p className="text-sm text-gray-400">{video.uploader.bio}</p>
              )}
              {video.uploader?.isTeacher && (
                <span className="text-xs text-green-400">✓ Verified Teacher</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
