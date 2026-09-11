import React from 'react';
import { AppView } from './Sidebar';
import { LayoutDashboard, FileSpreadsheet, PlusCircle, FileText } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onNavigate }) => {
  const items = [
    {
      id: 'dashboard' as AppView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: currentView === 'dashboard',
    },
    {
      id: 'pengadaan' as AppView,
      label: 'Pengadaan',
      icon: FileSpreadsheet,
      active:
        currentView === 'pengadaan' ||
        currentView === 'detail-pengadaan' ||
        currentView === 'edit-pengadaan',
    },
    {
      id: 'tambah-pengadaan' as AppView,
      label: 'Tambah',
      icon: PlusCircle,
      active: currentView === 'tambah-pengadaan',
    },
    {
      id: 'laporan' as AppView,
      label: 'Laporan',
      icon: FileText,
      active: currentView === 'laporan',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071E3D] border-t border-[#11325C] shadow-2xl px-2 py-1.5 mobile-bottom-nav">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                item.active
                  ? 'text-white bg-[#005C9E] font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
