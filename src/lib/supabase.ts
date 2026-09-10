import { createClient } from '@supabase/supabase-js';

// Retrieve from Vite environment variables or localStorage override if configured via UI
const metaEnv = (import.meta as any).env || {};
const envUrl = metaEnv.VITE_SUPABASE_URL || '';
const envAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('SPP_SUPABASE_URL') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('SPP_SUPABASE_ANON_KEY') : null;

export const supabaseUrl = storedUrl || envUrl;
export const supabaseAnonKey = storedKey || envAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 15
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Official Supabase PostgreSQL DDL Schema Script
 * Matches section 12, 13, and 11 of the requirements:
 * - Table: pengadaan
 * - Table: dokumen_pengadaan
 * - Row Level Security (RLS)
 * - Storage Bucket: dokumen-pengadaan (Private)
 */
export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- SISTEM LAPORAN PENGADAAN 2026
-- SKRIP DATABASE POSTGRESQL & ROW LEVEL SECURITY (SUPABASE)
-- ==========================================================

-- 1. Tabel Utama: pengadaan
CREATE TABLE IF NOT EXISTS public.pengadaan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    nomor_pengadaan VARCHAR(100) NOT NULL UNIQUE,
    nama_pengadaan VARCHAR(255) NOT NULL,
    jenis VARCHAR(50) NOT NULL CHECK (jenis IN ('Barang', 'Jasa', 'Konstruksi', 'Jasa Lainnya')),
    penyedia VARCHAR(255) NOT NULL,
    nilai NUMERIC(18, 2) NOT NULL DEFAULT 0,
    metode VARCHAR(50) NOT NULL CHECK (metode IN ('Pengadaan Langsung', 'E-Purchasing', 'Metode Lainnya', 'Tender', 'Seleksi')),
    keterangan TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Proses' CHECK (status IN ('Proses', 'Selesai', 'Dibatalkan')),
    is_archived BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(150),
    updated_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk efisiensi pencarian dan filter
CREATE INDEX IF NOT EXISTS idx_pengadaan_tanggal ON public.pengadaan(tanggal);
CREATE INDEX IF NOT EXISTS idx_pengadaan_jenis ON public.pengadaan(jenis);
CREATE INDEX IF NOT EXISTS idx_pengadaan_metode ON public.pengadaan(metode);
CREATE INDEX IF NOT EXISTS idx_pengadaan_status ON public.pengadaan(status);
CREATE INDEX IF NOT EXISTS idx_pengadaan_nomor ON public.pengadaan(nomor_pengadaan);

-- 2. Tabel Dokumen Pendukung: dokumen_pengadaan (Relasi 1 to Many)
CREATE TABLE IF NOT EXISTS public.dokumen_pengadaan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengadaan_id UUID NOT NULL REFERENCES public.pengadaan(id) ON DELETE CASCADE,
    jenis_dokumen VARCHAR(100) NOT NULL,
    nama_file VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    uploaded_by VARCHAR(150),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dokumen_pengadaan_id ON public.dokumen_pengadaan(pengadaan_id);

-- 3. Row Level Security (RLS) - Keamanan Pemerintahan
ALTER TABLE public.pengadaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen_pengadaan ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses untuk pengguna terautentikasi (Authenticated Users Only)
-- Sesuai poin 13: Hanya pengguna yang sudah login yang boleh mengakses aplikasi
CREATE POLICY "Authenticated users can select pengadaan"
    ON public.pengadaan FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert pengadaan"
    ON public.pengadaan FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update pengadaan"
    ON public.pengadaan FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can select dokumen"
    ON public.dokumen_pengadaan FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert dokumen"
    ON public.dokumen_pengadaan FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dokumen"
    ON public.dokumen_pengadaan FOR DELETE
    TO authenticated
    USING (true);

-- 4. Storage Bucket: dokumen-pengadaan (Private Bucket)
-- Sesuai poin 11: Bucket dokumen-pengadaan harus bersifat private, bukan public
INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumen-pengadaan', 'dokumen-pengadaan', false)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan Storage untuk dokumen privat
CREATE POLICY "Authenticated users can upload procurement files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'dokumen-pengadaan');

CREATE POLICY "Authenticated users can read procurement files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'dokumen-pengadaan');

-- Trigger untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_pengadaan_updated ON public.pengadaan;
CREATE TRIGGER on_pengadaan_updated
    BEFORE UPDATE ON public.pengadaan
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
`;
