import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { motion } from 'framer-motion'

const About = () => {
  const { isDark } = useContext(ThemeContext)

  return (
    <motion.div
      className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.18 }
        }
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <motion.h1
          className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring' }}
        >
          About SkillSwap Platform
        </motion.h1>
        <motion.div
          className={`rounded-2xl shadow-2xl p-8 ${isDark ? 'bg-gray-800/90' : 'bg-white/90'} space-y-8 border border-gray-700/20`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Our Mission</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-semibold text-blue-300">SkillSwap</span> is dedicated to democratizing education by creating a peer-to-peer learning platform
              where knowledge is exchanged through a <span className="font-semibold text-purple-400">token-based economy</span>. We believe every individual has valuable
              skills to share and infinite potential to learn.
            </p>
          </motion.section>
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-purple-400">How It Works</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Users earn tokens by teaching their skills through recorded or live lectures. These tokens can then
              be used to learn from others. This creates a sustainable ecosystem where education is truly peer-driven.
            </p>
          </motion.section>
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-green-400">Our Values</h2>
            <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><span className="font-bold text-blue-400">✓ Accessibility:</span> Knowledge should be available to everyone</li>
              <li><span className="font-bold text-purple-400">✓ Equality:</span> Every skill has value and deserves recognition</li>
              <li><span className="font-bold text-green-400">✓ Quality:</span> We maintain high standards for content</li>
              <li><span className="font-bold text-pink-400">✓ Community:</span> We foster a supportive learning environment</li>
            </ul>
          </motion.section>
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-pink-400">Contact Information</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-semibold">Email:</span> support@skillswap.com<br />
              <span className="font-semibold">Phone:</span> +91-XXXX-XXXX<br />
              <span className="font-semibold">Address:</span> India
            </p>
          </motion.section>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default About
