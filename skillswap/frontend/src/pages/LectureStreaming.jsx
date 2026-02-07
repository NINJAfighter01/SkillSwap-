import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import LectureCard from '../components/LectureCard'
import lectureService from '../services/lectureService'
import { useNavigate } from 'react-router-dom'

const LectureStreaming = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLectures()
  }, [])

  const fetchLectures = async () => {
    setLoading(true)
    try {
      const response = await lectureService.getAllLectures(1, 12, '')
      setLectures(response.data.lectures)
    } catch (error) {
      console.error('Error fetching lectures:', error)
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className={`mb-12 rounded-lg p-8 ${isDark ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white`}>
          <h1 className="text-5xl font-bold mb-4">Lecture Streaming</h1>
          <p className="text-xl mb-2">High-quality video streaming of recorded lectures</p>
          <p className="text-lg opacity-90">Watch with adjustable playback speed and full video player controls</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-blue-600">{lectures.length}</div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Lectures</p>
          </div>
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-green-600">📹</div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>On-Demand Video</p>
          </div>
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-purple-600">⚡</div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fast Streaming</p>
          </div>
        </div>

        {/* Lectures Title */}
        <h2 className="text-3xl font-bold mb-8">Featured Lectures</h2>

        {/* Lectures Grid */}
        {loading ? (
          <div className="text-center text-2xl">Loading...</div>
        ) : lectures.length === 0 ? (
          <div className="text-center text-xl">No lectures found</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {lectures.map((lecture) => (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  onClick={() => navigate(`/lecture/${lecture.id}`)}
                />
              ))}
            </div>

            {/* Features Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Why Stream Lectures on SkillSwap?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="text-3xl mb-3">▶️</div>
                  <h3 className="font-bold text-lg mb-2">Play Controls</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Full playback controls with pause, resume, and seek</p>
                </div>
                <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="text-3xl mb-3">⚙️</div>
                  <h3 className="font-bold text-lg mb-2">Adjust Speed</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Watch at your own pace with speed adjustment</p>
                </div>
                <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="text-3xl mb-3">📝</div>
                  <h3 className="font-bold text-lg mb-2">Take Notes</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Make notes while watching and save them</p>
                </div>
                <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="font-bold text-lg mb-2">Rewatch Anytime</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Watch lectures multiple times without limit</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default LectureStreaming
