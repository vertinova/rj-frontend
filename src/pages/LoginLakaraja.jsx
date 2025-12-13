import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const LoginLakaraja = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    }
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Mohon lengkapi semua field');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/lakaraja/login', {
        username: formData.username,
        password: formData.password
      });

      console.log('Login response:', response.data);

      const { token, user } = response.data.data;

      console.log('Token:', token);
      console.log('User:', user);

      // Store token dengan namespace lakaraja
      localStorage.setItem('lakaraja_token', token);
      localStorage.setItem('lakaraja_user', JSON.stringify(user));

      toast.success('Login berhasil!');

      console.log('User role:', user.role);
      console.log('Redirecting to:', user.role === 'panitia' ? '/lakaraja/panitia' : '/lakaraja/dashboard');

      // Redirect based on role
      if (user.role === 'panitia') {
        navigate('/lakaraja/panitia');
      } else {
        navigate('/lakaraja/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login gagal. Silakan coba lagi.';
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

          {/* Form */}
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
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="Masukkan username"
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="Masukkan password"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
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
                  <i className="fas fa-sign-in-alt"></i>
                  Masuk
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Belum punya akun?{' '}
              <Link to="/lakaraja/register" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                Daftar di sini
              </Link>
            </p>
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
