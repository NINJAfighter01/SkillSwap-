import axios from 'axios';
import { API_URL } from '../utils/constants';

const userService = {
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(`${API_URL}/auth/logout`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axios.put(`${API_URL}/users/profile`, userData);
    return response.data;
  },

  getUserProgress: async () => {
    const response = await axios.get(`${API_URL}/users/progress`);
    return response.data;
  },

  getUserPortfolio: async () => {
    const response = await axios.get(`${API_URL}/users/portfolio`);
    return response.data;
  },
};

export default userService;