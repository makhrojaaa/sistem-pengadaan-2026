import React, { useState, useEffect } from 'react';
import { Pengadaan, FilterPengadaan, JenisPengadaan, MetodePengadaan, StatusPengadaan } from '../../types';
import { fetchPengadaanList, archivePengadaan } from '../../lib/database';
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  PlusCircle,
  FileText,
  Eye,
  Edit2,
  Archive,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface DaftarPengadaanProps {
  onNavigateToTambah: () => void;
  onSelectPengadaan: (id: string) => void;
  onEditPengadaan: (id: string) => void;
}

export const DaftarPengadaan: React.FC<DaftarPengadaanProps> = ({
  onNavigateToTambah,
  onSelectPengadaan,
  onEditPengadaan,
}) => {
  const { user } = useAuth();
  const [list, setList] = useState<Pengadaan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters according to Point 7
  const [filter, setFilter] = useState<FilterPengadaan>({
    tahun: '2026',
    bulan: 'all',
    jenis: 'all',
    metode: 'all',
    status: 'all',
    search: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPengadaanList(filter);
      setList(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching pengadaan list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter.tahun, filter.bulan, filter.jenis, filter.metode, filter.status, filter.search]);

  const handleResetFilter = () => {
    setFilter({
      tahun: '2026',
      bulan: 'all',
      jenis: 'all',
      metode: 'all',
      status: 'all',
      search: '',
    });
  };

  const handleArchive = async (id: string, nomor: string) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin mengarsipkan kegiatan pengadaan nomor "${nomor}"?`);
    if (confirm && user) {
      await archivePengadaan(id, user.email);
      loadData();
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(list.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = list.slice(startIndex, startIndex + itemsPerPage);

  const totalNilaiFiltered = list.reduce((acc, curr) => acc + Number(curr.nilai || 0), 0);

  return (
    <div className="space-y-5 pb-12">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Pengadaan Barang & Jasa
            </span>
            <span className="text-xs text-slate-500">Tahun Anggaran 2026</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Daftar Seluruh Pengadaan 2026
          </h1>
          <p className="text-sm text-slate-600">
            Pencatatan, pemantauan, dan arsip dokumen kegiatan pengadaan
          </p>
        </div>

        <button
          id="btn-tambah-pengadaan"
          type="button"
          onClick={onNavigateToTambah}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Tambah Pengadaan</span>
        </button>
      </div>

      {/* Filter Section (Poin 7) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Penyaringan & Pencarian Data</span>
          </div>
          {(filter.bulan !== 'all' ||
            filter.jenis !== 'all' ||
            filter.metode !== 'all' ||
            filter.status !== 'all' ||
            filter.search !== '') && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* 1. Search */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Cari (Nomor / Nama / Penyedia)
            </label>
            <div className="relative">
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                placeholder="Ketik kata kunci..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 2. Tahun */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Tahun
            </label>
            <select
              value={filter.tahun}
              onChange={(e) => setFilter({ ...filter, tahun: e.target.value })}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="2026">2026 (Aktif)</option>
              <option value="all">Semua Tahun</option>
            </select>
          </div>

          {/* 3. Bulan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Bulan
            </label>
            <select
              value={filter.bulan}
              onChange={(e) => setFilter({ ...filter, bulan: e.target.value })}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="all">Semua Bulan</option>
              {NAMA_BULAN.map((nama, idx) => (
                <option key={nama} value={String(idx + 1)}>
                  {nama}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Jenis Pengadaan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Jenis Pengadaan
            </label>
            <select
              value={filter.jenis}
              onChange={(e) => setFilter({ ...filter, jenis: e.target.value })}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="all">Semua Jenis</option>
              <option value="Barang">Barang</option>
              <option value="Jasa">Jasa</option>
              <option value="Konstruksi">Konstruksi</option>
              <option value="Jasa Lainnya">Jasa Lainnya</option>
            </select>
          </div>

          {/* 5. Metode Pengadaan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Metode
            </label>
            <select
              value={filter.metode}
              onChange={(e) => setFilter({ ...filter, metode: e.target.value })}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="all">Semua Metode</option>
              <option value="Pengadaan Langsung">Pengadaan Langsung</option>
              <option value="E-Purchasing">E-Purchasing</option>
              <option value="Metode Lainnya">Metode Lainnya</option>
              <option value="Tender">Tender</option>
              <option value="Seleksi">Seleksi</option>
            </select>
          </div>
        </div>

        {/* Filter Result Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div>
            Menemukan <strong>{list.length}</strong> kegiatan pengadaan | Total Nilai:{' '}
            <strong className="text-emerald-700 font-bold">{formatRupiah(totalNilaiFiltered)}</strong>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Table of Procurements (Poin 6) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-3 whitespace-nowrap">Nomor Pengadaan</th>
                <th className="py-3 px-3 min-w-[220px]">Nama Pengadaan</th>
                <th className="py-3 px-3">Jenis</th>
                <th className="py-3 px-3 min-w-[150px]">Penyedia</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Nilai</th>
                <th className="py-3 px-3 whitespace-nowrap">Metode</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Dokumen</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center min-w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat daftar pengadaan...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-semibold text-slate-700">Tidak ada data pengadaan ditemukan</p>
                      <p className="text-xs text-slate-500">
                        Coba sesuaikan filter atau tambahkan kegiatan pengadaan baru.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, index) => {
                  const rowNumber = startIndex + index + 1;
                  const docCount = item.dokumen_count || 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-500 font-medium">{rowNumber}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {formatTanggalIndo(item.tanggal)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-blue-900 whitespace-nowrap">
                        {item.nomor_pengadaan}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-medium">
                        <div className="max-w-xs">{item.nama_pengadaan}</div>
                        {item.keterangan && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {item.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.jenis}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{item.penyedia}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(item.nilai)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                          {item.metode}
                        </span>
                      </td>

                      {/* Kolom Dokumen (Poin 6: Fleksibel, contoh: "4 dokumen") */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectPengadaan(item.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            docCount > 0
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{docCount} dokumen</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Proses'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Kolom Aksi */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectPengadaan(item.id)}
                            title="Lihat Detail & Dokumen"
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detail</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditPengadaan(item.id)}
                            title="Ubah Data Pengadaan"
                            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchive(item.id, item.nomor_pengadaan)}
                            title="Arsipkan Pengadaan"
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/50">
          <div>
            Menampilkan <strong>{paginatedList.length}</strong> dari <strong>{list.length}</strong> data pengadaan
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 font-medium cursor-pointer"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700">
              Halaman {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 font-medium cursor-pointer"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
