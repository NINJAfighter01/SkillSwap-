import React from 'react'
import { useWebSocket } from '../context/WebSocketContext'

const WebSocketStatus = () => {
  const { connected } = useWebSocket()

  return (
    <div className="relative group">
      <div className={`flex items-center gap-2 px-2 py-1 rounded-full transition-all ${
        connected 
          ? 'bg-green-600/20 text-green-400' 
          : 'bg-red-600/20 text-red-400'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
        <span className="text-xs font-semibold hidden sm:inline">
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-gray-900 border border-white/10 rounded-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {connected ? (
          <>
            <p className="font-semibold text-green-400 mb-1">✓ Real-Time Connected</p>
            <p>Token updates and activity sync in real-time</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-red-400 mb-1">✗ Offline Mode</p>
            <p>Updates will sync when connection is restored</p>
          </>
        )}
      </div>
    </div>
  )
}

export default WebSocketStatus
