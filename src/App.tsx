import { useState, useEffect } from 'react';
import { Book, Member, Borrowing, Visitor } from './types';
import { INITIAL_BOOKS, INITIAL_MEMBERS, INITIAL_BORROWINGS, INITIAL_VISITORS } from './data/mockData';
import { 
  subscribeBooks, 
  subscribeMembers, 
  subscribeBorrowings, 
  subscribeVisitors, 
  subscribeAdminName,
  saveBookToCloud,
  deleteBookFromCloud,
  saveMemberToCloud,
  deleteMemberFromCloud,
  saveBorrowingToCloud,
  saveBatchBorrowingsToCloud,
  deleteBorrowingFromCloud,
  saveVisitorToCloud,
  deleteVisitorFromCloud,
  saveAdminNameToCloud,
  syncLocalStorageToCloud
} from './lib/dbService';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DataAnggota from './components/DataAnggota';
import DataBuku from './components/DataBuku';
import PeminjamanBuku from './components/PeminjamanBuku';
import PengembalianBuku from './components/PengembalianBuku';
import DataKunjungan from './components/DataKunjungan';
import PencarianBuku from './components/PencarianBuku';
import StatistikPeminjaman from './components/StatistikPeminjaman';
import KelolaAkun from './components/KelolaAkun';
import { LogOut, Cloud, CheckCircle2, Menu, Sparkles } from 'lucide-react';

export default function App() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Core Databases loaded from cloud / local storage fallback
  const [books, setBooks] = useState<Book[]>(() => {
    const local = localStorage.getItem('rk_makmur_books');
    return local ? JSON.parse(local) : INITIAL_BOOKS;
  });
  
  const [members, setMembers] = useState<Member[]>(() => {
    const local = localStorage.getItem('rk_makmur_members');
    return local ? JSON.parse(local) : INITIAL_MEMBERS;
  });

  const [borrowings, setBorrowings] = useState<Borrowing[]>(() => {
    const local = localStorage.getItem('rk_makmur_borrowings');
    return local ? JSON.parse(local) : INITIAL_BORROWINGS;
  });

  const [visitors, setVisitors] = useState<Visitor[]>(() => {
    const local = localStorage.getItem('rk_makmur_visitors');
    return local ? JSON.parse(local) : INITIAL_VISITORS;
  });

  // Admin Account state
  const [adminName, setAdminName] = useState<string>(() => {
    const local = localStorage.getItem('rk_makmur_admin_name');
    return local || 'Administrator RK Makmur';
  });

  // Cloud status tracking
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Login session
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const local = localStorage.getItem('rk_makmur_is_logged_in');
    return local === 'true';
  });

  // Active workspace tab navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Cross-component communication search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);

  // Real-time Cloud Database Subscriptions (Syncs across devices instantly)
  useEffect(() => {
    // Sync any previous browser local data to Cloud database if available
    syncLocalStorageToCloud();

    const unsubBooks = subscribeBooks((data) => {
      setBooks(data);
      setIsCloudSynced(true);
    });
    const unsubMembers = subscribeMembers((data) => {
      setMembers(data);
      setIsCloudSynced(true);
    });
    const unsubBorrowings = subscribeBorrowings((data) => {
      setBorrowings(data);
      setIsCloudSynced(true);
    });
    const unsubVisitors = subscribeVisitors((data) => {
      setVisitors(data);
      setIsCloudSynced(true);
    });
    const unsubAdmin = subscribeAdminName((name) => {
      setAdminName(name);
      setIsCloudSynced(true);
    });

    return () => {
      unsubBooks();
      unsubMembers();
      unsubBorrowings();
      unsubVisitors();
      unsubAdmin();
    };
  }, []);

  // Persisting databases to local storage on edits as offline fallback
  useEffect(() => {
    localStorage.setItem('rk_makmur_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('rk_makmur_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('rk_makmur_borrowings', JSON.stringify(borrowings));
  }, [borrowings]);

  useEffect(() => {
    localStorage.setItem('rk_makmur_visitors', JSON.stringify(visitors));
  }, [visitors]);

  useEffect(() => {
    localStorage.setItem('rk_makmur_admin_name', adminName);
  }, [adminName]);

  useEffect(() => {
    localStorage.setItem('rk_makmur_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  // Auth events
  const handleLoginSuccess = (name: string) => {
    setAdminName(name);
    saveAdminNameToCloud(name);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  // MEMBERS TRANSACTIONS
  const handleAddMember = (m: Member) => {
    setMembers(prev => [...prev, m]);
    saveMemberToCloud(m);
  };

  const handleEditMember = (m: Member, oldNomorAnggota?: string) => {
    const targetId = oldNomorAnggota || m.nomorAnggota;
    setMembers(prev => prev.map(item => item.nomorAnggota === targetId ? m : item));
    saveMemberToCloud(m, oldNomorAnggota);

    // If nomorAnggota changed, update borrowings referencing oldNomorAnggota
    if (oldNomorAnggota && oldNomorAnggota !== m.nomorAnggota) {
      setBorrowings(prev => prev.map(b => {
        if (b.nomorAnggota === oldNomorAnggota) {
          const updatedB = { ...b, nomorAnggota: m.nomorAnggota, namaAnggota: m.nama };
          saveBorrowingToCloud(updatedB);
          return updatedB;
        }
        return b;
      }));
    }
  };

  const handleDeleteMember = (nomorAnggota: string) => {
    setMembers(prev => prev.filter(item => item.nomorAnggota !== nomorAnggota));
    deleteMemberFromCloud(nomorAnggota);
  };

  // BOOKS TRANSACTIONS
  const handleAddBook = (b: Book) => {
    setBooks(prev => [...prev, b]);
    saveBookToCloud(b);
  };

  const handleEditBook = (b: Book, oldKodeBuku?: string) => {
    const keyToMatch = oldKodeBuku || b.kodeBuku;
    setBooks(prev => prev.map(item => item.kodeBuku === keyToMatch ? b : item));
    saveBookToCloud(b, oldKodeBuku);

    if (oldKodeBuku && oldKodeBuku !== b.kodeBuku) {
      const updatedBorrowings = borrowings.map(borrowing => {
        if (borrowing.kodeBuku === oldKodeBuku) {
          return { ...borrowing, kodeBuku: b.kodeBuku, judulBuku: b.judul };
        }
        return borrowing;
      });
      setBorrowings(updatedBorrowings);
      saveBatchBorrowingsToCloud(updatedBorrowings);
    }
  };

  const handleDeleteBook = (kodeBuku: string) => {
    setBooks(prev => prev.filter(item => item.kodeBuku !== kodeBuku));
    deleteBookFromCloud(kodeBuku);
  };

  // VISITORS TRANSACTIONS
  const handleAddVisitor = (v: Visitor) => {
    setVisitors(prev => [...prev, v]);
    saveVisitorToCloud(v);
  };

  const handleDeleteVisitor = (id: string) => {
    setVisitors(prev => prev.filter(v => v.id !== id));
    deleteVisitorFromCloud(id);
  };

  // BORROW TRANSACTIONS ENGINE
  const handleAddBorrowing = (b: Borrowing): string | null => {
    // Double check book stock
    const targetBook = books.find(item => item.kodeBuku === b.kodeBuku);
    if (!targetBook) return 'Buku tidak ditemukan!';
    
    const qty = b.jumlah || 1;
    if (targetBook.stock < qty) {
      return `Stok buku tidak mencukupi! Hanya tersisa ${targetBook.stock} buku.`;
    }

    // Double check member limits
    const activeBorrowsForMember = borrowings.filter(item => item.nomorAnggota === b.nomorAnggota && item.status === 'Dipinjam');
    if (activeBorrowsForMember.length >= 3) {
      return `Batas peminjaman terlampaui! Anggota ini sedang meminjam ${activeBorrowsForMember.length} buku (Maksimal 3).`;
    }

    // Decrement stock
    const updatedBook = { ...targetBook, stock: targetBook.stock - qty };
    setBooks(prev => prev.map(item => item.kodeBuku === b.kodeBuku ? updatedBook : item));
    saveBookToCloud(updatedBook);

    // Save transaction
    setBorrowings(prev => [...prev, b]);
    saveBorrowingToCloud(b);
    return null;
  };

  // Edit / Update borrowing
  const handleEditBorrowing = (updated: Borrowing) => {
    const original = borrowings.find(item => item.id === updated.id);
    if (!original) return;

    const originalQty = original.jumlah || 1;
    const updatedQty = updated.jumlah || 1;

    // Monitor status transition to update stock accordingly
    const targetBook = books.find(item => item.kodeBuku === updated.kodeBuku);
    if (targetBook) {
      let stockDiff = 0;
      if (original.status === 'Dipinjam' && updated.status === 'Kembali') {
        stockDiff = originalQty;
      } else if (original.status === 'Kembali' && updated.status === 'Dipinjam') {
        stockDiff = -updatedQty;
      } else if (original.status === 'Dipinjam' && updated.status === 'Dipinjam') {
        stockDiff = originalQty - updatedQty;
      }
      const updatedBook = { ...targetBook, stock: Math.max(0, targetBook.stock + stockDiff) };
      setBooks(prev => prev.map(item => item.kodeBuku === updated.kodeBuku ? updatedBook : item));
      saveBookToCloud(updatedBook);
    }

    setBorrowings(prev => prev.map(item => item.id === updated.id ? updated : item));
    saveBorrowingToCloud(updated);
  };

  // Return book transaction
  const handleReturnBook = (id: string, denda: number) => {
    const loan = borrowings.find(b => b.id === id);
    if (!loan) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const updatedBorrowing: Borrowing = {
      ...loan,
      status: 'Kembali',
      tanggalKembali: todayStr,
      denda: denda
    };

    // Update borrowing status to returned
    setBorrowings(prev => prev.map(b => b.id === id ? updatedBorrowing : b));
    saveBorrowingToCloud(updatedBorrowing);

    // Re-increment physical book stock by borrowed quantity
    const targetBook = books.find(b => b.kodeBuku === loan.kodeBuku);
    if (targetBook) {
      const updatedBook = { ...targetBook, stock: targetBook.stock + (loan.jumlah || 1) };
      setBooks(prev => prev.map(b => b.kodeBuku === loan.kodeBuku ? updatedBook : b));
      saveBookToCloud(updatedBook);
    }
  };

  const handleDeleteBorrowing = (id: string) => {
    setBorrowings(prev => prev.filter(b => b.id !== id));
    deleteBorrowingFromCloud(id);
  };

  // DB Backup Full Import Override
  const handleImportDatabase = (imported: { books: Book[], members: Member[], borrowings: Borrowing[], visitors: Visitor[] }) => {
    setBooks(imported.books);
    setMembers(imported.members);
    setBorrowings(imported.borrowings);
    setVisitors(imported.visitors);

    imported.books.forEach(b => saveBookToCloud(b));
    imported.members.forEach(m => saveMemberToCloud(m));
    imported.borrowings.forEach(br => saveBorrowingToCloud(br));
    imported.visitors.forEach(v => saveVisitorToCloud(v));
  };

  // Quick/Fast checkout workflow triggers
  const handleQuickBorrow = (nomorAnggota: string, kodeBuku: string): string | null => {
    const memberObj = members.find(m => m.nomorAnggota.toUpperCase() === nomorAnggota.toUpperCase());
    const bookObj = books.find(b => b.kodeBuku.toUpperCase() === kodeBuku.toUpperCase());

    if (!memberObj) return 'Nomor Anggota tidak terdaftar!';
    if (!bookObj) return 'Kode Buku tidak ditemukan!';

    const todayStr = new Date().toISOString().slice(0, 10);
    const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const tx: Borrowing = {
      id: `TR-${String(borrowings.length + 1).padStart(3, '0')}`,
      nomorAnggota: memberObj.nomorAnggota,
      namaAnggota: memberObj.nama,
      kelasAnggota: memberObj.kelas,
      kodeBuku: bookObj.kodeBuku,
      judulBuku: bookObj.judul,
      tanggalPinjam: todayStr,
      tanggalHarusKembali: nextWeekStr,
      status: 'Dipinjam'
    };

    return handleAddBorrowing(tx);
  };

  // Render sub-components conditionally based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            books={books}
            members={members}
            borrowings={borrowings}
            visitors={visitors}
            onQuickBorrow={handleQuickBorrow}
            setActiveTab={setActiveTab}
            setSearchQuery={setSearchQuery}
          />
        );
      case 'anggota':
        return (
          <DataAnggota
            members={members}
            onAddMember={handleAddMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
          />
        );
      case 'buku':
        return (
          <DataBuku
            books={books}
            onAddBook={handleAddBook}
            onEditBook={handleEditBook}
            onDeleteBook={handleDeleteBook}
          />
        );
      case 'peminjaman':
        return (
          <PeminjamanBuku
            books={books}
            members={members}
            borrowings={borrowings}
            onAddBorrowing={handleAddBorrowing}
            onEditBorrowing={handleEditBorrowing}
            onDeleteBorrowing={handleDeleteBorrowing}
          />
        );
      case 'pengembalian':
        return (
          <PengembalianBuku
            borrowings={borrowings}
            onReturnBook={handleReturnBook}
          />
        );
      case 'kunjungan':
        return (
          <DataKunjungan
            visitors={visitors}
            members={members}
            onAddVisitor={handleAddVisitor}
            onDeleteVisitor={handleDeleteVisitor}
          />
        );
      case 'pencarian':
        return (
          <PencarianBuku
            books={books}
            members={members}
            onDirectBorrow={handleQuickBorrow}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case 'statistik':
        return (
          <StatistikPeminjaman
            books={books}
            members={members}
            borrowings={borrowings}
            visitors={visitors}
          />
        );
      case 'kelola':
        return (
          <KelolaAkun
            adminName={adminName}
            setAdminName={setAdminName}
            books={books}
            members={members}
            borrowings={borrowings}
            visitors={visitors}
            onImportDatabase={handleImportDatabase}
          />
        );
      default:
        return <div className="text-zinc-500 font-mono text-center py-12">Tab tidak ditemukan.</div>;
    }
  };

  // Conditionally render login portal
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        adminName={adminName} 
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile Top Navigation Bar (Visible on screens < md) */}
        <div className="md:hidden bg-zinc-950 border-b border-zinc-900 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-amber-400 hover:text-amber-300 focus:outline-none cursor-pointer active:scale-95 transition-transform"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-gradient-to-br from-amber-400 to-yellow-600 text-zinc-950">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-zinc-100">
                RK Makmur <span className="text-amber-400">Lib</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-semibold">
              Admin
            </span>
          </div>
        </div>

        {/* Subtle top decoration */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-600 shrink-0" />
        
        {/* Cloud Realtime Sync Bar */}
        <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-4 md:px-6 py-2 flex items-center justify-between shrink-0 text-xs text-zinc-400">
          <div className="flex items-center gap-2 truncate">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Cloud className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono text-[11px] text-zinc-300 truncate">
              Database Cloud (Firestore): <strong className="text-emerald-400 font-normal">Realtime Sync</strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Data tersimpan permanen di cloud
          </div>
        </div>

        {/* Scrollable Work area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/60 via-zinc-950 to-zinc-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal Overlay */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl p-6 space-y-4">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            <div className="flex items-center gap-2.5 text-amber-500">
              <LogOut className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-zinc-100 font-sans">
                Konfirmasi Keluar
              </h3>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              Apakah Anda yakin ingin keluar dari aplikasi perpustakaan SMP Swasta RK Makmur?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-300 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoggedIn(false);
                  setIsLogoutConfirmOpen(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-red-500/10 transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
