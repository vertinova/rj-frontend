import { useState, useEffect } from 'react';
import { tarunaService } from '../../services/tarunaService';
import toast from 'react-hot-toast';

const TarunaPendaftaran = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    alamat: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    tinggi_badan: '',
    berat_badan: '',
    nama_orangtua: '',
    nomor_whatsapp: '',
    alasan: '',
    pendidikan_terakhir: 'SMA',
    kelas: '',
    pilihan_kampus: ''
  });
  const [files, setFiles] = useState({
    foto_diri: null,
    surat_izin_orangtua: null,
    surat_keterangan_sehat: null
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const data = await tarunaService.getPendaftaranStatus();
      setStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles(prev => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!files.foto_diri || !files.surat_izin_orangtua || !files.surat_keterangan_sehat) {
      toast.error('Semua dokumen wajib diunggah!');
      return;
    }

    setSubmitting(true);
    const submitData = new FormData();
    
    // Append form data
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    // Append files
    submitData.append('foto_diri', files.foto_diri);
    submitData.append('surat_izin_orangtua', files.surat_izin_orangtua);
    submitData.append('surat_keterangan_sehat', files.surat_keterangan_sehat);

    try {
      await tarunaService.submitPendaftaran(submitData);
      toast.success('Pendaftaran berhasil disubmit! Menunggu verifikasi admin.');
      checkStatus();
    } catch (error) {
      toast.error(error.message || 'Gagal submit pendaftaran');
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
      </div>
    );
  }

  if (status && status.status !== 'belum_daftar') {
    return (
      <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(52, 152, 219, 0.1)', border: '1px solid rgba(52, 152, 219, 0.3)', borderRadius: '20px', padding: '40px' }}>
          <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#2ecc71', marginBottom: '20px' }}></i>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>Anda Sudah Mendaftar</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '25px' }}>
            Pendaftaran hanya dapat dilakukan satu kali. Silakan cek status pendaftaran Anda.
          </p>
          <a href="/taruna/status" style={{
            display: 'inline-block',
            padding: '12px 30px',
            background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Lihat Status Pendaftaran
          </a>
        </div>
      </div>
    );
  }

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

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%233498db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem',
    fontWeight: '500'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📝 Form Pendaftaran Calon Taruna
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem' }}>
          Lengkapi data diri Anda dengan benar
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Data Diri Section */}
        <div style={{ background: 'rgba(10, 10, 26, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '25px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#3498db', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-user"></i> Data Diri
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Nama Lengkap <span style={{ color: '#e74c3c' }}>*</span></label>
            <input
              type="text"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleInputChange}
              required
              style={inputStyle}
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Tempat Lahir <span style={{ color: '#e74c3c' }}>*</span></label>
              <input
                type="text"
                name="tempat_lahir"
                value={formData.tempat_lahir}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Kota kelahiran"
              />
            </div>
            <div>
              <label style={labelStyle}>Tanggal Lahir <span style={{ color: '#e74c3c' }}>*</span></label>
              <input
                type="date"
                name="tanggal_lahir"
                value={formData.tanggal_lahir}
                onChange={handleInputChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Jenis Kelamin <span style={{ color: '#e74c3c' }}>*</span></label>
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleInputChange}
                required
                style={selectStyle}
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Kelas <span style={{ color: '#e74c3c' }}>*</span></label>
              <input
                type="text"
                name="kelas"
                value={formData.kelas}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Contoh: 10 IPA 1"
              />
            </div>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Tinggi Badan (cm) <span style={{ color: '#e74c3c' }}>*</span></label>
              <input
                type="number"
                name="tinggi_badan"
                value={formData.tinggi_badan}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="160"
              />
            </div>
            <div>
              <label style={labelStyle}>Berat Badan (kg) <span style={{ color: '#e74c3c' }}>*</span></label>
              <input
                type="number"
                name="berat_badan"
                value={formData.berat_badan}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="50"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Alamat Lengkap <span style={{ color: '#e74c3c' }}>*</span></label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              required
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota"
            />
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Pendidikan Terakhir <span style={{ color: '#e74c3c' }}>*</span></label>
              <select
                name="pendidikan_terakhir"
                value={formData.pendidikan_terakhir}
                onChange={handleInputChange}
                required
                style={selectStyle}
              >
                <option value="SMP">SMP</option>
                <option value="SMA">SMA/SMK</option>
                <option value="Kuliah">Kuliah</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Pilihan Kampus <span style={{ color: '#e74c3c' }}>*</span></label>
              <select
                name="pilihan_kampus"
                value={formData.pilihan_kampus}
                onChange={handleInputChange}
                required
                style={{
                  ...selectStyle,
                  fontWeight: '600'
                }}
              >
                <option value="">-- Pilih Lokasi Kampus --</option>
                <option value="Kampus 1">📍 Kampus 1</option>
                <option value="Kampus 2">📍 Kampus 2</option>
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
          </div>
        </div>

        {/* Data Orang Tua Section */}
        <div style={{ background: 'rgba(10, 10, 26, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '25px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-users"></i> Data Orang Tua/Wali
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Nama Orang Tua/Wali <span style={{ color: '#e74c3c' }}>*</span></label>
            <input
              type="text"
              name="nama_orangtua"
              value={formData.nama_orangtua}
              onChange={handleInputChange}
              required
              style={inputStyle}
              placeholder="Nama lengkap orang tua/wali"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Nomor WhatsApp <span style={{ color: '#e74c3c' }}>*</span></label>
            <input
              type="tel"
              name="nomor_whatsapp"
              value={formData.nomor_whatsapp}
              onChange={handleInputChange}
              required
              style={inputStyle}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label style={labelStyle}>Alasan Mendaftar <span style={{ color: '#e74c3c' }}>*</span></label>
            <textarea
              name="alasan"
              value={formData.alasan}
              onChange={handleInputChange}
              required
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              placeholder="Tuliskan alasan Anda ingin bergabung dengan Paskibra Rajawali..."
            />
          </div>
        </div>

        {/* Upload Dokumen Section */}
        <div style={{ background: 'rgba(10, 10, 26, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '25px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#f39c12', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-file-upload"></i> Upload Dokumen
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Foto Diri <span style={{ color: '#e74c3c' }}>*</span></label>
            <input
              type="file"
              name="foto_diri"
              onChange={handleFileChange}
              accept="image/jpeg,image/jpg,image/png"
              required
              style={{ ...inputStyle, padding: '12px' }}
            />
            <small style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', display: 'block', marginTop: '5px' }}>
              Format: JPG, JPEG, PNG. Maks 2MB
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Surat Izin Orang Tua <span style={{ color: '#e74c3c' }}>*</span></label>
            <input
              type="file"
              name="surat_izin_orangtua"
              onChange={handleFileChange}
              accept=".pdf,image/jpeg,image/jpg,image/png"
              required
              style={{ ...inputStyle, padding: '12px' }}
            />
            <small style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', display: 'block', marginTop: '5px' }}>
              Format: PDF, JPG, PNG
            </small>
          </div>

          <div>
            <label style={labelStyle}>Surat Keterangan Sehat <span style={{ color: '#e74c3c' }}>*</span></label>
            <input
              type="file"
              name="surat_keterangan_sehat"
              onChange={handleFileChange}
              accept=".pdf,image/jpeg,image/jpg,image/png"
              required
              style={{ ...inputStyle, padding: '12px' }}
            />
            <small style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', display: 'block', marginTop: '5px' }}>
              Format: PDF, JPG, PNG
            </small>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '16px',
            background: submitting ? 'rgba(52, 152, 219, 0.5)' : 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          {submitting ? (
            <>
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Mengirim...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i>
              Submit Pendaftaran
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TarunaPendaftaran;
