import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const Dashboard = ({ user }) => {
  const { isDark } = useContext(ThemeContext)

  const stats = [
    { label: 'Learning Tokens', value: user?.tokens || 0, icon: '💰' },
    { label: 'Lectures Completed', value: user?.lecturesCompleted || 0, icon: '✓' },
    { label: 'Tasks Completed', value: user?.tasksCompleted || 0, icon: '📋' },
    { label: 'Total Hours', value: user?.totalHours || 0, icon: '⏱️' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="text-4xl mb-2">{stat.icon}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.label}
            </div>
            <div className="text-3xl font-bold mt-2">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-xl font-bold mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'Chat Support', icon: '💬' },
            { name: 'Call Support', icon: '☎️' },
            { name: 'My Profile', icon: '👤' },
            { name: 'Progress Tracker', icon: '📊' },
            { name: 'Portfolio', icon: '🎨' },
            { name: 'Subscription', icon: '🎁' },
          ].map((link, idx) => (
            <button
              key={idx}
              className={`p-4 rounded-lg transition ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-2">{link.icon}</div>
              <div className="text-sm font-semibold">{link.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
