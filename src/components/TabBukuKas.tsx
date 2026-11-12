import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaksi } from '../types';
import {
  formatRupiah,
  formatTanggalIndonesia,
  getNamaHari
} from '../utils/dateAndMoney';
import * as XLSX from 'xlsx';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  Download,
  Calendar,
  Wallet,
  Receipt,
  LayoutList,
  Table as TableIcon,
  FileSpreadsheet
} from 'lucide-react';

export const TabBukuKas: React.FC = () => {
  const {
    transaksiList,
    selectedTahunAjaranId,
    saldoSekarang,
    totalPemasukan,
    totalPengeluaran,
    isAdmin
  } = useApp();

  const [filterBulan, setFilterBulan] = useState<string>('SEMUA');
  const [filterKategori, setFilterKategori] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Transactions in current academic year, ordered chronologically (oldest to newest)
  const academicTransactions = useMemo(() => {
    return transaksiList.filter((t) => t.tahunAjaranId === selectedTahunAjaranId);
  }, [transaksiList, selectedTahunAjaranId]);

  // Calculate Running Balance for every transaction in sequence!
  const transactionsWithRunningBalance = useMemo(() => {
    let running = 0;
    return academicTransactions.map((tx, idx) => {
      if (tx.jenis === 'pemasukan') {
        running += Number(tx.nominal);
      } else {
        running -= Number(tx.nominal);
      }
      return {
        ...tx,
        no: idx + 1,
        runningBalance: running,
        namaHari: getNamaHari(tx.tanggal)
      };
    });
  }, [academicTransactions]);

  // List of available months in current transactions
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    academicTransactions.forEach((t) => {
      if (t.tanggal && t.tanggal.length >= 7) {
        set.add(t.tanggal.slice(0, 7)); // YYYY-MM
      }
    });
    return Array.from(set).sort();
  }, [academicTransactions]);

  // List of available categories
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    academicTransactions.forEach((t) => {
      if (t.kategori) set.add(t.kategori);
    });
    return Array.from(set).sort();
  }, [academicTransactions]);

  // Filtered transactions for display
  const filteredList = useMemo(() => {
    return transactionsWithRunningBalance.filter((tx) => {
      if (filterBulan !== 'SEMUA' && !tx.tanggal.startsWith(filterBulan)) {
        return false;
      }
      if (filterKategori !== 'SEMUA' && tx.kategori !== filterKategori) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchKeterangan = tx.keterangan.toLowerCase().includes(q);
        const matchKategori = tx.kategori.toLowerCase().includes(q);
        const matchTanggal = tx.tanggal.includes(q);
        if (!matchKeterangan && !matchKategori && !matchTanggal) return false;
      }
      return true;
    });
  }, [transactionsWithRunningBalance, filterBulan, filterKategori, searchQuery]);

  // Filtered totals
  const filteredSummary = useMemo(() => {
    let inTotal = 0;
    let outTotal = 0;
    filteredList.forEach((tx) => {
      if (tx.jenis === 'pemasukan') inTotal += Number(tx.nominal);
      else outTotal += Number(tx.nominal);
    });
    return { inTotal, outTotal };
  }, [filteredList]);

  // Export Excel (.xlsx) - Khusus Admin
  const handleExportExcel = () => {
    if (!isAdmin) {
      alert('Akses dibatasi. Fitur ekspor Excel hanya dapat diakses oleh Admin (Bendahara OSIS).');
      return;
    }

    if (filteredList.length === 0) {
      alert('Tidak ada transaksi untuk diekspor.');
      return;
    }

    const dataRows = filteredList.map((tx) => ({
      'No': tx.no,
      'Tanggal': tx.tanggal,
      'Hari': tx.namaHari,
      'Keterangan': tx.keterangan,
      'Kategori': tx.kategori,
      'Pemasukan (Rp)': tx.jenis === 'pemasukan' ? tx.nominal : 0,
      'Pengeluaran (Rp)': tx.jenis === 'pengeluaran' ? tx.nominal : 0,
      'Saldo Berjalan (Rp)': tx.runningBalance
    }));

    // Summary row
    dataRows.push({
      'No': '',
      'Tanggal': '',
      'Hari': '',
      'Keterangan': 'TOTAL PERIODE INI',
      'Kategori': `${filteredList.length} Transaksi`,
      'Pemasukan (Rp)': filteredSummary.inTotal,
      'Pengeluaran (Rp)': filteredSummary.outTotal,
      'Saldo Berjalan (Rp)': filteredList[filteredList.length - 1]?.runningBalance || 0
    } as any);

    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Set auto column widths
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 14 }, // Tanggal
      { wch: 10 }, // Hari
      { wch: 40 }, // Keterangan
      { wch: 24 }, // Kategori
      { wch: 18 }, // Pemasukan
      { wch: 18 }, // Pengeluaran
      { wch: 22 }, // Saldo
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Buku Kas Umum');

    const cleanTahun = selectedTahunAjaranId.replace('/', '_');
    const todayStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Buku_Kas_OSIS_SMKN7_${cleanTahun}_${filterBulan}_${todayStr}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* 1. KARTU RINGKASAN SALDO BUKU KAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo Sekarang */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Saldo Kas Saat Ini</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono-num font-extrabold text-2xl sm:text-3xl text-emerald-600 mt-3">
            {formatRupiah(saldoSekarang)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5">
            Total kas nyata di tangan bendahara
          </div>
        </div>

        {/* Total Pemasukan */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Total Pemasukan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono-num font-extrabold text-2xl sm:text-3xl text-blue-600 mt-3">
            {formatRupiah(totalPemasukan)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5">
            Dari kas kelas, modal & lainnya
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Total Pengeluaran</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono-num font-extrabold text-2xl sm:text-3xl text-rose-600 mt-3">
            {formatRupiah(totalPengeluaran)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5">
            Konsumsi, lomba & perlengkapan
          </div>
        </div>
      </div>

      {/* 2. FILTER & CONTROLS */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi, keterangan, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-[#6C2BD9] outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Bulan */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-[#6C2BD9]"
              >
                <option value="SEMUA">Semua Bulan</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Kategori */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-[#6C2BD9]"
              >
                <option value="SEMUA">Semua Kategori</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Ekspor Excel (Khusus Admin) */}
            {isAdmin && (
              <button
                onClick={handleExportExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ml-auto shadow-xs transition-colors cursor-pointer"
                title="Unduh seluruh buku kas dalam format Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>Ekspor Excel (.xlsx)</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Indicator */}
        {(filterBulan !== 'SEMUA' || filterKategori !== 'SEMUA' || searchQuery !== '') && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>
              Menampilkan {filteredList.length} dari {academicTransactions.length} transaksi
            </span>
            <div className="flex gap-3 font-mono-num text-[11px] font-bold">
              <span className="text-emerald-600">Masuk: {formatRupiah(filteredSummary.inTotal)}</span>
              <span className="text-rose-600">Keluar: {formatRupiah(filteredSummary.outTotal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. JURNAL BUKU KAS OSIS (TABEL & KARTU MOBILE) */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Jurnal Buku Kas OSIS
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Tercatat berurutan dengan perhitungan saldo riil otomatis
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            Total {filteredList.length} Transaksi
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl text-xs">
            Tidak ada transaksi yang cocok dengan kriteria filter.
          </div>
        ) : (
          <>
            {/* Mobile Cards View (md:hidden) - Super nyaman di HP! */}
            <div className="space-y-2.5 md:hidden">
              {filteredList.map((tx) => {
                const isPemasukan = tx.jenis === 'pemasukan';
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center font-mono-num">
                          {tx.no}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {tx.namaHari}, {formatTanggalIndonesia(tx.tanggal, false)}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {tx.kategori}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-900">
                      {tx.keterangan}
                      {tx.setoranId && (
                        <span className="ml-1.5 text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase">
                          Kas Kelas
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div className="font-mono-num font-bold">
                        {isPemasukan ? (
                          <span className="text-emerald-600">+ {formatRupiah(tx.nominal)}</span>
                        ) : (
                          <span className="text-rose-600">- {formatRupiah(tx.nominal)}</span>
                        )}
                      </div>
                      <div className="text-slate-500 font-mono-num text-[11px]">
                        Saldo: <span className="font-bold text-slate-800">{formatRupiah(tx.runningBalance)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="border-r border-slate-200 p-3 font-bold text-center w-12">No</th>
                    <th className="border-r border-slate-200 p-3 font-bold min-w-[150px]">Tanggal & Hari</th>
                    <th className="border-r border-slate-200 p-3 font-bold min-w-[240px]">Keterangan</th>
                    <th className="border-r border-slate-200 p-3 font-bold min-w-[130px]">Kategori</th>
                    <th className="border-r border-slate-200 p-3 font-bold text-right min-w-[110px]">Pemasukan</th>
                    <th className="border-r border-slate-200 p-3 font-bold text-right min-w-[110px]">Pengeluaran</th>
                    <th className="p-3 font-bold text-right min-w-[125px]">Saldo Berjalan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredList.map((tx) => {
                    const isPemasukan = tx.jenis === 'pemasukan';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="border-r border-slate-200 p-2.5 text-center font-mono-num font-semibold text-slate-500">
                          {tx.no}
                        </td>

                        <td className="border-r border-slate-200 p-2.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">
                            {tx.namaHari}, {formatTanggalIndonesia(tx.tanggal, false)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono-num">{tx.tanggal}</div>
                        </td>

                        <td className="border-r border-slate-200 p-2.5 text-slate-800 font-medium">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{tx.keterangan}</span>
                            {tx.setoranId && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase shrink-0">
                                Kas Kelas
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="border-r border-slate-200 p-2.5">
                          <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                            {tx.kategori}
                          </span>
                        </td>

                        <td className="border-r border-slate-200 p-2.5 text-right font-mono-num font-bold text-emerald-600">
                          {isPemasukan ? formatRupiah(tx.nominal) : '-'}
                        </td>

                        <td className="border-r border-slate-200 p-2.5 text-right font-mono-num font-bold text-rose-600">
                          {!isPemasukan ? formatRupiah(tx.nominal) : '-'}
                        </td>

                        <td className="p-2.5 text-right font-mono-num font-bold text-sm text-slate-900">
                          {formatRupiah(tx.runningBalance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
