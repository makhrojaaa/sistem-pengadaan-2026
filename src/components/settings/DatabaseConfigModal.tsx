import React, { useState } from 'react';
import {
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured,
  SUPABASE_SQL_SCHEMA,
} from '../../lib/supabase';
import { resetToSeedData } from '../../lib/database';
import {
  X,
  Database,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onReload,
}) => {
  const [url, setUrl] = useState(supabaseUrl);
  const [key, setKey] = useState(supabaseAnonKey);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'settings'>('status');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('SPP_SUPABASE_URL', url.trim());
    localStorage.setItem('SPP_SUPABASE_ANON_KEY', key.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onReload();
      onClose();
    }, 1200);
  };

  const handleClearConnection = () => {
    localStorage.removeItem('SPP_SUPABASE_URL');
    localStorage.removeItem('SPP_SUPABASE_ANON_KEY');
    setUrl('');
    setKey('');
    onReload();
  };

  const handleResetDemoData = () => {
    const confirm = window.confirm(
      'Apakah Anda ingin memuat ulang data awal transaksi pengadaan 2026 ke penyimpanan database?'
    );
    if (confirm) {
      resetToSeedData();
      onReload();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Konfigurasi Database & Supabase PostgreSQL
              </h3>
              <p className="text-xs text-slate-500">
                Sistem Laporan Pengadaan Barang dan Jasa 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Status Koneksi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Skrip DDL SQL Supabase
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pengaturan Kredensial URL & Key
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'status' && (
            <div className="space-y-5">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                {isSupabaseConfigured ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {isSupabaseConfigured
                      ? 'Terkoneksi ke Cloud Database Supabase'
                      : 'Mode Operasional Aktif (Siap Dihubungkan ke Supabase)'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {isSupabaseConfigured
                      ? 'Aplikasi terhubung langsung dengan project Supabase PostgreSQL Anda. Seluruh transaksi, dokumen, dan otentikasi disinkronisasi ke server Supabase.'
                      : 'Aplikasi berjalan dengan penyimpanan persisten browser terstruktur dengan skema yang 100% identik dengan PostgreSQL Supabase. Anda dapat memasukkan URL & Anon Key kapan saja pada tab Pengaturan.'}
                  </p>
                </div>
              </div>

              {/* Database Architecture Summary (Poin 11, 12, 13) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-xs text-slate-700">
                <h5 className="font-bold text-slate-900 text-sm">
                  Struktur Database yang Diterapkan:
                </h5>
                <ul className="space-y-2 list-disc list-inside text-slate-600">
                  <li>
                    <strong>Tabel 1:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded">pengadaan</code> (id, tanggal, nomor_pengadaan, nama_pengadaan, jenis, penyedia, nilai, metode, keterangan, status, created_at, updated_at).
                  </li>
                  <li>
                    <strong>Tabel 2:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded">dokumen_pengadaan</code> (id, pengadaan_id, jenis_dokumen, nama_file, file_path, uploaded_at).
                  </li>
                  <li>
                    <strong>Relasi:</strong> 1 Pengadaan dapat memiliki banyak Dokumen Pendukung (1:N, fleksibel per pengadaan).
                  </li>
                  <li>
                    <strong>Keamanan:</strong> Row Level Security (RLS) aktif, hanya pengguna terautentikasi yang dapat membaca dan menambah data.
                  </li>
                  <li>
                    <strong>Private Storage:</strong> Bucket <code className="bg-slate-200 px-1 py-0.5 rounded">dokumen-pengadaan</code> bersifat privat dengan akses file terotentikasi.
                  </li>
                </ul>
              </div>

              {/* Reset Data Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ingin memulihkan data contoh pengadaan 2026?
                </span>
                <button
                  type="button"
                  onClick={handleResetDemoData}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Pulihkan Data Contoh 2026</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Jalankan skrip SQL DDL ini pada menu <strong>SQL Editor</strong> di dashboard Supabase Anda:
                </p>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[380px] border border-slate-800 leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleSaveConnection} className="space-y-4">
              {saveSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kredensial Supabase berhasil disimpan! Menyegarkan sistem...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Supabase Anon Key (Public Key)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Sesuai standar keamanan: <strong>hanya gunakan public/anon key</strong> di sisi browser client, jangan pernah menggunakan service role secret key.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClearConnection}
                  className="text-xs text-red-600 hover:underline cursor-pointer"
                >
                  Hapus Kredensial Tersimpan
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Simpan & Hubungkan
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
