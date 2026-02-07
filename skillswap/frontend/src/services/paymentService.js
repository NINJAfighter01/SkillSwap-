import axios from 'axios'

const API_URL = '/api'

const paymentService = {
  getSubscriptionPlans: () =>
    axios.get(`${API_URL}/payments/plans`),

  initiatePayment: (planId) =>
    axios.post(`${API_URL}/payments/initiate`, { planId }),

  verifyPayment: (paymentData) =>
    axios.post(`${API_URL}/payments/verify`, paymentData),

  getUserSubscription: () =>
    axios.get(`${API_URL}/payments/subscription`),

  getTokenHistory: () =>
    axios.get(`${API_URL}/payments/token-history`),

  getWallet: () =>
    axios.get(`${API_URL}/payments/wallet`),
}

export default paymentService
