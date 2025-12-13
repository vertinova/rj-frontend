import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { 
  FaSearch, 
  FaFilter, 
  FaUserShield,
  FaUser,
  FaKey,
  FaTimes,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

// Move modal outside component to prevent re-creation
const ResetPasswordModal = ({ user, onClose, onReset, newPassword, setNewPassword }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Reset Password</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-400 mb-2">User: <span className="text-white font-semibold">{user.username}</span></p>
            <p className="text-gray-400 mb-4">Email: <span className="text-white">{user.email}</span></p>
            
            <label className="block text-gray-300 mb-2 text-sm">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onReset}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              <FaKey className="inline mr-2" />
              Reset Password
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: 'all',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Memoized fetch function
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(filters);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [filters.role, filters.search, filters.page, filters.limit]);

  // Memoized handlers
  const handleResetPassword = useCallback(async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    try {
      await adminService.resetUserPassword(selectedUser.id, newPassword);
      toast.success('Password berhasil direset');
      setShowResetModal(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.message);
    }
  }, [newPassword, selectedUser]);

  const handlePageChange = useCallback((newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleResetClick = useCallback((user) => {
    setSelectedUser(user);
    setShowResetModal(true);
  }, []);

  const handleCloseResetModal = useCallback(() => {
    setShowResetModal(false);
    setSelectedUser(null);
    setNewPassword('');
  }, []);

  const RoleBadge = ({ role }) => {
    const styles = {
      'admin': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      'user': 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    };

    const icons = {
      'admin': <FaUserShield className="inline mr-1" />,
      'user': <FaUser className="inline mr-1" />
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[role]}`}>
        {icons[role]}
        {role.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Manajemen Users
          </h1>
          <p className="text-gray-400">Kelola akun admin dan taruna</p>
        </div>
      </div>

      {/* Filters */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari username atau email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
                className="w-full pl-12 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300 hover:border-purple-500/50 hover:bg-gray-800/80 cursor-pointer"
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="user">User/Taruna</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Tidak ada data users</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">No</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Terdaftar</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(user.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleResetClick(user)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                          >
                            <FaKey className="inline mr-2" />
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-800/50 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Menampilkan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalItems)} dari {pagination.totalItems} data
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="text-white px-4">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <ResetPasswordModal
          user={selectedUser}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          onClose={handleCloseResetModal}
          onReset={handleResetPassword}
        />
      )}
    </div>
  );
};

export default AdminUsers;
