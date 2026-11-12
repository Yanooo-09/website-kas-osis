import { Kelas, Pengaturan, TahunAjaran, Transaksi, Setoran } from '../types';

export const DEFAULT_PENGATURAN: Pengaturan = {
  namaSekolah: 'SMKN 7 SAMARINDA',
  namaBendahara: 'Alkiyano Parintak',
  emailAdmin: 'alkiyano123@gmail.com',
  adminUsername: 'alkiyano',
  adminPassword: '12345',
  tarifPerSiswa: 1000,
  tahunAjaranAktifId: '2026_2027',
  tanggalMulaiTahunAjaran: '2026-08-03',
  tanggalAkhirTahunAjaran: '2027-06-27',
  tanggalMulaiPencatatanPerKelas: '2026-08-03',
  viewerPasscodeHash: '405c6f7316fcb974ef09959569ac72982256d7067413ff5d742262b57f44f82c', // hash of "bendaharakelas"
  kategoriPemasukan: ['Modal', 'Uang Pelanggaran', 'Kas Mingguan (rekap lama)', 'Kas Mingguan', 'Lainnya'],
  kategoriPengeluaran: ['Konsumsi', 'Hadiah & Lomba', 'Perlengkapan', 'Lainnya'],
  seedLoaded: true
};

export const DEFAULT_TAHUN_AJARAN: TahunAjaran = {
  id: '2026_2027',
  label: '2026/2027',
  tanggalMulai: '2026-08-03',
  tanggalAkhir: '2027-06-27',
  isAktif: true
};

export const DEFAULT_KELAS: Kelas[] = [
  // Kelas X (urutan 1 - 8)
  { id: 'kelas_x_tjkt_1', nama: 'X TJKT 1', tingkat: 'X', urutan: 1, jumlahSiswa: 35 },
  { id: 'kelas_x_tjkt_2', nama: 'X TJKT 2', tingkat: 'X', urutan: 2, jumlahSiswa: 34 },
  { id: 'kelas_x_tjkt_3', nama: 'X TJKT 3', tingkat: 'X', urutan: 3, jumlahSiswa: 33 },
  { id: 'kelas_x_pplg_1', nama: 'X PPLG 1', tingkat: 'X', urutan: 4, jumlahSiswa: 34 },
  { id: 'kelas_x_pplg_2', nama: 'X PPLG 2', tingkat: 'X', urutan: 5, jumlahSiswa: 36 },
  { id: 'kelas_x_dkv_1', nama: 'X DKV 1', tingkat: 'X', urutan: 6, jumlahSiswa: 36 },
  { id: 'kelas_x_dkv_2', nama: 'X DKV 2', tingkat: 'X', urutan: 7, jumlahSiswa: 35 },
  { id: 'kelas_x_animasi', nama: 'X ANIMASI', tingkat: 'X', urutan: 8, jumlahSiswa: 35 },

  // Kelas XI (urutan 9 - 16)
  { id: 'kelas_xi_tjkt_1', nama: 'XI TJKT 1', tingkat: 'XI', urutan: 9, jumlahSiswa: 35 },
  { id: 'kelas_xi_tjkt_2', nama: 'XI TJKT 2', tingkat: 'XI', urutan: 10, jumlahSiswa: 32 },
  { id: 'kelas_xi_tjkt_3', nama: 'XI TJKT 3', tingkat: 'XI', urutan: 11, jumlahSiswa: 35 },
  { id: 'kelas_xi_pplg_1', nama: 'XI PPLG 1', tingkat: 'XI', urutan: 12, jumlahSiswa: 34 },
  { id: 'kelas_xi_pplg_2', nama: 'XI PPLG 2', tingkat: 'XI', urutan: 13, jumlahSiswa: 35 },
  { id: 'kelas_xi_dkv_1', nama: 'XI DKV 1', tingkat: 'XI', urutan: 14, jumlahSiswa: 34 },
  { id: 'kelas_xi_dkv_2', nama: 'XI DKV 2', tingkat: 'XI', urutan: 15, jumlahSiswa: 31 },
  { id: 'kelas_xi_animasi', nama: 'XI ANIMASI', tingkat: 'XI', urutan: 16, jumlahSiswa: 29 },
];

export const SEED_TRANSAKSI_EXCEL: Transaksi[] = [
  { id: 'tx_1', tanggal: '2026-07-20', keterangan: 'Modal awal', jenis: 'pemasukan', nominal: 1000000, kategori: 'Modal', tahunAjaranId: '2026_2027', dibuatPada: '2026-07-20T08:00:00.000Z' },
  { id: 'tx_2', tanggal: '2026-08-08', keterangan: 'Uang kas minggu', jenis: 'pemasukan', nominal: 412000, kategori: 'Kas Mingguan (rekap lama)', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-08T08:00:00.000Z' },
  { id: 'tx_3', tanggal: '2026-08-08', keterangan: 'Hadiah lomba senam 17 an', jenis: 'pengeluaran', nominal: 497000, kategori: 'Hadiah & Lomba', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-08T09:00:00.000Z' },
  { id: 'tx_4', tanggal: '2026-08-11', keterangan: '2 spanduk kurang dari uang futsal', jenis: 'pengeluaran', nominal: 40000, kategori: 'Perlengkapan', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-11T08:00:00.000Z' },
  { id: 'tx_5', tanggal: '2026-08-12', keterangan: 'Konsumsi', jenis: 'pengeluaran', nominal: 230000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-12T08:00:00.000Z' },
  { id: 'tx_6', tanggal: '2026-08-12', keterangan: 'Kue buat juri', jenis: 'pengeluaran', nominal: 37000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-12T08:30:00.000Z' },
  { id: 'tx_7', tanggal: '2026-08-12', keterangan: 'Batrai mic', jenis: 'pengeluaran', nominal: 16000, kategori: 'Perlengkapan', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-12T09:00:00.000Z' },
  { id: 'tx_8', tanggal: '2026-08-12', keterangan: 'Minum Cleo 1 pack', jenis: 'pengeluaran', nominal: 23000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-12T09:30:00.000Z' },
  { id: 'tx_9', tanggal: '2026-08-12', keterangan: 'Kotakan 1 pack isi 100', jenis: 'pengeluaran', nominal: 45000, kategori: 'Perlengkapan', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-12T10:00:00.000Z' },
  { id: 'tx_10', tanggal: '2026-08-13', keterangan: 'Konsumsi minum makan wasit', jenis: 'pengeluaran', nominal: 66000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-13T08:00:00.000Z' },
  { id: 'tx_11', tanggal: '2026-08-13', keterangan: 'Konsumsi minum PMR dan OSIS', jenis: 'pengeluaran', nominal: 40000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-13T08:30:00.000Z' },
  { id: 'tx_12', tanggal: '2026-08-13', keterangan: 'Bungkus hadiah lomba YEL', jenis: 'pengeluaran', nominal: 45000, kategori: 'Hadiah & Lomba', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-13T09:00:00.000Z' },
  { id: 'tx_13', tanggal: '2026-08-13', keterangan: 'Matrai 10 rb', jenis: 'pengeluaran', nominal: 12000, kategori: 'Perlengkapan', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-13T09:30:00.000Z' },
  { id: 'tx_14', tanggal: '2026-08-14', keterangan: 'Modal tambahan', jenis: 'pemasukan', nominal: 600000, kategori: 'Modal', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-14T08:00:00.000Z' },
  { id: 'tx_15', tanggal: '2026-08-14', keterangan: 'Konsumsi panitia', jenis: 'pengeluaran', nominal: 238000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-14T08:30:00.000Z' },
  { id: 'tx_16', tanggal: '2026-08-14', keterangan: 'Kue juri', jenis: 'pengeluaran', nominal: 15000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-14T09:00:00.000Z' },
  { id: 'tx_17', tanggal: '2026-08-14', keterangan: 'Minum Cleo 1 pack', jenis: 'pengeluaran', nominal: 26000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-14T09:30:00.000Z' },
  { id: 'tx_18', tanggal: '2026-08-14', keterangan: 'Konsumsi makan minum wasit', jenis: 'pengeluaran', nominal: 44000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-14T10:00:00.000Z' },
  { id: 'tx_19', tanggal: '2026-08-14', keterangan: 'Totebag lomba nyanyi', jenis: 'pengeluaran', nominal: 44000, kategori: 'Hadiah & Lomba', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-14T10:30:00.000Z' },
  { id: 'tx_20', tanggal: '2026-08-14', keterangan: 'Konsumsi minum PMR dan OSIS', jenis: 'pengeluaran', nominal: 40000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-14T11:00:00.000Z' },
  { id: 'tx_21', tanggal: '2026-08-14', keterangan: 'Bungkus kado senam', jenis: 'pengeluaran', nominal: 8000, kategori: 'Hadiah & Lomba', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-14T11:30:00.000Z' },
  { id: 'tx_22', tanggal: '2026-08-16', keterangan: 'Konsumsi panitia', jenis: 'pengeluaran', nominal: 204000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-16T08:00:00.000Z' },
  { id: 'tx_23', tanggal: '2026-08-16', keterangan: 'Konsumsi makan minum wasit', jenis: 'pengeluaran', nominal: 62000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-16T08:30:00.000Z' },
  { id: 'tx_24', tanggal: '2026-08-16', keterangan: 'Konsumsi minum OSIS PMR', jenis: 'pengeluaran', nominal: 40000, kategori: 'Konsumsi', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-16T09:00:00.000Z' },
  { id: 'tx_25', tanggal: '2026-08-16', keterangan: 'Hadiah top score futsal', jenis: 'pengeluaran', nominal: 150000, kategori: 'Hadiah & Lomba', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-16T09:30:00.000Z' },
  { id: 'tx_26', tanggal: '2026-08-16', keterangan: 'Uang pelanggaran', jenis: 'pemasukan', nominal: 30000, kategori: 'Uang Pelanggaran', tahunAjaranId: '2026_2027', dibuatPada: '2026-08-16T10:00:00.000Z' },
  { id: 'tx_27', tanggal: '2026-09-02', keterangan: 'Uang kas minggu', jenis: 'pemasukan', nominal: 814000, kategori: 'Kas Mingguan (rekap lama)', tahunAjaranId: '2026_2027', dibuatPada: '2026-09-02T08:00:00.000Z' },
  { id: 'tx_28', tanggal: '2026-09-14', keterangan: 'Uang kas minggu', jenis: 'pemasukan', nominal: 738000, kategori: 'Kas Mingguan (rekap lama)', tahunAjaranId: '2026_2027', dibuatPada: '2026-09-14T08:00:00.000Z' },
  { id: 'tx_29', tanggal: '2026-09-16', keterangan: 'Uang kas minggu', jenis: 'pemasukan', nominal: 731000, kategori: 'Kas Mingguan (rekap lama)', tahunAjaranId: '2026_2027', dibuatPada: '2026-09-16T08:00:00.000Z' },
  { id: 'tx_30', tanggal: '2026-09-26', keterangan: 'Uang kas minggu', jenis: 'pemasukan', nominal: 170000, kategori: 'Kas Mingguan (rekap lama)', tahunAjaranId: '2026_2027', dibuatPada: '2026-09-26T08:00:00.000Z' },
  { id: 'tx_31', tanggal: '2026-10-18', keterangan: 'Kebutuhan batrai mic 8', jenis: 'pengeluaran', nominal: 28000, kategori: 'Perlengkapan', tahunAjaranId: '2026_2027', dibuatPada: '2026-10-18T08:00:00.000Z' },
];

/**
 * Data historis rincian minggu yang telah dibayar tiap kelas di Excel (Agustus & September 2026)
 * Sesuai foto lampiran image_de34c3ab.png:
 */
export const DEFAULT_SETORAN: Setoran[] = [
  // 1. X TJKT 1: 4 minggu Agustus + 1 minggu September (31-6)
  {
    id: 'setoran_x_tjkt_1',
    kelasId: 'kelas_x_tjkt_1',
    kelasNama: 'X TJKT 1',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31'],
    jumlahMinggu: 5,
    jumlahSiswaSnapshot: 35,
    tarifSnapshot: 1000,
    total: 175000,
    tanggalSetor: '2026-09-02',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-02T08:00:00.000Z'
  },
  // 2. X TJKT 2: 4 minggu Agustus
  {
    id: 'setoran_x_tjkt_2',
    kelasId: 'kelas_x_tjkt_2',
    kelasNama: 'X TJKT 2',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24'],
    jumlahMinggu: 4,
    jumlahSiswaSnapshot: 34,
    tarifSnapshot: 1000,
    total: 136000,
    tanggalSetor: '2026-08-24',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-08-24T08:00:00.000Z'
  },
  // 3. X TJKT 3: 3 minggu Agustus (minggu ke-4 kosong)
  {
    id: 'setoran_x_tjkt_3',
    kelasId: 'kelas_x_tjkt_3',
    kelasNama: 'X TJKT 3',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17'],
    jumlahMinggu: 3,
    jumlahSiswaSnapshot: 33,
    tarifSnapshot: 1000,
    total: 99000,
    tanggalSetor: '2026-08-17',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-08-17T08:00:00.000Z'
  },
  // 4. X PPLG 1: 4 minggu Agustus + 1 minggu September (31-6)
  {
    id: 'setoran_x_pplg_1',
    kelasId: 'kelas_x_pplg_1',
    kelasNama: 'X PPLG 1',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31'],
    jumlahMinggu: 5,
    jumlahSiswaSnapshot: 34,
    tarifSnapshot: 1000,
    total: 170000,
    tanggalSetor: '2026-09-02',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-02T08:00:00.000Z'
  },
  // 5. X PPLG 2: 4 minggu Agustus + 2 minggu September (31-6, 7-13)
  {
    id: 'setoran_x_pplg_2',
    kelasId: 'kelas_x_pplg_2',
    kelasNama: 'X PPLG 2',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07'],
    jumlahMinggu: 6,
    jumlahSiswaSnapshot: 36,
    tarifSnapshot: 1000,
    total: 216000,
    tanggalSetor: '2026-09-14',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-14T08:00:00.000Z'
  },
  // 6. X DKV 1: 4 minggu Agustus + 2 minggu September (31-6, 7-13)
  {
    id: 'setoran_x_dkv_1',
    kelasId: 'kelas_x_dkv_1',
    kelasNama: 'X DKV 1',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07'],
    jumlahMinggu: 6,
    jumlahSiswaSnapshot: 36,
    tarifSnapshot: 1000,
    total: 216000,
    tanggalSetor: '2026-09-14',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-14T08:00:00.000Z'
  },
  // 7. X DKV 2: 4 minggu Agustus + 2 minggu September (31-6, 14-20)
  {
    id: 'setoran_x_dkv_2',
    kelasId: 'kelas_x_dkv_2',
    kelasNama: 'X DKV 2',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-14'],
    jumlahMinggu: 6,
    jumlahSiswaSnapshot: 35,
    tarifSnapshot: 1000,
    total: 210000,
    tanggalSetor: '2026-09-16',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-16T08:00:00.000Z'
  },
  // 8. X ANIMASI: 4 minggu Agustus + 1 minggu September (31-6)
  {
    id: 'setoran_x_animasi',
    kelasId: 'kelas_x_animasi',
    kelasNama: 'X ANIMASI',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31'],
    jumlahMinggu: 5,
    jumlahSiswaSnapshot: 35,
    tarifSnapshot: 1000,
    total: 175000,
    tanggalSetor: '2026-09-02',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-02T08:00:00.000Z'
  },
  // 9. XI TJKT 1: 4 minggu Agustus + 2 minggu September (31-6, 7-13)
  {
    id: 'setoran_xi_tjkt_1',
    kelasId: 'kelas_xi_tjkt_1',
    kelasNama: 'XI TJKT 1',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07'],
    jumlahMinggu: 6,
    jumlahSiswaSnapshot: 35,
    tarifSnapshot: 1000,
    total: 210000,
    tanggalSetor: '2026-09-14',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-14T08:00:00.000Z'
  },
  // 10. XI TJKT 2: 4 minggu Agustus + 4 minggu September (31-6, 7-13, 14-20, 21-27) (Lunas September!)
  {
    id: 'setoran_xi_tjkt_2',
    kelasId: 'kelas_xi_tjkt_2',
    kelasNama: 'XI TJKT 2',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21'],
    jumlahMinggu: 8,
    jumlahSiswaSnapshot: 32,
    tarifSnapshot: 1000,
    total: 256000,
    tanggalSetor: '2026-09-26',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-26T08:00:00.000Z'
  },
  // 11. XI TJKT 3: 4 minggu Agustus + 1 minggu September (31-6)
  {
    id: 'setoran_xi_tjkt_3',
    kelasId: 'kelas_xi_tjkt_3',
    kelasNama: 'XI TJKT 3',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31'],
    jumlahMinggu: 5,
    jumlahSiswaSnapshot: 35,
    tarifSnapshot: 1000,
    total: 175000,
    tanggalSetor: '2026-09-02',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-02T08:00:00.000Z'
  },
  // 12. XI PPLG 1: 4 minggu Agustus + 1 minggu September (31-6)
  {
    id: 'setoran_xi_pplg_1',
    kelasId: 'kelas_xi_pplg_1',
    kelasNama: 'XI PPLG 1',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31'],
    jumlahMinggu: 5,
    jumlahSiswaSnapshot: 34,
    tarifSnapshot: 1000,
    total: 170000,
    tanggalSetor: '2026-09-02',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-02T08:00:00.000Z'
  },
  // 13. XI PPLG 2: 4 minggu Agustus
  {
    id: 'setoran_xi_pplg_2',
    kelasId: 'kelas_xi_pplg_2',
    kelasNama: 'XI PPLG 2',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24'],
    jumlahMinggu: 4,
    jumlahSiswaSnapshot: 35,
    tarifSnapshot: 1000,
    total: 140000,
    tanggalSetor: '2026-08-24',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-08-24T08:00:00.000Z'
  },
  // 14. XI DKV 1: 4 minggu Agustus + 3 minggu September (31-6, 7-13, 14-20)
  {
    id: 'setoran_xi_dkv_1',
    kelasId: 'kelas_xi_dkv_1',
    kelasNama: 'XI DKV 1',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14'],
    jumlahMinggu: 7,
    jumlahSiswaSnapshot: 34,
    tarifSnapshot: 1000,
    total: 238000,
    tanggalSetor: '2026-09-16',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-09-16T08:00:00.000Z'
  },
  // 15. XI DKV 2: 3 minggu Agustus (minggu ke-4 kosong)
  {
    id: 'setoran_xi_dkv_2',
    kelasId: 'kelas_xi_dkv_2',
    kelasNama: 'XI DKV 2',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17'],
    jumlahMinggu: 3,
    jumlahSiswaSnapshot: 31,
    tarifSnapshot: 1000,
    total: 93000,
    tanggalSetor: '2026-08-17',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-08-17T08:00:00.000Z'
  },
  // 16. XI ANIMASI: 4 minggu Agustus
  {
    id: 'setoran_xi_animasi',
    kelasId: 'kelas_xi_animasi',
    kelasNama: 'XI ANIMASI',
    daftarMinggu: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24'],
    jumlahMinggu: 4,
    jumlahSiswaSnapshot: 29,
    tarifSnapshot: 1000,
    total: 116000,
    tanggalSetor: '2026-08-24',
    tahunAjaranId: '2026_2027',
    dibuatPada: '2026-08-24T08:00:00.000Z'
  }
];
