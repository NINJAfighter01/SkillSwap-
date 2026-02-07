import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'

const HomePage = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-500 to-purple-600'} text-white py-20`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to SkillSwap</h1>
          <p className="text-xl mb-8">
            Learn new skills today, teach your expertise tomorrow
          </p>

          {/* Platform Description */}
          <div className="mb-10 -mx-4 md:-mx-8 lg:-mx-12">
            <div className="bg-white/20 backdrop-blur-md p-12 md:p-16 lg:p-20 text-white border-b-2 border-t-2 border-white/40 shadow-2xl">
              <div className="px-4 md:px-8 lg:px-12 max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-10 text-center">About SkillSwap Platform</h2>
                
                <p className="mb-10 leading-loose text-xl md:text-2xl font-medium">
                  <strong className="font-bold">SkillSwap – Peer to Peer Learning Platform</strong> is a digital learning and educational management platform designed to facilitate peer-to-peer knowledge sharing and skill development. SkillSwap functions as a centralized online system that enables registered users to efficiently access, deliver, and manage educational content, including online and pre-recorded lectures, learning tasks, and progress tracking.
                </p>

                <p className="mb-10 leading-loose text-xl md:text-2xl font-medium">
                  The platform allows individual learners and peer educators to securely register, create profiles, and participate in skill-based learning activities using a <strong className="font-bold">token-based learning mechanism</strong>. SkillSwap supports the exchange of learning tokens between students and teachers, enabling a balanced and transparent learning ecosystem. Users can search lectures, view teacher profiles, attend online courses, and utilize integrated tools such as notes writing, feedback submission, and customer support services.
                </p>

                <p className="mb-10 leading-loose text-xl md:text-2xl font-medium">
                  All user activities, including lecture access, token transactions, subscription details, and learning progress, are recorded and managed through the system in real-time. The collected data is securely stored and processed through the backend infrastructure and monitored through user-level and administrative controls to ensure accuracy, transparency, and reliability.
                </p>

                <p className="leading-loose text-xl md:text-2xl font-medium">
                  This makes SkillSwap a <strong className="font-bold">scalable and efficient learning management platform</strong> that supports structured peer-based education and serves as a comprehensive system for skill development, learning analytics, and academic engagement in a digital environment.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/lectures')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Get Started
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose SkillSwap?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '📚',
              title: 'Learn Anything',
              desc: 'Access thousands of skill-based lectures from experts'
            },
            {
              icon: '▶️',
              title: 'Lecture Streaming',
              desc: 'High-quality video streaming of recorded lectures with adjustable playback speed'
            },
            {
              icon: '💰',
              title: 'Earn Tokens',
              desc: 'Teach your skills and earn tokens for learning new ones'
            },
            {
              icon: '🎓',
              title: 'Expert Teachers',
              desc: 'Learn from industry professionals and experienced instructors'
            },
            {
              icon: '📊',
              title: 'Track Progress',
              desc: 'Monitor your learning journey with detailed analytics'
            },
            {
              icon: '🤝',
              title: '24/7 Support',
              desc: 'Get help anytime through chat, calls, or contact forms'
            },
            {
              icon: '🎁',
              title: 'Premium Content',
              desc: 'Unlock exclusive lectures and premium notes'
            },
            {
              icon: '📝',
              title: 'Interactive Notes',
              desc: 'Take and organize notes while watching lectures'
            },
            {
              icon: '💬',
              title: 'Share Feedback',
              desc: 'Help us improve by sharing your thoughts and suggestions'
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (feature.title === 'Lecture Streaming') {
                  navigate('/lectures')
                }
                if (feature.title === 'Interactive Notes') {
                  navigate('/interactive-notes')
                }
                if (feature.title === 'Share Feedback') {
                  navigate('/feedback')
                }
              }}
              className={`rounded-lg p-8 text-center ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-lg ${
                (feature.title === 'Lecture Streaming' || feature.title === 'Interactive Notes' || feature.title === 'Share Feedback') 
                  ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' 
                  : ''
              }`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - About Section */}
      <footer className="bg-[#1c3a57] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Mission Statement */}
            <div className="md:col-span-1">
              <p className="text-gray-300 mb-4">
                Our mission is to provide a peer-to-peer skill-sharing platform where knowledge is exchanged through tokens.
              </p>
              <p className="text-gray-300 mb-4">
                SkillSwap is dedicated to democratizing education through community-driven learning.
              </p>
              <div className="flex gap-4">
                <a href="/contact" className="text-blue-300 hover:underline">Contact Us</a>
                <span className="text-gray-400">|</span>
                <a href="/feedback" className="text-blue-300 hover:underline">Feedback</a>
              </div>
            </div>

            {/* About Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">About</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="/how-it-works" className="text-gray-300 hover:text-white">How It Works</a></li>
                <li><a href="/info" className="text-gray-300 hover:text-white">Platform Info</a></li>
                <li><a href="/blog" className="text-gray-300 hover:text-white">News & Blog</a></li>
                <li><a href="/services" className="text-gray-300 hover:text-white">Our Services</a></li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2">
                <li><a href="/contact" className="text-gray-300 hover:text-white">Help Center</a></li>
                <li className="text-gray-300">Email: support@skillswap.com</li>
                <li className="text-gray-300">Phone: +91-XXXX-XXXX</li>
              </ul>
            </div>

            {/* Courses/Features */}
            <div>
              <h3 className="font-bold text-lg mb-4">Features</h3>
              <ul className="space-y-2">
                <li><a href="/lectures" className="text-gray-300 hover:text-white">Browse Lectures</a></li>
                <li><a href="/subscription" className="text-gray-300 hover:text-white">Subscription Plans</a></li>
                <li><a href="/dashboard" className="text-gray-300 hover:text-white">Your Dashboard</a></li>
                <li><a href="/profile" className="text-gray-300 hover:text-white">Profile & Progress</a></li>
                <li className="text-gray-300">Live Classes</li>
                <li className="text-gray-300">Notes & Resources</li>
                <li className="text-gray-300">Token System</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-600 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2026 SkillSwap. All rights reserved. | Made with ❤️ in India
            </div>
            <div className="text-gray-400 text-sm">
              Language: English | Country: 🇮🇳 India
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
