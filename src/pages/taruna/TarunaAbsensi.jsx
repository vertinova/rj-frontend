import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tarunaService } from '../../services/tarunaService';
import toast from 'react-hot-toast';
import { 
  FaExclamationTriangle, 
  FaUserEdit,
  FaTimes
} from 'react-icons/fa';

const TarunaAbsensi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [absensiList, setAbsensiList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [formData, setFormData] = useState({
    status_absensi: 'hadir',
    kampus: '',
    keterangan: '',
    foto_absensi: null
  });

  useEffect(() => {
    checkProfileAndFetchData();
  }, []);

  const checkProfileAndFetchData = async () => {
    try {
      setLoading(true);
      const [statusData, absensiData, profileCheck] = await Promise.all([
        tarunaService.getPendaftaranStatus(),
        tarunaService.getAbsensiHistory(),
        tarunaService.checkProfileCompleteness()
      ]);
      setStatus(statusData);
      setAbsensiList(absensiData || []);
      setProfileComplete(profileCheck.isComplete);
      setMissingFields(profileCheck.missingFields || []);
      
      if (!profileCheck.isComplete) {
        toast.error(profileCheck.message, { duration: 5000 });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowForm = () => {
    if (!profileComplete) {
      setShowProfileWarning(true);
      return;
    }
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, foto_absensi: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.status_absensi === 'hadir') {
      if (!formData.kampus) {
        toast.error('Pilih kampus untuk absensi hadir');
        return;
      }
      if (!formData.foto_absensi) {
        toast.error('Upload foto untuk absensi hadir');
        return;
      }
    } else {
      if (!formData.keterangan) {
        toast.error('Isi keterangan untuk izin/sakit');
        return;
      }
    }

    setSubmitting(true);
    const submitData = new FormData();
    submitData.append('tanggal_absensi', new Date().toISOString().split('T')[0]);
    submitData.append('status_absensi', formData.status_absensi);
    
    if (formData.status_absensi === 'hadir') {
      submitData.append('kampus', formData.kampus);
      submitData.append('foto_absensi', formData.foto_absensi);
    } else {
      submitData.append('keterangan', formData.keterangan);
    }

    try {
      await tarunaService.submitAbsensi(submitData);
      toast.success('Absensi berhasil dicatat!');
      setShowForm(false);
      setFormData({
        status_absensi: 'hadir',
        kampus: '',
        keterangan: '',
        foto_absensi: null
      });
      checkProfileAndFetchData();
    } catch (error) {
      toast.error(error.message || 'Gagal submit absensi');
    } finally {
      setSubmitting(false);
    }
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

  if (!status || status.status !== 'lolos') {
    return (
      <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '20px', padding: '40px' }}>
          <i className="fas fa-lock" style={{ fontSize: '4rem', color: '#e74c3c', marginBottom: '20px' }}></i>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>Akses Ditolak</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '25px' }}>
            Anda harus lolos seleksi terlebih dahulu untuk dapat melakukan absensi.
          </p>
        </div>
      </div>
    );
  }

  // Check if already present today
  const today = new Date().toISOString().split('T')[0];
  const alreadyPresentToday = absensiList.some(item => item.tanggal_absensi === today);

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem',
    fontWeight: '500'
  };

  // Profile Warning Modal Component
  const ProfileWarningModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        position: 'relative',
        border: '1px solid rgba(231, 76, 60, 0.3)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <button
          onClick={() => setShowProfileWarning(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: '#95a5a6',
            cursor: 'pointer',
            fontSize: '1.5rem',
            padding: '5px'
          }}
        >
          <FaTimes />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(231, 76, 60, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '3px solid rgba(231, 76, 60, 0.4)'
          }}>
            <FaExclamationTriangle style={{ fontSize: '2.5rem', color: '#e74c3c' }} />
          </div>
          <h2 style={{ color: 'white', marginBottom: '10px', fontSize: '1.8rem' }}>
            Profil Belum Lengkap
          </h2>
          <p style={{ color: '#95a5a6', fontSize: '1rem' }}>
            Anda harus melengkapi profil terlebih dahulu untuk melakukan absensi
          </p>
        </div>

        <div style={{
          background: 'rgba(231, 76, 60, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          border: '1px solid rgba(231, 76, 60, 0.2)'
        }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '15px', fontSize: '1rem', fontWeight: '600' }}>
            Data yang Belum Dilengkapi:
          </h3>
          <ul style={{ color: '#ecf0f1', paddingLeft: '20px', margin: 0 }}>
            {missingFields.map((field, index) => (
              <li key={index} style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
                {field}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => {
              setShowProfileWarning(false);
              navigate('/taruna/profil');
            }}
            style={{
              flex: 1,
              padding: '15px',
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <FaUserEdit />
            Lengkapi Profil
          </button>
          <button
            onClick={() => setShowProfileWarning(false)}
            style={{
              padding: '15px 30px',
              background: 'rgba(149, 165, 166, 0.2)',
              border: '1px solid rgba(149, 165, 166, 0.3)',
              borderRadius: '12px',
              color: '#95a5a6',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      {/* Profile Warning Modal */}
      {showProfileWarning && <ProfileWarningModal />}

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard
          icon="fa-calendar-check"
          label="Total Hadir"
          value={absensiList.filter(a => a.status_absensi === 'hadir').length}
          color="#2ecc71"
        />
        <StatCard
          icon="fa-calendar-times"
          label="Total Izin"
          value={absensiList.filter(a => a.status_absensi === 'izin').length}
          color="#f39c12"
        />
        <StatCard
          icon="fa-notes-medical"
          label="Total Sakit"
          value={absensiList.filter(a => a.status_absensi === 'sakit').length}
          color="#e74c3c"
        />
        <StatCard
          icon="fa-list"
          label="Total Absensi"
          value={absensiList.length}
          color="#3498db"
        />
      </div>

      {/* Absen Button */}
      {!showForm && !alreadyPresentToday && (
        <button
          onClick={handleShowForm}
          style={{
            width: '100%',
            padding: '20px',
            background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(46, 204, 113, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(46, 204, 113, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(46, 204, 113, 0.3)';
          }}
        >
          <i className="fas fa-check-circle"></i>
          Absen Sekarang
        </button>
      )}

      {/* Already Present Today */}
      {alreadyPresentToday && !showForm && (
        <div style={{
          background: 'rgba(46, 204, 113, 0.1)',
          border: '1px solid rgba(46, 204, 113, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center',
          color: 'white'
        }}>
          <i className="fas fa-check-circle" style={{ fontSize: '2.5rem', color: '#2ecc71', marginBottom: '12px' }}></i>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Sudah Absen Hari Ini</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Anda sudah melakukan absensi untuk hari ini
          </p>
        </div>
      )}

      {/* Absensi Form */}
      {showForm && (
        <div style={{
          background: 'rgba(10, 10, 26, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-clipboard-check"></i>
            Form Absensi
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Status Absensi <span style={{ color: '#e74c3c' }}>*</span></label>
              <select
                name="status_absensi"
                value={formData.status_absensi}
                onChange={handleInputChange}
                required
                style={inputStyle}
              >
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
              </select>
            </div>

            {formData.status_absensi === 'hadir' ? (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Pilih Kampus <span style={{ color: '#e74c3c' }}>*</span></label>
                  <select
                    name="kampus"
                    value={formData.kampus}
                    onChange={handleInputChange}
                    required
                    style={{
                      ...inputStyle,
                      backgroundImage: 'linear-gradient(135deg, rgba(52, 152, 219, 0.05) 0%, rgba(46, 204, 113, 0.05) 100%)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 15px center',
                      backgroundSize: '12px',
                      paddingRight: '40px'
                    }}
                  >
                    <option value="" style={{ background: '#1a1a2e', color: 'rgba(255, 255, 255, 0.5)' }}>
                      -- Pilih Lokasi Kampus --
                    </option>
                    <option value="Kampus 1" style={{ background: '#1a1a2e', color: 'white', padding: '10px', fontWeight: '600' }}>
                      📍 Kampus 1
                    </option>
                    <option value="Kampus 2" style={{ background: '#1a1a2e', color: 'white', padding: '10px', fontWeight: '600' }}>
                      📍 Kampus 2
                    </option>
                  </select>
                  <style>{`
                    select::-ms-expand {
                      display: none;
                    }
                    select {
                      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233498db' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
                    }
                    select option {
                      padding: 12px !important;
                      background: #1a1a2e !important;
                    }
                    select option:hover {
                      background: linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(46, 204, 113, 0.2) 100%) !important;
                    }
                  `}</style>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Foto Absensi <span style={{ color: '#e74c3c' }}>*</span></label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png"
                    required
                    style={{ ...inputStyle, padding: '12px' }}
                  />
                  <small style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', display: 'block', marginTop: '5px' }}>
                    Format: JPG, JPEG, PNG. Maks 5MB
                  </small>
                </div>
              </>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Keterangan <span style={{ color: '#e74c3c' }}>*</span></label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  required
                  style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Tuliskan alasan izin/sakit..."
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: '14px',
                  background: submitting ? 'rgba(46, 204, 113, 0.5)' : 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {submitting ? (
                  <>
                    <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Submit Absensi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Absensi History */}
      <div style={{
        background: 'rgba(10, 10, 26, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '30px'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-history"></i>
          Riwayat Absensi
        </h3>

        {absensiList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255, 255, 255, 0.5)' }}>
            <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '15px' }}></i>
            <p>Belum ada riwayat absensi</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {absensiList.sort((a, b) => new Date(b.tanggal_absensi) - new Date(a.tanggal_absensi)).map((item, index) => (
              <AbsensiCard key={index} data={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: `${color}22`,
    border: `1px solid ${color}44`,
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-3px)';
    e.currentTarget.style.boxShadow = `0 8px 20px ${color}44`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    <i className={`fas ${icon}`} style={{ fontSize: '2.5rem', color, marginBottom: '12px' }}></i>
    <div style={{ fontSize: '2rem', fontWeight: '700', color, marginBottom: '8px' }}>{value}</div>
    <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>{label}</div>
  </div>
);

const AbsensiCard = ({ data }) => {
  const getStatusBadge = (status) => {
    const badges = {
      'hadir': { color: '#2ecc71', icon: 'fa-check-circle', label: 'Hadir' },
      'izin': { color: '#f39c12', icon: 'fa-calendar-times', label: 'Izin' },
      'sakit': { color: '#e74c3c', icon: 'fa-notes-medical', label: 'Sakit' },
      'alpha': { color: '#95a5a6', icon: 'fa-times-circle', label: 'Alpha' }
    };
    return badges[status] || badges.alpha;
  };

  const badge = getStatusBadge(data.status_absensi);
  const date = new Date(data.tanggal_absensi);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '18px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
      e.currentTarget.style.transform = 'translateX(5px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
      e.currentTarget.style.transform = 'translateX(0)';
    }}>
      <div style={{ 
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        background: `${badge.color}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <i className={`fas ${badge.icon}`} style={{ fontSize: '1.5rem', color: badge.color }}></i>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{ 
            background: `${badge.color}22`,
            color: badge.color,
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            {badge.label}
          </span>
          <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
            {date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        {data.kampus && (
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem', marginBottom: '4px' }}>
            <i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: '#3498db' }}></i>
            {data.kampus}
          </div>
        )}
        {data.keterangan && (
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
            <i className="fas fa-comment" style={{ marginRight: '8px' }}></i>
            {data.keterangan}
          </div>
        )}
      </div>

      {data.foto_absensi && (
        <button
          onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/absensi/${data.foto_absensi}`, '_blank')}
          style={{
            padding: '8px 16px',
            background: 'rgba(52, 152, 219, 0.2)',
            border: '1px solid rgba(52, 152, 219, 0.4)',
            borderRadius: '8px',
            color: '#3498db',
            fontSize: '0.85rem',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <i className="fas fa-image"></i>
        </button>
      )}
    </div>
  );
};

export default TarunaAbsensi;
