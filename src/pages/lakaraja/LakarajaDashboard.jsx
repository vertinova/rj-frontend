import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [refreshingQuota, setRefreshingQuota] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState({
    SD: { max: 10, current: 0, available: 10, isFull: false },
    SMP: { max: 25, current: 0, available: 25, isFull: false },
    SMA: { max: 25, current: 0, available: 25, isFull: false }
  });
  
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

  // Team data form state
  const [teamData, setTeamData] = useState({
    jumlah_pasukan: '',
    member_names: [],
  });
  const [suratKeteranganFile, setSuratKeteranganFile] = useState(null);
  const [fotoTeamFile, setFotoTeamFile] = useState(null);
  const [fotoAnggotaFiles, setFotoAnggotaFiles] = useState([]);
  const [fotoAnggotaPreviews, setFotoAnggotaPreviews] = useState([]);
  const [submittingTeam, setSubmittingTeam] = useState(false);

  // Countdown state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const logoInputRef = useRef(null);
  const paymentInputRef = useRef(null);
  const suratInputRef = useRef(null);
  const fotoTeamInputRef = useRef(null);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const token = localStorage.getItem('lakaraja_token');
    const userData = localStorage.getItem('lakaraja_user');

    if (!token || !userData) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/lakaraja/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setLoading(false);
    
    checkRegistration(parsedUser.id);
    fetchQuotaInfo();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const calculateCountdown = () => {
      const eventDate = new Date('2026-01-31T00:00:00').getTime();
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkRegistration = async (userId) => {
    try {
      const response = await lakarajaApi.get(`/lakaraja/pendaftaran/${userId}`);
      console.log('Registration data:', response.data);
      if (response.data.success && response.data.data) {
        console.log('Logo satuan:', response.data.data.logo_satuan);
        console.log('Logo URL:', getFileUrl(response.data.data.logo_satuan));
        setRegistrationData(response.data.data);
      } else {
        setRegistrationData(null);
      }
    } catch (error) {
      console.error('Error fetching registration:', error);
      setRegistrationData(null);
    }
  };

  const fetchQuotaInfo = async () => {
    try {
      setRefreshingQuota(true);
      const response = await lakarajaApi.get('/lakaraja/kuota');
      if (response.data.success) {
        // Data dari backend sudah dalam format {SD: {current, max, available, isFull}, ...}
        setQuotaInfo(response.data.data);
        console.log('Kuota updated from server:', response.data.data);
      }
    } catch (error) {
      // Use default quota if API fails
      console.log('Using default quota info:', error.message);
    } finally {
      setRefreshingQuota(false);
    }
  };

  // Helper function to get full URL for uploaded files
  const getFileUrl = (filename) => {
    if (!filename) return '';
    
    // If filename already starts with http, use as is
    if (filename.startsWith('http')) {
      return filename;
    }
    
    // Get base URL without /api suffix for file uploads
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', ''); // Remove /api from base URL
    
    // If filename already includes /uploads/, it's a full path
    if (filename.startsWith('/uploads/')) {
      return `${baseUrl}${filename}`;
    }
    
    // Otherwise, prepend the upload path
    return `${baseUrl}/uploads/lakaraja/${filename}`;
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
        console.log('Registration successful! Data received:', response.data.data);
        console.log('Logo satuan from response:', response.data.data?.logo_satuan);
        toast.success('Pendaftaran berhasil dikirim!');
        setShowRegistrationModal(false);
        setRegistrationData(response.data.data);
        setFormData({ nama_sekolah: '', nama_satuan: '', kategori: '' });
        setLogoFile(null);
        setLogoPreview(null);
        setPaymentFile(null);
        setPaymentPreview(null);
        fetchQuotaInfo();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle team data submission
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    
    if (!teamData.jumlah_pasukan || teamData.jumlah_pasukan < 1 || teamData.jumlah_pasukan > 30) {
      toast.error('Jumlah pasukan harus antara 1-30');
      return;
    }

    if (teamData.member_names.length !== parseInt(teamData.jumlah_pasukan)) {
      toast.error(`Harap isi nama untuk ${teamData.jumlah_pasukan} anggota`);
      return;
    }

    if (fotoAnggotaFiles.length !== parseInt(teamData.jumlah_pasukan)) {
      toast.error(`Harap upload foto untuk ${teamData.jumlah_pasukan} anggota`);
      return;
    }

    if (!fotoTeamFile) {
      toast.error('Foto tim wajib diupload');
      return;
    }

    setSubmittingTeam(true);

    try {
      const submitData = new FormData();
      submitData.append('jumlah_pasukan', teamData.jumlah_pasukan);
      submitData.append('member_names', JSON.stringify(teamData.member_names));
      
      if (suratKeteranganFile) {
        submitData.append('surat_keterangan', suratKeteranganFile);
      }
      
      submitData.append('foto_team', fotoTeamFile);
      
      fotoAnggotaFiles.forEach((file) => {
        submitData.append('foto_anggota', file);
      });

      const response = await lakarajaApi.post('/lakaraja/pendaftaran/team', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Data tim berhasil disimpan!');
        setRegistrationData(response.data.data);
        setTeamData({ jumlah_pasukan: '', member_names: [] });
        setSuratKeteranganFile(null);
        setFotoTeamFile(null);
        setFotoAnggotaFiles([]);
        setFotoAnggotaPreviews([]);
        setActiveTab('home');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data tim');
    } finally {
      setSubmittingTeam(false);
    }
  };

  // Handle jumlah pasukan change
  const handleJumlahPasukanChange = (value) => {
    const jumlah = parseInt(value) || 0;
    setTeamData({
      jumlah_pasukan: value,
      member_names: Array(jumlah).fill(''),
    });
    setFotoAnggotaFiles([]);
    setFotoAnggotaPreviews([]);
  };

  // Handle member name change
  const handleMemberNameChange = (index, value) => {
    const newNames = [...teamData.member_names];
    newNames[index] = value;
    setTeamData({ ...teamData, member_names: newNames });
  };

  // Handle foto anggota change
  const handleFotoAnggotaChange = (index, file) => {
    const newFiles = [...fotoAnggotaFiles];
    newFiles[index] = file;
    setFotoAnggotaFiles(newFiles);

    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...fotoAnggotaPreviews];
        newPreviews[index] = reader.result;
        setFotoAnggotaPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };


  const getStatusInfo = () => {
    if (!registrationData) {
      return { 
        text: 'Belum Mendaftar', 
        color: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        icon: 'fa-circle-xmark',
        description: 'Anda belum melakukan pendaftaran kompetisi'
      };
    }
    
    // Sistem auto-approve: semua pendaftaran langsung terdaftar
    return { 
      text: 'Terdaftar', 
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      icon: 'fa-circle-check',
      description: 'Pendaftaran Anda telah diterima dan terdaftar sebagai peserta'
    };
  };

  const getRegistrationStep = () => {
    if (!registrationData) return 0;
    return 3; // Completed (auto-approve system)
  };

  const handleLogout = () => {
    localStorage.removeItem('lakaraja_token');
    localStorage.removeItem('lakaraja_user');
    toast.success('Logout berhasil');
    navigate('/lakaraja/login');
  };

  const getQuotaPercentage = (kategori) => {
    const quota = quotaInfo[kategori];
    if (!quota || !quota.max) return 0;
    return Math.min((quota.current / quota.max) * 100, 100);
  };

  const getQuotaColor = (kategori) => {
    const percentage = getQuotaPercentage(kategori);
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const isQuotaFull = (kategori) => {
    const quota = quotaInfo[kategori];
    return quota && quota.isFull;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <img src="/logo_lakaraja.png" alt="Lakaraja" className="w-24 h-24 mx-auto mb-6 animate-pulse" />
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // Render different content based on activeTab
  const renderContent = () => {
    // Redirect to home if trying to access registration when already registered
    if (activeTab === 'registration' && registrationData) {
      setActiveTab('home');
      return renderHomeContent();
    }

    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'registration':
        return renderRegistrationContent();
      case 'team':
        return renderTeamContent();
      case 'info':
        return renderInfoContent();
      case 'history':
        return renderHistoryContent();
      case 'profile':
        return renderProfileContent();
      default:
        return renderHomeContent();
    }
  };

  const renderHomeContent = () => (
    <div className="space-y-6">
      {/* Alert: Daftar Ulang - Show if registered but team data not complete */}
      {registrationData && !registrationData.is_team_complete && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 shadow-xl border border-orange-400/20 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="fas fa-exclamation-triangle text-white text-lg"></i>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                <i className="fas fa-clipboard-check"></i>
                Lengkapi Data Tim Anda!
              </h4>
              <p className="text-white/90 text-sm mb-3">
                Satuan Anda sudah terdaftar. Silakan lengkapi data tim dengan mengisi form <strong>Daftar Ulang</strong> untuk melanjutkan.
              </p>
              <button
                onClick={() => setActiveTab('team')}
                className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-white/90 transition-all flex items-center gap-2 text-sm"
              >
                <i className="fas fa-users"></i>
                Isi Daftar Ulang Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert - Show if team data complete */}
      {registrationData && registrationData.is_team_complete && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 shadow-xl border border-green-400/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-check-circle text-white text-lg"></i>
            </div>
            <div>
              <h4 className="text-white font-bold">Data Lengkap!</h4>
              <p className="text-white/90 text-sm">
                Pendaftaran dan data tim Anda sudah lengkap. Terima kasih!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logo Satuan Card - Only show if registered */}
      {registrationData && registrationData.logo_satuan && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={getFileUrl(registrationData.logo_satuan)} 
                alt="Logo Satuan" 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center hidden">
                <i className="fas fa-shield-alt text-white text-3xl"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <i className="fas fa-check text-white text-xs"></i>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-xs mb-1">Logo Satuan</p>
              <h3 className="text-white text-lg font-bold">{registrationData.nama_satuan}</h3>
              <p className="text-white/70 text-sm">{registrationData.nama_sekolah}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${getStatusInfo().color} p-6 shadow-2xl`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <i className={`fas ${getStatusInfo().icon} text-white text-xl`}></i>
              </div>
              <div>
                <p className="text-white/80 text-sm">Status Pendaftaran</p>
                <h3 className="text-white text-xl font-bold">{getStatusInfo().text}</h3>
              </div>
            </div>
          </div>
          
          <p className="text-white/90 text-sm mb-4">{getStatusInfo().description}</p>
          
          {registrationData && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mt-4">
              <p className="text-white/70 text-xs">Kategori</p>
              <p className="text-white font-bold text-lg">{registrationData.kategori}</p>
            </div>
          )}
          
          {!registrationData && (
            <button 
              onClick={() => setShowRegistrationModal(true)}
              className="w-full mt-2 py-3 bg-white text-red-600 font-bold rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus-circle"></i>
              Daftar Sekarang
            </button>
          )}
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-3xl p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <i className="fas fa-calendar-check text-white text-lg"></i>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold leading-tight">Lakaraja 2026</h3>
              <p className="text-white/90 text-xs">Competition Starts In</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { value: countdown.days, label: 'Days', icon: 'fa-calendar-day' },
              { value: countdown.hours, label: 'Hours', icon: 'fa-clock' },
              { value: countdown.minutes, label: 'Min', icon: 'fa-hourglass-half' },
              { value: countdown.seconds, label: 'Sec', icon: 'fa-stopwatch' }
            ].map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-xl p-2 text-center border border-white/20">
                <div className="flex justify-center mb-1">
                  <i className={`fas ${item.icon} text-white/70 text-xs`}></i>
                </div>
                <div className="text-2xl font-bold text-white mb-0.5 font-mono tabular-nums leading-none">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-white/80 text-[10px] font-semibold uppercase tracking-tight leading-tight">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-white/90 text-xs">
            <i className="fas fa-map-marker-alt text-[10px]"></i>
            <span className="font-semibold">January 31, 2026</span>
          </div>
        </div>
      </div>

      {/* Kuota Kategori */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-users text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-bold">Kuota Pendaftaran</h3>
              <p className="text-white/60 text-sm">Sisa kuota per kategori</p>
            </div>
          </div>
          <button
            onClick={fetchQuotaInfo}
            disabled={refreshingQuota}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh kuota"
          >
            <i className={`fas fa-sync-alt text-white/70 group-hover:text-white text-sm transition-all duration-500 ${refreshingQuota ? 'animate-spin' : 'group-hover:rotate-180'}`}></i>
          </button>
        </div>

        <div className="space-y-4">
          {['SD', 'SMP', 'SMA'].map((kat) => {
            const quota = quotaInfo[kat] || { max: 0, current: 0, available: 0, isFull: false };
            const percentage = getQuotaPercentage(kat);
            
            return (
              <div key={kat} className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r ${
                      kat === 'SD' ? 'from-yellow-500 to-amber-500' :
                      kat === 'SMP' ? 'from-cyan-500 to-blue-500' :
                      'from-purple-500 to-pink-500'
                    }`}>
                      <i className={`fas ${
                        kat === 'SD' ? 'fa-child' :
                        kat === 'SMP' ? 'fa-user-graduate' :
                        'fa-graduation-cap'
                      } text-white`}></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Kategori {kat}</p>
                      <p className="text-white/60 text-xs">{quota.current} dari {quota.max} terdaftar</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    quota.isFull 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {quota.isFull ? 'Penuh' : `${quota.available} sisa`}
                  </div>
                </div>
                
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getQuotaColor(kat)} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderInfoContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
            <i className="fas fa-info-circle text-white text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Information</h2>
            <p className="text-white/80 text-sm">Registration Guide & Important Notes</p>
          </div>
        </div>
      </div>

      {/* Langkah Pendaftaran */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <i className="fas fa-list-check text-white"></i>
          </div>
          <div>
            <h3 className="text-white font-bold">Registration Steps</h3>
            <p className="text-white/60 text-sm">Follow these steps</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { step: 1, title: 'Create Account', desc: 'Register and login to Lakaraja system', icon: 'fa-user-plus' },
            { step: 2, title: 'Fill Registration Form', desc: 'Complete school, unit, and category data', icon: 'fa-edit' },
            { step: 3, title: 'Upload Documents', desc: 'Upload unit logo and payment proof', icon: 'fa-cloud-upload-alt' },
            { step: 4, title: 'Complete Team Data', desc: 'Fill team members information', icon: 'fa-users' },
            { step: 5, title: 'Registration Complete', desc: 'Auto-approved, you are registered!', icon: 'fa-check-double' },
          ].map((item) => {
            const currentStep = getRegistrationStep();
            const isCompleted = item.step <= currentStep || (item.step === 1);
            const isActive = item.step === currentStep + 1;
            
            return (
              <div 
                key={item.step}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  isCompleted 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : isActive 
                      ? 'bg-orange-500/10 border border-orange-500/30' 
                      : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                    : isActive 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
                      : 'bg-white/10 text-white/50'
                }`}>
                  {isCompleted ? <i className="fas fa-check"></i> : item.step}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${isCompleted ? 'text-green-400' : isActive ? 'text-orange-400' : 'text-white/60'}`}>
                    {item.title}
                  </h4>
                  <p className={`text-sm ${isCompleted ? 'text-green-400/70' : isActive ? 'text-orange-400/70' : 'text-white/40'}`}>
                    {item.desc}
                  </p>
                </div>
                <i className={`fas ${item.icon} text-xl ${
                  isCompleted ? 'text-green-400' : isActive ? 'text-orange-400' : 'text-white/30'
                }`}></i>
              </div>
            );
          })}
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fas fa-lightbulb text-white text-xl"></i>
          </div>
          <div>
            <h4 className="text-amber-400 font-bold text-lg mb-3">Important Information</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <i className="fas fa-check-circle text-amber-400 mt-0.5"></i>
                <span>Registration system uses <strong>first come, first served</strong></span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <i className="fas fa-check-circle text-amber-400 mt-0.5"></i>
                <span>Registration automatically approved if quota is available</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <i className="fas fa-check-circle text-amber-400 mt-0.5"></i>
                <span>Registration fee: <strong>Rp 650.000</strong> per team</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <i className="fas fa-check-circle text-amber-400 mt-0.5"></i>
                <span>Make sure payment proof is clear and readable</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <i className="fas fa-check-circle text-amber-400 mt-0.5"></i>
                <span>Team data must be completed after initial registration</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <i className="fas fa-check-circle text-amber-400 mt-0.5"></i>
                <span>Event date: <strong>January 31, 2026</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <i className="fas fa-headset text-white"></i>
          </div>
          <div>
            <h3 className="text-white font-bold">Need Help?</h3>
            <p className="text-white/60 text-sm">Contact our support team</p>
          </div>
        </div>
        <div className="space-y-3">
          <a href="https://wa.me/6285161414022" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-green-500/10 hover:bg-green-500/20 rounded-xl border border-green-500/30 transition-all group">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fab fa-whatsapp text-green-400 text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">WhatsApp Support</p>
              <p className="text-white/60 text-sm">+62 851-6141-4022</p>
            </div>
            <i className="fas fa-arrow-right text-green-400"></i>
          </a>
        </div>
      </div>
    </div>
  );

  const renderRegistrationContent = () => (
    <div className="space-y-6">
      {registrationData ? (
        <>
          {/* Registration Detail Card */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <i className="fas fa-clipboard-check text-white text-3xl"></i>
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">Pendaftaran Berhasil!</h3>
                <p className="text-white/80">Anda sudah terdaftar sebagai peserta</p>
              </div>
            </div>
          </div>

          {/* Detail Pendaftaran */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-info-circle text-blue-400"></i>
              Detail Pendaftaran
            </h4>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-white/60 text-sm mb-1">Nama Sekolah</p>
                <p className="text-white font-semibold">{registrationData.nama_sekolah}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-white/60 text-sm mb-1">Nama Satuan</p>
                <p className="text-white font-semibold">{registrationData.nama_satuan}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-white/60 text-sm mb-1">Kategori</p>
                <p className="text-white font-semibold text-lg">{registrationData.kategori}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-white/60 text-sm mb-1">Tanggal Daftar</p>
                <p className="text-white font-semibold">
                  {new Date(registrationData.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-green-500/20 rounded-2xl p-4 border border-green-500/30">
                <p className="text-green-400 text-sm mb-1">Status</p>
                <p className="text-green-400 font-bold flex items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  Terdaftar
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* CTA Register */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-pen-to-square text-white text-4xl"></i>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Belum Mendaftar</h3>
            <p className="text-white/80 mb-6">Daftarkan tim Anda sekarang untuk mengikuti kompetisi Lakaraja 2026!</p>
            <button 
              onClick={() => setShowRegistrationModal(true)}
              className="px-8 py-3 bg-white text-red-600 font-bold rounded-xl hover:bg-white/90 transition-all"
            >
              <i className="fas fa-plus-circle mr-2"></i>
              Mulai Pendaftaran
            </button>
          </div>

          {/* Kuota Info */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <h4 className="text-white font-bold mb-4">Pilih Kategori</h4>
            <div className="space-y-3">
              {['SD', 'SMP', 'SMA'].map((kat) => {
                const quota = quotaInfo[kat] || { max: 0, current: 0, available: 0, isFull: false };
                
                return (
                  <div 
                    key={kat}
                    onClick={() => !quota.isFull && setShowRegistrationModal(true)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      quota.isFull 
                        ? 'bg-red-500/10 border-red-500/30 cursor-not-allowed' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-red-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          kat === 'SD' ? 'bg-yellow-500' :
                          kat === 'SMP' ? 'bg-cyan-500' :
                          'bg-purple-500'
                        }`}>
                          <span className="text-white font-bold">{kat}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">Kategori {kat}</p>
                          <p className="text-white/60 text-sm">{quota.available} kuota tersisa</p>
                        </div>
                      </div>
                      {quota.isFull ? (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">PENUH</span>
                      ) : (
                        <i className="fas fa-chevron-right text-white/50"></i>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderTeamContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
            <i className="fas fa-users text-white text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Daftar Ulang</h2>
            <p className="text-white/80 text-sm">Lengkapi Data Tim Anda</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleTeamSubmit} className="space-y-4">
        {/* Jumlah Pasukan */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-semibold mb-2">
            <i className="fas fa-hashtag text-blue-400 mr-2"></i>
            Jumlah Pasukan
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={teamData.jumlah_pasukan}
            onChange={(e) => handleJumlahPasukanChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all"
            placeholder="Masukkan jumlah anggota tim (1-30)"
            required
          />
          <p className="text-white/50 text-xs mt-2">
            <i className="fas fa-info-circle mr-1"></i>
            Jumlah anggota dalam tim Anda
          </p>
        </div>

        {/* Surat Keterangan */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-semibold mb-2">
            <i className="fas fa-file-alt text-green-400 mr-2"></i>
            Surat Keterangan Sekolah (Opsional)
          </label>
          <div className="relative">
            <input
              ref={suratInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setSuratKeteranganFile(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => suratInputRef.current?.click()}
              className="w-full px-4 py-3 bg-white/5 border border-dashed border-white/30 rounded-xl text-white/70 hover:border-green-400 hover:text-green-400 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-upload"></i>
              {suratKeteranganFile ? suratKeteranganFile.name : 'Upload Surat Keterangan'}
            </button>
          </div>
        </div>

        {/* Foto Team */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-semibold mb-2">
            <i className="fas fa-camera text-purple-400 mr-2"></i>
            Foto Tim <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              ref={fotoTeamInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFotoTeamFile(e.target.files[0])}
              className="hidden"
              required
            />
            <button
              type="button"
              onClick={() => fotoTeamInputRef.current?.click()}
              className="w-full px-4 py-3 bg-white/5 border border-dashed border-white/30 rounded-xl text-white/70 hover:border-purple-400 hover:text-purple-400 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-upload"></i>
              {fotoTeamFile ? fotoTeamFile.name : 'Upload Foto Tim'}
            </button>
          </div>
          <p className="text-white/50 text-xs mt-2">
            <i className="fas fa-info-circle mr-1"></i>
            Foto seluruh anggota tim
          </p>
        </div>

        {/* Data Anggota - Dynamic based on jumlah pasukan */}
        {teamData.jumlah_pasukan && parseInt(teamData.jumlah_pasukan) > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-4">
              <i className="fas fa-user-friends text-orange-400 mr-2"></i>
              Data Anggota Tim ({teamData.member_names.length} orang)
            </h3>
            <div className="space-y-4">
              {teamData.member_names.map((name, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="text-white/70 font-semibold">Anggota {index + 1}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Nama Lengkap</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleMemberNameChange(index, e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all"
                        placeholder={`Nama anggota ${index + 1}`}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Foto Anggota</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFotoAnggotaChange(index, e.target.files[0])}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 transition-all"
                        required
                      />
                      {fotoAnggotaPreviews[index] && (
                        <div className="mt-2">
                          <img
                            src={fotoAnggotaPreviews[index]}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-white/20"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submittingTeam || !teamData.jumlah_pasukan || teamData.member_names.some(n => !n) || fotoAnggotaFiles.length !== parseInt(teamData.jumlah_pasukan) || !fotoTeamFile}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submittingTeam ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Menyimpan...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              Simpan Data Tim
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderHistoryContent = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <i className="fas fa-history text-white"></i>
          </div>
          <div>
            <h3 className="text-white font-bold">Riwayat Aktivitas</h3>
            <p className="text-white/60 text-sm">Aktivitas terbaru Anda</p>
          </div>
        </div>

        {registrationData ? (
          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 bg-green-500/10 rounded-2xl border border-green-500/30">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fas fa-check text-white"></i>
              </div>
              <div className="flex-1">
                <p className="text-green-400 font-semibold">Pendaftaran Berhasil</p>
                <p className="text-white/60 text-sm">Tim {registrationData.nama_satuan} berhasil terdaftar</p>
                <p className="text-white/40 text-xs mt-1">
                  {new Date(registrationData.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/30">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fas fa-user-check text-white"></i>
              </div>
              <div className="flex-1">
                <p className="text-blue-400 font-semibold">Akun Dibuat</p>
                <p className="text-white/60 text-sm">Berhasil membuat akun Lakaraja</p>
                <p className="text-white/40 text-xs mt-1">
                  {new Date(user?.created_at || Date.now()).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-inbox text-white/30 text-3xl"></i>
            </div>
            <p className="text-white/50">Belum ada aktivitas</p>
            <p className="text-white/30 text-sm">Daftar kompetisi untuk memulai</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="space-y-6">
      {/* Profile Card with Logo Satuan */}
      <div className="bg-slate-700/90 rounded-3xl p-6 border border-white/10">
        {/* Header with Logo Satuan */}
        <div className="flex items-start gap-4 mb-6">
          {/* Logo Satuan - if registered, otherwise show icon */}
          <div className="flex-shrink-0">
            {registrationData && registrationData.logo_satuan ? (
              <div className="text-center">
                <img 
                  src={getFileUrl(registrationData.logo_satuan)} 
                  alt="Logo Satuan" 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500/30 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl items-center justify-center hidden">
                  <i className="fas fa-shield-alt text-white text-2xl"></i>
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-xl border border-white/10">
                <i className="fas fa-user text-white/50 text-3xl"></i>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h3 className="text-white text-xl font-bold mb-1">{user?.username}</h3>
            <p className="text-white/60 text-sm mb-2">Peserta Lakaraja 2026</p>
            {registrationData && registrationData.logo_satuan && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-lg mb-2">
                <i className="fas fa-shield-alt"></i>
                Logo Satuan Terverifikasi
              </span>
            )}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              user?.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <i className={`fas ${user?.is_active ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              {user?.is_active ? 'Akun Aktif' : 'Akun Nonaktif'}
            </div>
          </div>
        </div>

        {/* Registration Info - if registered */}
        {registrationData && (
          <div className="bg-white/5 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-building text-orange-400"></i>
              <h4 className="text-white font-semibold">Info Pendaftaran</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-white/50 text-xs mb-1">Sekolah</p>
                <p className="text-white text-sm font-semibold">{registrationData.nama_sekolah}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Satuan</p>
                <p className="text-white text-sm font-semibold">{registrationData.nama_satuan}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Kategori</p>
                <p className="text-white text-sm font-semibold">{registrationData.kategori}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Status</p>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-lg">
                  <i className="fas fa-check-circle"></i>
                  Terdaftar
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Account Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-user text-blue-400"></i>
              </div>
              <div>
                <p className="text-white/50 text-xs">Username</p>
                <p className="text-white font-semibold">{user?.username}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-id-badge text-purple-400"></i>
              </div>
              <div>
                <p className="text-white/50 text-xs">Role</p>
                <p className="text-white font-semibold capitalize">{user?.role || 'Peserta'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-calendar text-green-400"></i>
              </div>
              <div>
                <p className="text-white/50 text-xs">Tanggal Bergabung</p>
                <p className="text-white font-semibold">
                  {new Date(user?.created_at || Date.now()).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 pt-8 pb-24 px-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src="/logo_lakaraja.png" 
                  alt="Logo Lakaraja" 
                  className="w-14 h-14 rounded-2xl shadow-lg bg-white p-1" 
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-red-600 flex items-center justify-center">
                  <i className="fas fa-building text-white text-[8px]"></i>
                </div>
              </div>
              <div>
                <p className="text-white/80 text-sm">Selamat datang,</p>
                <h1 className="text-white text-2xl font-bold">{user?.username}</h1>
                <p className="text-white/60 text-xs">Portal Lakaraja 2026</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <i className="fas fa-sign-out-alt text-white text-lg"></i>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-white/70 text-xs">Status</p>
              <p className="text-white font-bold text-sm">{getStatusInfo().text}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-white/70 text-xs">Kategori</p>
              <p className="text-white font-bold text-sm">{registrationData?.kategori || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-5 -mt-16 pb-24 relative z-10">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 py-2 px-4 z-40">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { id: 'home', icon: 'fa-home', label: 'Home', show: true },
            { id: 'registration', icon: 'fa-clipboard-list', label: 'Daftar', show: !registrationData },
            { id: 'team', icon: 'fa-users', label: 'Daftar Ulang', show: registrationData && !registrationData.is_team_complete },
            { id: 'info', icon: 'fa-info-circle', label: 'Info', show: true },
            { id: 'profile', icon: 'fa-user', label: 'Profil', show: true },
          ]
            .filter(tab => tab.show)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'text-red-500' 
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                <i className={`fas ${tab.icon} text-xl ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`}></i>
                <span className="text-xs font-semibold">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                )}
              </button>
            ))}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto border border-white/10">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 px-5 py-4 border-b border-white/10 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <img src="/logo_lakaraja.png" alt="Lakaraja" className="w-10 h-10 rounded-xl" />
                <h2 className="text-xl font-bold text-white">Form Pendaftaran</h2>
              </div>
              <button 
                onClick={() => setShowRegistrationModal(false)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <i className="fas fa-times text-white"></i>
              </button>
            </div>

            {/* Payment Info Banner */}
            <div className="mx-5 mt-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
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
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  <i className="fas fa-school mr-2 text-red-400"></i>
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  name="nama_sekolah"
                  value={formData.nama_sekolah}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama sekolah"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-500 outline-none transition-all text-white placeholder-white/40"
                  required
                />
              </div>

              {/* Nama Satuan */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  <i className="fas fa-users mr-2 text-red-400"></i>
                  Nama Satuan
                </label>
                <input
                  type="text"
                  name="nama_satuan"
                  value={formData.nama_satuan}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama satuan"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-500 outline-none transition-all text-white placeholder-white/40"
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  <i className="fas fa-layer-group mr-2 text-red-400"></i>
                  Kategori
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['SD', 'SMP', 'SMA'].map((kat) => {
                    const quota = quotaInfo[kat] || { max: 0, current: 0, available: 0, isFull: false };
                    
                    return (
                      <button
                        key={kat}
                        type="button"
                        disabled={quota.isFull}
                        onClick={() => !quota.isFull && setFormData(prev => ({ ...prev, kategori: kat }))}
                        className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all relative ${
                          formData.kategori === kat
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            : quota.isFull
                              ? 'bg-white/5 text-white/30 cursor-not-allowed'
                              : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {kat}
                        <span className={`block text-xs mt-1 ${
                          formData.kategori === kat ? 'text-white/80' : 'text-white/50'
                        }`}>
                          {quota.isFull ? 'Penuh' : `${quota.available} sisa`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Logo */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  <i className="fas fa-image mr-2 text-red-400"></i>
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
                    logoPreview ? 'border-green-500/50 bg-green-500/10' : 'border-white/20 hover:border-red-500/50 hover:bg-red-500/5'
                  }`}
                >
                  {logoPreview ? (
                    <div className="flex items-center gap-4">
                      <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-cover rounded-xl" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-green-400">Logo berhasil diupload</p>
                        <p className="text-xs text-white/50">{logoFile?.name}</p>
                      </div>
                      <i className="fas fa-check-circle text-green-500 text-xl"></i>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-3xl text-white/40 mb-2"></i>
                      <p className="text-sm text-white/60">Klik untuk upload logo</p>
                      <p className="text-xs text-white/40 mt-1">JPG, PNG (Maks. 5MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Upload Bukti Pembayaran */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  <i className="fas fa-receipt mr-2 text-red-400"></i>
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
                    paymentFile ? 'border-green-500/50 bg-green-500/10' : 'border-white/20 hover:border-red-500/50 hover:bg-red-500/5'
                  }`}
                >
                  {paymentFile ? (
                    <div className="flex items-center gap-4">
                      {paymentPreview ? (
                        <img src={paymentPreview} alt="Payment preview" className="w-16 h-16 object-cover rounded-xl" />
                      ) : (
                        <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center">
                          <i className="fas fa-file-pdf text-red-400 text-2xl"></i>
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-green-400">Bukti pembayaran diupload</p>
                        <p className="text-xs text-white/50">{paymentFile?.name}</p>
                      </div>
                      <i className="fas fa-check-circle text-green-500 text-xl"></i>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-3xl text-white/40 mb-2"></i>
                      <p className="text-sm text-white/60">Klik untuk upload bukti pembayaran</p>
                      <p className="text-xs text-white/40 mt-1">JPG, PNG, PDF (Maks. 5MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
