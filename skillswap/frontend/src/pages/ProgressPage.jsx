import React, { useContext, useState, useEffect } from 'react'
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

const ProgressPage = () => {
  const { isDark } = useContext(ThemeContext)
  const { user } = useContext(AuthContext)
  const { socket } = useWebSocket()
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

  useEffect(() => {
    fetchAllData(true)
    const interval = setInterval(() => fetchAllData(false), 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => fetchAllData(false)
    socket.on('progress:updated', handleUpdate)
    socket.on('notes:updated', handleUpdate)
    return () => {
      socket.off('progress:updated', handleUpdate)
      socket.off('notes:updated', handleUpdate)
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

  const fetchAllData = async (isInitial = false) => {
    if (isInitial) setLoading(true)

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
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  const getStreakColor = () => {
    if (stats.streak >= 7) return 'text-red-500'
    if (stats.streak >= 3) return 'text-orange-500'
    return 'text-yellow-500'
  }

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
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

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">📊 Track Progress</h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor your learning journey with detailed analytics
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Lectures Watched"
            value={stats.totalLectures}
            icon="📚"
            color="border-blue-500"
          />
          <StatCard
            title="Videos Watched"
            value={stats.watchedVideos}
            icon="🎬"
            color="border-indigo-500"
          />
          <StatCard
            title="Notes Taken"
            value={stats.notesTaken}
            icon="📝"
            color="border-cyan-500"
          />
          <StatCard
            title="Completed"
            value={stats.completedItems}
            icon="✅"
            color="border-green-500"
          />
          <StatCard
            title="Learning Streak"
            value={`${stats.streak}🔥`}
            icon="🔥"
            color={`border-${getStreakColor().split('-')[1]}-500`}
          />
          <StatCard
            title="Hours Spent"
            value={stats.totalHours}
            icon="⏱️"
            color="border-purple-500"
          />
        </div>

        {/* Overall Progress */}
        <div className={`rounded-xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}>
          <h2 className="text-2xl font-bold mb-6">Overall Progress</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Course Completion
              </p>
              <span className="text-2xl font-bold text-blue-600">{stats.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {stats.completedItems} of {stats.totalItems} items completed
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Activity */}
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-xl font-bold mb-4">📈 Daily Activity</h3>
            <div className="space-y-3">
              {dailyActivity.map((day) => (
                <div key={day.label} className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {day.label}
                  </span>
                  <div className="w-20 h-6 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: `${Math.round((day.count / maxActivityCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-xl font-bold mb-4">🎯 This Week Goals</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Watch {GOALS.lectures} lectures</span>
                <span className={`text-lg font-bold ${stats.totalLectures >= GOALS.lectures ? 'text-green-500' : 'text-yellow-500'}`}>
                  {Math.min(stats.totalLectures, GOALS.lectures)}/{GOALS.lectures}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Complete {GOALS.videos} videos</span>
                <span className={`text-lg font-bold ${stats.watchedVideos >= GOALS.videos ? 'text-green-500' : 'text-yellow-500'}`}>
                  {Math.min(stats.watchedVideos, GOALS.videos)}/{GOALS.videos}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Take {GOALS.notes} notes</span>
                <span className={`text-lg font-bold ${stats.notesTaken >= GOALS.notes ? 'text-green-500' : 'text-yellow-500'}`}>
                  {Math.min(stats.notesTaken, GOALS.notes)}/{GOALS.notes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{GOALS.hours}+ hours learning</span>
                <span className={`text-lg font-bold ${stats.totalHours >= GOALS.hours ? 'text-green-500' : 'text-yellow-500'}`}>
                  {Math.min(stats.totalHours, GOALS.hours)}/{GOALS.hours}h
                </span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-xl font-bold mb-4">🏆 Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '🌟', label: 'Starter' },
                { emoji: '⚡', label: '5-Day Streak' },
                { emoji: '🚀', label: 'Quick Learner' },
                { emoji: '💯', label: '100% Complete' },
              ].map((achievement, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 text-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  } cursor-pointer hover:scale-105 transition`}
                >
                  <div className="text-2xl mb-1">{achievement.emoji}</div>
                  <p className="text-xs font-medium">{achievement.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Progress List */}
        <div className={`rounded-xl shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-6">📋 Learning Progress Details</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin">⏳</div>
                <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading your progress...
                </p>
              </div>
            </div>
          ) : progress.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                📚 Start watching lectures to track your progress!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-lg border transition ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
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

                  {/* Quick Stats */}
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

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className={`text-lg mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Keep up the great work! 🎉
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition">
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProgressPage
