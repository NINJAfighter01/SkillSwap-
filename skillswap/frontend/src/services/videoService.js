import axios from 'axios'

const API_URL = '/api/videos'

const videoService = {
  // Get all videos with filters
  getAllVideos: (params = {}) =>
    axios.get(API_URL, { params }),

  // Get single video by ID
  getVideoById: (id) =>
    axios.get(`${API_URL}/${id}`),

  // Get current user's videos
  getMyVideos: () =>
    axios.get(`${API_URL}/my/videos`),

  // Dashboard analytics
  getDashboardAnalytics: () =>
    axios.get(`${API_URL}/dashboard/analytics`),

  // Upload video with extended timeout (10 minutes for large files)
  uploadVideo: (formData, onUploadProgress) =>
    axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutes timeout for video upload
      onUploadProgress,
    }),

  // Create video metadata
  createVideo: (videoData) =>
    axios.post(API_URL, videoData),

  // Update video
  updateVideo: (id, videoData) =>
    axios.put(`${API_URL}/${id}`, videoData),

  // Delete video
  deleteVideo: (id) =>
    axios.delete(`${API_URL}/${id}`),

  // Like video
  likeVideo: (id) =>
    axios.post(`${API_URL}/${id}/like`),

  // Report video
  reportVideo: (id, payload) =>
    axios.post(`${API_URL}/${id}/report`, payload),

  // Comments
  getVideoComments: (id) =>
    axios.get(`${API_URL}/${id}/comments`),
  addVideoComment: (id, comment) =>
    axios.post(`${API_URL}/${id}/comments`, { comment }),

  // Video notes
  getVideoNotes: (id) =>
    axios.get(`${API_URL}/${id}/notes`),
  addVideoNote: (id, noteFormData) =>
    axios.post(`${API_URL}/${id}/notes`, noteFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Watch premium video (deduct tokens)
  watchVideo: (id) =>
    axios.post(`${API_URL}/${id}/watch`),
}

export default videoService
