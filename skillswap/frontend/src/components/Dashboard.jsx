import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { useWebSocket } from '../context/WebSocketContext'
import videoService from '../services/videoService'

const Dashboard = ({ user }) => {
  const { isDark } = useContext(ThemeContext)
  const { socket, connected } = useWebSocket()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await videoService.getDashboardAnalytics()
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error loading dashboard analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  useEffect(() => {
    if (!socket) return

    const refresh = () => loadAnalytics()
    socket.on('dashboard:refresh', refresh)
    socket.on('video:new', refresh)
    socket.on('video:updated', refresh)
    socket.on('video:deleted', refresh)

    return () => {
      socket.off('dashboard:refresh', refresh)
      socket.off('video:new', refresh)
      socket.off('video:updated', refresh)
      socket.off('video:deleted', refresh)
    }
  }, [socket])

  useEffect(() => {
    const interval = setInterval(() => {
      loadAnalytics()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const totals = analytics?.totals || { views: 0, likes: 0, comments: 0, swapRequests: 0 }
  const locationWise = analytics?.locationWiseViewers || []
  const topVideos = analytics?.topVideos || []

  const maxLocationViewers = useMemo(() => {
    if (locationWise.length === 0) return 1
    return Math.max(...locationWise.map((item) => item.viewers || 0), 1)
  }, [locationWise])

  const stats = [
    { label: 'Views Count', value: totals.views, icon: '👁️', color: 'from-blue-600 to-cyan-500' },
    { label: 'Likes', value: totals.likes, icon: '❤️', color: 'from-pink-600 to-rose-500' },
    { label: 'Comments', value: totals.comments, icon: '💬', color: 'from-purple-600 to-indigo-500' },
    { label: 'Swap Requests', value: totals.swapRequests, icon: '🤝', color: 'from-amber-600 to-orange-500' },
  ]

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📊</div>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading real-time dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Video Analytics Dashboard</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Track performance in real-time
          </p>
        </div>
        <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {connected ? '🟢 Live Updates On' : '🔴 Live Updates Off'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-5 border ${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl">{stat.icon}</div>
              <div className={`h-2 w-20 rounded-full bg-gradient-to-r ${stat.color}`}></div>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
            <div className="text-3xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Videos Table */}
        <div className={`xl:col-span-2 rounded-xl p-6 border ${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
          <h2 className="text-xl font-bold mb-4">Top Trending Videos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400 border-b border-gray-700' : 'text-gray-600 border-b border-gray-200'}>
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Views</th>
                  <th className="text-left py-2">Likes</th>
                </tr>
              </thead>
              <tbody>
                {topVideos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={`py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      No video analytics yet.
                    </td>
                  </tr>
                ) : (
                  topVideos.map((video, idx) => (
                    <tr key={video.id} className={isDark ? 'border-b border-gray-700/60' : 'border-b border-gray-200/70'}>
                      <td className="py-2">{idx + 1}</td>
                      <td className="py-2 max-w-xs truncate">{video.title}</td>
                      <td className="py-2">{video.views}</td>
                      <td className="py-2">{video.likes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Location Wise Viewers */}
        <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
          <h2 className="text-xl font-bold mb-4">Location Wise Viewers</h2>
          <div className="space-y-3">
            {locationWise.length === 0 ? (
              <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>No location analytics yet.</p>
            ) : (
              locationWise.map((item) => (
                <div key={item.location}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.location}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{item.viewers}</span>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      style={{ width: `${Math.max(6, Math.round((item.viewers / maxLocationViewers) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
