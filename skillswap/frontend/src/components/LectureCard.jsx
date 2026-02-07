import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const LectureCard = ({ lecture, onClick }) => {
  const { isDark } = useContext(ThemeContext)

  return (
    <div
      onClick={onClick}
      className={`rounded-lg overflow-hidden shadow-lg cursor-pointer transition transform hover:shadow-xl hover:scale-105 ${
        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <span className="text-4xl">🎓</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{lecture.title}</h3>
        <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {lecture.description}
        </p>
        <div className="flex justify-between items-center">
          <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            By {lecture.teacherName}
          </span>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            {lecture.tokens} tokens
          </span>
        </div>
      </div>
    </div>
  )
}

export default LectureCard
