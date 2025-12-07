import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import {
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaUserShield,
  FaUser,
  FaMale,
  FaFemale,
  FaCalendarCheck,
  FaCalendarTimes,
  FaChartLine,
  FaTrophy,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaClock,
  FaPercentage
} from 'react-icons/fa';

const AdminStatistik = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendaftar: {
      total: 0,
      lolos: 0,
      pending: 0,
      ditolak: 0,
      byMonth: []
    },
    absensi: {
      total: 0,
      hadir: 0,
      izin: 0,
      sakit: 0,
      byKampus: [],
      byDate: [],
      attendance_rate: 0
    },
    gender: {
      total: 0,
      laki_laki: 0,
      perempuan: 0,
      distribution: [],
      percentage_laki: 0,
      percentage_perempuan: 0
    }
  });

  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, year

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getStatistics(selectedPeriod);
      setStats(response.data);
    } catch (error) {
      toast.error('Gagal memuat statistik: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  // Stat Card Component
  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity`}></div>
      <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
            <Icon className="text-2xl text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              trend > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <FaChartLine />
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  // Progress Bar Component
  const ProgressBar = ({ label, value, max, color, icon: Icon }) => {
    const percentage = max > 0 ? (value / max * 100).toFixed(1) : 0;
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className={`text-${color}-400`} />}
            <span className="text-gray-300 text-sm font-medium">{label}</span>
          </div>
          <span className="text-white font-bold text-sm">{value} ({percentage}%)</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${color} transition-all duration-500 rounded-full`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Chart Bar Component (Simple vertical bar)
  const ChartBar = ({ label, value, max, color }) => {
    const height = max > 0 ? (value / max * 100) : 0;
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-16 h-40 bg-gray-800 rounded-t-xl overflow-hidden">
          <div
            className={`absolute bottom-0 w-full bg-gradient-to-t ${color} transition-all duration-500`}
            style={{ height: `${height}%` }}
          >
            <div className="absolute top-2 left-0 right-0 text-center text-white text-xs font-bold">
              {value}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium text-center">{label}</span>
      </div>
    );
  };

  // Period Selector
  const PeriodButton = ({ period, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-800 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  const { pendaftar, absensi, gender } = stats;

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            📊 Statistik & Analytics
          </h1>
          <p className="text-gray-400">Dashboard analytics dan insights data sistem</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          <PeriodButton
            period="week"
            label="Minggu Ini"
            active={selectedPeriod === 'week'}
            onClick={() => setSelectedPeriod('week')}
          />
          <PeriodButton
            period="month"
            label="Bulan Ini"
            active={selectedPeriod === 'month'}
            onClick={() => setSelectedPeriod('month')}
          />
          <PeriodButton
            period="year"
            label="Tahun Ini"
            active={selectedPeriod === 'year'}
            onClick={() => setSelectedPeriod('year')}
          />
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaUsers}
          title="Total Pendaftar"
          value={pendaftar.total}
          subtitle="Semua pendaftar"
          color="from-blue-500 to-cyan-500"
          trend={12}
        />
        <StatCard
          icon={FaGraduationCap}
          title="Total Taruna"
          value={pendaftar.lolos}
          subtitle={`${pendaftar.total > 0 ? ((pendaftar.lolos / pendaftar.total) * 100).toFixed(1) : 0}% dari total`}
          color="from-green-500 to-emerald-500"
          trend={8}
        />
        <StatCard
          icon={FaCalendarCheck}
          title="Total Absensi"
          value={absensi.total}
          subtitle="Semua record absensi"
          color="from-purple-500 to-pink-500"
          trend={15}
        />
        <StatCard
          icon={FaUsers}
          title="Total Taruna"
          value={gender.total}
          subtitle={`${gender.laki_laki} Laki-laki, ${gender.perempuan} Perempuan`}
          color="from-orange-500 to-red-500"
          trend={5}
        />
      </div>

      {/* Pendaftar Statistics */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
              <FaGraduationCap className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Statistik Pendaftar</h2>
              <p className="text-gray-400 text-sm">Breakdown status pendaftaran</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress Bars */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-400" />
                Status Pendaftar
              </h3>
              <ProgressBar
                label="Lolos Seleksi"
                value={pendaftar.lolos}
                max={pendaftar.total}
                color="from-green-500 to-emerald-500"
                icon={FaUserCheck}
              />
              <ProgressBar
                label="Menunggu"
                value={pendaftar.pending}
                max={pendaftar.total}
                color="from-yellow-500 to-orange-500"
                icon={FaUserClock}
              />
              <ProgressBar
                label="Ditolak"
                value={pendaftar.ditolak}
                max={pendaftar.total}
                color="from-red-500 to-pink-500"
                icon={FaUserTimes}
              />
            </div>

            {/* Chart */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaChartLine className="text-purple-400" />
                Visualisasi Data
              </h3>
              <div className="flex items-end justify-around h-48 bg-gray-800/50 rounded-xl p-4">
                <ChartBar
                  label="Lolos"
                  value={pendaftar.lolos}
                  max={pendaftar.total}
                  color="from-green-500 to-emerald-500"
                />
                <ChartBar
                  label="Pending"
                  value={pendaftar.pending}
                  max={pendaftar.total}
                  color="from-yellow-500 to-orange-500"
                />
                <ChartBar
                  label="Ditolak"
                  value={pendaftar.ditolak}
                  max={pendaftar.total}
                  color="from-red-500 to-pink-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Absensi Statistics */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <FaCalendarCheck className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Statistik Absensi</h2>
              <p className="text-gray-400 text-sm">Kehadiran dan ketidakhadiran taruna</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Attendance Rate */}
            <div className="col-span-1 md:col-span-3">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-30"></div>
                <div className="relative bg-gray-800/90 p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-semibold flex items-center gap-2">
                      <FaPercentage className="text-green-400" />
                      Tingkat Kehadiran
                    </span>
                    <span className="text-3xl font-bold text-green-400">
                      {absensi.attendance_rate || 0}%
                    </span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${absensi.attendance_rate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaClock className="text-blue-400" />
                Status Absensi
              </h3>
              <ProgressBar
                label="Hadir"
                value={absensi.hadir}
                max={absensi.total}
                color="from-green-500 to-emerald-500"
                icon={FaCalendarCheck}
              />
              <ProgressBar
                label="Izin"
                value={absensi.izin}
                max={absensi.total}
                color="from-blue-500 to-cyan-500"
                icon={FaUserClock}
              />
              <ProgressBar
                label="Sakit"
                value={absensi.sakit}
                max={absensi.total}
                color="from-yellow-500 to-orange-500"
                icon={FaCalendarTimes}
              />
            </div>

            {/* By Kampus */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-pink-400" />
                Per Kampus
              </h3>
              {absensi.byKampus && absensi.byKampus.length > 0 ? (
                absensi.byKampus.map((kampus, idx) => (
                  <ProgressBar
                    key={idx}
                    label={kampus.kampus || `Kampus ${idx + 1}`}
                    value={kampus.total}
                    max={absensi.total}
                    color={idx === 0 ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'}
                    icon={FaMapMarkerAlt}
                  />
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Belum ada data per kampus
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gender Statistics */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-20"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
              <FaGraduationCap className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Statistik Gender Taruna</h2>
              <p className="text-gray-400 text-sm">Distribusi jenis kelamin taruna (lolos seleksi)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-4">Distribusi Gender</h3>
              <ProgressBar
                label="Laki-laki"
                value={gender.laki_laki}
                max={gender.total}
                color="from-blue-500 to-cyan-500"
                icon={FaMale}
              />
              <ProgressBar
                label="Perempuan"
                value={gender.perempuan}
                max={gender.total}
                color="from-pink-500 to-purple-500"
                icon={FaFemale}
              />
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Visualisasi</h3>
              <div className="flex items-end justify-around h-48 bg-gray-800/50 rounded-xl p-4">
                <ChartBar
                  label="Laki-laki"
                  value={gender.laki_laki}
                  max={gender.total}
                  color="from-blue-500 to-cyan-500"
                />
                <ChartBar
                  label="Perempuan"
                  value={gender.perempuan}
                  max={gender.total}
                  color="from-pink-500 to-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
          <div className="text-blue-400 text-sm mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-white">
            {pendaftar.total > 0 ? ((pendaftar.lolos / pendaftar.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
          <div className="text-green-400 text-sm mb-1">Attendance</div>
          <div className="text-2xl font-bold text-white">
            {absensi.attendance_rate || 0}%
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
          <div className="text-purple-400 text-sm mb-1">Total Hadir</div>
          <div className="text-2xl font-bold text-white">{absensi.hadir}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4 rounded-xl border border-orange-500/30">
          <div className="text-orange-400 text-sm mb-1">Gender Ratio</div>
          <div className="text-2xl font-bold text-white">{gender.percentage_laki}% : {gender.percentage_perempuan}%</div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistik;
