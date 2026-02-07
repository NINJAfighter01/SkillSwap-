import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import axios from 'axios'

const LearnAnything = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [skills, setSkills] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchSkills()
  }, [selectedCategory, searchTerm])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/skills/categories')
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSkills = async () => {
    setLoading(true)
    try {
      const params = {
        search: searchTerm,
        category: selectedCategory,
        limit: 12,
      }
      const response = await axios.get('http://localhost:5000/api/skills/all', { params })
      setSkills(response.data.skills || [])
    } catch (error) {
      console.error('Error fetching skills:', error)
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className={`mb-12 rounded-lg p-12 ${isDark ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white text-center`}>
          <h1 className="text-5xl font-bold mb-4">🎓 Learn Anything</h1>
          <p className="text-xl mb-6">Connect with top mentors and learn new skills through live sessions</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-4 rounded-lg border-2 text-lg ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-black'
            } focus:outline-none focus:border-purple-500`}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
              selectedCategory === ''
                ? 'bg-purple-600 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Skills
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="text-center text-2xl">Loading skills...</div>
        ) : skills.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <p className="text-2xl font-bold mb-4">📚 No skills found</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Try different search terms or categories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {skills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => navigate(`/skill/${skill.id}`)}
                className={`rounded-lg p-6 cursor-pointer transition transform hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:shadow-xl' : 'bg-white hover:shadow-xl'
                } shadow-lg`}
              >
                <div className="text-4xl mb-4">{skill.icon || '🎯'}</div>
                <h3 className="text-xl font-bold mb-2">{skill.title}</h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {skill.description?.substring(0, 100)}...
                </p>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    {skill.category}
                  </span>
                  {skill.averageRating > 0 && (
                    <span className="text-yellow-500 font-bold">⭐ {skill.averageRating.toFixed(1)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LearnAnything
