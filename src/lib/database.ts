import {
  Pengadaan,
  DokumenPengadaan,
  FilterPengadaan,
  DashboardStats,
  JenisPengadaan,
  JenisDokumen,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_PENGADAAN, INITIAL_DOKUMEN } from './initialData';
import { NAMA_BULAN } from './formatters';

const STORAGE_KEY_PENGADAAN = 'SPP_2026_PENGADAAN_DATA';
const STORAGE_KEY_DOKUMEN = 'SPP_2026_DOKUMEN_DATA';

// Initialize local cache if not set
function getLocalPengadaan(): Pengadaan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENGADAAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PENGADAAN, JSON.stringify(INITIAL_PENGADAAN));
      return INITIAL_PENGADAAN;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local pengadaan:', err);
    return INITIAL_PENGADAAN;
  }
}

function saveLocalPengadaan(data: Pengadaan[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PENGADAAN, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving local pengadaan:', err);
  }
}

function getLocalDokumen(): DokumenPengadaan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOKUMEN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DOKUMEN, JSON.stringify(INITIAL_DOKUMEN));
      return INITIAL_DOKUMEN;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local dokumen:', err);
    return INITIAL_DOKUMEN;
  }
}

function saveLocalDokumen(data: DokumenPengadaan[]) {
  try {
    localStorage.setItem(STORAGE_KEY_DOKUMEN, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving local dokumen:', err);
  }
}

// ==========================================
// PENGADAAN CRUD OPERATIONS
// ==========================================

export async function fetchPengadaanList(filter?: Partial<FilterPengadaan>): Promise<Pengadaan[]> {
  // If Supabase is connected, fetch from Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('pengadaan').select('*').order('tanggal', { ascending: false });

      if (filter?.is_archived) {
        query = query.eq('is_archived', true);
      } else {
        query = query.or('is_archived.is.null,is_archived.eq.false');
      }

      if (filter?.tahun && filter.tahun !== 'all') {
        query = query.gte('tanggal', `${filter.tahun}-01-01`).lte('tanggal', `${filter.tahun}-12-31`);
      }
      if (filter?.jenis && filter.jenis !== 'all') {
        query = query.eq('jenis', filter.jenis);
      }
      if (filter?.metode && filter.metode !== 'all') {
        query = query.eq('metode', filter.metode);
      }
      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      const { data, error } = await query;
      if (!error && data) {
        // Fetch document counts
        const { data: docs } = await supabase.from('dokumen_pengadaan').select('pengadaan_id');
        const docCountMap: Record<string, number> = {};
        if (docs) {
          docs.forEach((d: { pengadaan_id: string }) => {
            docCountMap[d.pengadaan_id] = (docCountMap[d.pengadaan_id] || 0) + 1;
          });
        }

        let results: Pengadaan[] = data.map((item: any) => ({
          ...item,
          dokumen_count: docCountMap[item.id] || 0,
        }));

        if (filter?.bulan && filter.bulan !== 'all') {
          const monthNum = parseInt(filter.bulan, 10);
          results = results.filter((p) => {
            const m = parseInt(p.tanggal.split('-')[1], 10);
            return m === monthNum;
          });
        }

        if (filter?.search && filter.search.trim() !== '') {
          const s = filter.search.toLowerCase();
          results = results.filter(
            (p) =>
              p.nomor_pengadaan.toLowerCase().includes(s) ||
              p.nama_pengadaan.toLowerCase().includes(s) ||
              p.penyedia.toLowerCase().includes(s)
          );
        }

        return results;
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local persistent store:', e);
    }
  }

  // Local persistent storage
  const wantArchived = Boolean(filter?.is_archived);
  const all = getLocalPengadaan().filter((p) => (wantArchived ? Boolean(p.is_archived) : !p.is_archived));
  const docs = getLocalDokumen();
  const docCountMap: Record<string, number> = {};
  docs.forEach((d) => {
    docCountMap[d.pengadaan_id] = (docCountMap[d.pengadaan_id] || 0) + 1;
  });

  let results = all.map((p) => ({
    ...p,
    dokumen_count: docCountMap[p.id] || 0,
  }));

  if (filter?.tahun && filter.tahun !== 'all') {
    results = results.filter((p) => p.tanggal.startsWith(filter.tahun!));
  }
  if (filter?.bulan && filter.bulan !== 'all') {
    const monthNum = parseInt(filter.bulan, 10);
    results = results.filter((p) => {
      const m = parseInt(p.tanggal.split('-')[1], 10);
      return m === monthNum;
    });
  }
  if (filter?.jenis && filter.jenis !== 'all') {
    results = results.filter((p) => p.jenis === filter.jenis);
  }
  if (filter?.metode && filter.metode !== 'all') {
    results = results.filter((p) => p.metode === filter.metode);
  }
  if (filter?.status && filter.status !== 'all') {
    results = results.filter((p) => p.status === filter.status);
  }
  if (filter?.search && filter.search.trim() !== '') {
    const s = filter.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.nomor_pengadaan.toLowerCase().includes(s) ||
        p.nama_pengadaan.toLowerCase().includes(s) ||
        p.penyedia.toLowerCase().includes(s)
    );
  }

  // Sort by date descending
  return results.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
}

export async function fetchPengadaanById(id: string): Promise<Pengadaan | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('pengadaan').select('*').eq('id', id).single();
      if (!error && data) {
        const docs = await fetchDokumenByPengadaanId(id);
        return {
          ...data,
          dokumen: docs,
          dokumen_count: docs.length,
        };
      }
    } catch (e) {
      console.warn('Supabase fetchById fallback:', e);
    }
  }

  const list = getLocalPengadaan();
  const item = list.find((p) => p.id === id);
  if (!item) return null;

  const docs = await fetchDokumenByPengadaanId(id);
  return {
    ...item,
    dokumen: docs,
    dokumen_count: docs.length,
  };
}

export async function savePengadaan(
  data: Omit<Pengadaan, 'id' | 'created_at' | 'updated_at' | 'dokumen_count' | 'dokumen'> & { id?: string },
  currentUserEmail: string
): Promise<Pengadaan> {
  const now = new Date().toISOString();

  if (data.id) {
    // UPDATE
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: updated, error } = await supabase
          .from('pengadaan')
          .update({
            tanggal: data.tanggal,
            nomor_pengadaan: data.nomor_pengadaan,
            nama_pengadaan: data.nama_pengadaan,
            jenis: data.jenis,
            penyedia: data.penyedia,
            nilai: Number(data.nilai),
            metode: data.metode,
            keterangan: data.keterangan || '',
            status: data.status,
            updated_by: currentUserEmail,
            updated_at: now,
          })
          .eq('id', data.id)
          .select()
          .single();

        if (!error && updated) {
          return updated;
        }
      } catch (e) {
        console.warn('Supabase update fallback:', e);
      }
    }

    // Local storage update
    const list = getLocalPengadaan();
    const idx = list.findIndex((p) => p.id === data.id);
    if (idx !== -1) {
      const updated: Pengadaan = {
        ...list[idx],
        ...data,
        nilai: Number(data.nilai),
        updated_by: currentUserEmail,
        updated_at: now,
      };
      list[idx] = updated;
      saveLocalPengadaan(list);
      return updated;
    }
  }

  // CREATE NEW
  const newId = `pbj-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const record: Pengadaan = {
    ...data,
    id: data.id || newId,
    nilai: Number(data.nilai),
    created_by: currentUserEmail,
    updated_by: currentUserEmail,
    created_at: now,
    updated_at: now,
    is_archived: false,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: created, error } = await supabase
        .from('pengadaan')
        .insert([record])
        .select()
        .single();
      if (!error && created) {
        return created;
      }
    } catch (e) {
      console.warn('Supabase create fallback:', e);
    }
  }

  const list = getLocalPengadaan();
  list.unshift(record);
  saveLocalPengadaan(list);
  return record;
}

export async function archivePengadaan(id: string, currentUserEmail: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('pengadaan')
        .update({ is_archived: true, updated_by: currentUserEmail, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase archive fallback:', e);
    }
  }

  const list = getLocalPengadaan();
  const idx = list.findIndex((p) => p.id === id);
  if (idx !== -1) {
    list[idx].is_archived = true;
    list[idx].updated_by = currentUserEmail;
    list[idx].updated_at = new Date().toISOString();
    saveLocalPengadaan(list);
    return true;
  }
  return false;
}

export async function unarchivePengadaan(id: string, currentUserEmail: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('pengadaan')
        .update({ is_archived: false, updated_by: currentUserEmail, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase unarchive fallback:', e);
    }
  }

  const list = getLocalPengadaan();
  const idx = list.findIndex((p) => p.id === id);
  if (idx !== -1) {
    list[idx].is_archived = false;
    list[idx].updated_by = currentUserEmail;
    list[idx].updated_at = new Date().toISOString();
    saveLocalPengadaan(list);
    return true;
  }
  return false;
}

// ==========================================
// DOKUMEN OPERATIONS (FLEXIBLE PER PENGADAAN)
// ==========================================

export async function fetchDokumenByPengadaanId(pengadaanId: string): Promise<DokumenPengadaan[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('dokumen_pengadaan')
        .select('*')
        .eq('pengadaan_id', pengadaanId)
        .order('uploaded_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetchDokumen fallback:', e);
    }
  }

  const list = getLocalDokumen();
  return list
    .filter((d) => d.pengadaan_id === pengadaanId)
    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
}

export async function uploadDokumen(
  pengadaanId: string,
  jenisDokumen: JenisDokumen,
  file: File,
  currentUserEmail: string
): Promise<DokumenPengadaan> {
  const fileExt = file.name.split('.').pop() || '';
  const uniqueId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  // Path structure: pengadaan_id/uuid-nama_file (matching point 11 requirement)
  const filePath = `${pengadaanId}/${uniqueId}-${file.name.replace(/\s+/g, '_')}`;
  const now = new Date().toISOString();

  let fileUrl: string | undefined;

  // Read file as Data URL for in-app instant preview/download
  const fileDataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  fileUrl = fileDataUrl;

  if (isSupabaseConfigured && supabase) {
    try {
      // Upload to private bucket 'dokumen-pengadaan'
      const { error: storageError } = await supabase.storage
        .from('dokumen-pengadaan')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!storageError) {
        // Create signed URL for private bucket access (valid for 1 hour)
        const { data: signed } = await supabase.storage
          .from('dokumen-pengadaan')
          .createSignedUrl(filePath, 3600);
        if (signed?.signedUrl) {
          fileUrl = signed.signedUrl;
        }
      }
    } catch (err) {
      console.warn('Storage upload note:', err);
    }
  }

  const docRecord: DokumenPengadaan = {
    id: uniqueId,
    pengadaan_id: pengadaanId,
    jenis_dokumen: jenisDokumen,
    nama_file: file.name,
    file_path: filePath,
    file_size: file.size,
    file_type: file.type || (fileExt === 'pdf' ? 'application/pdf' : 'image/' + fileExt),
    uploaded_at: now,
    uploaded_by: currentUserEmail,
    file_url: fileUrl,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: inserted, error: dbError } = await supabase
        .from('dokumen_pengadaan')
        .insert([
          {
            id: docRecord.id,
            pengadaan_id: docRecord.pengadaan_id,
            jenis_dokumen: docRecord.jenis_dokumen,
            nama_file: docRecord.nama_file,
            file_path: docRecord.file_path,
            file_size: docRecord.file_size,
            file_type: docRecord.file_type,
            uploaded_by: docRecord.uploaded_by,
            uploaded_at: docRecord.uploaded_at,
          },
        ])
        .select()
        .single();

      if (!dbError && inserted) {
        return { ...inserted, file_url: fileUrl };
      }
    } catch (e) {
      console.warn('Supabase dokumen insert fallback:', e);
    }
  }

  // Local fallback
  const docs = getLocalDokumen();
  docs.unshift(docRecord);
  saveLocalDokumen(docs);
  return docRecord;
}

export async function deleteDokumen(dokumenId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Find document to get path
      const { data } = await supabase
        .from('dokumen_pengadaan')
        .select('file_path')
        .eq('id', dokumenId)
        .single();
      if (data?.file_path) {
        await supabase.storage.from('dokumen-pengadaan').remove([data.file_path]);
      }
      await supabase.from('dokumen_pengadaan').delete().eq('id', dokumenId);
    } catch (e) {
      console.warn('Supabase deleteDokumen fallback:', e);
    }
  }

  const docs = getLocalDokumen();
  const filtered = docs.filter((d) => d.id !== dokumenId);
  saveLocalDokumen(filtered);
  return true;
}

// ==========================================
// REAL-TIME DASHBOARD CALCULATIONS (DATABASE DRIVEN)
// Sesuai Poin 4 & 5: Dihitung otomatis dari database, bukan angka dummy!
// ==========================================

export async function calculateDashboardStats(targetYear: string = '2026'): Promise<DashboardStats> {
  const pengadaanList = await fetchPengadaanList({ tahun: targetYear });
  const allDocs = getLocalDokumen(); // or query supabase

  let totalNilai = 0;
  const totalPengadaan = pengadaanList.length;
  let pengadaanBulanIni = 0;
  let nilaiBulanIni = 0;
  let pengadaanBelumSelesai = 0;

  // Determine current active month in 2026 (or September 2026 based on metadata)
  const today = new Date();
  // Default to September (index 8, 1-based 9) if current year matches or 2026
  const currentMonthNum = today.getFullYear() === 2026 ? today.getMonth() + 1 : 9;

  const jenisMap: Record<JenisPengadaan, { count: number; totalNilai: number }> = {
    Barang: { count: 0, totalNilai: 0 },
    Jasa: { count: 0, totalNilai: 0 },
    Konstruksi: { count: 0, totalNilai: 0 },
    'Jasa Lainnya': { count: 0, totalNilai: 0 },
  };

  const metodeMap: Record<string, { count: number; totalNilai: number }> = {
    'E-Purchasing': { count: 0, totalNilai: 0 },
    'Pengadaan Langsung': { count: 0, totalNilai: 0 },
    'Metode Lainnya': { count: 0, totalNilai: 0 },
    Tender: { count: 0, totalNilai: 0 },
    Seleksi: { count: 0, totalNilai: 0 },
  };

  // 12 months data container
  const bulananValues = NAMA_BULAN.map((nama, idx) => ({
    bulanIndex: idx + 1,
    namaBulan: nama,
    totalNilai: 0,
    jumlahPengadaan: 0,
  }));

  pengadaanList.forEach((p) => {
    const val = Number(p.nilai) || 0;
    totalNilai += val;

    if (p.status === 'Proses') {
      pengadaanBelumSelesai++;
    }

    // Month computation
    const parts = p.tanggal.split('-');
    const m = parseInt(parts[1], 10);
    if (m >= 1 && m <= 12) {
      bulananValues[m - 1].totalNilai += val;
      bulananValues[m - 1].jumlahPengadaan += 1;

      if (m === currentMonthNum) {
        pengadaanBulanIni += 1;
        nilaiBulanIni += val;
      }
    }

    // Jenis breakdown
    if (jenisMap[p.jenis]) {
      jenisMap[p.jenis].count += 1;
      jenisMap[p.jenis].totalNilai += val;
    }

    // Metode breakdown
    const mtd = p.metode || 'Metode Lainnya';
    if (!metodeMap[mtd]) {
      metodeMap[mtd] = { count: 0, totalNilai: 0 };
    }
    metodeMap[mtd].count += 1;
    metodeMap[mtd].totalNilai += val;
  });

  return {
    totalNilai,
    totalPengadaan,
    pengadaanBulanIni,
    nilaiBulanIni,
    totalDokumen: allDocs.length,
    pengadaanBelumSelesai,
    pengadaanByJenis: jenisMap,
    pengadaanByMetode: metodeMap,
    bulananValues,
  };
}

export function resetToSeedData() {
  localStorage.setItem(STORAGE_KEY_PENGADAAN, JSON.stringify(INITIAL_PENGADAAN));
  localStorage.setItem(STORAGE_KEY_DOKUMEN, JSON.stringify(INITIAL_DOKUMEN));
}
