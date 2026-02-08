import axios from 'axios'

const API_URL = '/api/support'

const supportService = {
  // Create new support ticket
  createTicket: (data) =>
    axios.post(`${API_URL}/tickets`, data),

  // Send message in support ticket
  sendMessage: (supportId, message) =>
    axios.post(`${API_URL}/messages`, {
      supportId,
      message,
    }),

  // Get user's support tickets
  getUserTickets: (page = 1, limit = 10, status = 'all') =>
    axios.get(`${API_URL}/tickets?page=${page}&limit=${limit}&status=${status}`),

  // Get support stats
  getSupportStats: () =>
    axios.get(`${API_URL}/stats`),

  // Get ticket details with messages
  getTicketDetails: (ticketId) =>
    axios.get(`${API_URL}/tickets/${ticketId}`),

  // Close ticket
  closeTicket: (ticketId, resolution) =>
    axios.put(`${API_URL}/tickets/${ticketId}/close`, { resolution }),

  // Reopen ticket
  reopenTicket: (ticketId) =>
    axios.put(`${API_URL}/tickets/${ticketId}/reopen`),
}

export default supportService
