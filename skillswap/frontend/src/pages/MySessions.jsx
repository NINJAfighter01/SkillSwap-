import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { sessionService } from '../services/peerLearningService'

const MySessions = () => {
  const { isDark } = useContext(ThemeContext)
  const [activeTab, setActiveTab] = useState('mentor') // mentor vs learner
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [activeTab, selectedStatus])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      let response
      if (activeTab === 'mentor') {
        response = await sessionService.getMentorSessions(selectedStatus)
      } else {
        response = await sessionService.getLearnerSessions(selectedStatus)
      }
      setSessions(response.data.sessions || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
    setLoading(false)
  }

  const handleApprove = async (sessionId) => {
    try {
      await sessionService.approveSession(sessionId)
      alert('✅ Session approved!')
      fetchSessions()
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message)
    }
  }

  const handleReject = async (sessionId) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    try {
      await sessionService.rejectSession(sessionId, reason)
      alert('✅ Session rejected!')
      fetchSessions()
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message)
    }
  }

  const handleComplete = async (sessionId) => {
    const ratingStr = prompt('Rate this session (1-5):')
    if (!ratingStr) return

    const rating = parseFloat(ratingStr)
    if (rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5')
      return
    }

    try {
      if (activeTab === 'mentor') {
        await sessionService.completeSession(sessionId, null, rating)
      } else {
        await sessionService.completeSession(sessionId, rating, null)
      }
      alert('✅ Session completed!')
      fetchSessions()
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message)
    }
  }

  const handleCancel = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return

    try {
      await sessionService.cancelSession(sessionId)
      alert('✅ Session cancelled!')
      fetchSessions()
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-600'
      case 'Approved':
        return 'bg-green-600'
      case 'Rejected':
        return 'bg-red-600'
      case 'Completed':
        return 'bg-blue-600'
      case 'Cancelled':
        return 'bg-gray-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8">📅 My Sessions</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('mentor')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'mentor'
                ? 'bg-purple-600 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            👨‍🏫 Teaching Sessions
          </button>
          <button
            onClick={() => setActiveTab('learner')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'learner'
                ? 'bg-purple-600 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            👨‍🎓 Learning Sessions
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
              selectedStatus === ''
                ? 'bg-purple-600 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300'
                : 'bg-white text-gray-700'
            }`}
          >
            All
          </button>
          {['Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
                selectedStatus === status
                  ? 'bg-purple-600 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-white text-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="text-center text-2xl">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <p className="text-2xl font-bold mb-4">📭 No sessions found</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {activeTab === 'mentor'
                ? 'No learners have requested sessions yet'
                : 'You haven\'t requested any sessions yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{session.title}</h3>
                    <p className="text-sm">{session.Skill?.category} - {session.Skill?.title}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-white font-bold ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>

                {/* User Information */}
                <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                  {activeTab === 'mentor' ? (
                    <div>
                      <p className="font-bold">👨‍🎓 Learner: {session.learner?.name}</p>
                      <p className="text-sm">{session.learner?.email}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold">👨‍🏫 Mentor: {session.mentor?.name}</p>
                      <p className="text-sm">{session.mentor?.bio}</p>
                    </div>
                  )}
                </div>

                {/* Session Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">📅 Date</p>
                    <p className="font-bold">{new Date(session.scheduleDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">⏰ Time</p>
                    <p className="font-bold">{new Date(session.scheduleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">⏱️ Duration</p>
                    <p className="font-bold">{session.duration} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">🎯 Type</p>
                    <p className="font-bold">{session.sessionType}</p>
                  </div>
                </div>

                {session.description && (
                  <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400">📝 Description</p>
                    <p>{session.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {session.status === 'Pending' && activeTab === 'mentor' && (
                    <>
                      <button
                        onClick={() => handleApprove(session.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReject(session.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition"
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}

                  {(session.status === 'Pending' || session.status === 'Approved') && (
                    <button
                      onClick={() => handleCancel(session.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-bold transition"
                    >
                      🚫 Cancel
                    </button>
                  )}

                  {session.status === 'Approved' && (
                    <button
                      onClick={() => handleComplete(session.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition"
                    >
                      ✏️ Rate & Complete
                    </button>
                  )}

                  {session.status === 'Completed' && (
                    <div className="flex gap-4">
                      {activeTab === 'mentor' && session.learnerRating && (
                        <div className="px-4 py-2 bg-yellow-600 rounded-lg">
                          <p className="text-sm">Learner Rating</p>
                          <p className="font-bold">⭐ {session.learnerRating}/5</p>
                        </div>
                      )}
                      {activeTab === 'learner' && session.mentorRating && (
                        <div className="px-4 py-2 bg-yellow-600 rounded-lg">
                          <p className="text-sm">Your Rating</p>
                          <p className="font-bold">⭐ {session.mentorRating}/5</p>
                        </div>
                      )}
                    </div>
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

export default MySessions
