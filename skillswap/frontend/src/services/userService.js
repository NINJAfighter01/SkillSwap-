import axios from 'axios'

const API_URL = '/api'

const userService = {
  getProfile: () =>
    axios.get(`${API_URL}/users/profile`),

  updateProfile: (profileData) =>
    axios.put(`${API_URL}/users/profile`, profileData),

  getProgress: () =>
    axios.get(`${API_URL}/users/progress`),

  updateProgress: (progressData) =>
    axios.put(`${API_URL}/users/progress`, progressData),

  getPortfolio: () =>
    axios.get(`${API_URL}/users/portfolio`),

  updatePortfolio: (portfolioData) =>
    axios.put(`${API_URL}/users/portfolio`, portfolioData),
}

export default userService
