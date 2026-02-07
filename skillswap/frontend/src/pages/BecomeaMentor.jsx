import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { skillService } from '../services/peerLearningService'

const BecomeaMentor = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [skills, setSkills] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSkills, setSelectedSkills] = useState({}) // { skillId: { proficiency, experience } }
  const [filteredSkills, setFilteredSkills] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [bio, setBio] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    filterSkills()
  }, [searchTerm, selectedCategory, skills])

  const fetchInitialData = async () => {
    try {
      const skillsRes = await skillService.getAllSkills(1, 100)
      const categoriesRes = await skillService.getCategories()
      setSkills(skillsRes.data.skills || [])
      setCategories(categoriesRes.data.categories || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching skills:', error)
      setLoading(false)
    }
  }

  const filterSkills = () => {
    let filtered = skills

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((s) => s.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSkills(filtered)
  }

  const toggleSkill = (skillId) => {
    setSelectedSkills((prev) => {
      const updated = { ...prev }
      if (updated[skillId]) {
        delete updated[skillId]
      }
      return updated
    })
  }

  const updateSkillProficiency = (skillId, proficiency) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        proficiency
      }
    }))
  }

  const updateSkillExperience = (skillId, experience) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        experience
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (Object.keys(selectedSkills).length === 0) {
      alert('❌ Please select at least one skill!')
      return
    }

    if (bio.trim().length < 10) {
      alert('❌ Bio must be at least 10 characters!')
      return
    }

    try {
      // Add each skill as teaching skill
      for (const [skillId, data] of Object.entries(selectedSkills)) {
        await skillService.addSkillToUser(skillId, 'teach', data.proficiency || 'Expert')
      }

      alert('✅ You are now a mentor! Your skills have been added.')
      navigate('/dashboard')
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-2xl">Loading...</div>
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🎓 Become a Mentor</h1>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Share your expertise and earn by teaching others
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Bio Section */}
          <div className={`rounded-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className="text-2xl font-bold mb-4">📝 Your Bio</h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell learners about yourself, your experience, and teaching style. (Min 10 characters)"
              className={`w-full p-4 rounded-lg border-2 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:border-purple-500 focus:outline-none`}
              rows="4"
            />
            <p className={`text-sm mt-2 ${bio.length >= 10 ? 'text-green-500' : 'text-red-500'}`}>
              {bio.length}/50 characters (minimum 10)
            </p>
          </div>

          {/* Skills Selection */}
          <div className={`rounded-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className="text-2xl font-bold mb-6">🛠️ Select Skills You Can Teach</h2>

            {/* Search & Filter */}
            <div className="flex flex-col gap-4 md:flex-row md:gap-4 mb-6">
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 p-3 rounded-lg border-2 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:border-purple-500 focus:outline-none`}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`p-3 rounded-lg border-2 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:border-purple-500 focus:outline-none`}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Skills Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6`}>
              {filteredSkills.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">No skills found</p>
              ) : (
                filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedSkills[skill.id]
                        ? `${isDark ? 'bg-purple-900 border-purple-500' : 'bg-purple-100 border-purple-500'}`
                        : `${isDark ? 'bg-gray-700 border-gray-600 hover:border-purple-500' : 'bg-gray-50 border-gray-300 hover:border-purple-500'}`
                    }`}
                    onClick={() => toggleSkill(skill.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!selectedSkills[skill.id]}
                            onChange={() => {}}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <h3 className="font-bold text-lg">{skill.title}</h3>
                        </div>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {skill.category}
                        </p>
                      </div>
                      {skill.averageRating && (
                        <span className="text-yellow-500 ml-2">⭐ {skill.averageRating}</span>
                      )}
                    </div>

                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {skill.description.substring(0, 80)}...
                    </p>

                    {/* Proficiency Level - only show if skill is selected */}
                    {selectedSkills[skill.id] && (
                      <div className="mt-3">
                        <label className="text-sm font-bold">Your Proficiency Level:</label>
                        <select
                          value={selectedSkills[skill.id].proficiency || 'Expert'}
                          onChange={(e) => updateSkillProficiency(skill.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className={`mt-1 w-full p-2 rounded border ${
                            isDark
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Selected Skills Summary */}
            {Object.keys(selectedSkills).length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900 border border-purple-500' : 'bg-purple-100 border border-purple-300'}`}>
                <p className="font-bold mb-2">
                  ✅ Selected {Object.keys(selectedSkills).length} skill(s):
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(selectedSkills).map((skillId) => {
                    const skill = skills.find((s) => s.id == skillId)
                    return (
                      <span
                        key={skillId}
                        className={`px-3 py-1 rounded-full ${
                          isDark ? 'bg-purple-700' : 'bg-purple-200'
                        }`}
                      >
                        {skill?.title}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 mb-8">
            <button
              type="submit"
              disabled={Object.keys(selectedSkills).length === 0 || bio.length < 10}
              className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition ${
                Object.keys(selectedSkills).length === 0 || bio.length < 10
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              🎉 Become a Mentor
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BecomeaMentor
