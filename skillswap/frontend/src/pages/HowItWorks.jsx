import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const HowItWorks = () => {
  const { isDark } = useContext(ThemeContext)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">How SkillSwap Works</h1>

        <div className={`space-y-8`}>
          {[
            {
              step: 1,
              title: 'Create Your Account',
              description: 'Sign up with email or use Google, Facebook, or Microsoft. You get 100 tokens to start learning immediately.',
              icon: '📝'
            },
            {
              step: 2,
              title: 'Browse Lectures',
              description: 'Search and explore thousands of skill-based lectures from expert instructors across various categories.',
              icon: '📚'
            },
            {
              step: 3,
              title: 'Watch & Learn',
              description: 'Select a lecture to watch. Tokens are deducted based on lecture complexity and automatically go to the teacher.',
              icon: '🎓'
            },
            {
              step: 4,
              title: 'Take Notes',
              description: 'Use the integrated notes editor to take notes while watching. Save, edit, and download your notes anytime.',
              icon: '📝'
            },
            {
              step: 5,
              title: 'Share Your Skills',
              description: 'Upload your own lectures to teach others. Earn tokens every time someone watches your content.',
              icon: '🎬'
            },
            {
              step: 6,
              title: 'Get Premium Access',
              description: 'Subscribe to plans for more tokens, premium content, and exclusive features. Use Razorpay for secure payments.',
              icon: '💎'
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`rounded-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg flex items-start gap-6`}
            >
              <div className="flex-shrink-0">
                <div className="text-5xl">{item.icon}</div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  Step {item.step}: {item.title}
                </h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className={`rounded-lg p-8 mt-12 ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
          <h2 className="text-2xl font-bold mb-4">Token System</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            SkillSwap uses a token-based economy. Every lecture has a token cost based on its length and complexity.
            When you watch a lecture, tokens are deducted from your account and transferred to the teacher.
            This incentivizes quality content creation and makes learning affordable.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-green-500 text-white rounded">
              <p className="text-sm">Starting Tokens</p>
              <p className="text-2xl font-bold">100</p>
            </div>
            <div className="p-4 bg-purple-500 text-white rounded">
              <p className="text-sm">Earn per Watch</p>
              <p className="text-2xl font-bold">10-50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks
