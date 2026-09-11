import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { BPSLogo } from '../common/BPSLogo';
import { Database, LogOut, Calendar, UserCheck, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenDatabaseModal: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDatabaseModal,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#071E3D] border-b border-[#11325C] text-white sticky top-0 z-30 shadow-md">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                title="Buka / Tutup Menu"
                className="md:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-[#113054] border border-[#183F6D] transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <BPSLogo size="md" />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                  Sistem Laporan Pengadaan
                </span>
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-[#005C9E] text-white border border-sky-400/30">
                  TA 2026
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#F58220] font-semibold">
                Badan Pusat Statistik Kabupaten Tanah Datar
              </p>
            </div>
          </div>

          {/* Center Info / Fiscal Year Date */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-200 bg-[#0B2545] px-3.5 py-1.5 rounded-lg border border-[#173D6D]">
            <Calendar className="w-3.5 h-3.5 text-[#F58220]" />
            <span>Tahun Anggaran Aktif: <strong className="text-sky-300">2026</strong></span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-300 font-medium">BPS Sumbar</span>
          </div>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-3">
            {/* Database & Supabase Status Badge */}
            <button
              type="button"
              onClick={onOpenDatabaseModal}
              title="Klik untuk melihat skrip DDL SQL Supabase dan pengaturan koneksi"
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer bg-[#0A2542] hover:bg-[#11355D] border-[#183F6D] text-slate-200"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline text-slate-300">Database:</span>
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseConfigured ? 'bg-[#48A942]' : 'bg-[#F58220] animate-pulse'
                  }`}
                />
                <span className="font-semibold text-white">
                  {isSupabaseConfigured ? 'Supabase' : 'Lokal/SQL'}
                </span>
              </span>
            </button>

            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-[#133258]">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-white">{user.name}</div>
                  <div className="text-[11px] text-sky-300 flex items-center justify-end gap-1">
                    <UserCheck className="w-3 h-3 text-[#48A942]" />
                    <span>{user.role}</span>
                  </div>
                </div>

                <button
                  id="btn-logout"
                  type="button"
                  onClick={logout}
                  title="Keluar dari Sistem"
                  className="p-2 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-[#113054] border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official BPS Tricolor Bottom Border Stripe */}
      <div className="grid grid-cols-3 h-1 w-full">
        <div className="bg-[#005C9E]" title="Biru BPS (Profesional)" />
        <div className="bg-[#48A942]" title="Hijau BPS (Integritas)" />
        <div className="bg-[#F58220]" title="Oranye BPS (Amanah)" />
      </div>
    </header>
  );
};
