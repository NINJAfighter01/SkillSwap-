import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const Services = () => {
  const { isDark } = useContext(ThemeContext)

  const services = [
    {
      icon: '🎥',
      title: 'Lecture Streaming',
      description: 'High-quality video streaming of recorded lectures with adjustable playback speed'
    },
    {
      icon: '💬',
      title: '24/7 Chat Support',
      description: 'Real-time chat support with other learners and instructors'
    },
    {
      icon: '☎️',
      title: 'Video Call Support',
      description: 'Schedule one-on-one video calls with instructors for personalized guidance'
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description: 'Detailed analytics showing your learning progress and achievements'
    },
    {
      icon: '📝',
      title: 'Note Management',
      description: 'Organize, save, and download your lecture notes'
    },
    {
      icon: '💳',
      title: 'Secure Payments',
      description: 'Safe and secure payment processing through Razorpay'
    },
    {
      icon: '🌙',
      title: 'Dark Mode',
      description: 'Eye-friendly dark mode for comfortable learning at night'
    },
    {
      icon: '🔐',
      title: 'Secure Authentication',
      description: 'Multiple login options with enterprise-grade JWT security'
    },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Services</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition`}
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-lg font-bold mb-2">{service.title}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Services
