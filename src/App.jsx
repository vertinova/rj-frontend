import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterLakaraja from './pages/RegisterLakaraja'
import LoginLakaraja from './pages/LoginLakaraja'
import LakarajaDashboard from './pages/lakaraja/LakarajaDashboard'
import PanitiaDashboard from './pages/lakaraja/PanitiaDashboard'
import ManageUsers from './pages/lakaraja/ManageUsers'
import ManagePendaftaran from './pages/lakaraja/ManagePendaftaran'
import TechnicalMeetingAbsensi from './pages/lakaraja/TechnicalMeetingAbsensi'
import KuotaSettings from './pages/lakaraja/KuotaSettings'
import TarunaDashboard from './pages/taruna/TarunaDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import NotFound from './pages/NotFound'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white',
        fontFamily: 'Poppins, sans-serif',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(243, 156, 18, 0.3)',
          borderTop: '4px solid #f39c12',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to correct dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else if (user.role === 'user') {
      return <Navigate to="/taruna" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

// Public Route - Redirect if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white',
        fontFamily: 'Poppins, sans-serif',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(243, 156, 18, 0.3)',
          borderTop: '4px solid #f39c12',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // If user is logged in, redirect to their dashboard
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else if (user.role === 'user') {
      return <Navigate to="/taruna" replace />
    }
  }

  return children
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Lakaraja Routes */}
        <Route 
          path="/lakaraja/register" 
          element={<RegisterLakaraja />} 
        />
        <Route 
          path="/lakaraja/login" 
          element={<LoginLakaraja />} 
        />
        <Route 
          path="/lakaraja/dashboard" 
          element={<LakarajaDashboard />} 
        />
        <Route 
          path="/lakaraja/panitia" 
          element={<PanitiaDashboard />} 
        />
        <Route 
          path="/lakaraja/panitia/users" 
          element={<ManageUsers />} 
        />
        <Route 
          path="/lakaraja/panitia/pendaftaran" 
          element={<ManagePendaftaran />} 
        />
        <Route 
          path="/lakaraja/panitia/technical-meeting" 
          element={<TechnicalMeetingAbsensi />} 
        />
        <Route 
          path="/lakaraja/panitia/kuota" 
          element={<KuotaSettings />} 
        />

        {/* Taruna Routes */}
        <Route
          path="/taruna/*"
          element={
            <ProtectedRoute requiredRole="user">
              <TarunaDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
