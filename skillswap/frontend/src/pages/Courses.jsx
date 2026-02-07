import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import lectureService from '../services/lectureService'
import LectureCard from '../components/LectureCard'
import { useNavigate } from 'react-router-dom'

const Courses = () => {
  const { isDark } = useContext(ThemeContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')

  const categories = ['All', 'Web Development', 'Frontend', 'Backend', 'Databases', 'Mobile', 'AI/ML']

  useEffect(() => {
    fetchLectures()
  }, [category])

  const fetchLectures = async () => {
    setLoading(true)
    try {
      const response = await lectureService.getAllLectures(1, 20, category !== 'All' ? category : '')
      setLectures(response.data.lectures)
    } catch (error) {
      console.error('Error fetching lectures:', error)
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Explore Courses</h1>

        {/* Category Filter */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center text-2xl">Loading courses...</div>
        ) : lectures.length === 0 ? (
          <div className="text-center text-xl">No courses found in this category</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lectures.map((lecture) => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                onClick={() => navigate(`/lecture/${lecture.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Courses
