import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const skillService = {
  // Get all skills
  getAllSkills: (page = 1, limit = 12, search = '', category = '') => {
    return axios.get(`${API_URL}/skills/all`, {
      params: { page, limit, search, category },
    })
  },

  // Get skill by ID
  getSkillById: (id) => {
    return axios.get(`${API_URL}/skills/${id}`)
  },

  // Get categories
  getCategories: () => {
    return axios.get(`${API_URL}/skills/categories`)
  },

  // Get trending skills
  getTrendingSkills: () => {
    return axios.get(`${API_URL}/skills/trending`)
  },

  // Add skill to user (become mentor/learner)
  addSkillToUser: (skillId, type, proficiencyLevel = 'Intermediate') => {
    return axios.post(
      `${API_URL}/skills/add-to-user`,
      { skillId, type, proficiencyLevel },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
  },

  // Get user's teaching skills
  getUserTeachingSkills: (userId) => {
    return axios.get(`${API_URL}/skills/user/${userId}/teaching`)
  },

  // Get user's learning skills
  getUserLearningSkills: () => {
    return axios.get(`${API_URL}/skills/user/learning`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
  },
}

const sessionService = {
  // Create session request
  createSessionRequest: (mentorId, skillId, title, description, scheduleDate, duration = 60) => {
    return axios.post(
      `${API_URL}/sessions`,
      { mentorId, skillId, title, description, scheduleDate, duration },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
  },

  // Get mentor sessions
  getMentorSessions: (status = 'Pending') => {
    return axios.get(`${API_URL}/sessions/mentor`, {
      params: { status },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
  },

  // Get learner sessions
  getLearnerSessions: (status = '') => {
    return axios.get(`${API_URL}/sessions/learner`, {
      params: { status },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
  },

  // Get all sessions
  getAllSessions: () => {
    return axios.get(`${API_URL}/sessions/all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
  },

  // Approve session
  approveSession: (sessionId) => {
    return axios.put(
      `${API_URL}/sessions/${sessionId}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
  },

  // Reject session
  rejectSession: (sessionId, reason) => {
    return axios.put(
      `${API_URL}/sessions/${sessionId}/reject`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
  },

  // Complete session
  completeSession: (sessionId, mentorRating, learnerRating) => {
    return axios.put(
      `${API_URL}/sessions/${sessionId}/complete`,
      { mentorRating, learnerRating },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
  },

  // Cancel session
  cancelSession: (sessionId) => {
    return axios.delete(`${API_URL}/sessions/${sessionId}/cancel`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
  },
}

const reviewService = {
  // Create review
  createReview: (mentorId, skillId, rating, title, comment, category = 'Overall') => {
    return axios.post(
      `${API_URL}/reviews`,
      { mentorId, skillId, rating, title, comment, category },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
  },

  // Get mentor reviews
  getMentorReviews: (mentorId, skillId = '') => {
    return axios.get(`${API_URL}/reviews/mentor/${mentorId}`, {
      params: { skillId },
    })
  },

  // Get mentor profile
  getMentorProfile: (mentorId) => {
    return axios.get(`${API_URL}/reviews/profile/${mentorId}`)
  },

  // Get top mentors
  getTopMentors: (skillId = '', limit = 10) => {
    return axios.get(`${API_URL}/reviews/top-mentors`, {
      params: { skillId, limit },
    })
  },

  // Create rating
  createRating: (mentorId, userSkillId, rating, feedback, isAnonymous = false) => {
    return axios.post(
      `${API_URL}/reviews/rating`,
      { mentorId, userSkillId, rating, feedback, isAnonymous },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
  },
}

export { skillService, sessionService, reviewService }
