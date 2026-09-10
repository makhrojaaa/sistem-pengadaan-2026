import * as XLSX from 'xlsx';
import { Pengadaan } from '../types';
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from './formatters';

export function exportMonthlyReportToExcel(
  pengadaanList: Pengadaan[],
  bulanIndex: number, // 1 to 12
  tahun: string = '2026',
  instansi: string = 'BPS KABUPATEN TANAH DATAR'
) {
  const namaBulan = NAMA_BULAN[bulanIndex - 1];
  const filename = `Laporan_Pengadaan_${namaBulan}_${tahun}.xlsx`;

  // 1. Data Sheet Transaksi
  const dataRows: any[] = pengadaanList.map((p, index) => ({
    No: index + 1,
    'Tanggal Pengadaan': p.tanggal,
    'Nomor Pengadaan': p.nomor_pengadaan,
    'Nama Paket Pengadaan': p.nama_pengadaan,
    'Jenis Pengadaan': p.jenis,
    'Nama Penyedia': p.penyedia,
    'Nilai Pengadaan (Rp)': p.nilai,
    'Metode Pengadaan': p.metode,
    Status: p.status,
    'Jumlah Dokumen': p.dokumen_count || 0,
    Keterangan: p.keterangan || '-',
  }));

  const totalNilai = pengadaanList.reduce((acc, curr) => acc + Number(curr.nilai || 0), 0);

  // Summary Row
  dataRows.push({
    No: '' as any,
    'Tanggal Pengadaan': '',
    'Nomor Pengadaan': '',
    'Nama Paket Pengadaan': 'TOTAL NILAI PENGADAAN',
    'Jenis Pengadaan': '',
    'Nama Penyedia': '',
    'Nilai Pengadaan (Rp)': totalNilai,
    'Metode Pengadaan': '',
    Status: '',
    'Jumlah Dokumen': '' as any,
    Keterangan: '',
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Auto-width columns
  const wscols = [
    { wch: 6 },  // No
    { wch: 14 }, // Tanggal
    { wch: 22 }, // Nomor
    { wch: 38 }, // Nama
    { wch: 16 }, // Jenis
    { wch: 30 }, // Penyedia
    { wch: 20 }, // Nilai
    { wch: 22 }, // Metode
    { wch: 12 }, // Status
    { wch: 16 }, // Jumlah Dokumen
    { wch: 35 }, // Keterangan
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${namaBulan}`);

  // 2. Summary Sheet
  const summaryData = [
    { Parameter: 'Nama Instansi', Nilai: instansi },
    { Parameter: 'Tahun Anggaran', Nilai: tahun },
    { Parameter: 'Periode Pelaporan', Nilai: `${namaBulan} ${tahun}` },
    { Parameter: 'Total Jumlah Paket Pengadaan', Nilai: pengadaanList.length },
    { Parameter: 'Total Realisasi Nilai Pengadaan', Nilai: formatRupiah(totalNilai) },
    { Parameter: 'Tanggal Dokumen Dibuat', Nilai: new Date().toLocaleDateString('id-ID') },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 32 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Identitas & Ringkasan');

  XLSX.writeFile(workbook, filename);
}

export function printOfficialReport() {
  window.print();
}
