import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ThemeContext } from '../context/ThemeContext'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext)
  const { isDark, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Learn Anything', path: '/learn-anything' },
    { label: 'Top Mentors', path: '/top-mentors' },
    { label: 'My Sessions', path: '/my-sessions' },
    { label: 'Become Mentor', path: '/become-mentor' },
    { label: 'Contact', path: '/contact' },
  ]

  return (
    <nav className={`${isDark ? 'dark bg-gray-900' : 'bg-white'} shadow-lg sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            SkillSwap
          </Link>

          {/* Menu */}
          <div className="hidden md:flex gap-8 items-center absolute left-1/2 transform -translate-x-1/2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition ${
                  isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${
                isDark ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <>
                {/* Tokens */}
                <div className={`px-3 py-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <span className="text-sm font-semibold">Tokens: {user?.tokens || 0}</span>
                </div>

                {/* User Avatar */}
                <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition ${
                    isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'border-blue-600 text-blue-600'
                      : 'border-blue-600 text-blue-600'
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
