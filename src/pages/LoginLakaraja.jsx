import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginLakaraja = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const errorTimeoutRef = useRef(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    console.log('=== BUTTON CLICKED - LOGIN START ===');
    
    // Prevent double submission
    if (isLoading) {
      console.log('Already loading, preventing double submit');
      return;
    }
    
    console.log('Starting login process...');
    
    // Clear any existing error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    // Validasi
    let validationErrors = {};
    if (!formData.username.trim()) {
      validationErrors.username = 'Username harus diisi';
      validationErrors.general = 'Username harus diisi';
    }
    if (!formData.password) {
      validationErrors.password = 'Password harus diisi';
      if (!validationErrors.general) {
        validationErrors.general = 'Password harus diisi';
      } else {
        validationErrors.general = 'Username dan password harus diisi';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Removed toast notification - only show error message in UI
      
      // Auto-clear validation errors after 15 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setErrors({});
      }, 15000);
      
      return;
    }

    // Clear previous errors before attempting login
    setErrors({});
    setIsLoading(true);

    try {
      const response = await api.post('/lakaraja/login', {
        username: formData.username,
        password: formData.password
      });

      const { token, user } = response.data.data;

      // Store token dengan namespace lakaraja
      localStorage.setItem('lakaraja_token', token);
      localStorage.setItem('lakaraja_user', JSON.stringify(user));

      // Removed success toast - directly redirect
      
      // Redirect based on role
      if (user.role === 'panitia') {
        navigate('/lakaraja/panitia');
      } else {
        navigate('/lakaraja/dashboard');
      }
    } catch (error) {
      console.error('=== LOGIN ERROR ===');
      console.error('Login error:', error);
      console.log('Page should NOT refresh now');
      
      let errorMessage = 'Login gagal. Silakan coba lagi.';
      let errorObj = { general: errorMessage };
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;
        
        console.log('Error status:', status);
        console.log('Error message:', message);
        
        if (status === 401) {
          errorMessage = 'Username atau password yang Anda masukkan salah. Silakan periksa kembali dan coba lagi.';
          errorObj = { 
            general: errorMessage,
            username: 'Kredensial salah',
            password: 'Kredensial salah'
          };
        } else if (status === 403) {
          errorMessage = 'Akun Anda tidak aktif. Silakan hubungi panitia untuk mengaktifkan akun.';
          errorObj = { general: errorMessage };
        } else if (status === 500) {
          errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa saat.';
          errorObj = { general: errorMessage };
        } else {
          errorMessage = message || errorMessage;
          errorObj = { general: errorMessage };
        }
      } else if (error.request) {
        console.log('Network error - no response received');
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil.';
        errorObj = { general: errorMessage };
      } else {
        console.log('Other error:', error.message);
        errorMessage = error.message || errorMessage;
        errorObj = { general: errorMessage };
      }
      
      console.log('Setting errors:', errorObj);
      
      // Set error state
      setErrors(errorObj);
      
      console.log('Error set - no toast notification');
      
      // Removed toast notification - only show error in UI
      
      console.log('Setting timeout for auto-clear...');
      
      // Auto-clear errors after 15 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setErrors({});
      }, 15000);
      
      console.log('=== ERROR HANDLING COMPLETE ===');
    } finally {
      setIsLoading(false);
      console.log('isLoading set to false');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-10 px-4 relative overflow-hidden">
      {/* CSS for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
      `}</style>

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
              <i className="fas fa-trophy text-4xl text-orange-500"></i>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent mb-2">
              Login Lakaraja
            </h1>
            <p className="text-white/60">
              Masuk ke akun Lakaraja Anda
            </p>
            <div className="mt-4 h-1 w-20 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto"></div>
          </div>

          {/* Form - Changed to div to prevent auto refresh */}
          <div className="space-y-5">
            {/* Error Alert */}
            {errors.general && (
              <div 
                className="bg-red-500/20 border-2 border-red-500/50 rounded-xl overflow-hidden shadow-lg shadow-red-500/20"
                style={{
                  animation: 'shake 0.6s ease-in-out'
                }}
              >
                <div className="flex items-start gap-3 px-5 py-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-500/30 rounded-full flex items-center justify-center">
                      <i className="fas fa-exclamation-circle text-red-400 text-xl"></i>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-400 font-bold text-base mb-2">⚠️ Login Gagal</p>
                    <p className="text-red-200 text-sm leading-relaxed font-medium">{errors.general}</p>
                    <p className="text-red-300/70 text-xs mt-2 italic">Pesan ini akan hilang dalam 15 detik</p>
                  </div>
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-white/80 font-semibold mb-2 text-sm">
                <i className="fas fa-user mr-2 text-orange-500"></i>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSubmit();
                  }
                }}
                className={`w-full px-4 py-3 bg-white/5 border ${errors.username ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all`}
                placeholder="Masukkan username"
                autoComplete="username"
                disabled={isLoading}
              />
              {errors.username && !errors.general && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <i className="fas fa-times-circle"></i>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/80 font-semibold mb-2 text-sm">
                <i className="fas fa-lock mr-2 text-orange-500"></i>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSubmit();
                  }
                }}
                className={`w-full px-4 py-3 bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all`}
                placeholder="Masukkan password"
                autoComplete="current-password"
                disabled={isLoading}
              />
              {errors.password && !errors.general && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <i className="fas fa-times-circle"></i>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a 
                href="https://wa.me/6285161414022?text=Halo%20Panitia%20Lakaraja,%20saya%20ingin%20reset%20password%20akun%20saya.%0A%0AUsername:%20%0ANama:%20%0ASekolah:%20"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 text-sm font-semibold transition-all group"
              >
                <i className="fas fa-question-circle group-hover:rotate-12 transition-transform"></i>
                <span className="border-b border-transparent group-hover:border-orange-400">Lupa Password?</span>
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
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
                  <i className="fas fa-sign-in-alt"></i>
                  Masuk
                </span>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 space-y-4">
            {/* Register Link */}
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Belum punya akun?{' '}
                <Link to="/lakaraja/register" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                  Daftar di sini
                </Link>
              </p>
            </div>

            {/* Help Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-info-circle text-blue-400"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-blue-300 text-xs font-semibold mb-1">💡 Lupa Password?</p>
                  <p className="text-blue-200/80 text-xs leading-relaxed">
                    Hubungi panitia melalui WhatsApp untuk reset password. Siapkan username dan data diri Anda untuk verifikasi.
                  </p>
                </div>
              </div>
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

export default LoginLakaraja;
