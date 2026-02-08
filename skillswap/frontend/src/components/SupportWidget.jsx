import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'

const SupportWidget = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Hide widget on login/register pages
  useEffect(() => {
    const currentPath = window.location.pathname
    if (currentPath === '/login' || currentPath === '/register') {
      setIsVisible(false)
    } else {
      setIsVisible(true)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat Bubble Menu */}
      {isOpen && (
        <div className={`absolute bottom-24 right-0 rounded-2xl shadow-2xl p-6 w-80 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } animate-slide-up`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🤖 SkillSwap Support
          </h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Need help? Our AI support team is available 24/7 to assist you!
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                navigate('/support')
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition text-sm"
            >
              📬 Create Support Ticket
            </button>
            
            <button
              onClick={() => {
                navigate('/support')
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition text-sm ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              📋 View Tickets
            </button>
          </div>

          <div className={`mt-4 p-3 rounded-lg text-xs ${
            isDark ? 'bg-gray-700' : 'bg-blue-50'
          }`}>
            <p className={isDark ? 'text-gray-300' : 'text-blue-900'}>
              💡 <strong>Quick Tip:</strong> Common issues are usually resolved within seconds by our AI!
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center text-3xl transition-all hover:scale-110 ${
          isOpen
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
        } animate-pulse`}
        title={isOpen ? 'Close Support' : 'Open Support'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Notification Badge */}
      {!isOpen && (
        <div className="absolute -top-2 -left-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
          24/7
        </div>
      )}
    </div>
  )
}

export default SupportWidget
