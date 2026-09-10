import React, { useState, useEffect } from 'react';
import { Pengadaan, JenisPengadaan } from '../../types';
import { fetchPengadaanList } from '../../lib/database';
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../../lib/formatters';
import { exportMonthlyReportToExcel, printOfficialReport } from '../../lib/exportUtils';
import { useAuth } from '../../context/AuthContext';
import { BPSLogo } from '../common/BPSLogo';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Building2,
  FileCheck,
  TrendingUp,
  Package,
  Layers,
  CheckCircle2,
  Download,
} from 'lucide-react';

export const LaporanBulanan: React.FC = () => {
  const { user } = useAuth();
  const [tahun, setTahun] = useState('2026');
  const [bulanIndex, setBulanIndex] = useState(9); // Default September (9)
  const [list, setList] = useState<Pengadaan[]>([]);
  const [loading, setLoading] = useState(true);

  const instansiName =
    user?.instansi || 'BPS KABUPATEN TANAH DATAR';

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await fetchPengadaanList({ tahun, bulan: String(bulanIndex) });
      setList(all);
    } catch (err) {
      console.error('Error loading monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tahun, bulanIndex]);

  const namaBulan = NAMA_BULAN[bulanIndex - 1];

  // Calculations
  const totalNilai = list.reduce((acc, curr) => acc + Number(curr.nilai || 0), 0);
  const totalPaket = list.length;
  const totalDokumen = list.reduce((acc, curr) => acc + Number(curr.dokumen_count || 0), 0);

  // Group by jenis
  const jenisSummary: Record<string, { count: number; totalNilai: number }> = {};
  const metodeSummary: Record<string, { count: number; totalNilai: number }> = {};

  list.forEach((p) => {
    const val = Number(p.nilai || 0);
    // jenis
    if (!jenisSummary[p.jenis]) jenisSummary[p.jenis] = { count: 0, totalNilai: 0 };
    jenisSummary[p.jenis].count += 1;
    jenisSummary[p.jenis].totalNilai += val;

    // metode
    const mtd = p.metode || 'Metode Lainnya';
    if (!metodeSummary[mtd]) metodeSummary[mtd] = { count: 0, totalNilai: 0 };
    metodeSummary[mtd].count += 1;
    metodeSummary[mtd].totalNilai += val;
  });

  const handleExportExcel = () => {
    exportMonthlyReportToExcel(list, bulanIndex, tahun, instansiName);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Filter and Actions (Non-printable controls) */}
      <div className="print:hidden bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Modul Pelaporan Resmi
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Laporan Pengadaan Bulanan
          </h1>
          <p className="text-xs text-slate-600">
            Rekapitulasi transaksi, administrasi dokumen, dan pengesahan berkala TA 2026
          </p>
        </div>

        {/* Filter Controls & Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              value={bulanIndex}
              onChange={(e) => setBulanIndex(Number(e.target.value))}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              {NAMA_BULAN.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  Bulan: {m}
                </option>
              ))}
            </select>

            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="2026">Tahun: 2026</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={printOfficialReport}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Official Government Report Document Sheet (Prints perfectly) */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-md p-8 sm:p-12 text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Official Kop Surat / Letterhead */}
        <div className="text-center border-b-2 border-slate-900 pb-5 mb-8">
          <div className="flex justify-center mb-2.5">
            <BPSLogo size="lg" />
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-[#005C9E]">
            BADAN PUSAT STATISTIK
          </h2>
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-800 mt-0.5">
            BPS KABUPATEN TANAH DATAR
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Jl. Sultan Alam Bagagarsyah, Pagaruyung, Kec. Tanjung Emas, Kab. Tanah Datar, Sumatera Barat 27281
          </p>
          <div className="grid grid-cols-3 h-1 w-32 mx-auto rounded-full overflow-hidden mt-3">
            <div className="bg-[#005C9E]" />
            <div className="bg-[#48A942]" />
            <div className="bg-[#F58220]" />
          </div>
        </div>

        {/* BAGIAN A — IDENTITAS LAPORAN (Poin 17) */}
        <div className="mb-8">
          <div className="bg-slate-100 px-4 py-2 rounded-t-md font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300">
            Bagian A — Identitas Laporan Pengadaan
          </div>
          <div className="border border-t-0 border-slate-300 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block">Nama Instansi / Unit Kerja:</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{instansiName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Tahun Anggaran:</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{tahun}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Periode Bulan Pelaporan:</span>
              <span className="font-bold text-blue-900 mt-0.5 block">{namaBulan} {tahun}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Tanggal Pengesahan Laporan:</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* BAGIAN B — RINGKASAN EKSEKUTIF (Poin 16 & 17) */}
        <div className="mb-8">
          <div className="bg-slate-100 px-4 py-2 rounded-t-md font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300">
            Bagian B — Ringkasan Realisasi Pengadaan Bulan {namaBulan} {tahun}
          </div>
          <div className="border border-t-0 border-slate-300 p-5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="text-xs uppercase font-semibold text-slate-500 block">
                Jumlah Paket Pengadaan
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {totalPaket} Paket
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Tercatat pada periode {namaBulan}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="text-xs uppercase font-semibold text-slate-500 block">
                Total Nilai Realisasi
              </span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block">
                {formatRupiah(totalNilai)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Total akumulasi anggaran terserap
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="text-xs uppercase font-semibold text-slate-500 block">
                Dokumen Teradministrasi
              </span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">
                {totalDokumen} Dokumen
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Arsip berkas pendukung tersimpan
              </span>
            </div>
          </div>
        </div>

        {/* BAGIAN C — REKAPITULASI BERDASARKAN JENIS & METODE (Poin 16) */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rekap Jenis */}
          <div>
            <div className="bg-slate-100 px-3.5 py-1.5 rounded-t-md font-bold text-xs uppercase tracking-wider text-slate-800 border border-slate-300 border-b-0">
              Rekapitulasi Berdasarkan Jenis
            </div>
            <table className="w-full text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-300">
                  <th className="py-2 px-3 text-left">Jenis Pengadaan</th>
                  <th className="py-2 px-3 text-center">Volume</th>
                  <th className="py-2 px-3 text-right">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.keys(jenisSummary).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-slate-400">
                      Nihil pada bulan ini
                    </td>
                  </tr>
                ) : (
                  Object.entries(jenisSummary).map(([jenis, data]) => (
                    <tr key={jenis}>
                      <td className="py-2 px-3 font-medium text-slate-800">{jenis}</td>
                      <td className="py-2 px-3 text-center text-slate-700">{data.count} Paket</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatRupiah(data.totalNilai)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Rekap Metode */}
          <div>
            <div className="bg-slate-100 px-3.5 py-1.5 rounded-t-md font-bold text-xs uppercase tracking-wider text-slate-800 border border-slate-300 border-b-0">
              Rekapitulasi Berdasarkan Metode
            </div>
            <table className="w-full text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-300">
                  <th className="py-2 px-3 text-left">Metode Pemilihan</th>
                  <th className="py-2 px-3 text-center">Volume</th>
                  <th className="py-2 px-3 text-right">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.keys(metodeSummary).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-slate-400">
                      Nihil pada bulan ini
                    </td>
                  </tr>
                ) : (
                  Object.entries(metodeSummary).map(([metode, data]) => (
                    <tr key={metode}>
                      <td className="py-2 px-3 font-medium text-slate-800">{metode}</td>
                      <td className="py-2 px-3 text-center text-slate-700">{data.count} Paket</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatRupiah(data.totalNilai)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BAGIAN D — RINCIAN TRANSAKSI PENGADAAN (Poin 16 & 17) */}
        <div className="mb-8">
          <div className="bg-slate-100 px-4 py-2 rounded-t-md font-bold text-xs uppercase tracking-wider text-slate-800 border border-slate-300 border-b-0">
            Bagian D — Rincian Transaksi Pengadaan Bulan {namaBulan} {tahun}
          </div>
          <div className="border border-slate-300 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-semibold uppercase">
                  <th className="py-2.5 px-2 text-center w-10">No</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Nomor Pengadaan</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Nama Paket Pengadaan</th>
                  <th className="py-2.5 px-3">Jenis</th>
                  <th className="py-2.5 px-3">Penyedia</th>
                  <th className="py-2.5 px-3 text-right">Nilai Realisasi</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-2 text-center">Dokumen</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      Tidak ada transaksi pengadaan pada bulan {namaBulan} {tahun}.
                    </td>
                  </tr>
                ) : (
                  list.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-2 text-center text-slate-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                        {formatTanggalIndo(p.tanggal)}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono whitespace-nowrap">
                        {p.nomor_pengadaan}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {p.nama_pengadaan}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{p.jenis}</td>
                      <td className="py-2.5 px-3 text-slate-700">{p.penyedia}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(p.nilai)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{p.metode}</td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap font-medium text-blue-800">
                        {p.dokumen_count || 0} berkas
                      </td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Grand Total Footer */}
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                  <td colSpan={6} className="py-3 px-4 text-right uppercase">
                    Total Nilai Pengadaan Bulan {namaBulan} {tahun}:
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-800 text-sm">
                    {formatRupiah(totalNilai)}
                  </td>
                  <td colSpan={3} className="py-3 px-3 text-center text-slate-600">
                    {totalPaket} Paket Terdata
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* BAGIAN E — PENGESAHAN & TANDA TANGAN RESMI (Poin 17) */}
        <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-center">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-900 uppercase mt-0.5">
              Pejabat Pembuat Komitmen (PPK)
            </p>
            <div className="h-20 flex items-center justify-center text-slate-400 italic">
              (Tanda Tangan & Cap Instansi)
            </div>
            <p className="font-bold text-slate-900 underline">
              Drs. Hendra Setiawan, M.Si
            </p>
            <p className="text-slate-600 mt-0.5">NIP: 19790815 200312 1 002</p>
          </div>

          <div>
            <p className="text-slate-600">
              Dibuat pada tanggal {new Date().getDate()} {namaBulan} {tahun}
            </p>
            <p className="font-bold text-slate-900 uppercase mt-0.5">
              Pejabat Pengadaan Barang / Jasa
            </p>
            <div className="h-20 flex items-center justify-center text-slate-400 italic">
              (Tanda Tangan & Cap Instansi)
            </div>
            <p className="font-bold text-slate-900 underline">
              Firdaus, SST, M.T
            </p>
            <p className="text-slate-600 mt-0.5">
              NIP: 19820514 200501 1 002
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
