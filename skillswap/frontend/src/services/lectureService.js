import axios from 'axios'

const API_URL = '/api'

const lectureService = {
  getAllLectures: (page = 1, limit = 12, search = '') => 
    axios.get(`${API_URL}/lectures?page=${page}&limit=${limit}&search=${search}`),
  
  getLectureById: (id) => 
    axios.get(`${API_URL}/lectures/${id}`),
  
  uploadLecture: (lectureData) => 
    axios.post(`${API_URL}/lectures`, lectureData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateLecture: (id, lectureData) => 
    axios.put(`${API_URL}/lectures/${id}`, lectureData),
  
  deleteLecture: (id) => 
    axios.delete(`${API_URL}/lectures/${id}`),

  getTeacherLectures: () =>
    axios.get(`${API_URL}/lectures/teacher/list`),

  watchLecture: (lectureId) =>
    axios.post(`${API_URL}/lectures/${lectureId}/watch`),
}

export default lectureService
