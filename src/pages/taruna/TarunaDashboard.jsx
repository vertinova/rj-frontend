import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tarunaService } from '../../services/tarunaService';
import toast from 'react-hot-toast';

// Import Taruna Pages
import TarunaOverview from './TarunaOverview';
import TarunaPendaftaran from './TarunaPendaftaran';
import TarunaStatus from './TarunaStatus';
import TarunaAbsensi from './TarunaAbsensi';
import TarunaProfil from './TarunaProfil';
import TarunaEditProfil from './TarunaEditProfil';

const TarunaDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userStatus, setUserStatus] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const statusData = await tarunaService.getPendaftaranStatus();
        setUserStatus(statusData);
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };
    fetchStatus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-profile-container')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    toast.success('Logout berhasil! Sampai jumpa 👋', {
      duration: 2000,
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '12px',
        padding: '16px 24px'
      }
    });
    setTimeout(() => logout(), 500);
  };

  const bottomNavItems = [
    { path: '/taruna', icon: 'fa-home', label: 'Home' },
    { path: '/taruna/pendaftaran', icon: 'fa-file-alt', label: 'Daftar' },
    { path: '/taruna/absensi', icon: 'fa-calendar-check', label: 'Absensi' },
    { path: '/taruna/status', icon: 'fa-clipboard-check', label: 'Status' },
    { path: '/taruna/profil', icon: 'fa-user', label: 'Profil' }
  ];

  const isActiveRoute = (path) => {
    if (path === '/taruna') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="taruna-app" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)', 
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: '75px' // Space for bottom nav
    }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Animated Background */
        .taruna-app::before {
          content: '';
          position: fixed;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 20% 50%, rgba(52, 152, 219, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(46, 204, 113, 0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        /* Top Header */
        .top-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 10, 26, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 15px 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .app-logo {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 2px solid rgba(52, 152, 219, 0.5);
          padding: 3px;
          background: rgba(52, 152, 219, 0.1);
        }

        .app-title {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .app-title h1 {
          font-size: 1.1rem;
          font-weight: 700;
          background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }

        .app-title .subtitle {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .time-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(52, 152, 219, 0.15);
          border: 1px solid rgba(52, 152, 219, 0.3);
          border-radius: 20px;
          font-size: 0.85rem;
          color: #3498db;
          font-weight: 600;
          font-family: 'Courier New', monospace;
        }

        @media (max-width: 480px) {
          .time-badge {
            display: none;
          }
        }

        .user-profile-container {
          position: relative;
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          border: 2px solid rgba(52, 152, 219, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-avatar:hover {
          transform: scale(1.05);
          border-color: rgba(52, 152, 219, 0.6);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
        }

        .user-avatar:active {
          transform: scale(0.95);
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid rgba(52, 152, 219, 0.3);
          border-radius: 12px;
          min-width: 220px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .profile-dropdown.show {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }

        .dropdown-header {
          padding: 15px;
          border-bottom: 1px solid rgba(52, 152, 219, 0.2);
        }

        .dropdown-header h4 {
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .dropdown-header p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
        }

        .dropdown-menu {
          padding: 8px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .dropdown-item:hover {
          background: rgba(52, 152, 219, 0.15);
          color: #3498db;
        }

        .dropdown-item i {
          width: 20px;
          text-align: center;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(52, 152, 219, 0.2);
          margin: 8px 0;
        }

        .dropdown-item.logout {
          color: #e74c3c;
        }

        .dropdown-item.logout:hover {
          background: rgba(231, 76, 60, 0.15);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 20px 15px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 768px) {
          .main-content {
            padding: 25px 30px;
          }
        }

        /* Bottom Navigation */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(10, 10, 26, 0.98);
          backdrop-filter: blur(30px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
          z-index: 1000;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        }

        .nav-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          max-width: 500px;
          margin: 0 auto;
          padding: 0 10px;
        }

        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 10px;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
        }

        .nav-item:active {
          transform: scale(0.95);
        }

        .nav-item.active {
          color: #3498db;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: linear-gradient(90deg, #3498db, #2ecc71);
          border-radius: 0 0 3px 3px;
        }

        .nav-icon {
          font-size: 1.4rem;
          transition: all 0.3s ease;
        }

        .nav-item.active .nav-icon {
          transform: translateY(-2px);
        }

        .nav-label {
          font-size: 0.7rem;
          font-weight: 600;
          white-space: nowrap;
        }

        /* Floating Action Button (FAB) for Absensi */
        .fab-absensi {
          position: relative;
          width: 56px;
          height: 56px;
          margin-top: -28px;
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.8rem;
          box-shadow: 0 4px 20px rgba(46, 204, 113, 0.5);
          border: 3px solid rgba(10, 10, 26, 1);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .fab-absensi:active {
          transform: scale(0.9);
        }

        .nav-item.active.fab-container {
          color: #2ecc71;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeIn 0.4s ease;
        }

        /* Safe area for notch phones */
        @supports (padding: max(0px)) {
          .bottom-nav {
            padding-bottom: max(8px, env(safe-area-inset-bottom));
          }
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Hide scrollbar but keep functionality */
        .main-content::-webkit-scrollbar {
          display: none;
        }

        .main-content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/assets/images/logo_rj.png" alt="Logo" className="app-logo" />
            <div className="app-title">
              <h1>Paskibra Rajawali</h1>
              <span className="subtitle">
                {userStatus?.status === 'lolos' ? 'Taruna Dashboard' : 'Calon Taruna Dashboard'}
              </span>
            </div>
          </div>
          <div className="header-right">
            <div className="time-badge">
              <i className="fas fa-clock"></i>
              {formatTime(currentTime)}
            </div>
            <div className="user-profile-container">
              <div 
                className="user-avatar"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {user?.username?.[0]?.toUpperCase() || 'T'}
              </div>
              <div className={`profile-dropdown ${showProfileDropdown ? 'show' : ''}`}>
                <div className="dropdown-header">
                  <h4>{user?.username || 'Taruna'}</h4>
                  <p>{user?.email || 'email@example.com'}</p>
                </div>
                <div className="dropdown-menu">
                  <Link to="/taruna/profil" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                    <i className="fas fa-user"></i>
                    <span>Profil Saya</span>
                  </Link>
                  <Link to="/taruna/status" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                    <i className="fas fa-clipboard-check"></i>
                    <span>Status Pendaftaran</span>
                  </Link>
                  <Link to="/taruna/absensi" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                    <i className="fas fa-calendar-check"></i>
                    <span>Absensi</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content fade-in">
        <Routes>
          <Route index element={<TarunaOverview />} />
          <Route path="pendaftaran" element={<TarunaPendaftaran />} />
          <Route path="status" element={<TarunaStatus />} />
          <Route path="absensi" element={<TarunaAbsensi />} />
          <Route path="profil" element={<TarunaProfil />} />
          <Route path="profil/edit" element={<TarunaEditProfil />} />
          <Route path="*" element={<Navigate to="/taruna" replace />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-container">
          {bottomNavItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            
            // Special styling for center Absensi button
            if (item.path === '/taruna/absensi') {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item fab-container ${isActive ? 'active' : ''}`}
                  style={{ flex: 0 }}
                >
                  <div className="fab-absensi">
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <i className={`fas ${item.icon} nav-icon`}></i>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" 
      />
    </div>
  );
};

export default TarunaDashboard;
