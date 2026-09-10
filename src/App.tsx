import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, AppView } from './components/layout/Sidebar';
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Topbar */}
      <Navbar onOpenDatabaseModal={() => setIsDbModalOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'tambah-pengadaan') {
              setEditPengadaanId(null);
            }
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardOverview
              key={reloadTrigger}
              onNavigateToPengadaan={() => setCurrentView('pengadaan')}
              onNavigateToTambah={() => {
                setEditPengadaanId(null);
                setCurrentView('tambah-pengadaan');
              }}
              onNavigateToLaporan={() => setCurrentView('laporan')}
              onSelectPengadaan={handleSelectPengadaan}
            />
          )}

          {currentView === 'pengadaan' && (
            <DaftarPengadaan
              key={reloadTrigger}
              onNavigateToTambah={() => {
                setEditPengadaanId(null);
                setCurrentView('tambah-pengadaan');
              }}
              onSelectPengadaan={handleSelectPengadaan}
              onEditPengadaan={handleEditPengadaan}
            />
          )}

          {currentView === 'tambah-pengadaan' && (
            <FormPengadaan
              editId={null}
              onBack={() => setCurrentView('pengadaan')}
              onSuccess={handleCreateSuccess}
            />
          )}

          {currentView === 'edit-pengadaan' && (
            <FormPengadaan
              editId={editPengadaanId}
              onBack={() => setCurrentView('pengadaan')}
              onSuccess={handleCreateSuccess}
            />
          )}

          {currentView === 'detail-pengadaan' && selectedPengadaanId && (
            <DetailPengadaan
              pengadaanId={selectedPengadaanId}
              onBack={() => setCurrentView('pengadaan')}
              onEdit={handleEditPengadaan}
            />
          )}

          {currentView === 'laporan' && <LaporanBulanan key={reloadTrigger} />}
        </main>
      </div>

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
