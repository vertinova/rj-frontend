import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tarunaService } from '../../services/tarunaService';
import toast from 'react-hot-toast';
import { FaUserEdit, FaExclamationTriangle, FaCamera } from 'react-icons/fa';

const TarunaProfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const statusData = await tarunaService.getPendaftaranStatus();
      setStatus(statusData);
      setProfileData(statusData?.pendaftaran);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      {/* Profile Header with Photo */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(46, 204, 113, 0.2) 100%)',
        border: '1px solid rgba(52, 152, 219, 0.3)',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '30px',
        textAlign: 'center',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Profile Photo */}
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
          {profileData?.foto_diri ? (
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${profileData.foto_diri}`}
              alt="Foto Profil"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid rgba(52, 152, 219, 0.4)',
                boxShadow: '0 8px 24px rgba(52, 152, 219, 0.4)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)',
            display: profileData?.foto_diri ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'white',
            fontWeight: '700',
            boxShadow: '0 8px 24px rgba(52, 152, 219, 0.4)',
            border: '4px solid rgba(52, 152, 219, 0.4)'
          }}>
            {user?.username?.[0]?.toUpperCase() || 'T'}
          </div>
          
          {/* Camera Icon Overlay */}
          {!profileData?.foto_diri && (
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: 'rgba(231, 76, 60, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid white',
              cursor: 'pointer'
            }}
            title="Foto belum diupload"
            >
              <FaExclamationTriangle style={{ color: 'white', fontSize: '0.9rem' }} />
            </div>
          )}
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'white' }}>
          {profileData?.nama_lengkap || user?.username || 'Taruna'}
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem', marginBottom: '15px' }}>
          {user?.email || 'email@example.com'}
        </p>
        <div style={{
          display: 'inline-block',
          padding: '8px 20px',
          background: status?.status === 'lolos' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)',
          border: status?.status === 'lolos' ? '1px solid rgba(46, 204, 113, 0.4)' : '1px solid rgba(241, 196, 15, 0.4)',
          borderRadius: '20px',
          color: status?.status === 'lolos' ? '#2ecc71' : '#f1c40f',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          <i className="fas fa-user"></i> {status?.status === 'lolos' ? 'Taruna' : 'Calon Taruna'}
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={() => navigate('/taruna/profil/edit')}
          className="edit-profile-btn"
          style={{
            marginTop: '20px',
            padding: '12px 30px',
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
          }}
        >
          <FaUserEdit />
          Edit Profil
        </button>
        <style>{`
          .edit-profile-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(52, 152, 219, 0.5) !important;
          }
          .edit-profile-btn:active {
            transform: translateY(0);
          }
        `}</style>
      </div>

      {/* Warning if no photo */}
      {!profileData?.foto_diri && (
        <div style={{
          background: 'rgba(231, 76, 60, 0.1)',
          border: '1px solid rgba(231, 76, 60, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <FaExclamationTriangle style={{ fontSize: '2rem', color: '#e74c3c', flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#e74c3c', marginBottom: '8px', fontSize: '1.1rem' }}>
              Foto Profil Belum Diupload
            </h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', marginBottom: '10px' }}>
              Upload foto profil Anda dengan menekan tombol "Edit Profil" di atas untuk melengkapi data.
            </p>
            <button
              onClick={() => navigate('/taruna/profil/edit')}
              className="upload-photo-btn"
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)'
              }}
            >
              <FaCamera />
              Upload Foto Sekarang
            </button>
            <style>{`
              .upload-photo-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(231, 76, 60, 0.5) !important;
              }
              .upload-photo-btn:active {
                transform: translateY(0);
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Profile Details */}
      {profileData && (
        <div style={{
          background: 'rgba(10, 10, 26, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-user-circle"></i>
            Data Profil Lengkap
          </h3>

          <div style={{ display: 'grid', gap: '20px' }}>
            <InfoRow
              icon="fa-user"
              label="Nama Lengkap"
              value={profileData.nama_lengkap || '-'}
              color="#3498db"
              missing={!profileData.nama_lengkap}
            />
            <InfoRow
              icon="fa-venus-mars"
              label="Jenis Kelamin"
              value={profileData.jenis_kelamin === 'L' ? 'Laki-laki' : profileData.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
              color="#e91e63"
              missing={!profileData.jenis_kelamin}
            />
            <InfoRow
              icon="fa-map-marker-alt"
              label="Tempat Lahir"
              value={profileData.tempat_lahir || '-'}
              color="#9c27b0"
              missing={!profileData.tempat_lahir}
            />
            <InfoRow
              icon="fa-calendar"
              label="Tanggal Lahir"
              value={profileData.tanggal_lahir ? new Date(profileData.tanggal_lahir).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : '-'}
              color="#673ab7"
              missing={!profileData.tanggal_lahir}
            />
            <InfoRow
              icon="fa-ruler-vertical"
              label="Tinggi Badan"
              value={profileData.tinggi_badan ? `${profileData.tinggi_badan} cm` : '-'}
              color="#3f51b5"
              missing={!profileData.tinggi_badan}
            />
            <InfoRow
              icon="fa-weight"
              label="Berat Badan"
              value={profileData.berat_badan ? `${profileData.berat_badan} kg` : '-'}
              color="#2196f3"
              missing={!profileData.berat_badan}
            />
            <InfoRow
              icon="fa-users"
              label="Nama Orang Tua"
              value={profileData.nama_orangtua || '-'}
              color="#00bcd4"
              missing={!profileData.nama_orangtua}
            />
            <InfoRow
              icon="fa-home"
              label="Alamat"
              value={profileData.alamat || '-'}
              color="#009688"
              missing={!profileData.alamat}
            />
            <InfoRow
              icon="fa-phone"
              label="No. Telepon"
              value={profileData.no_telepon || '-'}
              color="#4caf50"
              missing={!profileData.no_telepon}
            />
            <InfoRow
              icon="fa-graduation-cap"
              label="Pendidikan Terakhir"
              value={profileData.pendidikan_terakhir || '-'}
              color="#8bc34a"
              missing={!profileData.pendidikan_terakhir}
            />
            <InfoRow
              icon="fa-school"
              label="Kampus"
              value={profileData.kampus || '-'}
              color="#cddc39"
              missing={!profileData.kampus}
            />
            <InfoRow
              icon="fa-layer-group"
              label="Tingkat"
              value={profileData.tingkat ? `Tingkat ${profileData.tingkat}` : '-'}
              color="#ff9800"
              missing={!profileData.tingkat}
            />
            <InfoRow
              icon="fa-chalkboard"
              label="Kelas"
              value={profileData.kelas || '-'}
              color="#ff5722"
              missing={!profileData.kelas}
            />
          </div>

          {/* Document Status */}
          <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-file-alt"></i>
              Status Dokumen
            </h4>
            <div style={{ display: 'grid', gap: '15px' }}>
              <DocumentStatus
                label="Foto Diri"
                fileName={profileData.foto_diri}
                uploaded={!!profileData.foto_diri}
              />
              <DocumentStatus
                label="Surat Izin Orang Tua"
                fileName={profileData.surat_izin_orangtua}
                uploaded={!!profileData.surat_izin_orangtua}
              />
              <DocumentStatus
                label="Surat Keterangan Sehat"
                fileName={profileData.surat_keterangan_sehat}
                uploaded={!!profileData.surat_keterangan_sehat}
              />
            </div>
          </div>
        </div>
      )}

      {/* Account Information */}
      <div style={{
        background: 'rgba(10, 10, 26, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-id-card"></i>
          Informasi Akun
        </h3>

        <div style={{ display: 'grid', gap: '20px' }}>
          <InfoRow
            icon="fa-user"
            label="Username"
            value={user?.username || '-'}
            color="#3498db"
          />
          <InfoRow
            icon="fa-envelope"
            label="Email"
            value={user?.email || '-'}
            color="#2ecc71"
          />
          <InfoRow
            icon="fa-shield-alt"
            label="Role"
            value={status?.status === 'lolos' ? 'Taruna' : 'Calon Taruna'}
            color="#f39c12"
          />
          <InfoRow
            icon="fa-calendar-plus"
            label="Bergabung Sejak"
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            }) : '-'}
            color="#9b59b6"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'rgba(10, 10, 26, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-bolt"></i>
          Aksi Cepat
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <ActionButton
            icon="fa-file-alt"
            label="Lihat Pendaftaran"
            href="/taruna/status"
            color="#3498db"
          />
          <ActionButton
            icon="fa-calendar-check"
            label="Absensi"
            href="/taruna/absensi"
            color="#2ecc71"
          />
          <ActionButton
            icon="fa-home"
            label="Dashboard"
            href="/taruna"
            color="#f39c12"
          />
        </div>
      </div>

      {/* Help & Support */}
      <div style={{
        background: 'rgba(52, 152, 219, 0.1)',
        border: '1px solid rgba(52, 152, 219, 0.3)',
        borderRadius: '16px',
        padding: '25px',
        color: 'white'
      }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#3498db', fontSize: '1.2rem' }}>
          <i className="fas fa-question-circle"></i>
          Bantuan & Dukungan
        </h4>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6', marginBottom: '15px' }}>
          Jika Anda memiliki pertanyaan atau mengalami kendala, silakan hubungi admin melalui kontak yang tersedia.
        </p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href="https://wa.me/62895416521553" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'rgba(46, 204, 113, 0.2)',
            border: '1px solid rgba(46, 204, 113, 0.4)',
            borderRadius: '10px',
            color: '#2ecc71',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}>
            <i className="fab fa-whatsapp"></i>
            WhatsApp
          </a>
          <a href="mailto:admin@paskibrarajawali.com" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'rgba(52, 152, 219, 0.2)',
            border: '1px solid rgba(52, 152, 219, 0.4)',
            borderRadius: '10px',
            color: '#3498db',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}>
            <i className="fas fa-envelope"></i>
            Email
          </a>
        </div>
      </div>


    </div>
  );
};

const InfoRow = ({ icon, label, value, color, missing }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: missing ? 'rgba(231, 76, 60, 0.05)' : 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: missing ? '1px solid rgba(231, 76, 60, 0.2)' : 'none',
    transition: 'all 0.3s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = missing ? 'rgba(231, 76, 60, 0.08)' : 'rgba(255, 255, 255, 0.05)';
    e.currentTarget.style.transform = 'translateX(5px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = missing ? 'rgba(231, 76, 60, 0.05)' : 'rgba(255, 255, 255, 0.03)';
    e.currentTarget.style.transform = 'translateX(0)';
  }}>
    <div style={{
      width: '45px',
      height: '45px',
      borderRadius: '10px',
      background: missing ? 'rgba(231, 76, 60, 0.2)' : `${color}22`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <i className={`fas ${icon}`} style={{ fontSize: '1.2rem', color: missing ? '#e74c3c' : color }}></i>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ color: missing ? '#e74c3c' : 'white', fontSize: '1rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
        {missing && <span style={{ fontSize: '0.85rem', marginLeft: '8px' }}>(Belum dilengkapi)</span>}
      </div>
    </div>
  </div>
);

const ActionButton = ({ icon, label, href, color }) => (
  <a
    href={href}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      padding: '20px',
      background: `${color}15`,
      border: `1px solid ${color}44`,
      borderRadius: '12px',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = `${color}25`;
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = `0 8px 20px ${color}44`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = `${color}15`;
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{
      width: '50px',
      height: '50px',
      borderRadius: '12px',
      background: `${color}33`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <i className={`fas ${icon}`} style={{ fontSize: '1.5rem', color }}></i>
    </div>
    <span style={{ fontSize: '0.95rem', fontWeight: '600', color, textAlign: 'center' }}>
      {label}
    </span>
  </a>
);

const DocumentStatus = ({ label, fileName, uploaded }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 15px',
    background: uploaded ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
    border: `1px solid ${uploaded ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`,
    borderRadius: '10px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
      <i className={`fas ${uploaded ? 'fa-check-circle' : 'fa-times-circle'}`} 
         style={{ fontSize: '1.2rem', color: uploaded ? '#2ecc71' : '#e74c3c', flexShrink: 0 }}></i>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'white', fontSize: '0.95rem', fontWeight: '500', marginBottom: '2px' }}>
          {label}
        </div>
        {uploaded && fileName && (
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fileName}
          </div>
        )}
        {!uploaded && (
          <div style={{ color: '#e74c3c', fontSize: '0.8rem' }}>
            Belum diupload
          </div>
        )}
      </div>
    </div>
    {uploaded && (
      <a
        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${fileName}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '6px 12px',
          background: 'rgba(52, 152, 219, 0.2)',
          border: '1px solid rgba(52, 152, 219, 0.4)',
          borderRadius: '6px',
          color: '#3498db',
          fontSize: '0.85rem',
          textDecoration: 'none',
          flexShrink: 0
        }}
      >
        <i className="fas fa-eye"></i>
      </a>
    )}
  </div>
);

export default TarunaProfil;
