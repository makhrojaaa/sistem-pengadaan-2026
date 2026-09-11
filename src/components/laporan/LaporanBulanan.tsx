import React, { useState, useEffect } from 'react';
import { Pengadaan, JenisPengadaan } from '../../types';
import { fetchPengadaanList } from '../../lib/database';
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../../lib/formatters';
import { exportMonthlyReportToExcel, printOfficialReport } from '../../lib/exportUtils';
import { useAuth } from '../../context/AuthContext';
import { BPSLogo } from '../common/BPSLogo';
import { OfficialGovernmentReportModal } from './OfficialGovernmentReportModal';
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
  Eye,
} from 'lucide-react';

export const LaporanBulanan: React.FC = () => {
  const { user } = useAuth();
  const [tahun, setTahun] = useState('2026');
  const [bulanIndex, setBulanIndex] = useState(9); // Default September (9)
  const [list, setList] = useState<Pengadaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGovModalOpen, setIsGovModalOpen] = useState(false);

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
  const totalSelesai = list.filter((p) => p.status === 'Selesai').length;
  const totalProses = list.filter((p) => p.status === 'Proses').length;

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
      <div className="print:hidden bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Format Standar Tata Naskah Dinas BPS
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline">
              TA 2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Laporan Pengadaan Bulanan
          </h1>
          <p className="text-xs text-slate-600">
            Rekapitulasi pelaksanaan pengadaan barang dan jasa sesuai format kedinasan resmi pemerintah.
          </p>
        </div>

        {/* Filter Controls & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
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
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
            title="Unduh Rekapitulasi Data format Microsoft Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Ekspor Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGovModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            title="Lihat format kertas resmi tata naskah dinas sebelum dicetak"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Format Cetak Kedinasan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Official Government Report Document Sheet (Prints with Government Letterhead) */}
      <div
        id="official-government-report"
        className={`print-document-container bg-white border border-slate-300 rounded-xl shadow-md p-6 sm:p-10 lg:p-12 text-slate-900 print:border-none print:shadow-none print:p-0 ${isGovModalOpen ? 'print:hidden' : ''
          }`}
      >
        {/* Official Kop Surat / Letterhead Standar Pemerintah RI */}
        <div className="kop-surat-dinas border-b-[3px] border-double border-slate-900 pb-3 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0 w-20 flex justify-center">
              <BPSLogo size="lg" />
            </div>
            <div className="flex-1 text-center pr-6 sm:pr-16">
              <h2 className="text-sm sm:text-base md:text-lg font-black tracking-widest text-[#005C9E] uppercase leading-tight font-serif">
                BADAN PUSAT STATISTIK
              </h2>
              <h3 className="text-xs sm:text-sm md:text-base font-extrabold tracking-wider text-slate-900 uppercase leading-tight mt-0.5">
                KABUPATEN TANAH DATAR
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-700 leading-tight mt-1">
                Jl. Imam Bonjol No.17, Limo Kaum, Kec. Lima Kaum, Kabupaten Tanah Datar, Sumatera Barat 27213
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-600 leading-tight mt-0.5 font-medium">
                Telp: (62-752) 71598 | Faks: (62-752) 72593 | Mailbox: bps1305@bps.go.id | Laman: https://tanahdatarkab.bps.go.id/id
              </p>
            </div>
          </div>
        </div>

        {/* JUDUL RESMI NASKAH DINAS */}
        <div className="text-center mb-6">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 underline underline-offset-4">
            LAPORAN BULANAN PELAKSANAAN PENGADAAN BARANG DAN JASA (PBJ)
          </h2>
          <p className="text-xs font-extrabold uppercase text-slate-800 mt-1">
            TAHUN ANGGARAN {tahun}
          </p>
          <div className="inline-flex items-center gap-2 mt-1 px-3 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-700">
            <span>Periode: Bulan {namaBulan} {tahun}</span>
            <span>•</span>
            <span>Nomor: B-{String(bulanIndex).padStart(2, '0')}/0304/PBJ/{String(bulanIndex).padStart(2, '0')}/{tahun}</span>
          </div>
        </div>

        {/* BAGIAN A — IDENTITAS LAPORAN */}
        <div className="mb-6">
          <div className="bg-slate-100 px-3.5 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider text-slate-900 border border-slate-900 border-b-0">
            I. Identitas Laporan Pengadaan
          </div>
          <div className="border border-slate-900 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white">
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Nama Satuan Kerja:</span>
              <span className="font-bold text-slate-900 block">{instansiName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Tahun Anggaran:</span>
              <span className="font-bold text-slate-900 block">{tahun}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Periode Pelaporan:</span>
              <span className="font-bold text-blue-900 block">Bulan {namaBulan} {tahun}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Tanggal Cetak / Pengesahan:</span>
              <span className="font-bold text-slate-900 block">
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* BAGIAN B — RINGKASAN REKAPITULASI RESMI */}
        <div className="mb-6 border border-slate-900 rounded-sm overflow-hidden text-xs">
          <div className="bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-900 uppercase tracking-wider text-slate-900 flex justify-between items-center">
            <span>II. Ringkasan Realisasi Anggaran & Fisik Bulan {namaBulan} {tahun}</span>
            <span className="text-[10px] font-normal normal-case text-slate-600">Satker: {instansiName}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-900 bg-white">
            <div className="p-3 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-600">Jumlah Paket PBJ</div>
              <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{totalPaket} Paket</div>
              <div className="text-[10px] text-slate-500">Volume Transaksi</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-600">Total Nilai Realisasi</div>
              <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{formatRupiah(totalNilai)}</div>
              <div className="text-[10px] text-slate-500">Akumulasi Nilai Kontrak</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-600">Status Pekerjaan</div>
              <div className="text-xs font-bold text-slate-900 mt-1 flex justify-center gap-2">
                <span className="text-emerald-800">{totalSelesai} Selesai</span>
                <span>•</span>
                <span className="text-amber-800">{totalProses} Proses</span>
              </div>
              <div className="text-[10px] text-slate-500">Tingkat Penyelesaian</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-600">Dokumen Pertanggungjawaban</div>
              <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{totalDokumen} Berkas</div>
              <div className="text-[10px] text-slate-500">Berkas SPJ Terverifikasi</div>
            </div>
          </div>
        </div>

        {/* BAGIAN C — REKAPITULASI BERDASARKAN JENIS & METODE */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rekap Jenis */}
          <div>
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-slate-900 border border-slate-900 border-b-0">
              Rekapitulasi Menurut Jenis Pengadaan
            </div>
            <table className="w-full text-xs border border-slate-900">
              <thead>
                <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-900">
                  <th className="py-1.5 px-3 text-left border-r border-slate-900">Jenis Pengadaan</th>
                  <th className="py-1.5 px-3 text-center border-r border-slate-900">Volume</th>
                  <th className="py-1.5 px-3 text-right">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {Object.keys(jenisSummary).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-2.5 text-center text-slate-500 italic">
                      Nihil pada bulan ini
                    </td>
                  </tr>
                ) : (
                  Object.entries(jenisSummary).map(([jenis, data]) => (
                    <tr key={jenis}>
                      <td className="py-1.5 px-3 font-medium text-slate-900 border-r border-slate-300">{jenis}</td>
                      <td className="py-1.5 px-3 text-center text-slate-800 border-r border-slate-300">{data.count} Paket</td>
                      <td className="py-1.5 px-3 text-right font-bold text-slate-900">
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
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-slate-900 border border-slate-900 border-b-0">
              Rekapitulasi Menurut Metode Pemilihan
            </div>
            <table className="w-full text-xs border border-slate-900">
              <thead>
                <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-900">
                  <th className="py-1.5 px-3 text-left border-r border-slate-900">Metode Pemilihan</th>
                  <th className="py-1.5 px-3 text-center border-r border-slate-900">Volume</th>
                  <th className="py-1.5 px-3 text-right">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {Object.keys(metodeSummary).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-2.5 text-center text-slate-500 italic">
                      Nihil pada bulan ini
                    </td>
                  </tr>
                ) : (
                  Object.entries(metodeSummary).map(([metode, data]) => (
                    <tr key={metode}>
                      <td className="py-1.5 px-3 font-medium text-slate-900 border-r border-slate-300">{metode}</td>
                      <td className="py-1.5 px-3 text-center text-slate-800 border-r border-slate-300">{data.count} Paket</td>
                      <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                        {formatRupiah(data.totalNilai)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BAGIAN D — RINCIAN TRANSAKSI PENGADAAN */}
        <div className="mb-6">
          <div className="bg-slate-100 px-3.5 py-1.5 font-bold text-xs uppercase tracking-wider text-slate-900 border border-slate-900 border-b-0 flex items-center justify-between">
            <span>III. Daftar Rincian Pelaksanaan Pekerjaan Pengadaan</span>
            <span className="text-[10px] font-normal normal-case text-slate-600">Mata Uang: IDR</span>
          </div>
          <div className="overflow-x-auto print:overflow-visible border border-slate-900">
            <table className="w-full text-left text-xs border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold text-center">
                  <th style={{ width: '3.5%' }} className="py-2 px-1 border-r border-slate-900 text-center">No</th>
                  <th style={{ width: '8.5%' }} className="py-2 px-1 border-r border-slate-900 text-center">Tanggal</th>
                  <th style={{ width: '13%' }} className="py-2 px-1.5 border-r border-slate-900 text-center">Nomor Kontrak</th>
                  <th style={{ width: '24%' }} className="py-2 px-2 border-r border-slate-900 text-left">Uraian Pekerjaan / Pengadaan</th>
                  <th style={{ width: '6%' }} className="py-2 px-1 border-r border-slate-900 text-center">Jenis</th>
                  <th style={{ width: '13%' }} className="py-2 px-1.5 border-r border-slate-900 text-left">Penyedia</th>
                  <th style={{ width: '12%' }} className="py-2 px-1.5 border-r border-slate-900 text-right">Nilai Realisasi</th>
                  <th style={{ width: '8%' }} className="py-2 px-1 border-r border-slate-900 text-center">Metode</th>
                  <th style={{ width: '6%' }} className="py-2 px-1 border-r border-slate-900 text-center">SPJ</th>
                  <th style={{ width: '6%' }} className="py-2 px-1 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-slate-500 italic">
                      Tidak ada transaksi pengadaan pada bulan {namaBulan} {tahun}.
                    </td>
                  </tr>
                ) : (
                  list.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-1 text-center text-slate-700 font-medium border-r border-slate-300">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-1 text-center whitespace-nowrap text-slate-700 border-r border-slate-300 text-[10.5px]">
                        {p.tanggal}
                      </td>
                      <td className="py-1.5 px-1.5 font-semibold text-slate-900 font-mono break-all border-r border-slate-300 text-[10px]">
                        {p.nomor_pengadaan}
                      </td>
                      <td className="py-1.5 px-2 text-slate-900 font-medium border-r border-slate-300 break-words">
                        <div>{p.nama_pengadaan}</div>
                        {p.keterangan && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">{p.keterangan}</div>
                        )}
                      </td>
                      <td className="py-1.5 px-1 text-center text-slate-700 border-r border-slate-300 text-[10.5px] break-words">{p.jenis}</td>
                      <td className="py-1.5 px-1.5 text-slate-700 border-r border-slate-300 break-words">{p.penyedia}</td>
                      <td className="py-1.5 px-1.5 text-right font-bold text-slate-900 whitespace-nowrap border-r border-slate-300 font-mono text-[10.5px]">
                        {formatRupiah(p.nilai)}
                      </td>
                      <td className="py-1.5 px-1 text-center text-slate-700 border-r border-slate-300 text-[10px] break-words">{p.metode}</td>
                      <td className="py-1.5 px-1 text-center whitespace-nowrap font-medium text-slate-800 border-r border-slate-300 text-[10px]">
                        {p.dokumen_count || 0} berkas
                      </td>
                      <td className="py-1.5 px-1 text-center whitespace-nowrap font-bold text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9.5px] ${p.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
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
                <tr className="bg-slate-100 border-t-2 border-slate-900 font-bold text-slate-900">
                  <td colSpan={6} className="py-2 px-2 text-right uppercase border-r border-slate-900">
                    Total Nilai Pengadaan Bulan {namaBulan} {tahun}:
                  </td>
                  <td className="py-2 px-1.5 text-right text-slate-900 font-black font-mono border-r border-slate-900 text-[10.5px]">
                    {formatRupiah(totalNilai)}
                  </td>
                  <td colSpan={3} className="py-2 px-1.5 text-center text-slate-700">
                    {totalPaket} Paket Terdata
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* BAGIAN E — PENGESAHAN & TANDA TANGAN RESMI KEDINASAN */}
        <div className="avoid-break lembar-pengesahan-dinas mt-8 pt-3 border-t border-slate-400">
          <div className="flex justify-end text-xs text-slate-900 mb-2">
            <p>
              Batusangkar, {new Date().getDate()} {namaBulan} {tahun}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-xs text-center">
            {/* Kolom Kiri: PPK (Wirda Elsa Hutari, S.Si., M.M.) */}
            <div>
              <p className="text-slate-800">Mengetahui,</p>
              <p className="font-extrabold text-slate-900 uppercase mt-0.5">
                Pejabat Pembuat Komitmen (PPK)
              </p>
              <p className="text-[11px] text-slate-600">Badan Pusat Statistik Kabupaten Tanah Datar</p>


              <p className="font-black text-slate-900 underline text-[13px] mt-24">
                Wirda Elsa Hutari, S.Si., M.M.
              </p>
              <p className="text-slate-900 font-mono mt-0.5 font-bold">
                NIP. 198908182019032002
              </p>
            </div>

            {/* Kolom Kanan: Pejabat Pengadaan (Firdaus, SST, M.T) */}
            <div>
              <p className="text-slate-800">&nbsp;</p>
              <p className="font-extrabold text-slate-900 uppercase mt-0.5">
                Pejabat Pengadaan Barang / Jasa
              </p>
              <p className="text-[11px] text-slate-600">Badan Pusat Statistik Kabupaten Tanah Datar</p>

              <p className="font-black text-slate-900 underline text-[13px] mt-24">
                Firdaus, SST, M.T
              </p>
              <p className="text-slate-900 font-mono mt-0.5 font-bold">
                NIP. 198602072009021004
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Format Cetak Resmi Pemerintah */}
      <OfficialGovernmentReportModal
        isOpen={isGovModalOpen}
        onClose={() => setIsGovModalOpen(false)}
        list={list}
        bulanIndex={bulanIndex}
        tahun={tahun}
        instansiName={instansiName}
      />
    </div>
  );
};

