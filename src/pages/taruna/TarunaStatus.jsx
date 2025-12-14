import { useState, useEffect } from 'react';
import { tarunaService } from '../../services/tarunaService';

const TarunaStatus = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await tarunaService.getPendaftaranStatus();
      setStatus(data);
    } catch (error) {
      console.error('Error:', error);
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

  if (!status || status.status === 'belum_daftar') {
    return (
      <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(52, 152, 219, 0.1)', border: '1px solid rgba(52, 152, 219, 0.3)', borderRadius: '20px', padding: '40px' }}>
          <i className="fas fa-info-circle" style={{ fontSize: '4rem', color: '#f39c12', marginBottom: '20px' }}></i>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>Belum Ada Pendaftaran</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '25px' }}>
            Anda belum melakukan pendaftaran. Silakan lengkapi form pendaftaran terlebih dahulu.
          </p>
          <a href="/taruna/pendaftaran" style={{
            display: 'inline-block',
            padding: '12px 30px',
            background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Daftar Sekarang
          </a>
        </div>
      </div>
    );
  }

  const pendaftar = status.pendaftaran;
  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: '#f39c12', bg: 'rgba(243, 156, 18, 0.15)', icon: 'fa-clock', label: 'Menunggu Verifikasi' },
      'lolos': { color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.15)', icon: 'fa-check-circle', label: 'Lolos Seleksi' },
      'tidak lolos': { color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.15)', icon: 'fa-times-circle', label: 'Tidak Lolos' }
    };
    return badges[status] || badges.pending;
  };

  const badge = getStatusBadge(status.status);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      {/* Status Badge */}
      <div style={{ 
        background: badge.bg,
        border: `2px solid ${badge.color}`,
        borderRadius: '20px',
        padding: '25px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <i className={`fas ${badge.icon}`} style={{ fontSize: '3rem', color: badge.color, marginBottom: '15px' }}></i>
        <h2 style={{ fontSize: '1.8rem', color: badge.color, marginBottom: '10px' }}>{badge.label}</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
          {status.status === 'pending' && 'Pendaftaran Anda sedang dalam proses verifikasi oleh admin'}
          {status.status === 'lolos' && 'Selamat! Anda telah lolos seleksi Paskibra Rajawali'}
          {status.status === 'tidak lolos' && 'Mohon maaf, pendaftaran Anda belum berhasil kali ini'}
        </p>
      </div>

      {/* KTA Card if Lolos */}
      {status.status === 'lolos' && pendaftar.nomor_kta && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.2) 0%, rgba(230, 126, 34, 0.2) 100%)',
          border: '2px solid rgba(243, 156, 18, 0.5)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <i className="fas fa-id-card" style={{ fontSize: '3rem', color: '#f39c12', marginBottom: '15px' }}></i>
          <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '10px' }}>Nomor KTA Anda</h3>
          <div style={{ 
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#f39c12',
            letterSpacing: '3px',
            fontFamily: 'monospace',
            marginBottom: '15px'
          }}>
            {pendaftar.nomor_kta}
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
            Simpan nomor KTA ini dengan baik
          </p>
        </div>
      )}

      {/* Data Pendaftaran */}
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
          Data Pendaftaran
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <InfoItem label="Nama Lengkap" value={pendaftar.nama_lengkap} />
          <InfoItem label="Tempat, Tanggal Lahir" value={`${pendaftar.tempat_lahir}, ${new Date(pendaftar.tanggal_lahir).toLocaleDateString('id-ID')}`} />
          <InfoItem label="Jenis Kelamin" value={pendaftar.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
          <InfoItem label="Tinggi Badan" value={`${pendaftar.tinggi_badan} cm`} />
          <InfoItem label="Berat Badan" value={`${pendaftar.berat_badan} kg`} />
          <InfoItem label="No. Telepon" value={pendaftar.no_telepon || pendaftar.nomor_whatsapp || '-'} />
          <InfoItem label="Pendidikan Terakhir" value={pendaftar.pendidikan_terakhir} />
          <InfoItem label="Kampus" value={pendaftar.kampus || pendaftar.pilihan_kampus || '-'} />
          <InfoItem label="Tingkat" value={pendaftar.tingkat ? `Tingkat ${pendaftar.tingkat}` : '-'} />
          <InfoItem label="Kelas" value={pendaftar.kelas || '-'} />
          <InfoItem label="Nama Orang Tua" value={pendaftar.nama_orangtua} />
          <InfoItem label="Tanggal Daftar" value={new Date(pendaftar.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </div>

        <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '10px' }}>Alamat Lengkap:</h4>
          <p style={{ color: 'white', lineHeight: '1.6' }}>{pendaftar.alamat}</p>
        </div>
      </div>

      {/* Dokumen */}
      <div style={{ 
        background: 'rgba(10, 10, 26, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '30px'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-folder-open"></i>
          Dokumen Pendaftaran
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <DocumentCard
            icon="fa-image"
            label="Foto Diri"
            filename={pendaftar.foto_diri}
            type="image"
          />
          <DocumentCard
            icon="fa-file-alt"
            label="Surat Izin Orang Tua"
            filename={pendaftar.surat_izin_orangtua}
            type="document"
          />
          <DocumentCard
            icon="fa-file-medical"
            label="Surat Keterangan Sehat"
            filename={pendaftar.surat_keterangan_sehat}
            type="document"
          />
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div style={{ marginBottom: '15px' }}>
    <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '5px' }}>
      {label}
    </label>
    <div style={{ color: 'white', fontSize: '1rem', fontWeight: '500' }}>
      {value || '-'}
    </div>
  </div>
);

const DocumentCard = ({ icon, label, filename, type }) => (
  <div style={{
    background: 'rgba(52, 152, 219, 0.1)',
    border: '1px solid rgba(52, 152, 219, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'rgba(52, 152, 219, 0.2)';
    e.currentTarget.style.transform = 'translateY(-3px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
  onClick={() => {
    if (filename) {
      window.open(`${import.meta.env.VITE_API_URL || 'https://api.paskibmansabo.com'}/uploads/${filename}`, '_blank');
    }
  }}>
    <i className={`fas ${icon}`} style={{ fontSize: '2.5rem', color: '#3498db', marginBottom: '12px' }}></i>
    <h4 style={{ fontSize: '1rem', color: 'white', marginBottom: '8px' }}>{label}</h4>
    {filename ? (
      <span style={{ fontSize: '0.8rem', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        <i className="fas fa-check-circle"></i>
        Terupload
      </span>
    ) : (
      <span style={{ fontSize: '0.8rem', color: '#e74c3c' }}>
        Tidak ada file
      </span>
    )}
  </div>
);

export default TarunaStatus;
