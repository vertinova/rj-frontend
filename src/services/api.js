import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // Check if request is for lakaraja endpoints
    const isLakarajaRequest = config.url?.includes('/lakaraja')
    
    // Use appropriate token
    const token = isLakarajaRequest 
      ? localStorage.getItem('lakaraja_token')
      : localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if current path is lakaraja
      const isLakarajaPath = window.location.pathname.includes('/lakaraja')
      const isLoginPage = window.location.pathname.includes('/login')
      
      // Only redirect if NOT already on login page
      if (isLakarajaPath && !isLoginPage) {
        // Lakaraja token expired or invalid - redirect to login
        localStorage.removeItem('lakaraja_token')
        localStorage.removeItem('lakaraja_user')
        window.location.href = '/lakaraja/login'
      } else if (!isLakarajaPath && !isLoginPage) {
        // Regular token expired or invalid - redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      // If already on login page, just reject the error without redirect
    }
    return Promise.reject(error)
  }
)

export default api

// Helper function to get uploads URL
export const getUploadsUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  // Remove /api suffix if exists
  const uploadsBaseUrl = baseUrl.replace('/api', '')
  return `${uploadsBaseUrl}/uploads/${path}`
}
