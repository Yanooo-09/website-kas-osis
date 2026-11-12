import React from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import { LayoutDashboard, CalendarDays, BookOpen, ShieldCheck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isAdmin } = useApp();

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'RINGKASAN',
      label: 'Dasbor',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'KAS_MINGGUAN',
      label: 'Kas Kelas',
      icon: <CalendarDays className="w-5 h-5" />
    },
    {
      id: 'BUKU_KAS',
      label: 'Buku Kas',
      icon: <BookOpen className="w-5 h-5" />
    }
  ];

  if (isAdmin) {
    tabs.push({
      id: 'ADMIN',
      label: 'Admin',
      icon: <ShieldCheck className="w-5 h-5" />
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden pb-safe">
      <div className="flex items-stretch justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center gap-1 transition-all rounded-lg ${
                isActive
                  ? 'text-[#6C2BD9] font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-md transition-colors ${
                  isActive ? 'bg-purple-100/80 text-[#6C2BD9]' : ''
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] leading-none tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
