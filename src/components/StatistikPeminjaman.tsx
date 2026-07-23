import { BarChart3, TrendingUp, BookOpen, Clock, Activity, AlertCircle, Calendar, FileText } from 'lucide-react';
import { Book, Member, Borrowing, Visitor } from '../types';
import { BOOK_CATEGORIES } from '../data/mockData';
import { downloadWeeklyReportPDF, downloadMonthlyReportPDF, downloadYearlyReportPDF } from '../utils/pdfGenerator';
import { motion } from 'motion/react';

interface StatistikPeminjamanProps {
  books: Book[];
  members: Member[];
  borrowings: Borrowing[];
  visitors: Visitor[];
}

export default function StatistikPeminjaman({ books, members, borrowings, visitors }: StatistikPeminjamanProps) {
  
  // Calculate category stocks
  const categoryStats = BOOK_CATEGORIES.map(cat => {
    const totalInCat = books.filter(b => b.kategori === cat).length;
    const stockInCat = books.filter(b => b.kategori === cat).reduce((acc, curr) => acc + curr.stock, 0);
    return {
      category: cat,
      count: totalInCat,
      stock: stockInCat
    };
  }).filter(stat => stat.count > 0 || stat.stock > 0);

  // Maximum stock for scale calculations
  const maxStock = Math.max(...categoryStats.map(c => c.stock), 1);

  // Calculate visit purposes count
  const visitPurposes = [
    { label: 'Membaca Buku', count: visitors.filter(v => v.tujuan.includes('Membaca')).length },
    { label: 'Meminjam Buku', count: visitors.filter(v => v.tujuan.includes('Meminjam')).length },
    { label: 'Mengembalikan', count: visitors.filter(v => v.tujuan.includes('Mengembalikan')).length },
    { label: 'Tugas Sekolah', count: visitors.filter(v => v.tujuan.includes('Tugas') || v.tujuan.includes('Mengerjakan')).length },
    { label: 'Referensi', count: visitors.filter(v => v.tujuan.includes('Referensi')).length },
  ];
  const maxVisits = Math.max(...visitPurposes.map(v => v.count), 1);

  // KPI calculations
  const activeBorrowsCount = borrowings.filter(b => b.status === 'Dipinjam').length;
  const returnedBorrowsCount = borrowings.filter(b => b.status === 'Kembali').length;
  
  // Overdue calculation (comparing with today's date)
  const today = new Date();
  today.setHours(0,0,0,0);
  const overdueCount = borrowings.filter(b => {
    if (b.status !== 'Dipinjam') return false;
    const dueDate = new Date(b.tanggalHarusKembali);
    dueDate.setHours(0,0,0,0);
    return today.getTime() > dueDate.getTime();
  }).length;

  const totalDenda = borrowings
    .filter(b => b.denda && b.denda > 0)
    .reduce((acc, curr) => acc + (curr.denda || 0), 0);

  const totalPhysicalBooks = books.reduce((acc, curr) => acc + curr.stock, 0);

  // Motion animation config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
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
      {/* Title */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-black text-zinc-100 tracking-tight font-sans">
          STATISTIK & ANALISIS PERPUSTAKAAN
        </h2>
        <p className="text-xs text-zinc-500 font-mono">
          Dashboard visual mengenai perputaran koleksi buku, pola kunjungan harian, dan status keuangan denda perpustakaan.
        </p>
      </motion.div>

      {/* KPI Stats Panel */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-1 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-amber-500/5 to-transparent blur-xl pointer-events-none" />
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-semibold">Tingkat Sirkulasi Aktif</span>
            <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="text-2xl font-black text-zinc-100 font-mono">
            {activeBorrowsCount} <span className="text-xs text-zinc-500 font-normal">buku dipinjam</span>
          </h4>
          <p className="text-[10px] text-zinc-500 font-mono">
            Rasio pinjam: {totalPhysicalBooks > 0 ? ((activeBorrowsCount / (totalPhysicalBooks + activeBorrowsCount)) * 100).toFixed(1) : 0}% dari total aset
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-1 relative overflow-hidden group hover:border-green-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-green-500/5 to-transparent blur-xl pointer-events-none" />
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-semibold">Jumlah Pengembalian</span>
            <BookOpen className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="text-2xl font-black text-zinc-100 font-mono">
            {returnedBorrowsCount} <span className="text-xs text-zinc-500 font-normal">selesai</span>
          </h4>
          <p className="text-[10px] text-zinc-500 font-mono">
            Sirkulasi transaksi selesai dicatatkan
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-1 relative overflow-hidden group hover:border-red-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-red-500/5 to-transparent blur-xl pointer-events-none" />
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-semibold">Buku Terlambat (Overdue)</span>
            <AlertCircle className="w-4 h-4 text-red-400 animate-pulse group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="text-2xl font-black text-red-400 font-mono">
            {overdueCount} <span className="text-xs text-zinc-500 font-normal">buku</span>
          </h4>
          <p className="text-[10px] text-red-500/70 font-mono">
            Membutuhkan pemanggilan penagihan segera
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-1 relative overflow-hidden group hover:border-yellow-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-yellow-500/5 to-transparent blur-xl pointer-events-none" />
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-semibold">Kas Denda Terkumpul</span>
            <Activity className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="text-2xl font-black text-amber-400 font-mono">
            Rp {totalDenda.toLocaleString('id-ID')}
          </h4>
          <p className="text-[10px] text-zinc-500 font-mono">
            Sumbangan denda ketertiban siswa
          </p>
        </div>
      </motion.div>

      {/* Cetak Laporan Berkala (PDF) Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-zinc-900 border border-amber-500/10 rounded-2xl p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4 animate-pulse" />
              <span>Pusat Cetak Laporan Periodik</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100 font-sans">
              Cetak Dokumen Laporan Berkala Perpustakaan (PDF)
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dapatkan data terstruktur yang difilter secara berkala berdasarkan transaksi peminjaman buku, pengembalian, kas denda, dan log kehadiran siswa. Siap dicetak sebagai berkas pelaporan resmi.
            </p>
          </div>

          {/* Action buttons inside a beautiful grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 w-full md:w-auto">
            {/* Laporan Mingguan */}
            <button
              onClick={() => downloadWeeklyReportPDF(books, members, borrowings, visitors)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 text-zinc-200 hover:text-amber-400 transition-all font-semibold text-xs relative group overflow-hidden cursor-pointer shadow-lg active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Mingguan (7 Hari)</span>
            </button>

            {/* Laporan Bulanan */}
            <button
              onClick={() => downloadMonthlyReportPDF(books, members, borrowings, visitors)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 text-zinc-200 hover:text-amber-400 transition-all font-semibold text-xs relative group overflow-hidden cursor-pointer shadow-lg active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Bulanan (30 Hari)</span>
            </button>

            {/* Laporan Tahunan */}
            <button
              onClick={() => downloadYearlyReportPDF(books, members, borrowings, visitors)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-bold text-xs group cursor-pointer shadow-lg hover:brightness-110 active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-950 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Tahunan (365 Hari)</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Charts Split Layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Category Stock Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-zinc-100 font-sans">Koleksi Stok Berdasarkan Kategori</h3>
            <p className="text-zinc-500 text-[11px] font-mono">Persentase dan jumlah stok fisik buku per kategori pustaka.</p>
          </div>

          <div className="space-y-3.5 relative z-10">
            {categoryStats.map(stat => {
              const percentage = (stat.stock / totalPhysicalBooks) * 100;
              const barWidth = (stat.stock / maxStock) * 100;

              return (
                <div key={stat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-300">{stat.category}</span>
                    <span className="font-mono text-zinc-500">
                      <span className="text-amber-400 font-bold">{stat.stock} eks</span> &nbsp;({percentage.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Visual Bar container */}
                  <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="bg-gradient-to-r from-amber-500 to-yellow-600 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart B: Visit Purpose Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-zinc-100 font-sans">Analisis Motivasi & Tujuan Kunjungan</h3>
            <p className="text-zinc-500 text-[11px] font-mono">Jumlah log kedatangan siswa berdasarkan aktivitas yang dipilih.</p>
          </div>

          {/* Vertical Bar Column Chart */}
          <div className="flex items-end justify-around h-52 bg-zinc-950 border border-zinc-850/80 rounded-2xl p-4 pt-8 relative z-10">
            {visitPurposes.map(v => {
              const colHeight = (v.count / maxVisits) * 100;

              return (
                <div key={v.label} className="flex flex-col items-center h-full justify-end group relative w-12">
                  
                  {/* Tooltip on hover */}
                  <span className="absolute -top-6 bg-zinc-900 border border-amber-500/30 text-amber-400 font-bold font-mono text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {v.count}
                  </span>

                  {/* Vertical bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${colHeight}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    className="w-4 bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-400 rounded-t-lg group-hover:brightness-110 transition-all"
                  />

                  {/* X axis Label */}
                  <span className="text-[9px] text-zinc-500 text-center truncate w-full mt-2 font-mono" title={v.label}>
                    {v.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart footer */}
          <div className="bg-zinc-950/40 border border-zinc-850/60 p-3 rounded-xl text-[10px] text-zinc-500 leading-relaxed relative z-10">
            <span className="font-bold text-amber-400 block mb-0.5">💡 Insights Aktivitas:</span>
            Aktivitas membaca dan peminjaman buku mendominasi kunjungan siswa harian di Perpustakaan SMP Swasta RK Makmur.
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

