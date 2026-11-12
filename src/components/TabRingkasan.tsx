import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  formatRupiah,
  formatTanggalIndonesia,
  hitungStatusMinggu
} from '../utils/dateAndMoney';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  AlertTriangle,
  History,
  Clock,
  CheckCircle2,
  Tag,
  Sparkles,
  CalendarDays,
  BookOpen,
  ShieldCheck,
  Users,
  Layers,
  ArrowRight
} from 'lucide-react';

export const TabRingkasan: React.FC = () => {
  const {
    kelasList,
    setoranList,
    transaksiList,
    riwayatList,
    allWeeks,
    pengaturan,
    currentMonday,
    selectedTahunAjaranId,
    saldoSekarang,
    totalPemasukan,
    totalPengeluaran,
    isAdmin,
    setActiveTab
  } = useApp();

  // 1. Pengeluaran per kategori
  const kategoriStats = useMemo(() => {
    const map = new Map<string, number>();
    let grandTotalPengeluaran = 0;

    transaksiList.forEach((t) => {
      if (t.tahunAjaranId === selectedTahunAjaranId && t.jenis === 'pengeluaran') {
        const nom = Number(t.nominal);
        grandTotalPengeluaran += nom;
        const cat = t.kategori || 'Lainnya';
        map.set(cat, (map.get(cat) || 0) + nom);
      }
    });

    const list = Array.from(map.entries()).map(([kategori, total]) => {
      const percentage = grandTotalPengeluaran > 0 ? (total / grandTotalPengeluaran) * 100 : 0;
      return {
        kategori,
        total,
        percentage: Math.round(percentage * 10) / 10
      };
    });

    list.sort((a, b) => b.total - a.total);
    return { list, grandTotalPengeluaran };
  }, [transaksiList, selectedTahunAjaranId]);

  // 2. Ranking Kelas dengan Tunggakan Terbanyak
  const tunggakanRanking = useMemo(() => {
    const paidWeeksMap = new Map<string, Set<string>>();
    kelasList.forEach((k) => paidWeeksMap.set(k.id, new Set()));
    setoranList
      .filter((s) => s.tahunAjaranId === selectedTahunAjaranId)
      .forEach((s) => {
        const set = paidWeeksMap.get(s.kelasId);
        if (set) {
          s.daftarMinggu.forEach((m) => set.add(m));
        }
      });

    const ranking = kelasList.map((k) => {
      const paidSet = paidWeeksMap.get(k.id) || new Set<string>();
      let jumlahTunggakanMinggu = 0;

      allWeeks.forEach((w) => {
        const status = hitungStatusMinggu(
          w.startMonday,
          paidSet.has(w.startMonday),
          pengaturan.tanggalMulaiPencatatanPerKelas,
          currentMonday
        );
        if (status === 'BELUM') {
          jumlahTunggakanMinggu++;
        }
      });

      const nominalTunggakan =
        jumlahTunggakanMinggu * k.jumlahSiswa * (pengaturan.tarifPerSiswa || 1000);

      return {
        kelas: k,
        jumlahTunggakanMinggu,
        nominalTunggakan
      };
    });

    ranking.sort((a, b) => b.jumlahTunggakanMinggu - a.jumlahTunggakanMinggu);
    return ranking;
  }, [kelasList, setoranList, allWeeks, pengaturan, currentMonday, selectedTahunAjaranId]);

  // Total Siswa
  const totalSiswa = useMemo(() => {
    return kelasList.reduce((acc, curr) => acc + (curr.jumlahSiswa || 0), 0);
  }, [kelasList]);

  // Kelas yang Lunas Minggu Ini
  const kelasLunasCount = useMemo(() => {
    return tunggakanRanking.filter((r) => r.jumlahTunggakanMinggu === 0).length;
  }, [tunggakanRanking]);

  // Transaksi terbaru untuk Live Activity (5 transaksi terakhir)
  const transaksiTerbaru = useMemo(() => {
    return [...transaksiList]
      .filter((t) => t.tahunAjaranId === selectedTahunAjaranId)
      .sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''))
      .slice(0, 5);
  }, [transaksiList, selectedTahunAjaranId]);

  return (
    <div className="space-y-6">
      {/* 1. SIGNATURE HERO BANNER (Matching Dashboard Reference Style) */}
      <div className="bg-gradient-to-r from-[#0A3D78] via-[#0E52A4] to-[#1266CC] rounded-3xl p-6 sm:p-7 text-white shadow-md border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {isAdmin ? (pengaturan.namaBendahara || 'ALKIYANO PARINTAK') : 'BENDAHARA KELAS'}
              </h2>
              <span className="text-[11px] font-bold bg-white/15 px-3 py-1 rounded-full backdrop-blur-xs text-sky-100 border border-white/20">
                Tahun Ajaran {selectedTahunAjaranId.replace('_', '/')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-sky-100/90 mt-1 font-medium">
              Ringkasan performa dan pembukuan kas OSIS SMK Negeri 7 Samarinda
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('KAS_MINGGUAN')}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3.5 py-2 rounded-xl backdrop-blur-xs transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Kas Kelas</span>
            </button>
            <button
              onClick={() => setActiveTab('BUKU_KAS')}
              className="bg-white text-[#0D62C9] hover:bg-sky-50 text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Kas</span>
            </button>
          </div>
        </div>

        {/* 4 Frosted Glass Stat Widgets Inside Hero Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Box 1: Saldo */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-sky-200 text-xs font-semibold">
              <Wallet className="w-4 h-4 text-sky-200" />
              <span>Saldo Kas Saat Ini</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-2 tracking-tight font-mono-num">
              {formatRupiah(saldoSekarang)}
            </div>
            <div className="text-[11px] text-sky-200/80 mt-1 font-medium">
              Sisa saldo riil kas OSIS
            </div>
          </div>

          {/* Box 2: Total Pemasukan */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
              <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
              <span>Total Pemasukan</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-2 tracking-tight font-mono-num text-emerald-300">
              {formatRupiah(totalPemasukan)}
            </div>
            <div className="text-[11px] text-sky-200/80 mt-1 font-medium">
              Penerimaan kas terverifikasi
            </div>
          </div>

          {/* Box 3: Total Pengeluaran */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-rose-200 text-xs font-semibold">
              <ArrowUpRight className="w-4 h-4 text-rose-300" />
              <span>Total Pengeluaran</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-2 tracking-tight font-mono-num text-rose-300">
              {formatRupiah(totalPengeluaran)}
            </div>
            <div className="text-[11px] text-sky-200/80 mt-1 font-medium">
              Biaya & kegiatan terlaksana
            </div>
          </div>

          {/* Box 4: Status Setoran */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Kelas Lunas</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-2 tracking-tight font-mono-num text-amber-300">
              {kelasLunasCount} <span className="text-sm font-semibold text-white/80">/ {kelasList.length} Kelas</span>
            </div>
            <div className="text-[11px] text-sky-200/80 mt-1 font-medium">
              {kelasList.length - kelasLunasCount} kelas ada tunggakan
            </div>
          </div>
        </div>
      </div>

      {/* 2. ROW OF 4 PRIMARY KPI CARDS (Matching Reference Cards with Progress Bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Siswa */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200/70 px-2 py-0.5 rounded-full">
              16 Kelas
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono-num">
              {totalSiswa}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Total Siswa Terdaftar
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Tingkat X & XI SMKN 7</span>
            <span className="font-semibold text-slate-600">Aktif</span>
          </div>
        </div>

        {/* KPI 2: Kas Masuk */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
              + Masuk
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-emerald-600 tracking-tight font-mono-num">
              {formatRupiah(totalPemasukan)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Total Uang Kas Masuk
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Penerimaan kas OSIS</span>
            <span className="font-semibold text-emerald-600 font-mono-num">100% Tercatat</span>
          </div>
        </div>

        {/* KPI 3: Pengeluaran */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/70 px-2 py-0.5 rounded-full">
              - Keluar
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-rose-600 tracking-tight font-mono-num">
              {formatRupiah(totalPengeluaran)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Total Realisasi Belanja
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Kegiatan & operasional</span>
            <span className="font-semibold text-slate-600">{kategoriStats.list.length} Kategori</span>
          </div>
        </div>

        {/* KPI 4: Sisa Kas */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D62C9] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full">
              Riil Saat Ini
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-[#0D62C9] tracking-tight font-mono-num">
              {formatRupiah(saldoSekarang)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Sisa Saldo Kas OSIS
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Status pembukuan</span>
            <span className="font-semibold text-emerald-600">Seimbang</span>
          </div>
        </div>
      </div>

      {/* 3. FOUR QUICK ACTION GRADIENT TILES (Directly inspired by reference) */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
          Akses Cepat Modul
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Tile 1: Kas Mingguan */}
          <button
            onClick={() => setActiveTab('KAS_MINGGUAN')}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#0D62C9] to-[#0284C7] text-white text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between h-36"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base leading-tight">Kas Mingguan Kelas</div>
              <p className="text-xs text-sky-100/90 mt-0.5">Ceklist setoran 16 kelas</p>
            </div>
          </button>

          {/* Tile 2: Buku Kas */}
          <button
            onClick={() => setActiveTab('BUKU_KAS')}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#059669] to-[#10B981] text-white text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between h-36"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base leading-tight">Buku Kas Umum</div>
              <p className="text-xs text-emerald-100/90 mt-0.5">Jurnal penerimaan & saldo</p>
            </div>
          </button>

          {/* Tile 3: Tunggakan */}
          <button
            onClick={() => {
              const el = document.getElementById('section-tunggakan');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#F97316] text-white text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between h-36"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base leading-tight">Cek Tunggakan</div>
              <p className="text-xs text-orange-100/90 mt-0.5">Daftar kelas belum bayar</p>
            </div>
          </button>

          {/* Tile 4: Panel Admin */}
          <button
            onClick={() => setActiveTab('ADMIN')}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between h-36"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base leading-tight">Panel Admin</div>
              <p className="text-xs text-purple-100/90 mt-0.5">Kelola & ekspor data kas</p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. TWO-COLUMN LAYOUT: Analytics on Left & Live Activity on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Category Distribution & Class Arrears */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rincian Pengeluaran per Kategori */}
          <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0D62C9] flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Rincian Pengeluaran per Kategori
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Distribusi alokasi dana kegiatan kas OSIS
                  </p>
                </div>
              </div>
              <span className="font-mono-num text-xs font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                Total: {formatRupiah(kategoriStats.grandTotalPengeluaran)}
              </span>
            </div>

            {kategoriStats.list.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl text-xs">
                Belum ada catatan transaksi pengeluaran.
              </div>
            ) : (
              <div className="space-y-4">
                {kategoriStats.list.map((cat, idx) => {
                  const barColors = [
                    'bg-[#0D62C9]',
                    'bg-emerald-500',
                    'bg-amber-500',
                    'bg-purple-500',
                    'bg-rose-500'
                  ];
                  const color = barColors[idx % barColors.length];

                  return (
                    <div key={cat.kategori} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          {cat.kategori}
                        </span>
                        <div className="font-mono-num text-right">
                          <span className="font-extrabold text-slate-900">{formatRupiah(cat.total)}</span>
                          <span className="text-slate-500 font-semibold text-[11px] ml-1.5">
                            ({cat.percentage}%)
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-500`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Peringkat Tunggakan Kas Kelas */}
          <div id="section-tunggakan" className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Status Tunggakan Kas Kelas
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Prioritas follow-up bendahara kelas SMKN 7 Samarinda
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {tunggakanRanking.map((item, idx) => {
                const hasTunggakan = item.jumlahTunggakanMinggu > 0;
                return (
                  <div
                    key={item.kelas.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                      hasTunggakan
                        ? 'border-slate-200/80 bg-white hover:bg-slate-50'
                        : 'border-emerald-200/60 bg-emerald-50/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          idx < 3 && hasTunggakan
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{item.kelas.nama}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {item.kelas.jumlahSiswa} siswa · Tingkat {item.kelas.tingkat}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      {hasTunggakan ? (
                        <>
                          <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-rose-200/80">
                            {item.jumlahTunggakanMinggu} Minggu Belum Bayar
                          </span>
                          <div className="font-mono-num font-extrabold text-sm text-rose-600">
                            {formatRupiah(item.nominalTunggakan)}
                          </div>
                        </>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200/80 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>LUNAS SEMUA</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Live Activity & Audit Log */}
        <div className="space-y-6">
          {/* Live Activity Card (Matching Reference Widget) */}
          <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Live Activity
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <button
                onClick={() => setActiveTab('BUKU_KAS')}
                className="text-xs font-bold text-[#0D62C9] hover:underline flex items-center gap-0.5"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {transaksiTerbaru.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium text-xs">
                Belum ada transaksi terkini.
              </div>
            ) : (
              <div className="space-y-3">
                {transaksiTerbaru.map((t) => {
                  const isPemasukan = t.jenis === 'pemasukan';
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isPemasukan ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isPemasukan ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {t.keterangan}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10.5px] text-slate-400 font-medium">
                            {formatTanggalIndonesia(t.tanggal)}
                          </span>
                          <span
                            className={`font-mono-num font-extrabold text-xs ${
                              isPemasukan ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPemasukan ? '+' : '-'} {formatRupiah(t.nominal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Audit Log Card */}
          <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0D62C9] flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Audit Log
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Riwayat perubahan data
                  </p>
                </div>
              </div>
            </div>

            {riwayatList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl text-xs">
                Belum ada riwayat aktivitas.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {riwayatList.slice(0, 10).map((log) => {
                  const waktuFormatted = log.waktu
                    ? new Date(log.waktu).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })
                    : '-';

                  let badgeStyle = 'bg-slate-100 text-slate-700';
                  if (log.aksi === 'tambah') badgeStyle = 'bg-emerald-50 text-emerald-700';
                  else if (log.aksi === 'ubah') badgeStyle = 'bg-amber-50 text-amber-700';
                  else if (log.aksi === 'hapus') badgeStyle = 'bg-rose-50 text-rose-700';
                  else if (log.aksi === 'seed') badgeStyle = 'bg-blue-50 text-blue-700';

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded ${badgeStyle}`}>
                          {log.aksi}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-num">
                          {waktuFormatted}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 text-xs">
                        {log.ringkasan}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
