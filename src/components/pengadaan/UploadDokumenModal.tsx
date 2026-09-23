import React, { useState, useRef } from 'react';
import { JenisDokumen, DokumenPengadaan } from '../../types';
import { uploadDokumen } from '../../lib/database';
import { useAuth } from '../../context/AuthContext';
import { formatFileSize } from '../../lib/formatters';
import {
  X,
  Upload,
  FileCheck,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

interface UploadDokumenModalProps {
  pengadaanId: string;
  nomorPengadaan: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: DokumenPengadaan) => void;
}

const KATEGORI_DOKUMEN: JenisDokumen[] = [
  'Kerangka Acuan Kerja (KAK)',
  'Form Permintaan',
  'Kuitansi / SPK / SP',
  'Invoice / Nota Pembelian',
  'Daftar Nama Penerima',
  'Bukti Tanda Terima',
  'Surat Setoran Pajak',
  'Bukti Transfer',
  'Dokumen Lainnya',
];

export const UploadDokumenModal: React.FC<UploadDokumenModalProps> = ({
  pengadaanId,
  nomorPengadaan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jenisDokumen, setJenisDokumen] = useState<JenisDokumen>('Kerangka Acuan Kerja (KAK)');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(ext)) {
      setError('Format file tidak didukung. Harap unggah file PDF, JPG/JPEG, atau PNG.');
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB as required by Point 10
    if (file.size > maxSizeBytes) {
      setError('Ukuran file melebihi batas maksimal 10 MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Silakan pilih file dokumen terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await uploadDokumen(
        pengadaanId,
        jenisDokumen,
        selectedFile,
        user?.email || 'admin@instansi.go.id'
      );
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal mengunggah dokumen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Unggah Dokumen Pendukung
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Paket: {nomorPengadaan}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Pilih Jenis Dokumen (Point 10 Dropdown) */}
          <div>
            <label
              htmlFor="select-jenis-dokumen"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Pilih Jenis / Kategori Dokumen <span className="text-red-500">*</span>
            </label>
            <select
              id="select-jenis-dokumen"
              value={jenisDokumen}
              onChange={(e) => setJenisDokumen(e.target.value as JenisDokumen)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              {KATEGORI_DOKUMEN.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Pilih File (Point 10: PDF, JPG, PNG, Max 10MB) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Berkas Dokumen <span className="text-red-500">*</span>
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/60 ring-4 ring-blue-500/10'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 break-all">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatFileSize(selectedFile.size)} • Siap diunggah
                  </p>
                  <span className="mt-2 text-xs text-blue-600 hover:underline">
                    Ganti file lain
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Tarik dan lepaskan file ke sini, atau klik untuk memilih
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Mendukung: <strong>PDF, JPG/JPEG, PNG</strong> (Maksimal 10 MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security & Bucket Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Keamanan Penyimpanan:</p>
            <p className="mt-0.5">
              Berkas akan dienkripsi dan disimpan pada private storage{' '}
              <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">dokumen-pengadaan</code>{' '}
              menggunakan identifikasi ID unik.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-submit-upload-dokumen"
              type="submit"
              disabled={loading || !selectedFile}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{loading ? 'Mengunggah ke Storage...' : 'Unggah Dokumen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
