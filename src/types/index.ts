export type JenisPengadaan = 'Barang' | 'Jasa' | 'Konstruksi' | 'Jasa Lainnya';

export type MetodePengadaan = 'Pengadaan Langsung' | 'E-Purchasing' | 'Metode Lainnya' | 'Tender' | 'Seleksi';

export type StatusPengadaan = 'Proses' | 'Selesai' | 'Dibatalkan';

export type JenisDokumen =
  | 'Kerangka Acuan Kerja (KAK)'
  | 'Form Permintaan'
  | 'Kuitansi / SPK / SP'
  | 'Invoice / Nota Pembelian'
  | 'Daftar Nama Penerima'
  | 'Bukti Tanda Terima'
  | 'Surat Setoran Pajak'
  | 'Bukti Transfer'
  | 'Dokumen Lainnya';

export interface DokumenPengadaan {
  id: string;
  pengadaan_id: string;
  jenis_dokumen: JenisDokumen;
  nama_file: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_at: string;
  uploaded_by?: string;
  file_url?: string; // Data URL or storage public/signed URL
}

export interface Pengadaan {
  id: string;
  tanggal: string; // Format YYYY-MM-DD
  nomor_pengadaan: string;
  nama_pengadaan: string;
  jenis: JenisPengadaan;
  penyedia: string;
  nilai: number;
  metode: MetodePengadaan;
  keterangan?: string;
  status: StatusPengadaan;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_archived?: boolean;
  dokumen_count?: number; // computed or joined
  dokumen?: DokumenPengadaan[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  nip?: string;
  role: 'Admin Sistem' | 'Administrator PBJ' | 'Pejabat Pengadaan' | 'Auditor / Pengawas';
  instansi: string;
}

export interface FilterPengadaan {
  tahun: string; // default '2026'
  bulan: string; // 'all' | '1' .. '12'
  jenis: string; // 'all' | JenisPengadaan
  metode: string; // 'all' | MetodePengadaan
  status: string; // 'all' | StatusPengadaan
  search: string;
}

export interface DashboardStats {
  totalNilai: number;
  totalPengadaan: number;
  pengadaanBulanIni: number;
  nilaiBulanIni: number;
  totalDokumen: number;
  pengadaanBelumSelesai: number;
  pengadaanByJenis: Record<JenisPengadaan, { count: number; totalNilai: number }>;
  pengadaanByMetode: Record<string, { count: number; totalNilai: number }>;
  bulananValues: Array<{
    bulanIndex: number;
    namaBulan: string;
    totalNilai: number;
    jumlahPengadaan: number;
  }>;
}
