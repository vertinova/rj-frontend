import api from './api'

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password })
      
      if (response.data.success) {
        const { token, user } = response.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        return response.data.data
      }
      
      throw new Error(response.data.message)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login gagal')
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        return response.data
      }
      
      throw new Error(response.data.message)
    } catch (error) {
      if (error.response?.data?.errors) {
        const errorMsg = error.response.data.errors.map(e => e.message).join(', ')
        throw new Error(errorMsg)
      }
      throw new Error(error.response?.data?.message || 'Registrasi gagal')
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile')
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengambil profil')
    }
  },

  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const response = await api.put('/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengubah password')
    }
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}
