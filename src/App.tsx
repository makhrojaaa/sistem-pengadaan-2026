import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, AppView } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { DaftarPengadaan } from './components/pengadaan/DaftarPengadaan';
import { FormPengadaan } from './components/pengadaan/FormPengadaan';
import { DetailPengadaan } from './components/pengadaan/DetailPengadaan';
import { LaporanBulanan } from './components/laporan/LaporanBulanan';
import { DatabaseConfigModal } from './components/settings/DatabaseConfigModal';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedPengadaanId, setSelectedPengadaanId] = useState<string | null>(null);
  const [editPengadaanId, setEditPengadaanId] = useState<string | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-slate-300">
          Memeriksa Otorisasi Akses Sistem...
        </p>
      </div>
    );
  }

  // If not logged in, enforce official Login screen (Poin 13 & 14)
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleSelectPengadaan = (id: string) => {
    setSelectedPengadaanId(id);
    setCurrentView('detail-pengadaan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditPengadaan = (id: string) => {
    setEditPengadaanId(id);
    setCurrentView('edit-pengadaan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateSuccess = (savedId: string) => {
    setSelectedPengadaanId(savedId);
    setEditPengadaanId(null);
    setCurrentView('detail-pengadaan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'tambah-pengadaan') {
      setEditPengadaanId(null);
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Topbar with Mobile Menu Button */}
      <Navbar
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation (Persistent on Desktop, Off-canvas on Mobile) */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenDatabaseModal={() => setIsDbModalOpen(true)}
          mobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Viewport (Fluid & Optimized for Mobile Android, Tablet & Full-Screen Desktops) */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-20 md:pb-8 w-full transition-all">
          {currentView === 'dashboard' && (
            <DashboardOverview
              key={reloadTrigger}
              onNavigateToPengadaan={() => handleNavigate('pengadaan')}
              onNavigateToTambah={() => handleNavigate('tambah-pengadaan')}
              onNavigateToLaporan={() => handleNavigate('laporan')}
              onSelectPengadaan={handleSelectPengadaan}
            />
          )}

          {currentView === 'pengadaan' && (
            <DaftarPengadaan
              key={reloadTrigger}
              onNavigateToTambah={() => handleNavigate('tambah-pengadaan')}
              onSelectPengadaan={handleSelectPengadaan}
              onEditPengadaan={handleEditPengadaan}
            />
          )}

          {currentView === 'tambah-pengadaan' && (
            <FormPengadaan
              editId={null}
              onBack={() => handleNavigate('pengadaan')}
              onSuccess={handleCreateSuccess}
            />
          )}

          {currentView === 'edit-pengadaan' && (
            <FormPengadaan
              editId={editPengadaanId}
              onBack={() => handleNavigate('pengadaan')}
              onSuccess={handleCreateSuccess}
            />
          )}

          {currentView === 'detail-pengadaan' && selectedPengadaanId && (
            <DetailPengadaan
              pengadaanId={selectedPengadaanId}
              onBack={() => handleNavigate('pengadaan')}
              onEdit={handleEditPengadaan}
            />
          )}

          {currentView === 'laporan' && <LaporanBulanan key={reloadTrigger} />}
        </main>
      </div>

      {/* Quick Mobile Bottom Navigation (Ergonomic for Android Phones) */}
      <MobileBottomNav currentView={currentView} onNavigate={handleNavigate} />

      {/* Database & SQL Schema Configuration Modal */}
      <DatabaseConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onReload={() => setReloadTrigger((prev) => prev + 1)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
