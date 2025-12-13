import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    role: '',
    is_active: ''
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    checkAuth();
    loadUsers();
  }, [filter]);

  const checkAuth = () => {
    const token = localStorage.getItem('lakaraja_token');
    const userData = localStorage.getItem('lakaraja_user');

    if (!token || !userData) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/lakaraja/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'panitia') {
      toast.error('Akses ditolak');
      navigate('/lakaraja/dashboard');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('lakaraja_token');
      const params = new URLSearchParams();
      
      if (filter.role) params.append('role', filter.role);
      if (filter.is_active) params.append('is_active', filter.is_active);

      const response = await api.get(`/lakaraja/panitia/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    if (!confirm(`Apakah Anda yakin ingin ${currentStatus ? 'menonaktifkan' : 'mengaktifkan'} user ini?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('lakaraja_token');
      await api.put(
        `/lakaraja/panitia/user/${userId}/toggle-active`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`User berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error(error.response?.data?.message || 'Gagal mengubah status user');
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowResetModal(true);
  };

  const submitResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    try {
      const token = localStorage.getItem('lakaraja_token');
      await api.put(
        `/lakaraja/panitia/user/${selectedUser.id}/reset-password`,
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Password berhasil direset');
      setShowResetModal(false);
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast.error(error.response?.data?.message || 'Gagal mereset password');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan!')) {
      return;
    }

    try {
      const token = localStorage.getItem('lakaraja_token');
      await api.delete(`/lakaraja/panitia/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('User berhasil dihapus');
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus user');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-zinc-900 to-black border-b border-orange-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link to="/lakaraja/panitia" className="text-orange-500 hover:text-orange-400">
                <i className="fas fa-arrow-left text-xl"></i>
              </Link>
              <div>
                <h1 className="text-white font-bold text-xl">Kelola Pengguna</h1>
                <p className="text-white/60 text-sm">Manajemen pengguna Lakaraja</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-white/10 rounded-xl p-6 mb-6">
          <h3 className="text-white font-bold mb-4">
            <i className="fas fa-filter mr-2 text-orange-500"></i>Filter Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Role</label>
              <select
                value={filter.role}
                onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 outline-none transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.07] cursor-pointer"
              >
                <option value="">Semua Role</option>
                <option value="peserta">Peserta</option>
                <option value="panitia">Panitia</option>
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Status</label>
              <select
                value={filter.is_active}
                onChange={(e) => setFilter({ ...filter, is_active: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 outline-none transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.07] cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({ role: '', is_active: '' })}
                className="w-full px-4 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all"
              >
                <i className="fas fa-redo mr-2"></i>Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-orange-500 text-3xl"></i>
            <p className="text-white/60 mt-4">Memuat data...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-zinc-900/90 to-black/90 border border-white/10 rounded-xl">
            <i className="fas fa-inbox text-white/20 text-5xl mb-4"></i>
            <p className="text-white/60">Tidak ada data pengguna</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">No</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Username</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">No Telepon</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Role</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Terdaftar</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/80">{index + 1}</td>
                      <td className="px-6 py-4 text-white font-semibold">{user.username}</td>
                      <td className="px-6 py-4 text-white/80">{user.no_telepon}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'panitia' 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {user.role === 'panitia' ? 'Panitia' : 'Peserta'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_active 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            className={`px-3 py-1 rounded-lg transition-all ${
                              user.is_active
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                            }`}
                            title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <i className={`fas fa-${user.is_active ? 'ban' : 'check'}`}></i>
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all"
                            title="Reset Password"
                          >
                            <i className="fas fa-key"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                            title="Hapus User"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-orange-500/20 rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-white text-xl font-bold">Reset Password</h3>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Username</label>
                <p className="text-white font-semibold">{selectedUser.username}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 outline-none"
                  placeholder="Masukkan password baru (min. 6 karakter)"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={submitResetPassword}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Font Awesome */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" 
      />
    </div>
  );
};

export default ManageUsers;
