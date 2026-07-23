import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Clock, 
  UserPlus, 
  TrendingUp, 
  Search, 
  Zap, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  BookMarked,
  Trophy,
  Crown
} from 'lucide-react';
import { Book, Member, Borrowing, Visitor } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  books: Book[];
  members: Member[];
  borrowings: Borrowing[];
  visitors: Visitor[];
  onQuickBorrow: (nomorAnggota: string, kodeBuku: string) => string | null; // returns error message or null
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
}

export default function Dashboard({ 
  books, 
  members, 
  borrowings, 
  visitors, 
  onQuickBorrow, 
  setActiveTab,
  setSearchQuery 
}: DashboardProps) {
  // Quick Borrow States
  const [borrowMemberId, setBorrowMemberId] = useState('');
  const [borrowBookCode, setBorrowBookCode] = useState('');
  const [borrowError, setBorrowError] = useState('');
  const [borrowSuccess, setBorrowSuccess] = useState('');

  // Quick Search State
  const [localSearch, setLocalSearch] = useState('');

  // Calculations for stats
  const totalMembers = members.length;
  const totalBooks = books.length;
  const totalPhysicalBooks = books.reduce((acc, curr) => acc + curr.stock, 0);
  
  // Recent Borrowers (last 4)
  const recentBorrowers = [...borrowings]
    .slice(-4)
    .reverse();

  // Kunjungan hari ini (assuming format YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);
  const visitsToday = visitors.filter(v => v.tanggal.startsWith(todayStr)).length;

  // 5 Buku Terpopuler (Paling sering dipinjam)
  const bookBorrowCounts = borrowings.reduce((acc, b) => {
    const qty = b.jumlah || 1;
    acc[b.kodeBuku] = (acc[b.kodeBuku] || 0) + qty;
    return acc;
  }, {} as Record<string, number>);

  const top5Books = [...books]
    .map(book => ({
      ...book,
      totalBorrowed: bookBorrowCounts[book.kodeBuku] || 0
    }))
    .sort((a, b) => b.totalBorrowed - a.totalBorrowed || b.stock - a.stock)
    .slice(0, 5);

  // 5 Nama Siswa yang Sering Meminjam Buku
  const memberBorrowCounts = borrowings.reduce((acc, b) => {
    const key = b.nomorAnggota || b.namaAnggota;
    const qty = b.jumlah || 1;
    if (!acc[key]) {
      acc[key] = {
        nomorAnggota: b.nomorAnggota,
        nama: b.namaAnggota,
        kelas: b.kelasAnggota,
        transactionCount: 0,
        totalBooks: 0
      };
    }
    acc[key].transactionCount += 1;
    acc[key].totalBooks += qty;
    return acc;
  }, {} as Record<string, { nomorAnggota: string; nama: string; kelas: string; transactionCount: number; totalBooks: number }>);

  const top5StudentsMap = new Map<string, { nomorAnggota: string; nama: string; kelas: string; transactionCount: number; totalBooks: number }>();

  // Add from borrowing records
  Object.values(memberBorrowCounts).forEach(item => {
    top5StudentsMap.set(item.nomorAnggota, item);
  });

  // Include registered student members as fallback if less than 5
  members.filter(m => m.kelas !== 'Guru').forEach(m => {
    if (!top5StudentsMap.has(m.nomorAnggota)) {
      top5StudentsMap.set(m.nomorAnggota, {
        nomorAnggota: m.nomorAnggota,
        nama: m.nama,
        kelas: m.kelas,
        transactionCount: 0,
        totalBooks: 0
      });
    }
  });

  const top5Students = Array.from(top5StudentsMap.values())
    .sort((a, b) => b.totalBooks - a.totalBooks || b.transactionCount - a.transactionCount)
    .slice(0, 5);

  const handleQuickBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBorrowError('');
    setBorrowSuccess('');

    if (!borrowMemberId.trim() || !borrowBookCode.trim()) {
      setBorrowError('Silakan isi kedua kolom!');
      return;
    }

    const error = onQuickBorrow(borrowMemberId.trim(), borrowBookCode.trim());
    if (error) {
      setBorrowError(error);
    } else {
      setBorrowSuccess(`Berhasil meminjamkan! Transaksi tercatat.`);
      setBorrowMemberId('');
      setBorrowBookCode('');
      // clear success after 3 secs
      setTimeout(() => setBorrowSuccess(''), 4000);
    }
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim());
      setActiveTab('pencarian');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Banner / Header */}
      <motion.div 
        variants={itemVariants}
        className="bg-zinc-900 border border-amber-500/10 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Sistem Informasi Perpustakaan</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-100 font-sans tracking-tight">
            Selamat Datang di Perpustakaan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 animate-pulse">SMP Swasta RK Makmur</span>
          </h2>
          <p className="text-zinc-400 text-xs max-w-2xl leading-relaxed">
            Jl. Teratai No 21 A Medan Estate, Kec. Percut Sei Tuan, Kab. Deli Serdang, Provinsi Sumatera Utara.
          </p>
        </div>

        {/* Quick Date display */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-right shrink-0 z-10 self-stretch md:self-auto flex md:flex-col justify-between md:justify-center items-center md:items-end">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Hari Ini:</span>
          <span className="text-xs font-bold text-amber-400">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </motion.div>

      {/* Stats Bento Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Anggota */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg relative group overflow-hidden hover:border-amber-500/25 transition-all">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium font-sans">Total Anggota</span>
            <h3 className="text-3xl font-black text-zinc-100 font-mono tracking-tight group-hover:text-amber-400 transition-colors">
              {totalMembers}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              {members.filter(m => m.status === 'Aktif').length} Anggota FK
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors shadow-inner">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Buku */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg relative group overflow-hidden hover:border-amber-500/25 transition-all">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium font-sans">Total Koleksi Buku</span>
            <h3 className="text-3xl font-black text-zinc-100 font-mono tracking-tight group-hover:text-amber-400 transition-colors">
              {totalBooks}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              Stok Fisik: {totalPhysicalBooks} eks
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors shadow-inner">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Kunjungan Hari Ini */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg relative group overflow-hidden hover:border-amber-500/25 transition-all">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium font-sans">Kunjungan Hari Ini</span>
            <h3 className="text-3xl font-black text-zinc-100 font-mono tracking-tight group-hover:text-amber-400 transition-colors">
              {visitors.length}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              {visitsToday} login baru hari ini
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors shadow-inner">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        {/* Total Dipinjam (Buku Keluar) */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg relative group overflow-hidden hover:border-amber-500/25 transition-all">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium font-sans">Sedang Dipinjam</span>
            <h3 className="text-3xl font-black text-zinc-100 font-mono tracking-tight group-hover:text-amber-400 transition-colors">
              {borrowings.filter(b => b.status === 'Dipinjam').length}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              Buku dipinjam aktif
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors shadow-inner">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </motion.div>

      {/* Main Interactive Row (Pinjam Buku & Cari Buku columns) */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Quick Access: Pinjam Buku Column */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/15 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-sans text-zinc-100">Pinjam Buku Cepat</h3>
            </div>
            
            <p className="text-zinc-400 text-xs mb-4">
              Peminjaman instan dengan memasukkan nomor anggota dan kode buku di bawah ini.
            </p>

            <form onSubmit={handleQuickBorrowSubmit} className="space-y-4">
              {borrowError && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-center gap-2 font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{borrowError}</span>
                </div>
              )}
              {borrowSuccess && (
                <div className="p-3 bg-green-950/40 border border-green-500/20 text-green-300 rounded-xl text-xs flex items-center gap-2 font-sans">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-spin" />
                  <span>{borrowSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    No. Anggota
                  </label>
                  <input
                    type="text"
                    value={borrowMemberId}
                    onChange={(e) => setBorrowMemberId(e.target.value)}
                    placeholder="M001 / M002"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs placeholder-zinc-750 outline-none transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    Kode Buku
                  </label>
                  <input
                    type="text"
                    value={borrowBookCode}
                    onChange={(e) => setBorrowBookCode(e.target.value)}
                    placeholder="B001 / B002"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs placeholder-zinc-750 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-bold py-2.5 px-4 rounded-xl text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Proses Pinjam Cepat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3.5 border-t border-zinc-800/60 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Maksimal 3 buku per anggota</span>
            <button 
              onClick={() => setActiveTab('peminjaman')}
              className="text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              Lihat Menu Transaksi Peminjaman &rarr;
            </button>
          </div>
        </div>

        {/* Quick Access: Cari Buku Column */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/15 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-sans text-zinc-100">Pencarian Buku Cepat</h3>
            </div>

            <p className="text-zinc-400 text-xs mb-4">
              Ketik kata kunci untuk mencari judul buku, nama pengarang, kategori, atau kode ISBN di sini.
            </p>

            <form onSubmit={handleQuickSearchSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Ketik Judul, Kategori atau Pengarang..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl pl-4 pr-10 py-3 text-xs placeholder-zinc-750 outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-zinc-900 text-amber-400 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              {localSearch.trim() && (
                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2">
                  <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase block">Hasil Pencarian Cepat:</span>
                  {books.filter(b => 
                    b.judul.toLowerCase().includes(localSearch.toLowerCase()) || 
                    b.pengarang.toLowerCase().includes(localSearch.toLowerCase()) ||
                    b.kategori.toLowerCase().includes(localSearch.toLowerCase())
                  ).slice(0, 3).map(b => (
                    <div 
                      key={b.kodeBuku} 
                      onClick={() => {
                        setSearchQuery(b.judul);
                        setActiveTab('pencarian');
                      }}
                      className="text-xs hover:text-amber-400 text-zinc-300 font-medium cursor-pointer border-b border-zinc-900 pb-1.5 last:border-0 last:pb-0 flex items-center justify-between"
                    >
                      <span className="truncate max-w-[200px]">{b.judul}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{b.kategori}</span>
                    </div>
                  ))}
                  {books.filter(b => 
                    b.judul.toLowerCase().includes(localSearch.toLowerCase()) || 
                    b.pengarang.toLowerCase().includes(localSearch.toLowerCase()) ||
                    b.kategori.toLowerCase().includes(localSearch.toLowerCase())
                  ).length === 0 && (
                    <span className="text-xs text-zinc-600 block">Tidak ada buku ditemukan.</span>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="mt-4 pt-3.5 border-t border-zinc-800/60 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Pencarian multi-kategori cerdas</span>
            <button 
              onClick={() => setActiveTab('pencarian')}
              className="text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              Buka Katalog Detail &rarr;
            </button>
          </div>
        </div>
      </motion.div>

      {/* Peminjam Terbaru Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 group hover:border-amber-500/10 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-sans text-zinc-100">Peminjam Terbaru</h3>
          </div>
          <button 
            onClick={() => setActiveTab('peminjaman')}
            className="text-xs text-amber-500 hover:underline font-medium cursor-pointer"
          >
            Semua Transaksi &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-400">
            <thead className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-2">
              <tr>
                <th className="py-3">No. Anggota</th>
                <th className="py-3">Nama Anggota</th>
                <th className="py-3">Judul Buku</th>
                <th className="py-3 text-center">Jumlah</th>
                <th className="py-3">Tanggal Pinjam</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {recentBorrowers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-zinc-600">
                    Belum ada catatan peminjaman terbaru.
                  </td>
                </tr>
              ) : (
                recentBorrowers.map((borrow) => (
                  <tr key={borrow.id} className="hover:bg-zinc-800/25 transition-colors">
                    <td className="py-3 font-mono font-bold text-amber-400">{borrow.nomorAnggota}</td>
                    <td className="py-3 font-semibold text-zinc-200">
                      {borrow.namaAnggota} <span className="text-[10px] text-zinc-500">({borrow.kelasAnggota})</span>
                    </td>
                    <td className="py-3 text-zinc-300 max-w-xs truncate">{borrow.judulBuku}</td>
                    <td className="py-3 text-center font-mono text-zinc-300 font-bold">{borrow.jumlah || 1}</td>
                    <td className="py-3 font-mono text-zinc-400">{borrow.tanggalPinjam}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                        borrow.status === 'Dipinjam'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {borrow.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Analytics Row: 5 Buku Terpopuler & 5 Siswa Sering Meminjam */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* 5 Buku Terpopuler */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 group hover:border-amber-500/10 transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-sans text-zinc-100">5 Buku Terpopuler</h3>
                  <p className="text-[10px] text-zinc-500">Koleksi paling sering dipinjam pembaca</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('buku')}
                className="text-xs text-amber-500 hover:underline font-medium cursor-pointer"
              >
                Katalog Buku
              </button>
            </div>

            <div className="space-y-2.5">
              {top5Books.map((book, idx) => (
                <div 
                  key={book.kodeBuku} 
                  onClick={() => {
                    setSearchQuery(book.judul);
                    setActiveTab('pencarian');
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-850 hover:border-amber-500/30 transition-all cursor-pointer group"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-black shrink-0 ${
                    idx === 0 ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20' :
                    idx === 1 ? 'bg-zinc-300 text-zinc-950' :
                    idx === 2 ? 'bg-amber-700/80 text-amber-100' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    #{idx + 1}
                  </div>

                  <img 
                    src={book.fotoSampul} 
                    alt={book.judul}
                    referrerPolicy="no-referrer"
                    className="w-9 h-12 object-cover rounded shadow-md border border-zinc-800 shrink-0" 
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-amber-500/80 uppercase font-semibold">{book.kategori}</span>
                      <span className="text-[9px] font-mono text-zinc-600">({book.kodeBuku})</span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-200 truncate group-hover:text-amber-400 transition-colors">
                      {book.judul}
                    </h4>
                    <p className="text-[10px] text-zinc-500 truncate">{book.pengarang}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                      {book.totalBorrowed}x Dipinjam
                    </span>
                    <span className={`block text-[9px] font-mono mt-0.5 ${book.stock > 0 ? 'text-zinc-500' : 'text-red-400 font-semibold'}`}>
                      Stok: {book.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5 Siswa Sering Meminjam Buku */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 group hover:border-amber-500/10 transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-sans text-zinc-100">5 Siswa Teraktif Meminjam</h3>
                  <p className="text-[10px] text-zinc-500">Siswa paling sering meminjam buku</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('anggota')}
                className="text-xs text-amber-500 hover:underline font-medium cursor-pointer"
              >
                Data Anggota
              </button>
            </div>

            <div className="space-y-2.5">
              {top5Students.map((student, idx) => (
                <div 
                  key={student.nomorAnggota} 
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-850 hover:border-amber-500/20 transition-all group"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-black shrink-0 ${
                    idx === 0 ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20' :
                    idx === 1 ? 'bg-zinc-300 text-zinc-950' :
                    idx === 2 ? 'bg-amber-700/80 text-amber-100' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    #{idx + 1}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 font-mono shadow-inner">
                    {student.nama.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-amber-400 font-semibold">{student.nomorAnggota}</span>
                      <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 py-0.2 rounded">
                        {student.kelas === 'Guru' ? 'Guru' : `Kelas ${student.kelas}`}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-200 truncate group-hover:text-amber-400 transition-colors">
                      {student.nama}
                    </h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                      {student.totalBooks} Buku
                    </span>
                    <span className="block text-[9px] font-mono text-zinc-500 mt-0.5">
                      {student.transactionCount} Transaksi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
