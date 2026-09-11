import React, { useRef } from 'react';
import { Pengadaan } from '../../types';
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../../lib/formatters';
import { BPSLogo } from '../common/BPSLogo';
import { Printer, X, Download, CheckCircle, Clock } from 'lucide-react';

interface OfficialGovernmentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: Pengadaan[];
  bulanIndex: number;
  tahun: string;
  instansiName: string;
}

export const OfficialGovernmentReportModal: React.FC<OfficialGovernmentReportModalProps> = ({
  isOpen,
  onClose,
  list,
  bulanIndex,
  tahun,
  instansiName,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const namaBulan = NAMA_BULAN[bulanIndex - 1];
  const totalNilai = list.reduce((acc, curr) => acc + Number(curr.nilai || 0), 0);
  const totalPaket = list.length;
  const totalDokumen = list.reduce((acc, curr) => acc + Number(curr.dokumen_count || 0), 0);
  const totalSelesai = list.filter((p) => p.status === 'Selesai').length;
  const totalProses = list.filter((p) => p.status === 'Proses').length;

  // Rekap jenis
  const jenisSummary: Record<string, { count: number; totalNilai: number }> = {};
  list.forEach((p) => {
    const val = Number(p.nilai || 0);
    if (!jenisSummary[p.jenis]) jenisSummary[p.jenis] = { count: 0, totalNilai: 0 };
    jenisSummary[p.jenis].count += 1;
    jenisSummary[p.jenis].totalNilai += val;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden border border-slate-300">
        {/* Modal Toolbar (Non-printable) */}
        <div className="print:hidden px-6 py-4 bg-[#071E3D] text-white flex items-center justify-between border-b border-[#11325C] flex-shrink-0">
          <div className="flex items-center gap-3">
            <BPSLogo size="sm" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Pratinjau Format Cetak Dokumen Kedinasan (Standar Pemerintah RI)
              </h2>
              <p className="text-xs text-sky-200">
                Sesuai Tata Naskah Dinas BPS Kabupaten Tanah Datar • Periode {namaBulan} {tahun}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70">
          {/* A4 Landscape White Sheet Container */}
          <div
            ref={printRef}
            className="print-document-container max-w-[1060px] mx-auto bg-white p-8 sm:p-12 shadow-lg border border-slate-300 text-slate-900 font-sans leading-normal print:max-w-none print:w-full print:p-0 print:border-none print:shadow-none"
          >
            {/* KOP SURAT RESMI INSTANSI PEMERINTAH */}
            <div className="kop-surat-dinas border-b-[3px] border-double border-slate-900 pb-3 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-shrink-0 w-20 flex justify-center">
                  <BPSLogo size="lg" />
                </div>
                <div className="flex-1 text-center pr-10">
                  <h1 className="text-base sm:text-lg font-black tracking-widest text-[#005C9E] uppercase leading-tight font-serif">
                    BADAN PUSAT STATISTIK
                  </h1>
                  <h2 className="text-sm sm:text-base font-extrabold tracking-wider text-slate-900 uppercase leading-tight mt-0.5">
                    BPS KABUPATEN TANAH DATAR
                  </h2>
                  <p className="text-[11px] text-slate-700 leading-tight mt-1">
                    Jl. Imam Bonjol No.17, Limo Kaum, Kec. Lima Kaum, Kabupaten Tanah Datar, Sumatera Barat 27213
                  </p>
                  <p className="text-[10px] text-slate-600 leading-tight mt-0.5 font-medium">
                    Telp: (62-752) 71598 | Faks: (62-752) 72593 | Mailbox: bps1305@bps.go.id | Laman: https://tanahdatarkab.bps.go.id/id
                  </p>
                </div>
              </div>
            </div>

            {/* JUDUL DOKUMEN RESMI KEDINASAN */}
            <div className="text-center mb-6">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 underline underline-offset-4">
                LAPORAN BULANAN PELAKSANAAN PENGADAAN BARANG DAN JASA (PBJ)
              </h3>
              <p className="text-xs font-extrabold uppercase text-slate-800 mt-1">
                TAHUN ANGGARAN {tahun}
              </p>
              <div className="inline-flex items-center gap-2 mt-1 px-3 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-700">
                <span>Periode: Bulan {namaBulan} {tahun}</span>
                <span>•</span>
                <span>Nomor Agenda: B-{String(bulanIndex).padStart(2, '0')}/0304/PBJ/{String(bulanIndex).padStart(2, '0')}/{tahun}</span>
              </div>
            </div>

            {/* RINGKASAN REKAPITULASI RESMI */}
            <div className="mb-6 border border-slate-900 rounded-sm overflow-hidden text-xs">
              <div className="bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-900 uppercase tracking-wider text-slate-900 flex justify-between items-center">
                <span>I. REKAPITULASI PELAKSANAAN PENGADAAN BULAN {namaBulan} {tahun}</span>
                <span className="text-[10px] font-normal normal-case text-slate-600">Unit Kerja: {instansiName}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-900 bg-white">
                <div className="p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-600">Jumlah Paket PBJ</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{totalPaket} Paket</div>
                  <div className="text-[10px] text-slate-500">Volume Transaksi</div>
                </div>
                <div className="p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-600">Total Realisasi Anggaran</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{formatRupiah(totalNilai)}</div>
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
                  <div className="text-lg font-black text-slate-900 mt-0.5">{totalDokumen} Berkas</div>
                  <div className="text-[10px] text-slate-500">Berkas SPJ Terverifikasi</div>
                </div>
              </div>
            </div>

            {/* TABEL RINCIAN TRANSAKSI PENGADAAN PEMERINTAH */}
            <div className="mb-6">
              <div className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1.5 flex items-center justify-between">
                <span>II. DAFTAR RINCIAN PELAKSANAAN PENGADAAN BARANG DAN JASA</span>
                <span className="text-[10px] font-normal normal-case text-slate-600">
                  Mata Uang: Rupiah (IDR)
                </span>
              </div>

              <table className="w-full border-collapse border border-slate-900 text-xs" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold text-center">
                    <th style={{ width: '3.5%' }} className="border border-slate-900 py-1.5 px-1 text-center">No</th>
                    <th style={{ width: '8.5%' }} className="border border-slate-900 py-1.5 px-1 text-center">Tanggal</th>
                    <th style={{ width: '13%' }} className="border border-slate-900 py-1.5 px-1.5 text-center">Nomor Kontrak</th>
                    <th style={{ width: '24%' }} className="border border-slate-900 py-1.5 px-2 text-left">Nama Paket Pekerjaan / Pengadaan</th>
                    <th style={{ width: '6%' }} className="border border-slate-900 py-1.5 px-1 text-center">Jenis</th>
                    <th style={{ width: '13%' }} className="border border-slate-900 py-1.5 px-1.5 text-left">Penyedia / Rekanan</th>
                    <th style={{ width: '12%' }} className="border border-slate-900 py-1.5 px-1.5 text-right">Nilai Realisasi</th>
                    <th style={{ width: '8%' }} className="border border-slate-900 py-1.5 px-1 text-center">Metode</th>
                    <th style={{ width: '6%' }} className="border border-slate-900 py-1.5 px-1 text-center">SPJ</th>
                    <th style={{ width: '6%' }} className="border border-slate-900 py-1.5 px-1 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="border border-slate-900 py-6 text-center text-slate-500 italic">
                        Tidak ada transaksi kegiatan pengadaan barang/jasa pada bulan {namaBulan} {tahun}.
                      </td>
                    </tr>
                  ) : (
                    list.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-400">
                        <td className="border border-slate-900 py-1.5 px-1 text-center font-medium">{idx + 1}</td>
                        <td className="border border-slate-900 py-1.5 px-1 text-center whitespace-nowrap text-[10.5px]">
                          {item.tanggal}
                        </td>
                        <td className="border border-slate-900 py-1.5 px-1.5 font-mono text-[10px] font-semibold break-all">
                          {item.nomor_pengadaan}
                        </td>
                        <td className="border border-slate-900 py-1.5 px-2 break-words">
                          <div className="font-semibold text-slate-900">{item.nama_pengadaan}</div>
                          {item.keterangan && (
                            <div className="text-[10px] text-slate-600 italic mt-0.5">{item.keterangan}</div>
                          )}
                        </td>
                        <td className="border border-slate-900 py-1.5 px-1 text-center text-[10.5px] break-words">{item.jenis}</td>
                        <td className="border border-slate-900 py-1.5 px-1.5 break-words">{item.penyedia}</td>
                        <td className="border border-slate-900 py-1.5 px-1.5 text-right font-bold whitespace-nowrap font-mono text-[10.5px]">
                          {formatRupiah(item.nilai)}
                        </td>
                        <td className="border border-slate-900 py-1.5 px-1 text-center text-[10px] break-words">{item.metode}</td>
                        <td className="border border-slate-900 py-1.5 px-1 text-center font-medium text-[10px] whitespace-nowrap">
                          {item.dokumen_count || 0} berkas
                        </td>
                        <td className="border border-slate-900 py-1.5 px-1 text-center font-bold text-[10px] whitespace-nowrap">
                          {item.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                    <td colSpan={6} className="border border-slate-900 py-2 px-2 text-right uppercase">
                      Total Realisasi Pengadaan Bulan {namaBulan} {tahun}:
                    </td>
                    <td className="border border-slate-900 py-2 px-1.5 text-right font-black font-mono text-[10.5px]">
                      {formatRupiah(totalNilai)}
                    </td>
                    <td colSpan={3} className="border border-slate-900 py-2 px-1.5 text-center text-slate-700">
                      {totalPaket} Paket Terdata
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* LEMBAR PENGESAHAN & TANDA TANGAN RESMI KEDINASAN */}
            <div className="avoid-break lembar-pengesahan-dinas mt-8 pt-3 border-t border-slate-400">
              <div className="flex justify-end text-xs text-slate-900 mb-3">
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
                  <p className="text-[11px] text-slate-700">Badan Pusat Statistik Kabupaten Tanah Datar</p>

                  <div className="h-24 flex items-center justify-center text-slate-400 text-[11px] italic">
                    (Tanda Tangan & Cap Dinas)
                  </div>

                  <p className="font-black text-slate-900 underline text-[13px]">
                    Wirda Elsa Hutari, S.Si., M.M.
                  </p>
                  <p className="text-slate-800 font-mono mt-0.5 font-bold">
                    NIP. 198908182019032002
                  </p>
                </div>

                {/* Kolom Kanan: Pejabat Pengadaan (Firdaus, SST, M.T) */}
                <div>
                  <p className="text-slate-800">&nbsp;</p>
                  <p className="font-extrabold text-slate-900 uppercase mt-0.5">
                    Pejabat Pengadaan Barang / Jasa
                  </p>
                  <p className="text-[11px] text-slate-700">Badan Pusat Statistik Kabupaten Tanah Datar</p>

                  <div className="h-24 flex items-center justify-center text-slate-400 text-[11px] italic">
                    (Tanda Tangan & Cap Dinas)
                  </div>

                  <p className="font-black text-slate-900 underline text-[13px]">
                    Firdaus, SST, M.T
                  </p>
                  <p className="text-slate-800 font-mono mt-0.5 font-bold">
                    NIP. 198602072009021004
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
