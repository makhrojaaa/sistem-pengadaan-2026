import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BPSLogo } from '../common/BPSLogo';
import { Lock, Mail, AlertCircle, Building2, UserCheck, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('pejabat.pbj@bps.go.id');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Email atau password salah.');
    }
    setLoading(false);
  };

  const handleQuickSelect = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#041224] via-[#081F3D] to-[#030F1D] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle formal background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Official BPS Logo Emblem */}
        <div className="flex justify-center">
          <div className="p-3.5 rounded-2xl bg-[#092242]/90 border border-[#1E4B82] shadow-xl shadow-[#041224]/50 flex items-center justify-center">
            <BPSLogo size="xl" />
          </div>
        </div>

        <div className="text-center mt-5">
          {/* BPS Tricolor Badge */}
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#0B2A52] border border-[#1D4F8C] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#005C9E]" />
            <span className="w-2 h-2 rounded-full bg-[#48A942]" />
            <span className="w-2 h-2 rounded-full bg-[#F58220]" />
            <span className="text-white ml-1 tracking-wider uppercase text-[11px]">
              BPS KABUPATEN TANAH DATAR
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Sistem Laporan Pengadaan
          </h1>
          <p className="mt-1 text-sm text-[#F58220] font-semibold">
            Pengadaan Barang dan Jasa Pemerintah • TA 2026
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#0B2545]/95 backdrop-blur-md border border-[#1A4578] py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div
              id="login-error-alert"
              className="mb-5 bg-rose-950/70 border border-rose-500/40 text-rose-200 text-sm p-3.5 rounded-lg flex items-center gap-3 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-1.5"
              >
                Alamat Email Kedinasan
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@bps.go.id"
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#071B33] border border-[#1E487C] rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C9E] focus:border-sky-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password-input"
                className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password-input"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#071B33] border border-[#1E487C] rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C9E] focus:border-sky-400 transition-colors"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-gradient-to-r from-[#005C9E] to-[#0275d8] hover:from-[#004e87] hover:to-[#005C9E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005C9E] disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Memverifikasi Akses...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard PBJ</span>
                  <ArrowRight className="w-4 h-4 text-[#F58220]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="mt-8 pt-6 border-t border-[#183F6D]">
            <p className="text-xs text-sky-200/80 text-center mb-3 font-semibold">
              Pilih Akun Administrasi untuk Evaluasi Cepat:
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickSelect('pejabat.pbj@bps.go.id')}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-[#071B33] hover:bg-[#11315B] border border-[#1D4A7E] text-xs flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#48A942]" />
                  <div>
                    <div className="font-bold text-white">Firdaus, SST, M.T</div>
                    <div className="text-[11px] text-[#F58220] font-medium">Pejabat Pengadaan • BPS Kab. Tanah Datar</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#48A942]/20 text-emerald-300 border border-[#48A942]/40">
                  Pilih
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('admin.pengadaan@bps.go.id')}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-[#071B33] hover:bg-[#11315B] border border-[#1D4A7E] text-xs flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="font-bold text-white">Admin Sistem</div>
                    <div className="text-[11px] text-[#F58220] font-medium">admin.pengadaan@bps.go.id • BPS Kab. Tanah Datar</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#005C9E]/30 text-sky-300 border border-[#005C9E]/50">
                  Pilih
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Confidentiality Notice */}
        <p className="mt-6 text-center text-xs text-sky-300/70 max-w-sm mx-auto leading-relaxed">
          Sistem Informasi Pengadaan Badan Pusat Statistik Kabupaten Tanah Datar terproteksi dan terenkripsi.
        </p>
      </div>
    </div>
  );
};
