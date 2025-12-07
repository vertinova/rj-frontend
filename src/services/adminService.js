import api from './api'

export const adminService = {
  // Dashboard Statistics
  async getStatistics(period = 'month') {
    try {
      const response = await api.get('/admin/statistics', { params: { period } })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengambil statistik')
    }
  },

  // Pendaftar Management
  async getPendaftar(filters = {}) {
    try {
      const response = await api.get('/admin/pendaftar', { params: filters })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengambil data pendaftar')
    }
  },

  async updatePendaftarStatus(id, status, nomor_kta = null) {
    try {
      const payload = { status }
      if (nomor_kta) payload.nomor_kta = nomor_kta
      const response = await api.put(`/admin/pendaftar/${id}/status`, payload)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal update status')
    }
  },

  // User Management
  async getUsers(filters = {}) {
    try {
      const response = await api.get('/admin/users', { params: filters })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengambil data user')
    }
  },

  async resetUserPassword(id, newPassword) {
    try {
      const response = await api.put(`/admin/users/${id}/reset-password`, { newPassword })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal reset password')
    }
  },

  // Absensi
  async getAbsensi(filters = {}) {
    try {
      const response = await api.get('/admin/absensi', { params: filters })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengambil data absensi')
    }
  },

  // Generate KTA
  async generateKTA(pendaftarId) {
    try {
      const response = await api.post('/admin/generate-kta', { pendaftarId })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal generate KTA')
    }
  }
}
