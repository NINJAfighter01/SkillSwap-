import React, { useContext, useState, useEffect, useRef } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import { useWebSocket } from '../context/WebSocketContext'
import { useParams, useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { logCourseCompletion } from '../utils/activityStore'

const CoursePage = () => {
  const { isDark } = useContext(ThemeContext)
  const { user, updateUser } = useContext(AuthContext)
  const { enrollInCourse, completeCourse, connected } = useWebSocket()
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  
  // State management
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('video') // video, notes, myNotes
  const [userNote, setUserNote] = useState('')
  const [userNotes, setUserNotes] = useState([])
  const [noteTitle, setNoteTitle] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [tokensDeducted, setTokensDeducted] = useState(false)

  // Sample course data with video URLs
  const sampleCourses = {
    1: {
      id: 1,
      title: 'React Mastery 1',
      description: 'Learn to build scalable applications with modern React patterns and best practices.',
      instructor: 'Sample Teacher',
      tokens: 10,
      category: 'Web Development',
      duration: 45,
      videoUrl: '/video/white-toyota-drifting.3840x2160.mp4',
      courseNotes: `
        <h2>Course Overview</h2>
        <p>Welcome to React Mastery! This comprehensive course will teach you:</p>
        <ul>
          <li>React fundamentals and core concepts</li>
          <li>Component lifecycle and hooks</li>
          <li>State management with Context API and Redux</li>
          <li>Building reusable components</li>
          <li>Performance optimization techniques</li>
        </ul>
        <h2>Prerequisites</h2>
        <p>Basic knowledge of JavaScript, HTML, and CSS is recommended.</p>
        <h2>Key Topics</h2>
        <ul>
          <li>JSX and Virtual DOM</li>
          <li>Props and State</li>
          <li>Event Handling</li>
          <li>Conditional Rendering</li>
          <li>Lists and Keys</li>
        </ul>
      `
    },
    2: {
      id: 2,
      title: 'JavaScript Advanced 2',
      description: 'Learn to build scalable applications with modern JavaScript patterns and best practices.',
      instructor: 'Sample Teacher',
      tokens: 15,
      category: 'Programming',
      duration: 45,
      videoUrl: '/video/eclipse-over-silent-falls.3840x2160.mp4',
      courseNotes: '<p>Advanced JavaScript notes will be available here.</p>',
    },
    3: {
      id: 3,
      title: 'Web Development Pro 3',
      description: 'Learn to build scalable applications with modern web development patterns and best practices.',
      instructor: 'Sample Teacher',
      tokens: 20,
      category: 'Web Development',
      duration: 45,
      videoUrl: '/video/neon-skyline.3840x2160.mp4',
      courseNotes: '<p>Web Development Pro notes will be available here.</p>',
    },
    4: {
      id: 4,
      title: 'Node.js & Express 4',
      description: 'Learn to build scalable backend applications with Node.js and Express.',
      instructor: 'Sample Teacher',
      tokens: 25,
      category: 'Backend',
      duration: 45,
      videoUrl: '/video/miles-morales-in-multiverse.3840x2160.mp4',
      courseNotes: '<p>Node.js & Express notes will be available here.</p>',
    },
    // Add more courses as needed
  }

  useEffect(() => {
    loadCourse()
    loadUserNotes()
    setTokensDeducted(false)
  }, [id])

  const loadCourse = () => {
    setLoading(true)
    // In real app, fetch from API. For now, use sample data
    setTimeout(() => {
      const courseData = sampleCourses[id] || {
        id: parseInt(id),
        title: `Course ${id}`,
        description: 'Learn to build scalable applications with modern patterns and best practices.',
        instructor: 'Sample Teacher',
        tokens: 10 + (parseInt(id) % 5) * 5,
        category: 'Programming',
        duration: 45,
        videoUrl: '/video/motivational-quote.3840x2160.mp4',
        courseNotes: '<p>Course notes for this lecture will be available soon.</p>'
      }
      setCourse(courseData)
      setLoading(false)
    }, 500)
  }

  const loadUserNotes = () => {
    const saved = localStorage.getItem(`course_${id}_notes`)
    if (saved) {
      setUserNotes(JSON.parse(saved))
    }
  }

  const saveUserNote = () => {
    if (!noteTitle.trim() || !userNote.trim()) {
      alert('Please enter both title and note content')
      return
    }

    const newNote = {
      id: Date.now(),
      title: noteTitle,
      content: userNote,
      createdAt: new Date().toISOString(),
      courseId: id
    }

    const updatedNotes = [...userNotes, newNote]
    setUserNotes(updatedNotes)
    localStorage.setItem(`course_${id}_notes`, JSON.stringify(updatedNotes))
    
    setNoteTitle('')
    setUserNote('')
    alert('Note saved successfully!')
  }

  const deleteUserNote = (noteId) => {
    if (window.confirm('Delete this note?')) {
      const updatedNotes = userNotes.filter(n => n.id !== noteId)
      setUserNotes(updatedNotes)
      localStorage.setItem(`course_${id}_notes`, JSON.stringify(updatedNotes))
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleCourseStart = async () => {
    if (tokensDeducted || !course) return
    if (!user) {
      alert('Please log in to start this course')
      if (videoRef.current) videoRef.current.pause()
      return
    }

    const availableTokens = user.tokens || 0
    if (availableTokens < course.tokens) {
      alert('❌ Not enough tokens to start this course')
      if (videoRef.current) videoRef.current.pause()
      return
    }

    try {
      // Use WebSocket for real-time enrollment
      if (connected) {
        const result = await enrollInCourse(course.id, course.tokens)
        setTokensDeducted(true)
        console.log('✓ Course enrollment via WebSocket:', result)
      } else {
        // Fallback to local update
        updateUser({ ...user, tokens: availableTokens - course.tokens })
        setTokensDeducted(true)
        console.log('✓ Course enrollment (fallback)')
      }
    } catch (error) {
      console.error('Course enrollment error:', error)
      alert('❌ Failed to enroll: ' + error.message)
      if (videoRef.current) videoRef.current.pause()
    }
  }

  const handleCourseCompletion = async () => {
    if (!course) return

    try {
      const timeSpentHours = Math.max(0.1, course.duration / 60)
      
      // Use WebSocket for real-time completion
      if (connected) {
        await completeCourse(course.id, timeSpentHours, 0)
        console.log('✓ Course completion via WebSocket')
      } else {
        // Fallback to local logging
        logCourseCompletion(timeSpentHours, 0)
        console.log('✓ Course completion (fallback)')
      }
    } catch (error) {
      console.error('Course completion error:', error)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-2xl">Loading course...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-2xl mb-4">Course not found</p>
          <button onClick={() => navigate('/courses')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/courses')}
            className={`mb-4 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}`}
          >
            ← Back to Courses
          </button>
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {course.title}
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            By {course.instructor} • {course.duration} minutes • 💎 {course.tokens} tokens
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className={`rounded-t-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('video')}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === 'video'
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📹 Video
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === 'notes'
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📝 Course Notes
                </button>
                <button
                  onClick={() => setActiveTab('myNotes')}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === 'myNotes'
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ✏️ My Notes ({userNotes.length})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className={`rounded-b-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Video Tab */}
              {activeTab === 'video' && (
                <div>
                  <div className="rounded-lg overflow-hidden bg-black mb-4">
                    <video
                      ref={videoRef}
                      className="w-full"
                      controls
                      onPlay={() => {
                        setIsPlaying(true)
                        handleCourseStart()
                      }}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => {
                        setIsPlaying(false)
                        if (course) {
                          logCourseCompletion(Math.max(0.1, course.duration / 60), 0)
                        }
                      }}
                    >
                      <source src={course.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className="font-bold text-lg mb-2">About this course</h3>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {course.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Course Notes Tab */}
              {activeTab === 'notes' && (
                <div className="prose max-w-none">
                  <div 
                    className={isDark ? 'text-gray-300' : 'text-gray-800'}
                    dangerouslySetInnerHTML={{ __html: course.courseNotes }}
                  />
                </div>
              )}

              {/* My Notes Tab */}
              {activeTab === 'myNotes' && (
                <div>
                  {/* Create Note Form */}
                  <div className={`p-6 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className="text-xl font-bold mb-4">Create New Note</h3>
                    <input
                      type="text"
                      placeholder="Note Title"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg mb-4 ${
                        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                      } border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                    />
                    <ReactQuill
                      theme="snow"
                      value={userNote}
                      onChange={setUserNote}
                      className={`mb-4 ${isDark ? 'quill-dark' : ''}`}
                      style={{ height: '200px', marginBottom: '50px' }}
                    />
                    <button
                      onClick={saveUserNote}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                      Save Note
                    </button>
                  </div>

                  {/* User Notes List */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">My Notes</h3>
                    {userNotes.length === 0 ? (
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        No notes yet. Start taking notes while watching the video!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {userNotes.map((note) => (
                          <div
                            key={note.id}
                            className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-lg">{note.title}</h4>
                              <button
                                onClick={() => deleteUserNote(note.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                            <div
                              className={`prose max-w-none ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                              dangerouslySetInnerHTML={{ __html: note.content }}
                            />
                            <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {new Date(note.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Info Card */}
            <div className={`rounded-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} sticky top-4`}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎓</div>
                <h3 className="text-2xl font-bold mb-2">{course.tokens} Tokens</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Required for enrollment
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Category:</span>
                  <span className="font-semibold">{course.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Duration:</span>
                  <span className="font-semibold">{course.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Instructor:</span>
                  <span className="font-semibold">{course.instructor}</span>
                </div>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold mb-3">
                ✓ Enrolled
              </button>
              
              <button 
                onClick={() => navigate('/interactive-notes')}
                className={`w-full py-3 rounded-lg font-semibold border-2 ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Open Notes Editor
              </button>
            </div>

            {/* Quick Actions */}
            <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className={`w-full text-left px-4 py-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  💬 Ask Question
                </button>
                <button className={`w-full text-left px-4 py-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  ⭐ Rate Course
                </button>
                <button className={`w-full text-left px-4 py-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  📥 Download Resources
                </button>
                <button className={`w-full text-left px-4 py-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  🔗 Share Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePage
