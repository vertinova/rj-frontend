import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api, { getUploadsUrl } from '../../services/api';

const ManagePendaftaran = () => {
  const navigate = useNavigate();
  const [pendaftaran, setPendaftaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    kategori: '',
    search: ''
  });
  const [selectedPendaftaran, setSelectedPendaftaran] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    checkAuth();
    loadPendaftaran();
  }, [filter, currentPage, itemsPerPage]);

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

  const loadPendaftaran = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('lakaraja_token');
      const params = new URLSearchParams();
      
      if (filter.kategori) params.append('kategori', filter.kategori);
      if (filter.search) params.append('search', filter.search);

      const response = await api.get(`/lakaraja/panitia/registrations?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allData = response.data.data;
      setTotalItems(allData.length);
      
      // Client-side pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedData = allData.slice(startIndex, startIndex + itemsPerPage);
      
      setPendaftaran(paginatedData);
    } catch (error) {
      console.error('Failed to load pendaftaran:', error);
      toast.error('Gagal memuat data pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filter changes
  const handleFilterChange = (key, value) => {
    setFilter({ ...filter, [key]: value });
    setCurrentPage(1);
  };

  // Pagination helpers
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleViewDetail = (item) => {
    setSelectedPendaftaran(item);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (item) => {
    setDeleteTarget(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      const token = localStorage.getItem('lakaraja_token');
      await api.delete(`/lakaraja/panitia/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Pendaftaran berhasil dihapus');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadPendaftaran();
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus pendaftaran');
    }
  };

  const getKategoriBadge = (kategori) => {
    const badges = {
      SD: { color: 'yellow', icon: 'child' },
      SMP: { color: 'cyan', icon: 'user-graduate' },
      SMA: { color: 'pink', icon: 'graduation-cap' }
    };
    const badge = badges[kategori] || badges.SMA;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${badge.color}-500/20 text-${badge.color}-400 border border-${badge.color}-500/30`}>
        <i className={`fas fa-${badge.icon} mr-1`}></i>{kategori}
      </span>
    );
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
                <h1 className="text-white font-bold text-xl">Kelola Pendaftaran</h1>
                <p className="text-white/60 text-sm">Verifikasi pendaftaran kompetisi</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Info */}
        <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <i className="fas fa-info-circle text-blue-400 text-xl mt-1"></i>
            <div>
              <h4 className="text-blue-400 font-bold mb-2">Sistem Pendaftaran Auto-Approve</h4>
              <p className="text-white/70 text-sm">
                Pendaftaran menggunakan sistem <strong className="text-white">siapa cepat dia dapat</strong>. 
                Semua pendaftaran yang masuk akan otomatis diterima sampai kuota penuh.
                Panitia dapat melihat data pendaftaran dan menghubungi peserta jika diperlukan.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-white/10 rounded-xl p-6 mb-6">
          <h3 className="text-white font-bold mb-4">
            <i className="fas fa-filter mr-2 text-orange-500"></i>Filter Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-white/70 text-sm mb-2">Cari</label>
              <div className="relative">
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Cari nama sekolah atau satuan..."
                  className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-orange-500 outline-none"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-white/40"></i>
              </div>
            </div>
            {/* Kategori */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Kategori</label>
              <select
                value={filter.kategori}
                onChange={(e) => handleFilterChange('kategori', e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 outline-none transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.07] cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
              </select>
            </div>
            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter({ kategori: '', search: '' });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all"
              >
                <i className="fas fa-redo mr-2"></i>Reset Filter
              </button>
            </div>
          </div>
          
          {/* Results info */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              Menampilkan <span className="text-white font-semibold">{pendaftaran.length}</span> dari{' '}
              <span className="text-white font-semibold">{totalItems}</span> data
            </p>
            <div className="flex items-center gap-2">
              <label className="text-white/60 text-sm">Per halaman:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-orange-500 outline-none transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.07] cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-orange-500 text-3xl"></i>
            <p className="text-white/60 mt-4">Memuat data...</p>
          </div>
        ) : pendaftaran.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-zinc-900/90 to-black/90 border border-white/10 rounded-xl">
            <i className="fas fa-inbox text-white/20 text-5xl mb-4"></i>
            <p className="text-white/60">Tidak ada data pendaftaran</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">No</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Nama Sekolah</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Nama Satuan</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Kategori</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">No. Urut</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Tanggal Daftar</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendaftaran.map((item, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index;
                    return (
                    <tr key={item.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/80">{globalIndex + 1}</td>
                      <td className="px-6 py-4 text-white">{item.nama_sekolah}</td>
                      <td className="px-6 py-4 text-white">{item.nama_satuan}</td>
                      <td className="px-6 py-4">{getKategoriBadge(item.kategori)}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                          #{globalIndex + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                            title="Lihat Detail"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                            title="Hapus Pendaftaran"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalItems > 0 && totalPages > 1 && (
          <div className="mt-6 bg-gradient-to-br from-zinc-900/90 to-black/90 border border-white/10 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Page Info */}
              <p className="text-white/60 text-sm">
                Halaman <span className="text-white font-semibold">{currentPage}</span> dari{' '}
                <span className="text-white font-semibold">{totalPages}</span>
              </p>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-orange-500/20 hover:text-orange-400'
                  }`}
                  title="Halaman Pertama"
                >
                  <i className="fas fa-angles-left"></i>
                </button>
                
                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-orange-500/20 hover:text-orange-400'
                  }`}
                  title="Halaman Sebelumnya"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {getPageNumbers().map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-2 text-white/40">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-all min-w-[40px] ${
                          currentPage === page
                            ? 'bg-orange-500 text-white font-semibold'
                            : 'bg-white/10 text-white hover:bg-orange-500/20 hover:text-orange-400'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>
                
                {/* Mobile Page Indicator */}
                <span className="sm:hidden px-3 py-2 bg-orange-500 text-white rounded-lg font-semibold">
                  {currentPage}
                </span>
                
                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-orange-500/20 hover:text-orange-400'
                  }`}
                  title="Halaman Berikutnya"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                
                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-orange-500/20 hover:text-orange-400'
                  }`}
                  title="Halaman Terakhir"
                >
                  <i className="fas fa-angles-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPendaftaran && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-orange-500/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-white text-xl font-bold">Detail Pendaftaran</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-white/60 text-sm">Nama Sekolah</label>
                <p className="text-white font-semibold">{selectedPendaftaran.nama_sekolah}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm">Nama Satuan</label>
                <p className="text-white font-semibold">{selectedPendaftaran.nama_satuan}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm">Kategori</label>
                <div className="mt-1">{getKategoriBadge(selectedPendaftaran.kategori)}</div>
              </div>
              <div>
                <label className="text-white/60 text-sm">Waktu Pendaftaran</label>
                <p className="text-white">
                  {new Date(selectedPendaftaran.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="text-white/60 text-sm">Status</label>
                <div className="mt-1">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                    <i className="fas fa-check-circle mr-1"></i>Terdaftar
                  </span>
                </div>
              </div>
              {selectedPendaftaran.logo_satuan && (
                <div>
                  <label className="text-white/60 text-sm">Logo Satuan</label>
                  <img
                    src={getUploadsUrl(`lakaraja/${selectedPendaftaran.logo_satuan}`)}
                    alt="Logo Satuan"
                    className="mt-2 max-w-xs rounded-lg border border-white/10"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23999"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
              {selectedPendaftaran.bukti_payment && (
                <div>
                  <label className="text-white/60 text-sm">Bukti Pembayaran</label>
                  <img
                    src={getUploadsUrl(`lakaraja/${selectedPendaftaran.bukti_payment}`)}
                    alt="Bukti Pembayaran"
                    className="mt-2 max-w-xs rounded-lg border border-white/10"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23999"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-400 text-xl"></i>
              </div>
              <h3 className="text-white text-xl font-bold">Konfirmasi Hapus</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-white/80 mb-3">
                Apakah Anda yakin ingin menghapus pendaftaran ini?
              </p>
              <div className="bg-white/5 border border-red-500/30 rounded-lg p-3">
                <p className="text-white font-semibold">{deleteTarget.nama_satuan}</p>
                <p className="text-white/60 text-sm">{deleteTarget.nama_sekolah}</p>
                <p className="text-red-400 text-xs mt-2">
                  <i className="fas fa-warning mr-1"></i>
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                <i className="fas fa-times mr-2"></i>
                Batal
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-lg shadow-red-500/50"
              >
                <i className="fas fa-trash mr-2"></i>
                Hapus
              </button>
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

export default ManagePendaftaran;
