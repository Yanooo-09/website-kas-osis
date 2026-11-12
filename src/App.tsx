/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { TabKasMingguan } from './components/TabKasMingguan';
import { TabBukuKas } from './components/TabBukuKas';
import { TabRingkasan } from './components/TabRingkasan';
import { TabAdmin } from './components/TabAdmin';
import { ViewerAuthModal } from './components/ViewerAuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    isAuthLoading,
    isViewerAuthenticated,
    isAdmin,
    activeTab,
    pengaturan,
    muatDataAwalExcel,
    kelasList
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 text-center space-y-4 max-w-sm w-full">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white border border-slate-200 shadow-md flex items-center justify-center p-1">
            <img
              src="/assets/aistudio/logo_osis_resized_2f1d7ea6.png"
              alt="Logo OSIS"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">KAS OSIS</h2>
            <p className="text-xs text-[#6C2BD9] font-bold uppercase tracking-wider">SMKN 7 SAMARINDA</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 pt-1">
            <Loader2 className="w-4 h-4 animate-spin text-[#6C2BD9]" />
            <span>Memuat sistem kas...</span>
          </div>
        </div>
      </div>
    );
  }

  // If viewer is not authenticated and not admin, prompt for passcode or admin login
  if (!isViewerAuthenticated && !isAdmin) {
    return <ViewerAuthModal />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      {/* Left Sidebar (Portal-7 Navigation) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-8 sm:pb-12">
          {/* Helpful seed banner if database is ever completely fresh */}
          {isAdmin && kelasList.length === 0 && !pengaturan.seedLoaded && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm text-amber-900">
                  Database Masih Kosong
                </div>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  Klik tombol di samping untuk memuat otomatis 16 kelas (543 siswa) dan 31 transaksi awal dari Excel.
                </p>
              </div>
              <button
                onClick={() => muatDataAwalExcel()}
                className="portal-btn bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase shrink-0"
              >
                Muat Data Awal dari Excel
              </button>
            </div>
          )}

          {/* Tab 1: DASBOR (Ringkasan Kas) */}
          {activeTab === 'RINGKASAN' && <TabRingkasan />}

          {/* Tab 2: KAS MINGGUAN KELAS */}
          {activeTab === 'KAS_MINGGUAN' && <TabKasMingguan />}

          {/* Tab 3: BUKU KAS UMUM */}
          {activeTab === 'BUKU_KAS' && <TabBukuKas />}

          {/* Tab 4: PANEL ADMIN */}
          {activeTab === 'ADMIN' && (isAdmin ? <TabAdmin /> : <TabRingkasan />)}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-3.5 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <div>
            Hak Cipta © 2026 <span className="font-semibold text-slate-700">KAS OSIS</span> · SMK Negeri 7 Samarinda
          </div>
          <div className="text-[11px] text-slate-400">
            Bendahara OSIS: <span className="font-semibold text-slate-600">{pengaturan.namaBendahara || 'Alkiyano Parintak'}</span>
          </div>
        </footer>
      </div>

      <AdminLoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
