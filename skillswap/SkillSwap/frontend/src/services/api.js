import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Base URL for the API

// Set up axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Get token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Add token to headers
  }
  return config;
});

// Function to handle GET requests
export const get = async (endpoint) => {
  const response = await api.get(endpoint);
  return response.data;
};

// Function to handle POST requests
export const post = async (endpoint, data) => {
  const response = await api.post(endpoint, data);
  return response.data;
};

// Function to handle PUT requests
export const put = async (endpoint, data) => {
  const response = await api.put(endpoint, data);
  return response.data;
};

// Function to handle DELETE requests
export const del = async (endpoint) => {
  const response = await api.delete(endpoint);
  return response.data;
};

export default api;