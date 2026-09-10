import React, { useState, useEffect } from 'react';
import { Pengadaan, DokumenPengadaan } from '../../types';
import { fetchPengadaanById, deleteDokumen } from '../../lib/database';
import { formatRupiah, formatTanggalIndo, formatWaktuIndo, formatFileSize } from '../../lib/formatters';
import { UploadDokumenModal } from './UploadDokumenModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Edit2,
  PlusCircle,
  FileText,
  Eye,
  Download,
  Trash2,
  Building2,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface DetailPengadaanProps {
  pengadaanId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export const DetailPengadaan: React.FC<DetailPengadaanProps> = ({
  pengadaanId,
  onBack,
  onEdit,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<Pengadaan | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DokumenPengadaan | null>(null);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const item = await fetchPengadaanById(pengadaanId);
      setData(item);
    } catch (err) {
      console.error('Error fetching pengadaan detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [pengadaanId]);

  const handleDeleteDoc = async (docId: string, docName: string) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin menghapus dokumen "${docName}"?`);
    if (confirm) {
      await deleteDokumen(docId);
      loadDetail();
    }
  };

  const handleDocUploaded = () => {
    loadDetail();
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-sm font-medium">Memuat rincian informasi pengadaan...</p>
      </div>
    );
  }

  const docs = data.dokumen || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar</span>
          </button>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            ID: {data.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(data.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Ubah Data</span>
          </button>
          <button
            id="btn-tambah-dokumen"
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Dokumen</span>
          </button>
        </div>
      </div>

      {/* Primary Procurement Information Card (Point 9) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                {data.nomor_pengadaan}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  data.status === 'Selesai'
                    ? 'bg-emerald-100 text-emerald-800'
                    : data.status === 'Proses'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                Status: {data.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {data.nama_pengadaan}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Tanggal Transaksi: <strong>{formatTanggalIndo(data.tanggal)}</strong></span>
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-right self-start sm:min-w-[200px]">
            <span className="text-[11px] uppercase font-bold text-slate-500 block">
              Nilai Realisasi Pengadaan
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 block mt-1">
              {formatRupiah(data.nilai)}
            </span>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Jenis Pengadaan
            </span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">
              {data.jenis}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Penyedia / Rekanan
            </span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">
              {data.penyedia}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Metode Pemilihan
            </span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">
              {data.metode}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Kelengkapan Dokumen
            </span>
            <span className="text-sm font-bold text-blue-700 mt-1 block">
              {docs.length} Dokumen Terlampir
            </span>
          </div>
        </div>

        {/* Keterangan */}
        <div className="py-4 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Keterangan & Catatan Administrasi
          </span>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            {data.keterangan || 'Tidak ada catatan tambahan untuk kegiatan pengadaan ini.'}
          </p>
        </div>

        {/* Audit Trail (Point 18) */}
        <div className="pt-4 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Dibuat oleh: <strong className="text-slate-700">{data.created_by || 'Admin'}</strong> pada{' '}
              {formatWaktuIndo(data.created_at)}
            </span>
          </div>
          {data.updated_at && (
            <div>
              Terakhir diubah oleh:{' '}
              <strong className="text-slate-700">{data.updated_by || data.created_by || 'Admin'}</strong>{' '}
              pada {formatWaktuIndo(data.updated_at)}
            </div>
          )}
        </div>
      </div>

      {/* Dokumen Pendukung Section (Point 2, 3, 9, 10) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Dokumen Pendukung Pengadaan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dokumen bersifat fleksibel sesuai kebutuhan pengadaan ({docs.length} dokumen tersimpan)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors self-start cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Unggah Dokumen Baru</span>
          </button>
        </div>

        {/* Documents List */}
        {docs.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl mt-6">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              Belum ada dokumen pendukung yang diunggah
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Setiap pengadaan dapat memiliki dokumen yang berbeda (KAK, SPK, Invoice, Bukti Transfer, dll). Klik tombol di bawah untuk menambahkan.
            </p>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Unggah Dokumen Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {docs.map((doc, idx) => (
              <div
                key={doc.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                {/* File Information */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {doc.jenis_dokumen}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatFileSize(doc.file_size)}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-slate-800 mt-1 font-mono break-all">
                      {doc.nama_file}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Diupload: {formatWaktuIndo(doc.uploaded_at)}</span>
                      <span>•</span>
                      <span>Oleh: {doc.uploaded_by || 'Admin PBJ'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Preview & Download (Point 9) */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDoc(doc.id, doc.nama_file)}
                    title="Hapus Dokumen"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <UploadDokumenModal
        pengadaanId={data.id}
        nomorPengadaan={data.nomor_pengadaan}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleDocUploaded}
      />

      {/* Preview Document Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};
