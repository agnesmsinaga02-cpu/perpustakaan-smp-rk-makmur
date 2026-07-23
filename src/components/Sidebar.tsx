import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownLeft, 
  UserCheck, 
  Search, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adminName: string;
  onLogout: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  adminName, 
  onLogout,
  isMobileOpen = false,
  setIsMobileOpen
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'anggota', name: 'Data Anggota', icon: Users },
    { id: 'buku', name: 'Data Buku', icon: BookOpen },
    { id: 'peminjaman', name: 'Peminjaman Buku', icon: ArrowUpRight },
    { id: 'pengembalian', name: 'Pengembalian Buku', icon: ArrowDownLeft },
    { id: 'kunjungan', name: 'Data Kunjungan', icon: UserCheck },
    { id: 'pencarian', name: 'Pencarian Buku', icon: Search },
    { id: 'statistik', name: 'Statistik Peminjaman', icon: BarChart3 },
    { id: 'kelola', name: 'Kelola Akun & App', icon: Settings },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        id="app-sidebar" 
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto w-72 md:w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between shrink-0 h-screen transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Upper Area: Logo & Menu */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand / Logo */}
          <div className="p-5 md:p-6 border-b border-zinc-900 flex items-center justify-between relative overflow-hidden">
            {/* Decorative gold spotlight effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 text-zinc-950 shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="font-bold text-zinc-100 tracking-tight text-base font-sans">
                  RK Makmur <span className="text-amber-400">Lib</span>
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest block">
                SMP Swasta RK Makmur
              </span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-900 rounded-xl border border-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Card */}
          <div className="p-3.5 mx-3 my-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-xs shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-zinc-200 truncate">{adminName}</h4>
              <p className="text-[10px] text-amber-500 font-mono">Status: Admin Utama</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 md:py-3 rounded-xl text-xs md:text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/10'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-950' : 'text-amber-500/70'}`} />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-zinc-900">
          <button
            onClick={() => {
              if (setIsMobileOpen) setIsMobileOpen(false);
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold font-sans text-red-400 bg-red-950/10 hover:bg-red-950/35 border border-red-900/20 hover:border-red-500/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>
    </>
  );
}

