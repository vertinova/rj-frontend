import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const PanitiaDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

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

    setUser(parsedUser);
    loadStatistics();
  }, [navigate]);

  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('lakaraja_token');
      const response = await api.get('/lakaraja/panitia/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
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
      <nav className="bg-gradient-to-r from-zinc-900 to-black border-b border-orange-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <i className="fas fa-shield-alt text-orange-500 text-2xl"></i>
              <div>
                <h1 className="text-white font-bold text-xl">Lakaraja 2026</h1>
                <p className="text-white/60 text-sm">Dashboard Panitia</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <i className="fas fa-user-shield text-white text-2xl"></i>
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold">Selamat Datang, Panitia!</h2>
              <p className="text-white/60">@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-users text-blue-400 text-3xl"></i>
              <span className="text-blue-400 text-xs font-semibold bg-blue-500/20 px-2 py-1 rounded">Total</span>
            </div>
            <h3 className="text-white text-3xl font-bold mb-1">{stats?.totalUsers || 0}</h3>
            <p className="text-white/60 text-sm">Total Pengguna</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-check-circle text-green-400 text-3xl"></i>
              <span className="text-green-400 text-xs font-semibold bg-green-500/20 px-2 py-1 rounded">Aktif</span>
            </div>
            <h3 className="text-white text-3xl font-bold mb-1">{stats?.activeUsers || 0}</h3>
            <p className="text-white/60 text-sm">Pengguna Aktif</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-file-alt text-orange-400 text-3xl"></i>
              <span className="text-orange-400 text-xs font-semibold bg-orange-500/20 px-2 py-1 rounded">Pending</span>
            </div>
            <h3 className="text-white text-3xl font-bold mb-1">{stats?.pendingRegistrations || 0}</h3>
            <p className="text-white/60 text-sm">Pendaftaran Pending</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-trophy text-purple-400 text-3xl"></i>
              <span className="text-purple-400 text-xs font-semibold bg-purple-500/20 px-2 py-1 rounded">Approved</span>
            </div>
            <h3 className="text-white text-3xl font-bold mb-1">{stats?.approvedRegistrations || 0}</h3>
            <p className="text-white/60 text-sm">Pendaftaran Disetujui</p>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
                <i className="fas fa-users text-blue-400 text-xl"></i>
              </div>
              <h3 className="text-white text-xl font-bold">Kelola Pengguna</h3>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Lihat, edit, dan kelola semua pengguna Lakaraja yang terdaftar
            </p>
            <button className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all">
              <i className="fas fa-arrow-right mr-2"></i>
              Buka Menu
            </button>
          </div>

          <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-all">
                <i className="fas fa-clipboard-list text-orange-400 text-xl"></i>
              </div>
              <h3 className="text-white text-xl font-bold">Kelola Pendaftaran</h3>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Review dan verifikasi pendaftaran kompetisi dari peserta
            </p>
            <button className="w-full py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all">
              <i className="fas fa-arrow-right mr-2"></i>
              Buka Menu
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <i className="fas fa-info-circle text-orange-400 text-xl mt-1"></i>
            <div>
              <h4 className="text-orange-400 font-bold mb-2">Info Panel Panitia</h4>
              <p className="text-white/70 text-sm">
                Anda memiliki akses penuh untuk mengelola pengguna dan pendaftaran kompetisi Lakaraja 2026.
                Pastikan untuk memverifikasi setiap pendaftaran dengan teliti.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Font Awesome */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" 
      />
    </div>
  );
};

export default PanitiaDashboard;
