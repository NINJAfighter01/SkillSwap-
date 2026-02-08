import React, { createContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { logTokenEarned, logTokenUsage } from '../utils/activityStore'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isAuthenticated, setIsAuthenticated] = useState(!!token)
  const [loading, setLoading] = useState(true)
  const prevTokensRef = useRef(null)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!user || typeof user.tokens !== 'number') {
      prevTokensRef.current = null
      return
    }

    if (prevTokensRef.current === null) {
      prevTokensRef.current = user.tokens
      return
    }

    const diff = user.tokens - prevTokensRef.current
    if (diff > 0) {
      logTokenEarned(diff)
    } else if (diff < 0) {
      logTokenUsage(Math.abs(diff))
    }

    prevTokensRef.current = user.tokens
  }, [user?.tokens])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
      localStorage.removeItem('token')
      setToken(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData)
      setToken(response.data.token)
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials)
      setToken(response.data.token)
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
  }

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const response = await axios.post('/api/auth/google', {
        token: idToken,
        name: result.user.displayName,
        email: result.user.email,
        picture: result.user.photoURL,
      })
      setToken(response.data.token)
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      register,
      login,
      logout,
      googleLogin,
      updateUser,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}
