import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { 
  FaSearch, 
  FaFilter, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaEye,
  FaIdCard,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const AdminPendaftar = () => {
  const [pendaftar, setPendaftar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
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
  const [selectedPendaftar, setSelectedPendaftar] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showKTAModal, setShowKTAModal] = useState(false);

  useEffect(() => {
    fetchPendaftar();
  }, [filters.status, filters.search, filters.page, filters.limit]);

  const fetchPendaftar = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendaftar(filters);
      setPendaftar(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      await adminService.updatePendaftarStatus(id, newStatus);
      toast.success(`Status berhasil diubah menjadi ${newStatus}`);
      fetchPendaftar();
    } catch (error) {
      toast.error(error.message);
    }
  }, [fetchPendaftar]);

  const handleGenerateKTA = useCallback(async (id) => {
    try {
      const response = await adminService.generateKTA(id);
      toast.success(response.message);
      setShowKTAModal(false);
      fetchPendaftar();
    } catch (error) {
      toast.error(error.message);
    }
  }, [fetchPendaftar]);

  const handlePageChange = useCallback((newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleDetailClick = useCallback((pendaftar) => {
    setSelectedPendaftar(pendaftar);
    setShowDetailModal(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedPendaftar(null);
  }, []);

  const handleKTAClick = useCallback((pendaftar) => {
    setSelectedPendaftar(pendaftar);
    setShowKTAModal(true);
  }, []);

  const handleCloseKTAModal = useCallback(() => {
    setShowKTAModal(false);
    setSelectedPendaftar(null);
  }, []);

  const StatusBadge = ({ status }) => {
    const styles = {
      'lolos': 'bg-green-500/20 text-green-400 border-green-500/50',
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'tidak lolos': 'bg-red-500/20 text-red-400 border-red-500/50'
    };

    const icons = {
      'lolos': <FaCheck className="inline mr-1" />,
      'pending': <FaClock className="inline mr-1" />,
      'tidak lolos': <FaTimes className="inline mr-1" />
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {icons[status]}
        {status.toUpperCase()}
      </span>
    );
  };

  const DetailModal = ({ pendaftar, onClose }) => {
    if (!pendaftar) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl blur opacity-50"></div>
          <div className="relative bg-gray-900 p-8 rounded-2xl border border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Detail Pendaftar
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-400 text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Foto */}
              {pendaftar.foto_diri && (
                <div className="col-span-2 flex justify-center">
                  <img
                    src={`${import.meta.env.VITE_UPLOADS_URL || 'https://api.paskibmansabo.com/uploads'}/${pendaftar.foto_diri}`}
                    alt={pendaftar.nama_lengkap}
                    className="w-32 h-32 object-cover rounded-full border-4 border-purple-500/50"
                  />
                </div>
              )}

              {/* Data Pribadi */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-4">Data Pribadi</h3>
                <DetailItem label="Nama Lengkap" value={pendaftar.nama_lengkap} />
                <DetailItem label="Username" value={pendaftar.username} />
                <DetailItem label="Email" value={pendaftar.email} />
                <DetailItem label="Jenis Kelamin" value={pendaftar.jenis_kelamin} />
                <DetailItem label="Tempat Lahir" value={pendaftar.tempat_lahir} />
                <DetailItem label="Tanggal Lahir" value={new Date(pendaftar.tanggal_lahir).toLocaleDateString('id-ID')} />
                <DetailItem label="No. Telepon" value={pendaftar.no_telepon} />
              </div>

              {/* Data Fisik & Pendidikan */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-pink-400 mb-4">Data Fisik & Pendidikan</h3>
                <DetailItem label="Tinggi Badan" value={`${pendaftar.tinggi_badan} cm`} />
                <DetailItem label="Berat Badan" value={`${pendaftar.berat_badan} kg`} />
                <DetailItem label="Pendidikan Terakhir" value={pendaftar.pendidikan_terakhir} />
                <DetailItem label="Kelas" value={pendaftar.kelas} />
                <DetailItem label="Pilihan Kampus" value={pendaftar.pilihan_kampus} />
                <DetailItem label="Nama Orang Tua" value={pendaftar.nama_orangtua} />
              </div>

              {/* Alamat & Status */}
              <div className="col-span-2 space-y-4">
                <DetailItem label="Alamat" value={pendaftar.alamat} />
                <DetailItem label="Alasan Mendaftar" value={pendaftar.alasan} />
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400">Status</span>
                  <StatusBadge status={pendaftar.status} />
                </div>
                {pendaftar.nomor_kta && (
                  <DetailItem label="Nomor KTA" value={pendaftar.nomor_kta} />
                )}
                <DetailItem label="Tanggal Daftar" value={new Date(pendaftar.tanggal_daftar).toLocaleString('id-ID')} />
              </div>

              {/* Action Buttons */}
              <div className="col-span-2 flex gap-4 mt-6">
                {pendaftar.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(pendaftar.id, 'lolos');
                        onClose();
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                    >
                      <FaCheck className="inline mr-2" />
                      Terima
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(pendaftar.id, 'tidak lolos');
                        onClose();
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300"
                    >
                      <FaTimes className="inline mr-2" />
                      Tolak
                    </button>
                  </>
                )}
                {pendaftar.status === 'lolos' && !pendaftar.nomor_kta && (
                  <button
                    onClick={() => {
                      setSelectedPendaftar(pendaftar);
                      setShowKTAModal(true);
                      onClose();
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                  >
                    <FaIdCard className="inline mr-2" />
                    Generate KTA
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DetailItem = ({ label, value }) => (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-medium text-sm">{value}</span>
    </div>
  );

  const KTAModal = ({ pendaftar, onClose, onGenerate }) => {
    if (!pendaftar) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-50"></div>
          <div className="relative bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Generate Nomor KTA</h3>
            <p className="text-gray-400 mb-6">
              Apakah Anda yakin ingin generate nomor KTA untuk <span className="text-white font-semibold">{pendaftar.nama_lengkap}</span>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => onGenerate(pendaftar.id)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                Ya, Generate
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Data Pendaftar
          </h1>
          <p className="text-gray-400">Kelola data calon taruna Paskibra Rajawali</p>
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
                  placeholder="Cari nama, email, atau username..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="w-full pl-12 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300 hover:border-purple-500/50 hover:bg-gray-800/80 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="lolos">Lolos</option>
                <option value="tidak lolos">Tidak Lolos</option>
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
          ) : pendaftar.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Tidak ada data pendaftar</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">No</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Lengkap</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Kelas</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">KTA</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {pendaftar.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {item.nama_lengkap}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {item.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {item.kelas}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {item.nomor_kta || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => {
                              setSelectedPendaftar(item);
                              setShowDetailModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                          >
                            <FaEye className="inline mr-2" />
                            Detail
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

      {/* Modals */}
      {showDetailModal && (
        <DetailModal
          pendaftar={selectedPendaftar}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showKTAModal && (
        <KTAModal
          pendaftar={selectedPendaftar}
          onClose={() => setShowKTAModal(false)}
          onGenerate={handleGenerateKTA}
        />
      )}
    </div>
  );
};

export default AdminPendaftar;
