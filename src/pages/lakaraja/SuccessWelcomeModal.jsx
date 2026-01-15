import { useEffect, useState } from 'react';

const SuccessWelcomeModal = ({ isOpen, onClose, participantName, kategori, logoUrl }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Generate confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 360,
        color: ['#f97316', '#facc15', '#ef4444', '#22c55e', '#3b82f6'][Math.floor(Math.random() * 5)]
      }));
      setParticles(newParticles);

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
      setParticles([]);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-3 h-3 animate-confettiFall"
              style={{
                left: `${particle.left}%`,
                top: '-10%',
                backgroundColor: particle.color,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                transform: `rotate(${particle.rotation}deg)`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0'
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div className="relative max-w-2xl w-full animate-modalSlideUp">
        {/* Glow Effects */}
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 rounded-3xl blur-2xl opacity-75 animate-pulse"></div>
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-2 border-orange-500/30 rounded-3xl p-8 sm:p-12 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
              animation: 'bgSlide 20s linear infinite'
            }}></div>
          </div>

          {/* Success Icon with Animation */}
          <div className="relative flex justify-center mb-6">
            <div className="relative">
              {/* Pulsing Rings */}
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-green-500/10 animate-pulse"></div>
              
              {/* Icon Container */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50 animate-bounceIn">
                <i className="fas fa-check text-4xl sm:text-5xl text-white animate-checkmark"></i>
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent animate-gradient mb-2">
              Selamat Datang!
            </h2>
            
            <div className="space-y-2">
              <p className="text-white/60 text-sm sm:text-base uppercase tracking-widest animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
                Technical Meeting
              </p>
              <h3 className="text-2xl sm:text-4xl font-bold text-white animate-slideInRight" style={{ animationDelay: '0.3s' }}>
                LAKARAJA 2026
              </h3>
            </div>

            {/* Participant Info */}
            <div className="mt-6 p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl animate-slideInUp" style={{ animationDelay: '0.4s' }}>
              <p className="text-orange-400 text-sm mb-3 uppercase tracking-wide">Satuan Terdaftar</p>
              
              {/* Logo Satuan */}
              {logoUrl && (
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300 animate-pulse"></div>
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl p-2 shadow-2xl">
                      <img 
                        src={logoUrl} 
                        alt="Logo Satuan"
                        className="w-full h-full object-contain"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-white text-xl sm:text-2xl font-bold mb-1">{participantName}</p>
              <div className="inline-block px-4 py-1 bg-orange-500/20 rounded-full">
                <span className="text-orange-300 text-sm font-semibold">Kategori {kategori}</span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="relative flex justify-center items-center gap-8 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent animate-shimmer"></div>
            <div className="flex gap-2">
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>⭐</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>🔥</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>⚡</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent animate-shimmer"></div>
          </div>

          {/* Message */}
          <div className="text-center space-y-3 mb-8">
            <p className="text-white/80 text-base sm:text-lg leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
              Absensi Anda telah berhasil tercatat.
            </p>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              Terima kasih telah hadir di Technical Meeting Lakaraja 2026.<br/>
              Mari kita ciptakan prestasi gemilang bersama!
            </p>
          </div>

          {/* Badge/Sticker */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="group cursor-pointer animate-float" style={{ animationDelay: '0s' }}>
              <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform group-hover:scale-110 transition-transform shadow-lg shadow-green-500/30">
                <i className="fas fa-check-circle mr-2 text-white"></i>
                <span className="text-white font-bold text-sm">Verified</span>
              </div>
            </div>
            <div className="group cursor-pointer animate-float" style={{ animationDelay: '0.2s' }}>
              <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
                <i className="fas fa-star mr-2 text-white"></i>
                <span className="text-white font-bold text-sm">2026</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="group px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-xl shadow-orange-500/30 transform hover:scale-105 transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: '0.7s' }}
            >
              <span className="mr-2">Lanjutkan</span>
              <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform inline-block"></i>
            </button>
          </div>

          {/* Auto-close indicator */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <i className="fas fa-info-circle"></i>
              <span>Otomatis tertutup dalam 5 detik</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes checkmark {
          0% { transform: scale(0) rotate(-45deg); }
          50% { transform: scale(1.2) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes bgSlide {
          from { transform: translateX(0); }
          to { transform: translateX(40px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-modalSlideUp {
          animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-checkmark {
          animation: checkmark 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s forwards;
          transform: scale(0);
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-confettiFall {
          animation: confettiFall linear forwards;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SuccessWelcomeModal;
