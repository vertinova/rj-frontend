import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setIsLoading(true);

    try {
      const response = await login(formData.username, formData.password);
      const userRole = response?.user?.role || response?.role;
      
      toast.success('Login berhasil! Selamat datang kembali 🎉', {
        duration: 2000,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '16px 24px'
        }
      });

      // Redirect based on user role
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin', { replace: true });
        } else if (userRole === 'user') {
          navigate('/taruna', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 500);

    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login gagal. Silakan coba lagi.';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#fff',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '16px 24px'
        }
      });
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Canvas animation effect
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

    let animationFrameId;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      hexagons.forEach(hexagon => {
        hexagon.avoidMouse();
        hexagon.update();
        hexagon.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
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
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="login-container">
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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Poppins', sans-serif;
          overflow: hidden;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
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

        /* Login Box */
        .login-box {
          position: relative;
          z-index: 10;
          width: 450px;
          max-width: 90%;
          padding: 50px 45px;
          background: rgba(10, 10, 26, 0.8);
          backdrop-filter: blur(30px) saturate(180%);
          -webkit-backdrop-filter: blur(30px) saturate(180%);
          border-radius: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7),
                      0 0 0 1px rgba(255, 255, 255, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

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

        /* Animated Border */
        .login-box::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 30px;
          padding: 2px;
          background: linear-gradient(135deg, 
            rgba(243, 156, 18, 0.6) 0%,
            rgba(230, 126, 34, 0.6) 25%,
            rgba(155, 89, 182, 0.6) 50%,
            rgba(52, 152, 219, 0.6) 75%,
            rgba(243, 156, 18, 0.6) 100%);
          background-size: 200% 200%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: borderGlow 3s linear infinite;
        }

        @keyframes borderGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Logo & Title */
        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 20px;
        }

        .logo-wrapper::before {
          content: '';
          position: absolute;
          inset: -10px;
          background: linear-gradient(135deg, #f39c12, #e67e22);
          border-radius: 50%;
          opacity: 0.3;
          filter: blur(20px);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }

        .logo-img {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 3px solid rgba(243, 156, 18, 0.5);
          padding: 5px;
          background: rgba(255, 255, 255, 0.05);
          transition: transform 0.3s ease;
        }

        .logo-img:hover {
          transform: scale(1.05) rotate(5deg);
        }

        .login-title {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #d35400 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientText 3s ease infinite;
          margin-bottom: 10px;
          letter-spacing: 1px;
        }

        @keyframes gradientText {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .login-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
          font-weight: 400;
        }

        /* Error Alert */
        .error-alert {
          background: rgba(231, 76, 60, 0.15);
          border: 1px solid rgba(231, 76, 60, 0.5);
          color: #ff6b6b;
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 25px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        /* Form Styles */
        .form-group {
          position: relative;
          margin-bottom: 25px;
        }

        .form-label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 8px;
          margin-left: 5px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          font-size: 1.1rem;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .form-input {
          width: 100%;
          padding: 16px 18px 16px 50px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(243, 156, 18, 0.6);
          box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.15),
                      0 8px 20px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }

        .form-input:focus + .input-icon {
          color: #f39c12;
          transform: translateY(-50%) scale(1.1);
        }

        .form-input.error {
          border-color: rgba(231, 76, 60, 0.6);
          background: rgba(231, 76, 60, 0.05);
        }

        .error-message {
          color: #ff6b6b;
          font-size: 0.85rem;
          margin-top: 6px;
          margin-left: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .password-toggle {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          z-index: 2;
          padding: 5px;
        }

        .password-toggle:hover {
          color: #f39c12;
          transform: translateY(-50%) scale(1.1);
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          border: none;
          border-radius: 14px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(243, 156, 18, 0.6);
        }

        .submit-btn:active {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .submit-btn:disabled:hover {
          transform: none;
          box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);
        }

        /* Loading Spinner */
        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Register Link */
        .register-link {
          text-align: center;
          margin-top: 30px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
        }

        .register-link a {
          color: #f39c12;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
        }

        .register-link a::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #f39c12, #e67e22);
          transition: width 0.3s ease;
        }

        .register-link a:hover {
          color: #e67e22;
        }

        .register-link a:hover::after {
          width: 100%;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .login-box {
            padding: 40px 30px;
            width: 95%;
          }

          .login-title {
            font-size: 2rem;
          }

          .logo-img {
            width: 80px;
            height: 80px;
          }
        }

        @media (max-width: 480px) {
          .login-box {
            padding: 35px 25px;
          }

          .login-title {
            font-size: 1.75rem;
          }

          .form-input {
            padding: 14px 16px 14px 45px;
            font-size: 0.95rem;
          }

          .submit-btn {
            padding: 14px;
            font-size: 1rem;
          }
        }
      `}</style>
      
      {/* Floating Stars */}
      <div className="stars">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Login Box */}
      <div className="login-box">
        {/* Header */}
        <div className="login-header">
          <div className="logo-wrapper">
            <img src="/assets/images/logo_rj.png" alt="Logo Paskibra Rajawali" className="logo-img" />
          </div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Paskibra Rajawali MAN 1 Kabupaten Bogor</p>
        </div>

        {/* Error Alert */}
        {errors.general && (
          <div className="error-alert">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errors.general}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrapper">
              <i className="fas fa-user input-icon"></i>
              <input
                type="text"
                name="username"
                placeholder="Masukkan username anda"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                autoComplete="username"
              />
            </div>
            {errors.username && (
              <div className="error-message">
                <i className="fas fa-info-circle"></i>
                <span>{errors.username}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <i className="fas fa-lock input-icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Masukkan password anda"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                autoComplete="current-password"
                style={{ paddingRight: '50px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && (
              <div className="error-message">
                <i className="fas fa-info-circle"></i>
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Memproses...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
                Masuk Sekarang
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="register-link">
          Belum punya akun? <Link to="/register">Daftar Sekarang</Link>
        </div>

        {/* Back to Home Link */}
        <div className="back-to-home" style={{ marginTop: '15px', position: 'relative', zIndex: 10 }}>
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

      {/* Font Awesome */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" 
      />
    </div>
  );
}

export default Login;
