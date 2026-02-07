import axios from 'axios'

const API_URL = '/api'

const authService = {
  register: (userData) => axios.post(`${API_URL}/auth/register`, userData),
  login: (credentials) => axios.post(`${API_URL}/auth/login`, credentials),
  logout: () => axios.post(`${API_URL}/auth/logout`),
  getMe: () => axios.get(`${API_URL}/auth/me`),
  googleLogin: (token) => axios.post(`${API_URL}/auth/google`, { token }),
  facebookLogin: (token) => axios.post(`${API_URL}/auth/facebook`, { token }),
  microsoftLogin: (token) => axios.post(`${API_URL}/auth/microsoft`, { token }),
}

export default authService
