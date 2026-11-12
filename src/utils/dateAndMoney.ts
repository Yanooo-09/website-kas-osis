import { WeekInfo, CellStatus } from '../types';

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format angka ke Rupiah "Rp1.234.567"
 */
export function formatRupiah(nominal: number): string {
  const formatted = Math.abs(nominal).toLocaleString('id-ID');
  const sign = nominal < 0 ? '-' : '';
  return `${sign}Rp${formatted}`;
}

/**
 * Parse string YYYY-MM-DD ke Date objek lokal (tanpa pergeseran zona waktu)
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format Date objek ke YYYY-MM-DD
 */
export function formatToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format tanggal Indonesia: "Senin, 9 November 2026" atau "9 November 2026"
 */
export function formatTanggalIndonesia(dateStr: string, sertakanHari = true): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr || '';
  const date = parseLocalDate(dateStr);
  const namaHari = NAMA_HARI[date.getDay()];
  const tanggal = date.getDate();
  const namaBulan = NAMA_BULAN[date.getMonth()];
  const tahun = date.getFullYear();

  if (sertakanHari) {
    return `${namaHari}, ${tanggal} ${namaBulan} ${tahun}`;
  }
  return `${tanggal} ${namaBulan} ${tahun}`;
}

/**
 * Dapatkan nama hari dari tanggal YYYY-MM-DD (otomatis dihitung)
 */
export function getNamaHari(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return NAMA_HARI[date.getDay()];
}

/**
 * Cari tanggal Senin dari tanggal apapun
 */
export function getSeninFromDate(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  // Jika Minggu (0), geser 6 hari ke belakang. Jika Senin (1), geser 0.
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatToYYYYMMDD(d);
}

/**
 * Cari tanggal Senin minggu ini (berdasarkan waktu lokal sistem sekarang)
 */
export function getSeninMingguIni(): string {
  return getSeninFromDate(new Date());
}

/**
 * Tambah sejumlah hari ke string tanggal YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatToYYYYMMDD(d);
}

/**
 * Generate semua minggu berurutan sepanjang tahun ajaran (Senin sampai Minggu).
 * Setiap minggu dikelompokkan ke bulan tempat hari Senin-nya berada.
 */
export function generateMingguTahunAjaran(tanggalMulai: string, tanggalAkhir: string): WeekInfo[] {
  const weeks: WeekInfo[] = [];
  let currentMonday = getSeninFromDate(parseLocalDate(tanggalMulai));
  const endLimit = tanggalAkhir;

  let index = 1;
  const monthCounters: Record<string, number> = {};

  while (currentMonday <= endLimit) {
    const mondayDate = parseLocalDate(currentMonday);
    const sundayStr = addDays(currentMonday, 6);
    const sundayDate = parseLocalDate(sundayStr);

    const monthKey = `${mondayDate.getFullYear()}-${String(mondayDate.getMonth() + 1).padStart(2, '0')}`;
    const monthName = `${NAMA_BULAN[mondayDate.getMonth()]} ${mondayDate.getFullYear()}`;

    monthCounters[monthKey] = (monthCounters[monthKey] || 0) + 1;
    const weekNumberInMonth = monthCounters[monthKey];

    const startDay = mondayDate.getDate();
    const endDay = sundayDate.getDate();
    const startMNameShort = NAMA_BULAN[mondayDate.getMonth()].slice(0, 3);
    const endMNameShort = NAMA_BULAN[sundayDate.getMonth()].slice(0, 3);

    const labelShort = startMNameShort === endMNameShort
      ? `${startDay}-${endDay} ${startMNameShort}`
      : `${startDay} ${startMNameShort} - ${endDay} ${endMNameShort}`;

    const labelLong = `${startDay} ${NAMA_BULAN[mondayDate.getMonth()]} - ${endDay} ${NAMA_BULAN[sundayDate.getMonth()]} ${sundayDate.getFullYear()}`;

    weeks.push({
      startMonday: currentMonday,
      endSunday: sundayStr,
      monthKey,
      monthName,
      weekNumberInMonth,
      weekIndexInYear: index++,
      labelShort,
      labelLong
    });

    currentMonday = addDays(currentMonday, 7);
  }

  return weeks;
}

/**
 * Hitung status kas mingguan sebuah kelas pada minggu tertentu
 */
export function hitungStatusMinggu(
  weekMonday: string,
  sudahBayar: boolean,
  tanggalMulaiPencatatan: string,
  seninMingguBerjalan: string
): CellStatus {
  // 1. Sebelum tanggal pencatatan per kelas -> REKAP LAMA
  if (weekMonday < tanggalMulaiPencatatan) {
    return 'REKAP_LAMA';
  }

  // 2. Sudah bayar
  if (sudahBayar) {
    // Jika minggunya sudah lewat atau sedang berjalan
    if (weekMonday <= seninMingguBerjalan) {
      return 'LUNAS';
    }
    // Jika minggu masa depan yang sudah dibayar
    return 'DI_MUKA';
  }

  // 3. Belum bayar
  // Jika minggunya sudah lewat atau sedang berjalan -> TUNGGAKAN
  if (weekMonday <= seninMingguBerjalan) {
    return 'BELUM';
  }

  // Jika minggu masa depan belum dibayar -> Belum waktunya
  return 'BELUM_ADA';
}

/**
 * Format rentang minggu untuk teks transaksi atau setoran
 * Contoh: "minggu 9 Nov s/d 28 Des 2026, 8 minggu" atau "minggu 9 Nov 2026, 1 minggu"
 */
export function formatKeteranganRentangMinggu(daftarMinggu: string[]): string {
  if (daftarMinggu.length === 0) return '0 minggu';
  const sorted = [...daftarMinggu].sort();
  const count = sorted.length;
  const first = parseLocalDate(sorted[0]);
  const last = parseLocalDate(sorted[sorted.length - 1]);

  const fDay = first.getDate();
  const fMonth = NAMA_BULAN[first.getMonth()].slice(0, 3);
  const fYear = first.getFullYear();

  const lDay = last.getDate();
  const lMonth = NAMA_BULAN[last.getMonth()].slice(0, 3);
  const lYear = last.getFullYear();

  if (count === 1) {
    return `minggu ${fDay} ${fMonth} ${fYear}, 1 minggu`;
  }

  return `minggu ${fDay} ${fMonth} s/d ${lDay} ${lMonth} ${lYear}, ${count} minggu`;
}
