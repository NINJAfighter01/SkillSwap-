import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, AuthContext } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'

import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardPage from './pages/DashboardPage'
import Lectures from './pages/Lectures'
import LectureStreaming from './pages/LectureStreaming'
import InteractiveNotes from './pages/InteractiveNotes'
import LecturePlayer from './pages/LecturePlayer'
import Subscription from './pages/Subscription'
import Contact from './pages/Contact'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Services from './pages/Services'
import Blog from './pages/Blog'
import Info from './pages/Info'
import Feedback from './pages/Feedback'
import Profile from './pages/Profile'
import ProgressPage from './pages/ProgressPage'
import LearnAnything from './pages/LearnAnything'
import SkillDetail from './pages/SkillDetail'
import MySessions from './pages/MySessions'
import BecomeaMentor from './pages/BecomeaMentor'
import MentorProfile from './pages/MentorProfile'
import TopMentors from './pages/TopMentors'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext)

  if (loading) return <div>Loading...</div>
  return isAuthenticated ? children : <Navigate to="/login" />
}

const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext)

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public Routes - Only accessible before login */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

        {/* Home Route - Redirect to login if not authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <HomePage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Protected Routes - Only accessible after login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lectures"
          element={
            <ProtectedRoute>
              <Lectures />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecture-streaming"
          element={
            <ProtectedRoute>
              <LectureStreaming />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interactive-notes"
          element={
            <ProtectedRoute>
              <InteractiveNotes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecture/:id"
          element={
            <ProtectedRoute>
              <LecturePlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <ProtectedRoute>
              <HowItWorks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog"
          element={
            <ProtectedRoute>
              <Blog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/info"
          element={
            <ProtectedRoute>
              <Info />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />

        {/* Peer-to-Peer Learning Routes */}
        <Route
          path="/learn-anything"
          element={
            <ProtectedRoute>
              <LearnAnything />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill/:id"
          element={
            <ProtectedRoute>
              <SkillDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/become-mentor"
          element={
            <ProtectedRoute>
              <BecomeaMentor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-sessions"
          element={
            <ProtectedRoute>
              <MySessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/:mentorId"
          element={
            <ProtectedRoute>
              <MentorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/top-mentors"
          element={
            <ProtectedRoute>
              <TopMentors />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
