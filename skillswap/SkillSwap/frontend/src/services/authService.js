import axios from 'axios';
import { API_URL } from '../utils/constants';

const authService = {
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

    googleLogin: async (token) => {
        const response = await axios.post(`${API_URL}/auth/google`, { idToken: token });
        return response.data;
    },

    facebookLogin: async (token) => {
        const response = await axios.post(`${API_URL}/auth/facebook`, { accessToken: token });
        return response.data;
    },

    microsoftLogin: async (token) => {
        const response = await axios.post(`${API_URL}/auth/microsoft`, { accessToken: token });
        return response.data;
    }
};

export default authService;