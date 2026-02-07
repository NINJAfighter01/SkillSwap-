import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import LectureCard from '../components/LectureCard'
import lectureService from '../services/lectureService'
import { useNavigate } from 'react-router-dom'

const Lectures = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [lectures, setLectures] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(true)

  useEffect(() => {
    fetchLectures()
  }, [page])

  const fetchLectures = async () => {
    setLoading(true)
    try {
      const response = await lectureService.getAllLectures(page, 12, '')
      setLectures(response.data.lectures)
      // If we got less than 12 items, we're on the last page
      setHasNextPage(response.data.lectures.length === 12)
    } catch (error) {
      console.error('Error fetching lectures:', error)
      setLectures([])
    }
    setLoading(false)
  }

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(page + 1)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Explore Lectures</h1>

        {/* Lectures Grid */}
        {loading ? (
          <div className="text-center text-2xl">Loading...</div>
        ) : (
          <>
            {lectures.length === 0 ? (
              <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <p className="text-2xl font-bold mb-4">📚 No lectures found</p>
                {page > 1 && (
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Click Previous to go back
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {lectures.map((lecture) => (
                  <LectureCard
                    key={lecture.id}
                    lecture={lecture}
                    onClick={() => navigate(`/lecture/${lecture.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Pagination - Always shown */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                disabled={page === 1}
                onClick={handlePreviousPage}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-lg"
              >
                ⬅️ Previous
              </button>
              <span className={`px-6 py-3 text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                Page {page}
              </span>
              <button
                disabled={!hasNextPage || lectures.length === 0}
                onClick={handleNextPage}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-lg"
              >
                Next ➡️
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Lectures
