import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Import real components
import AdminOverview from './AdminOverview';
import AdminPendaftar from './AdminPendaftar';
import AdminUsers from './AdminUsers';
import AdminAbsensi from './AdminAbsensi';
import AdminKTA from './AdminKTA';
import AdminStatistik from './AdminStatistik';

// Placeholder components untuk yang belum dibuat
const AdminProfil = () => (
  <div className="page-content">
    <h2>Profil Admin</h2>
    <p style={{ marginTop: '20px', opacity: 0.7 }}>Profil dan pengaturan admin akan ditampilkan di sini</p>
  </div>
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarCollapsed(false);
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const menuItems = [
    { path: '/admin', icon: 'fa-chart-line', label: 'Dashboard', exact: true },
    { path: '/admin/pendaftar', icon: 'fa-users', label: 'Pendaftar' },
    { path: '/admin/users', icon: 'fa-user-cog', label: 'Users' },
    { path: '/admin/absensi', icon: 'fa-calendar-check', label: 'Absensi' },
    { path: '/admin/statistik', icon: 'fa-chart-bar', label: 'Statistik' },
    { path: '/admin/kta', icon: 'fa-id-card', label: 'Generate KTA' },
    { path: '/admin/profil', icon: 'fa-user-circle', label: 'Profil' }
  ];

  const isActiveRoute = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const sidebarWidth = sidebarCollapsed ? '80px' : '280px';
  const isMobile = window.innerWidth <= 1024;

  return (
    <div className="admin-dashboard" style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)', position: 'relative', fontFamily: 'Poppins, sans-serif' }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Animated Background */
        .admin-dashboard::before {
          content: '';
          position: fixed;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 20% 50%, rgba(243, 156, 18, 0.05) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(155, 89, 182, 0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        /* Mobile Overlay */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 999;
          opacity: ${mobileMenuOpen ? '1' : '0'};
          visibility: ${mobileMenuOpen ? 'visible' : 'hidden'};
          transition: all 0.3s ease;
        }

        @media (max-width: 1024px) {
          .mobile-overlay {
            display: block;
          }
        }

        /* Sidebar */
        .admin-sidebar {
          width: ${sidebarWidth};
          background: rgba(10, 10, 26, 0.95);
          backdrop-filter: blur(30px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 1024px) {
          .admin-sidebar {
            width: 280px;
            transform: ${mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'};
          }
        }

        .sidebar-header {
          padding: 25px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 15px;
          position: relative;
        }

        .sidebar-logo {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          border: 2px solid rgba(243, 156, 18, 0.5);
          padding: 5px;
          background: rgba(243, 156, 18, 0.1);
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .sidebar-logo:hover {
          transform: rotate(360deg) scale(1.1);
          border-color: rgba(243, 156, 18, 0.8);
        }

        .sidebar-title {
          font-size: 1.3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
          opacity: ${sidebarCollapsed ? '0' : '1'};
          transition: opacity 0.3s ease;
        }

        @media (max-width: 1024px) {
          .sidebar-title {
            opacity: 1;
          }
        }

        .sidebar-toggle {
          position: absolute;
          top: 30px;
          right: -15px;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
          transition: all 0.3s ease;
          z-index: 10;
        }

        @media (max-width: 1024px) {
          .sidebar-toggle {
            display: none;
          }
        }

        .sidebar-toggle:hover {
          transform: scale(1.15) rotate(90deg);
          box-shadow: 0 6px 16px rgba(243, 156, 18, 0.6);
        }

        .sidebar-menu {
          flex: 1;
          padding: 20px 10px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-menu::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-menu::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }

        .sidebar-menu::-webkit-scrollbar-thumb {
          background: rgba(243, 156, 18, 0.3);
          border-radius: 10px;
        }

        .sidebar-menu::-webkit-scrollbar-thumb:hover {
          background: rgba(243, 156, 18, 0.5);
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 18px;
          margin-bottom: 8px;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .menu-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 100%;
          background: linear-gradient(90deg, rgba(243, 156, 18, 0.3), transparent);
          transition: width 0.3s ease;
        }

        .menu-item:hover::before,
        .menu-item.active::before {
          width: 100%;
        }

        .menu-item:hover {
          color: #f39c12;
          background: rgba(243, 156, 18, 0.15);
          transform: translateX(5px);
        }

        .menu-item.active {
          background: linear-gradient(90deg, rgba(243, 156, 18, 0.2), transparent);
          color: #f39c12;
          border-left: 4px solid #f39c12;
          box-shadow: 0 4px 12px rgba(243, 156, 18, 0.2);
        }

        .menu-item i {
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .menu-item:hover i,
        .menu-item.active i {
          transform: scale(1.2) rotate(5deg);
        }

        .menu-item span {
          white-space: nowrap;
          opacity: ${sidebarCollapsed && !isMobile ? '0' : '1'};
          transition: opacity 0.3s ease;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 1024px) {
          .menu-item span {
            opacity: 1;
          }
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        .logout-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(231, 76, 60, 0.5);
        }

        .logout-btn:active {
          transform: translateY(-1px);
        }

        .logout-btn i {
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .logout-btn:hover i {
          transform: rotate(-15deg);
        }

        .logout-btn span {
          opacity: ${sidebarCollapsed && !isMobile ? '0' : '1'};
          transition: opacity 0.3s ease;
        }

        @media (max-width: 1024px) {
          .logout-btn span {
            opacity: 1;
          }
        }

        /* Main Content */
        .admin-main {
          flex: 1;
          margin-left: ${isMobile ? '0' : sidebarWidth};
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          width: 44px;
          height: 44px;
          background: rgba(243, 156, 18, 0.15);
          border: 1px solid rgba(243, 156, 18, 0.3);
          border-radius: 12px;
          color: #f39c12;
          cursor: pointer;
          transition: all 0.3s ease;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: flex;
          }
        }

        .mobile-menu-btn:hover {
          background: rgba(243, 156, 18, 0.25);
          transform: scale(1.05);
        }

        .admin-topbar {
          background: rgba(10, 10, 26, 0.9);
          backdrop-filter: blur(30px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 1024px) {
          .admin-topbar {
            padding: 15px 20px 15px 80px;
          }
        }

        @media (max-width: 768px) {
          .admin-topbar {
            padding: 15px 15px 15px 75px;
          }
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .topbar-left h1 {
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 5px;
        }

        @media (max-width: 768px) {
          .topbar-left h1 {
            font-size: 1.3rem;
          }
        }

        .topbar-breadcrumb {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .topbar-breadcrumb {
            display: none;
          }
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .topbar-right {
            gap: 12px;
          }
        }

        .time-display {
          text-align: right;
        }

        @media (max-width: 1024px) {
          .time-display {
            display: none;
          }
        }

        .time-display .time {
          font-size: 1.3rem;
          font-weight: 600;
          color: #f39c12;
          font-family: 'Courier New', monospace;
          text-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
        }

        .time-display .date {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 2px;
        }

        .profile-dropdown {
          position: relative;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .profile-trigger:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(243, 156, 18, 0.5);
          box-shadow: 0 4px 12px rgba(243, 156, 18, 0.2);
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .profile-info {
            display: none;
          }
        }

        .profile-name {
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .profile-role {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
        }

        .profile-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 220px;
          background: rgba(10, 10, 26, 0.98);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 10px;
          opacity: ${showProfileMenu ? '1' : '0'};
          visibility: ${showProfileMenu ? 'visible' : 'hidden'};
          transform: ${showProfileMenu ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .profile-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .profile-menu-item:hover {
          background: rgba(243, 156, 18, 0.15);
          color: #f39c12;
          transform: translateX(5px);
        }

        .profile-menu-item i {
          width: 20px;
          text-align: center;
        }

        .admin-content {
          padding: 30px;
          min-height: calc(100vh - 100px);
        }

        @media (max-width: 768px) {
          .admin-content {
            padding: 20px 15px;
          }
        }

        .page-content {
          background: rgba(10, 10, 26, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          color: white;
        }

        @media (max-width: 768px) {
          .page-content {
            padding: 25px 20px;
          }
        }

        .page-content h2 {
          font-size: 2rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (max-width: 768px) {
          .page-content h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>

      {/* Mobile Overlay */}
      <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>

      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
          border: 'none',
          borderRadius: '12px',
          width: '50px',
          height: '50px',
          color: 'white',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(243, 156, 18, 0.4)',
          transition: 'all 0.3s ease'
        }}
      >
        <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'}`}></i>
      </button>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          .mobile-menu-btn:active {
            transform: scale(0.95);
          }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/assets/images/logo_rj.png" alt="Logo Rajawali" className="sidebar-logo" />
          <h2 className="sidebar-title">Admin Panel</h2>
        </div>

        {/* Sidebar Toggle Button */}
        <button 
          className="sidebar-toggle" 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
        </button>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${isActiveRoute(item.path, item.exact) ? 'active' : ''}`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1>Admin Dashboard</h1>
            <div className="topbar-breadcrumb">
              <i className="fas fa-home"></i> / Admin
            </div>
          </div>

          <div className="topbar-right">
            <div className="time-display">
              <div className="time">{formatTime(currentTime)}</div>
              <div className="date">{formatDate(currentTime)}</div>
            </div>

            <div className="profile-dropdown">
              <div className="profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div className="profile-avatar">
                  {user?.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{user?.username || 'Admin'}</div>
                  <div className="profile-role">Administrator</div>
                </div>
                <i className={`fas fa-chevron-${showProfileMenu ? 'up' : 'down'}`}></i>
              </div>

              <div className="profile-menu">
                <Link to="/admin/profil" className="profile-menu-item">
                  <i className="fas fa-user"></i>
                  <span>Profil Saya</span>
                </Link>
                <div className="profile-menu-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="pendaftar" element={<AdminPendaftar />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="absensi" element={<AdminAbsensi />} />
            <Route path="statistik" element={<AdminStatistik />} />
            <Route path="kta" element={<AdminKTA />} />
            <Route path="profil" element={<AdminProfil />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>

      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" 
      />
    </div>
  );
};

export default AdminDashboard;
