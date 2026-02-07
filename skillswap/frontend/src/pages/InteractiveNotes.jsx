import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import notesService from '../services/notesService'
import lectureService from '../services/lectureService'
import ReactQuill from 'react-quill'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url'
import * as mammoth from 'mammoth/mammoth.browser'
import Papa from 'papaparse'
import Tesseract from 'tesseract.js'
import 'react-quill/dist/quill.snow.css'
import '../styles/quill-custom.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

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
  const [viewedNoteIds, setViewedNoteIds] = useState(new Set())
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  const [importMode, setImportMode] = useState('replace')

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['code-block'],
      ['link'],
      ['clean']
    ]
  }

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'background',
    'list', 'bullet',
    'code-block',
    'link'
  ]

  // Helper function to calculate reading time (avg 200 words per minute)
  const calculateReadingTime = (content) => {
    const plainText = content.replace(/<[^>]*>/g, '').trim()
    const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length
    const readingTime = Math.ceil(wordCount / 200)
    return readingTime < 1 ? '< 1 min' : `${readingTime} min`
  }

  // Helper function to calculate total reading time for all notes
  const calculateTotalReadingTime = () => {
    return notes.reduce((total, note) => {
      const plainText = note.content.replace(/<[^>]*>/g, '').trim()
      const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length
      const readingTime = Math.ceil(wordCount / 200)
      return total + (readingTime < 1 ? 0 : readingTime)
    }, 0)
  }

  // Helper function to calculate total words
  const calculateTotalWords = () => {
    return notes.reduce((total, note) => {
      const plainText = note.content.replace(/<[^>]*>/g, '').trim()
      const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length
      return total + wordCount
    }, 0)
  }

  // Helper function to calculate total characters
  const calculateTotalCharacters = () => {
    return notes.reduce((total, note) => {
      const plainText = note.content.replace(/<[^>]*>/g, '')
      return total + plainText.length
    }, 0)
  }

  const escapeHtml = (value) => {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const wrapPlainTextAsHtml = (text) => {
    const safe = escapeHtml(text)
    return `<p>${safe.replace(/\n/g, '<br/>')}</p>`
  }

  const mergeImportedContent = (currentContent, importedHtml) => {
    if (!currentContent || importMode === 'replace') {
      return importedHtml
    }
    return `${currentContent}<hr/><p><strong>Imported Content</strong></p>${importedHtml}`
  }

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const extractTextFromPdf = async (file) => {
    const buffer = await readFileAsArrayBuffer(file)
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    let fullText = ''
    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex)
      const content = await page.getTextContent()
      const pageText = content.items.map(item => item.str).join(' ')
      fullText += `${pageText}\n`
    }
    return fullText.trim()
  }

  const extractTextFromDocx = async (file) => {
    const buffer = await readFileAsArrayBuffer(file)
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return result.value.trim()
  }

  const extractTextFromCsv = async (file) => {
    const text = await readFileAsText(file)
    const parsed = Papa.parse(text, { skipEmptyLines: true })
    const rows = parsed.data.map(row => row.join(', ')).join('\n')
    return rows.trim()
  }

  const extractTextFromImage = async (file) => {
    const result = await Tesseract.recognize(file, 'eng')
    return result.data.text.trim()
  }

  const handleImportFile = async (file, target) => {
    if (!file) return
    setIsImporting(true)
    setImportStatus('Importing...')
    try {
      const fileName = file.name.toLowerCase()
      const fileType = file.type
      let extractedText = ''

      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        extractedText = await readFileAsText(file)
      } else if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
        extractedText = await extractTextFromCsv(file)
      } else if (fileName.endsWith('.docx')) {
        extractedText = await extractTextFromDocx(file)
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        extractedText = await extractTextFromPdf(file)
      } else if (fileType.startsWith('image/')) {
        extractedText = await extractTextFromImage(file)
      } else {
        throw new Error('Unsupported file type.')
      }

      const importedHtml = wrapPlainTextAsHtml(extractedText)
      if (target === 'add') {
        setNewNoteContent((current) => mergeImportedContent(current, importedHtml))
      } else {
        setEditingContent((current) => mergeImportedContent(current, importedHtml))
      }
      setImportStatus(`Imported: ${file.name}`)
    } catch (error) {
      console.error('Error importing file:', error)
      setImportStatus('Import failed. Please try another file.')
    } finally {
      setIsImporting(false)
    }
  }

  // Helper function to format last studied date
  const formatLastStudied = (date) => {
    const now = new Date()
    const noteDate = new Date(date)
    const diffMs = now - noteDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return noteDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  // Track note as studied when user views it (called explicitly, not during render)
  const handleNoteView = (noteId) => {
    if (!viewedNoteIds.has(noteId)) {
      const updatedNotes = notes.map(note =>
        note.id === noteId ? { ...note, lastStudied: new Date().toISOString() } : note
      )
      setNotes(updatedNotes)
      localStorage.setItem('interactiveNotes', JSON.stringify(updatedNotes))
      setViewedNoteIds(new Set([...viewedNoteIds, noteId]))
    }
  }

  useEffect(() => {
    fetchNotes()
    fetchLectures()
    // Load notes from localStorage on mount
    const savedNotes = localStorage.getItem('interactiveNotes')
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes)
        if (parsedNotes.length > 0) {
          setNotes(parsedNotes)
        }
      } catch (error) {
        console.error('Error loading notes from localStorage:', error)
      }
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('interactiveNotes', JSON.stringify(notes))
    }
  }, [notes])

  const fetchLectures = async () => {
    try {
      const response = await lectureService.getAllLectures(1, 100, '')
      const fetchedLectures = response.data.lectures || []
      setLectures(fetchedLectures)
      // Save to localStorage as backup
      if (fetchedLectures.length > 0) {
        localStorage.setItem('lecturesCache', JSON.stringify(fetchedLectures))
      }
    } catch (error) {
      console.error('Error fetching lectures:', error)
      // Try to load from localStorage if backend fails
      const savedLectures = localStorage.getItem('lecturesCache')
      if (savedLectures) {
        try {
          setLectures(JSON.parse(savedLectures))
        } catch (e) {
          console.error('Error parsing saved lectures:', e)
        }
      }
    }
  }

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const response = await notesService.getAllNotes()
      const fetchedNotes = response.data.notes
      setNotes(fetchedNotes)
      // Save to localStorage as backup
      localStorage.setItem('interactiveNotes', JSON.stringify(fetchedNotes))
    } catch (error) {
      console.error('Error fetching notes:', error)
      // Try to load from localStorage if backend fails
      const savedNotes = localStorage.getItem('interactiveNotes')
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes))
        } catch (e) {
          console.error('Error parsing saved notes:', e)
        }
      }
    }
    setLoading(false)
  }

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return
    
    try {
      // Delete from backend first
      await notesService.deleteNote(noteId)
    } catch (error) {
      console.error('Error deleting from backend:', error)
    }
    
    // Then update local state and localStorage
    const updatedNotes = notes.filter(note => {
      // Handle both string and number IDs
      return String(note.id) !== String(noteId)
    })
    
    setNotes(updatedNotes)
    localStorage.setItem('interactiveNotes', JSON.stringify(updatedNotes))
    alert('✅ Note deleted successfully!')
  }

  const handleDownloadNote = (note) => {
    const element = document.createElement('a')
    // Create HTML file with styling
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${note.Lecture?.title || 'Lecture'} - SkillSwap Notes</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .session-info {
      background: rgba(255,255,255,0.1);
      padding: 15px;
      border-radius: 6px;
      margin-top: 15px;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 { font-size: 2em; margin: 0.5em 0; }
    h2 { font-size: 1.5em; margin: 0.5em 0; }
    h3 { font-size: 1.25em; margin: 0.5em 0; }
    pre { background: #1f2937; color: #e5e7eb; padding: 1em; border-radius: 6px; overflow-x: auto; }
    code { background: #1f2937; color: #e5e7eb; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
    ul, ol { padding-left: 1.5em; }
    a { color: #6366f1; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📝 ${note.Lecture?.title || 'Lecture Notes'}</h1>
    <div class="session-info">
      <p><strong>🎯 Category:</strong> ${note.Lecture?.category || 'N/A'}</p>
      <p><strong>🏫 Mentor:</strong> ${note.Lecture?.teacherName || 'Unknown'}</p>
      <p><strong>⏱️ Duration:</strong> ${note.Lecture?.duration || 'N/A'} minutes</p>
      <p><strong>📅 Session Date:</strong> ${note.Lecture?.createdAt ? new Date(note.Lecture.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
      <p><strong>📝 Note Created:</strong> ${new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p><strong>⏱️ Reading Time:</strong> ${calculateReadingTime(note.content)}</p>
      <p><strong>📚 Last Studied:</strong> ${note.lastStudied ? formatLastStudied(note.lastStudied) : 'Never'}</p>
      <p><strong>✅ Status:</strong> ${note.isCompleted ? 'Completed' : 'In Progress'}</p>
    </div>
  </div>
  <div class="content">
    ${note.content}
  </div>
</body>
</html>
    `
    const file = new Blob([htmlContent], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = `note-${note.Lecture?.title || 'lecture'}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleAddNote = async () => {
    const plainText = newNoteContent.replace(/<[^>]*>/g, '').trim()
    if (!plainText || !selectedLectureId) {
      alert('Please select a lecture and write something')
      return
    }

    setIsSaving(true)
    
    // Create local note object
    const localNote = {
      id: Date.now(), // Temporary ID
      lectureId: selectedLectureId,
      content: newNoteContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastStudied: new Date().toISOString(),
      isCompleted: false,
      Lecture: lectures.find(l => String(l.id) === String(selectedLectureId)) || {}
    }
    
    // Add to state and localStorage immediately
    const updatedNotes = [localNote, ...notes]
    setNotes(updatedNotes)
    localStorage.setItem('interactiveNotes', JSON.stringify(updatedNotes))
    
    try {
      const response = await notesService.createNote({
        lectureId: selectedLectureId,
        content: newNoteContent
      })
      // Replace local note with backend note
      setNotes([response.data.note, ...notes])
      localStorage.setItem('interactiveNotes', JSON.stringify([response.data.note, ...notes]))
      setNewNoteContent('')
      setSelectedLectureId('')
      setShowAddForm(false)
      alert('✅ Note added successfully!')
    } catch (error) {
      console.error('Error adding note:', error)
      setNewNoteContent('')
      setSelectedLectureId('')
      setShowAddForm(false)
      alert('✅ Note saved locally (backend offline)')
    }
    setIsSaving(false)
  }

  const handleUpdateNote = async (noteId) => {
    const plainText = editingContent.replace(/<[^>]*>/g, '').trim()
    if (!plainText) {
      alert('Please write something')
      return
    }

    setIsSaving(true)
    
    // Update locally first
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, content: editingContent, updatedAt: new Date().toISOString() } : note
    )
    setNotes(updatedNotes)
    localStorage.setItem('interactiveNotes', JSON.stringify(updatedNotes))
    
    try {
      await notesService.updateNote(noteId, { content: editingContent })
      setEditingNoteId(null)
      setEditingContent('')
      alert('✅ Note updated successfully!')
    } catch (error) {
      console.error('Error updating note:', error)
      setEditingNoteId(null)
      setEditingContent('')
      alert('✅ Note updated locally (backend offline)')
    }
    setIsSaving(false)
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditingContent('')
  }

  const filteredNotes = notes.filter(note =>
    note.content?.toLowerCase().includes(filter.toLowerCase()) ||
    note.Lecture?.title?.toLowerCase().includes(filter.toLowerCase()) ||
    note.Lecture?.category?.toLowerCase().includes(filter.toLowerCase()) ||
    note.Lecture?.teacherName?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className={`mb-12 rounded-lg p-8 ${isDark ? 'bg-gradient-to-r from-purple-900 to-pink-900' : 'bg-gradient-to-r from-purple-500 to-pink-600'} text-white`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold mb-4">📝 Interactive Notes</h1>
              <p className="text-xl">Take and organize notes from your SkillSwap learning sessions</p>
              <p className="text-sm mt-2 opacity-90">Track your learning journey with detailed notes linked to sessions, mentors, and skills</p>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-purple-600">{notes.length}</div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>📝 Total Notes</p>
          </div>
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-blue-600">
              {calculateTotalWords()}
            </div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>📖 Total Words</p>
          </div>
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-green-600">
              {calculateTotalCharacters()}
            </div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>🔤 Total Characters</p>
          </div>
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-orange-600">
              {notes.filter(n => n.isCompleted).length}
            </div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>✅ Completed</p>
          </div>
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-4xl font-bold text-red-500">
              {calculateTotalReadingTime()}
            </div>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>⏱️ Total Reading Time (min)</p>
          </div>
        </div>

        {/* Add Note Form */}
        {showAddForm && (
          <div className={`rounded-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-2 border-purple-500`}>
            <h2 className="text-2xl font-bold mb-4">➕ Add New Note</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Session / Lecture:
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
                  <option value="">-- Choose a session / lecture --</option>
                  {lectures.map((lecture) => (
                    <option key={lecture.id} value={lecture.id}>
                      {lecture.title} | {lecture.category} | By {lecture.teacherName || 'Unknown'} | {lecture.duration}min {lecture.isPremium ? '⭐ Premium' : ''}
                    </option>
                  ))}
                </select>
                {selectedLectureId && (
                  <div className={`mt-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {(() => {
                      const selectedLecture = lectures.find(l => String(l.id) === String(selectedLectureId))
                      return (
                        <>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            🎯 <strong>Skill:</strong> {selectedLecture?.category || 'N/A'}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            🎫 <strong>Mentor:</strong> {selectedLecture?.teacherName || 'Unknown'}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            ⏱️ <strong>Duration:</strong> {selectedLecture?.duration || 'N/A'} minutes
                          </p>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Notes:
                </label>
                <div className={`mb-3 p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept=".txt,.pdf,.docx,.csv,image/*"
                      disabled={isImporting}
                      onChange={(e) => handleImportFile(e.target.files?.[0], 'add')}
                      className={`flex-1 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                    />
                    <label className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="radio"
                        name="importModeAdd"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                      />
                      Replace
                    </label>
                    <label className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="radio"
                        name="importModeAdd"
                        value="append"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                      />
                      Append
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewNoteContent('')}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-bold hover:bg-gray-700 transition"
                    >
                      Clear
                    </button>
                  </div>
                  <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Supported: TXT, PDF, DOCX, CSV, Images. {importStatus && `Status: ${importStatus}`}
                  </p>
                </div>
                <div className={`rounded-lg border-2 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                  <ReactQuill
                    theme="snow"
                    value={newNoteContent}
                    onChange={setNewNoteContent}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Write your notes here... Use toolbar for formatting"
                    className={isDark ? 'quill-dark' : 'quill-light'}
                    style={{ height: '200px', marginBottom: '42px' }}
                  />
                </div>
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  📝 {newNoteContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length} words | 🔤 {newNoteContent.replace(/<[^>]*>/g, '').length} characters | ⏱️ {calculateReadingTime(newNoteContent)}
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
            placeholder="Search notes by session, skill, mentor, or content..."
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
              Start watching SkillSwap sessions and take notes!
            </p>
            <button
              onClick={() => navigate('/lectures')}
              className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Browse Sessions
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
                    <h3 className="text-xl font-bold mb-2">✏️ Edit Note</h3>
                    <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        🎯 <strong>Session:</strong> {note.Lecture?.title}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        🎫 <strong>Mentor:</strong> {note.Lecture?.teacherName || 'Unknown'}
                      </p>
                    </div>
                    <div className={`mb-3 p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          accept=".txt,.pdf,.docx,.csv,image/*"
                          disabled={isImporting}
                          onChange={(e) => handleImportFile(e.target.files?.[0], 'edit')}
                          className={`flex-1 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                        />
                        <label className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <input
                            type="radio"
                            name="importModeEdit"
                            value="replace"
                            checked={importMode === 'replace'}
                            onChange={() => setImportMode('replace')}
                          />
                          Replace
                        </label>
                        <label className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <input
                            type="radio"
                            name="importModeEdit"
                            value="append"
                            checked={importMode === 'append'}
                            onChange={() => setImportMode('append')}
                          />
                          Append
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingContent('')}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-bold hover:bg-gray-700 transition"
                        >
                          Clear
                        </button>
                      </div>
                      <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Supported: TXT, PDF, DOCX, CSV, Images. {importStatus && `Status: ${importStatus}`}
                      </p>
                    </div>
                    <div className={`rounded-lg border-2 mb-3 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                      <ReactQuill
                        theme="snow"
                        value={editingContent}
                        onChange={setEditingContent}
                        modules={quillModules}
                        formats={quillFormats}
                        className={isDark ? 'quill-dark' : 'quill-light'}
                        style={{ height: '200px', marginBottom: '42px' }}
                      />
                    </div>
                    <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      📝 {editingContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length} words | 🔤 {editingContent.replace(/<[^>]*>/g, '').length} characters | ⏱️ {calculateReadingTime(editingContent)}
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
                    <div className="flex justify-between items-start mb-4" onClick={() => handleNoteView(note.id)}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 
                            className="text-xl font-bold cursor-pointer hover:text-purple-600 transition"
                            onClick={() => navigate(`/lecture/${note.Lecture?.id}`)}
                          >
                            🎯 {note.Lecture?.title || 'Untitled Lecture'}
                          </h3>
                          {note.Lecture?.isPremium && (
                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">⭐ Premium</span>
                          )}
                        </div>
                        <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                          <span className="flex items-center gap-1">
                            📚 <strong>Category:</strong> {note.Lecture?.category || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            🎫 <strong>Mentor:</strong> {note.Lecture?.teacherName || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            ⏱️ <strong>Duration:</strong> {note.Lecture?.duration || 'N/A'} min
                          </span>
                        </div>
                        {note.Lecture?.createdAt && (
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            📅 Session Date: {new Date(note.Lecture.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
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
                    </div>

                    {/* Note Content */}
                    <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                        style={{ 
                          color: isDark ? '#e5e7eb' : '#1f2937',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    {/* Note Statistics */}
                    <div className={`grid grid-cols-3 gap-4 mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-center">
                        <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>📝 Words</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {note.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>⏱️ Reading Time</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                          {calculateReadingTime(note.content)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>📅 Last Studied</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          {note.lastStudied ? formatLastStudied(note.lastStudied) : 'Never'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Status: {note.isCompleted ? '✅ Completed' : '🖄 In Progress'}
                        </span>
                        <button
                          onClick={() => {
                            const updatedNotes = notes.map(n => 
                              n.id === note.id ? { ...n, isCompleted: !n.isCompleted } : n
                            )
                            setNotes(updatedNotes)
                            localStorage.setItem('interactiveNotes', JSON.stringify(updatedNotes))
                          }}
                          className={`px-3 py-1 rounded text-xs font-bold transition ${
                            note.isCompleted 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          {note.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                        <div 
                          className={`h-full transition-all duration-300 ${
                            note.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: note.isCompleted ? '100%' : '50%' }}
                        />
                      </div>
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
