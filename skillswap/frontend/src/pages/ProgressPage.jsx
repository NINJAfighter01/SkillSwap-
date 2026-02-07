import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import userService from '../services/userService'

const Progress = () => {
  const { isDark } = useContext(ThemeContext)
  const { user } = useContext(AuthContext)
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await userService.getProgress()
      setProgress(response.data.progress || [])
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Learning Progress</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Lectures Watched', value: progress.length, icon: '📚' },
            { label: 'Completed', value: progress.filter(p => p.isCompleted).length, icon: '✓' },
            { label: 'In Progress', value: progress.filter(p => !p.isCompleted).length, icon: '⏳' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Progress List */}
        <div className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-6">Your Lectures</h2>

          {loading ? (
            <div className="text-center text-xl">Loading...</div>
          ) : progress.length === 0 ? (
            <div className="text-center text-gray-600">
              <p>No lectures watched yet. Start learning!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{item.Lecture?.title || 'Lecture'}</h3>
                    <span className={`text-sm px-3 py-1 rounded ${
                      item.isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {item.isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.Lecture?.category}
                  </p>
                  <div className="w-full bg-gray-400 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition"
                      style={{ width: `${item.completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs mt-2 text-right">
                    {item.completionPercentage}% complete
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Progress
