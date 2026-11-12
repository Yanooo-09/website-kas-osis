export type CellStatus = 'LUNAS' | 'DI_MUKA' | 'BELUM' | 'BELUM_ADA' | 'REKAP_LAMA';

export interface RiwayatSiswaItem {
  tanggal: string; // YYYY-MM-DD
  jumlahSebelumnya: number;
  jumlahBaru: number;
  alasan: string;
}

export interface Kelas {
  id: string;
  nama: string;
  tingkat: 'X' | 'XI';
  urutan: number;
  jumlahSiswa: number;
  riwayatSiswa?: RiwayatSiswaItem[];
  updatedAt?: string;
}

export interface Setoran {
  id: string;
  kelasId: string;
  kelasNama: string;
  daftarMinggu: string[]; // YYYY-MM-DD (Senin tiap minggu)
  jumlahMinggu: number;
  jumlahSiswaSnapshot: number;
  tarifSnapshot: number;
  total: number;
  tanggalSetor: string; // YYYY-MM-DD
  tahunAjaranId: string;
  transaksiId?: string;
  dibuatPada: string; // ISO string
}

export interface Transaksi {
  id: string;
  jenis: 'pemasukan' | 'pengeluaran';
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
  nominal: number;
  kategori: string;
  setoranId?: string; // Jika terhubung dengan setoran kas kelas
  tahunAjaranId: string;
  dibuatPada: string; // ISO string
}

export interface RiwayatLog {
  id: string;
  waktu: string; // ISO string
  aksi: 'tambah' | 'ubah' | 'hapus' | 'seed';
  jenisData: 'setoran' | 'transaksi' | 'kelas' | 'pengaturan' | 'tahun_ajaran';
  ringkasan: string;
  nilaiLama?: string;
  nilaiBaru?: string;
  alasan: string;
  userEmail?: string;
}

export interface TahunAjaran {
  id: string;
  label: string; // e.g. "2026/2027"
  tanggalMulai: string; // YYYY-MM-DD e.g. "2026-08-03"
  tanggalAkhir: string; // YYYY-MM-DD e.g. "2027-06-27"
  isAktif: boolean;
  createdAt?: string;
}

export interface Pengaturan {
  namaSekolah: string; // "SMKN 7 SAMARINDA"
  namaBendahara: string; // "Alkiyano Parintak"
  emailAdmin: string; // "alkiyano123@gmail.com"
  tarifPerSiswa: number; // default 1000
  tahunAjaranAktifId: string; // "2026_2027"
  tanggalMulaiTahunAjaran: string; // "2026-08-03"
  tanggalAkhirTahunAjaran: string; // "2027-06-27"
  tanggalMulaiPencatatanPerKelas: string; // "2026-11-09"
  viewerPasscodeHash: string; // SHA-256
  kategoriPemasukan: string[];
  kategoriPengeluaran: string[];
  adminUsername?: string;
  adminPassword?: string;
  seedLoaded: boolean;
  updatedAt?: string;
}

export interface WeekInfo {
  startMonday: string; // YYYY-MM-DD
  endSunday: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
  monthName: string; // "Agustus 2026"
  weekNumberInMonth: number;
  weekIndexInYear: number;
  labelShort: string; // "3-9 Agu"
  labelLong: string; // "3 Agu - 9 Agu 2026"
}

export type TabType = 'KAS_MINGGUAN' | 'BUKU_KAS' | 'RINGKASAN' | 'ADMIN';
