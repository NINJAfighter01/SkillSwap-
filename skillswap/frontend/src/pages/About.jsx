import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const About = () => {
  const { isDark } = useContext(ThemeContext)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">About SkillSwap</h1>

        <div className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} space-y-6`}>
          <section>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              SkillSwap is dedicated to democratizing education by creating a peer-to-peer learning platform
              where knowledge is exchanged through a token-based economy. We believe every individual has valuable
              skills to share and infinite potential to learn.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Users earn tokens by teaching their skills through recorded or live lectures. These tokens can then
              be used to learn from others. This creates a sustainable ecosystem where education is truly peer-driven.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>✓ Accessibility: Knowledge should be available to everyone</li>
              <li>✓ Equality: Every skill has value and deserves recognition</li>
              <li>✓ Quality: We maintain high standards for content</li>
              <li>✓ Community: We foster a supportive learning environment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Email: support@skillswap.com<br />
              Phone: +91-XXXX-XXXX<br />
              Address: India
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default About
