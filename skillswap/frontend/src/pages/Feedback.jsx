import React, { useContext, useState } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import feedbackService from '../services/feedbackService'

const Feedback = () => {
  const { isDark } = useContext(ThemeContext)
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await feedbackService.submitFeedback({ rating, message })
      setSubmitted(true)
      setRating(5)
      setMessage('')
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Share Your Feedback</h1>

        {submitted && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            Thank you for your feedback! We appreciate your thoughts.
          </div>
        )}

        <div className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-4">Rate Your Experience</label>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl cursor-pointer transition ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-sm mt-2">Rating: {rating} out of 5 stars</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Your Feedback</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="6"
                placeholder="Tell us what you think about SkillSwap..."
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Submit Feedback
            </button>
          </form>
        </div>

        <div className={`rounded-lg shadow-lg p-8 mt-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">Recent Feedback</h2>
          <div className="space-y-4">
            {[
              { name: 'User 1', rating: 5, message: 'Amazing platform! Love the token system.' },
              { name: 'User 2', rating: 4, message: 'Great content. Could use more live lectures.' },
              { name: 'User 3', rating: 5, message: 'Best learning platform yet!' },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold">{item.name}</p>
                  <span className="text-yellow-400">{'★'.repeat(item.rating)}</span>
                </div>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Feedback
