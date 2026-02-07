import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import notesService from '../services/notesService'
import lectureService from '../services/lectureService'

const InteractiveNotes = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [selectedLectureId, setSelectedLectureId] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchNotes()
    fetchLectures()
  }, [])

  const fetchLectures = async () => {
    try {
      const response = await lectureService.getAllLectures(1, 100, '')
      setLectures(response.data.lectures || [])
    } catch (error) {
      console.error('Error fetching lectures:', error)
    }
  }

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const response = await notesService.getAllNotes()
      setNotes(response.data.notes)
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
    setLoading(false)
  }

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return
    
    try {
      await notesService.deleteNote(noteId)
      setNotes(notes.filter(note => note.id !== noteId))
      alert('✅ Note deleted successfully!')
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('❌ Error deleting note')
    }
  }

  const handleDownloadNote = (note) => {
    const element = document.createElement('a')
    const file = new Blob([note.content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `note-${note.Lecture?.title || 'lecture'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || !selectedLectureId) {
      alert('Please select a lecture and write something')
      return
    }

    setIsSaving(true)
    try {
      const response = await notesService.createNote({
        lectureId: selectedLectureId,
        content: newNoteContent
      })
      setNotes([response.data.note, ...notes])
      setNewNoteContent('')
      setSelectedLectureId('')
      setShowAddForm(false)
      alert('✅ Note added successfully!')
    } catch (error) {
      console.error('Error adding note:', error)
      alert('❌ Error adding note')
    }
    setIsSaving(false)
  }

  const handleUpdateNote = async (noteId) => {
    if (!editingContent.trim()) {
      alert('Please write something')
      return
    }

    setIsSaving(true)
    try {
      await notesService.updateNote(noteId, { content: editingContent })
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, content: editingContent, updatedAt: new Date() } : note
      ))
      setEditingNoteId(null)
      setEditingContent('')
      alert('✅ Note updated successfully!')
    } catch (error) {
      console.error('Error updating note:', error)
      alert('❌ Error updating note')
    }
    setIsSaving(false)
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditingContent('')
  }

  const filteredNotes = notes.filter(note =>
    note.content?.toLowerCase().includes(filter.toLowerCase()) ||
    note.Lecture?.title?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className={`mb-12 rounded-lg p-8 ${isDark ? 'bg-gradient-to-r from-purple-900 to-pink-900' : 'bg-gradient-to-r from-purple-500 to-pink-600'} text-white`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold mb-4">📝 Interactive Notes</h1>
              <p className="text-xl">Take and organize notes while watching lectures</p>
            </div>
            <button
              onClick={fetchNotes}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-bold transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-purple-600">{notes.length}</div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>📝 Total Notes</p>
          </div>
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-blue-600">
              {notes.reduce((total, note) => total + note.content.trim().split(/\s+/).filter(w => w.length > 0).length, 0)}
            </div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>📖 Total Words</p>
          </div>
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-green-600">
              {notes.reduce((total, note) => total + note.content.length, 0)}
            </div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>🔤 Total Characters</p>
          </div>
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-orange-600">
              {new Set(notes.map(note => note.Lecture?.id)).size}
            </div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>🎓 Lectures with Notes</p>
          </div>
        </div>

        {/* Add Note Form */}
        {showAddForm && (
          <div className={`rounded-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-2 border-purple-500`}>
            <h2 className="text-2xl font-bold mb-4">➕ Add New Note</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Lecture:
                </label>
                <select
                  value={selectedLectureId}
                  onChange={(e) => setSelectedLectureId(e.target.value)}
                  className={`w-full p-3 rounded-lg border-2 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-black'
                  } focus:outline-none focus:border-purple-500`}
                >
                  <option value="">-- Choose a lecture --</option>
                  {lectures.map((lecture) => (
                    <option key={lecture.id} value={lecture.id}>
                      {lecture.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Notes:
                </label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write your notes here..."
                  className={`w-full h-40 p-4 rounded-lg border-2 focus:outline-none focus:border-purple-500 resize-none ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-black placeholder-gray-500'
                  }`}
                />
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  📝 {newNoteContent.trim().split(/\s+/).filter(w => w.length > 0).length} words | 🔤 {newNoteContent.length} characters
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddNote}
                  disabled={isSaving}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-bold"
                >
                  {isSaving ? '💾 Saving...' : '✅ Add Note'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewNoteContent('')
                    setSelectedLectureId('')
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition font-bold"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Note Button */}
        {!showAddForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-bold text-lg"
            >
              ➕ Add New Note
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search notes by lecture or content..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`w-full p-4 rounded-lg border-2 ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-black'
            } focus:outline-none focus:border-purple-500`}
          />
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="text-center text-2xl">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <p className="text-2xl mb-4">📝 No notes found</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Start watching lectures and take notes!
            </p>
            <button
              onClick={() => navigate('/lectures')}
              className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Browse Lectures
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition`}
              >
                {editingNoteId === note.id ? (
                  // Edit Mode
                  <div>
                    <h3 className="text-xl font-bold mb-4">✏️ Edit Note - {note.Lecture?.title}</h3>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className={`w-full h-40 p-4 rounded-lg border-2 focus:outline-none focus:border-purple-500 resize-none mb-3 ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-black placeholder-gray-500'
                      }`}
                    />
                    <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      📝 {editingContent.trim().split(/\s+/).filter(w => w.length > 0).length} words | 🔤 {editingContent.length} characters
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={isSaving}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-bold"
                      >
                        {isSaving ? '💾 Saving...' : '✅ Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition font-bold"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    {/* Lecture Title */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 
                          className="text-xl font-bold mb-2 cursor-pointer hover:text-purple-600 transition"
                          onClick={() => navigate(`/lecture/${note.Lecture?.id}`)}
                        >
                          {note.Lecture?.title || 'Untitled Lecture'}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {note.Lecture?.description || ''}
                        </p>
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Last edited: {new Date(note.updatedAt).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Note Content */}
                    <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {note.content}
                      </pre>
                    </div>

                    {/* Note Statistics */}
                    <div className={`flex gap-6 mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="flex items-center gap-2">
                        📝 <strong>{note.content.trim().split(/\s+/).filter(word => word.length > 0).length}</strong> words
                      </span>
                      <span className="flex items-center gap-2">
                        🔤 <strong>{note.content.length}</strong> characters
                      </span>
                      <span className="flex items-center gap-2">
                        📅 <strong>{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id)
                          setEditingContent(note.content)
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => navigate(`/lecture/${note.Lecture?.id}`)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold"
                      >
                        📺 View Lecture
                      </button>
                      <button
                        onClick={() => handleDownloadNote(note)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
                      >
                        💾 Download
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InteractiveNotes
