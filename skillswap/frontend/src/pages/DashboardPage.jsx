import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import Dashboard from '../components/Dashboard'
import { AuthContext } from '../context/AuthContext'

const DashboardPage = () => {
  const { isDark } = useContext(ThemeContext)
  const { user } = useContext(AuthContext)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {user ? <Dashboard user={user} /> : <div>Loading...</div>}
      </div>
    </div>
  )
}

export default DashboardPage
