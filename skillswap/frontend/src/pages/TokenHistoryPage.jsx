import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { useWebSocket } from '../context/WebSocketContext'
import paymentService from '../services/paymentService'

const TokenHistoryPage = () => {
  const { isDark } = useContext(ThemeContext)
  const { socket } = useWebSocket()
  const [history, setHistory] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchHistory(true)
  }, [])

  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => fetchHistory(false)
    socket.on('token:updated', handleUpdate)
    socket.on('activity:updated', handleUpdate)
    return () => {
      socket.off('token:updated', handleUpdate)
      socket.off('activity:updated', handleUpdate)
    }
  }, [socket])

  const fetchHistory = async (isInitial) => {
    if (isInitial) setLoading(true)
    try {
      const [historyRes, walletRes] = await Promise.all([
        paymentService.getTokenHistory(),
        paymentService.getWallet(),
      ])
      setHistory(historyRes.data.history || [])
      setBalance(walletRes.data.balance || 0)
    } catch (error) {
      console.error('Error fetching token history:', error)
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  const filteredHistory = useMemo(() => {
    if (filter === 'all') return history
    return history.filter((entry) => entry.type === filter)
  }, [history, filter])

  const formatDate = (value) => {
    const date = new Date(value)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-10`}>
      <div className="max-w-5xl mx-auto px-4">
        <div className={`rounded-2xl p-8 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold">💰 Token History</h1>
              <p className={`text-base mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time credits and debits from your learning activity
              </p>
            </div>
            <div className={`rounded-xl px-6 py-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wallet Balance</p>
              <p className="text-3xl font-bold text-yellow-500">💎 {balance}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'earned', 'spent'].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                filter === key
                  ? 'bg-purple-600 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {key === 'all' ? 'All' : key === 'earned' ? 'Credited' : 'Debited'}
            </button>
          ))}
        </div>

        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          {loading ? (
            <div className="text-center py-10">Loading token history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-10">
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No token activity yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl border ${
                    isDark ? 'border-gray-700 bg-gray-900/60' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">
                        {entry.type === 'earned' ? '✅ Credited' : '⬇️ Debited'}
                        <span className={`ml-2 font-bold ${entry.type === 'earned' ? 'text-green-500' : 'text-red-500'}`}>
                          {entry.type === 'earned' ? '+' : '-'}{entry.amount}
                        </span>
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {entry.reason}
                      </p>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(entry.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TokenHistoryPage
