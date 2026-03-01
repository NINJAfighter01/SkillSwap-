import React, { useContext, useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import { useWebSocket } from '../context/WebSocketContext'
import userService from '../services/userService'
import notesService from '../services/notesService'

const GOALS = {
  lectures: 5,
  videos: 3,
  notes: 10,
  hours: 10,
}

const AUTO_REFRESH_MS = 4000

const ProgressPage = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { socket, connected } = useWebSocket()
  const requestInFlightRef = useRef(false)
  const [stats, setStats] = useState({
    totalLectures: 0,
    watchedVideos: 0,
    notesTaken: 0,
    completedItems: 0,
    totalItems: 0,
    totalHours: 0,
    streak: 0,
    completionPercentage: 0,
  })
  const [progress, setProgress] = useState([])
  const [notes, setNotes] = useState([])
  const [dailyActivity, setDailyActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchAllData(true, 'initial')
  }, [])

  useEffect(() => {
    if (!autoRefreshEnabled) return undefined
    const interval = setInterval(() => fetchAllData(false, 'polling'), AUTO_REFRESH_MS)
    return () => clearInterval(interval)
  }, [autoRefreshEnabled])

  useEffect(() => {
    const onFocus = () => fetchAllData(false, 'focus')
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleUpdate = () => fetchAllData(false, 'socket')
    socket.on('progress:updated', handleUpdate)
    socket.on('notes:updated', handleUpdate)
    socket.on('activity:updated', handleUpdate)
    socket.on('dashboard:refresh', handleUpdate)

    return () => {
      socket.off('progress:updated', handleUpdate)
      socket.off('notes:updated', handleUpdate)
      socket.off('activity:updated', handleUpdate)
      socket.off('dashboard:refresh', handleUpdate)
    }
  }, [socket])

  const buildDailyActivity = (progressData, notesData) => {
    const today = new Date()
    const days = []
    const dayCounts = {}

    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(today)
      day.setDate(today.getDate() - i)
      const key = day.toISOString().slice(0, 10)
      dayCounts[key] = 0
      days.push({
        key,
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      })
    }

    progressData.forEach((item) => {
      if (!item.updatedAt) return
      const key = new Date(item.updatedAt).toISOString().slice(0, 10)
      if (dayCounts[key] !== undefined) dayCounts[key] += 1
    })

    notesData.forEach((note) => {
      if (!note.updatedAt) return
      const key = new Date(note.updatedAt).toISOString().slice(0, 10)
      if (dayCounts[key] !== undefined) dayCounts[key] += 1
    })

    return days.map((day) => ({
      label: day.label,
      count: dayCounts[day.key] || 0,
    }))
  }

  const calculateStreak = (progressData, notesData) => {
    const activityDays = new Set()
    const addDay = (value) => {
      if (!value) return
      const dayKey = new Date(value).toISOString().slice(0, 10)
      activityDays.add(dayKey)
    }

    progressData.forEach((item) => addDay(item.updatedAt))
    notesData.forEach((note) => addDay(note.updatedAt))

    let streak = 0
    const cursor = new Date()
    while (true) {
      const key = cursor.toISOString().slice(0, 10)
      if (!activityDays.has(key)) break
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    return streak
  }

  const getProgressType = (item) => {
    if (item.type) return item.type
    if (item.Video) return 'video'
    return 'lecture'
  }

  const fetchAllData = async (isInitial = false, source = 'manual') => {
    if (requestInFlightRef.current && !isInitial) return
    requestInFlightRef.current = true

    if (isInitial) setLoading(true)
    else setIsRefreshing(true)

    try {
      const [progressRes, notesRes] = await Promise.all([
        userService.getProgress(),
        notesService.getAllNotes(),
      ])

      const progressData = progressRes.data.progress || []
      const notesData = notesRes.data.notes || []

      setProgress(progressData)
      setNotes(notesData)
      setDailyActivity(buildDailyActivity(progressData, notesData))

      const lectureItems = progressData.filter((item) => getProgressType(item) === 'lecture')
      const videoItems = progressData.filter((item) => getProgressType(item) === 'video')
      const completedCount = progressData.filter((item) => item.isCompleted).length
      const totalCount = progressData.length
      const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

      setStats({
        totalLectures: lectureItems.length,
        watchedVideos: videoItems.length,
        notesTaken: notesData.length,
        completedItems: completedCount,
        totalItems: totalCount,
        completionPercentage: completionPercent,
        totalHours: user?.totalHours || Math.round(totalCount * 1.5),
        streak: calculateStreak(progressData, notesData),
      })

      setLastSyncAt(new Date())
    } catch (error) {
      console.error(`Error fetching progress (${source}):`, error)
    } finally {
      if (isInitial) setLoading(false)
      else setIsRefreshing(false)
      requestInFlightRef.current = false
    }
  }

  const getStreakAccent = () => {
    if (stats.streak >= 7) return 'text-red-400'
    if (stats.streak >= 3) return 'text-orange-400'
    return 'text-yellow-400'
  }

  const getSyncLabel = () => {
    if (!lastSyncAt) return 'Not synced yet'
    const diffSec = Math.max(0, Math.floor((Date.now() - lastSyncAt.getTime()) / 1000))
    if (diffSec < 5) return 'Synced just now'
    if (diffSec < 60) return `Synced ${diffSec}s ago`
    const mins = Math.floor(diffSec / 60)
    return `Synced ${mins}m ago`
  }

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`text-4xl ${color}`}>{icon}</div>
      </div>
    </div>
  )

  const maxActivityCount = Math.max(1, ...dailyActivity.map((day) => day.count))

  const notesByLectureId = notes.reduce((acc, note) => {
    if (!note.lectureId) return acc
    acc[note.lectureId] = (acc[note.lectureId] || 0) + 1
    return acc
  }, {})

  const notesByVideoId = notes.reduce((acc, note) => {
    if (!note.videoId) return acc
    acc[note.videoId] = (acc[note.videoId] || 0) + 1
    return acc
  }, {})

  const filteredProgress = useMemo(() => {
    if (activeFilter === 'all') return progress
    if (activeFilter === 'completed') return progress.filter((item) => item.isCompleted)
    if (activeFilter === 'in-progress') return progress.filter((item) => !item.isCompleted)
    return progress.filter((item) => getProgressType(item) === activeFilter)
  }, [progress, activeFilter])

  const filterCounts = {
    all: progress.length,
    lecture: progress.filter((item) => getProgressType(item) === 'lecture').length,
    video: progress.filter((item) => getProgressType(item) === 'video').length,
    completed: progress.filter((item) => item.isCompleted).length,
    'in-progress': progress.filter((item) => !item.isCompleted).length,
  }

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'lecture', label: 'Lectures' },
    { key: 'video', label: 'Videos' },
    { key: 'completed', label: 'Completed' },
    { key: 'in-progress', label: 'In Progress' },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 to-blue-50'} py-10`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className={`rounded-2xl p-6 mb-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-blue-100'} shadow-xl`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">📊 Track Progress</h1>
              <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Modern live dashboard for your lectures, videos, notes, and completion trends.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${connected ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'}`}>
                {connected ? '● Live Connected' : '● Live Reconnecting'}
              </span>

              <button
                onClick={() => setAutoRefreshEnabled((prev) => !prev)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${autoRefreshEnabled ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' : isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                {autoRefreshEnabled ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
              </button>

              <button
                onClick={() => fetchAllData(false, 'manual')}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>
          </div>

          <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {getSyncLabel()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Lectures Watched"
            value={stats.totalLectures}
            icon="📚"
            color="text-blue-400"
          />
          <StatCard
            title="Videos Watched"
            value={stats.watchedVideos}
            icon="🎬"
            color="text-indigo-400"
          />
          <StatCard
            title="Notes Taken"
            value={stats.notesTaken}
            icon="📝"
            color="text-cyan-400"
          />
          <StatCard
            title="Completed"
            value={stats.completedItems}
            icon="✅"
            color="text-green-400"
          />
          <StatCard
            title="Learning Streak"
            value={`${stats.streak}🔥`}
            icon="🔥"
            color={getStreakAccent()}
          />
          <StatCard
            title="Hours Spent"
            value={stats.totalHours}
            icon="⏱️"
            color="text-purple-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`lg:col-span-2 rounded-2xl p-6 ${isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
            <h2 className="text-2xl font-bold mb-5">Overall Progress</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Completion Rate
                </p>
                <span className="text-3xl font-extrabold text-blue-500">{stats.completionPercentage}%</span>
              </div>

              <div className={`w-full rounded-full h-4 overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 h-4 rounded-full transition-all duration-700"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>

              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.completedItems} completed out of {stats.totalItems} tracked items.
              </p>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
            <h3 className="text-xl font-bold mb-4">🎯 Weekly Goals</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Lectures</span>
                <span className={stats.totalLectures >= GOALS.lectures ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{Math.min(stats.totalLectures, GOALS.lectures)}/{GOALS.lectures}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Videos</span>
                <span className={stats.watchedVideos >= GOALS.videos ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{Math.min(stats.watchedVideos, GOALS.videos)}/{GOALS.videos}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Notes</span>
                <span className={stats.notesTaken >= GOALS.notes ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{Math.min(stats.notesTaken, GOALS.notes)}/{GOALS.notes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Hours</span>
                <span className={stats.totalHours >= GOALS.hours ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{Math.min(stats.totalHours, GOALS.hours)}/{GOALS.hours}h</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg mb-8`}>
          <h3 className="text-xl font-bold mb-4">📈 Last 7 Days Activity</h3>
          <div className="space-y-4">
            {dailyActivity.map((day) => (
              <div key={day.label} className="flex items-center gap-3">
                <span className={`w-10 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{day.label}</span>
                <div className={`flex-1 h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 transition-all duration-500"
                    style={{ width: `${Math.round((day.count / maxActivityCount) * 100)}%` }}
                  />
                </div>
                <span className={`w-8 text-right text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{day.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl shadow-lg p-6 ${isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">📋 Learning Progress Details</h2>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${activeFilter === filter.key ? 'bg-blue-600 text-white border-blue-500' : isDark ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  {filter.label} ({filterCounts[filter.key]})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin">⏳</div>
                <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading your progress...
                </p>
              </div>
            </div>
          ) : filteredProgress.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                📚 No items found for this filter yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProgress.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border transition cursor-pointer ${
                    isDark
                      ? 'bg-gray-700/60 border-gray-600 hover:bg-gray-700'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    const type = getProgressType(item)
                    if (type === 'video' && item.videoId) {
                      navigate(`/videos/${item.videoId}`)
                    } else if (type === 'lecture' && item.lectureId) {
                      navigate(`/lecture/${item.lectureId}`)
                    }
                  }}
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {idx + 1}. {getProgressType(item) === 'video' ? (item.Video?.title || 'Video') : (item.Lecture?.title || 'Lecture')}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getProgressType(item) === 'video'
                          ? (item.Video?.skillTag || item.Video?.level || 'Video')
                          : (item.Lecture?.category || 'General')}
                      </p>
                    </div>
                    <span
                      className={`text-sm px-4 py-2 rounded-full font-medium ${
                        item.isCompleted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.isCompleted ? '✓ Completed' : '⏳ In Progress'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Progress
                      </p>
                      <span className="text-sm font-bold">
                        {item.completionPercentage || 0}%
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}>
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.completionPercentage || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-bold">
                        {getProgressType(item) === 'lecture'
                          ? `${item.Lecture?.duration || 'N/A'} min`
                          : `${item.Video?.duration || 'N/A'} min`}
                      </p>
                    </div>
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm font-bold">
                        {getProgressType(item) === 'lecture'
                          ? (notesByLectureId[item.lectureId] || 0)
                          : (notesByVideoId[item.videoId] || 0)}
                      </p>
                    </div>
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                      <p className="text-xs text-gray-500">Last Accessed</p>
                      <p className="text-sm font-bold">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className={`text-lg mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Keep your momentum going — progress is now live and auto-synced. 🚀
          </p>
          <button
            onClick={() => navigate('/lectures')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProgressPage
