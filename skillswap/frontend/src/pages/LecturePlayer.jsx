import React, { useContext, useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import NotesEditor from '../components/NotesEditor'
import lectureService from '../services/lectureService'
import notesService from '../services/notesService'
import userService from '../services/userService'

const LecturePlayer = () => {
  const { isDark } = useContext(ThemeContext)
  const { id } = useParams()
  const [lecture, setLecture] = useState(null)
  const [existingNote, setExistingNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef(null)
  const lastProgressSentRef = useRef(0)
  const lastPercentSentRef = useRef(0)

  useEffect(() => {
    fetchLecture()
    fetchNotes()
  }, [id])

  useEffect(() => {
    lastProgressSentRef.current = 0
    lastPercentSentRef.current = 0
  }, [id])

  const fetchLecture = async () => {
    try {
      const response = await lectureService.getLectureById(id)
      setLecture(response.data)
      await lectureService.watchLecture(id)
    } catch (error) {
      console.error('Error fetching lecture:', error)
    }
    setLoading(false)
  }

  const fetchNotes = async () => {
    try {
      const response = await notesService.getNotes(id)
      if (response.data.notes && response.data.notes.length > 0) {
        setExistingNote(response.data.notes[0])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const handleTimeUpdate = async () => {
    const videoEl = videoRef.current
    if (!videoEl || !lecture) return
    if (!videoEl.duration || Number.isNaN(videoEl.duration)) return

    const percent = Math.min(100, Math.round((videoEl.currentTime / videoEl.duration) * 100))
    const now = Date.now()

    if (percent < 1) return
    if (percent !== 100 && now - lastProgressSentRef.current < 5000 && Math.abs(percent - lastPercentSentRef.current) < 2) {
      return
    }

    lastProgressSentRef.current = now
    lastPercentSentRef.current = percent

    try {
      await userService.updateProgress({
        lectureId: id,
        completionPercentage: percent,
      })
    } catch (error) {
      console.error('Error updating lecture progress:', error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!lecture) return <div>Lecture not found</div>

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className={`rounded-lg overflow-hidden shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="aspect-video bg-black flex items-center justify-center">
                {lecture.videoUrl ? (
                  <video
                    src={lecture.videoUrl}
                    controls
                    ref={videoRef}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full"
                  />
                ) : (
                  <span className="text-white text-4xl">📹</span>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">{lecture.title}</h1>
                <p className={`text-lg mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {lecture.description}
                </p>

                <div className="flex gap-6 mb-6">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Teacher
                    </p>
                    <p className="font-semibold text-lg">{lecture.teacherName}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tokens
                    </p>
                    <p className="font-semibold text-lg text-blue-600">{lecture.tokens}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Duration
                    </p>
                    <p className="font-semibold text-lg">{lecture.duration} min</p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="font-bold mb-2">About this lecture</h3>
                  <p>{lecture.fullDescription}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Editor */}
          <div>
            <NotesEditor 
              lectureId={id} 
              existingNote={existingNote}
              onNoteUpdated={fetchNotes}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LecturePlayer
