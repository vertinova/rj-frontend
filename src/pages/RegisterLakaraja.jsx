import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const RegisterLakaraja = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    no_telepon: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [quotaAvailable, setQuotaAvailable] = useState(true);
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [checkingQuota, setCheckingQuota] = useState(true);

  // Check quota availability on component mount
  useEffect(() => {
    checkQuotaAvailability();
  }, []);

  const checkQuotaAvailability = async () => {
    try {
      setCheckingQuota(true);
      const response = await api.get('/lakaraja/kuota/check');
      if (response.data.success) {
        setQuotaAvailable(response.data.data.hasAvailableSpots);
        setQuotaInfo(response.data.data.kuota);
      }
    } catch (error) {
      console.error('Error checking quota:', error);
      // If error, allow registration (fail-safe)
      setQuotaAvailable(true);
    } finally {
      setCheckingQuota(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validasi
    let newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    }
    if (!formData.no_telepon.trim()) {
      newErrors.no_telepon = 'Nomor telepon harus diisi';
    }
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Password tidak cocok';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/lakaraja/register', {
        username: formData.username,
        no_telepon: formData.no_telepon,
        password: formData.password
      });

      toast.success('Registrasi berhasil! Silakan login untuk melanjutkan pendaftaran kompetisi.', {
        duration: 4000
      });
      navigate('/lakaraja/login');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Pendaftaran gagal. Silakan coba lagi.';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-10 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-orange-500 transition-all mb-6 group"
        >
          <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Card */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-500/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full mb-4">
              <i className="fas fa-user-plus text-4xl text-orange-500"></i>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent mb-2">
              Buat Akun Lakaraja
            </h1>
            <p className="text-white/60">
              Daftar untuk mengikuti kompetisi Lakaraja 2026
            </p>
            <div className="mt-4 h-1 w-20 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto"></div>
          </div>

          {/* Loading Check Quota */}
          {checkingQuota && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-white/60 text-sm">Memeriksa ketersediaan kuota...</p>
            </div>
          )}

          {/* Quota Full Message */}
          {!checkingQuota && !quotaAvailable && (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-3"></i>
                <h3 className="text-lg font-bold text-red-400 mb-2">Pendaftaran Ditutup</h3>
                <p className="text-white/70 text-sm mb-4">
                  Maaf, kuota untuk semua kategori sudah penuh.
                </p>
                {quotaInfo && (
                  <div className="space-y-2 mb-4">
                    {Object.entries(quotaInfo).map(([kategori, info]) => (
                      <div key={kategori} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-white/80 font-semibold">{kategori}</span>
                        <span className="text-red-400 text-sm font-bold">
                          {info.current}/{info.max} (PENUH)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link
                to="/lakaraja/login"
                className="block w-full py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-semibold rounded-xl transition-all text-center"
              >
                Sudah Punya Akun? Login
              </Link>
              <Link
                to="/"
                className="block w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 font-semibold rounded-xl transition-all text-center"
              >
                Kembali ke Beranda
              </Link>
            </div>
          )}

          {/* Form - Only show if quota available */}
          {!checkingQuota && quotaAvailable && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

            {/* Username */}
            <div>
              <label className="block text-white/80 font-semibold mb-2 text-sm">
                <i className="fas fa-user mr-2 text-orange-500"></i>
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="Minimal 3 karakter"
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* No Telepon */}
            <div>
              <label className="block text-white/80 font-semibold mb-2 text-sm">
                <i className="fas fa-phone mr-2 text-orange-500"></i>
                No. Telepon *
              </label>
              <input
                type="tel"
                name="no_telepon"
                value={formData.no_telepon}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="08xxxxxxxxxx"
              />
              {errors.no_telepon && (
                <p className="text-red-400 text-xs mt-1">{errors.no_telepon}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/80 font-semibold mb-2 text-sm">
                <i className="fas fa-lock mr-2 text-orange-500"></i>
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="Minimal 6 karakter"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white/80 font-semibold mb-2 text-sm">
                <i className="fas fa-lock mr-2 text-orange-500"></i>
                Konfirmasi Password *
              </label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="Ulangi password"
              />
              {errors.confirm_password && (
                <p className="text-red-400 text-xs mt-1">{errors.confirm_password}</p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <i className="fas fa-info-circle text-orange-500 text-lg mt-0.5"></i>
                <div className="text-xs text-white/70">
                  <p className="font-semibold text-orange-500 mb-1">Langkah Selanjutnya:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Buat akun terlebih dahulu</li>
                    <li>Login ke dashboard Lakaraja</li>
                    <li>Isi form pendaftaran kompetisi</li>
                    <li>Upload logo satuan & bukti payment</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-user-plus"></i>
                  Buat Akun
                </span>
              )}
            </button>

            {/* Link to Login */}
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Sudah punya akun?{' '}
                <Link to="/lakaraja/login" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                  Login di sini
                </Link>
              </p>
            </div>
          </form>
          )}
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

export default RegisterLakaraja;
