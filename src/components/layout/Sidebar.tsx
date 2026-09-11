import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BPSLogo } from '../common/BPSLogo';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  Database,
  LogOut,
  UserCheck,
} from 'lucide-react';

export type AppView = 'dashboard' | 'pengadaan' | 'tambah-pengadaan' | 'detail-pengadaan' | 'edit-pengadaan' | 'laporan';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenDatabaseModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onOpenDatabaseModal }) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as AppView,
      label: 'Dashboard Realisasi',
      icon: LayoutDashboard,
      active: currentView === 'dashboard',
    },
    {
      id: 'pengadaan' as AppView,
      label: 'Daftar Pengadaan',
      icon: FileSpreadsheet,
      active: currentView === 'pengadaan' || currentView === 'detail-pengadaan' || currentView === 'edit-pengadaan',
    },
    {
      id: 'tambah-pengadaan' as AppView,
      label: '+ Tambah Pengadaan',
      icon: PlusCircle,
      active: currentView === 'tambah-pengadaan',
    },
    {
      id: 'laporan' as AppView,
      label: 'Laporan Bulanan',
      icon: FileText,
      active: currentView === 'laporan',
    },
  ];

  return (
    <aside className="w-64 bg-[#081B33] border-r border-[#153258] text-slate-200 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)] select-none">
      {/* Navigation Links */}
      <div className="p-4 flex-1 space-y-1.5">
        {/* BPS Quick Section Label */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
            Menu PBJ BPS 2026
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#F58220] animate-pulse" title="Sistem Aktif" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                item.active
                  ? 'bg-gradient-to-r from-[#005C9E] to-[#0274c4] text-white shadow-md shadow-[#005C9E]/30 font-semibold border-l-4 border-[#F58220]'
                  : 'text-slate-300 hover:bg-[#112948] hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${item.active ? 'text-[#F58220]' : 'text-sky-300/70'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-5 px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Administrasi & Data
        </div>

        <button
          type="button"
          onClick={onOpenDatabaseModal}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left text-slate-300 hover:bg-[#112948] hover:text-white cursor-pointer"
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Skrip SQL & Supabase</span>
        </button>
      </div>

      {/* BPS Institutional Footer with Official BPS Logo */}
      <div className="p-4 border-t border-[#153258] bg-[#051325]">
        {/* Official BPS Logo Badge */}
        <div className="p-2.5 rounded-xl bg-[#091F3A] border border-[#1B406E] mb-3">
          <div className="flex items-center gap-2.5">
            <BPSLogo size="md" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-extrabold text-white tracking-tight leading-tight">
                BADAN PUSAT STATISTIK
              </div>
              <div className="text-[10px] font-bold text-[#F58220] tracking-wide leading-tight mt-0.5">
                KAB. TANAH DATAR
              </div>
            </div>
          </div>

          {/* BPS Tricolor Accent Bar */}
          <div className="grid grid-cols-3 h-1 rounded-full overflow-hidden mt-2.5">
            <div className="bg-[#005C9E]" title="Biru BPS" />
            <div className="bg-[#48A942]" title="Hijau BPS" />
            <div className="bg-[#F58220]" title="Oranye BPS" />
          </div>

          {/* Active Logged-in User */}
          <div className="mt-2.5 pt-2 border-t border-[#153258] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300 truncate font-medium">
                Admin Sistem
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/25 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
};
