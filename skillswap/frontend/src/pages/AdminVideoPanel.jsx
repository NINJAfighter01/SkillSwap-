import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import videoService from '../services/videoService'

const AdminVideoPanel = () => {
  const { isDark } = useContext(ThemeContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const canManageVideos = user?.role === 'admin'

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await videoService.getAllVideos({ page: 1, limit: 200 })
      setVideos(response.data?.videos || [])
    } catch (error) {
      console.error('Error loading videos:', error)
      alert(error.response?.data?.message || 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (canManageVideos) {
      loadVideos()
    }
  }, [canManageVideos])

  const handleDelete = async (videoId) => {
    const confirmed = window.confirm('Are you sure you want to delete this video?')
    if (!confirmed) return

    try {
      setDeletingId(videoId)
      await videoService.deleteVideo(videoId)
      setVideos((prev) => prev.filter((video) => video.id !== videoId))
    } catch (error) {
      console.error('Error deleting video:', error)
      alert(error.response?.data?.message || 'Failed to delete video')
    } finally {
      setDeletingId(null)
    }
  }

  if (!canManageVideos) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3">Access Denied</h2>
          <p className="text-gray-400 mb-6">Only admin can access video admin panel.</p>
          <button
            onClick={() => navigate('/videos')}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
          >
            Back to Videos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Video Panel</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Add, update and remove videos from SkillSwap database.
            </p>
          </div>
          <button
            onClick={() => navigate('/upload-video')}
            className="px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition"
          >
            + Add New Video
          </button>
        </div>

        <div className={`rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} overflow-hidden`}>
          {loading ? (
            <div className="p-8 text-center">Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className="p-8 text-center">No videos found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Skill</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Visibility</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="px-4 py-3">{video.id}</td>
                      <td className="px-4 py-3 font-medium">{video.title}</td>
                      <td className="px-4 py-3">{video.skillTag || '-'}</td>
                      <td className="px-4 py-3">{video.level || '-'}</td>
                      <td className="px-4 py-3">{video.visibility || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/videos/${video.id}`)}
                            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
                            disabled={deletingId === video.id}
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm"
                          >
                            {deletingId === video.id ? 'Deleting...' : 'Remove'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminVideoPanel
