// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  AUTH_GOOGLE: '/auth/google',
  AUTH_FACEBOOK: '/auth/facebook',
  AUTH_MICROSOFT: '/auth/microsoft',

  // Lectures
  LECTURES_LIST: '/lectures',
  LECTURES_GET: (id) => `/lectures/${id}`,
  LECTURES_CREATE: '/lectures',
  LECTURES_UPDATE: (id) => `/lectures/${id}`,
  LECTURES_DELETE: (id) => `/lectures/${id}`,
  LECTURES_WATCH: (id) => `/lectures/${id}/watch`,
  LECTURES_TEACHER: '/lectures/teacher/list',

  // Notes
  NOTES_GET: (lectureId) => `/notes/lecture/${lectureId}`,
  NOTES_CREATE: '/notes',
  NOTES_UPDATE: (id) => `/notes/${id}`,
  NOTES_DELETE: (id) => `/notes/${id}`,
  NOTES_DOWNLOAD: (lectureId) => `/notes/lecture/${lectureId}/download`,

  // Payments
  PAYMENTS_PLANS: '/payments/plans',
  PAYMENTS_INITIATE: '/payments/initiate',
  PAYMENTS_VERIFY: '/payments/verify',
  PAYMENTS_SUBSCRIPTION: '/payments/subscription',
  PAYMENTS_TOKEN_HISTORY: '/payments/token-history',
  PAYMENTS_WALLET: '/payments/wallet',

  // Users
  USERS_PROFILE: '/users/profile',
  USERS_PROGRESS: '/users/progress',
  USERS_PORTFOLIO: '/users/portfolio',

  // Feedback
  FEEDBACK_SUBMIT: '/feedback',
  FEEDBACK_LIST: '/feedback',
  CONTACT_SUBMIT: '/contact',
}

export const getApiBaseUrl = () => API_BASE_URL

export const getFullApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`
