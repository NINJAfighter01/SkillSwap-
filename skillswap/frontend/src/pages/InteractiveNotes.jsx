import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import notesService from '../services/notesService'
import lectureService from '../services/lectureService'
import ReactQuill from 'react-quill'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
import mammoth from 'mammoth'
import html2pdf from 'html2pdf.js'
import 'react-quill/dist/quill.snow.css'
import '../styles/quill-custom.css'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const InteractiveNotes = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [topicName, setTopicName] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [viewedNoteIds, setViewedNoteIds] = useState(new Set())
  const [tagInput, setTagInput] = useState('')
  const [folderInput, setFolderInput] = useState('General')
  const [folderFilter, setFolderFilter] = useState('All')
  const [uploadedFiles, setUploadedFiles] = useState({}) // Files for each note: {noteId: [files]}
  const [currentFiles, setCurrentFiles] = useState([]) // Files for note being created/edited
  const [showFileViewer, setShowFileViewer] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [pdfPage, setPdfPage] = useState(1)
  const [pdfPages, setPdfPages] = useState(0)
  const [docxHtml, setDocxHtml] = useState('') // Extracted DOCX HTML content

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

  const parseTagInput = (value) => {
    if (!value || !value.trim()) return []
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item, index, arr) => item && arr.indexOf(item) === index)
      .slice(0, 10)
  }

  // File handling functions
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileImport = async (e, mode = 'new') => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    for (const file of files) {
      try {
        const base64 = await fileToBase64(file)
        const fileObj = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          base64,
          uploadedAt: new Date().toISOString()
        }

        // Save file object (text extraction removed - files are just stored)
        setCurrentFiles(prev => [...prev, fileObj])
        alert(`✅ ${file.name} imported successfully!`)
      } catch (err) {
        alert(`❌ Failed to import ${file.name}`)
        console.error(err)
      }
    }
    e.target.value = '' // Reset input
  }

  const removeFile = (fileId) => {
    setCurrentFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const removeFileFromNote = async (noteId, fileId) => {
    const note = notes.find(n => n.id === noteId)
    if (!note || !note.files) return

    const updatedFiles = note.files.filter(f => f.id !== fileId)
    const updatedNotes = notes.map(n =>
      n.id === noteId ? { ...n, files: updatedFiles } : n
    )
    setNotes(updatedNotes)
    localStorage.setItem('interactiveNotes', JSON.stringify(updatedNotes))

    try {
      await notesService.updateNote(noteId, { files: updatedFiles })
    } catch (err) {
      console.error('Failed to update note files:', err)
    }
  }

  const viewFile = async (file) => {
    console.log('🔍 Opening file viewer for:', file.name, 'Type:', file.type)
    console.log('📦 File object:', file)
    
    setSelectedFile(file)
    setShowFileViewer(true)
    setDocxHtml('') // Reset DOCX content
    
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      console.log('📄 Loading PDF file...')
      try {
        const base64Data = file.base64.split(',')[1]
        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
        console.log('✅ PDF loaded successfully. Pages:', pdf.numPages)
        setPdfPages(pdf.numPages)
        setPdfPage(1)
        
        // Wait for modal to render before rendering PDF
        setTimeout(() => {
          console.log('🎨 Rendering PDF page 1...')
          renderPdf(file, 1)
        }, 300)
      } catch (err) {
        console.error('❌ PDF load error:', err)
        alert('❌ Failed to load PDF file: ' + err.message)
      }
    } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      console.log('📝 Loading Word document...')
      try {
        const base64Data = file.base64.split(',')[1]
        const binaryString = atob(base64Data)
        const arrayBuffer = new ArrayBuffer(binaryString.length)
        const uint8Array = new Uint8Array(arrayBuffer)
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i)
        }
        
        const result = await mammoth.convertToHtml({ arrayBuffer })
        console.log('✅ Word document converted successfully')
        setDocxHtml(result.value)
        
        if (result.messages.length > 0) {
          console.warn('DOCX conversion warnings:', result.messages)
        }
      } catch (err) {
        console.error('❌ DOCX load error:', err)
        alert('❌ Failed to load Word document: ' + err.message)
      }
    } else {
      console.log('📂 Opening non-PDF/DOCX file in viewer')
    }
  }

  const renderPdf = async (file, pageNum) => {
    try {
      const canvas = document.getElementById('pdf-canvas')
      if (!canvas) {
        console.error('Canvas not found')
        return
      }

      const base64Data = file.base64.split(',')[1]
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.5 })
      
      canvas.width = viewport.width
      canvas.height = viewport.height
      
      const context = canvas.getContext('2d')
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      
      console.log('PDF rendered successfully:', pageNum)
    } catch (err) {
      console.error('PDF render error:', err)
      alert('❌ Failed to render PDF page')
    }
  }

  useEffect(() => {
    if (showFileViewer && selectedFile?.type === 'application/pdf' && pdfPage > 0) {
      setTimeout(() => renderPdf(selectedFile, pdfPage), 100)
    }
  }, [pdfPage, showFileViewer])

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
  <title>${note.topicName || note.Lecture?.title || 'Notes'} - SkillSwap Notes</title>
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
    <h1>📝 ${note.topicName || note.Lecture?.title || 'Notes'}</h1>
    <div class="session-info">
      <p><strong>📝 Topic:</strong> ${note.topicName || 'N/A'}</p>
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
    element.download = `note-${note.topicName || note.Lecture?.title || 'note'}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleExportDoc = (note) => {
    const docContent = `
<html>
  <head><meta charset="UTF-8"><title>${note.topicName || note.Lecture?.title || 'Note'}</title></head>
  <body>
    <h1>${note.topicName || note.Lecture?.title || 'Note'}</h1>
    <p><strong>Folder:</strong> ${note.folder || 'General'}</p>
    <p><strong>Tags:</strong> ${(note.tags || []).join(', ') || 'None'}</p>
    <hr/>
    ${note.content}
  </body>
</html>`
    const blob = new Blob([docContent], { type: 'application/msword' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${note.topicName || note.Lecture?.title || 'note'}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPdf = (note) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 16px; color: #111827;">
        <h2>${note.topicName || note.Lecture?.title || 'Note'}</h2>
        <p><strong>Folder:</strong> ${note.folder || 'General'}</p>
        <p><strong>Tags:</strong> ${(note.tags || []).join(', ') || 'None'}</p>
        <hr/>
        <div>${note.content}</div>
      </div>
    `

    html2pdf()
      .set({
        margin: 10,
        filename: `${note.topicName || note.Lecture?.title || 'note'}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(wrapper)
      .save()
  }

  const handleTogglePin = async (note) => {
    const updatedNotes = notes.map((n) =>
      n.id === note.id ? { ...n, isPinned: !n.isPinned } : n
    )
    setNotes(updatedNotes)
    localStorage.setItem('interactiveNotes', JSON.stringify(updatedNotes))

    try {
      await notesService.updateNote(note.id, { isPinned: !note.isPinned })
    } catch (error) {
      console.error('Error updating pin status:', error)
    }
  }

  const handleShareNote = async (note) => {
    const shareUrl = `${window.location.origin}/interactive-notes?note=${note.id}`
    const shareText = `${note.topicName || note.Lecture?.title || 'Note'}\n${shareUrl}`

    try {
      await navigator.clipboard.writeText(shareText)

      const updatedNotes = notes.map((n) =>
        n.id === note.id ? { ...n, isShared: true } : n
      )
      setNotes(updatedNotes)
      localStorage.setItem('interactiveNotes', JSON.stringify(updatedNotes))

      try {
        await notesService.updateNote(note.id, { isShared: true })
      } catch (error) {
        console.error('Error updating shared status:', error)
      }

      alert('🔗 Note link copied to clipboard!')
    } catch (error) {
      alert('Unable to copy link. Please copy manually.')
    }
  }

  const handleAddNote = async () => {
    const plainText = newNoteContent.replace(/<[^>]*>/g, '').trim()
    if (!plainText || !topicName.trim()) {
      alert('Please enter a topic name and write something')
      return
    }

    console.log('💾 Saving note with files:', currentFiles)
    console.log('📊 Files count:', currentFiles.length)
    
    setIsSaving(true)
    const parsedTags = parseTagInput(tagInput)
    const normalizedFolder = folderInput?.trim() || 'General'
    
    // Create local note object
    const localNote = {
      id: Date.now(), // Temporary ID
      topicName: topicName.trim(),
      lectureId: null,
      content: newNoteContent,
      files: currentFiles, // Include uploaded files
      tags: parsedTags,
      folder: normalizedFolder,
      isPinned: false,
      isShared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastStudied: new Date().toISOString(),
      isCompleted: false,
      Lecture: null,
    }
    
    console.log('📝 Local note created:', localNote)
    console.log('✅ Files in note:', localNote.files?.length || 0)
    
    // Add to state and localStorage immediately
    const updatedNotes = [localNote, ...notes]
    setNotes(updatedNotes)
    localStorage.setItem('interactiveNotes', JSON.stringify(updatedNotes))
    
    try {
      const response = await notesService.createNote({
        topicName: topicName.trim(),
        content: newNoteContent,
        files: currentFiles,
        tags: parsedTags,
        folder: normalizedFolder,
        isPinned: false,
        isShared: false,
      })
      console.log('✅ Note saved to backend:', response.data.note)
      // Replace local note with backend note
      setNotes([response.data.note, ...notes])
      localStorage.setItem('interactiveNotes', JSON.stringify([response.data.note, ...notes]))
      setNewNoteContent('')
      setTopicName('')
      setCurrentFiles([]) // Reset files
      setTagInput('')
      setFolderInput('General')
      setShowAddForm(false)
      alert('✅ Note added successfully!')
    } catch (error) {
      console.error('Error adding note:', error)
      setNewNoteContent('')
      setTopicName('')
      setCurrentFiles([]) // Reset files
      setTagInput('')
      setFolderInput('General')
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
    
    const note = notes.find(n => n.id === noteId)
    // Update locally first - merge new files with existing ones
    const updatedNotes = notes.map(n => 
      n.id === noteId ? { 
        ...n, 
        content: editingContent, 
        files: [...(n.files || []), ...currentFiles],
        updatedAt: new Date().toISOString() 
      } : n
    )
    setNotes(updatedNotes)
    localStorage.setItem('interactiveNotes', JSON.stringify(updatedNotes))
    
    try {
      await notesService.updateNote(noteId, { 
        content: editingContent,
        files: [...(note.files || []), ...currentFiles]
      })
      setEditingNoteId(null)
      setEditingContent('')
      setCurrentFiles([]) // Reset files
      alert('✅ Note updated successfully!')
    } catch (error) {
      console.error('Error updating note:', error)
      setEditingNoteId(null)
      setEditingContent('')
      setCurrentFiles([]) // Reset files
      alert('✅ Note updated locally (backend offline)')
    }
    setIsSaving(false)
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditingContent('')
  }

  const folders = ['All', ...Array.from(new Set(notes.map((note) => note.folder || 'General')))]

  const filteredNotes = notes
    .filter((note) => {
      const search = filter.toLowerCase()
      const matchesSearch =
        note.content?.toLowerCase().includes(search) ||
        note.topicName?.toLowerCase().includes(search) ||
        note.Lecture?.title?.toLowerCase().includes(search) ||
        note.Lecture?.category?.toLowerCase().includes(search) ||
        note.Lecture?.teacherName?.toLowerCase().includes(search) ||
        (note.tags || []).some((tag) => tag.toLowerCase().includes(search))

      const matchesFolder = folderFilter === 'All' || (note.folder || 'General') === folderFilter
      return matchesSearch && matchesFolder
    })
    .sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
        return a.isPinned ? -1 : 1
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

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
            <div className="flex gap-4">
              <button
                onClick={fetchNotes}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-bold transition"
              >
                🔄 Refresh
              </button>
            </div>
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
                  Topic Name:
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g., React Hooks, SQL Joins, Interview Prep"
                  className={`w-full p-3 rounded-lg border-2 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-black'
                  } focus:outline-none focus:border-purple-500`}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Folder:
                  </label>
                  <input
                    type="text"
                    value={folderInput}
                    onChange={(e) => setFolderInput(e.target.value)}
                    placeholder="e.g., React, SQL, Interview"
                    className={`w-full p-3 rounded-lg border-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-black'
                    } focus:outline-none focus:border-purple-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tags (comma separated):
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="react, hooks, interview"
                    className={`w-full p-3 rounded-lg border-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-black'
                    } focus:outline-none focus:border-purple-500`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Notes:
                </label>

                {/* File Import Section */}
                <div className={`mb-3 p-4 rounded-lg border-2 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    📎 Import Files (PDF, DOCX, CSV, TXT, Images)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.csv,.txt,image/*"
                    onChange={(e) => {
                      console.log('Files selected:', e.target.files.length)
                      handleFileImport(e, 'new')
                    }}
                    className={`w-full p-2 border rounded ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                  />
                  {currentFiles.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-700">
                      <p className={`text-sm font-bold mb-2 ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>
                        ✅ Files to be added ({currentFiles.length}):
                      </p>
                      <div className="space-y-2">
                        {currentFiles.map((file) => {
                          const getFileIcon = (type, name) => {
                            if (type.startsWith('image/')) return '🖼️'
                            if (type === 'application/pdf' || name.endsWith('.pdf')) return '📄'
                            if (type.includes('word') || type.includes('document') || name.endsWith('.docx')) return '📝'
                            if (type === 'text/csv' || name.endsWith('.csv')) return '📊'
                            if (type === 'text/plain' || name.endsWith('.txt')) return '📃'
                            return '📎'
                          }
                          
                          return (
                            <div key={file.id} className={`flex items-center justify-between p-3 rounded border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'}`}>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xl">{getFileIcon(file.type, file.name)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {file.name}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {(file.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    console.log('Viewing file:', file.name, 'Type:', file.type)
                                    viewFile(file)
                                  }}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                >
                                  👁️ View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    console.log('Removing file:', file.name)
                                    removeFile(file.id)
                                  }}
                                  className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                                >
                                  🗑️ Remove
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
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
                    setTopicName('')
                    setTagInput('')
                    setFolderInput('General')
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
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search notes by topic, tags, session, mentor..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`md:col-span-2 w-full p-4 rounded-lg border-2 ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-black'
            } focus:outline-none focus:border-purple-500`}
          />
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className={`w-full p-4 rounded-lg border-2 ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-black'
            } focus:outline-none focus:border-purple-500`}
          >
            {folders.map((folder) => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>
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
                        📝 <strong>Topic:</strong> {note.topicName || note.Lecture?.title || 'Untitled'}
                      </p>
                      {note.Lecture?.teacherName && (
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          🎫 <strong>Mentor:</strong> {note.Lecture.teacherName}
                        </p>
                      )}
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

                    {/* File Import Section */}
                    <div className={`mb-3 p-4 rounded-lg border-2 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                      <label className={`block mb-2 text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        📎 Import Files (PDF, DOCX, CSV, TXT, Images)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.csv,.txt,image/*"
                        onChange={(e) => handleFileImport(e, 'edit')}
                        className={`w-full p-2 rounded border ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                      />
                      
                      {/* Display Current Files Being Added */}
                      {currentFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Files to be added ({currentFiles.length}):
                          </p>
                          {currentFiles.map((file) => (
                            <div 
                              key={file.id} 
                              className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xl">
                                  {file.type.startsWith('image/') ? '🖼️' : 
                                   file.type === 'application/pdf' ? '📄' : 
                                   file.type.includes('word') ? '📝' : 
                                   file.type === 'text/csv' ? '📊' : '📃'}
                                </span>
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {file.name}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {(file.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => viewFile(file)}
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                                >
                                  👁️ View
                                </button>
                                <button
                                  onClick={() => removeFile(file.id)}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                                >
                                  🗑️ Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Display Existing Files */}
                      {note.files && note.files.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Existing files ({note.files.length}):
                          </p>
                          {note.files.map((file) => (
                            <div 
                              key={file.id} 
                              className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xl">
                                  {file.type.startsWith('image/') ? '🖼️' : 
                                   file.type === 'application/pdf' ? '📄' : 
                                   file.type.includes('word') ? '📝' : 
                                   file.type === 'text/csv' ? '📊' : '📃'}
                                </span>
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {file.name}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {(file.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => viewFile(file)}
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                                >
                                  👁️ View
                                </button>
                                <button
                                  onClick={() => removeFileFromNote(note.id, file.id)}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                                >
                                  🗑️ Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                            onClick={() => note.Lecture?.id && navigate(`/lecture/${note.Lecture?.id}`)}
                          >
                            📝 {note.topicName || note.Lecture?.title || 'Untitled Note'}
                          </h3>
                          {note.isPinned && (
                            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded">📌 Pinned</span>
                          )}
                          {note.isShared && (
                            <span className="px-2 py-1 bg-cyan-600 text-white text-xs font-bold rounded">🔗 Shared</span>
                          )}
                          {note.Lecture?.isPremium && (
                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">⭐ Premium</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 text-purple-700'}`}>
                            📂 {note.folder || 'General'}
                          </span>
                          {(note.tags || []).map((tag) => (
                            <span key={tag} className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                        {note.Lecture ? (
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
                        ) : (
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            🧠 Personal topic note
                          </div>
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

                    {/* Uploaded Files Display */}
                    {note.files && note.files.length > 0 && (
                      <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h4 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          📎 Uploaded Files ({note.files.length})
                        </h4>
                        <div className="space-y-2">
                          {note.files.map((file) => (
                            <div 
                              key={file.id} 
                              className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-2xl">
                                  {file.type.startsWith('image/') ? '🖼️' : 
                                   file.type === 'application/pdf' ? '📄' : 
                                   file.type.includes('word') ? '📝' : 
                                   file.type === 'text/csv' ? '📊' : '📃'}
                                </span>
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {file.name}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {(file.size / 1024).toFixed(2)} KB • Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => viewFile(file)}
                                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-sm"
                                >
                                  👁️ View
                                </button>
                                <button
                                  onClick={() => removeFileFromNote(note.id, file.id)}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold text-sm"
                                >
                                  🗑️ Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleTogglePin(note)}
                        className={`px-4 py-2 rounded-lg transition font-bold ${note.isPinned ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                      >
                        {note.isPinned ? '📌 Unpin' : '📌 Pin'}
                      </button>
                      <button
                        onClick={() => handleShareNote(note)}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-bold"
                      >
                        🔗 Share
                      </button>
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id)
                          setEditingContent(note.content)
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
                      >
                        ✏️ Edit
                      </button>
                      {note.Lecture?.id && (
                        <button
                          onClick={() => navigate(`/lecture/${note.Lecture?.id}`)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold"
                        >
                          📺 View Lecture
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadNote(note)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
                      >
                        💾 HTML
                      </button>
                      <button
                        onClick={() => handleExportDoc(note)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold"
                      >
                        🧾 DOC
                      </button>
                      <button
                        onClick={() => handleExportPdf(note)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-bold"
                      >
                        📄 PDF
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

      {/* File Viewer Modal */}
      {showFileViewer && selectedFile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-lg shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Modal Header */}
            <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              style={{ zIndex: 10000 }}
            >
              <h3 className={`text-lg font-bold truncate flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedFile.type.startsWith('image/') ? '🖼️' : 
                 selectedFile.type === 'application/pdf' || selectedFile.name?.endsWith('.pdf') ? '📄' : 
                 selectedFile.type.includes('word') ? '📝' : 
                 selectedFile.type === 'text/csv' ? '📊' : '📃'} {selectedFile.name}
              </h3>
              <button
                onClick={() => {
                  setShowFileViewer(false)
                  setSelectedFile(null)
                  setPdfPage(1)
                  setDocxHtml('') // Reset DOCX content
                }}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold"
              >
                ✖️ Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* PDF Viewer */}
              {(selectedFile.type === 'application/pdf' || selectedFile.name?.endsWith('.pdf')) && (
                <div className="space-y-4">
                  <div className="flex justify-center bg-gray-100 dark:bg-gray-900 p-4 rounded-lg min-h-[500px] items-center">
                    <canvas 
                      id="pdf-canvas" 
                      className={`border-2 max-w-full shadow-lg ${isDark ? 'border-gray-600 bg-white' : 'border-gray-300 bg-white'}`}
                      style={{ minHeight: '400px' }}
                    />
                  </div>
                  {pdfPages > 1 && (
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setPdfPage(p => Math.max(1, p - 1))}
                        disabled={pdfPage <= 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
                      >
                        ⬅️ Previous
                      </button>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Page {pdfPage} of {pdfPages}
                      </span>
                      <button
                        onClick={() => setPdfPage(p => Math.min(pdfPages, p + 1))}
                        disabled={pdfPage >= pdfPages}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
                      >
                        Next ➡️
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* CSV Viewer */}
              {selectedFile.type === 'text/csv' && (
                <div className="overflow-x-auto">
                  <table className={`w-full border-collapse ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                    <tbody>
                      {(() => {
                        try {
                          const csvText = atob(selectedFile.base64.split(',')[1])
                          const rows = csvText.split('\n').filter(row => row.trim())
                          return rows.map((row, i) => (
                            <tr key={i} className={i === 0 ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''}>
                              {row.split(',').map((cell, j) => (
                                <td 
                                  key={j} 
                                  className={`border px-4 py-2 ${isDark ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-900'}`}
                                >
                                  {cell.trim()}
                                </td>
                              ))}
                            </tr>
                          ))
                        } catch (e) {
                          return (
                            <tr>
                              <td className={`p-4 text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                ❌ Failed to parse CSV file
                              </td>
                            </tr>
                          )
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Text File Viewer */}
              {selectedFile.type === 'text/plain' && (
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <pre 
                    className={`whitespace-pre-wrap font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    {atob(selectedFile.base64.split(',')[1])}
                  </pre>
                </div>
              )}

              {/* Image Viewer */}
              {selectedFile.type.startsWith('image/') && (
                <div className="flex justify-center">
                  <img 
                    src={selectedFile.base64} 
                    alt={selectedFile.name}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
              )}

              {/* DOCX/Word Document Viewer */}
              {(selectedFile.type.includes('word') || selectedFile.name.endsWith('.docx') || selectedFile.name.endsWith('.doc')) && (
                <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`mb-4 pb-4 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      📝 Word Document Content
                    </h4>
                  </div>
                  {docxHtml ? (
                    <div 
                      className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}
                      dangerouslySetInnerHTML={{ __html: docxHtml }}
                      style={{
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        color: isDark ? '#ffffff' : '#000000'
                      }}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        ⏳ Loading document content...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Unsupported File Type */}
              {!['application/pdf', 'text/csv', 'text/plain'].includes(selectedFile.type) && 
               !selectedFile.name?.endsWith('.pdf') &&
               !selectedFile.name?.endsWith('.docx') &&
               !selectedFile.name?.endsWith('.doc') &&
               !selectedFile.type.startsWith('image/') && 
               !selectedFile.type.includes('word') && (
                <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ❌ Unsupported File Type
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    This file type cannot be previewed in the browser.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveNotes
