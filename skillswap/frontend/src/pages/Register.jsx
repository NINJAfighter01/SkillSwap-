import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ThemeContext } from '../context/ThemeContext'

const Register = () => {
  const { isDark } = useContext(ThemeContext)
  const { register, googleLogin } = useContext(AuthContext)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await register(formData)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed')
    }
    setIsLoading(false)
  }

  const handleGoogleSignup = async () => {
    setError('')
    setIsGoogleLoading(true)
    try {
      await googleLogin()
      navigate('/')
    } catch (err) {
      setError(err.message || 'Google sign up failed')
    }
    setIsGoogleLoading(false)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-3xl font-bold text-center mb-8">Sign Up for SkillSwap</h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            className="w-full bg-white text-gray-800 py-2 rounded-lg border-2 border-gray-300 font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            {isGoogleLoading ? 'Connecting to Google...' : 'Google Sign Up'}
          </button>
        </div>

        <p className="text-center mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 font-semibold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  )
}

export default Register
