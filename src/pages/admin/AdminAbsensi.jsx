import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { 
  FaSearch, 
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaImage,
  FaTimes,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

// Move modal outside component to prevent re-creation
const ImageModal = ({ imageSrc, onClose }) => {
  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FaTimes className="text-white text-xl" />
        </button>
        <img
          src={imageSrc}
          alt="Foto Absensi"
          className="max-w-full max-h-[85vh] object-contain rounded-xl border-4 border-purple-500/50"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

const AdminAbsensi = () => {
  const [absensi, setAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchAbsensi();
  }, [filters.startDate, filters.endDate, filters.search, filters.page, filters.limit]);

  const fetchAbsensi = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAbsensi(filters);
      setAbsensi(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handlePageChange = useCallback((newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleImageClick = useCallback((imageSrc) => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowImageModal(false);
    setSelectedImage(null);
  }, []);

  const StatusBadge = ({ status }) => {
    const styles = {
      'hadir': 'bg-green-500/20 text-green-400 border-green-500/50',
      'izin': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'sakit': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'alpha': 'bg-red-500/20 text-red-400 border-red-500/50'
    };

    const icons = {
      'hadir': <FaCheckCircle className="inline mr-1" />,
      'izin': <FaClock className="inline mr-1" />,
      'sakit': <FaClock className="inline mr-1" />,
      'alpha': <FaTimesCircle className="inline mr-1" />
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.alpha}`}>
        {icons[status] || icons.alpha}
        {status?.toUpperCase() || 'ALPHA'}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Data Absensi
          </h1>
          <p className="text-gray-400">Monitor kehadiran taruna Paskibra Rajawali</p>
        </div>
      </div>

      {/* Filters */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari username..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="relative">
              <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
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
          ) : absensi.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Tidak ada data absensi</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">No</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Kampus</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Waktu</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Foto</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {absensi.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {item.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {item.kampus}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge status={item.status_absensi} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(item.tanggal_absensi).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {item.waktu_absensi}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.foto_absensi ? (
                            <button
                              onClick={() => handleImageClick(`${import.meta.env.VITE_UPLOADS_URL || 'https://api.paskibmansabo.com/uploads'}/absensi/${item.foto_absensi}`)}
                              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                            >
                              <FaImage className="inline mr-1" />
                              Lihat
                            </button>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {item.keterangan || '-'}
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

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal
          imageSrc={selectedImage}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AdminAbsensi;
