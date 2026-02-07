import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { useParams } from 'react-router-dom'
import lectureService from '../services/lectureService'
import userService from '../services/userService'

const CoursePage = () => {
  const { isDark } = useContext(ThemeContext)
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [lecturer, setLecturer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourse()
  }, [id])

  const fetchCourse = async () => {
    try {
      const response = await lectureService.getLectureById(id)
      setCourse(response.data)
      // Set lecturer info (in real app, would fetch from API)
      setLecturer({
        id: response.data.teacherId,
        name: response.data.teacherName,
        lecturesCount: 5,
        rating: 4.8,
      })
    } catch (error) {
      console.error('Error fetching course:', error)
    }
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>
  if (!course) return <div>Course not found</div>

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className={`rounded-lg overflow-hidden shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Preview */}
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-6xl">📹</span>
              </div>

              {/* Course Info */}
              <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                
                <div className="flex gap-4 mb-6 pb-6 border-b">
                  <div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Category</p>
                    <p className="font-bold">{course.category}</p>
                  </div>
                  <div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Duration</p>
                    <p className="font-bold">{course.duration} minutes</p>
                  </div>
                  <div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Students</p>
                    <p className="font-bold">{course.views || 0}</p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-3">About this course</h2>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {course.fullDescription || course.description}
                </p>

                {course.isPremium && (
                  <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-purple-900' : 'bg-purple-100'}`}>
                    <p className="font-bold">💎 Premium Content</p>
                    <p className={isDark ? 'text-purple-200' : 'text-purple-700'}>
                      Subscribe to access this course
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Course Card */}
            <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} sticky top-20`}>
              <div className="text-4xl mb-4 font-bold text-blue-600">{course.tokens} Tokens</div>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Per course enrollment
              </p>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mb-3">
                Enroll Now
              </button>
              <button className={`w-full py-3 rounded-lg font-bold border-2 ${
                isDark
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}>
                Add to Wishlist
              </button>
            </div>

            {/* Instructor Info */}
            {lecturer && (
              <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-xl font-bold mb-4">Instructor</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {lecturer.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{lecturer.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      ⭐ {lecturer.rating} rating
                    </p>
                  </div>
                </div>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {lecturer.lecturesCount} courses published
                </p>
                <button className={`w-full py-2 rounded-lg font-semibold transition ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}>
                  View Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePage
