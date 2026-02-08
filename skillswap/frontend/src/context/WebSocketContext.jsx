import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import { AuthContext } from './AuthContext'
import { loadActivityLog, saveActivityLog, logTokenEarned, logTokenUsage } from '../utils/activityStore'

export const WebSocketContext = createContext()

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const WebSocketProvider = ({ children }) => {
  const { token, user, updateUser } = useContext(AuthContext)
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token || !user) {
      // Disconnect if no token/user
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setConnected(false)
      }
      return
    }

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socketRef.current = newSocket

    newSocket.on('connect', () => {
      console.log('✓ WebSocket connected')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('✗ WebSocket disconnected')
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message)
      setConnected(false)
    })

    // Listen for token updates
    newSocket.on('token:updated', (data) => {
      console.log('Received token update:', data)
      
      if (data.tokens !== undefined) {
        updateUser({ ...user, tokens: data.tokens })
      }

      // Log activity based on reason
      if (data.delta) {
        if (data.delta > 0) {
          logTokenEarned(data.delta)
        } else if (data.delta < 0) {
          logTokenUsage(Math.abs(data.delta))
        }
      }

      // Trigger activity log update event
      window.dispatchEvent(new Event('activityLogUpdated'))
    })

    // Listen for activity updates
    newSocket.on('activity:updated', (data) => {
      console.log('Received activity update:', data)
      window.dispatchEvent(new Event('activityLogUpdated'))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [token, user?.id])

  const enrollInCourse = (courseId, tokensRequired) => {
    return new Promise((resolve, reject) => {
      if (!socket || !connected) {
        reject(new Error('WebSocket not connected'))
        return
      }

      socket.emit('course:enroll', { courseId, tokensRequired })

      socket.once('course:enroll:success', (data) => {
        resolve(data)
      })

      socket.once('course:enroll:error', (error) => {
        reject(new Error(error.message))
      })

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Enrollment timeout'))
      }, 5000)
    })
  }

  const completeCourse = (courseId, timeSpent, tokensEarned = 0) => {
    return new Promise((resolve, reject) => {
      if (!socket || !connected) {
        reject(new Error('WebSocket not connected'))
        return
      }

      socket.emit('course:complete', { courseId, timeSpent, tokensEarned })

      socket.once('course:complete:success', (data) => {
        resolve(data)
      })

      socket.once('course:complete:error', (error) => {
        reject(new Error(error.message))
      })

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Completion timeout'))
      }, 5000)
    })
  }

  const emitTokenUpdate = (data) => {
    if (socket && connected) {
      socket.emit('token:update', data)
    }
  }

  const emitActivityUpdate = (data) => {
    if (socket && connected) {
      socket.emit('activity:update', data)
    }
  }

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        connected,
        enrollInCourse,
        completeCourse,
        emitTokenUpdate,
        emitActivityUpdate
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}
