import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Calendar, 
  Feather, 
  CheckCircle, 
  XCircle, 
  X, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Book, Member } from '../types';
import { BOOK_CATEGORIES } from '../data/mockData';

interface PencarianBukuProps {
  books: Book[];
  members: Member[];
  onDirectBorrow: (nomorAnggota: string, kodeBuku: string) => string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function PencarianBuku({ 
  books, 
  members, 
  onDirectBorrow, 
  searchQuery, 
  setSearchQuery 
}: PencarianBukuProps) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Direct checkout states from detail modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutMemberId, setCheckoutMemberId] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');

  // Handle direct borrow submit
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    setCheckoutSuccess('');

    if (!selectedBook) return;
    if (!checkoutMemberId) {
      setCheckoutError('Silakan pilih anggota perpustakaan!');
      return;
    }

    const error = onDirectBorrow(checkoutMemberId, selectedBook.kodeBuku);
    if (error) {
      setCheckoutError(error);
    } else {
      setCheckoutSuccess(`Berhasil meminjamkan buku "${selectedBook.judul}"!`);
      // Update local stock for modal view
      selectedBook.stock -= 1;
      setTimeout(() => {
        setCheckoutSuccess('');
        setIsCheckoutOpen(false);
        setCheckoutMemberId('');
      }, 3000);
    }
  };

  // Filter books
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.pengarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.kodeBuku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.isbn.includes(searchQuery);
    const matchesCategory = selectedCategory === 'Semua' || b.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-zinc-100 tracking-tight font-sans">
          KATALOG & PENCARIAN BUKU
        </h2>
        <p className="text-xs text-zinc-500 font-mono">
          Eksplorasi seluruh katalog buku perpustakaan secara interaktif. Klik buku untuk info detail dan peminjaman langsung.
        </p>
      </div>

      {/* Search Input and Categories filter */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik judul buku, pengarang, penerbit, nomor ISBN, atau kode buku..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs placeholder-zinc-600 outline-none transition-colors shadow-lg"
          />
        </div>

        {/* Categories Badges Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
              selectedCategory === 'Semua'
                ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:border-zinc-700'
            }`}
          >
            Semua Kategori
          </button>
          {BOOK_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBooks.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <h4 className="text-zinc-300 font-bold text-sm">Buku Tidak Ditemukan</h4>
            <p className="text-zinc-600 text-xs mt-1">Coba gunakan kata kunci lain atau bersihkan kategori Anda.</p>
          </div>
        ) : (
          filteredBooks.map(book => (
            <div
              key={book.kodeBuku}
              onClick={() => {
                setSelectedBook(book);
                setCheckoutSuccess('');
                setCheckoutError('');
                setIsCheckoutOpen(false);
              }}
              className="bg-zinc-900 border border-zinc-800 hover:border-amber-400/30 rounded-2xl p-3 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group overflow-hidden"
            >
              <div className="space-y-2.5">
                {/* Book Cover Photo */}
                <div className="aspect-[3/4.2] w-full bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow relative">
                  <img
                    src={book.fotoSampul}
                    alt={book.judul}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-zinc-950/80 border border-zinc-800 text-amber-400">
                    {book.kodeBuku}
                  </span>
                </div>

                {/* Info summary */}
                <div className="space-y-1 px-1">
                  <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-wider block">
                    {book.kategori}
                  </span>
                  <h4 className="text-xs font-extrabold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight">
                    {book.judul}
                  </h4>
                  <p className="text-[10px] text-zinc-500 truncate">Oleh: {book.pengarang}</p>
                </div>
              </div>

              {/* Stock Footer Badge */}
              <div className="pt-2 border-t border-zinc-800/80 mt-2.5 flex justify-between items-center px-1 text-[10px]">
                <span className="text-zinc-500">Stok Tersedia:</span>
                <span className={`font-mono font-bold ${book.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {book.stock} eks
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Book Detail Overlay Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/20 rounded-2xl w-full max-w-2xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Frame: Cover Art */}
            <div className="w-full md:w-56 bg-zinc-950 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800 shrink-0">
              <div className="w-36 aspect-[3/4.2] rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
                <img
                  src={selectedBook.fotoSampul}
                  alt={selectedBook.judul}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-4 font-mono font-bold text-xs text-amber-400 tracking-widest bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg">
                KODE: {selectedBook.kodeBuku}
              </span>
            </div>

            {/* Right Frame: Comprehensive Details */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider block">
                    {selectedBook.kategori}
                  </span>
                  <h3 className="text-xl font-black text-zinc-100 leading-tight">
                    {selectedBook.judul}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 font-medium">
                    <span className="flex items-center gap-1"><Feather className="w-3.5 h-3.5 text-zinc-600" /> {selectedBook.pengarang}</span>
                    <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-zinc-600" /> {selectedBook.penerbit}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-zinc-600" /> {selectedBook.tahunTerbit}</span>
                  </div>
                </div>

                {/* Stats badge row */}
                <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs">
                  <div>
                    <span className="text-zinc-500 text-[10px] font-mono block">ISBN:</span>
                    <span className="font-bold font-mono text-zinc-300">{selectedBook.isbn}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] font-mono block">Status Stok:</span>
                    <span className={`font-bold font-mono ${selectedBook.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedBook.stock > 0 ? `${selectedBook.stock} EKS (TERSEDIA)` : 'HABIS DIPINJAM'}
                    </span>
                  </div>
                </div>

                {/* Synopsis */}
                <div className="space-y-1">
                  <h5 className="text-[10px] font-mono uppercase text-zinc-500">Sinopsis / Deskripsi</h5>
                  <p className="text-xs text-zinc-400 leading-relaxed max-h-32 overflow-y-auto pr-1">
                    {selectedBook.deskripsi}
                  </p>
                </div>
              </div>

              {/* Borrow Trigger Workflow */}
              <div className="pt-4 border-t border-zinc-800/80 mt-4">
                {!isCheckoutOpen ? (
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(true);
                    }}
                    disabled={selectedBook.stock <= 0}
                    className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-bold py-2.5 px-4 rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <ArrowUpRight className="w-4 h-4 text-zinc-950" />
                    <span>Pinjamkan Buku Ini Secara Langsung</span>
                  </button>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 bg-zinc-950 border border-zinc-850 p-4 rounded-xl animate-fade-in text-left">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-amber-400">Pilih Anggota Peminjam</h4>
                      <button 
                        type="button" 
                        onClick={() => setIsCheckoutOpen(false)}
                        className="text-zinc-500 hover:text-zinc-300 text-xs"
                      >
                        Batal
                      </button>
                    </div>

                    {checkoutError && (
                      <div className="p-2.5 bg-red-950/40 border border-red-500/20 text-red-300 rounded-lg text-[11px]">
                        {checkoutError}
                      </div>
                    )}
                    {checkoutSuccess && (
                      <div className="p-2.5 bg-green-950/40 border border-green-500/20 text-green-300 rounded-lg text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        <span>{checkoutSuccess}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <select
                        value={checkoutMemberId}
                        onChange={(e) => setCheckoutMemberId(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
                        required
                      >
                        <option value="">-- Cari / Pilih Anggota Aktif --</option>
                        {members.filter(m => m.status === 'Aktif').map(m => (
                          <option key={m.nomorAnggota} value={m.nomorAnggota}>
                            [{m.nomorAnggota}] {m.nama} ({m.kelas === 'Guru' ? 'Guru' : `Kelas ${m.kelas}`})
                          </option>
                        ))}
                      </select>
                      
                      <button
                        type="submit"
                        className="bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold px-4 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Pinjam
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
