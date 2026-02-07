import axios from 'axios'

const API_URL = '/api'

const notesService = {
  getAllNotes: () =>
    axios.get(`${API_URL}/notes/all`),

  getNotes: (lectureId) =>
    axios.get(`${API_URL}/notes/lecture/${lectureId}`),

  createNote: (noteData) =>
    axios.post(`${API_URL}/notes`, noteData),

  updateNote: (noteId, noteData) =>
    axios.put(`${API_URL}/notes/${noteId}`, noteData),

  deleteNote: (noteId) =>
    axios.delete(`${API_URL}/notes/${noteId}`),

  downloadNotes: (lectureId) =>
    axios.get(`${API_URL}/notes/lecture/${lectureId}/download`, {
      responseType: 'blob'
    }),
}

export default notesService
