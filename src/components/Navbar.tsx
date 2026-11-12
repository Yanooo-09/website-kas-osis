import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  ChevronDown,
  Calendar,
  Wallet,
  ShieldCheck,
  LogIn,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const {
    activeTab,
    tahunAjaranList,
    selectedTahunAjaranId,
    setSelectedTahunAjaranId,
    isAdmin,
    setShowAdminLoginModal,
    logout,
    saldoSekarang,
    pengaturan
  } = useApp();

  const [showTahunDropdown, setShowTahunDropdown] = useState(false);

  // Clean Tab Title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'RINGKASAN':
        return 'Dasbor';
      case 'KAS_MINGGUAN':
        return 'Kas Mingguan';
      case 'BUKU_KAS':
        return 'Buku Kas';
      case 'ADMIN':
        return 'Panel Admin';
      default:
        return 'Dasbor';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 select-none">
      {/* Primary Header Row */}
      <div className="px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Hamburger & Current Page Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={onOpenSidebar}
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors md:hidden shrink-0"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-0.5 shrink-0">
            <img
              src="/assets/aistudio/logo_osis_resized_2f1d7ea6.png"
              alt="Logo OSIS SMKN 7 Samarinda"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 truncate leading-tight">
              {getTabTitle()}
            </h1>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium truncate">
              Sistem Pembukuan & Transparansi KAS OSIS SMKN 7 Samarinda
            </p>
          </div>
        </div>

        {/* Right: Actions & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Desktop Saldo Badge (Hidden on mobile to prevent overlapping) */}
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-emerald-700/80 font-normal">Saldo:</span>
            <span className="font-mono-num font-extrabold text-emerald-900">
              Rp {saldoSekarang.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Tahun Ajaran Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTahunDropdown(!showTahunDropdown)}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-colors"
              title="Pilih Tahun Ajaran"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="font-mono-num text-[11px] sm:text-xs">
                {tahunAjaranList.find((t) => t.id === selectedTahunAjaranId)?.label || '2026/2027'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showTahunDropdown && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 shadow-lg rounded-xl z-50 py-1.5">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Pilih Tahun Ajaran
                </div>
                {tahunAjaranList.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTahunAjaranId(t.id);
                      setShowTahunDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-mono-num font-semibold hover:bg-slate-50 flex items-center justify-between ${
                      t.id === selectedTahunAjaranId
                        ? 'text-[#0D62C9] bg-sky-50 font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{t.label}</span>
                    {t.isAktif && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans font-bold">
                        AKTIF
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role & Quick Auth Button */}
          {isAdmin ? (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-[#0D62C9] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D62C9] shrink-0" />
                <span className="hidden sm:inline">Admin</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="flex items-center gap-1.5 bg-[#0D62C9] hover:bg-[#0b54ad] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
                title="Login Admin (Bendahara)"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] sm:text-xs">Login Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Saldo Strip (Only shown on mobile md:hidden - prevents crowding header) */}
      <div className="md:hidden px-3.5 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-slate-500 text-[11px] shrink-0">Saldo Kas:</span>
          <span className="font-mono-num font-bold text-emerald-700 text-xs truncate">
            Rp {saldoSekarang.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-medium truncate max-w-[130px] ml-2">
          {pengaturan.namaSekolah || 'SMKN 7 Samarinda'}
        </div>
      </div>
    </header>
  );
};
