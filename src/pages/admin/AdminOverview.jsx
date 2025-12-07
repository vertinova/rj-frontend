import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { 
  FaUsers, 
  FaUserGraduate, 
  FaClipboardCheck, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle,
  FaMale,
  FaFemale 
} from 'react-icons/fa';
import './AdminOverview.css';

const AdminOverview = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      console.log('Fetching statistics...');
      const response = await adminService.getStatistics('all'); // Get all time data for overview
      console.log('Statistics response:', response);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-outer"></div>
          <div className="spinner-inner"></div>
        </div>
        <p className="loading-text">Memuat data statistik...</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p className="empty-state-text">Tidak ada data statistik</p>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, gradient }) => (
    <div className="stat-card">
      <div className={`stat-card-glow`} style={{ background: `linear-gradient(135deg, ${gradient})` }}></div>
      <div className="stat-card-content">
        <div className="stat-card-body">
          <div className="stat-card-info">
            <h3>{title}</h3>
            <div className="stat-card-value" style={{ 
              background: `linear-gradient(135deg, ${gradient})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {value || 0}
            </div>
          </div>
          <div className="stat-card-icon" style={{ background: `linear-gradient(135deg, ${gradient})` }}>
            <Icon />
          </div>
        </div>
      </div>
    </div>
  );

  const { pendaftar = {}, absensi = {}, gender = {} } = statistics;

  return (
    <div className="overview-container fade-in">
      {/* Title */}
      <div className="overview-header">
        <h1 className="overview-title">
          Dashboard Overview
        </h1>
        <p className="overview-subtitle">Statistik dan ringkasan sistem Paskibra Rajawali</p>
      </div>

      {/* Main Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          icon={FaUsers}
          title="Total Pendaftar"
          value={pendaftar.total}
          gradient="#3498db, #2980b9"
        />
        <StatCard
          icon={FaUserGraduate}
          title="Total Taruna"
          value={pendaftar.lolos}
          gradient="#9b59b6, #8e44ad"
        />
        <StatCard
          icon={FaClipboardCheck}
          title="Total Absensi"
          value={absensi.total}
          gradient="#2ecc71, #27ae60"
        />
        <StatCard
          icon={FaMale}
          title="Taruna Laki-laki"
          value={gender.laki_laki}
          gradient="#f39c12, #e67e22"
        />
      </div>

      {/* Status Breakdown */}
      <div className="status-grid">
        <div className="status-card">
          <div className="status-card-glow" style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)' }}></div>
          <div className="status-card-content">
            <div className="status-card-body">
              <div className="status-card-info">
                <h4>Taruna</h4>
                <div className="status-card-value" style={{ color: '#2ecc71' }}>{pendaftar.lolos || 0}</div>
              </div>
              <FaUserGraduate className="status-card-icon" style={{ color: '#2ecc71' }} />
            </div>
          </div>
        </div>

        <div className="status-card">
          <div className="status-card-glow" style={{ background: 'linear-gradient(135deg, #f39c12, #e67e22)' }}></div>
          <div className="status-card-content">
            <div className="status-card-body">
              <div className="status-card-info">
                <h4>Pending</h4>
                <div className="status-card-value" style={{ color: '#f39c12' }}>{pendaftar.pending || 0}</div>
              </div>
              <FaClock className="status-card-icon" style={{ color: '#f39c12' }} />
            </div>
          </div>
        </div>

        <div className="status-card">
          <div className="status-card-glow" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}></div>
          <div className="status-card-content">
            <div className="status-card-body">
              <div className="status-card-info">
                <h4>Tidak Lolos</h4>
                <div className="status-card-value" style={{ color: '#e74c3c' }}>{pendaftar.ditolak || 0}</div>
              </div>
              <FaTimesCircle className="status-card-icon" style={{ color: '#e74c3c' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Absensi & Gender Stats */}
      <div className="info-grid">
        {/* Absensi Stats */}
        <div className="info-card">
          <div className="info-card-header">
            <div className="info-card-icon" style={{ background: 'linear-gradient(135deg, #9b59b6, #8e44ad)' }}>
              <FaClipboardCheck />
            </div>
            <h2 className="info-card-title">Statistik Absensi</h2>
          </div>
          <div className="info-items">
            <div className="info-item">
              <div className="info-item-label">
                <div className="info-item-icon" style={{ color: '#2ecc71' }}>●</div>
                <span>Hadir</span>
              </div>
              <div className="info-item-value" style={{ color: '#2ecc71' }}>{absensi.hadir || 0}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">
                <div className="info-item-icon" style={{ color: '#3498db' }}>●</div>
                <span>Izin</span>
              </div>
              <div className="info-item-value" style={{ color: '#3498db' }}>{absensi.izin || 0}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">
                <div className="info-item-icon" style={{ color: '#f39c12' }}>●</div>
                <span>Sakit</span>
              </div>
              <div className="info-item-value" style={{ color: '#f39c12' }}>{absensi.sakit || 0}</div>
            </div>
            <div className="info-item" style={{ background: 'rgba(46, 204, 113, 0.1)', marginTop: '10px' }}>
              <div className="info-item-label">
                <span style={{ fontWeight: 600 }}>Tingkat Kehadiran</span>
              </div>
              <div className="info-item-value" style={{ color: '#2ecc71' }}>{absensi.attendance_rate || 0}%</div>
            </div>
          </div>
        </div>

        {/* Gender Stats */}
        <div className="info-card">
          <div className="info-card-header">
            <div className="info-card-icon" style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)' }}>
              <FaUsers />
            </div>
            <h2 className="info-card-title">Statistik Gender Taruna</h2>
          </div>
          <div className="info-items">
            <div className="info-item">
              <div className="info-item-label">
                <FaMale className="info-item-icon" style={{ color: '#3498db' }} />
                <span>Laki-laki</span>
              </div>
              <div className="info-item-value" style={{ color: '#3498db' }}>{gender.laki_laki || 0}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">
                <FaFemale className="info-item-icon" style={{ color: '#e91e63' }} />
                <span>Perempuan</span>
              </div>
              <div className="info-item-value" style={{ color: '#e91e63' }}>{gender.perempuan || 0}</div>
            </div>
            <div className="info-item" style={{ background: 'rgba(52, 152, 219, 0.1)', marginTop: '10px' }}>
              <div className="info-item-label">
                <span style={{ fontWeight: 600 }}>Gender Ratio</span>
              </div>
              <div className="info-item-value" style={{ color: '#3498db', fontSize: '1.3rem' }}>
                {gender.percentage_laki || 0}% : {gender.percentage_perempuan || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
