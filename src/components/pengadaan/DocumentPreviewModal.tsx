import React from 'react';
import { DokumenPengadaan } from '../../types';
import { formatFileSize, formatTanggalIndo, formatWaktuIndo } from '../../lib/formatters';
import { X, Download, FileText, Image as ImageIcon, ExternalLink, ShieldCheck } from 'lucide-react';

interface DocumentPreviewModalProps {
  document: DokumenPengadaan | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !document) return null;

  const isImage =
    document.file_type?.startsWith('image/') ||
    document.nama_file.endsWith('.jpg') ||
    document.nama_file.endsWith('.jpeg') ||
    document.nama_file.endsWith('.png');

  const isPdf =
    document.file_type === 'application/pdf' || document.nama_file.endsWith('.pdf');

  const handleDownload = () => {
    if (document.file_url) {
      const a = window.document.createElement('a');
      a.href = document.file_url;
      a.download = document.nama_file;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else {
      // Create a mock blob text download if only metadata exists
      const dummyContent = `DOKUMEN ADMINISTRASI PENGADAAN REPUBLIK INDONESIA\n\nJenis Dokumen: ${document.jenis_dokumen}\nNama File: ${document.nama_file}\nPath: ${document.file_path}\nTanggal Unggah: ${document.uploaded_at}\nPengunggah: ${document.uploaded_by || 'Admin PBJ'}\n\nDokumen ini tersimpan dalam private storage dokumen-pengadaan.`;
      const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.nama_file.replace(/\.pdf$/, '.txt');
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {document.jenis_dokumen}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1 truncate max-w-md">
                {document.nama_file}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-center justify-center">
          {document.file_url ? (
            isImage ? (
              <img
                src={document.file_url}
                alt={document.nama_file}
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
              />
            ) : isPdf ? (
              <iframe
                src={document.file_url}
                title={document.nama_file}
                className="w-full h-full rounded-lg border border-slate-200 bg-white"
              />
            ) : (
              <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 max-w-md">
                <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800">{document.nama_file}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Format file siap diunduh melalui tombol di atas.
                </p>
              </div>
            )
          ) : (
            /* Document Simulation Card for Initial Seed Records */
            <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-xl p-8 shadow-sm text-slate-800 font-sans space-y-6">
              <div className="text-center border-b border-slate-200 pb-4">
                <div className="flex justify-center mb-2">
                  <ShieldCheck className="w-8 h-8 text-blue-700" />
                </div>
                <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                  PEMERINTAH REPUBLIK INDONESIA
                </h2>
                <p className="text-xs text-slate-600">
                  ARSIP ELEKTRONIK PENGADAAN BARANG DAN JASA TAHUN ANGGARAN 2026
                </p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 text-xs space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">Jenis Dokumen:</span>
                  <span className="col-span-2 font-bold text-blue-900">{document.jenis_dokumen}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">Nama Berkas:</span>
                  <span className="col-span-2 font-mono text-slate-800">{document.nama_file}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">Storage Path:</span>
                  <span className="col-span-2 font-mono text-slate-700 break-all">{document.file_path}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">Ukuran File:</span>
                  <span className="col-span-2 text-slate-800">{formatFileSize(document.file_size)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">Waktu Unggah:</span>
                  <span className="col-span-2 text-slate-800">{formatWaktuIndo(document.uploaded_at)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">Diupload Oleh:</span>
                  <span className="col-span-2 text-slate-800">{document.uploaded_by || 'Staf PBJ'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center leading-relaxed">
                Dokumen ini telah terverifikasi dalam basis data administrasi pengadaan. Untuk melihat atau mencetak berkas lengkap, gunakan tombol Unduh File.
              </p>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>Ukuran: <strong>{formatFileSize(document.file_size)}</strong></span>
            <span>•</span>
            <span>Diunggah: {formatWaktuIndo(document.uploaded_at)}</span>
          </div>
          <div>
            Pengunggah: <strong className="text-slate-700">{document.uploaded_by || 'Sistem PBJ'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
