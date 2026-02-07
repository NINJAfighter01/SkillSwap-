import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { reviewService, skillService } from '../services/peerLearningService'

const TopMentors = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState('')
  const [skills, setSkills] = useState([])
  const [filteredMentors, setFilteredMentors] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterMentors()
  }, [selectedSkill, mentors])

  const fetchData = async () => {
    try {
      // Get top mentors
      const mentorsRes = await reviewService.getTopMentors(null, 50)
      setMentors(mentorsRes.data.mentors || [])

      // Get all skills for filtering
      const skillsRes = await skillService.getAllSkills(1, 100)
      setSkills(skillsRes.data.skills || [])

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const filterMentors = () => {
    if (!selectedSkill) {
      setFilteredMentors(mentors)
    } else {
      // Filter mentors that teach the selected skill
      const filtered = mentors.filter((mentor) =>
        mentor.teachingSkills?.some((skill) => skill.id == selectedSkill)
      )
      setFilteredMentors(filtered)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-2xl">Loading top mentors...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🏆 Top Mentors</h1>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Learn from the best teachers on SkillSwap (Rated 4.0+ stars)
          </p>
        </div>

        {/* Filter by Skill */}
        <div className="mb-8">
          <label className="block text-lg font-bold mb-3">Filter by Skill:</label>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className={`w-full md:w-64 p-3 rounded-lg border-2 ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:border-purple-500 focus:outline-none`}
          >
            <option value="">All Skills</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.title}
              </option>
            ))}
          </select>
        </div>

        {/* Mentors Grid */}
        {filteredMentors.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <p className="text-2xl font-bold mb-4">😔 No mentors found</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor, index) => (
              <div
                key={mentor.id}
                className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition transform hover:scale-105`}
              >
                {/* Rank Badge */}
                {index < 3 && (
                  <div className="absolute top-4 right-4">
                    {index === 0 && <span className="text-3xl">🥇</span>}
                    {index === 1 && <span className="text-3xl">🥈</span>}
                    {index === 2 && <span className="text-3xl">🥉</span>}
                  </div>
                )}

                {/* Avatar & Name */}
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-4xl">
                    {mentor.name?.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <h3 className="text-xl font-bold">{mentor.name}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {mentor.email}
                  </p>
                </div>

                {/* Stats */}
                <div className={`grid grid-cols-1 gap-2 mb-4 p-3 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex justify-center items-center gap-2">
                    <span className="text-2xl font-bold">⭐ {mentor.averageRating?.toFixed(1) || 'N/A'}</span>
                    <span className="text-sm text-gray-500">({mentor.totalReviews || 0} reviews)</span>
                  </div>
                  <div className="text-sm text-center">
                    <p>📚 {mentor.teachingSkills?.length || 0} skills • {mentor.completedSessions || 0} sessions</p>
                  </div>
                </div>

                {/* Bio */}
                <p className={`text-sm mb-4 line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {mentor.bio || 'Passionate instructor ready to help you learn'}
                </p>

                {/* Teaching Skills */}
                {mentor.teachingSkills && mentor.teachingSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 mb-2">TEACHES:</p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.teachingSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill.id}
                          className={`px-2 py-1 text-xs rounded-full ${
                            isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {skill.title}
                        </span>
                      ))}
                      {mentor.teachingSkills.length > 3 && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          +{mentor.teachingSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => navigate(`/mentor/${mentor.id}`)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold transition"
                >
                  View Profile →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TopMentors
