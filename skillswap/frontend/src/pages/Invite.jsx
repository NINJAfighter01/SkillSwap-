import React, { useContext, useState } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import inviteService from '../services/inviteService'

const Invite = () => {
  const { isDark } = useContext(ThemeContext)
  const [inviteForm, setInviteForm] = useState({
    recipientName: '',
    recipientEmail: '',
    customMessage: '',
  })
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [inviteError, setInviteError] = useState('')

  const handleInviteChange = (event) => {
    const { name, value } = event.target
    setInviteForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSendInvitation = async (event) => {
    event.preventDefault()
    setInviteError('')
    setInviteSuccess('')

    if (!inviteForm.recipientName.trim() || !inviteForm.recipientEmail.trim()) {
      setInviteError('Please enter recipient name and email.')
      return
    }

    setInviteSending(true)
    try {
      const response = await inviteService.sendInvitation({
        recipientName: inviteForm.recipientName.trim(),
        recipientEmail: inviteForm.recipientEmail.trim(),
        customMessage: inviteForm.customMessage.trim(),
      })

      setInviteSuccess(response?.data?.message || 'Invitation sent successfully.')
      setInviteForm({ recipientName: '', recipientEmail: '', customMessage: '' })
    } catch (error) {
      setInviteError(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send invitation'
      )
    } finally {
      setInviteSending(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="mb-4">
            <h1 className="text-3xl font-bold">📩 Send Joining Invitation</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter friend’s name and email. They’ll receive a personalized SkillSwap join invitation.
            </p>
          </div>

          <form onSubmit={handleSendInvitation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Recipient Name</label>
              <input
                type="text"
                name="recipientName"
                value={inviteForm.recipientName}
                onChange={handleInviteChange}
                placeholder="e.g. Rahul Sharma"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Recipient Email</label>
              <input
                type="email"
                name="recipientEmail"
                value={inviteForm.recipientEmail}
                onChange={handleInviteChange}
                placeholder="friend@email.com"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Message (Optional)</label>
              <textarea
                name="customMessage"
                rows={3}
                value={inviteForm.customMessage}
                onChange={handleInviteChange}
                placeholder="Let’s learn together on SkillSwap!"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {inviteError && (
              <div className="md:col-span-2 rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm">
                {inviteError}
              </div>
            )}
            {inviteSuccess && (
              <div className="md:col-span-2 rounded-lg border border-green-300 bg-green-50 text-green-700 px-4 py-2 text-sm">
                {inviteSuccess}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={inviteSending}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {inviteSending ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Invite