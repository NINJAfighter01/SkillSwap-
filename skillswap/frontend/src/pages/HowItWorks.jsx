import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const HowItWorks = () => {
  const { isDark } = useContext(ThemeContext)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">How It Works</h1>
        
        <div className="max-w-4xl mx-auto">
          {/* Step 1 */}
          <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Create Your Account</h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Sign up for free and set up your profile. Tell us about your skills and what you want to learn.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Browse Sessions</h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Explore thousands of live sessions and recorded lectures from expert mentors across various skills.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Join & Learn</h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Join live sessions or watch recordings at your own pace. Take interactive notes and track your progress.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Share Your Knowledge</h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Become a mentor and teach what you know. Help others while earning from your expertise.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-8">Platform Features</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                <div className="text-4xl mb-4">📚</div>
                <h4 className="text-xl font-bold mb-2">Interactive Learning</h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Take notes, import files, and organize your learning materials
                </p>
              </div>

              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                <div className="text-4xl mb-4">📊</div>
                <h4 className="text-xl font-bold mb-2">Track Progress</h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Monitor your learning journey with detailed analytics
                </p>
              </div>

              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="text-xl font-bold mb-2">Live Sessions</h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Join real-time interactive sessions with expert mentors
                </p>
              </div>

              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                <div className="text-4xl mb-4">💰</div>
                <h4 className="text-xl font-bold mb-2">Flexible Pricing</h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Free and premium content to suit your budget
                </p>
              </div>

              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                <div className="text-4xl mb-4">🎓</div>
                <h4 className="text-xl font-bold mb-2">Expert Mentors</h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Learn from verified professionals and industry experts
                </p>
              </div>

              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                <div className="text-4xl mb-4">📱</div>
                <h4 className="text-xl font-bold mb-2">Access Anywhere</h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Learn on any device, anytime, anywhere
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
            <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Join thousands of learners and mentors on SkillSwap today!
            </p>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-lg">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks
