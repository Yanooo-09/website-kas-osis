import React from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ShieldCheck,
  LogOut,
  LogIn,
  X,
  Wallet,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    isAdmin,
    pengaturan,
    setShowAdminLoginModal,
    logout,
    saldoSekarang
  } = useApp();

  const navItems: { id: TabType; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    {
      id: 'RINGKASAN',
      label: 'Dasbor',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />
    },
    {
      id: 'KAS_MINGGUAN',
      label: 'Kas Mingguan',
      icon: <CalendarDays className="w-5 h-5 shrink-0" />
    },
    {
      id: 'BUKU_KAS',
      label: 'Buku Kas',
      icon: <BookOpen className="w-5 h-5 shrink-0" />
    },
    {
      id: 'ADMIN',
      label: 'Panel Admin',
      icon: <ShieldCheck className="w-5 h-5 shrink-0" />,
      adminOnly: true
    }
  ];

  const handleSelectTab = (tabId: TabType) => {
    setActiveTab(tabId);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 bg-[#0D62C9] text-white border-r border-[#0B54AD] flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 shadow-xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header Brand */}
          <div className="h-20 px-5 border-b border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 border border-white/30">
                <img
                  src="/assets/aistudio/logo_osis_resized_2f1d7ea6.png"
                  alt="Logo OSIS SMKN 7 Samarinda"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-lg tracking-tight text-white leading-tight">
                  KAS OSIS
                </span>
                <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider truncate">
                  SMKN 7 SAMARINDA
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 bg-black/10">
            <div className="w-10 h-10 rounded-xl bg-white text-[#0D62C9] flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-white/30">
              {isAdmin ? 'AP' : 'BK'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-white truncate uppercase leading-tight">
                {isAdmin ? (pengaturan.namaBendahara || 'ALKIYANO PARINTAK') : 'Bendahara Kelas'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    isAdmin ? 'bg-emerald-400' : 'bg-sky-300'
                  }`}
                />
                <span className="text-[11px] text-sky-100/80 font-medium truncate">
                  {isAdmin ? 'Bendahara OSIS (Admin)' : 'Bendahara Kelas (Lihat)'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3.5 py-4 space-y-6 flex-1">
            <div>
              <div className="px-3 mb-2 text-[10.5px] font-bold tracking-wider text-sky-200/70 uppercase">
                Menu Utama
              </div>
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  if (item.adminOnly && !isAdmin) return null;

                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-white text-[#0D62C9] font-bold shadow-md shadow-blue-950/20'
                          : 'text-white/85 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className={isActive ? 'text-[#0D62C9]' : 'text-white/90'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                      {item.adminOnly && (
                        <span
                          className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                            isActive
                              ? 'bg-blue-100 text-[#0D62C9]'
                              : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                          }`}
                        >
                          Admin
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* If Viewer, offer clean Admin panel launcher */}
                {!isAdmin && (
                  <button
                    onClick={() => {
                      setShowAdminLoginModal(true);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/75 hover:text-white hover:bg-white/10 transition-all text-left"
                  >
                    <ShieldCheck className="w-5 h-5 text-white/60 shrink-0" />
                    <span className="truncate">Panel Admin</span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-sky-100 font-bold uppercase border border-white/20">
                      Kunci
                    </span>
                  </button>
                )}
              </nav>
            </div>

            {/* Quick Balance Widget in Sidebar */}
            <div className="p-4 bg-white/10 border border-white/15 rounded-2xl backdrop-blur-xs">
              <div className="flex items-center gap-2 text-sky-200 text-xs font-semibold mb-1">
                <Wallet className="w-4 h-4 text-sky-200" />
                <span>Saldo Kas Saat Ini</span>
              </div>
              <div className="text-xl font-black text-white font-mono-num tracking-tight">
                Rp {saldoSekarang.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-sky-100/75 mt-1 font-medium">
                Terkonfirmasi pembukuan kas OSIS
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions (Logout / Login Admin) */}
        <div className="p-3.5 border-t border-white/15 space-y-1.5 bg-black/10">
          {!isAdmin ? (
            <button
              onClick={() => {
                setShowAdminLoginModal(true);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/25 transition-all shadow-xs"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>Login sebagai Admin</span>
            </button>
          ) : null}

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-200 hover:text-white hover:bg-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
};
