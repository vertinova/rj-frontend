import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const canvasRef = useRef(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const hexagons = [];
    const hexagonCount = 12;
    let mouseX = -1000;
    let mouseY = -1000;
    const avoidRadius = 150;

    class Hexagon {
      constructor() {
        this.reset();
        this.targetX = this.x;
        this.targetY = this.y;
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 30 + 15;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.008;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.2 + 0.1;
        this.targetX = this.x;
        this.targetY = this.y;
      }
      
      avoidMouse() {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < avoidRadius) {
          const pushForce = (avoidRadius - distance) / avoidRadius;
          const angle = Math.atan2(dy, dx);
          this.targetX = this.x + Math.cos(angle) * pushForce * 80;
          this.targetY = this.y + Math.sin(angle) * pushForce * 80;
        } else {
          this.targetX = this.x + this.vx * 2;
          this.targetY = this.y + this.vy * 2;
        }
      }
      
      update() {
        this.x += (this.targetX - this.x) * 0.05;
        this.y += (this.targetY - this.y) * 0.05;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
      }
      
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = this.size * Math.cos(angle);
          const y = this.size * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(243, 156, 18, ${this.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.restore();
      }
    }

    for (let i = 0; i < hexagonCount; i++) {
      hexagons.push(new Hexagon());
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      hexagons.forEach(hexagon => {
        hexagon.avoidMouse();
        hexagon.update();
        hexagon.draw();
      });
      
      requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // Validasi client-side
    let newErrors = {}
    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }
    if (!formData.password) {
      newErrors.password = 'Password harus diisi'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter'
    }
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Konfirmasi password harus diisi'
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Password tidak cocok'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      await register(formData.username, formData.email, formData.password)
      toast.success('Registrasi berhasil! Silakan login.')
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Registrasi gagal. Silakan coba lagi.'
      toast.error(errorMessage)
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-page">
      {/* Advanced Animated Background */}
      <div className="animated-background">
        <div className="mesh-gradient"></div>
        <div className="floating-hexagons"></div>
        <div className="glow-orbs"></div>
      </div>
      
      {/* Optimized Interactive Hexagon Canvas */}
      <canvas 
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'all'
        }}
      />
      
      <style>{`
        /* Advanced Animated Background with Particles */
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 20px 0;
        }

        /* Optimized Animated Background - Lightweight */
        .animated-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
          background: #000000;
        }

        /* Simplified Mesh Gradient */
        .mesh-gradient {
          position: absolute;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(243, 156, 18, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(155, 89, 182, 0.06) 0%, transparent 50%);
          animation: meshMove 15s ease-in-out infinite;
        }

        @keyframes meshMove {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        /* Simplified Glow Orbs */
        .glow-orbs::before {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(243, 156, 18, 0.15) 0%, transparent 70%);
          top: -250px;
          right: -250px;
          filter: blur(80px);
          animation: orbFloat 20s ease-in-out infinite;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-100px, 100px); }
        }
      `}</style>
      
      <div className="register-container w-full h-full flex items-center justify-center py-5" style={{ perspective: '1000px', position: 'relative', zIndex: 10 }}>
        <div className="register-box bg-white/90 p-10 rounded-[20px] shadow-[0_15px_30px_rgba(0,0,0,0.2)] w-[400px] max-w-[90%] text-center backdrop-blur-[8px] border border-white/30 transition-all duration-300 hover:transform hover:translate-y-[-5px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] my-5" style={{
          background: 'rgba(10, 10, 26, 0.85)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          animation: 'fadeInScale 0.6s ease'
        }}>
          <style>{`
            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.9) translateY(20px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>
          <div className="logo mb-8">
            <img src="/assets/images/logo_rj.png" alt="Logo" className="max-w-[100px] mx-auto mb-4" />
            <h2 className="text-4xl mb-2 font-bold" style={{ 
              background: 'linear-gradient(135deg, #f39c12, #e67e22)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Daftar</h2>
            <p className="text-base mb-0" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Paskibra Rajawali MAN 1 Kabupaten Bogor
            </p>
          </div>

          {errors.general && (
            <div className="alert error p-3 rounded-lg mb-5 text-sm text-left" style={{
              background: 'rgba(231, 76, 60, 0.2)',
              border: '1px solid #e74c3c',
              color: '#e74c3c'
            }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={`input-group relative mb-6 ${errors.username ? 'has-error' : ''}`}>
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors" style={{ color: 'rgba(255, 255, 255, 0.5)' }}></i>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full py-3 px-4 pl-12 rounded-[10px] text-base outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: errors.username ? '1px solid #e74c3c' : '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f39c12';
                  e.target.style.boxShadow = '0 0 0 3px rgba(243, 156, 18, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.username ? '#e74c3c' : 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.username && (
                <span className="help-block text-sm mt-1 block text-left pl-12" style={{ color: '#e74c3c' }}>
                  {errors.username}
                </span>
              )}
            </div>

            <div className={`input-group relative mb-6 ${errors.email ? 'has-error' : ''}`}>
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors" style={{ color: 'rgba(255, 255, 255, 0.5)' }}></i>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full py-3 px-4 pl-12 rounded-[10px] text-base outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: errors.email ? '1px solid #e74c3c' : '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f39c12';
                  e.target.style.boxShadow = '0 0 0 3px rgba(243, 156, 18, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email ? '#e74c3c' : 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.email && (
                <span className="help-block text-sm mt-1 block text-left pl-12" style={{ color: '#e74c3c' }}>
                  {errors.email}
                </span>
              )}
            </div>

            <div className={`input-group relative mb-6 ${errors.password ? 'has-error' : ''}`}>
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors" style={{ color: 'rgba(255, 255, 255, 0.5)' }}></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full py-3 px-4 pl-12 rounded-[10px] text-base outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: errors.password ? '1px solid #e74c3c' : '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f39c12';
                  e.target.style.boxShadow = '0 0 0 3px rgba(243, 156, 18, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password ? '#e74c3c' : 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.password && (
                <span className="help-block text-sm mt-1 block text-left pl-12" style={{ color: '#e74c3c' }}>
                  {errors.password}
                </span>
              )}
            </div>

            <div className={`input-group relative mb-6 ${errors.confirm_password ? 'has-error' : ''}`}>
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors" style={{ color: 'rgba(255, 255, 255, 0.5)' }}></i>
              <input
                type="password"
                name="confirm_password"
                placeholder="Konfirmasi Password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full py-3 px-4 pl-12 rounded-[10px] text-base outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: errors.confirm_password ? '1px solid #e74c3c' : '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f39c12';
                  e.target.style.boxShadow = '0 0 0 3px rgba(243, 156, 18, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.confirm_password ? '#e74c3c' : 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.confirm_password && (
                <span className="help-block text-[#e74c3c] text-sm mt-1 block text-left pl-12">
                  {errors.confirm_password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-register w-full py-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white border-none rounded-[10px] text-xl font-semibold cursor-pointer transition-all tracking-wider shadow-[0_5px_15px_rgba(46,204,113,0.3)] hover:bg-gradient-to-r hover:from-[#27ae60] hover:to-[#2ecc71] hover:shadow-[0_8px_20px_rgba(46,204,113,0.4)] hover:transform hover:translate-y-[-2px] active:transform active:translate-y-0 active:shadow-[0_3px_10px_rgba(46,204,113,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <div className="login-link mt-8 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Sudah punya akun? <Link to="/login" className="no-underline font-semibold transition-colors hover:underline" style={{ color: '#f39c12' }}>Login di sini</Link>
          </div>

          {/* Back to Home Link */}
          <div className="back-to-home mt-4" style={{ position: 'relative', zIndex: 10 }}>
            <Link 
              to="/" 
              className="back-home-link"
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#f39c12';
                e.target.style.transform = 'translateX(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <i className="fas fa-arrow-left"></i>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>

      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" 
      />
    </div>
  );
};

export default Register;

