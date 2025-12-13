import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tarunaService } from '../../services/tarunaService';
import toast from 'react-hot-toast';
import { FaSave, FaTimes, FaCamera, FaUpload } from 'react-icons/fa';

const TarunaEditProfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    tinggi_badan: '',
    berat_badan: '',
    nama_orangtua: '',
    alamat: '',
    no_telepon: '',
    pendidikan_terakhir: '',
    kampus: '',
    tingkat: '',
    kelas: ''
  });
  const [files, setFiles] = useState({
    foto_diri: null,
    surat_izin_orangtua: null,
    surat_keterangan_sehat: null
  });
  const [previewUrls, setPreviewUrls] = useState({
    foto_diri: null,
    surat_izin_orangtua: null,
    surat_keterangan_sehat: null
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const statusData = await tarunaService.getPendaftaranStatus();
      if (statusData?.pendaftaran) {
        const data = statusData.pendaftaran;
        setProfileData(data);
        
        // Format tanggal_lahir ke YYYY-MM-DD untuk input date
        let formattedDate = '';
        if (data.tanggal_lahir) {
          const date = new Date(data.tanggal_lahir);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          }
        }
        
        setFormData({
          nama_lengkap: data.nama_lengkap || '',
          jenis_kelamin: data.jenis_kelamin || '',
          tempat_lahir: data.tempat_lahir || '',
          tanggal_lahir: formattedDate,
          tinggi_badan: data.tinggi_badan || '',
          berat_badan: data.berat_badan || '',
          nama_orangtua: data.nama_orangtua || '',
          alamat: data.alamat || '',
          no_telepon: data.no_telepon || '',
          pendidikan_terakhir: data.pendidikan_terakhir || '',
          kampus: data.kampus || '',
          tingkat: data.tingkat || '',
          kelas: data.kelas || ''
        });
        // Set existing file preview URLs
        setPreviewUrls({
          foto_diri: data.foto_diri ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${data.foto_diri}` : null,
          surat_izin_orangtua: data.surat_izin_orangtua ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${data.surat_izin_orangtua}` : null,
          surat_keterangan_sehat: data.surat_keterangan_sehat ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${data.surat_keterangan_sehat}` : null
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }

      // Validate file type
      const validTypes = fieldName === 'foto_diri' 
        ? ['image/jpeg', 'image/jpg', 'image/png']
        : ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      
      if (!validTypes.includes(file.type)) {
        toast.error(fieldName === 'foto_diri' ? 'File harus berupa gambar (JPG/PNG)' : 'File harus berupa gambar atau PDF');
        return;
      }

      setFiles(prev => ({
        ...prev,
        [fieldName]: file
      }));

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => ({
            ...prev,
            [fieldName]: reader.result
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrls(prev => ({
          ...prev,
          [fieldName]: 'pdf'
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Append files if new ones selected
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      await tarunaService.updateProfile(submitData);
      
      toast.success('Profil berhasil diperbarui! 🎉');
      setTimeout(() => navigate('/taruna/profil'), 1000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
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

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(46, 204, 113, 0.2) 100%)',
        border: '1px solid rgba(52, 152, 219, 0.3)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '10px' }}>
          <i className="fas fa-user-edit" style={{ marginRight: '12px' }}></i>
          Edit Profil
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }}>
          Perbarui informasi profil Anda
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Foto Profil */}
        <div style={{
          background: 'rgba(10, 10, 26, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCamera style={{ color: '#3498db' }} />
            Foto Profil
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid rgba(52, 152, 219, 0.4)',
                background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px'
              }}>
                {previewUrls.foto_diri ? (
                  <img 
                    src={previewUrls.foto_diri} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '4rem', color: 'white', fontWeight: '700' }}>
                    {user?.username?.[0]?.toUpperCase() || 'T'}
                  </span>
                )}
              </div>
              <label style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                color: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              className="upload-photo-label">
                <FaUpload style={{ marginRight: '8px' }} />
                Pilih Foto
                <input 
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileChange(e, 'foto_diri')}
                  style={{ display: 'none' }}
                />
              </label>
              <style>{`
                .upload-photo-label:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.4);
                }
              `}</style>
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '10px' }}>
                <strong style={{ color: '#3498db' }}>Persyaratan Foto:</strong>
              </p>
              <ul style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', paddingLeft: '20px' }}>
                <li>Format: JPG atau PNG</li>
                <li>Ukuran maksimal: 5MB</li>
                <li>Foto harus jelas dan terbaru</li>
                <li>Latar belakang polos (disarankan)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Pribadi */}
        <div style={{
          background: 'rgba(10, 10, 26, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: 'white', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-user-circle" style={{ color: '#2ecc71' }}></i>
            Data Pribadi
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <FormField
              label="Nama Lengkap"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleInputChange}
              required
              placeholder="Masukkan nama lengkap"
            />
            
            <FormField
              label="Jenis Kelamin"
              name="jenis_kelamin"
              type="select"
              value={formData.jenis_kelamin}
              onChange={handleInputChange}
              required
              options={[
                { value: '', label: 'Pilih Jenis Kelamin' },
                { value: 'L', label: 'Laki-laki' },
                { value: 'P', label: 'Perempuan' }
              ]}
            />
            
            <FormField
              label="Tempat Lahir"
              name="tempat_lahir"
              value={formData.tempat_lahir}
              onChange={handleInputChange}
              required
              placeholder="Contoh: Jakarta"
            />
            
            <FormField
              label="Tanggal Lahir"
              name="tanggal_lahir"
              type="date"
              value={formData.tanggal_lahir}
              onChange={handleInputChange}
              required
            />
            
            <FormField
              label="Tinggi Badan (cm)"
              name="tinggi_badan"
              type="number"
              value={formData.tinggi_badan}
              onChange={handleInputChange}
              required
              placeholder="Contoh: 170"
            />
            
            <FormField
              label="Berat Badan (kg)"
              name="berat_badan"
              type="number"
              value={formData.berat_badan}
              onChange={handleInputChange}
              required
              placeholder="Contoh: 60"
            />
            
            <FormField
              label="No. Telepon"
              name="no_telepon"
              value={formData.no_telepon}
              onChange={handleInputChange}
              required
              placeholder="Contoh: 08123456789"
            />
            
            <FormField
              label="Pendidikan Terakhir"
              name="pendidikan_terakhir"
              value={formData.pendidikan_terakhir}
              onChange={handleInputChange}
              required
              placeholder="Contoh: SMA/SMK"
            />
            
            <FormField
              label="Kampus"
              name="kampus"
              type="select"
              value={formData.kampus}
              onChange={handleInputChange}
              required
              options={[
                { value: '', label: '-- Pilih Kampus --' },
                { value: 'Kampus 1', label: 'Kampus 1' },
                { value: 'Kampus 2', label: 'Kampus 2' }
              ]}
            />
            
            <FormField
              label="Tingkat"
              name="tingkat"
              type="select"
              value={formData.tingkat}
              onChange={handleInputChange}
              required
              options={[
                { value: '', label: 'Pilih Tingkat' },
                { value: '1', label: 'Tingkat 1' },
                { value: '2', label: 'Tingkat 2' },
                { value: '3', label: 'Tingkat 3' }
              ]}
            />
            
            <FormField
              label="Kelas"
              name="kelas"
              value={formData.kelas}
              onChange={handleInputChange}
              required
              placeholder="Contoh: X-1, XI-2, XII-3"
            />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <FormField
              label="Nama Orang Tua"
              name="nama_orangtua"
              value={formData.nama_orangtua}
              onChange={handleInputChange}
              required
              placeholder="Nama lengkap orang tua/wali"
            />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
              Alamat Lengkap <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              required
              placeholder="Masukkan alamat lengkap"
              rows="3"
              style={{
                width: '100%',
                padding: '12px 15px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Dokumen */}
        <div style={{
          background: 'rgba(10, 10, 26, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: 'white', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-file-alt" style={{ color: '#f39c12' }}></i>
            Dokumen Pendukung
          </h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <FileUploadField
              label="Surat Izin Orang Tua"
              name="surat_izin_orangtua"
              currentFile={profileData?.surat_izin_orangtua}
              preview={previewUrls.surat_izin_orangtua}
              onChange={(e) => handleFileChange(e, 'surat_izin_orangtua')}
              required={!profileData?.surat_izin_orangtua}
            />
            
            <FileUploadField
              label="Surat Keterangan Sehat"
              name="surat_keterangan_sehat"
              currentFile={profileData?.surat_keterangan_sehat}
              preview={previewUrls.surat_keterangan_sehat}
              onChange={(e) => handleFileChange(e, 'surat_keterangan_sehat')}
              required={!profileData?.surat_keterangan_sehat}
            />
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '10px', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', marginBottom: '8px' }}>
              <strong style={{ color: '#3498db' }}>Catatan:</strong>
            </p>
            <ul style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', paddingLeft: '20px', margin: 0 }}>
              <li>Format file: JPG, PNG, atau PDF</li>
              <li>Ukuran maksimal: 5MB per file</li>
              <li>Pastikan dokumen asli dan terbaca dengan jelas</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'flex-end',
          marginTop: '30px'
        }}>
          <button
            type="button"
            onClick={() => navigate('/taruna/profil')}
            disabled={submitting}
            className="cancel-btn"
            style={{
              padding: '14px 30px',
              background: 'rgba(149, 165, 166, 0.2)',
              border: '1px solid rgba(149, 165, 166, 0.3)',
              borderRadius: '12px',
              color: '#95a5a6',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
          >
            <FaTimes />
            Batal
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="save-btn"
            style={{
              padding: '14px 30px',
              background: submitting ? 'rgba(46, 204, 113, 0.5)' : 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
            }}
          >
            {submitting ? (
              <>
                <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Menyimpan...
              </>
            ) : (
              <>
                <FaSave />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
        
        <style>{`
          .cancel-btn:hover:not(:disabled) {
            background: rgba(149, 165, 166, 0.3);
            transform: translateY(-2px);
          }
          .save-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(46, 204, 113, 0.5);
          }
        `}</style>
      </form>
    </div>
  );
};

const FormField = ({ label, name, type = 'text', value, onChange, required, placeholder, options }) => {
  const dateInputRef = React.useRef(null);
  
  const handleDateClick = () => {
    if (type === 'date' && dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (error) {
        // Fallback for browsers that don't support showPicker
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };
  
  return (
    <div>
      <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
        {label} {required && <span style={{ color: '#e74c3c' }}>*</span>}
      </label>
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          style={{
            width: '100%',
            padding: '12px 40px 12px 15px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '0.95rem',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%233498db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            transition: 'all 0.3s ease'
          }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} style={{ background: '#16213e' }}>
              {opt.label}
            </option>
          ))}
        </select>
    ) : type === 'date' ? (
      <>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            ref={dateInputRef}
            type="date"
            name={name}
            value={value}
            onChange={onChange}
            onClick={handleDateClick}
            required={required}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '12px 45px 12px 15px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '0.95rem',
              colorScheme: 'dark',
              cursor: 'pointer'
            }}
          />
          <div 
            onClick={handleDateClick}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              padding: '8px',
              background: 'rgba(52, 152, 219, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10,
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(52, 152, 219, 0.4)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(52, 152, 219, 0.2)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <i className="fas fa-calendar-alt" style={{ color: '#3498db', fontSize: '1.2rem' }}></i>
          </div>
        </div>
        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator {
            opacity: 0;
            position: absolute;
            right: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
          }
          input[type="date"]:hover {
            border-color: rgba(52, 152, 219, 0.5);
          }
          input[type="date"]:focus {
            outline: none;
            border-color: rgba(52, 152, 219, 0.8);
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
          }
          input[type="date"]::-webkit-datetime-edit {
            color: white;
            padding: 0;
          }
          input[type="date"]::-webkit-datetime-edit-fields-wrapper {
            color: white;
          }
          input[type="date"]::-webkit-datetime-edit-text {
            color: rgba(255, 255, 255, 0.5);
            padding: 0 4px;
          }
          input[type="date"]::-webkit-datetime-edit-month-field,
          input[type="date"]::-webkit-datetime-edit-day-field,
          input[type="date"]::-webkit-datetime-edit-year-field {
            color: white;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
            padding: 2px 4px;
          }
          input[type="date"]::-webkit-datetime-edit-month-field:focus,
          input[type="date"]::-webkit-datetime-edit-day-field:focus,
          input[type="date"]::-webkit-datetime-edit-year-field:focus {
            background: rgba(52, 152, 219, 0.2);
            color: #3498db;
          }
        `}</style>
      </>
    ) : (
      <>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 15px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '0.95rem'
          }}
        />
      </>
    )}
    </div>
  );
};

const FileUploadField = ({ label, name, currentFile, preview, onChange, required }) => (
  <div style={{
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }}>
    <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px', fontSize: '0.95rem', fontWeight: '500' }}>
      {label} {required && <span style={{ color: '#e74c3c' }}>*</span>}
    </label>
    
    {currentFile && !preview && (
      <div style={{ marginBottom: '12px', padding: '10px', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '8px', border: '1px solid rgba(46, 204, 113, 0.3)' }}>
        <p style={{ color: '#2ecc71', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-check-circle"></i>
          File sudah diupload: <strong>{currentFile}</strong>
        </p>
      </div>
    )}
    
    {preview && preview !== 'pdf' && (
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <img src={preview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '2px solid rgba(52, 152, 219, 0.3)' }} />
      </div>
    )}
    
    {preview === 'pdf' && (
      <div style={{ marginBottom: '12px', padding: '10px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
        <i className="fas fa-file-pdf" style={{ fontSize: '3rem', color: '#e74c3c' }}></i>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', marginTop: '8px' }}>PDF Dipilih</p>
      </div>
    )}
    
    <label style={{
      display: 'inline-block',
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      color: 'white',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    }}
    className="file-upload-label">
      <FaUpload style={{ marginRight: '8px' }} />
      {currentFile || preview ? 'Ganti File' : 'Pilih File'}
      <input 
        type="file"
        name={name}
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        onChange={onChange}
        required={required}
        style={{ display: 'none' }}
      />
    </label>
    <style>{`
      .file-upload-label:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(243, 156, 18, 0.4);
      }
    `}</style>
  </div>
);

export default TarunaEditProfil;
