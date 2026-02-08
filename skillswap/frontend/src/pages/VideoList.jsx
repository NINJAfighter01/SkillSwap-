import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import { useWebSocket } from '../context/WebSocketContext'
import videoService from '../services/videoService'

const VideoList = () => {
  const { isDark } = useContext(ThemeContext)
  const { user } = useContext(AuthContext)
  const { socket, connected } = useWebSocket()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTokenVideos, setShowTokenVideos] = useState(searchParams.get('filter') === 'tokens')
  const [filters, setFilters] = useState({
    search: '',
    skillTag: '',
    level: '',
    visibility: '',
  })

  // Load videos
  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await videoService.getAllVideos(filters)
      setVideos(response.data.videos)
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [filters])

  // Real-time WebSocket updates
  useEffect(() => {
    if (!socket || !connected) return

    // New video uploaded
    socket.on('video:new', (data) => {
      console.log('New video uploaded:', data)
      setVideos(prev => [data.video, ...prev])
    })

    // Video updated
    socket.on('video:updated', (data) => {
      console.log('Video updated:', data)
      setVideos(prev =>
        prev.map(video =>
          video.id === data.videoId ? { ...video, ...data.video } : video
        )
      )
    })

    // Video deleted
    socket.on('video:deleted', (data) => {
      console.log('Video deleted:', data)
      setVideos(prev => prev.filter(video => video.id !== data.videoId))
    })

    return () => {
      socket.off('video:new')
      socket.off('video:updated')
      socket.off('video:deleted')
    }
  }, [socket, connected])

  // Format duration (seconds to MM:SS)
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Video Library</h1>
            <p className="text-gray-400">Learn from expert-created content</p>
            {connected && (
              <p className="text-xs text-green-400 mt-1">🟢 Live - Real-time updates enabled</p>
            )}
          </div>
          {user?.isTeacher && (
            <button
              onClick={() => navigate('/upload-video')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition"
            >
              📤 Upload Video
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search videos..."
              className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20 focus:border-blue-400 outline-none"
            />

            {/* Skill Tag */}
            <input
              type="text"
              name="skillTag"
              value={filters.skillTag}
              onChange={handleFilterChange}
              placeholder="Filter by skill..."
              className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20 focus:border-blue-400 outline-none"
            />

            {/* Level */}
            <select
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
              className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20 focus:border-blue-400 outline-none"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>

            {/* Token Videos Filter */}
            <button
              onClick={() => setShowTokenVideos(!showTokenVideos)}
              className={`rounded-lg px-4 py-2 font-semibold transition ${
                showTokenVideos
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              💎 Token Videos {showTokenVideos && '✓'}
            </button>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilters({ search: '', skillTag: '', level: '', visibility: '' })
                setShowTokenVideos(false)
              }}
              className="bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 font-semibold transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-400">Loading videos...</p>
          </div>
        ) : (() => {
          const filteredVideos = showTokenVideos 
            ? videos.filter(video => video.tokensRequired > 0)
            : videos
          
          return filteredVideos.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📹</div>
              <p className="text-gray-400 mb-4">
                {showTokenVideos ? 'No token videos found' : 'No videos found'}
              </p>
              {user?.isTeacher && (
                <button
                  onClick={() => navigate('/upload-video')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                >
                  Upload Your First Video
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
              <Link
                key={video.id}
                to={`/videos/${video.id}`}
                className="group backdrop-blur-xl bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 hover:shadow-2xl hover:scale-105 transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🎥
                    </div>
                  )}
                  
                  {/* Duration Badge */}
                  {video.duration > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold">
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* Premium Badge */}
                  {video.visibility === 'premium' && (
                    <div className="absolute top-2 right-2 bg-yellow-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      💎 {video.tokensRequired} tokens
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl">
                      ▶
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition">
                    {video.title}
                  </h3>

                  {/* Uploader */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {video.uploader?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm text-gray-400">{video.uploader?.name || 'Unknown'}</span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>👁 {video.views || 0} views</span>
                    <span>❤️ {video.likes || 0} likes</span>
                  </div>

                  {/* Skill Tag & Level */}
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-semibold">
                      {video.skillTag}
                    </span>
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-semibold">
                      {video.level}
                    </span>
                  </div>
                </div>
              </Link>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default VideoList
