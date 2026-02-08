import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import videoService from '../services/videoService'

const CourseListing = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(true)

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoadingVideos(true)
        const response = await videoService.getAllVideos({ limit: 12 })
        setVideos(response.data.videos || [])
      } catch (error) {
        console.error('Error loading videos:', error)
      } finally {
        setLoadingVideos(false)
      }
    }

    loadVideos()
  }, [])

  // Sample course data - 24 courses per page, different for each page
  const pageStartIndex = (currentPage - 1) * 24
  
  const subjectsByPage = [
    [
      'React Mastery',
      'JavaScript Advanced',
      'Web Development Pro',
      'Node.js & Express',
      'Python Full Stack',
      'Database Design',
      'Vue.js Essentials',
      'Angular Advanced',
      'TypeScript Pro',
      'REST API Design',
      'GraphQL Mastery',
      'DevOps Fundamentals',
      'Cloud Computing AWS',
      'Docker & Containers',
      'Kubernetes Basics',
      'Mobile App Development',
      'React Native',
      'UI/UX Design',
      'CSS & Animations',
      'HTML5 & Semantics',
      'Git & Version Control',
      'Testing & QA',
      'Performance Optimization',
      'Security Best Practices'
    ],
    [
      'Data Structures',
      'Algorithms Mastery',
      'System Design',
      'Microservices',
      'Event-Driven Architecture',
      'Clean Code Practices',
      'SOLID Principles',
      'Refactoring Masterclass',
      'Design Patterns',
      'Software Architecture',
      'CI/CD Pipelines',
      'Linux Essentials',
      'Shell Scripting',
      'Networking Basics',
      'Cloud Computing Azure',
      'Serverless Functions',
      'NoSQL Databases',
      'MongoDB Mastery',
      'PostgreSQL Advanced',
      'Redis Caching',
      'API Security',
      'OAuth & JWT',
      'Code Review Skills',
      'Project Management'
    ],
    [
      'AI Fundamentals',
      'Machine Learning',
      'Deep Learning',
      'Data Science',
      'Pandas & NumPy',
      'Data Visualization',
      'Tableau Basics',
      'Power BI Essentials',
      'Big Data Hadoop',
      'Spark with Scala',
      'ETL Pipelines',
      'Data Warehousing',
      'Analytics Engineering',
      'MLOps Basics',
      'Natural Language Processing',
      'Computer Vision',
      'Recommendation Systems',
      'Time Series Analysis',
      'Statistics for Data',
      'A/B Testing',
      'Prompt Engineering',
      'LLM Applications',
      'GenAI for Developers',
      'Ethics in AI'
    ],
    [
      'Cybersecurity Basics',
      'Ethical Hacking',
      'Penetration Testing',
      'Network Security',
      'Web Security',
      'OWASP Top 10',
      'Threat Modeling',
      'Incident Response',
      'Digital Forensics',
      'Malware Analysis',
      'Cryptography',
      'Secure Coding',
      'Compliance & Audits',
      'Risk Management',
      'Security Operations',
      'SIEM Tools',
      'Identity & Access',
      'Zero Trust',
      'Privacy Engineering',
      'Blockchain Basics',
      'Smart Contracts',
      'Web3 Development',
      'Game Development',
      'Unity Essentials'
    ]
  ]

  const subjectIndex = Math.min(currentPage - 1, subjectsByPage.length - 1)
  const pageSubjects = subjectsByPage[subjectIndex]

  const courses = Array.from({ length: 24 }, (_, i) => ({
    id: pageStartIndex + i + 1,
    title: `${pageSubjects[i]} ${pageStartIndex + i + 1}`,
    description: 'Learn to build scalable applications with modern patterns and best practices.',
    instructor: 'Sample Teacher',
    tokens: 10 + (i % 5) * 5, // 10, 15, 20, 25, 30
  }))

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < 4) setCurrentPage(currentPage + 1)
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 via-navy-900 to-black' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} py-12 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className={`text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📚 Explore Courses
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Discover and enroll in amazing learning opportunities
          </p>
          <p className={`text-sm mt-3 font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            Page {currentPage}: Courses {pageStartIndex + 1} - {pageStartIndex + 24}
          </p>
        </div>

        {/* Community Videos */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🎥 Community Videos
            </h2>
            <button
              onClick={() => navigate('/videos')}
              className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
            >
              View all videos →
            </button>
          </div>

          {loadingVideos ? (
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading videos...
            </div>
          ) : videos.length === 0 ? (
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No videos uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}
                  onClick={() => {
                    console.log('Video clicked:', video.id, video.title);
                    navigate(`/videos/${video.id}`)
                  }}
                >
                  <div className="h-36 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 flex items-center justify-center relative overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-5xl">🎬</div>
                    )}
                  </div>

                  <div className={`p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-sm font-bold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {video.title}
                    </h3>
                    <p className={`text-xs mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {video.description || 'Watch and learn from this video.'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {video.skillTag}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {video.level}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Courses Grid - 6 columns, 4 rows = 24 courses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              {/* Card Header with Gradient */}
              <div className="h-32 bg-gradient-to-r from-blue-500 via-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                
                {/* Graduation Cap Icon */}
                <div className="text-6xl relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  🎓
                </div>
              </div>

              {/* Card Body */}
              <div className={`p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Course Title */}
                <h3 className={`text-sm font-bold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {course.title}
                </h3>

                {/* Course Description */}
                <p className={`text-xs mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {course.description}
                </p>

                {/* Instructor */}
                <p className={`text-xs mb-3 font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  By {course.instructor}
                </p>

                {/* Token Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors duration-200">
                    💎 {course.tokens} tokens
                  </span>
                </div>

                {/* Enroll Button */}
                <button 
                  onClick={() => navigate(`/course/${course.id}`)}
                  className={`w-full mt-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}>
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
              currentPage === 1
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                : isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            ← Previous
          </button>

          <div className={`text-lg font-bold px-6 py-3 rounded-lg ${
            isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
          }`}>
            Page {currentPage} of 4
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === 4}
            className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
              currentPage === 4
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                : isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            Next →
          </button>
        </div>

        {/* Info Text */}
        <div className="text-center mt-8">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            Showing 24 courses • Page {currentPage} of 4
          </p>
        </div>
      </div>
    </div>
  )
}

export default CourseListing
