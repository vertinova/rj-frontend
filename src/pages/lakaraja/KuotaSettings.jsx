import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const KuotaSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotas, setQuotas] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [tempValues, setTempValues] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [waitingLists, setWaitingLists] = useState({ SD: 0, SMP: 0, SMA: 0 });
  const [promoting, setPromoting] = useState({});

  useEffect(() => {
    // Check if user is panitia
    const token = localStorage.getItem('lakaraja_token');
    const userData = localStorage.getItem('lakaraja_user');

    if (!token || !userData) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/lakaraja/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'panitia') {
      toast.error('Akses ditolak. Hanya panitia yang dapat mengakses halaman ini.');
      navigate('/lakaraja/dashboard');
      return;
    }

    loadQuotas();
  }, [navigate]);

  const loadQuotas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('lakaraja_token');
      const response = await api.get('/lakaraja/panitia/kuota', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setQuotas(response.data.data);
      
      // Load waiting list counts for each category
      await loadWaitingLists(token);
    } catch (error) {
      console.error('Failed to load quotas:', error);
      toast.error('Gagal memuat data kuota');
    } finally {
      setLoading(false);
    }
  };

  const loadWaitingLists = async (token) => {
    try {
      const categories = ['SD', 'SMP', 'SMA'];
      const waitlistData = {};
      
      for (const kategori of categories) {
        const response = await api.get(`/lakaraja/panitia/waiting-list/${kategori}`, {
          headers: { Authorization: token ? `Bearer ${token}` : `Bearer ${localStorage.getItem('lakaraja_token')}` }
        });
        waitlistData[kategori] = response.data.count || 0;
      }
      
      setWaitingLists(waitlistData);
    } catch (error) {
      console.error('Failed to load waiting lists:', error);
    }
  };

  const handlePromoteWaitingList = async (kategori, count) => {
    try {
      setPromoting({ ...promoting, [kategori]: true });
      const token = localStorage.getItem('lakaraja_token');
      
      await api.post(`/lakaraja/panitia/waiting-list/${kategori}/promote`, 
        { count },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Berhasil mempromosikan ${count} peserta dari waiting list`);
      loadQuotas(); // Reload to get updated counts
    } catch (error) {
      console.error('Failed to promote waiting list:', error);
      toast.error(error.response?.data?.message || 'Gagal mempromosikan waiting list');
    } finally {
      setPromoting({ ...promoting, [kategori]: false });
    }
  };

  const handleEdit = (kategori, currentKuota) => {
    setEditMode({ ...editMode, [kategori]: true });
    setTempValues({ ...tempValues, [kategori]: currentKuota });
  };

  const handleCancel = (kategori) => {
    setEditMode({ ...editMode, [kategori]: false });
    setTempValues({ ...tempValues, [kategori]: undefined });
  };

  const handleSave = async (kategori) => {
    try {
      const newKuota = parseInt(tempValues[kategori]);
      
      if (isNaN(newKuota) || newKuota < 0) {
        toast.error('Kuota harus berupa angka positif');
        return;
      }

      const token = localStorage.getItem('lakaraja_token');
      await api.put('/lakaraja/panitia/kuota', 
        { kategori, kuota: newKuota },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Kuota ${kategori} berhasil diperbarui`);
      setEditMode({ ...editMode, [kategori]: false });
      loadQuotas();
    } catch (error) {
      console.error('Failed to update quota:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui kuota');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem('lakaraja_token');
      await api.post('/lakaraja/panitia/kuota/sync', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Sinkronisasi kuota berhasil');
      loadQuotas();
    } catch (error) {
      console.error('Failed to sync quotas:', error);
      toast.error('Gagal sinkronisasi kuota');
    } finally {
      setSyncing(false);
    }
  };

  const getCategoryIcon = (kategori) => {
    switch(kategori) {
      case 'SD': return '🎒';
      case 'SMP': return '📚';
      case 'SMA': return '🎓';
      default: return '📋';
    }
  };

  const getProgressColor = (terisi, kuota) => {
    if (kuota === 0) return 'bg-gray-500';
    const percentage = (terisi / kuota) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Memuat data kuota...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/lakaraja/panitia')}
            className="mb-4 flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Kembali ke Dashboard</span>
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                Pengaturan Kuota Peserta
              </h1>
              <p className="text-white/60">Kelola kuota pendaftaran per kategori</p>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                syncing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30'
              }`}
            >
              <i className={`fas fa-sync-alt ${syncing ? 'animate-spin' : ''}`}></i>
              {syncing ? 'Sinkronisasi...' : 'Sinkronkan Data'}
            </button>
          </div>
        </div>

        {/* Quota Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quotas.map((quota) => {
            const percentage = quota.kuota > 0 ? (quota.terisi / quota.kuota) * 100 : 0;
            const isEditing = editMode[quota.kategori];
            const progressColor = getProgressColor(quota.terisi, quota.kuota);

            return (
              <div
                key={quota.kategori}
                className="bg-gradient-to-br from-zinc-900 to-black border-2 border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getCategoryIcon(quota.kategori)}</span>
                    <div>
                      <h3 className="text-white text-xl font-bold">{quota.kategori}</h3>
                      <p className="text-white/60 text-sm">Kategori</p>
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <button
                      onClick={() => handleEdit(quota.kategori, quota.kuota)}
                      className="text-orange-400 hover:text-orange-300 transition-colors p-2"
                    >
                      <i className="fas fa-edit text-xl"></i>
                    </button>
                  )}
                </div>

                {/* Quota Display/Edit */}
                <div className="mb-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">Kuota Maksimal</label>
                        <input
                          type="number"
                          min="0"
                          value={tempValues[quota.kategori] ?? quota.kuota}
                          onChange={(e) => setTempValues({ ...tempValues, [quota.kategori]: e.target.value })}
                          className="w-full bg-black/50 border border-orange-500/20 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(quota.kategori)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          <i className="fas fa-check mr-2"></i>
                          Simpan
                        </button>
                        <button
                          onClick={() => handleCancel(quota.kategori)}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-white/60 text-xs mb-1">Terisi</p>
                          <p className="text-white text-2xl font-bold">{quota.terisi}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs mb-1">Kuota</p>
                          <p className="text-orange-400 text-2xl font-bold">{quota.kuota}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Progress</span>
                          <span className="text-white font-semibold">
                            {quota.kuota > 0 ? Math.round(percentage) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mt-4 space-y-3">
                        {quota.kuota === 0 ? (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <i className="fas fa-info-circle"></i>
                            <span>Kuota belum diatur</span>
                          </div>
                        ) : quota.terisi >= quota.kuota ? (
                          <div className="flex items-center gap-2 text-red-400 text-sm">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>Kuota Penuh!</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <i className="fas fa-check-circle"></i>
                            <span>Tersedia: {quota.kuota - quota.terisi} slot</span>
                          </div>
                        )}
                        
                        {/* Waiting List Info */}
                        {waitingLists[quota.kategori] > 0 && (
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                <i className="fas fa-hourglass-half"></i>
                                <span className="font-semibold">{waitingLists[quota.kategori]} Waiting List</span>
                              </div>
                            </div>
                            
                            {/* Promote Button */}
                            <button
                              onClick={() => handlePromoteWaitingList(quota.kategori, 1)}
                              disabled={promoting[quota.kategori]}
                              className={`w-full mt-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                                promoting[quota.kategori]
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                              }`}
                            >
                              <i className={`fas fa-arrow-up mr-2 ${promoting[quota.kategori] ? 'animate-pulse' : ''}`}></i>
                              {promoting[quota.kategori] ? 'Memproses...' : 'Promosikan 1 Peserta'}
                            </button>
                            
                            {waitingLists[quota.kategori] > 1 && (
                              <button
                                onClick={() => handlePromoteWaitingList(quota.kategori, waitingLists[quota.kategori])}
                                disabled={promoting[quota.kategori]}
                                className="w-full mt-2 px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-all"
                              >
                                <i className="fas fa-arrows-up mr-2"></i>
                                Promosikan Semua ({waitingLists[quota.kategori]})
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Last Updated */}
                {!isEditing && quota.updated_by_username && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-white/40 text-xs">
                      Terakhir diperbarui oleh <span className="text-orange-400">{quota.updated_by_username}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <i className="fas fa-info-circle text-blue-400 text-2xl mt-1"></i>
            <div>
              <h4 className="text-white font-bold mb-2">Informasi Pengaturan Kuota</h4>
              <ul className="text-white/60 text-sm space-y-2">
                <li>• Kuota menentukan jumlah maksimal peserta yang dapat mendaftar per kategori</li>
                <li>• Kuota tidak boleh kurang dari jumlah peserta yang sudah terdaftar (approved)</li>
                <li>• Jika kuota penuh, pendaftaran baru akan masuk ke <strong className="text-yellow-400">Waiting List</strong></li>
                <li>• Promosikan waiting list secara manual atau otomatis saat kuota ditambah</li>
                <li>• Gunakan tombol "Sinkronkan Data" untuk memperbarui jumlah terisi otomatis</li>
                <li>• Jika kuota 0, kategori tersebut tidak dapat menerima pendaftaran baru</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KuotaSettings;
