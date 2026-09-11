import React, { useState, useEffect } from 'react';
import { DashboardStats, Pengadaan } from '../../types';
import { calculateDashboardStats, fetchPengadaanList } from '../../lib/database';
import { formatRupiah, formatNumber, formatTanggalIndo, NAMA_BULAN } from '../../lib/formatters';
import { BPSLogo } from '../common/BPSLogo';
import {
  TrendingUp,
  Package,
  Calendar,
  FileCheck,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  Building2,
  Clock,
  ShieldCheck,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateToPengadaan: () => void;
  onNavigateToTambah: () => void;
  onNavigateToLaporan: () => void;
  onSelectPengadaan: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateToPengadaan,
  onNavigateToTambah,
  onNavigateToLaporan,
  onSelectPengadaan,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentList, setRecentList] = useState<Pengadaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<'nilai' | 'volume'>('nilai');

  const loadData = async () => {
    setLoading(true);
    try {
      const [computedStats, allPengadaan] = await Promise.all([
        calculateDashboardStats('2026'),
        fetchPengadaanList({ tahun: '2026' }),
      ]);
      setStats(computedStats);
      setRecentList(allPengadaan.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">
          Memuat data statistik pengadaan 2026 dari database...
        </p>
      </div>
    );
  }

  // Calculate highest monthly value for chart scale
  const maxMonthlyNilai = Math.max(...stats.bulananValues.map((b) => b.totalNilai), 1);
  const maxMonthlyVolume = Math.max(...stats.bulananValues.map((b) => b.jumlahPengadaan), 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Official BPS Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* BPS Tricolor Top Border */}
        <div className="absolute top-0 left-0 right-0 grid grid-cols-3 h-1">
          <div className="bg-[#005C9E]" />
          <div className="bg-[#48A942]" />
          <div className="bg-[#F58220]" />
        </div>

        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm hidden sm:flex items-center justify-center">
            <BPSLogo size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#005C9E]/10 text-[#005C9E] border border-[#005C9E]/20">
                BPS Kabupaten Tanah Datar
              </span>
              <span className="text-xs text-slate-500 font-medium">Tahun Anggaran 2026</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              Sistem Laporan Pengadaan
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Badan Pusat Statistik Kabupaten Tanah Datar • Pengadaan Barang dan Jasa TA 2026
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateToTambah}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#005C9E] hover:bg-[#004e87] shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#F58220]" />
            <span>+ Tambah Pengadaan</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToLaporan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#005C9E]" />
            <span>Laporan Bulanan</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Database Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Nilai Pengadaan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Nilai Pengadaan
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatRupiah(stats.totalNilai)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Dihitung otomatis dari tabel database</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Jumlah Pengadaan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Jumlah Pengadaan
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.totalPengadaan} Paket
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total kegiatan pengadaan terdaftar TA 2026
            </p>
          </div>
        </div>

        {/* Metric 3: Pengadaan Bulan Berjalan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pengadaan Bulan Ini (Sept)
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.pengadaanBulanIni} Paket
            </div>
            <p className="text-xs text-indigo-700 font-medium mt-1">
              Nilai: {formatRupiah(stats.nilaiBulanIni)}
            </p>
          </div>
        </div>

        {/* Metric 4: Administrasi Dokumen & Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Dokumen Terarsip
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.totalDokumen} Dokumen
            </div>
            <p className="text-xs text-amber-700 font-medium mt-1">
              {stats.pengadaanBelumSelesai} paket dalam proses verifikasi
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Chart (Januari - Desember 2026) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Grafik Pengadaan Barang & Jasa Per Bulan (TA 2026)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi agregat langsung dari database pengadaan bulan Januari hingga Desember 2026
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setChartMode('nilai')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                chartMode === 'nilai'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nilai Realisasi (Rp)
            </button>
            <button
              type="button"
              onClick={() => setChartMode('volume')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                chartMode === 'volume'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jumlah Paket
            </button>
          </div>
        </div>

        {/* 12-Month Bar Chart */}
        <div className="mt-6">
          <div className="grid grid-cols-12 gap-1.5 sm:gap-3 items-end h-64 pt-6 px-1 sm:px-4 bg-slate-50/70 rounded-xl border border-slate-100">
            {stats.bulananValues.map((item) => {
              const heightPercent =
                chartMode === 'nilai'
                  ? (item.totalNilai / maxMonthlyNilai) * 100
                  : (item.jumlahPengadaan / maxMonthlyVolume) * 100;

              const isCurrentMonth = item.bulanIndex === 9; // September 2026

              return (
                <div key={item.bulanIndex} className="flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 z-20 pointer-events-none bg-slate-900 text-white text-[11px] rounded-lg p-2 shadow-xl whitespace-nowrap border border-slate-700">
                    <p className="font-semibold">{item.namaBulan} 2026</p>
                    <p className="text-emerald-300">Nilai: {formatRupiah(item.totalNilai)}</p>
                    <p className="text-slate-300">Volume: {item.jumlahPengadaan} pengadaan</p>
                  </div>

                  {/* Bar Value Indicator */}
                  <span className="text-[10px] font-semibold text-slate-600 mb-1 hidden sm:block">
                    {chartMode === 'nilai'
                      ? item.totalNilai > 0
                        ? `${(item.totalNilai / 1000000).toFixed(0)}jt`
                        : '-'
                      : item.jumlahPengadaan > 0
                      ? item.jumlahPengadaan
                      : '-'}
                  </span>

                  {/* Visual Bar */}
                  <div className="w-full max-w-[36px] bg-slate-200 rounded-t-md overflow-hidden flex items-end h-48">
                    <div
                      style={{ height: `${Math.max(heightPercent, 3)}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isCurrentMonth
                          ? 'bg-blue-600 group-hover:bg-blue-500 ring-2 ring-blue-400/50'
                          : item.totalNilai > 0
                          ? 'bg-slate-700 group-hover:bg-blue-600'
                          : 'bg-slate-300'
                      }`}
                    />
                  </div>

                  {/* Month Label */}
                  <div className="mt-2 text-[10px] sm:text-xs font-medium text-slate-600 truncate w-full text-center">
                    {item.namaBulan.substring(0, 3)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 px-2">
            <span>Sumbu X: Bulan Realisasi (Januari - Desember 2026)</span>
            <span>
              Sumbu Y:{' '}
              {chartMode === 'nilai' ? 'Total Nilai Pengadaan (Rupiah)' : 'Jumlah Transaksi'}
            </span>
          </div>
        </div>
      </div>

      {/* Distribution Breakdown: Jenis & Metode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ringkasan Berdasarkan Jenis */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                Ringkasan Berdasarkan Jenis Pengadaan
              </h3>
              <p className="text-xs text-slate-500">Barang, Jasa, Konstruksi, dan Jasa Lainnya</p>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            {(['Barang', 'Jasa', 'Konstruksi', 'Jasa Lainnya'] as const).map((jenis) => {
              const item = stats.pengadaanByJenis[jenis] || { count: 0, totalNilai: 0 };
              const percent = stats.totalNilai > 0 ? (item.totalNilai / stats.totalNilai) * 100 : 0;

              return (
                <div key={jenis} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{jenis}</span>
                    <span className="text-slate-600">
                      <strong>{item.count} Paket</strong> ({formatRupiah(item.totalNilai)})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ringkasan Berdasarkan Metode */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                Ringkasan Berdasarkan Metode Pengadaan
              </h3>
              <p className="text-xs text-slate-500">Pengadaan Langsung, E-Purchasing, dan lainnya</p>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            {Object.entries(stats.pengadaanByMetode).map(([metode, rawVal]) => {
              const val = rawVal as { count: number; totalNilai: number };
              const percent = stats.totalNilai > 0 ? (val.totalNilai / stats.totalNilai) * 100 : 0;

              return (
                <div key={metode} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{metode}</span>
                    <span className="text-slate-600">
                      <strong>{val.count} Paket</strong> ({formatRupiah(val.totalNilai)})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Procurements Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Transaksi Pengadaan Terbaru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar kegiatan pengadaan yang baru dicatat dalam sistem
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToPengadaan}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <span>Lihat Semua Pengadaan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden mt-3 space-y-2.5">
          {recentList.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPengadaan(p.id)}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 cursor-pointer hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-blue-900">{p.nomor_pengadaan}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.status === 'Selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <p className="font-semibold text-xs text-slate-900 line-clamp-2">{p.nama_pengadaan}</p>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/70">
                <span className="text-[11px] text-slate-500">{formatTanggalIndo(p.tanggal)}</span>
                <strong className="text-emerald-700 font-bold">{formatRupiah(p.nilai)}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Nomor Pengadaan</th>
                <th className="py-2.5 px-3">Nama Pengadaan</th>
                <th className="py-2.5 px-3">Jenis</th>
                <th className="py-2.5 px-3">Penyedia</th>
                <th className="py-2.5 px-3 text-right">Nilai Pengadaan</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {formatTanggalIndo(p.tanggal)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {p.nomor_pengadaan}
                  </td>
                  <td className="py-3 px-3 text-slate-900 font-medium max-w-xs truncate">
                    {p.nama_pengadaan}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {p.jenis}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{p.penyedia}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatRupiah(p.nilai)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'Proses'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectPengadaan(p.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
