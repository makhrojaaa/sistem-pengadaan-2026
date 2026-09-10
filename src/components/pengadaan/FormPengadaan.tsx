import React, { useState, useEffect } from 'react';
import { JenisPengadaan, MetodePengadaan, StatusPengadaan, Pengadaan } from '../../types';
import { savePengadaan, fetchPengadaanById } from '../../lib/database';
import { formatRupiah } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';

interface FormPengadaanProps {
  editId?: string | null;
  onBack: () => void;
  onSuccess: (savedId: string) => void;
}

export const FormPengadaan: React.FC<FormPengadaanProps> = ({ editId, onBack, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [tanggal, setTanggal] = useState('2026-09-10');
  const [nomorPengadaan, setNomorPengadaan] = useState('');
  const [namaPengadaan, setNamaPengadaan] = useState('');
  const [jenis, setJenis] = useState<JenisPengadaan>('Barang');
  const [penyedia, setPenyedia] = useState('');
  const [nilai, setNilai] = useState<string>('25000000');
  const [metode, setMetode] = useState<MetodePengadaan>('E-Purchasing');
  const [status, setStatus] = useState<StatusPengadaan>('Proses');
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (editId) {
      setFetching(true);
      fetchPengadaanById(editId)
        .then((item) => {
          if (item) {
            setTanggal(item.tanggal);
            setNomorPengadaan(item.nomor_pengadaan);
            setNamaPengadaan(item.nama_pengadaan);
            setJenis(item.jenis);
            setPenyedia(item.penyedia);
            setNilai(String(item.nilai));
            setMetode(item.metode);
            setStatus(item.status);
            setKeterangan(item.keterangan || '');
          }
        })
        .finally(() => setFetching(false));
    } else {
      // Auto suggest flexible next number
      const randomSeq = Math.floor(Math.random() * 900) + 100;
      setNomorPengadaan(`PBJ/2026/09/${randomSeq}`);
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nomorPengadaan.trim()) {
      setError('Nomor pengadaan wajib diisi.');
      return;
    }
    if (!namaPengadaan.trim()) {
      setError('Nama kegiatan pengadaan wajib diisi.');
      return;
    }
    if (!penyedia.trim()) {
      setError('Nama penyedia/rekanan wajib diisi.');
      return;
    }
    const numericNilai = parseFloat(nilai.replace(/[^0-9]/g, ''));
    if (isNaN(numericNilai) || numericNilai <= 0) {
      setError('Nilai pengadaan harus berupa angka valid lebih dari 0.');
      return;
    }

    setLoading(true);
    try {
      const saved = await savePengadaan(
        {
          id: editId || undefined,
          tanggal,
          nomor_pengadaan: nomorPengadaan.trim(),
          nama_pengadaan: namaPengadaan.trim(),
          jenis,
          penyedia: penyedia.trim(),
          nilai: numericNilai,
          metode,
          status,
          keterangan: keterangan.trim(),
        },
        user?.email || 'admin@instansi.go.id'
      );

      onSuccess(saved.id);
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan data pengadaan.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-3 text-sm">Memuat data pengadaan...</p>
      </div>
    );
  }

  const numericPreview = parseFloat(nilai.replace(/[^0-9]/g, '')) || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">Formulir Resmi Pengadaan 2026</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            {editId ? 'Ubah Data Pengadaan Barang/Jasa' : 'Catat Kegiatan Pengadaan Baru 2026'}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Lengkapi data administrasi pengadaan di bawah ini secara akurat untuk keperluan monitoring dan pelaporan instansi.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informasi Pokok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Tanggal Pengadaan */}
            <div>
              <label
                htmlFor="input-tanggal"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Tanggal Pengadaan <span className="text-red-500">*</span>
              </label>
              <input
                id="input-tanggal"
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            {/* Nomor Pengadaan (Fleksibel) */}
            <div>
              <label
                htmlFor="input-nomor"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Nomor Pengadaan <span className="text-red-500">*</span>
              </label>
              <input
                id="input-nomor"
                type="text"
                required
                value={nomorPengadaan}
                onChange={(e) => setNomorPengadaan(e.target.value)}
                placeholder="Contoh: PBJ/2026/09/001 atau NOMOR/PO/..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Format nomor bebas sesuai nomor registrasi instansi masing-masing.
              </p>
            </div>
          </div>

          {/* Nama Pengadaan */}
          <div>
            <label
              htmlFor="input-nama"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Nama Paket Pengadaan <span className="text-red-500">*</span>
            </label>
            <input
              id="input-nama"
              type="text"
              required
              value={namaPengadaan}
              onChange={(e) => setNamaPengadaan(e.target.value)}
              placeholder="Contoh: Pengadaan Laptop dan Komputer Administrasi"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Jenis & Penyedia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Jenis Pengadaan Dropdown */}
            <div>
              <label
                htmlFor="input-jenis"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Jenis Pengadaan <span className="text-red-500">*</span>
              </label>
              <select
                id="input-jenis"
                value={jenis}
                onChange={(e) => setJenis(e.target.value as JenisPengadaan)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="Barang">Barang</option>
                <option value="Jasa">Jasa</option>
                <option value="Konstruksi">Konstruksi</option>
                <option value="Jasa Lainnya">Jasa Lainnya</option>
              </select>
            </div>

            {/* Penyedia */}
            <div>
              <label
                htmlFor="input-penyedia"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Penyedia / Rekanan <span className="text-red-500">*</span>
              </label>
              <input
                id="input-penyedia"
                type="text"
                required
                value={penyedia}
                onChange={(e) => setPenyedia(e.target.value)}
                placeholder="Contoh: PT Contoh Indonesia"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Nilai Pengadaan & Metode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nilai (Numeric Input with Rupiah format preview) */}
            <div>
              <label
                htmlFor="input-nilai"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Nilai Pengadaan (Rupiah) <span className="text-red-500">*</span>
              </label>
              <input
                id="input-nilai"
                type="number"
                min="0"
                step="1000"
                required
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                placeholder="25000000"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold"
              />
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Terbaca:</span>
                <span className="font-bold text-emerald-700">{formatRupiah(numericPreview)}</span>
              </div>
            </div>

            {/* Metode Pengadaan Dropdown */}
            <div>
              <label
                htmlFor="input-metode"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Metode Pengadaan <span className="text-red-500">*</span>
              </label>
              <select
                id="input-metode"
                value={metode}
                onChange={(e) => setMetode(e.target.value as MetodePengadaan)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="Pengadaan Langsung">Pengadaan Langsung</option>
                <option value="E-Purchasing">E-Purchasing</option>
                <option value="Metode Lainnya">Metode Lainnya</option>
                <option value="Tender">Tender</option>
                <option value="Seleksi">Seleksi</option>
              </select>
            </div>
          </div>

          {/* Status Pengadaan */}
          <div>
            <label
              htmlFor="input-status"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Status Pelaksanaan
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Proses', 'Selesai', 'Dibatalkan'] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    status === st
                      ? st === 'Selesai'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                        : st === 'Proses'
                        ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20'
                        : 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label
              htmlFor="input-keterangan"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Keterangan Tambahan / Catatan Administrasi (Opsional)
            </label>
            <textarea
              id="input-keterangan"
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Catatan mengenai peruntukan barang/jasa, termin pembayaran, atau lokasi serah terima..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-simpan-pengadaan"
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Simpan Pengadaan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
