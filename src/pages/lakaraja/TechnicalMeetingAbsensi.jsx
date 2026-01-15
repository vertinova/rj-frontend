import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import CameraPhotoBoothModal from './CameraPhotoBoothModal';
import SuccessWelcomeModal from './SuccessWelcomeModal';

const TechnicalMeetingAbsensi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedKategori, setSelectedKategori] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'hadir', 'belum'
  const [showCamera, setShowCamera] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successParticipant, setSuccessParticipant] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    // Check if user is panitia
    const token = localStorage.getItem('lakaraja_token');
    const userData = localStorage.getItem('lakaraja_user');

    if (!token || !userData) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/lakaraja/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    if (parsedUser.role !== 'panitia') {
      toast.error('Akses ditolak. Hanya panitia yang dapat mengakses halaman ini.');
      navigate('/lakaraja/dashboard');
      return;
    }

    loadData();
  }, [navigate]);

  useEffect(() => {
    filterParticipants();
  }, [participants, selectedKategori, searchQuery, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('lakaraja_token');
      
      const [participantsRes, statsRes] = await Promise.all([
        api.get('/lakaraja/panitia/technical-meeting/participants', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/lakaraja/panitia/technical-meeting/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('Participants data:', participantsRes.data.data);
      console.log('API_BASE_URL:', API_BASE_URL);
      
      setParticipants(participantsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const filterParticipants = () => {
    let filtered = [...participants];

    // Filter by kategori
    if (selectedKategori !== 'all') {
      filtered = filtered.filter(p => p.kategori === selectedKategori);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.nama_sekolah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nama_satuan.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab (activeTab)
    if (activeTab === 'hadir') {
      filtered = filtered.filter(p => p.sudah_absen);
    } else if (activeTab === 'belum') {
      filtered = filtered.filter(p => !p.sudah_absen);
    }

    setFilteredParticipants(filtered);
  };

  const handleMarkAttendance = async (pendaftaran_id, nama_satuan) => {
    // Open camera modal instead of direct confirmation
    const participant = participants.find(p => p.id === pendaftaran_id);
    setSelectedParticipant(participant);
    setShowCamera(true);
  };

  const handlePhotoCapture = async (photoDataUrl) => {
    if (!selectedParticipant) return;

    try {
      const token = localStorage.getItem('lakaraja_token');
      
      // Send photo as base64 string
      await api.post('/lakaraja/panitia/technical-meeting/attendance', 
        { 
          pendaftaran_id: selectedParticipant.id,
          foto_selfie: photoDataUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Close camera and show success modal
      setShowCamera(false);
      setSuccessParticipant({
        nama: selectedParticipant.nama_satuan,
        kategori: selectedParticipant.kategori,
        logo: selectedParticipant.logo_satuan ? `${API_BASE_URL}${selectedParticipant.logo_satuan}` : null
      });
      setShowSuccessModal(true);
      
      // Clear selected participant
      setSelectedParticipant(null);
      
      // Reload data after modal is shown
      setTimeout(() => {
        loadData();
      }, 500);
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      toast.error(error.response?.data?.message || 'Gagal mencatat absensi');
    }
  };

  const handleCancelAttendance = async (pendaftaran_id, nama_satuan) => {
    if (!confirm(`Batalkan absensi untuk ${nama_satuan}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('lakaraja_token');
      await api.delete('/lakaraja/panitia/technical-meeting/attendance', {
        data: { pendaftaran_id },
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Absensi berhasil dibatalkan');
      loadData();
    } catch (error) {
      console.error('Failed to cancel attendance:', error);
      toast.error(error.response?.data?.message || 'Gagal membatalkan absensi');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-zinc-900 to-black border-b border-orange-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/lakaraja/panitia')}
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <div>
                <h1 className="text-white font-bold text-xl">Absensi Technical Meeting</h1>
                <p className="text-white/60 text-sm">Lakaraja 2026</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm mb-1">Total Peserta</p>
                  <h3 className="text-white text-3xl font-bold">{stats.total_peserta}</h3>
                </div>
                <i className="fas fa-users text-blue-500 text-3xl"></i>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm mb-1">Sudah Hadir</p>
                  <h3 className="text-white text-3xl font-bold">{stats.total_hadir}</h3>
                </div>
                <i className="fas fa-check-circle text-green-500 text-3xl"></i>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm mb-1">Belum Hadir</p>
                  <h3 className="text-white text-3xl font-bold">{stats.total_peserta - stats.total_hadir}</h3>
                </div>
                <i className="fas fa-clock text-yellow-500 text-3xl"></i>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-400 text-sm mb-1">Persentase</p>
                  <h3 className="text-white text-3xl font-bold">
                    {stats.total_peserta > 0 ? Math.round((stats.total_hadir / stats.total_peserta) * 100) : 0}%
                  </h3>
                </div>
                <i className="fas fa-chart-pie text-orange-500 text-3xl"></i>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-orange-500/20 rounded-xl p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-black/30 text-white/60 hover:bg-black/50 hover:text-white'
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              Semua ({stats ? stats.total_peserta : 0})
            </button>
            <button
              onClick={() => setActiveTab('hadir')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'hadir'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-black/30 text-white/60 hover:bg-black/50 hover:text-white'
              }`}
            >
              <i className="fas fa-check-circle mr-2"></i>
              Sudah Hadir ({stats ? stats.total_hadir : 0})
            </button>
            <button
              onClick={() => setActiveTab('belum')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'belum'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30'
                  : 'bg-black/30 text-white/60 hover:bg-black/50 hover:text-white'
              }`}
            >
              <i className="fas fa-clock mr-2"></i>
              Belum Hadir ({stats ? stats.total_peserta - stats.total_hadir : 0})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-orange-500/20 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{/* Search */}
            {/* Search */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">Cari Sekolah</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nama sekolah atau satuan..."
                  className="w-full bg-black/50 border border-orange-500/20 rounded-lg px-4 py-2 pl-10 text-white placeholder-white/40 focus:border-orange-500 focus:outline-none"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-white/40"></i>
              </div>
            </div>

            {/* Kategori Filter */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">Kategori</label>
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="w-full bg-black/50 border border-orange-500/20 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-white/60 text-sm">
              Menampilkan {filteredParticipants.length} dari {participants.length} peserta
            </p>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all text-sm"
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParticipants.map((participant) => (
            <div
              key={participant.id}
              className={`bg-gradient-to-br ${
                participant.sudah_absen
                  ? 'from-green-500/10 to-green-600/10 border-green-500/20'
                  : 'from-zinc-900 to-black border-orange-500/20'
              } border rounded-xl p-6 transition-all hover:scale-105`}
            >
              {/* Logo */}
              <div className="flex justify-center mb-4">
                {participant.logo_satuan ? (
                  <img
                    src={`${API_BASE_URL}${participant.logo_satuan}`}
                    alt={participant.nama_satuan}
                    className="w-24 h-24 object-contain rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ccircle fill="%23333" cx="50" cy="50" r="50"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Logo%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-white/10">
                    <i className="fas fa-school text-white/20 text-3xl"></i>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="text-center mb-4">
                <h3 className="text-white font-bold text-lg mb-1">{participant.nama_satuan}</h3>
                <p className="text-white/60 text-sm mb-2">{participant.nama_sekolah}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  participant.kategori === 'SD' ? 'bg-blue-500/20 text-blue-400' :
                  participant.kategori === 'SMP' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {participant.kategori}
                </span>
              </div>

              {/* Status */}
              {participant.sudah_absen ? (
                <div className="mb-4">
                  {/* Foto Selfie Preview - Enhanced Polaroid */}
                  {participant.foto_selfie && (
                    <div className="mb-3 relative">
                      {/* Polaroid Paper with Shadow */}
                      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-2 sm:p-3 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border border-orange-100/50">
                        {/* Decorative Corner Stickers */}
                        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full opacity-80 flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
                          ⭐
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-red-400 to-red-500 rounded-full opacity-80 flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
                          🔥
                        </div>

                        {/* Photo */}
                        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-inner">
                          <img
                            src={participant.foto_selfie}
                            alt="Foto Selfie"
                            className="w-full rounded object-cover"
                            style={{ aspectRatio: '4/3' }}
                          />
                          {/* Checkmark Badge */}
                          <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <i className="fas fa-check text-white text-sm"></i>
                          </div>
                        </div>

                        {/* Enhanced Polaroid Bottom */}
                        <div className="mt-2 space-y-1 px-1 bg-gradient-to-b from-transparent to-orange-50/50 rounded-b-lg pt-1.5">
                          {/* Header with Logo */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="relative">
                                <img 
                                  src="/logo_lakaraja.png" 
                                  alt="Lakaraja Logo" 
                                  className="w-7 h-7 object-contain"
                                  style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}}                                />
                                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center text-xs shadow-md">
                                  ⚡
                                </div>
                              </div>
                              <div>
                                <span className="text-transparent font-black text-sm bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text drop-shadow-sm">
                                  LAKARAJA
                                </span>
                                <p className="text-orange-700 text-xs font-bold leading-none">2026</p>
                              </div>
                            </div>
                            <div>
                              <img 
                                src="/logo_rj.png" 
                                alt="RJ Logo" 
                                className="w-8 h-8 object-contain"
                                style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}}                              />
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>

                          {/* Event Info */}
                          <div className="text-center">
                            <p className="text-orange-800 text-xs font-bold uppercase tracking-wide">
                              ⚡ Tech Meeting ⚡
                            </p>
                            <div className="flex items-center justify-center gap-1 text-orange-600 text-xs">
                              <i className="far fa-calendar-alt"></i>
                              <span className="font-medium">
                                {formatDate(participant.waktu_absen).split(',')[0]}
                              </span>
                            </div>
                          </div>

                          {/* Supported By */}
                          <div className="border-t border-orange-200 pt-1.5">
                            <p className="text-orange-500 text-xs text-center uppercase tracking-wide font-semibold" style={{fontSize: '0.65rem'}}>Supported by</p>
                            <div className="flex items-center justify-center">
                              <img 
                                src="/Logo%20SIMPASKOR.PNG" 
                                alt="SIMPASKOR Logo" 
                                className="h-5 object-contain"
                                style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}}onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <span className="text-orange-700 font-bold text-xs" style={{display: 'none'}}>SIMPASKOR</span>
                            </div>
                          </div>

                          {/* Bottom */}
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <span className="text-orange-400">✨</span>
                            <span className="text-orange-600 font-medium italic text-xs">Captured</span>
                            <span className="text-orange-400">✨</span>
                          </div>
                        </div>

                        {/* Decorative Tape */}
                        <div className="absolute -top-2 left-1/4 w-12 h-4 bg-yellow-100/80 border border-yellow-200 rotate-3 shadow-sm"></div>
                        <div className="absolute -top-2 right-1/4 w-12 h-4 bg-yellow-100/80 border border-yellow-200 -rotate-3 shadow-sm"></div>
                      </div>

                      {/* Shadow Layers */}
                      <div className="absolute -bottom-1.5 left-4 right-4 h-3 bg-gradient-to-b from-black/20 to-transparent blur-lg rounded-full"></div>
                    </div>
                  )}
                  
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-check-circle text-green-400"></i>
                      <span className="text-green-400 font-semibold text-sm">Sudah Absen</span>
                    </div>
                    <p className="text-white/60 text-xs">
                      <i className="far fa-clock mr-1"></i>
                      {formatDate(participant.waktu_absen)}
                    </p>
                    {participant.panitia_nama && (
                      <p className="text-white/60 text-xs mt-1">
                        <i className="far fa-user mr-1"></i>
                        oleh: {participant.panitia_nama}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCancelAttendance(participant.id, participant.nama_satuan)}
                    className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Batalkan Absensi
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleMarkAttendance(participant.id, participant.nama_satuan)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all font-semibold"
                >
                  <i className="fas fa-check mr-2"></i>
                  Tandai Hadir
                </button>
              )}

              {/* Contact Info */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/40 text-xs">
                  <i className="fas fa-phone mr-1"></i>
                  {participant.no_telepon || '-'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredParticipants.length === 0 && (
          <div className="text-center py-16">
            <i className="fas fa-inbox text-white/20 text-6xl mb-4"></i>
            <p className="text-white/60 text-lg">Tidak ada peserta yang ditemukan</p>
          </div>
        )}
      </div>

      {/* Camera Photo Booth Modal */}
      <CameraPhotoBoothModal
        isOpen={showCamera}
        onClose={() => {
          setShowCamera(false);
          setSelectedParticipant(null);
        }}
        onCapture={handlePhotoCapture}
        participantName={selectedParticipant?.nama_satuan || ''}
      />

      {/* Success Welcome Modal */}
      <SuccessWelcomeModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        participantName={successParticipant?.nama || ''}
        kategori={successParticipant?.kategori || ''}
        logoUrl={successParticipant?.logo || null}
      />
    </div>
  );
};

export default TechnicalMeetingAbsensi;
