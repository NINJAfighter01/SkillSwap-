import api from './api';

const lectureService = {
    getAllLectures: async (page = 1, limit = 10, search = '') => {
        try {
            const response = await api.get(`/lectures?page=${page}&limit=${limit}&search=${search}`);
            return response.data;
        } catch (error) {
            throw new Error('Error fetching lectures: ' + error.message);
        }
    },

    getLectureById: async (id) => {
        try {
            const response = await api.get(`/lectures/${id}`);
            return response.data;
        } catch (error) {
            throw new Error('Error fetching lecture: ' + error.message);
        }
    },

    createLecture: async (lectureData) => {
        try {
            const response = await api.post('/lectures', lectureData);
            return response.data;
        } catch (error) {
            throw new Error('Error creating lecture: ' + error.message);
        }
    },

    updateLecture: async (id, lectureData) => {
        try {
            const response = await api.put(`/lectures/${id}`, lectureData);
            return response.data;
        } catch (error) {
            throw new Error('Error updating lecture: ' + error.message);
        }
    },

    deleteLecture: async (id) => {
        try {
            const response = await api.delete(`/lectures/${id}`);
            return response.data;
        } catch (error) {
            throw new Error('Error deleting lecture: ' + error.message);
        }
    },

    watchLecture: async (id) => {
        try {
            const response = await api.post(`/lectures/${id}/watch`);
            return response.data;
        } catch (error) {
            throw new Error('Error watching lecture: ' + error.message);
        }
    },

    getTeacherLectures: async () => {
        try {
            const response = await api.get('/lectures/teacher/list');
            return response.data;
        } catch (error) {
            throw new Error('Error fetching teacher lectures: ' + error.message);
        }
    }
};

export default lectureService;