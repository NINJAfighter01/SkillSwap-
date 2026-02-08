import axios from 'axios';
import { API_URL } from '../utils/constants';

// Function to initiate payment
export const initiatePayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_URL}/payments/initiate`, paymentData);
        return response.data;
    } catch (error) {
        throw new Error('Payment initiation failed: ' + error.message);
    }
};

// Function to verify payment
export const verifyPayment = async (paymentId, orderId) => {
    try {
        const response = await axios.post(`${API_URL}/payments/verify`, { paymentId, orderId });
        return response.data;
    } catch (error) {
        throw new Error('Payment verification failed: ' + error.message);
    }
};

// Function to get subscription plans
export const getSubscriptionPlans = async () => {
    try {
        const response = await axios.get(`${API_URL}/payments/plans`);
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch subscription plans: ' + error.message);
    }
};

// Function to get user's wallet balance
export const getWalletBalance = async () => {
    try {
        const response = await axios.get(`${API_URL}/payments/wallet`);
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch wallet balance: ' + error.message);
    }
};

// Function to get user's token transaction history
export const getTokenHistory = async () => {
    try {
        const response = await axios.get(`${API_URL}/payments/token-history`);
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch token history: ' + error.message);
    }
};