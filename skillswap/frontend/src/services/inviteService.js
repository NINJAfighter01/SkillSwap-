import axios from 'axios'

const inviteService = {
  sendInvitation: (payload) => axios.post('/api/invitations/send', payload),
}

export default inviteService
