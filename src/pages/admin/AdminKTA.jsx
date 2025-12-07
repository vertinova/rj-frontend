import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { 
  FaIdCard,
  FaCheckCircle,
  FaSpinner,
  FaSearch
} from 'react-icons/fa';

const AdminKTA = () => {
  const [pendaftar, setPendaftar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPendaftarLolos();
  }, []);

  const fetchPendaftarLolos = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendaftar({ 
        status: 'lolos', 
        limit: 100 
      });
      // Filter hanya yang belum punya nomor KTA
      const filtered = response.data.filter(p => !p.nomor_kta);
      setPendaftar(filtered);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKTA = async (pendaftarId) => {
    try {
      setGeneratingId(pendaftarId);
      const response = await adminService.generateKTA(pendaftarId);
      toast.success(response.message);
      // Remove from list after successful generation
      setPendaftar(prev => prev.filter(p => p.id !== pendaftarId));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGeneratingId(null);
    }
  };

  const filteredPendaftar = pendaftar.filter(p => 
    p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Generate Nomor KTA
          </h1>
          <p className="text-gray-400">Generate Kartu Tanda Anggota untuk taruna yang lolos</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <FaIdCard className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Informasi Generate KTA</h3>
              <p className="text-gray-400 text-sm mb-2">
                Nomor KTA akan digenerate otomatis dengan format: <span className="text-cyan-400 font-mono">KTA-{new Date().getFullYear()}-XXXX</span>
              </p>
              <p className="text-gray-400 text-sm">
                Hanya taruna dengan status <span className="text-green-400 font-semibold">LOLOS</span> dan belum memiliki nomor KTA yang dapat digenerate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Pendaftar List */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredPendaftar.length === 0 ? (
            <div className="text-center py-12">
              <FaCheckCircle className="text-green-400 text-5xl mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {pendaftar.length === 0 
                  ? 'Semua taruna lolos sudah memiliki nomor KTA' 
                  : 'Tidak ada hasil pencarian'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Kelas</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tanggal Daftar</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredPendaftar.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {item.nama_lengkap}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.kelas}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(item.tanggal_daftar).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleGenerateKTA(item.id)}
                          disabled={generatingId === item.id}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingId === item.id ? (
                            <>
                              <FaSpinner className="inline mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <FaIdCard className="inline mr-2" />
                              Generate KTA
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {!loading && pendaftar.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Total Belum Generate</p>
                <p className="text-4xl font-bold text-green-400">{filteredPendaftar.length}</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Format KTA</p>
                <p className="text-xl font-mono font-bold text-purple-400">KTA-{new Date().getFullYear()}-XXXX</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Tahun Angkatan</p>
                <p className="text-4xl font-bold text-blue-400">{new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKTA;
