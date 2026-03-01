import React, { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { reviewService, skillService } from '../services/peerLearningService'

const MentorProfile = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const { mentorId } = useParams()
  const [mentor, setMentor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [teachingSkills, setTeachingSkills] = useState([])
  const [mentorStats, setMentorStats] = useState({
    totalReviews: 0,
    studentReviews: 0,
    totalSessions: 0,
    completedSessions: 0,
    completionRate: 0,
    averageResponseTimeMinutes: null,
    averageRating: 0,
    isTopMentor: false,
    isVerifiedMentor: false,
  })
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState(null)

  useEffect(() => {
    fetchMentorData()
  }, [mentorId])

  const fetchMentorData = async () => {
    try {
      // Get mentor profile with stats
      const profileRes = await reviewService.getMentorProfile(mentorId)
      setMentor(profileRes.data.mentor || {})
      setMentorStats(profileRes.data.stats || {})

      // Get mentor reviews
      const reviewsRes = await reviewService.getMentorReviews(mentorId)
      setReviews(reviewsRes.data.reviews || [])

      // Get teaching skills
      const skillsRes = await skillService.getUserTeachingSkills(mentorId)
      setTeachingSkills(skillsRes.data.skills || [])

      setLoading(false)
    } catch (error) {
      console.error('Error fetching mentor data:', error)
      setLoading(false)
    }
  }

  const handleRequestSession = (skillId) => {
    navigate(`/skill/${skillId}`)
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-2xl">Loading mentor profile...</div>
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-2xl">Mentor not found</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
        >
          ← Back
        </button>

        {/* Mentor Card */}
        <div className={`rounded-lg p-8 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar & Basic Info */}
            <div className="md:w-1/3 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-5xl">
                {mentor.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <h1 className="text-3xl font-bold mb-2">{mentor.name}</h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{mentor.email}</p>

              {/* Rating & Badge */}
              <div className="flex flex-col gap-3">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <p className="text-3xl font-bold">⭐ {mentorStats.averageRating?.toFixed?.(1) || mentor.averageRating?.toFixed?.(1) || 'N/A'}/5</p>
                </div>

                {mentorStats.isVerifiedMentor && (
                  <div className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-center">
                    ✅ Verified Mentor
                  </div>
                )}

                {mentorStats.isTopMentor && (
                  <div className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold text-center">
                    🏆 Top Mentor
                  </div>
                )}

                {mentorStats.averageResponseTimeMinutes !== null && mentorStats.averageResponseTimeMinutes <= 120 && (
                  <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-center">
                    ⚡ Quick Responder
                  </div>
                )}
              </div>
            </div>

            {/* Stats & Bio */}
            <div className="md:w-2/3">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3">📝 About</h2>
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {mentor.bio || 'No bio provided'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500">Student Reviews</p>
                  <p className="text-2xl font-bold">{mentorStats.studentReviews || mentorStats.totalReviews || 0}</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500">Completed Sessions</p>
                  <p className="text-2xl font-bold">{mentorStats.completedSessions || 0}</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500">Skills Teaching</p>
                  <p className="text-2xl font-bold">{teachingSkills.length}</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-bold">{mentorStats.completionRate || 0}%</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="text-2xl font-bold">
                    {mentorStats.averageResponseTimeMinutes === null
                      ? 'N/A'
                      : mentorStats.averageResponseTimeMinutes < 60
                        ? `${mentorStats.averageResponseTimeMinutes}m`
                        : `${Math.round(mentorStats.averageResponseTimeMinutes / 60)}h`}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500">Total Sessions</p>
                  <p className="text-2xl font-bold">{mentorStats.totalSessions || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Skills */}
        {teachingSkills.length > 0 && (
          <div className={`rounded-lg p-8 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className="text-2xl font-bold mb-6">🛠️ Teaching Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachingSkills.map((skill) => (
                <div
                  key={skill.id}
                  className={`p-4 rounded-lg border-2 ${
                    isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  } hover:border-purple-500 transition`}
                >
                  <h3 className="text-xl font-bold mb-2">{skill.title}</h3>
                  <p className="text-sm mb-3">{skill.category}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold">
                      Proficiency: {skill.UserSkill?.proficiencyLevel || 'N/A'}
                    </span>
                    {skill.averageRating && <span className="text-yellow-500">⭐ {skill.averageRating}</span>}
                  </div>
                  <button
                    onClick={() => handleRequestSession(skill.id)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold transition"
                  >
                    Request Session →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className={`rounded-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className="text-2xl font-bold mb-6">⭐ Reviews</h2>

          {reviews.length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No reviews yet
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-l-4 border-yellow-500`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold">{review.title}</h4>
                      <p className="text-sm text-gray-500">{review.reviewer?.name || 'Anonymous'}</p>
                    </div>
                    <span className="text-xl font-bold">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {review.comment}
                  </p>
                  {review.Skill && (
                    <p className="text-xs font-bold text-purple-500">📚 {review.Skill.title}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MentorProfile
