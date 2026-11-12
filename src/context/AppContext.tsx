import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  handleFirestoreError,
  OperationType
} from '../firebase';
import {
  Kelas,
  Pengaturan,
  RiwayatLog,
  Setoran,
  TahunAjaran,
  Transaksi,
  WeekInfo,
  TabType
} from '../types';
import {
  DEFAULT_PENGATURAN,
  DEFAULT_TAHUN_AJARAN,
  DEFAULT_KELAS,
  SEED_TRANSAKSI_EXCEL,
  DEFAULT_SETORAN
} from '../data/seedData';
import {
  formatRupiah,
  formatToYYYYMMDD,
  generateMingguTahunAjaran,
  getSeninMingguIni,
  formatKeteranganRentangMinggu
} from '../utils/dateAndMoney';
import { hashSHA256 } from '../utils/crypto';

interface AppContextType {
  // Auth state
  currentUser: User | null;
  isAdmin: boolean;
  isViewerAuthenticated: boolean;
  isAuthLoading: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedTahunAjaranId: string;
  setSelectedTahunAjaranId: (id: string) => void;

  // Data state
  pengaturan: Pengaturan;
  tahunAjaranList: TahunAjaran[];
  kelasList: Kelas[];
  setoranList: Setoran[];
  transaksiList: Transaksi[];
  riwayatList: RiwayatLog[];
  allWeeks: WeekInfo[];
  currentMonday: string;
  isDataLoading: boolean;

  // Derived financial state
  saldoSekarang: number;
  totalPemasukan: number;
  totalPengeluaran: number;

  // Auth methods & state
  showAdminLoginModal: boolean;
  setShowAdminLoginModal: (show: boolean) => void;
  loginAdminWithCredentials: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginGoogleAdmin: () => Promise<void>;
  loginViewerWithCode: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Data actions (Admin only)
  tambahSetoran: (
    kelasId: string,
    daftarMinggu: string[],
    tanggalSetor: string,
    alasan: string
  ) => Promise<void>;
  ubahSetoran: (
    setoranId: string,
    daftarMingguBaru: string[],
    tanggalSetorBaru: string,
    alasan: string
  ) => Promise<void>;
  hapusSetoran: (setoranId: string, alasan: string) => Promise<void>;

  tambahTransaksi: (
    data: Omit<Transaksi, 'id' | 'dibuatPada'>,
    alasan: string
  ) => Promise<void>;
  ubahTransaksi: (
    transaksiId: string,
    data: Partial<Omit<Transaksi, 'id' | 'dibuatPada'>>,
    alasan: string
  ) => Promise<void>;
  hapusTransaksi: (transaksiId: string, alasan: string) => Promise<void>;

  ubahJumlahSiswaKelas: (
    kelasId: string,
    jumlahSiswaBaru: number,
    alasan: string
  ) => Promise<void>;
  ubahNamaKelas: (
    kelasId: string,
    namaBaru: string,
    alasan: string
  ) => Promise<void>;

  simpanPengaturan: (
    data: Partial<Pengaturan>,
    alasan: string
  ) => Promise<void>;
  ubahPasscodeViewer: (
    passcodeBaru: string,
    alasan: string
  ) => Promise<void>;
  buatTahunAjaranBaru: (
    label: string,
    tanggalMulai: string,
    tanggalAkhir: string,
    bawaModalAwal: boolean,
    alasan: string
  ) => Promise<void>;

  muatDataAwalExcel: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_ADMIN_KEY = 'kas_osis_admin_auth';
const STORAGE_VIEWER_KEY = 'kas_osis_viewer_auth';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem(STORAGE_ADMIN_KEY) === 'true';
  });
  const [isViewerAuthenticated, setIsViewerAuthenticated] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      (localStorage.getItem(STORAGE_VIEWER_KEY) === 'true' ||
        localStorage.getItem(STORAGE_ADMIN_KEY) === 'true')
    );
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('RINGKASAN');

  // Firestore entities state
  const [pengaturan, setPengaturan] = useState<Pengaturan>(DEFAULT_PENGATURAN);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([DEFAULT_TAHUN_AJARAN]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>('2026_2027');
  const [kelasList, setKelasList] = useState<Kelas[]>(DEFAULT_KELAS);
  const [setoranList, setSetoranList] = useState<Setoran[]>(DEFAULT_SETORAN);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(SEED_TRANSAKSI_EXCEL);
  const [riwayatList, setRiwayatList] = useState<RiwayatLog[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  // Current date & monday calculation
  const currentMonday = useMemo(() => getSeninMingguIni(), []);

  // Selected academic year
  const selectedTahunAjaran = useMemo(() => {
    return (
      tahunAjaranList.find((t) => t.id === selectedTahunAjaranId) ||
      DEFAULT_TAHUN_AJARAN
    );
  }, [tahunAjaranList, selectedTahunAjaranId]);

  // All weeks in selected academic year
  const allWeeks = useMemo(() => {
    return generateMingguTahunAjaran(
      selectedTahunAjaran.tanggalMulai,
      selectedTahunAjaran.tanggalAkhir
    );
  }, [selectedTahunAjaran]);

  // Financial summary: Calculated across ALL transactions in the selected academic year
  const { totalPemasukan, totalPengeluaran, saldoSekarang } = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    transaksiList.forEach((t) => {
      if (t.tahunAjaranId === selectedTahunAjaranId) {
        if (t.jenis === 'pemasukan') masuk += Number(t.nominal);
        else if (t.jenis === 'pengeluaran') keluar += Number(t.nominal);
      }
    });
    return {
      totalPemasukan: masuk,
      totalPengeluaran: keluar,
      saldoSekarang: masuk - keluar
    };
  }, [transaksiList, selectedTahunAjaranId]);

  // Listen to Auth State (optional Firebase session sync)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore Realtime Data (Always active immediately)
  useEffect(() => {
    setIsDataLoading(true);

    // 1. Pengaturan listener
    const unsubPengaturan = onSnapshot(
      doc(db, 'pengaturan', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Pengaturan;
          setPengaturan(data);
          if (data.tahunAjaranAktifId) {
            setSelectedTahunAjaranId((prev) => prev || data.tahunAjaranAktifId);
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'pengaturan/main');
      }
    );

    // 2. Tahun Ajaran listener
    const unsubTahun = onSnapshot(
      collection(db, 'tahun_ajaran'),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TahunAjaran));
        if (items.length > 0) {
          setTahunAjaranList(items);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'tahun_ajaran');
      }
    );

    // 3. Kelas listener
    const unsubKelas = onSnapshot(
      collection(db, 'kelas'),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Kelas));
        const existingIds = new Set(items.map((k) => k.id));
        const merged = [
          ...items,
          ...DEFAULT_KELAS.filter((k) => !existingIds.has(k.id))
        ];
        merged.sort((a, b) => a.urutan - b.urutan);
        setKelasList(merged);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'kelas');
      }
    );

    // 4. Setoran listener
    const unsubSetoran = onSnapshot(
      collection(db, 'setoran'),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Setoran));
        const existingIds = new Set(items.map((s) => s.id));
        const merged = [
          ...items,
          ...DEFAULT_SETORAN.filter((s) => !existingIds.has(s.id))
        ];
        merged.sort((a, b) => b.tanggalSetor.localeCompare(a.tanggalSetor));
        setSetoranList(merged);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'setoran');
      }
    );

    // 5. Transaksi listener
    const unsubTransaksi = onSnapshot(
      collection(db, 'transaksi'),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaksi));
        const existingIds = new Set(items.map((t) => t.id));
        const merged = [
          ...items,
          ...SEED_TRANSAKSI_EXCEL.filter((t) => !existingIds.has(t.id))
        ];
        // Sort: oldest to newest for chronological balance calculation
        merged.sort((a, b) => {
          const dateDiff = a.tanggal.localeCompare(b.tanggal);
          if (dateDiff !== 0) return dateDiff;
          return a.dibuatPada.localeCompare(b.dibuatPada);
        });
        setTransaksiList(merged);
        setIsDataLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'transaksi');
        setIsDataLoading(false);
      }
    );

    // 6. Riwayat listener
    const unsubRiwayat = onSnapshot(
      collection(db, 'riwayat'),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RiwayatLog));
        items.sort((a, b) => b.waktu.localeCompare(a.waktu));
        setRiwayatList(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'riwayat');
      }
    );

    return () => {
      unsubPengaturan();
      unsubTahun();
      unsubKelas();
      unsubSetoran();
      unsubTransaksi();
      unsubRiwayat();
    };
  }, []);

  // Otomatis sinkronkan seluruh data awal Excel ke Firestore saat pertama kali jika kosong
  useEffect(() => {
    const autoSyncToFirestore = async () => {
      try {
        const testTx = await getDoc(doc(db, 'transaksi', 'tx_1'));
        if (!testTx.exists()) {
          const batch = writeBatch(db);

          // 1. Pengaturan
          batch.set(
            doc(db, 'pengaturan', 'main'),
            {
              ...DEFAULT_PENGATURAN,
              seedLoaded: true,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );

          // 2. Tahun Ajaran
          batch.set(
            doc(db, 'tahun_ajaran', DEFAULT_TAHUN_AJARAN.id),
            DEFAULT_TAHUN_AJARAN,
            { merge: true }
          );

          // 3. 16 Kelas
          DEFAULT_KELAS.forEach((k) => {
            batch.set(
              doc(db, 'kelas', k.id),
              {
                ...k,
                riwayatSiswa: [],
                updatedAt: new Date().toISOString()
              },
              { merge: true }
            );
          });

          // 4. 31 Transaksi Excel
          SEED_TRANSAKSI_EXCEL.forEach((t) => {
            batch.set(doc(db, 'transaksi', t.id), t, { merge: true });
          });

          // 5. 16 Setoran Kas Mingguan Agustus-September
          DEFAULT_SETORAN.forEach((s) => {
            batch.set(doc(db, 'setoran', s.id), s, { merge: true });
          });

          await batch.commit();
          console.log('Seluruh data awal Excel berhasil tersimpan permanen di Firestore!');
        }
      } catch (err) {
        console.warn('Auto-sync Firestore note:', err);
      }
    };

    autoSyncToFirestore();
  }, []);

  // Auth Methods: Admin Credential Login (alkiyano / 12345)
  const loginAdminWithCredentials = async (
    userInput: string,
    passInput: string
  ): Promise<{ success: boolean; message?: string }> => {
    const targetUser = (pengaturan.adminUsername || DEFAULT_PENGATURAN.adminUsername || 'alkiyano').trim().toLowerCase();
    const targetPass = (pengaturan.adminPassword || DEFAULT_PENGATURAN.adminPassword || '12345').trim();

    if (userInput.trim().toLowerCase() === targetUser && passInput.trim() === targetPass) {
      setIsAdmin(true);
      setIsViewerAuthenticated(true);
      localStorage.setItem(STORAGE_ADMIN_KEY, 'true');
      localStorage.setItem(STORAGE_VIEWER_KEY, 'true');
      setShowAdminLoginModal(false);
      setActiveTab('ADMIN');
      return { success: true };
    }
    return {
      success: false,
      message: 'Username atau password admin salah! Periksa kembali.'
    };
  };

  const loginGoogleAdmin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email?.toLowerCase() === 'alkiyano123@gmail.com') {
        setIsAdmin(true);
        setIsViewerAuthenticated(true);
        localStorage.setItem(STORAGE_ADMIN_KEY, 'true');
        localStorage.setItem(STORAGE_VIEWER_KEY, 'true');
        setActiveTab('ADMIN');
      } else {
        alert(
          `Login berhasil sebagai ${result.user.email}. Masuk sebagai Viewer.`
        );
        setIsViewerAuthenticated(true);
        localStorage.setItem(STORAGE_VIEWER_KEY, 'true');
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      alert('Gagal login Google. Gunakan login username dan password admin.');
    }
  };

  const loginViewerWithCode = async (code: string): Promise<boolean> => {
    try {
      const cleanCode = code.trim();
      if (!cleanCode) return false;

      // Direct check if default password
      if (cleanCode.toLowerCase() === 'bendaharakelas') {
        setIsViewerAuthenticated(true);
        localStorage.setItem(STORAGE_VIEWER_KEY, 'true');
        return true;
      }

      // Hash comparison
      const inputHash = await hashSHA256(cleanCode);
      const validHash = pengaturan.viewerPasscodeHash || DEFAULT_PENGATURAN.viewerPasscodeHash;

      if (inputHash === validHash) {
        setIsViewerAuthenticated(true);
        localStorage.setItem(STORAGE_VIEWER_KEY, 'true');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Passcode verification error:', e);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    localStorage.removeItem(STORAGE_ADMIN_KEY);
    localStorage.removeItem(STORAGE_VIEWER_KEY);
    setIsAdmin(false);
    setIsViewerAuthenticated(false);
    setShowAdminLoginModal(false);
    setActiveTab('KAS_MINGGUAN');
  };

  // Helper to append to Audit Log
  const catatRiwayat = async (
    aksi: RiwayatLog['aksi'],
    jenisData: RiwayatLog['jenisData'],
    ringkasan: string,
    alasan: string,
    nilaiLama?: string,
    nilaiBaru?: string
  ) => {
    try {
      const riwayatDoc = doc(collection(db, 'riwayat'));
      const logData: Omit<RiwayatLog, 'id'> = {
        waktu: new Date().toISOString(),
        aksi,
        jenisData,
        ringkasan,
        alasan: alasan || 'Tidak ada alasan khusus',
        nilaiLama: nilaiLama || '',
        nilaiBaru: nilaiBaru || '',
        userEmail: currentUser?.email || 'Admin'
      };
      await setDoc(riwayatDoc, logData);
    } catch (err) {
      console.error('Gagal mencatat audit log:', err);
    }
  };

  // 1. TAMBAH SETORAN (Snapshot Siswa & Tarif + Auto Pemasukan Buku Kas)
  const tambahSetoran = async (
    kelasId: string,
    daftarMinggu: string[],
    tanggalSetor: string,
    alasan: string
  ) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin yang dapat mencatat setoran.');
    if (!daftarMinggu || daftarMinggu.length === 0) {
      throw new Error('Pilih minimal satu minggu untuk disetor.');
    }

    const kelas = kelasList.find((k) => k.id === kelasId);
    if (!kelas) throw new Error('Kelas tidak ditemukan.');

    // Verifikasi tidak ada minggu yang sudah lunas pada kelas ini
    const existingPaid = new Set<string>();
    setoranList
      .filter((s) => s.kelasId === kelasId && s.tahunAjaranId === selectedTahunAjaranId)
      .forEach((s) => s.daftarMinggu.forEach((m) => existingPaid.add(m)));

    for (const m of daftarMinggu) {
      if (existingPaid.has(m)) {
        throw new Error(`Minggu ${m} sudah pernah disetor untuk ${kelas.nama}. Tidak boleh disetor dua kali.`);
      }
    }

    // Hitung snapshot
    const jumlahSiswaSnapshot = Number(kelas.jumlahSiswa);
    const tarifSnapshot = Number(pengaturan.tarifPerSiswa);
    const jumlahMinggu = daftarMinggu.length;
    const total = jumlahMinggu * jumlahSiswaSnapshot * tarifSnapshot;

    const setoranDoc = doc(collection(db, 'setoran'));
    const transaksiDoc = doc(collection(db, 'transaksi'));

    const setoranData: Omit<Setoran, 'id'> = {
      kelasId,
      kelasNama: kelas.nama,
      daftarMinggu: [...daftarMinggu].sort(),
      jumlahMinggu,
      jumlahSiswaSnapshot,
      tarifSnapshot,
      total,
      tanggalSetor: tanggalSetor || formatToYYYYMMDD(new Date()),
      tahunAjaranId: selectedTahunAjaranId,
      transaksiId: transaksiDoc.id,
      dibuatPada: new Date().toISOString()
    };

    const rentangText = formatKeteranganRentangMinggu(daftarMinggu);
    const transaksiData: Omit<Transaksi, 'id'> = {
      jenis: 'pemasukan',
      tanggal: tanggalSetor || formatToYYYYMMDD(new Date()),
      keterangan: `Kas mingguan - ${kelas.nama} (${rentangText})`,
      nominal: total,
      kategori: 'Kas Mingguan',
      setoranId: setoranDoc.id,
      tahunAjaranId: selectedTahunAjaranId,
      dibuatPada: new Date().toISOString()
    };

    const batch = writeBatch(db);

    // Pastikan seluruh data awal Excel tersimpan di Firestore jika belum ada
    try {
      const checkTx = await getDoc(doc(db, 'transaksi', 'tx_1'));
      if (!checkTx.exists()) {
        DEFAULT_KELAS.forEach((k) => batch.set(doc(db, 'kelas', k.id), k, { merge: true }));
        SEED_TRANSAKSI_EXCEL.forEach((t) => batch.set(doc(db, 'transaksi', t.id), t, { merge: true }));
        DEFAULT_SETORAN.forEach((s) => batch.set(doc(db, 'setoran', s.id), s, { merge: true }));
        batch.set(doc(db, 'pengaturan', 'main'), { ...DEFAULT_PENGATURAN, seedLoaded: true }, { merge: true });
        batch.set(doc(db, 'tahun_ajaran', DEFAULT_TAHUN_AJARAN.id), DEFAULT_TAHUN_AJARAN, { merge: true });
      }
    } catch (e) {
      console.warn('Checking seed in tambahSetoran:', e);
    }

    batch.set(setoranDoc, setoranData);
    batch.set(transaksiDoc, transaksiData);
    await batch.commit();

    await catatRiwayat(
      'tambah',
      'setoran',
      `Setoran kas ${kelas.nama} (${jumlahMinggu} minggu: ${rentangText}) senilai ${formatRupiah(total)}`,
      alasan || 'Pencatatan setoran kas mingguan kelas',
      '',
      JSON.stringify({ total, daftarMinggu, tanggalSetor })
    );
  };

  // 2. UBAH SETORAN (Wajib Alasan)
  const ubahSetoran = async (
    setoranId: string,
    daftarMingguBaru: string[],
    tanggalSetorBaru: string,
    alasan: string
  ) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin yang dapat mengubah setoran.');
    if (!alasan || alasan.trim() === '') {
      throw new Error('Alasan perubahan setoran wajib diisi.');
    }
    if (!daftarMingguBaru || daftarMingguBaru.length === 0) {
      throw new Error('Setoran harus memiliki minimal 1 minggu.');
    }

    const setoranLama = setoranList.find((s) => s.id === setoranId);
    if (!setoranLama) throw new Error('Setoran tidak ditemukan.');

    // Hitung total baru dengan mempertahankan snapshot asli
    const jumlahMingguBaru = daftarMingguBaru.length;
    const totalBaru = jumlahMingguBaru * setoranLama.jumlahSiswaSnapshot * setoranLama.tarifSnapshot;
    const rentangBaruText = formatKeteranganRentangMinggu(daftarMingguBaru);

    const batch = writeBatch(db);
    const setoranRef = doc(db, 'setoran', setoranId);
    batch.update(setoranRef, {
      daftarMinggu: [...daftarMingguBaru].sort(),
      jumlahMinggu: jumlahMingguBaru,
      total: totalBaru,
      tanggalSetor: tanggalSetorBaru
    });

    if (setoranLama.transaksiId) {
      const transRef = doc(db, 'transaksi', setoranLama.transaksiId);
      batch.update(transRef, {
        nominal: totalBaru,
        tanggal: tanggalSetorBaru,
        keterangan: `Kas mingguan - ${setoranLama.kelasNama} (${rentangBaruText})`
      });
    }

    await batch.commit();

    await catatRiwayat(
      'ubah',
      'setoran',
      `Mengubah setoran ${setoranLama.kelasNama} menjadi ${jumlahMingguBaru} minggu (${formatRupiah(totalBaru)})`,
      alasan,
      JSON.stringify({ total: setoranLama.total, minggu: setoranLama.daftarMinggu, tanggal: setoranLama.tanggalSetor }),
      JSON.stringify({ total: totalBaru, minggu: daftarMingguBaru, tanggal: tanggalSetorBaru })
    );
  };

  // 3. HAPUS SETORAN (Wajib Alasan + Hapus Baris Transaksi Terkait)
  const hapusSetoran = async (setoranId: string, alasan: string) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin yang dapat menghapus setoran.');
    if (!alasan || alasan.trim() === '') {
      throw new Error('Alasan penghapusan setoran wajib diisi.');
    }

    const setoranLama = setoranList.find((s) => s.id === setoranId);
    if (!setoranLama) throw new Error('Setoran tidak ditemukan.');

    const batch = writeBatch(db);
    batch.delete(doc(db, 'setoran', setoranId));

    if (setoranLama.transaksiId) {
      batch.delete(doc(db, 'transaksi', setoranLama.transaksiId));
    }

    await batch.commit();

    await catatRiwayat(
      'hapus',
      'setoran',
      `Menghapus setoran ${setoranLama.kelasNama} senilai ${formatRupiah(setoranLama.total)} (${setoranLama.jumlahMinggu} minggu)`,
      alasan,
      JSON.stringify(setoranLama),
      ''
    );
  };

  // 4. TRANSAKSI LAIN (Pemasukan selain kas kelas & Pengeluaran)
  const tambahTransaksi = async (
    data: Omit<Transaksi, 'id' | 'dibuatPada'>,
    alasan: string
  ) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin.');
    const transDoc = doc(collection(db, 'transaksi'));
    const fullData: Omit<Transaksi, 'id'> = {
      ...data,
      dibuatPada: new Date().toISOString()
    };

    const batch = writeBatch(db);
    try {
      const checkTx = await getDoc(doc(db, 'transaksi', 'tx_1'));
      if (!checkTx.exists()) {
        DEFAULT_KELAS.forEach((k) => batch.set(doc(db, 'kelas', k.id), k, { merge: true }));
        SEED_TRANSAKSI_EXCEL.forEach((t) => batch.set(doc(db, 'transaksi', t.id), t, { merge: true }));
        DEFAULT_SETORAN.forEach((s) => batch.set(doc(db, 'setoran', s.id), s, { merge: true }));
        batch.set(doc(db, 'pengaturan', 'main'), { ...DEFAULT_PENGATURAN, seedLoaded: true }, { merge: true });
        batch.set(doc(db, 'tahun_ajaran', DEFAULT_TAHUN_AJARAN.id), DEFAULT_TAHUN_AJARAN, { merge: true });
      }
    } catch (e) {
      console.warn('Checking seed in tambahTransaksi:', e);
    }
    batch.set(transDoc, fullData);
    await batch.commit();

    await catatRiwayat(
      'tambah',
      'transaksi',
      `Tambah transaksi ${data.jenis.toUpperCase()}: ${data.keterangan} (${formatRupiah(data.nominal)}) [Kategori: ${data.kategori}]`,
      alasan || 'Pencatatan transaksi kas',
      '',
      JSON.stringify(data)
    );
  };

  const ubahTransaksi = async (
    transaksiId: string,
    data: Partial<Omit<Transaksi, 'id' | 'dibuatPada'>>,
    alasan: string
  ) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin.');
    if (!alasan || alasan.trim() === '') throw new Error('Alasan perubahan wajib diisi.');

    const transLama = transaksiList.find((t) => t.id === transaksiId);
    if (!transLama) throw new Error('Transaksi tidak ditemukan.');

    await updateDoc(doc(db, 'transaksi', transaksiId), data);

    await catatRiwayat(
      'ubah',
      'transaksi',
      `Ubah transaksi ${transLama.keterangan}`,
      alasan,
      JSON.stringify(transLama),
      JSON.stringify(data)
    );
  };

  const hapusTransaksi = async (transaksiId: string, alasan: string) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin.');
    if (!alasan || alasan.trim() === '') throw new Error('Alasan penghapusan wajib diisi.');

    const transLama = transaksiList.find((t) => t.id === transaksiId);
    if (!transLama) throw new Error('Transaksi tidak ditemukan.');

    // Jika terkait setoran kas, beri tahu
    if (transLama.setoranId) {
      throw new Error(
        'Transaksi ini terhubung ke setoran kas mingguan. Silakan hapus melalui tab Daftar Setoran agar status kas kelas tetap sinkron.'
      );
    }

    await deleteDoc(doc(db, 'transaksi', transaksiId));

    await catatRiwayat(
      'hapus',
      'transaksi',
      `Hapus transaksi ${transLama.keterangan} (${formatRupiah(transLama.nominal)})`,
      alasan,
      JSON.stringify(transLama),
      ''
    );
  };

  // 5. KELOLA KELAS (Ubah Siswa & Nama)
  const ubahJumlahSiswaKelas = async (
    kelasId: string,
    jumlahSiswaBaru: number,
    alasan: string
  ) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin.');
    if (!alasan || alasan.trim() === '') throw new Error('Alasan perubahan jumlah siswa wajib diisi.');
    if (jumlahSiswaBaru < 1 || jumlahSiswaBaru > 60) {
      throw new Error('Jumlah siswa harus antara 1 sampai 60.');
    }

    const kelas = kelasList.find((k) => k.id === kelasId);
    if (!kelas) throw new Error('Kelas tidak ditemukan.');

    const jumlahSebelumnya = kelas.jumlahSiswa;
    const riwayatItem = {
      tanggal: formatToYYYYMMDD(new Date()),
      jumlahSebelumnya,
      jumlahBaru: jumlahSiswaBaru,
      alasan
    };

    const riwayatBaru = [...(kelas.riwayatSiswa || []), riwayatItem];

    await updateDoc(doc(db, 'kelas', kelasId), {
      jumlahSiswa: jumlahSiswaBaru,
      riwayatSiswa: riwayatBaru,
      updatedAt: new Date().toISOString()
    });

    await catatRiwayat(
      'ubah',
      'kelas',
      `Ubah jumlah siswa ${kelas.nama} dari ${jumlahSebelumnya} menjadi ${jumlahSiswaBaru} siswa`,
      alasan,
      `${jumlahSebelumnya} siswa`,
      `${jumlahSiswaBaru} siswa`
    );
  };

  const ubahNamaKelas = async (
    kelasId: string,
    namaBaru: string,
    alasan: string
  ) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin.');
    if (!namaBaru || namaBaru.trim() === '') throw new Error('Nama kelas tidak boleh kosong.');
    const kelas = kelasList.find((k) => k.id === kelasId);
    if (!kelas) throw new Error('Kelas tidak ditemukan.');

    const namaLama = kelas.nama;
    await updateDoc(doc(db, 'kelas', kelasId), {
      nama: namaBaru.trim(),
      updatedAt: new Date().toISOString()
    });

    await catatRiwayat(
      'ubah',
      'kelas',
      `Ubah nama kelas dari "${namaLama}" menjadi "${namaBaru}"`,
      alasan || 'Pembaruan nama kelas',
      namaLama,
      namaBaru
    );
  };

  // 6. PENGATURAN
  const simpanPengaturan = async (data: Partial<Pengaturan>, alasan: string) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin.');
    await updateDoc(doc(db, 'pengaturan', 'main'), {
      ...data,
      updatedAt: new Date().toISOString()
    });

    await catatRiwayat(
      'ubah',
      'pengaturan',
      'Memperbarui konfigurasi sistem KAS OSIS',
      alasan || 'Update pengaturan sistem',
      JSON.stringify(pengaturan),
      JSON.stringify(data)
    );
  };

  const ubahPasscodeViewer = async (passcodeBaru: string, alasan: string) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin.');
    if (!passcodeBaru || passcodeBaru.trim().length < 4) {
      throw new Error('Kode akses viewer minimal 4 karakter.');
    }
    const hash = await hashSHA256(passcodeBaru.trim());
    await simpanPengaturan({ viewerPasscodeHash: hash }, alasan || 'Mengganti kode akses viewer');
  };

  // 7. BUAT TAHUN AJARAN BARU
  const buatTahunAjaranBaru = async (
    label: string,
    tanggalMulai: string,
    tanggalAkhir: string,
    bawaModalAwal: boolean,
    alasan: string
  ) => {
    if (!isAdmin) throw new Error('Akses ditolak: Hanya Admin.');
    const newId = label.replace(/[^a-zA-Z0-9]/g, '_');

    // 1. Tambah tahun ajaran baru
    const tahunDoc = doc(db, 'tahun_ajaran', newId);
    await setDoc(tahunDoc, {
      label,
      tanggalMulai,
      tanggalAkhir,
      isAktif: true,
      createdAt: new Date().toISOString()
    });

    // 2. Jika membawa modal awal dari saldo akhir tahun sebelumnya
    if (bawaModalAwal && saldoSekarang > 0) {
      const transDoc = doc(collection(db, 'transaksi'));
      await setDoc(transDoc, {
        jenis: 'pemasukan',
        tanggal: tanggalMulai,
        keterangan: `Modal awal tahun ajaran ${label} (saldo sisa tahun sebelumnya)`,
        nominal: saldoSekarang,
        kategori: 'Modal',
        tahunAjaranId: newId,
        dibuatPada: new Date().toISOString()
      });
    }

    // 3. Jadikan tahun aktif
    await updateDoc(doc(db, 'pengaturan', 'main'), {
      tahunAjaranAktifId: newId,
      tanggalMulaiTahunAjaran: tanggalMulai,
      tanggalAkhirTahunAjaran: tanggalAkhir,
      updatedAt: new Date().toISOString()
    });

    setSelectedTahunAjaranId(newId);

    await catatRiwayat(
      'tambah',
      'tahun_ajaran',
      `Membuat tahun ajaran baru ${label} (${tanggalMulai} s/d ${tanggalAkhir})${
        bawaModalAwal ? ` dengan saldo awal ${formatRupiah(saldoSekarang)}` : ''
      }`,
      alasan || 'Pembukaan tahun ajaran baru'
    );
  };

  // 8. MUAT DATA AWAL EXCEL (Sekali Pakai dengan Verifikasi Saldo Rp2.545.000)
  const muatDataAwalExcel = async () => {
    if (!isAdmin) throw new Error('Hanya Admin yang dapat memuat data awal.');
    if (pengaturan.seedLoaded) {
      throw new Error('Data awal Excel sudah pernah dimuat sebelumnya.');
    }

    const batch = writeBatch(db);

    // 1. Simpan pengaturan utama
    const pengRef = doc(db, 'pengaturan', 'main');
    batch.set(pengRef, {
      ...DEFAULT_PENGATURAN,
      seedLoaded: true,
      updatedAt: new Date().toISOString()
    });

    // 2. Simpan tahun ajaran default
    const tahunRef = doc(db, 'tahun_ajaran', DEFAULT_TAHUN_AJARAN.id);
    batch.set(tahunRef, DEFAULT_TAHUN_AJARAN);

    // 3. Simpan 16 kelas (8 kelas X dan 8 kelas XI, total 543 siswa)
    DEFAULT_KELAS.forEach((k) => {
      const kelasDoc = doc(db, 'kelas', k.id);
      batch.set(kelasDoc, {
        ...k,
        riwayatSiswa: [],
        updatedAt: new Date().toISOString()
      });
    });

    // 4. Simpan 31 transaksi awal dari Excel
    let runningSaldo = 0;
    SEED_TRANSAKSI_EXCEL.forEach((t) => {
      const tDoc = doc(db, 'transaksi', t.id);
      batch.set(tDoc, t);
      if (t.jenis === 'pemasukan') runningSaldo += t.nominal;
      else runningSaldo -= t.nominal;
    });

    if (runningSaldo !== 2545000) {
      throw new Error(
        `Verifikasi saldo gagal: Perhitungan menghasilkan ${formatRupiah(runningSaldo)}, seharusnya Rp2.545.000.`
      );
    }

    // 5. Simpan catatan setoran historis Agustus & September 2026 (sesuai foto Excel rincian per kelas)
    DEFAULT_SETORAN.forEach((s) => {
      const sDoc = doc(db, 'setoran', s.id);
      batch.set(sDoc, s);
    });

    // 6. Simpan audit log awal
    const logDoc = doc(collection(db, 'riwayat'));
    batch.set(logDoc, {
      waktu: new Date().toISOString(),
      aksi: 'seed',
      jenisData: 'transaksi',
      ringkasan: `Memuat data awal dari Excel: 16 kelas (543 siswa), 31 transaksi buku kas (saldo terverifikasi Rp2.545.000), dan rekap setoran kas mingguan Agustus-September 2026.`,
      alasan: 'Inisialisasi sistem dari data pembukuan Excel',
      userEmail: currentUser?.email || 'Admin',
      nilaiBaru: `Saldo: ${formatRupiah(runningSaldo)}`
    });

    await batch.commit();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAdmin,
        isViewerAuthenticated,
        isAuthLoading,
        activeTab,
        setActiveTab,
        selectedTahunAjaranId,
        setSelectedTahunAjaranId,
        pengaturan,
        tahunAjaranList,
        kelasList,
        setoranList,
        transaksiList,
        riwayatList,
        allWeeks,
        currentMonday,
        isDataLoading,
        saldoSekarang,
        totalPemasukan,
        totalPengeluaran,
        showAdminLoginModal,
        setShowAdminLoginModal,
        loginAdminWithCredentials,
        loginGoogleAdmin,
        loginViewerWithCode,
        logout,
        tambahSetoran,
        ubahSetoran,
        hapusSetoran,
        tambahTransaksi,
        ubahTransaksi,
        hapusTransaksi,
        ubahJumlahSiswaKelas,
        ubahNamaKelas,
        simpanPengaturan,
        ubahPasscodeViewer,
        buatTahunAjaranBaru,
        muatDataAwalExcel
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
