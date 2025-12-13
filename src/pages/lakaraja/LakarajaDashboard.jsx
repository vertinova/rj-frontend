import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './LakarajaDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance for lakaraja
const lakarajaApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add lakaraja token to requests
lakarajaApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lakaraja_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const LakarajaDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nama_sekolah: '',
    nama_satuan: '',
    kategori: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  
  const logoInputRef = useRef(null);
  const paymentInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('lakaraja_token');
    const userData = localStorage.getItem('lakaraja_user');

    if (!token || !userData) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/lakaraja/login');
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
    
    // Check existing registration
    checkRegistration(JSON.parse(userData).id);
  }, [navigate]);

  const checkRegistration = async (userId) => {
    try {
      const response = await lakarajaApi.get(`/lakaraja/pendaftaran/${userId}`);
      if (response.data.success && response.data.data) {
        setRegistrationData(response.data.data);
      } else {
        setRegistrationData(null);
      }
    } catch (error) {
      // No registration found, that's okay - user can register
      console.log('No existing registration:', error.message);
      setRegistrationData(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error('Format file harus JPG atau PNG');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePaymentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
        toast.error('Format file harus JPG, PNG, atau PDF');
        return;
      }
      setPaymentFile(file);
      if (file.type === 'application/pdf') {
        setPaymentPreview(null);
      } else {
        setPaymentPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nama_sekolah || !formData.nama_satuan || !formData.kategori) {
      toast.error('Semua field harus diisi');
      return;
    }
    if (!logoFile) {
      toast.error('Logo satuan harus diupload');
      return;
    }
    if (!paymentFile) {
      toast.error('Bukti pembayaran harus diupload');
      return;
    }

    setSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('user_id', user.id);
      submitData.append('nama_sekolah', formData.nama_sekolah);
      submitData.append('nama_satuan', formData.nama_satuan);
      submitData.append('kategori', formData.kategori);
      submitData.append('logo_satuan', logoFile);
      submitData.append('bukti_payment', paymentFile);

      const response = await lakarajaApi.post('/lakaraja/pendaftaran', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Pendaftaran berhasil! Menunggu verifikasi.');
        setShowRegistrationModal(false);
        setRegistrationData(response.data.data);
        // Reset form
        setFormData({ nama_sekolah: '', nama_satuan: '', kategori: '' });
        setLogoFile(null);
        setLogoPreview(null);
        setPaymentFile(null);
        setPaymentPreview(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (!registrationData) return { text: 'Belum Daftar', color: 'bg-gray-100 text-gray-600' };
    switch (registrationData.status) {
      case 'pending':
        return { text: 'Menunggu Verifikasi', color: 'bg-yellow-100 text-yellow-700' };
      case 'verified':
        return { text: 'Terverifikasi', color: 'bg-green-100 text-green-700' };
      case 'rejected':
        return { text: 'Ditolak', color: 'bg-red-100 text-red-700' };
      default:
        return { text: 'Belum Daftar', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lakaraja_token');
    localStorage.removeItem('lakaraja_user');
    toast.success('Logout berhasil');
    navigate('/lakaraja/login');
  };

  if (loading) {
    return (
      <div className="lakaraja-loading">
        <div className="text-center">
          <div className="lakaraja-spinner mx-auto mb-4"></div>
          <p className="lakaraja-text-secondary font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lakaraja-dashboard">
      {/* Header */}
      <div className="lakaraja-header">
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="lakaraja-text-white opacity-90 text-sm mb-1">Selamat datang,</p>
              <h1 className="lakaraja-text-white text-3xl font-bold">{user?.username}</h1>
            </div>
            <button
              onClick={handleLogout}
              className="w-11 h-11 bg-white bg-opacity-20 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-opacity-30 transition-all active:scale-95 border border-white border-opacity-30"
            >
              <i className="fas fa-sign-out-alt lakaraja-text-white text-lg"></i>
            </button>
          </div>

          {/* User Info Card */}
          <div className="lakaraja-user-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="lakaraja-avatar">
                  <span className="lakaraja-text-white text-2xl font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="lakaraja-text-primary text-base font-bold">{user?.no_telepon}</p>
                  <p className="lakaraja-text-secondary text-sm">Peserta Lakaraja 2026</p>
                </div>
              </div>
              <div className={`px-3 py-2 rounded-xl text-xs font-bold shadow-sm ${
                user?.is_active 
                  ? 'bg-green-50 text-green-600 border border-green-200' 
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                <i className={`fas ${user?.is_active ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                {user?.is_active ? 'Aktif' : 'Nonaktif'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lakaraja-content max-w-2xl mx-auto space-y-5 pb-6">
        {/* Quick Access Menu */}
        <div className="flex gap-3 overflow-x-auto pb-2 lakaraja-scroll -mx-5 px-5">
          <button className="lakaraja-menu-item">
            <div className="flex items-center gap-3">
              <div className="lakaraja-menu-icon">
                <i className="fas fa-pen-to-square lakaraja-text-white text-xl"></i>
              </div>
              <div className="text-left">
                <p className="lakaraja-text-primary text-sm font-bold">Pendaftaran</p>
                <p className="lakaraja-text-secondary text-xs">Daftar kompetisi</p>
              </div>
            </div>
          </button>

          <button className="lakaraja-menu-item">
            <div className="flex items-center gap-3">
              <div className="lakaraja-menu-icon">
                <i className="fas fa-chart-pie lakaraja-text-white text-xl"></i>
              </div>
              <div className="text-left">
                <p className="lakaraja-text-primary text-sm font-bold">Status</p>
                <p className="lakaraja-text-secondary text-xs">Cek pendaftaran</p>
              </div>
            </div>
          </button>

          <button className="lakaraja-menu-item">
            <div className="flex items-center gap-3">
              <div className="lakaraja-menu-icon">
                <i className="fas fa-clock-rotate-left lakaraja-text-white text-xl"></i>
              </div>
              <div className="text-left">
                <p className="lakaraja-text-primary text-sm font-bold">Riwayat</p>
                <p className="lakaraja-text-secondary text-xs">Lihat aktivitas</p>
              </div>
            </div>
          </button>
        </div>

        {/* Main Status Card */}
        <div className="lakaraja-status-card">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <i className="fas fa-clipboard-list lakaraja-text-white text-lg"></i>
                </div>
                <h3 className="lakaraja-text-white text-lg font-bold">Status Pendaftaran</h3>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusBadge().color}`}>
                {getStatusBadge().text}
              </span>
            </div>
            
            {!registrationData ? (
              <>
                <p className="lakaraja-text-white opacity-90 text-sm mb-5 leading-relaxed">
                  Anda belum mendaftar kompetisi. Lengkapi pendaftaran sekarang untuk mengikuti Lakaraja 2026!
                </p>
                <button 
                  onClick={() => setShowRegistrationModal(true)}
                  className="lakaraja-btn-primary"
                >
                  <i className="fas fa-plus-circle text-lg"></i>
                  <span>Mulai Pendaftaran</span>
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-white bg-opacity-10 rounded-xl p-3">
                  <p className="text-white text-xs opacity-70 mb-1">Sekolah</p>
                  <p className="text-white font-semibold text-sm">{registrationData.nama_sekolah}</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-3">
                  <p className="text-white text-xs opacity-70 mb-1">Satuan</p>
                  <p className="text-white font-semibold text-sm">{registrationData.nama_satuan}</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-3">
                  <p className="text-white text-xs opacity-70 mb-1">Kategori</p>
                  <p className="text-white font-semibold text-sm">{registrationData.kategori}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Steps Section */}
        <div>
          <h3 className="lakaraja-text-primary text-lg font-bold mb-4 px-1">Langkah Pendaftaran</h3>
          <div className="space-y-3">
            {/* Step 1 */}
            <div className="lakaraja-step-card active">
              <div className="flex items-center gap-4">
                <div className="lakaraja-step-number active">1</div>
                <div className="flex-1">
                  <h4 className="lakaraja-text-primary font-bold text-sm mb-1">Lengkapi Data Diri</h4>
                  <p className="lakaraja-text-secondary text-xs leading-relaxed">
                    Isi formulir dengan data sekolah dan satuan yang lengkap dan valid
                  </p>
                </div>
                <i className="fas fa-circle-check lakaraja-text-red text-xl"></i>
              </div>
            </div>

            {/* Step 2 */}
            <div className="lakaraja-step-card inactive">
              <div className="flex items-center gap-4">
                <div className="lakaraja-step-number inactive">2</div>
                <div className="flex-1">
                  <h4 className="lakaraja-text-tertiary font-bold text-sm mb-1">Upload Dokumen</h4>
                  <p className="lakaraja-text-tertiary text-xs leading-relaxed">
                    Upload logo satuan dan bukti pembayaran (maks 5MB)
                  </p>
                </div>
                <i className="fas fa-circle lakaraja-text-tertiary text-xl"></i>
              </div>
            </div>

            {/* Step 3 */}
            <div className="lakaraja-step-card inactive">
              <div className="flex items-center gap-4">
                <div className="lakaraja-step-number inactive">3</div>
                <div className="flex-1">
                  <h4 className="lakaraja-text-tertiary font-bold text-sm mb-1">Menunggu Verifikasi</h4>
                  <p className="lakaraja-text-tertiary text-xs leading-relaxed">
                    Panitia akan memverifikasi data Anda (1-3 hari kerja)
                  </p>
                </div>
                <i className="fas fa-circle lakaraja-text-tertiary text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="lakaraja-info-card">
          <div className="flex items-start gap-4">
            <div className="lakaraja-info-icon">
              <i className="fas fa-lightbulb lakaraja-text-white text-lg"></i>
            </div>
            <div className="flex-1">
              <h4 className="text-red-700 font-bold text-base mb-3">Informasi Penting</h4>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="lakaraja-check-icon">
                    <i className="fas fa-check lakaraja-text-white text-xs"></i>
                  </div>
                  <span className="lakaraja-text-secondary text-sm leading-relaxed">
                    Pastikan data yang dimasukkan valid dan sesuai dengan dokumen resmi
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="lakaraja-check-icon">
                    <i className="fas fa-check lakaraja-text-white text-xs"></i>
                  </div>
                  <span className="lakaraja-text-secondary text-sm leading-relaxed">
                    File dokumen maksimal 5MB dengan format JPG, PNG, atau PDF
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="lakaraja-check-icon">
                    <i className="fas fa-check lakaraja-text-white text-xs"></i>
                  </div>
                  <span className="lakaraja-text-secondary text-sm leading-relaxed">
                    Pastikan bukti pembayaran jelas dan dapat terbaca dengan baik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="lakaraja-bottom-nav">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`lakaraja-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          >
            <i className={`fas fa-home text-xl ${activeTab === 'home' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-xs font-semibold">Home</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('registration');
              if (!registrationData) {
                setShowRegistrationModal(true);
              }
            }}
            className={`lakaraja-nav-item ${activeTab === 'registration' ? 'active' : ''}`}
          >
            <i className={`fas fa-clipboard-list text-xl ${activeTab === 'registration' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-xs font-semibold">Daftar</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`lakaraja-nav-item ${activeTab === 'history' ? 'active' : ''}`}
          >
            <i className={`fas fa-history text-xl ${activeTab === 'history' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-xs font-semibold">Riwayat</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`lakaraja-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <i className={`fas fa-user text-xl ${activeTab === 'profile' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-xs font-semibold">Profil</span>
          </button>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-bold text-gray-900">Form Pendaftaran</h2>
              <button 
                onClick={() => setShowRegistrationModal(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-times text-gray-600"></i>
              </button>
            </div>

            {/* Payment Info Banner */}
            <div className="mx-5 mt-5 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i className="fas fa-money-bill-wave text-xl"></i>
                </div>
                <div>
                  <p className="text-sm opacity-90">Biaya Pendaftaran</p>
                  <p className="text-2xl font-bold">Rp 650.000</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRegistration} className="p-5 space-y-5">
              {/* Nama Sekolah */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-school mr-2 text-red-500"></i>
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  name="nama_sekolah"
                  value={formData.nama_sekolah}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama sekolah"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-gray-900"
                  required
                />
              </div>

              {/* Nama Satuan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-users mr-2 text-red-500"></i>
                  Nama Satuan
                </label>
                <input
                  type="text"
                  name="nama_satuan"
                  value={formData.nama_satuan}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama satuan"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-gray-900"
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-layer-group mr-2 text-red-500"></i>
                  Kategori
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['SD', 'SMP', 'SMA'].map((kat) => (
                    <button
                      key={kat}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, kategori: kat }))}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                        formData.kategori === kat
                          ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {kat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Logo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-image mr-2 text-red-500"></i>
                  Logo Satuan
                </label>
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoChange}
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                />
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    logoPreview ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  {logoPreview ? (
                    <div className="flex items-center gap-4">
                      <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-cover rounded-xl" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-green-700">Logo berhasil diupload</p>
                        <p className="text-xs text-gray-500">{logoFile?.name}</p>
                      </div>
                      <i className="fas fa-check-circle text-green-500 text-xl"></i>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-600">Klik untuk upload logo</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG (Maks. 5MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Upload Bukti Pembayaran */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-receipt mr-2 text-red-500"></i>
                  Bukti Pembayaran
                </label>
                <input
                  type="file"
                  ref={paymentInputRef}
                  onChange={handlePaymentChange}
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  className="hidden"
                />
                <div 
                  onClick={() => paymentInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    paymentFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  {paymentFile ? (
                    <div className="flex items-center gap-4">
                      {paymentPreview ? (
                        <img src={paymentPreview} alt="Payment preview" className="w-16 h-16 object-cover rounded-xl" />
                      ) : (
                        <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center">
                          <i className="fas fa-file-pdf text-red-500 text-2xl"></i>
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-green-700">Bukti pembayaran diupload</p>
                        <p className="text-xs text-gray-500">{paymentFile?.name}</p>
                      </div>
                      <i className="fas fa-check-circle text-green-500 text-xl"></i>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-600">Klik untuk upload bukti pembayaran</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (Maks. 5MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mendaftar...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    <span>Kirim Pendaftaran</span>
                  </>
                )}
              </button>
            </form>
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

export default LakarajaDashboard;
