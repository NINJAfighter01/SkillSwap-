import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { WebSocketContext } from '../context/WebSocketContext'
import feedbackService from '../services/feedbackService'

const Feedback = () => {
  const { isDark } = useContext(ThemeContext)
  const { socket } = useContext(WebSocketContext)
  
  const [formData, setFormData] = useState({
    category: 'general',
    subject: '',
    rating: 5,
    message: '',
    email: '',
  })
  
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const categories = [
    { value: 'bug', label: 'Bug Report', icon: '🐛', color: 'red' },
    { value: 'feature', label: 'Feature Request', icon: '✨', color: 'purple' },
    { value: 'ui', label: 'UI/UX Feedback', icon: '🎨', color: 'pink' },
    { value: 'performance', label: 'Performance', icon: '⚡', color: 'yellow' },
    { value: 'general', label: 'General Feedback', icon: '💭', color: 'blue' },
    { value: 'other', label: 'Other', icon: '📋', color: 'gray' },
  ]

  useEffect(() => {
    fetchFeedback()
  }, [page])

  useEffect(() => {
    if (socket) {
      socket.on('feedback:new', (newFeedback) => {
        setFeedbackList(prev => [newFeedback, ...prev])
      })

      return () => {
        socket.off('feedback:new')
      }
    }
  }, [socket])

  const fetchFeedback = async () => {
    try {
      const response = await feedbackService.getFeedback(page, 6)
      setFeedbackList(response.data.feedback)
      setTotalPages(response.data.pages)
    } catch (error) {
      console.error('Error fetching feedback:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await feedbackService.submitFeedback(formData)
      setSubmitted(true)
      setFormData({
        category: 'general',
        subject: '',
        rating: 5,
        message: '',
        email: '',
      })
      setTimeout(() => setSubmitted(false), 5000)
      fetchFeedback()
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting feedback')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryInfo = (cat) => categories.find(c => c.value === cat) || categories[4]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">💬</div>
          <h1 className={`text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Share Your Feedback
          </h1>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Help us improve SkillSwap by sharing your thoughts and suggestions
          </p>
        </div>

        {/* Success Alert */}
        {submitted && (
          <div className="mb-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center animate-fade-in">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <p className="font-semibold">Thank you for your feedback!</p>
              <p className="text-sm">We appreciate your thoughts and will review them carefully.</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
            <span className="text-2xl mr-3">❌</span>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl shadow-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Submit Feedback
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Feedback Category
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.category === cat.value
                            ? `border-${cat.color}-500 bg-${cat.color}-50 ${isDark ? 'bg-opacity-20' : ''}`
                            : `${isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`
                        }`}
                      >
                        <div className="text-3xl mb-2">{cat.icon}</div>
                        <div className={`text-xs font-semibold ${
                          formData.category === cat.value ? `text-${cat.color}-600` : ''
                        }`}>
                          {cat.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief summary of your feedback"
                    maxLength={100}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 focus:border-blue-500'
                    } focus:outline-none transition`}
                    required
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formData.subject.length}/100 characters
                  </p>
                </div>

                {/* Rating */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Overall Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className={`text-5xl cursor-pointer transition-transform hover:scale-110 ${
                          star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className={`ml-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>
                      {formData.rating === 5 ? '😍 Excellent' : 
                       formData.rating === 4 ? '😊 Good' :
                       formData.rating === 3 ? '😐 Average' :
                       formData.rating === 2 ? '😕 Poor' : '😞 Very Poor'}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Detailed Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Tell us more about your experience..."
                    maxLength={1000}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 focus:border-blue-500'
                    } focus:outline-none transition resize-none`}
                    required
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formData.message.length}/1000 characters
                  </p>
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 focus:border-blue-500'
                    } focus:outline-none transition`}
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Provide your email if you'd like us to follow up with you
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    '📤 Submit Feedback'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            {/* Why Feedback Matters */}
            <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                💡 Why Your Feedback Matters
              </h3>
              <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <span className="mr-2">📊</span>
                  <span>Helps us prioritize features you need</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔧</span>
                  <span>Identifies bugs and issues quickly</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🎯</span>
                  <span>Improves your learning experience</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🚀</span>
                  <span>Shapes the future of SkillSwap</span>
                </li>
              </ul>
            </div>

            {/* Quick Tips */}
            <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ✍️ Feedback Tips
              </h3>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <li>• Be specific about the issue or suggestion</li>
                <li>• Include steps to reproduce bugs</li>
                <li>• Mention your device/browser if relevant</li>
                <li>• Share what you love too! 💙</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className={`mt-12 rounded-xl shadow-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📢 Recent Community Feedback
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbackList.length > 0 ? (
              feedbackList.map((item, idx) => {
                const catInfo = getCategoryInfo(item.category)
                return (
                  <div
                    key={item.id || idx}
                    className={`p-6 rounded-lg border-2 ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{catInfo.icon}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          isDark ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          {catInfo.label}
                        </span>
                      </div>
                      <span className="text-yellow-400 text-xl">
                        {'★'.repeat(item.rating)}
                      </span>
                    </div>
                    
                    <h4 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.subject}
                    </h4>
                    
                    <p className={`text-sm mb-3 line-clamp-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.User?.name || 'Anonymous User'}
                      </span>
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className={`col-span-2 text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg">No feedback yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  page === 1
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Previous
              </button>
              <span className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  page === totalPages
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Feedback
