import React, { useContext, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import userService from '../services/userService'
import { loadActivityLog, logCourseCompletion as logCourseCompletionToStore, logTokenUsage as logTokenUsageToStore } from '../utils/activityStore'

const Profile = () => {
  const { isDark } = useContext(ThemeContext)
  const { user, updateUser } = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Read tab from URL query parameters
  const tabFromUrl = searchParams.get('tab')
  
  // State management
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const locationSaveTimeoutRef = useRef(null)
  const [bioExpanded, setBioExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview')
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [profileVisibility, setProfileVisibility] = useState('public')
  
  // AI Insights editing state - Start with empty strings
  const [isEditingAI, setIsEditingAI] = useState(false)
  const [aiInsights, setAiInsights] = useState({
    strengths: '',
    suggestions: '',
    careerPath: ''
  })

  // Skills management state
  const [isEditingSkills, setIsEditingSkills] = useState(false)
  const [skills, setSkills] = useState([
    { id: 1, name: 'React', level: 85, color: '#61DAFB' },
    { id: 2, name: 'JavaScript', level: 90, color: '#F7DF1E' },
    { id: 3, name: 'Node.js', level: 75, color: '#339933' },
    { id: 4, name: 'Python', level: 70, color: '#3776AB' },
    { id: 5, name: 'UI/UX', level: 65, color: '#FF6B6B' },
    { id: 6, name: 'Database', level: 80, color: '#4DB33D' }
  ])
  const [newSkill, setNewSkill] = useState({ name: '', level: 50, color: '#3B82F6' })
  const [editingSkillId, setEditingSkillId] = useState(null)

  // Social Links editing state
  const [isEditingSocial, setIsEditingSocial] = useState(false)
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    portfolio: ''
  })

  // Projects management state
  const [isEditingProjects, setIsEditingProjects] = useState(false)
  const [projects, setProjects] = useState([
    { 
      id: 1, 
      title: 'E-Commerce Platform', 
      tech: ['React', 'Node.js', 'MongoDB'], 
      image: '🛒',
      liveUrl: '#',
      githubUrl: '#'
    },
    { 
      id: 2, 
      title: 'AI Chat Application', 
      tech: ['Python', 'Flask', 'OpenAI'], 
      image: '🤖',
      liveUrl: '#',
      githubUrl: '#'
    },
    { 
      id: 3, 
      title: 'Portfolio Website', 
      tech: ['Next.js', 'TailwindCSS'], 
      image: '💼',
      liveUrl: '#',
      githubUrl: '#'
    }
  ])
  const [newProject, setNewProject] = useState({ title: '', tech: '', image: '', liveUrl: '', githubUrl: '' })
  const [editingProjectId, setEditingProjectId] = useState(null)

  // Real Activity Tracking State
  const [activityLog, setActivityLog] = useState(() => loadActivityLog())

  // Privacy & Access Control
  const [isOwnProfile] = useState(true) // This is user's own profile
  const [viewerIsOwner] = useState(true) // Viewer is the profile owner
  const [viewerIsFriend] = useState(true) // Viewer is a friend

  // Function to check if content should be visible
  const canViewContent = () => {
    if (viewerIsOwner) return true // Owner can always see their own profile
    if (profileVisibility === 'public') return true
    if (profileVisibility === 'friends' && viewerIsFriend) return true
    if (profileVisibility === 'private') return false
    return false
  }

  // Get privacy description
  const getPrivacyDescription = (level) => {
    switch(level) {
      case 'public':
        return '🌐 Everyone can see your profile'
      case 'private':
        return '🔒 Only you can see your profile'
      case 'friends':
        return '👥 Only your friends can see your profile'
      default:
        return ''
    }
  }

  // Copy profile link to clipboard
  const copyProfileLink = () => {
    const link = `${window.location.origin}/profile/${user?.id || 'profile'}`
    navigator.clipboard.writeText(link)
    alert('Profile link copied to clipboard!')
  }

  // Download profile as PDF
  const downloadProfilePDF = () => {
    alert('Download Profile PDF feature coming soon! Your profile will be exported as a PDF.')
  }

  // Update activeTab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  useEffect(() => {
    const syncActivityLog = () => {
      setActivityLog(loadActivityLog())
    }
    window.addEventListener('activityLogUpdated', syncActivityLog)
    window.addEventListener('storage', syncActivityLog)

    return () => {
      window.removeEventListener('activityLogUpdated', syncActivityLog)
      window.removeEventListener('storage', syncActivityLog)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (locationSaveTimeoutRef.current) {
        clearTimeout(locationSaveTimeoutRef.current)
      }
    }
  }, [])

  // Load profile data from backend on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const response = await userService.getProfile()
        const profileData = response.data.user

        setFormData(prev => ({
          ...prev,
          name: profileData.name || prev.name,
          username: profileData.email?.split('@')[0] || prev.username,
          bio: profileData.bio || prev.bio,
          location: profileData.location || prev.location,
          isTeacher: profileData.isTeacher !== undefined ? profileData.isTeacher : prev.isTeacher,
        }))
        
        // Load skills from backend
        if (profileData.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0) {
          setSkills(profileData.skills)
        }
        
        // Load projects from backend
        if (profileData.projects && Array.isArray(profileData.projects) && profileData.projects.length > 0) {
          setProjects(profileData.projects)
        }
        
        // Load social links from backend
        if (profileData.socialLinks && typeof profileData.socialLinks === 'object') {
          setSocialLinks(profileData.socialLinks)
        }
        
        // Load AI insights from backend
        if (profileData.aiInsights && typeof profileData.aiInsights === 'object') {
          setAiInsights(profileData.aiInsights)
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
      }
    }
    
    if (user) {
      loadProfileData()
    }
  }, [user?.id])

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.email?.split('@')[0] || '',
    role: 'Full Stack Developer',
    bio: user?.bio || 'Passionate learner and developer building amazing projects.',
    location: user?.location || 'Mumbai, India',
    tagline: 'Code. Learn. Grow. Repeat.',
    language: 'English, Hindi',
    timezone: 'IST (GMT+5:30)',
    joinedDate: 'January 2026',
    isTeacher: user?.isTeacher || false,
  })

  // Sample data for visualization

  // Calculate Real Weekly Activity from actual data
  const getWeeklyActivity = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const weekActivity = days.map((day, idx) => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1 - idx
      const targetDate = new Date()
      targetDate.setDate(today.getDate() - daysBack)
      const dateStr = targetDate.toISOString().split('T')[0]
      
      const dayEntry = activityLog.find(log => log.date === dateStr)
      const hours = dayEntry ? dayEntry.timeSpent : 0
      
      return { day, hours: parseFloat(hours.toFixed(1)) }
    })
    return weekActivity
  }

  // Calculate Real Heatmap from activity data
  const getHeatmapData = () => {
    const today = new Date()
    const heatmap = []
    
    for (let i = 0; i < 364; i++) {
      const targetDate = new Date()
      targetDate.setDate(today.getDate() - i)
      const dateStr = targetDate.toISOString().split('T')[0]
      
      const dayActivity = activityLog.find(log => log.date === dateStr)
      const value = dayActivity ? Math.min(4, Math.floor(dayActivity.timeSpent / 2)) : 0
      
      heatmap.unshift({ date: dateStr, value })
    }
    
    return heatmap
  }

  const weeklyActivity = getWeeklyActivity()
  const heatmapData = getHeatmapData()

  // Calculate Real Statistics
  const getActivityStats = () => {
    const stats = {
      totalTimeSpent: 0,
      totalTokensUsed: 0,
      totalTokensEarned: 0,
      totalCoursesCompleted: 0
    }

    activityLog.forEach(log => {
      stats.totalTimeSpent += log.timeSpent
      stats.totalTokensUsed += log.tokensUsed
      stats.totalTokensEarned += log.tokensEarned
      stats.totalCoursesCompleted += log.coursesCompleted
    })

    return {
      timeSpent: Math.round(stats.totalTimeSpent) + 'h',
      tokensUsed: stats.totalTokensUsed,
      tokensEarned: stats.totalTokensEarned,
      completionRate: Math.min(100, Math.round((stats.totalCoursesCompleted / (stats.totalCoursesCompleted + 5)) * 100)) + '%'
    }
  }

  const activityStats = getActivityStats()

  // Calculate Profile Completion with breakdown
  const calculateProfileCompletion = () => {
    let completionPoints = 0
    const breakdown = {}

    // Name (14%)
    if (formData.name && formData.name.trim()) {
      completionPoints += 14
      breakdown.name = true
    }

    // Role/Title (14%)
    if (formData.role && formData.role.trim()) {
      completionPoints += 14
      breakdown.role = true
    }

    // Bio (14%)
    if (formData.bio && formData.bio.trim().length > 10) {
      completionPoints += 14
      breakdown.bio = true
    }

    // Tagline (9%)
    if (formData.tagline && formData.tagline.trim()) {
      completionPoints += 9
      breakdown.tagline = true
    }

    // Location (9%)
    if (formData.location && formData.location.trim()) {
      completionPoints += 9
      breakdown.location = true
    }

    // Language (5%)
    if (formData.language && formData.language.trim()) {
      completionPoints += 5
      breakdown.language = true
    }

    // Timezone (5%)
    if (formData.timezone && formData.timezone.trim()) {
      completionPoints += 5
      breakdown.timezone = true
    }

    // Skills added (5%)
    if (skills.length >= 3) {
      completionPoints += 5
      breakdown.skills = true
    }

    // Social links added - at least 1 (5%)
    const socialLinksCount = Object.values(socialLinks).filter(link => link && link.trim()).length
    if (socialLinksCount >= 1) {
      completionPoints += 5
      breakdown.social = true
    }

    // AI Insights filled - ALL THREE must be filled (5%)
    const aiStrengthsFilled = aiInsights.strengths && aiInsights.strengths.trim().length > 5
    const aiSuggestionsFilled = aiInsights.suggestions && aiInsights.suggestions.trim().length > 5
    const aiCareerPathFilled = aiInsights.careerPath && aiInsights.careerPath.trim().length > 5
    
    if (aiStrengthsFilled && aiSuggestionsFilled && aiCareerPathFilled) {
      completionPoints += 5
      breakdown.aiInsights = true
    }

    // Projects added (4%)
    if (projects.length >= 1) {
      completionPoints += 4
      breakdown.projects = true
    }

    return { percentage: Math.min(completionPoints, 100), breakdown }
  }

  const profileCompletionData = calculateProfileCompletion()
  const profileCompletion = profileCompletionData.percentage
  const completionBreakdown = profileCompletionData.breakdown

  const addSkill = async () => {
    if (!newSkill.name.trim()) {
      alert('Please enter a skill name')
      return
    }
    if (skills.some(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
      alert('This skill already exists!')
      return
    }
    
    const skillToAdd = { ...newSkill, id: Date.now() }
    const updatedSkills = [...skills, skillToAdd]
    setSkills(updatedSkills)
    setNewSkill({ name: '', level: 50, color: '#3B82F6' })
    
    // Save to backend
    try {
      await userService.updateProfile({ skills: updatedSkills })
    } catch (error) {
      console.error('Error saving skill:', error)
      alert('Skill added locally, but failed to save to server')
    }
  }

  const updateSkill = async (id, updatedSkill) => {
    const updatedSkills = skills.map(skill => skill.id === id ? { ...skill, ...updatedSkill } : skill)
    setSkills(updatedSkills)
    setEditingSkillId(null)
    
    // Save to backend
    try {
      await userService.updateProfile({ skills: updatedSkills })
    } catch (error) {
      console.error('Error updating skill:', error)
    }
  }

  const deleteSkill = async (id) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      const updatedSkills = skills.filter(skill => skill.id !== id)
      setSkills(updatedSkills)
      
      // Save to backend
      try {
        await userService.updateProfile({ skills: updatedSkills })
      } catch (error) {
        console.error('Error deleting skill:', error)
      }
    }
  }

  const getSkillColor = (skillName) => {
    const colors = ['#61DAFB', '#F7DF1E', '#339933', '#3776AB', '#FF6B6B', '#4DB33D', '#9333EA', '#EC4899']
    let hash = 0
    for (let i = 0; i < skillName.length; i++) {
      hash = skillName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // Calculate average skill level
  const calculateAvgSkillLevel = () => {
    if (skills.length === 0) return 0
    const total = skills.reduce((sum, skill) => sum + skill.level, 0)
    return Math.round(total / skills.length)
  }

  // Get strongest skill
  const getStrongestSkill = () => {
    if (skills.length === 0) return null
    return skills.reduce((max, skill) => skill.level > max.level ? skill : max, skills[0])
  }

  // Get weakest skill (to suggest improvement)
  const getWeakestSkill = () => {
    if (skills.length === 0) return null
    return skills.reduce((min, skill) => skill.level < min.level ? skill : min, skills[0])
  }

  // Project Management Functions
  const addProject = async () => {
    if (!newProject.title.trim()) {
      alert('Please enter a project title')
      return
    }
    if (!newProject.image.trim()) {
      alert('Please enter an emoji for the project')
      return
    }
    if (!newProject.tech.trim()) {
      alert('Please enter at least one technology')
      return
    }

    const techArray = newProject.tech.split(',').map(t => t.trim()).filter(t => t)
    if (techArray.length === 0) {
      alert('Please enter technologies separated by commas')
      return
    }

    const updatedProjects = [
      ...projects,
      {
        id: Date.now(),
        title: newProject.title,
        tech: techArray,
        image: newProject.image,
        liveUrl: newProject.liveUrl || '#',
        githubUrl: newProject.githubUrl || '#'
      }
    ]
    setProjects(updatedProjects)
    setNewProject({ title: '', tech: '', image: '', liveUrl: '', githubUrl: '' })
    
    // Save to backend
    try {
      await userService.updateProfile({ projects: updatedProjects })
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Project added locally, but failed to save to server')
    }
  }

  const updateProject = async (id, updatedProject) => {
    const updatedProjects = projects.map(project =>
      project.id === id ? { ...project, ...updatedProject } : project
    )
    setProjects(updatedProjects)
    setEditingProjectId(null)
    
    // Save to backend
    try {
      await userService.updateProfile({ projects: updatedProjects })
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const deleteProject = async (id) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = projects.filter(project => project.id !== id)
      setProjects(updatedProjects)
      
      // Save to backend
      try {
        await userService.updateProfile({ projects: updatedProjects })
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  // Activity Logging Functions
  const logCourseCompletion = (timeSpentHours = 1, tokensEarned = 0) => {
    const updatedLog = logCourseCompletionToStore(timeSpentHours, tokensEarned)
    setActivityLog(updatedLog)
  }

  const logTokenUsage = (tokensUsed = 10) => {
    const updatedLog = logTokenUsageToStore(tokensUsed)
    setActivityLog(updatedLog)
  }

  // Save social links to backend
  const saveSocialLinks = async () => {
    try {
      await userService.updateProfile({ socialLinks })
      setIsEditingSocial(false)
    } catch (error) {
      console.error('Error saving social links:', error)
      alert('Failed to save social links')
    }
  }

  // Save AI insights to backend
  const saveAIInsights = async () => {
    try {
      await userService.updateProfile({ aiInsights })
      setIsEditingAI(false)
    } catch (error) {
      console.error('Error saving AI insights:', error)
      alert('Failed to save AI insights')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const saveLocationInRealtime = async (locationValue) => {
    try {
      const response = await userService.updateProfile({ location: locationValue })
      if (response?.data?.user) {
        updateUser({ ...user, ...response.data.user })
      }
    } catch (error) {
      console.error('Error auto-saving location:', error)
    }
  }

  const handleLocationChange = (e) => {
    const locationValue = e.target.value
    setFormData(prev => ({ ...prev, location: locationValue }))

    if (locationSaveTimeoutRef.current) {
      clearTimeout(locationSaveTimeoutRef.current)
    }

    locationSaveTimeoutRef.current = setTimeout(() => {
      saveLocationInRealtime(locationValue)
    }, 400)
  }

  const handleLocationBlur = (e) => {
    const locationValue = e.target.value
    if (locationSaveTimeoutRef.current) {
      clearTimeout(locationSaveTimeoutRef.current)
    }
    saveLocationInRealtime(locationValue)
  }

  const saveProfile = async () => {
    try {
      const response = await userService.updateProfile(formData)
      if (response?.data?.user) {
        updateUser({ ...user, ...response.data.user })
      }
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error(error)
      alert('Error updating profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* 1️⃣ HERO PROFILE SECTION */}
        <div className="relative mb-8 rounded-3xl p-8 backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-5xl font-bold shadow-2xl border-4 border-white/20">
                {formData.name?.charAt(0) || 'U'}
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900 animate-pulse"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-white/10 px-3 py-1 rounded-lg text-2xl font-bold"
                  />
                ) : (
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {formData.name}
                  </h1>
                )}
                <button
                  onClick={() => {
                    if (isEditing) {
                      saveProfile()
                    } else {
                      setIsEditing(true)
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {isEditing ? '✓' : '✏️'}
                </button>
              </div>
              
              <p className="text-lg text-gray-400 mb-2">@{formData.username}</p>
              
              {isEditing ? (
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="bg-white/10 px-3 py-1 rounded-lg mb-4"
                />
              ) : (
                <p className="text-xl font-semibold text-blue-400 mb-4">{formData.role}</p>
              )}

              {/* Profile Completion */}
              <div className="max-w-md mx-auto md:mx-0">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Profile Completion</span>
                  <span className={`text-sm font-bold ${
                    profileCompletion === 100 ? 'text-green-400' :
                    profileCompletion >= 75 ? 'text-cyan-400' :
                    profileCompletion >= 50 ? 'text-yellow-400' : 'text-orange-400'
                  }`}>
                    {profileCompletion}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      profileCompletion === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      profileCompletion >= 75 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                      profileCompletion >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {profileCompletion === 100 ? '✅ Profile Complete! You\'re all set!' :
                   profileCompletion >= 75 ? '🎉 Almost there! Complete a few more fields.' :
                   profileCompletion >= 50 ? '🔄 You\'re halfway there! Keep going.' :
                   '📝 Start filling in your profile details.'}
                </p>
                
                {/* Completion Breakdown - Show what's completed */}
                <div className="mt-3 text-xs space-y-1">
                  <details className="cursor-pointer border-t border-white/20 pt-2">
                    <summary className="font-semibold text-cyan-400 hover:text-cyan-300">📊 What's Complete?</summary>
                    <div className="mt-2 space-y-1 text-gray-400">
                      {completionBreakdown.name && <p>✅ Name</p>}
                      {completionBreakdown.role && <p>✅ Role/Title</p>}
                      {completionBreakdown.bio && <p>✅ Bio</p>}
                      {completionBreakdown.tagline && <p>✅ Tagline</p>}
                      {completionBreakdown.location && <p>✅ Location</p>}
                      {completionBreakdown.language && <p>✅ Language</p>}
                      {completionBreakdown.timezone && <p>✅ Timezone</p>}
                      {completionBreakdown.skills && <p>✅ Skills (3+)</p>}
                      {completionBreakdown.social && <p>✅ Social Links</p>}
                      {completionBreakdown.aiInsights && <p>✅ AI Insights (All 3 sections)</p>}
                      {completionBreakdown.projects && <p>✅ Projects</p>}
                    </div>
                  </details>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 text-center">
              <div className="backdrop-blur-sm bg-white/5 px-6 py-4 rounded-2xl">
                <div className="text-3xl font-bold text-cyan-400">{user?.tokens || 150}</div>
                <div className="text-xs text-gray-400 mt-1">Tokens</div>
              </div>
              <div className="backdrop-blur-sm bg-white/5 px-6 py-4 rounded-2xl">
                <div className="text-3xl font-bold text-purple-400">{user?.lecturesCompleted || 24}</div>
                <div className="text-xs text-gray-400 mt-1">Completed</div>
              </div>
              <div className="backdrop-blur-sm bg-white/5 px-6 py-4 rounded-2xl">
                <div className="text-3xl font-bold text-pink-400">7</div>
                <div className="text-xs text-gray-400 mt-1">Streak 🔥</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['overview', 'skills', 'activity', 'projects'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 2️⃣ SMART ABOUT SECTION */}
            {activeTab === 'overview' && (
              <>
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">About</h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (isEditingAbout) {
                            saveProfile().then(() => setIsEditingAbout(false))
                          } else {
                            setIsEditingAbout(true)
                          }
                        }}
                        className="text-xl hover:scale-110 transition"
                        title={isEditingAbout ? 'Save' : 'Edit'}
                      >
                        {isEditingAbout ? '💾' : '✏️'}
                      </button>
                      <button onClick={() => setBioExpanded(!bioExpanded)} className="text-blue-400">
                        {bioExpanded ? '▲ Collapse' : '▼ Expand'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Tagline */}
                  <div className="mb-4">
                    {isEditingAbout ? (
                      <input
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleChange}
                        placeholder="Add your tagline..."
                        className="w-full bg-white/10 text-cyan-400 rounded-lg px-3 py-2 border border-white/20 focus:border-cyan-400 outline-none italic"
                      />
                    ) : (
                      <p className="text-lg text-cyan-400 font-semibold italic">"{formData.tagline}"</p>
                    )}
                  </div>
                  
                  {/* Bio */}
                  {isEditingAbout ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      className="w-full bg-white/10 text-gray-300 rounded-lg p-4 border border-white/20 focus:border-blue-500 outline-none min-h-[120px] resize-none"
                    />
                  ) : (
                    <p className={`text-gray-300 leading-relaxed ${!bioExpanded && 'line-clamp-3'}`}>
                      {formData.bio}
                    </p>
                  )}

                  {bioExpanded && (
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                      {/* Location */}
                      <div>
                        <p className="text-sm text-gray-400">📍 Location</p>
                        {isEditingAbout ? (
                          <input
                            name="location"
                            value={formData.location}
                            onChange={handleLocationChange}
                            onBlur={handleLocationBlur}
                            placeholder="Your city, country"
                            className="w-full bg-white/10 text-gray-300 rounded px-2 py-1 border border-white/20 focus:border-cyan-400 outline-none text-sm mt-1"
                          />
                        ) : (
                          <p className="font-semibold">{formData.location}</p>
                        )}
                      </div>
                      
                      {/* Joined Date */}
                      <div>
                        <p className="text-sm text-gray-400">📅 Joined</p>
                        {isEditingAbout ? (
                          <input
                            name="joinedDate"
                            value={formData.joinedDate}
                            onChange={handleChange}
                            placeholder="e.g., January 2026"
                            className="w-full bg-white/10 text-gray-300 rounded px-2 py-1 border border-white/20 focus:border-cyan-400 outline-none text-sm mt-1"
                          />
                        ) : (
                          <p className="font-semibold">{formData.joinedDate}</p>
                        )}
                      </div>
                      
                      {/* Language */}
                      <div>
                        <p className="text-sm text-gray-400">🌐 Language</p>
                        {isEditingAbout ? (
                          <input
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            placeholder="e.g., English, Hindi"
                            className="w-full bg-white/10 text-gray-300 rounded px-2 py-1 border border-white/20 focus:border-cyan-400 outline-none text-sm mt-1"
                          />
                        ) : (
                          <p className="font-semibold">{formData.language}</p>
                        )}
                      </div>
                      
                      {/* Timezone */}
                      <div>
                        <p className="text-sm text-gray-400">🕒 Timezone</p>
                        {isEditingAbout ? (
                          <input
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleChange}
                            placeholder="e.g., IST (GMT+5:30)"
                            className="w-full bg-white/10 text-gray-300 rounded px-2 py-1 border border-white/20 focus:border-cyan-400 outline-none text-sm mt-1"
                          />
                        ) : (
                          <p className="font-semibold">{formData.timezone}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3️⃣ SKILL INTELLIGENCE SECTION */}
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h2 className="text-2xl font-bold mb-6">Skill Intelligence</h2>
                  
                  {/* Skills Radar Chart (CSS-based visualization) */}
                  <div className="mb-8">
                    <div className="relative w-64 h-64 mx-auto">
                      <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full"></div>
                      <div className="absolute inset-8 border-2 border-blue-500/20 rounded-full"></div>
                      <div className="absolute inset-16 border-2 border-blue-500/10 rounded-full"></div>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl mb-2">🎯</div>
                          <div className="text-2xl font-bold text-cyan-400">{calculateAvgSkillLevel()}</div>
                          <div className="text-xs text-gray-400">Avg Level</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills List with Progress Bars */}
                  <div className="space-y-4">
                    {skills.map((skill, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">{skill.name}</span>
                          <span className="text-cyan-400 font-bold">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 group-hover:animate-pulse"
                            style={{ 
                              width: `${skill.level}%`,
                              background: `linear-gradient(90deg, ${skill.color}, ${skill.color}CC)`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Insights */}
                  <div className="mt-8 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30">
                    {skills.length > 0 ? (
                      <p className="text-sm">
                        <span className="text-purple-400 font-bold">🤖 AI Insight:</span> Your strongest skill is {getStrongestSkill()?.name} at {getStrongestSkill()?.level}%!
                        {getWeakestSkill() && getWeakestSkill().level < 70 && (
                          <> Keep practicing {getWeakestSkill()?.name} to reach expert level.</>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm">
                        <span className="text-purple-400 font-bold">🤖 AI Insight:</span> Add your skills to get personalized insights!
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold mb-6">Activity & Analytics</h2>
                
                {/* Weekly Activity Graph */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
                  <div className="flex items-end justify-between gap-2 h-48">
                    {weeklyActivity.map((day, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg hover:from-blue-500 hover:to-cyan-300 transition-all cursor-pointer"
                          style={{ height: `${(day.hours / 7) * 100}%` }}
                        ></div>
                        <div className="text-xs mt-2 text-gray-400">{day.day}</div>
                        <div className="text-xs font-bold text-cyan-400">{day.hours}h</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GitHub-style Heatmap */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contribution Heatmap</h3>
                  <div className="overflow-x-auto">
                    <div className="inline-grid grid-flow-col gap-1" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
                      {heatmapData.map((cell, idx) => (
                        <div
                          key={idx}
                          className={`w-3 h-3 rounded-sm ${
                            cell.value === 0 ? 'bg-gray-800' :
                            cell.value === 1 ? 'bg-green-900' :
                            cell.value === 2 ? 'bg-green-700' :
                            cell.value === 3 ? 'bg-green-500' :
                            'bg-green-400'
                          } hover:ring-2 ring-white transition`}
                          title={`Activity: ${cell.value}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 text-xs text-gray-400">
                    <span>Less</span>
                    <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                    <span>More</span>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { label: 'Time Spent', value: activityStats.timeSpent, icon: '⏱️', color: 'blue' },
                    { label: 'Tokens Used', value: activityStats.tokensUsed, icon: '💰', color: 'yellow' },
                    { label: 'Tokens Earned', value: activityStats.tokensEarned, icon: '💎', color: 'purple' },
                    { label: 'Completion Rate', value: activityStats.completionRate, icon: '✓', color: 'green' }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-xl text-center hover:bg-white/10 transition">
                      <div className="text-2xl mb-2">{stat.icon}</div>
                      <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Projects & Portfolio</h2>
                  <button
                    onClick={() => setIsEditingProjects(!isEditingProjects)}
                    className="text-xl hover:scale-110 transition"
                    title={isEditingProjects ? 'Done Editing' : 'Add/Edit Projects'}
                  >
                    {isEditingProjects ? '💾' : '✏️'}
                  </button>
                </div>

                {/* Add Project Form */}
                {isEditingProjects && (
                  <div className="p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl mb-6 border border-purple-500/30">
                    <h3 className="font-semibold mb-4 text-purple-300">➕ Add New Project</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        placeholder="Project Title (e.g., E-Commerce Platform)"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      />
                      <input
                        type="text"
                        value={newProject.image}
                        onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                        placeholder="Project Emoji (e.g., 🛒 🤖 💼)"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        maxLength="2"
                      />
                      <input
                        type="text"
                        value={newProject.tech}
                        onChange={(e) => setNewProject({ ...newProject, tech: e.target.value })}
                        placeholder="Technologies (comma-separated: React, Node.js, MongoDB)"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      />
                      <input
                        type="text"
                        value={newProject.liveUrl}
                        onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                        placeholder="Live Demo URL (optional)"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      />
                      <input
                        type="text"
                        value={newProject.githubUrl}
                        onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                        placeholder="GitHub URL (optional)"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      />
                      <button
                        onClick={addProject}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition transform hover:scale-105"
                      >
                        + Add Project
                      </button>
                    </div>
                  </div>
                )}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <p className="text-lg">No projects added yet</p>
                      <p className="text-sm mt-2">Click ✏️ to start adding your projects</p>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <div key={project.id} className="group bg-white/5 rounded-xl p-6 border border-white/5 hover:border-blue-500/50 transition">
                        {editingProjectId === project.id ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) => updateProject(project.id, { title: e.target.value })}
                              placeholder="Project Title"
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                            />
                            <input
                              type="text"
                              value={project.image}
                              onChange={(e) => updateProject(project.id, { image: e.target.value })}
                              placeholder="Emoji"
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                              maxLength="2"
                            />
                            <input
                              type="text"
                              value={project.tech.join(', ')}
                              onChange={(e) => updateProject(project.id, { tech: e.target.value.split(',').map(t => t.trim()) })}
                              placeholder="Technologies (comma-separated)"
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                            />
                            <input
                              type="text"
                              value={project.liveUrl}
                              onChange={(e) => updateProject(project.id, { liveUrl: e.target.value })}
                              placeholder="Live Demo URL"
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                            />
                            <input
                              type="text"
                              value={project.githubUrl}
                              onChange={(e) => updateProject(project.id, { githubUrl: e.target.value })}
                              placeholder="GitHub URL"
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingProjectId(null)}
                                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                              >
                                ✅ Save
                              </button>
                              <button
                                onClick={() => setEditingProjectId(null)}
                                className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Display Mode
                          <div>
                            <div className="text-6xl mb-4">{project.image}</div>
                            <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.tech.map((tech, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-600/30 rounded-full text-xs font-semibold">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-3 mb-3">
                              <a href={project.liveUrl} className="flex-1 text-center py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition">
                                Live Demo
                              </a>
                              <a href={project.githubUrl} className="flex-1 text-center py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition">
                                GitHub
                              </a>
                            </div>
                            {isEditingProjects && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingProjectId(project.id)}
                                  className="flex-1 py-2 hover:bg-blue-600/20 rounded-lg transition font-semibold"
                                  title="Edit"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => deleteProject(project.id)}
                                  className="flex-1 py-2 hover:bg-red-600/20 rounded-lg transition font-semibold"
                                  title="Delete"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === 'skills' && (
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Skills & Expertise</h2>
                  <button
                    onClick={() => setIsEditingSkills(!isEditingSkills)}
                    className="text-xl hover:scale-110 transition"
                    title={isEditingSkills ? 'Done Editing' : 'Edit Skills'}
                  >
                    {isEditingSkills ? '💾' : '✏️'}
                  </button>
                </div>
                
                {/* Add Skill Form */}
                {isEditingSkills && (
                  <div className="p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl mb-6 border border-blue-500/30">
                    <h3 className="font-semibold mb-4 text-blue-300">➕ Add New Skill</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                          placeholder="Enter skill name (e.g., React, Python)"
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                        />
                        <button
                          onClick={addSkill}
                          className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition transform hover:scale-105"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-400">Proficiency: {newSkill.level}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={newSkill.level}
                          onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Skills List */}
                <div className="space-y-4">
                  {skills.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-lg">No skills added yet</p>
                      <p className="text-sm mt-2">Click ✏️ to start adding your skills</p>
                    </div>
                  ) : (
                    skills.map((skill) => (
                      <div key={skill.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition">
                        {editingSkillId === skill.id ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                            />
                            <div className="flex items-center gap-3">
                              <label className="text-sm text-gray-400 w-24">Level: {skill.level}%</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={skill.level}
                                onChange={(e) => updateSkill(skill.id, { level: parseInt(e.target.value) })}
                                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingSkillId(null)}
                                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                              >
                                ✅ Save
                              </button>
                              <button
                                onClick={() => setEditingSkillId(null)}
                                className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Display Mode
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xl font-bold">{skill.name}</span>
                              <span className="px-3 py-1 bg-cyan-600 rounded-full text-sm font-semibold">
                                Level {Math.floor(skill.level / 10)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-3">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${skill.level}%`,
                                  background: `linear-gradient(90deg, ${skill.color}, ${skill.color}CC)`
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex justify-between flex-1 text-xs text-gray-400 mr-4">
                                <span>{skill.level}% Mastery</span>
                                <span>{100 - skill.level}% to Expert</span>
                              </div>
                              {isEditingSkills && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingSkillId(skill.id)}
                                    className="p-1 hover:bg-blue-600/20 rounded transition"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => deleteSkill(skill.id)}
                                    className="p-1 hover:bg-red-600/20 rounded transition"
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* 8️⃣ AI PERSONALIZATION PANEL */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🤖</div>
                  <h3 className="text-xl font-bold">AI Insights</h3>
                </div>
                <button
                  onClick={() => isEditingAI ? saveAIInsights() : setIsEditingAI(true)}
                  className="text-xl hover:scale-110 transition"
                  title={isEditingAI ? 'Save' : 'Edit AI Insights'}
                >
                  {isEditingAI ? '💾' : '✏️'}
                </button>
              </div>

              {/* Completion indicator */}
              <div className={`mb-3 p-2 rounded-lg text-xs ${completionBreakdown.aiInsights ? 'bg-green-600/20 text-green-300' : 'bg-blue-600/20 text-blue-300'}`}>
                {completionBreakdown.aiInsights ? (
                  '✅ Complete! (+5% to profile)'
                ) : (
                  '📝 Fill all 3 sections to complete (+5% to profile)'
                )}
              </div>
              
              <div className="space-y-3 text-sm">
                {/* Strengths */}
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-purple-400 font-semibold mb-1">💪 Strengths</p>
                  {isEditingAI ? (
                    <textarea
                      value={aiInsights.strengths}
                      onChange={(e) => setAiInsights({...aiInsights, strengths: e.target.value})}
                      placeholder="e.g., Excellent progress in JavaScript frameworks..."
                      className="w-full bg-white/10 text-gray-300 rounded-lg p-2 border border-white/20 focus:border-purple-500 outline-none resize-none"
                      rows="2"
                    />
                  ) : (
                    aiInsights.strengths ? (
                      <p className="text-gray-300">{aiInsights.strengths}</p>
                    ) : (
                      <p className="text-gray-500 italic">Not filled yet</p>
                    )
                  )}
                </div>
                
                {/* Suggestions */}
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-blue-400 font-semibold mb-1">🎯 Suggestions</p>
                  {isEditingAI ? (
                    <textarea
                      value={aiInsights.suggestions}
                      onChange={(e) => setAiInsights({...aiInsights, suggestions: e.target.value})}
                      placeholder="e.g., Focus on Database optimization..."
                      className="w-full bg-white/10 text-gray-300 rounded-lg p-2 border border-white/20 focus:border-blue-500 outline-none resize-none"
                      rows="2"
                    />
                  ) : (
                    aiInsights.suggestions ? (
                      <p className="text-gray-300">{aiInsights.suggestions}</p>
                    ) : (
                      <p className="text-gray-500 italic">Not filled yet</p>
                    )
                  )}
                </div>
                
                {/* Career Path */}
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-green-400 font-semibold mb-1">🚀 Career Path</p>
                  {isEditingAI ? (
                    <textarea
                      value={aiInsights.careerPath}
                      onChange={(e) => setAiInsights({...aiInsights, careerPath: e.target.value})}
                      placeholder="e.g., On track to become Senior Full Stack Developer..."
                      className="w-full bg-white/10 text-gray-300 rounded-lg p-2 border border-white/20 focus:border-green-500 outline-none resize-none"
                      rows="2"
                    />
                  ) : (
                    aiInsights.careerPath ? (
                      <p className="text-gray-300">{aiInsights.careerPath}</p>
                    ) : (
                      <p className="text-gray-500 italic">Not filled yet</p>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* 7️⃣ SOCIAL & PRESENCE */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Social Links</h3>
                {viewerIsOwner && (
                  <button
                    onClick={() => isEditingSocial ? saveSocialLinks() : setIsEditingSocial(true)}
                    className="text-xl hover:scale-110 transition"
                    title={isEditingSocial ? 'Save' : 'Edit Social Links'}
                  >
                    {isEditingSocial ? '💾' : '✏️'}
                  </button>
                )}
              </div>
              
              {/* Show content only if profile is viewable or user is owner */}
              {canViewContent() ? (
                <div className="space-y-3">
                  {/* GitHub */}
                  <div className="p-3 bg-gray-600/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💻</span>
                      <span className="font-semibold">GitHub</span>
                    </div>
                    {isEditingSocial && viewerIsOwner ? (
                      <input
                        type="text"
                        value={socialLinks.github}
                        onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                        placeholder="https://github.com/yourusername"
                        className="w-full bg-white/10 text-gray-300 rounded-lg px-3 py-2 border border-white/20 focus:border-gray-400 outline-none text-sm"
                      />
                    ) : (
                      socialLinks.github ? (
                        <a 
                          href={socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm underline block truncate"
                        >
                          {socialLinks.github}
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">No link added</p>
                      )
                    )}
                  </div>

                  {/* LinkedIn */}
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💼</span>
                      <span className="font-semibold">LinkedIn</span>
                    </div>
                    {isEditingSocial && viewerIsOwner ? (
                      <input
                        type="text"
                        value={socialLinks.linkedin}
                        onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                        placeholder="https://linkedin.com/in/yourusername"
                        className="w-full bg-white/10 text-gray-300 rounded-lg px-3 py-2 border border-white/20 focus:border-blue-400 outline-none text-sm"
                      />
                    ) : (
                      socialLinks.linkedin ? (
                        <a 
                          href={socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm underline block truncate"
                        >
                          {socialLinks.linkedin}
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">No link added</p>
                      )
                    )}
                  </div>

                  {/* Twitter */}
                  <div className="p-3 bg-cyan-600/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🐦</span>
                      <span className="font-semibold">Twitter</span>
                    </div>
                    {isEditingSocial && viewerIsOwner ? (
                      <input
                        type="text"
                        value={socialLinks.twitter}
                        onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                        placeholder="https://twitter.com/yourusername"
                        className="w-full bg-white/10 text-gray-300 rounded-lg px-3 py-2 border border-white/20 focus:border-cyan-400 outline-none text-sm"
                      />
                    ) : (
                      socialLinks.twitter ? (
                        <a 
                          href={socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm underline block truncate"
                        >
                          {socialLinks.twitter}
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">No link added</p>
                      )
                    )}
                  </div>

                  {/* Portfolio */}
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🌐</span>
                      <span className="font-semibold">Portfolio</span>
                    </div>
                    {isEditingSocial && viewerIsOwner ? (
                      <input
                        type="text"
                        value={socialLinks.portfolio}
                        onChange={(e) => setSocialLinks({...socialLinks, portfolio: e.target.value})}
                        placeholder="https://yourportfolio.com"
                        className="w-full bg-white/10 text-gray-300 rounded-lg px-3 py-2 border border-white/20 focus:border-purple-400 outline-none text-sm"
                      />
                    ) : (
                      socialLinks.portfolio ? (
                        <a 
                          href={socialLinks.portfolio} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm underline block truncate"
                        >
                          {socialLinks.portfolio}
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">No link added</p>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-600/20 rounded-lg border border-red-500/30">
                  <p className="text-red-300 text-sm">
                    🔒 This profile is {profileVisibility === 'private' ? 'private' : 'friends only'}. Social links are not visible due to privacy settings.
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/10">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-semibold">Open for Collaboration</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </label>
              </div>
            </div>

            {/* 9️⃣ PRIVACY & CONTROL */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Privacy Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Profile Visibility</label>
                  <select 
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    className="w-full bg-white/10 px-3 py-2 rounded-lg border border-white/20 focus:border-blue-500 outline-none"
                  >
                    <option value="public">🌐 Public</option>
                    <option value="private">🔒 Private</option>
                    <option value="friends">👥 Friends Only</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2">{getPrivacyDescription(profileVisibility)}</p>
                </div>

                {/* Privacy Info Cards */}
                <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-blue-300">
                    {profileVisibility === 'public' && '✅ Your profile is visible to everyone on SkillSwap'}
                    {profileVisibility === 'private' && '🔒 Your profile is hidden from everyone except you'}
                    {profileVisibility === 'friends' && '👥 Your profile is visible only to your friends'}
                  </p>
                </div>

                {/* Social Links Visibility Info */}
                {(profileVisibility === 'private' && !viewerIsOwner) && (
                  <div className="p-3 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
                    <p className="text-sm text-yellow-300">⚠️ Social links and profile details are hidden due to privacy settings</p>
                  </div>
                )}

                {/* Action Buttons */}
                <button 
                  onClick={downloadProfilePDF}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  title="Download your profile as PDF"
                >
                  📥 Download Profile PDF
                </button>
                
                <button 
                  onClick={copyProfileLink}
                  className={`w-full py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    profileVisibility === 'public' 
                      ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer' 
                      : 'bg-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={profileVisibility !== 'public'}
                  title={profileVisibility === 'public' ? 'Share your public profile link' : 'Profile link can only be shared when profile is public'}
                >
                  🔗 Copy Profile Link {profileVisibility !== 'public' && '(Private)'}
                </button>

                {/* Privacy Help */}
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-2"><strong>Privacy Levels:</strong></p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>🌐 <strong>Public:</strong> Visible to all users, profile link can be shared</li>
                    <li>👥 <strong>Friends Only:</strong> Visible only to your friends</li>
                    <li>🔒 <strong>Private:</strong> Visible only to you, not visible to any other user</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
