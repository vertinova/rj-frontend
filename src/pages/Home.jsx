import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRef, useState, useEffect } from 'react';

const Home = () => {
  const { user } = useAuth();
  const navbarRef = useRef(null);
  const profileRef = useRef(null);
  const canvasRef = useRef(null);

  const [activeSection, setActiveSection] = useState('home');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryFilter, setGalleryFilter] = useState('all');
  const [isPWA, setIsPWA] = useState(false);

  // Interactive Hexagon Animation
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
          // Calculate push direction
          const pushForce = (avoidRadius - distance) / avoidRadius;
          const angle = Math.atan2(dy, dx);
          this.targetX = this.x + Math.cos(angle) * pushForce * 80;
          this.targetY = this.y + Math.sin(angle) * pushForce * 80;
        } else {
          // Return to original path
          this.targetX = this.x + this.vx * 2;
          this.targetY = this.y + this.vy * 2;
        }
      }
      
      update() {
        // Smooth movement to target
        this.x += (this.targetX - this.x) * 0.05;
        this.y += (this.targetY - this.y) * 0.05;
        
        // Normal movement
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        
        // Wrap around edges
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
      }
      
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw hexagon
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

    // Initialize hexagons
    for (let i = 0; i < hexagonCount; i++) {
      hexagons.push(new Hexagon());
    }

    // Mouse tracking
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

  // PWA Install Handler
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed (running as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone ||
                         document.referrer.includes('android-app://');
    
    if (isStandalone) {
      setShowInstallButton(false);
      setIsPWA(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  // Initialize profile position on mount
  useEffect(() => {
    const initProfilePosition = () => {
      const navbar = navbarRef.current;
      const profile = profileRef.current;
      const firstLink = navbar?.querySelector('a');
      
      if (!navbar || !profile || !firstLink) return;
      
      const navbarRect = navbar.getBoundingClientRect();
      const linkRect = firstLink.getBoundingClientRect();
      const navbarLeft = navbarRect.left;
      const linkCenter = linkRect.left + (linkRect.width / 2);
      const profileHalfWidth = profile.clientWidth / 2;
      const initialLeft = linkCenter - navbarLeft - profileHalfWidth;
      
      profile.style.left = `${initialLeft}px`;
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initProfilePosition, 100);
    
    // Re-calculate on window resize
    window.addEventListener('resize', initProfilePosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initProfilePosition);
    };
  }, []);

  const moveProfile = (e, href) => {
    e.preventDefault();
    const navbar = navbarRef.current;
    const profile = profileRef.current;
    const clickedLink = e.currentTarget;
    
    if (!navbar || !profile || !clickedLink) return;
    
    // Get positions
    const navbarRect = navbar.getBoundingClientRect();
    const linkRect = clickedLink.getBoundingClientRect();
    
    // Calculate new position (center of clicked link)
    const navbarLeft = navbarRect.left;
    const linkCenter = linkRect.left + (linkRect.width / 2);
    const profileHalfWidth = profile.clientWidth / 2;
    
    // Position relative to navbar
    const newLeft = linkCenter - navbarLeft - profileHalfWidth;
    
    // Apply smooth transition
    profile.style.left = `${newLeft}px`;
    
    // Add pulse effect to navbar
    navbar.classList.add('active');
    setTimeout(() => navbar.classList.remove('active'), 500);
    
    // Smooth scroll to section
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      setActiveSection(targetId);
      
      // Offset for fixed navbar
      const navbarHeight = navbar.offsetHeight;
      const targetPosition = targetElement.offsetTop - navbarHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: '#0a0a0a', color: 'white', fontFamily: 'Poppins, sans-serif', overflow: 'hidden', position: 'relative' }}>
      {/* Advanced Animated Background */}
      <div className="animated-background"></div>
      
      {/* Interactive Hexagon Canvas */}
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

        .animated-background::before {
          content: '';
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

        .animated-background::after {
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

        /* Mesh Gradient Overlay */
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 30%, rgba(243, 156, 18, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(155, 89, 182, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(52, 152, 219, 0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }

        /* Animated Grid Pattern */
        body::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(243, 156, 18, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(243, 156, 18, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
          pointer-events: none;
          z-index: 1;
          opacity: 0.5;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        /* Noise Texture */
        body {
          position: relative;
        }

        body::before {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
        }

        /* Navbar Styles - Modern & Advanced */
        .navbar {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 600px;
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(25px) saturate(180%);
          -webkit-backdrop-filter: blur(25px) saturate(180%);
          padding: 18px 30px;
          padding-left: 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 9999;
          border-radius: 25px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5),
                      0 0 0 1px rgba(243, 156, 18, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1),
                      0 0 50px rgba(243, 156, 18, 0.05);
          overflow: visible;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .navbar::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 2px;
          background: linear-gradient(135deg, 
            rgba(243, 156, 18, 0.3) 0%,
            rgba(230, 126, 34, 0.3) 25%,
            rgba(155, 89, 182, 0.3) 50%,
            rgba(230, 126, 34, 0.3) 75%,
            rgba(243, 156, 18, 0.3) 100%);
          background-size: 200% 200%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: borderGlow 3s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .navbar:hover::before {
          opacity: 1;
        }

        @keyframes borderGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .navbar.active {
          transform: translateX(-50%) scale(1.02);
          box-shadow: 0 12px 40px rgba(243, 156, 18, 0.4),
                      0 0 0 1px rgba(243, 156, 18, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .navbar ul {
          display: flex;
          list-style: none;
          gap: 10px;
          margin: 0;
          padding: 0;
          align-items: center;
          width: 100%;
          justify-content: space-around;
        }

        .navbar ul li {
          position: relative;
        }

        .navbar a {
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 20px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
          padding: 10px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
        }

        .navbar a::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, 
            rgba(243, 156, 18, 0.2) 0%,
            rgba(230, 126, 34, 0.2) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .navbar a:hover::before {
          opacity: 1;
        }

        .navbar a:hover {
          color: #f39c12;
          transform: translateY(-3px);
          text-shadow: 0 0 20px rgba(243, 156, 18, 0.8),
                       0 0 30px rgba(243, 156, 18, 0.4);
        }

        .navbar a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f39c12, transparent);
          transition: transform 0.3s ease;
        }

        .navbar a:hover::after {
          transform: translateX(-50%) scaleX(1);
        }

        /* Active Link Indicator */
        .navbar a.active {
          color: #f39c12;
          background: rgba(243, 156, 18, 0.15);
        }

        .navbar a.active::before {
          opacity: 1;
        }

        .navbar a.active::after {
          transform: translateX(-50%) scaleX(1);
          background: linear-gradient(90deg, transparent, #f39c12, transparent);
        }

        .profile {
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #d35400 100%);
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          top: 50%;
          left: 10px;
          transform: translateY(-50%);
          box-shadow: 0 4px 20px rgba(243, 156, 18, 0.6),
                      inset 0 -2px 10px rgba(0, 0, 0, 0.3);
          transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1), 
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          overflow: hidden;
          pointer-events: auto;
          z-index: 10;
          will-change: left;
        }

        .profile::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, 
            transparent 30%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 70%);
          transform: rotate(0deg);
          animation: shine 3s linear infinite;
        }

        @keyframes shine {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .profile:hover {
          box-shadow: 0 6px 30px rgba(243, 156, 18, 0.9),
                      0 0 40px rgba(243, 156, 18, 0.5),
                      inset 0 -2px 10px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .profile i {
          color: white;
          font-size: 22px;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        /* Floating Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .floating {
          animation: float 3s ease-in-out infinite;
        }

        /* Gradient Text Animation */
        @keyframes gradientText {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .gradient-text {
          background: linear-gradient(45deg, #f39c12, #e74c3c, #9b59b6, #3498db, #2ecc71);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientText 5s ease infinite;
          filter: drop-shadow(0 0 20px rgba(243, 156, 18, 0.5)) 
                  drop-shadow(0 0 40px rgba(243, 156, 18, 0.3));
          position: relative;
        }

        .gradient-text::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          z-index: -1;
          background: linear-gradient(45deg, #f39c12, #e74c3c, #9b59b6, #3498db, #2ecc71);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: blur(20px);
          opacity: 0.7;
          animation: gradientText 5s ease infinite;
        }

        /* Morphing Animation */
        @keyframes morph {
          0% { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg);
          }
          50% { 
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: rotate(5deg);
          }
          100% { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg);
          }
        }

        /* Fade In Animations */
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Glow Effect */
        .glow-btn {
          position: relative;
          overflow: hidden;
        }

        .glow-btn::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: rotate(45deg);
          transition: all 0.6s;
        }

        .glow-btn:hover::before {
          left: 100%;
        }

        /* Parallax Stars Background */
        .stars {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          opacity: 0.8;
          animation: twinkle 3s infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.3; }
        }

        /* Scroll Indicator */
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        /* PWA Install Button Animation */
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(46, 204, 113, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
          }
        }

        /* PWA Login Button */
        .pwa-login-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 18px 35px;
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4),
                      0 0 50px rgba(243, 156, 18, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          animation: slideInRight 0.5s ease-out, pulseGlow 3s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4),
                        0 0 50px rgba(243, 156, 18, 0.2);
          }
          50% {
            box-shadow: 0 12px 35px rgba(243, 156, 18, 0.6),
                        0 0 80px rgba(243, 156, 18, 0.4);
          }
        }

        /* Glass Card Effect */
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                      0 0 50px rgba(243, 156, 18, 0.05);
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(243, 156, 18, 0.3);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4),
                      0 0 80px rgba(243, 156, 18, 0.1);
          transform: translateY(-5px);
        }
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          animation: slideInRight 0.5s ease-out;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(200px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .pwa-login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50px;
          padding: 2px;
          background: linear-gradient(135deg, #f39c12, #e67e22, #f39c12);
          background-size: 200% 200%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          animation: borderGlow 3s linear infinite;
        }

        .pwa-login-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 12px 35px rgba(243, 156, 18, 0.6);
        }

        .pwa-login-btn:hover::before {
          opacity: 1;
        }

        .pwa-login-btn:active {
          transform: translateY(-1px) scale(1.02);
        }

        .install-btn {
          position: relative;
        }

        .install-btn::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          background: linear-gradient(135deg, #2ecc71, #27ae60, #16a085);
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .install-btn:hover::before {
          opacity: 1;
        }

        .install-btn:hover {
          transform: translateY(-5px) scale(1.05);
          color: white !important;
          text-shadow: 0 0 20px rgba(46, 204, 113, 1);
        }

        .scroll-indicator {
          animation: bounce 2s infinite;
        }

        /* Responsive Styles */
        @media (max-width: 1024px) {
          .main-content { 
            gap: 40px !important;
            justify-content: center !important;
          }
          .hero-image { 
            max-width: 400px !important;
          }
        }

        @media (max-width: 1024px) {
          .hero-section {
            height: auto !important;
            min-height: 100vh !important;
            padding: 100px 30px 40px !important;
          }
          .hero-section .main-content {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            text-align: center !important;
          }
          .hero-section .main-content > div:first-child {
            text-align: center !important;
          }
          .hero-image {
            max-width: 400px !important;
          }
        }

        @media (max-width: 768px) {
          .navbar {
            top: auto;
            bottom: 20px;
            max-width: 90%;
            padding: 12px 20px;
            padding-left: 50px;
            border-radius: 25px;
          }
          .navbar ul {
            gap: 5px;
          }
          .navbar a {
            padding: 8px 12px;
            font-size: 18px;
          }
          .profile {
            width: 40px;
            height: 40px;
            left: 8px;
          }
          .profile i {
            font-size: 20px;
          }
          .main-content { 
            flex-direction: column !important; 
            gap: 30px !important;
            text-align: center !important;
          }
          .main-content > div:first-child {
            text-align: center !important;
          }
          .hero-image { 
            width: 100% !important; 
            max-width: 350px !important;
          }
          .hero-title { 
            font-size: 2.5rem !important;
          }
          .hero-subtitle { 
            font-size: 1.5rem !important;
          }
          .hero-text { 
            font-size: 1.1rem !important;
          }
          .glow-btn {
            padding: 14px 35px !important;
            font-size: 1.1rem !important;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            bottom: 15px;
            max-width: 95%;
            padding: 10px 15px;
            padding-left: 45px;
          }
          .navbar ul {
            gap: 3px;
          }
          .navbar a {
            padding: 6px 10px;
            font-size: 16px;
          }
          .profile {
            width: 36px;
            height: 36px;
            left: 6px;
          }
          .profile i {
            font-size: 18px;
          }
          .hero-section { 
            height: auto !important; 
            padding: 100px 20px 80px !important;
            min-height: 100vh;
          }
          .hero-image { 
            max-width: 280px !important;
          }
          .hero-title { 
            font-size: 2rem !important;
          }
          .hero-subtitle { 
            font-size: 1.2rem !important;
          }
          .hero-text { 
            font-size: 1rem !important;
          }
          .glow-btn {
            padding: 12px 30px !important;
            font-size: 1rem !important;
          }
          .scroll-indicator {
            display: none !important;
          }
        }
      `}</style>

      {/* Animated Stars Background */}
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

      {/* Navbar - Modern Design */}
      <nav className="navbar" ref={navbarRef}>
        <ul>
          <li>
            <a 
              href="#home" 
              onClick={(e) => moveProfile(e, '#home')} 
              className={activeSection === 'home' ? 'active' : ''}
              title="Home"
            >
              <i className="fas fa-home"></i>
            </a>
          </li>
          <li>
            <a 
              href="#about" 
              onClick={(e) => moveProfile(e, '#about')} 
              className={activeSection === 'about' ? 'active' : ''}
              title="Tentang"
            >
              <i className="fas fa-info-circle"></i>
            </a>
          </li>
          <li>
            <a 
              href="#gallery" 
              onClick={(e) => moveProfile(e, '#gallery')} 
              className={activeSection === 'gallery' ? 'active' : ''}
              title="Galeri"
            >
              <i className="fas fa-images"></i>
            </a>
          </li>
          <li>
            <a 
              href="#lakaraja" 
              onClick={(e) => moveProfile(e, '#lakaraja')} 
              className={activeSection === 'lakaraja' ? 'active' : ''}
              title="Lakaraja"
            >
              <i className="fas fa-trophy"></i>
            </a>
          </li>
          {showInstallButton && (
            <li>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleInstallClick();
                }}
                className="install-btn"
                title="Install RJ Apps"
                style={{
                  background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                  animation: 'pulse 2s infinite'
                }}
              >
                <i className="fas fa-download"></i>
              </a>
            </li>
          )}
        </ul>
        <div className="profile" ref={profileRef} title="Profile">
          <i className="fas fa-user-circle"></i>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        id="home" 
        className="hero-section"
        style={{ 
          height: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          padding: '0 40px'
        }}
      >
        <div className="main-content" style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
          maxWidth: '1400px',
          width: '100%'
        }}>
          {/* Left Content */}
          <div style={{ 
            textAlign: 'left', 
            animation: 'fadeIn 1s ease-out'
          }}>
            <h2 className="hero-title gradient-text" style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700',
              marginBottom: '20px',
              letterSpacing: '2px',
              lineHeight: '1.2'
            }}>
              Paskibra Rajawali
            </h2>
            <h3 className="hero-subtitle" style={{ 
              fontSize: '1.8rem', 
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', 
              animation: 'fadeIn 1.5s ease-out', 
              marginBottom: '15px',
              background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.3'
            }}>
              MAN 1 Kabupaten Bogor
            </h3>
            <p className="hero-text" style={{ 
              fontSize: '1.3rem', 
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', 
              animation: 'fadeIn 2s ease-out', 
              marginBottom: '30px',
              opacity: 0.9,
              lineHeight: '1.5'
            }}>
              Membentuk Karakter, Membangun Prestasi
            </p>
            
            {/* Login Button - Only shows in PWA mode */}
            {isPWA && (
              <Link 
                to="/login" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '15px 35px',
                  background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  boxShadow: '0 8px 20px rgba(243, 156, 18, 0.4)',
                  transition: 'all 0.3s ease',
                  animation: 'fadeIn 2.5s ease-out',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(243, 156, 18, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(243, 156, 18, 0.4)';
                }}
              >
                <i className="fas fa-sign-in-alt"></i>
                Masuk ke Sistem
              </Link>
            )}
          </div>

          {/* Right Image */}
          <div className="floating" style={{ 
            animation: 'fadeInScale 1.5s ease-out',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img 
              src="/assets/images/pasukan.png" 
              alt="Logo Rajawali" 
              className="hero-image"
              style={{ 
                width: '100%',
                maxWidth: '550px',
                height: 'auto',
                filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05) rotate(2deg)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1) rotate(0deg)'}
            />
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="scroll-indicator" style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: 0.7
        }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Scroll Down</p>
          <i className="fas fa-chevron-down" style={{ fontSize: '20px' }}></i>
        </div>
      </section>

      {/* About Section */}
      <section 
        id="about" 
        style={{ 
          padding: '80px 20px', 
          textAlign: 'center', 
          minHeight: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ maxWidth: '1400px', width: '100%' }}>
          <h2 style={{
            fontSize: '2.8rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700',
            animation: 'fadeIn 1s ease-out'
          }}>
            Video Profil Kami
          </h2>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.8,
            marginBottom: '3rem',
            maxWidth: '700px',
            margin: '0 auto 3rem',
            lineHeight: '1.6'
          }}>
            Saksikan perjalanan kami dalam membentuk karakter dan prestasi
          </p>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '3px solid rgba(243, 156, 18, 0.3)',
            animation: 'fadeInScale 1.2s ease-out'
          }}>
            <video 
              autoPlay 
              muted 
              loop 
              style={{ 
                width: '100%', 
                display: 'block',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <source src="/assets/images/lakaraja.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Gallery Section - Modern & Advanced */}
      <section 
        id="gallery" 
        style={{ 
          position: 'relative', 
          padding: '6rem 2rem', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1,
          background: 'linear-gradient(180deg, transparent 0%, rgba(52, 152, 219, 0.03) 100%)'
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px' }}>
          <h2 style={{ 
            fontSize: '3.5rem', 
            marginBottom: '1rem', 
            background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 50%, #f39c12 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800',
            animation: 'fadeIn 1s ease-out',
            letterSpacing: '-1px'
          }}>
            Galeri Kami
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.6',
            animation: 'fadeIn 1.2s ease-out'
          }}>
            Dokumentasi kegiatan dan momen berharga Paskibra Rajawali
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          animation: 'fadeIn 1.4s ease-out'
        }}>
          {['all', 'latihan', 'upacara', 'kompetisi'].map((filter) => (
            <button
              key={filter}
              onClick={() => setGalleryFilter(filter)}
              style={{
                padding: '12px 30px',
                border: '2px solid',
                borderColor: galleryFilter === filter ? '#3498db' : 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50px',
                background: galleryFilter === filter 
                  ? 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'capitalize',
                backdropFilter: 'blur(10px)',
                boxShadow: galleryFilter === filter ? '0 5px 20px rgba(52, 152, 219, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.borderColor = '#3498db';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                if (galleryFilter !== filter) {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
            >
              {filter === 'all' ? 'Semua' : filter}
            </button>
          ))}
        </div>
        
        {/* Gallery Grid - Masonry Style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '25px',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          padding: '0 20px'
        }}>
          {[
            { 
              src: '/assets/images/rj3.jpg', 
              title: 'Pelantikan Gabungan Ekskul', 
              category: 'Pelantikan Gabungan',
              description: 'Pelantikan anggota baru Paskibra Rajawali',
              color: '#3498db'
            },
            { 
              src: '/assets/images/rj4.jpg', 
              title: 'Upacara Bendera', 
              category: 'upacara',
              description: 'Petugas upacara di hari kemerdekaan',
              color: '#e74c3c'
            },
            { 
              src: '/assets/images/lomba.jpg', 
              title: 'Kompetisi ', 
              category: 'kompetisi',
              description: 'Team Work Make The Dream Work',
              color: '#f39c12'
            },
            { 
              src: '/assets/images/laka.jpg', 
              title: 'Lakaraja Season 1', 
              category: 'Hari Ulang Tahun',
              description: 'Hut Paskibra Rajawali MAN 1 Kab.Bogor',
              color: '#2ecc71'
            },
            { 
              src: '/assets/images/rj1.jpg', 
              title: 'Training Intensif', 
              category: 'latihan',
              description: 'Pelatihan khusus anggota baru',
              color: '#3498db'
            },
        
          ]
            .filter(item => galleryFilter === 'all' || item.category === galleryFilter)
            .map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(item)}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                animation: `fadeInScale ${1 + index * 0.15}s ease-out`,
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                animationFillMode: 'forwards',
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                background: `linear-gradient(135deg, ${item.color}15, ${item.color}05)`,
                border: '2px solid rgba(255, 255, 255, 0.1)',
                height: index % 3 === 0 ? '400px' : '350px', // Varied heights for masonry effect
                transform: 'translateZ(0)' // GPU acceleration
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 20px 60px ${item.color}50`;
                e.currentTarget.style.borderColor = item.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {/* Category Badge */}
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                background: item.color,
                color: 'white',
                padding: '6px 15px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                zIndex: 2,
                boxShadow: `0 4px 15px ${item.color}80`,
                animation: 'float 3s ease-in-out infinite'
              }}>
                {item.category}
              </div>

              {/* Image with Parallax Effect */}
              <div style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden'
              }}>
                <img 
                  src={item.src} 
                  alt={item.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    display: 'block',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s ease',
                    filter: 'brightness(0.85) contrast(1.1)',
                    transform: 'scale(1.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.15)';
                    e.target.style.filter = 'brightness(1) contrast(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.filter = 'brightness(0.85) contrast(1.1)';
                  }}
                />
              </div>

              {/* Gradient Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.9) 100%)',
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }} />

              {/* Content Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '25px',
                transform: 'translateY(0)',
                transition: 'transform 0.4s ease',
                zIndex: 1
              }}>
                <h4 style={{
                  color: 'white',
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  margin: '0 0 8px 0',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  letterSpacing: '-0.5px'
                }}>
                  {item.title}
                </h4>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  margin: 0,
                  lineHeight: '1.5',
                  textShadow: '0 1px 5px rgba(0, 0, 0, 0.5)'
                }}>
                  {item.description}
                </p>
              </div>

              {/* Zoom Icon */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(0)',
                width: '60px',
                height: '60px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease',
                zIndex: 3,
                boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
              }}>
                <i className="fas fa-search-plus" style={{ 
                  fontSize: '1.5rem', 
                  color: item.color 
                }}></i>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div 
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
              animation: 'fadeIn 0.3s ease',
              backdropFilter: 'blur(20px)'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              style={{
                position: 'absolute',
                top: '30px',
                right: '30px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                color: 'white',
                fontSize: '1.5rem',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(231, 76, 60, 0.8)';
                e.target.style.transform = 'rotate(90deg) scale(1.1)';
                e.target.style.borderColor = '#e74c3c';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'rotate(0) scale(1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <i className="fas fa-times"></i>
            </button>

            <div style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: 'rgba(10, 10, 26, 0.8)',
              borderRadius: '20px',
              overflow: 'hidden',
              border: `3px solid ${selectedImage.color}`,
              boxShadow: `0 20px 80px ${selectedImage.color}50`,
              animation: 'fadeInScale 0.4s ease',
              backdropFilter: 'blur(20px)'
            }}
            onClick={(e) => e.stopPropagation()}>
              <img 
                src={selectedImage.src} 
                alt={selectedImage.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
              <div style={{
                padding: '30px',
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{
                  display: 'inline-block',
                  background: selectedImage.color,
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  marginBottom: '15px',
                  letterSpacing: '1px'
                }}>
                  {selectedImage.category}
                </div>
                <h3 style={{
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: '700',
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.5px'
                }}>
                  {selectedImage.title}
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1.1rem',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  {selectedImage.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Lakaraja Section */}
      <section 
        id="lakaraja"
        style={{
          minHeight: '100vh',
          padding: '8rem 2rem',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, transparent 0%, rgba(243, 156, 18, 0.05) 100%)',
          overflow: 'hidden'
        }}
      >
        {/* Background Decorations */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(243, 156, 18, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(230, 126, 34, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <div style={{
          maxWidth: '1200px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Section Header */}
          <div style={{
            marginBottom: '4rem',
            animation: 'fadeIn 1s ease-out'
          }}>
            <h2 style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 50%, #c0392b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
              textTransform: 'uppercase'
            }}>
              Lakaraja 2026
            </h2>
            <p style={{
              fontSize: '1.3rem',
              color: '#f39c12',
              fontWeight: '600',
              marginBottom: '1rem',
              letterSpacing: '2px'
            }}>
              Lomba Baris Berbaris
            </p>
            <div style={{
              width: '80px',
              height: '4px',
              background: 'linear-gradient(90deg, transparent, #f39c12, transparent)',
              margin: '0 auto'
            }} />
          </div>

          {/* Main Content */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(230, 126, 34, 0.05) 100%)',
            padding: '3rem 2rem',
            borderRadius: '20px',
            border: '1px solid rgba(243, 156, 18, 0.2)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            marginBottom: '3rem',
            animation: 'fadeInScale 1.2s ease-out'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              marginBottom: '2.5rem'
            }}>
              {/* Info Item 1 */}
              <div style={{
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '15px',
                border: '1px solid rgba(243, 156, 18, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = '#f39c12';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(243, 156, 18, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(243, 156, 18, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <i className="fas fa-trophy" style={{
                  fontSize: '2.5rem',
                  color: '#f39c12',
                  marginBottom: '1rem',
                  display: 'block'
                }}></i>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.2rem',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>Kompetisi Bergengsi</h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  Ajang kompetisi baris berbaris tingkat regional
                </p>
              </div>

              {/* Info Item 2 */}
              <div style={{
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '15px',
                border: '1px solid rgba(243, 156, 18, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = '#f39c12';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(243, 156, 18, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(243, 156, 18, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <i className="fas fa-calendar-alt" style={{
                  fontSize: '2.5rem',
                  color: '#f39c12',
                  marginBottom: '1rem',
                  display: 'block'
                }}></i>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.2rem',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>Tahun 2026</h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  Event tahunan yang dinanti-nanti
                </p>
              </div>

              {/* Info Item 3 */}
              <div style={{
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '15px',
                border: '1px solid rgba(243, 156, 18, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = '#f39c12';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(243, 156, 18, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(243, 156, 18, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <i className="fas fa-users" style={{
                  fontSize: '2.5rem',
                  color: '#f39c12',
                  marginBottom: '1rem',
                  display: 'block'
                }}></i>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.2rem',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>Tim & Individu</h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  Kategori tim dan individu tersedia
                </p>
              </div>
            </div>

            {/* Description */}
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.8',
              marginBottom: '2.5rem',
              maxWidth: '800px',
              margin: '0 auto 2.5rem'
            }}>
              <strong style={{ color: '#f39c12' }}>Lakaraja</strong> (Lomba Baris Berbaris Rajawali) adalah kompetisi baris berbaris 
              bergengsi yang diselenggarakan oleh Paskibra MAN 1 Kabupaten Bogor. Ajang ini menjadi wadah bagi para peserta 
              untuk menunjukkan kemampuan, kedisiplinan, dan kekompakan dalam baris berbaris.
            </p>

            {/* CTA Button */}
            <Link 
              to="/lakaraja/register"
              className="glow-btn"
              style={{
                display: 'inline-block',
                padding: '18px 50px',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: 'white',
                background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
                border: 'none',
                borderRadius: '50px',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 30px rgba(243, 156, 18, 0.4)',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px) scale(1.05)';
                e.target.style.boxShadow = '0 15px 40px rgba(243, 156, 18, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 30px rgba(243, 156, 18, 0.4)';
              }}
            >
              <i className="fas fa-user-plus" style={{ marginRight: '10px' }}></i>
              Daftar Lakaraja 2026
            </Link>

            {/* Additional Info */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'rgba(243, 156, 18, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(243, 156, 18, 0.15)'
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem',
                margin: 0
              }}>
                <i className="fas fa-info-circle" style={{ marginRight: '8px', color: '#f39c12' }}></i>
                Pendaftaran dibuka untuk umum. Peserta yang terdaftar akan mendapatkan akun khusus untuk mengikuti kompetisi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
        textAlign: 'center', 
        padding: '3rem 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            Paskibra Rajawali
          </h3>
          <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '0.95rem' }}>
            MAN 1 Kabupaten Bogor
          </p>
          
          <div style={{ 
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <a 
              href="#" 
              style={{ 
                color: 'white', 
                fontSize: '1.8rem', 
                textDecoration: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(230, 126, 34, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '2px solid rgba(243, 156, 18, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px) scale(1.1)';
                e.target.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
                e.target.style.boxShadow = '0 10px 30px rgba(243, 156, 18, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.background = 'linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(230, 126, 34, 0.2))';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a 
              href="#" 
              style={{ 
                color: 'white', 
                fontSize: '1.8rem', 
                textDecoration: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '2px solid rgba(52, 152, 219, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px) scale(1.1)';
                e.target.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
                e.target.style.boxShadow = '0 10px 30px rgba(52, 152, 219, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.background = 'linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.2))';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="fab fa-facebook"></i>
            </a>
            <a 
              href="#" 
              style={{ 
                color: 'white', 
                fontSize: '1.8rem', 
                textDecoration: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '2px solid rgba(46, 204, 113, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px) scale(1.1)';
                e.target.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                e.target.style.boxShadow = '0 10px 30px rgba(46, 204, 113, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.background = 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.2))';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="fab fa-twitter"></i>
            </a>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '2rem',
            opacity: 0.7,
            fontSize: '0.9rem'
          }}>
            <p>&copy; 2025 Paskibra Rajawali MAN 1 Kabupaten Bogor. All Rights Reserved.</p>
            <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>
              Made with <span style={{ color: '#e74c3c' }}>❤</span> by Paskibra Team
            </p>
          </div>
        </div>
      </footer>

      {/* Font Awesome & Google Fonts */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" 
      />
      <link 
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default Home;
