import axios from 'axios'

const API_URL = '/api'

const feedbackService = {
  submitFeedback: (feedbackData) =>
    axios.post(`${API_URL}/feedback`, feedbackData),

  getFeedback: (page = 1, limit = 10) =>
    axios.get(`${API_URL}/feedback?page=${page}&limit=${limit}`),

  contactForm: (contactData) =>
    axios.post(`${API_URL}/contact`, contactData),
}

export default feedbackService
