import axios from 'axios';
import { API_URL } from '../utils/constants';

const notesService = {
    getNotes: async (lectureId) => {
        try {
            const response = await axios.get(`${API_URL}/notes/lecture/${lectureId}`);
            return response.data;
        } catch (error) {
            throw new Error('Error fetching notes');
        }
    },

    createNote: async (noteData) => {
        try {
            const response = await axios.post(`${API_URL}/notes`, noteData);
            return response.data;
        } catch (error) {
            throw new Error('Error creating note');
        }
    },

    updateNote: async (noteId, noteData) => {
        try {
            const response = await axios.put(`${API_URL}/notes/${noteId}`, noteData);
            return response.data;
        } catch (error) {
            throw new Error('Error updating note');
        }
    },

    deleteNote: async (noteId) => {
        try {
            const response = await axios.delete(`${API_URL}/notes/${noteId}`);
            return response.data;
        } catch (error) {
            throw new Error('Error deleting note');
        }
    },

    downloadNote: async (lectureId) => {
        try {
            const response = await axios.get(`${API_URL}/notes/lecture/${lectureId}/download`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw new Error('Error downloading note');
        }
    }
};

export default notesService;