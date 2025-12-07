import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tarunaService } from '../../services/tarunaService';
import toast from 'react-hot-toast';

const TarunaOverview = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [absensiCount, setAbsensiCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get pendaftaran status
      const statusData = await tarunaService.getPendaftaranStatus();
      setStatus(statusData);

      // Get absensi count
      try {
        const absensiData = await tarunaService.getAbsensiHistory();
        setAbsensiCount(absensiData?.length || 0);
      } catch (error) {
        setAbsensiCount(0);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: '#f39c12', label: 'Menunggu Verifikasi' },
      'lolos': { color: '#2ecc71', label: 'Lolos Seleksi' },
      'tidak lolos': { color: '#e74c3c', label: 'Tidak Lolos' },
      'belum_daftar': { color: '#95a5a6', label: 'Belum Mendaftar' }
    };
    return badges[status] || badges.belum_daftar;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid rgba(52, 152, 219, 0.3)', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p>Memuat data...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statusBadge = getStatusBadge(status?.status || 'belum_daftar');

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(46, 204, 113, 0.2) 100%)',
        border: '1px solid rgba(52, 152, 219, 0.3)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        backdropFilter: 'blur(20px)'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Selamat Datang, {status?.status === 'lolos' ? 'Taruna' : 'Calon Taruna'}! 🎖️
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>
          {status?.status === 'lolos' 
            ? 'Selamat! Anda telah resmi menjadi Taruna Paskibra Rajawali' 
            : 'Pantau status pendaftaran dan kelola absensi Anda di sini'}
        </p>
      </div>

      {/* Status Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '30px' }}>
        {/* Status Pendaftaran Card */}
        <div style={{
          background: 'rgba(10, 10, 26, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '25px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(52, 152, 219, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${statusBadge.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-clipboard-check" style={{ fontSize: '1.5rem', color: statusBadge.color }}></i>
            </div>
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginBottom: '5px' }}>Status Pendaftaran</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: statusBadge.color }}>{statusBadge.label}</h3>
            </div>
          </div>
          {status?.status === 'belum_daftar' && (
            <Link to="/taruna/pendaftaran" style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}>
              <i className="fas fa-edit"></i> Daftar Sekarang
            </Link>
          )}
        </div>

        {/* Absensi Count Card */}
        <div style={{
          background: 'rgba(10, 10, 26, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '25px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(46, 204, 113, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(46, 204, 113, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-calendar-check" style={{ fontSize: '1.5rem', color: '#2ecc71' }}></i>
            </div>
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginBottom: '5px' }}>Total Absensi</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2ecc71' }}>{absensiCount} Hari</h3>
            </div>
          </div>
          <Link to="/taruna/absensi" style={{
            display: 'inline-block',
            marginTop: '10px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}>
            <i className="fas fa-calendar-plus"></i> Absen Sekarang
          </Link>
        </div>

        {/* KTA Card */}
        {status?.status === 'lolos' && status?.pendaftaran?.nomor_kta && (
          <div style={{
            background: 'rgba(10, 10, 26, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '25px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(243, 156, 18, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(243, 156, 18, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-id-card" style={{ fontSize: '1.5rem', color: '#f39c12' }}></i>
              </div>
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginBottom: '5px' }}>Nomor KTA</p>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#f39c12' }}>{status.pendaftaran.nomor_kta}</h3>
              </div>
            </div>
            <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(243, 156, 18, 0.1)', borderRadius: '8px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              <i className="fas fa-check-circle" style={{ color: '#2ecc71', marginRight: '8px' }}></i>
              KTA Anda sudah tersedia
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'rgba(10, 10, 26, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'white' }}>
          <i className="fas fa-bolt" style={{ color: '#f39c12', marginRight: '10px' }}></i>
          Aksi Cepat
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <Link to="/taruna/pendaftaran" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '15px 20px',
            background: 'rgba(52, 152, 219, 0.1)',
            border: '1px solid rgba(52, 152, 219, 0.3)',
            borderRadius: '12px',
            color: '#3498db',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(52, 152, 219, 0.2)';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}>
            <i className="fas fa-file-alt" style={{ fontSize: '1.5rem' }}></i>
            <span>Form Pendaftaran</span>
          </Link>

          <Link to="/taruna/status" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '15px 20px',
            background: 'rgba(155, 89, 182, 0.1)',
            border: '1px solid rgba(155, 89, 182, 0.3)',
            borderRadius: '12px',
            color: '#9b59b6',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(155, 89, 182, 0.2)';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(155, 89, 182, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}>
            <i className="fas fa-clipboard-check" style={{ fontSize: '1.5rem' }}></i>
            <span>Cek Status</span>
          </Link>

          <Link to="/taruna/absensi" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '15px 20px',
            background: 'rgba(46, 204, 113, 0.1)',
            border: '1px solid rgba(46, 204, 113, 0.3)',
            borderRadius: '12px',
            color: '#2ecc71',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(46, 204, 113, 0.2)';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(46, 204, 113, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}>
            <i className="fas fa-calendar-check" style={{ fontSize: '1.5rem' }}></i>
            <span>Absensi</span>
          </Link>

          <Link to="/taruna/profil" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '15px 20px',
            background: 'rgba(231, 76, 60, 0.1)',
            border: '1px solid rgba(231, 76, 60, 0.3)',
            borderRadius: '12px',
            color: '#e74c3c',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(231, 76, 60, 0.2)';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}>
            <i className="fas fa-user-circle" style={{ fontSize: '1.5rem' }}></i>
            <span>Profil Saya</span>
          </Link>
        </div>
      </div>

      {/* Information Box */}
      <div style={{
        background: 'rgba(52, 152, 219, 0.1)',
        border: '1px solid rgba(52, 152, 219, 0.3)',
        borderRadius: '12px',
        padding: '20px',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#3498db' }}>
          <i className="fas fa-info-circle"></i>
          Informasi Penting
        </h4>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Pastikan Anda sudah mengisi form pendaftaran dengan lengkap</li>
          <li>Lakukan absensi secara rutin setiap hari latihan</li>
          <li>Periksa status pendaftaran Anda secara berkala</li>
          <li>Simpan nomor KTA Anda jika sudah diterima</li>
        </ul>
      </div>
    </div>
  );
};

export default TarunaOverview;
