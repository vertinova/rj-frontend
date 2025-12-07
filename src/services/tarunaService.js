import api from './api'

export const tarunaService = {
  async submitPendaftaran(formData) {
    try {
      const response = await api.post('/taruna/pendaftaran', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal submit pendaftaran')
    }
  },

  async getPendaftaranStatus() {
    try {
      const response = await api.get('/taruna/pendaftaran/status')
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengambil status pendaftaran')
    }
  },

  async checkProfileCompleteness() {
    try {
      const response = await api.get('/taruna/profile/check-completeness')
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal memeriksa kelengkapan profil')
    }
  },

  async submitAbsensi(formData) {
    try {
      const response = await api.post('/taruna/absensi', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal submit absensi')
    }
  },

  async getAbsensiHistory(startDate, endDate) {
    try {
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      
      const response = await api.get('/taruna/absensi/history', { params })
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengambil riwayat absensi')
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengambil profil')
    }
  },

  async updateProfile(formData) {
    try {
      const response = await api.put('/taruna/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal memperbarui profil')
    }
  }
}
