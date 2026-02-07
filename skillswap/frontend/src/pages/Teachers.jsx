import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import lectureService from '../services/lectureService'

const Teachers = () => {
  const { isDark } = useContext(ThemeContext)
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch teachers data
    // This would normally come from an API endpoint like /api/teachers
    const sampleTeachers = [
      { id: 1, name: 'Dr. Sarah Johnson', rating: 4.9, courses: 12, students: 5000, bio: 'Expert in Web Development' },
      { id: 2, name: 'Prof. John Smith', rating: 4.8, courses: 8, students: 3200, bio: 'Backend & Databases Specialist' },
      { id: 3, name: 'Maya Patel', rating: 5, courses: 15, students: 7100, bio: 'Full Stack Developer' },
      { id: 4, name: 'James Wilson', rating: 4.7, courses: 6, students: 2400, bio: 'Mobile App Developer' },
      { id: 5, name: 'Emma Davis', rating: 4.9, courses: 10, students: 4300, bio: 'AI & Machine Learning Expert' },
      { id: 6, name: 'Alex Chen', rating: 4.8, courses: 9, students: 3800, bio: 'DevOps & Cloud Expert' },
    ]
    setTeachers(sampleTeachers)
    setLoading(false)
  }, [])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Meet Our Teachers</h1>

        {loading ? (
          <div className="text-center text-2xl">Loading teachers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} hover:shadow-xl transition`}
              >
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-4xl font-bold mb-4">
                    {teacher.name?.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold">{teacher.name}</h3>
                  <p className="text-yellow-400 mt-1">
                    {'⭐'.repeat(Math.floor(teacher.rating))} {teacher.rating}
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {teacher.bio}
                  </p>
                </div>

                <div className="flex justify-around mb-6 py-4 border-t border-b">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{teacher.courses}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{(teacher.students / 1000).toFixed(1)}k</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Students</p>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mb-2">
                  View Profile
                </button>
                <button className={`w-full py-2 rounded-lg font-semibold transition border-2 ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}>
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Teachers
