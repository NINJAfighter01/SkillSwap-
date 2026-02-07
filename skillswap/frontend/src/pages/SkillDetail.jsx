import React, { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import axios from 'axios'

const SkillDetail = () => {
  const { isDark } = useContext(ThemeContext)
  const { skillId } = useParams()
  const navigate = useNavigate()
  const [skill, setSkill] = useState(null)
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduleDate: '',
    duration: 60,
  })

  useEffect(() => {
    fetchSkillDetail()
  }, [skillId])

  const fetchSkillDetail = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`http://localhost:5000/api/skills/${skillId}`)
      setSkill(response.data.skill)
      // Extract mentors from UserSkills
      const mentorsData = response.data.skill.UserSkills?.map((us) => ({
        ...us.User,
        rating: us.rating,
        sessionsCompleted: us.sessionsCompleted,
        proficiencyLevel: us.proficiencyLevel,
      })) || []
      setMentors(mentorsData)
    } catch (error) {
      console.error('Error fetching skill:', error)
    }
    setLoading(false)
  }

  const handleRequestSession = async (e) => {
    e.preventDefault()
    if (!selectedMentor) {
      alert('Please select a mentor')
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/sessions',
        {
          mentorId: selectedMentor.id,
          skillId: skillId,
          title: formData.title,
          description: formData.description,
          scheduleDate: formData.scheduleDate,
          duration: parseInt(formData.duration),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      alert('✅ Session request sent successfully!')
      setFormData({ title: '', description: '', scheduleDate: '', duration: 60 })
      setShowRequestForm(false)
      setSelectedMentor(null)
    } catch (error) {
      alert('❌ Error requesting session: ' + error.response?.data?.message)
    }
  }

  if (loading) {
    return <div className="text-center text-2xl py-12">Loading...</div>
  }

  if (!skill) {
    return (
      <div className={`text-center py-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        <p className="text-2xl">Skill not found</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Skill Header */}
        <div className={`rounded-lg p-8 mb-8 ${isDark ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white`}>
          <h1 className="text-5xl font-bold mb-4">{skill.title}</h1>
          <p className="text-xl mb-4">{skill.description}</p>
          <div className="flex gap-4">
            <span className="px-4 py-2 bg-white text-purple-600 rounded-lg font-bold">
              📚 {skill.category}
            </span>
            {skill.averageRating > 0 && (
              <span className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-bold">
                ⭐ {skill.averageRating.toFixed(1)} ({skill.totalReviews} reviews)
              </span>
            )}
          </div>
        </div>

        {/* Mentors Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8">👨‍🏫 Available Mentors ({mentors.length})</h2>

          {mentors.length === 0 ? (
            <div className={`rounded-lg p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <p className="text-xl">No mentors available for this skill yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition`}
                >
                  <div className="flex items-center mb-4">
                    {mentor.profilePicture ? (
                      <img
                        src={mentor.profilePicture}
                        alt={mentor.name}
                        className="w-16 h-16 rounded-full mr-4"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mr-4 text-2xl font-bold">
                        {mentor.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{mentor.name}</h3>
                      {mentor.rating > 0 && (
                        <p className="text-yellow-500">⭐ {mentor.rating.toFixed(1)}</p>
                      )}
                    </div>
                  </div>

                  {mentor.bio && (
                    <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {mentor.bio}
                    </p>
                  )}

                  <div className="flex flex-col gap-2 mb-4">
                    <span className="text-sm">Level: {mentor.proficiencyLevel}</span>
                    <span className="text-sm">Sessions: {mentor.sessionsCompleted}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMentor(mentor)
                      setShowRequestForm(true)
                    }}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-bold transition"
                  >
                    Request Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Request Session Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg p-8 max-w-lg w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-2xl font-bold mb-6">
                Request Session with {selectedMentor?.name}
              </h3>

              <form onSubmit={handleRequestSession} className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Session Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Learn React Basics"
                    className={`w-full p-3 rounded-lg border-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What would you like to learn?"
                    rows="4"
                    className={`w-full p-3 rounded-lg border-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Preferred Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduleDate}
                    onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                    className={`w-full p-3 rounded-lg border-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    min="30"
                    max="180"
                    className={`w-full p-3 rounded-lg border-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-bold transition"
                  >
                    Send Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 font-bold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SkillDetail
