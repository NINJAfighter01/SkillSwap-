import React, { useContext, useState, useEffect, useRef } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { WebSocketContext } from '../context/WebSocketContext'
import supportService from '../services/supportService'

const Support247 = () => {
  const { isDark } = useContext(ThemeContext)
  const { socket } = useContext(WebSocketContext)

  const [view, setView] = useState('chat')
  const [tickets, setTickets] = useState([])
  const [currentTicket, setCurrentTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isAITyping, setIsAITyping] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    priority: 'normal',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 })
  const messagesEndRef = useRef(null)

  const categories = [
    { value: 'account', label: '🔐 Account & Login' },
    { value: 'payment', label: '💳 Payment & Tokens' },
    { value: 'video', label: '🎥 Video & Streaming' },
    { value: 'courses', label: '📚 Courses & Content' },
    { value: 'technical', label: '⚙️ Technical Issues' },
    { value: 'general', label: '❓ General Inquiry' },
  ]

  const priorities = [
    { value: 'low', label: 'Low', emoji: '🟢' },
    { value: 'normal', label: 'Normal', emoji: '🟡' },
    { value: 'high', label: 'High', emoji: '🔴' },
  ]

  useEffect(() => {
    fetchStats()
    fetchTickets()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isAITyping])

  useEffect(() => {
    if (socket) {
      socket.on('support:ticketCreated', (ticket) => {
        setTickets(prev => [ticket, ...prev])
        setCurrentTicket(ticket)
        setMessages([])
        setView('details')
      })

      socket.on('support:newMessage', (message) => {
        setMessages(prev => [...prev, message])
      })

      socket.on('support:typing', (data) => {
        setIsAITyping(data.isTyping)
      })

      socket.on('support:aiResponse', (message) => {
        if (message.message) {
          setMessages(prev => [...prev, message.message])
        } else {
          setMessages(prev => [...prev, message])
        }
      })

      socket.on('support:ticketClosed', (ticket) => {
        setCurrentTicket(ticket)
        setTickets(prev =>
          prev.map(t => (t.id === ticket.id ? ticket : t))
        )
      })

      return () => {
        socket.off('support:ticketCreated')
        socket.off('support:newMessage')
        socket.off('support:typing')
        socket.off('support:aiResponse')
        socket.off('support:ticketClosed')
      }
    }
  }, [socket])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchStats = async () => {
    try {
      const response = await supportService.getSupportStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchTickets = async () => {
    try {
      const response = await supportService.getUserTickets(1, 10, 'all')
      setTickets(response.data.tickets)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!formData.subject || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await supportService.createTicket(formData)
      setFormData({
        subject: '',
        category: 'general',
        priority: 'normal',
        description: '',
      })
    } catch (error) {
      console.error('Error creating ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      await supportService.sendMessage(currentTicket.id, newMessage)
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewTicketDetails = async (ticket) => {
    setCurrentTicket(ticket)
    setView('details')
    setLoading(true)
    try {
      const response = await supportService.getTicketDetails(ticket.ticketId)
      setMessages(response.data.SupportMessages || [])
    } catch (error) {
      console.error('Error fetching ticket details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseTicket = async () => {
    if (!currentTicket) return
    const resolution = window.prompt('Brief summary of resolution:')
    if (resolution) {
      try {
        await supportService.closeTicket(currentTicket.ticketId, resolution)
        alert('Ticket closed successfully')
      } catch (error) {
        console.error('Error closing ticket:', error)
      }
    }
  }

  // View 1: Chat/New Ticket
  if (view === 'chat') {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              24/7 AI Support
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Get instant help anytime, anywhere
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Ticket Form */}
            <div className="lg:col-span-2">
              <div className={`rounded-xl shadow-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Create Support Request
                </h2>

                <form onSubmit={handleCreateTicket} className="space-y-6">
                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 focus:border-blue-500'
                      } focus:outline-none transition`}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Priority
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {priorities.map(prio => (
                        <button
                          key={prio.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, priority: prio.value }))}
                          className={`p-3 rounded-lg border-2 font-semibold transition ${
                            formData.priority === prio.value
                              ? `border-blue-500 bg-blue-50 ${isDark ? 'bg-opacity-20' : ''}`
                              : `${isDark ? 'border-gray-600' : 'border-gray-300'}`
                          }`}
                        >
                          <span className="text-xl mr-1">{prio.emoji}</span>
                          {prio.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="What's your issue?"
                      maxLength={100}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 focus:border-blue-500'
                      } focus:outline-none transition`}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Detailed Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="5"
                      placeholder="Provide as much detail as possible..."
                      maxLength={1000}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 focus:border-blue-500'
                      } focus:outline-none transition resize-none`}
                      required
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formData.description.length}/1000 characters
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                    }`}
                  >
                    {loading ? 'Creating...' : '📬 Create Support Ticket'}
                  </button>
                </form>
              </div>
            </div>

            {/* Stats & Info */}
            <div className="space-y-6">
              {/* Support Stats */}
              <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  📊 Your Support
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-sm font-semibold">Total Tickets</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.total}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-sm font-semibold">Open</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.open}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-sm font-semibold">Resolved</p>
                    <p className="text-2xl font-bold text-green-500">{stats.closed}</p>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ⚡ Quick Response
                </h3>
                <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <li className="flex items-start">
                    <span className="mr-2">⏰</span>
                    <span><strong>Instant AI Response:</strong> Get answers in seconds</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">👥</span>
                    <span><strong>Always Available:</strong> 24/7 support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">📞</span>
                    <span><strong>Real Humans Too:</strong> Escalate if needed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* View Tickets Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => setView('tickets')}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg transition"
            >
              📋 View Your Support Tickets
            </button>
          </div>
        </div>
      </div>
    )
  }

  // View 2: Tickets List
  if (view === 'tickets') {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => setView('chat')}
            className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            ← Back to Create Ticket
          </button>

          <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📋 Support Tickets
          </h1>

          {tickets.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl`}>
              <div className="text-6xl mb-4">📭</div>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No support tickets yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500'
                  }`}
                  onClick={() => viewTicketDetails(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {ticket.subject}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {ticket.ticketId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                        ticket.status === 'open'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {ticket.status === 'open' ? '🔴 Open' : '✅ Closed'}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-sm ${
                        ticket.priority === 'high'
                          ? 'bg-red-500 text-white'
                          : ticket.priority === 'normal'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // View 3: Ticket Details/Chat
  if (view === 'details' && currentTicket) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setView('tickets')}
            className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            ← Back to Tickets
          </button>

          {/* Ticket Header */}
          <div className={`rounded-xl shadow-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentTicket.subject}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ticket ID: {currentTicket.ticketId}
                </p>
              </div>
              <div className="space-y-2">
                <span className={`block px-3 py-1 rounded-lg font-semibold text-sm text-center ${
                  currentTicket.status === 'open'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-green-500 text-white'
                }`}>
                  {currentTicket.status === 'open' ? '🔴 Open' : '✅ Closed'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className={`rounded-xl shadow-lg p-6 h-96 overflow-y-auto mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin text-4xl mb-4">⌛</div>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading messages...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl px-4 py-3 rounded-xl whitespace-pre-wrap ${
                        msg.senderType === 'user'
                          ? 'bg-blue-600 text-white rounded-bl-none'
                          : `${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${isDark ? 'text-gray-100' : 'text-gray-900'} rounded-tl-none`
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl flex-shrink-0 mt-1">
                          {msg.senderType === 'user' ? '👤' : '🤖'}
                        </span>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                      </div>
                      <p className={`text-xs mt-2 ${msg.senderType === 'user' ? 'text-blue-100' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isAITyping && (
                  <div className="flex justify-start">
                    <div className={`max-w-2xl px-4 py-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🤖</span>
                        <div className="flex gap-1">
                          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`} style={{ animationDelay: '0s' }}></div>
                          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`} style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          {currentTicket.status === 'open' && (
            <form onSubmit={handleSendMessage} className="flex gap-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                maxLength={500}
                className={`flex-grow px-4 py-3 rounded-lg border-2 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 focus:border-blue-500'
                } focus:outline-none`}
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  loading || !newMessage.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Send
              </button>
            </form>
          )}

          {/* Close Ticket Button */}
          {currentTicket.status === 'open' && (
            <div className="mt-6 text-center">
              <button
                onClick={handleCloseTicket}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition"
              >
                🔒 Close This Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default Support247
