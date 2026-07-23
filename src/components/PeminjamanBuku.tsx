import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Plus, 
  Calendar, 
  User, 
  BookOpen, 
  Search, 
  Download, 
  Check, 
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Book, Member, Borrowing } from '../types';
import { downloadBorrowingsPDF } from '../utils/pdfGenerator';

interface PeminjamanBukuProps {
  books: Book[];
  members: Member[];
  borrowings: Borrowing[];
  onAddBorrowing: (borrowing: Borrowing) => string | null; // returns error or null
  onEditBorrowing: (borrowing: Borrowing) => void;
  onDeleteBorrowing: (id: string) => void;
}

export default function PeminjamanBuku({ 
  books, 
  members, 
  borrowings, 
  onAddBorrowing,
  onEditBorrowing,
  onDeleteBorrowing
}: PeminjamanBukuProps) {
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // New Transaction Form States
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookCode, setSelectedBookCode] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [jumlahPinjam, setJumlahPinjam] = useState(1);
  const [keterangan, setKeterangan] = useState('');
  
  // Dates
  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [tanggalPinjam, setTanggalPinjam] = useState(today);
  const [tanggalHarusKembali, setTanggalHarusKembali] = useState(nextWeek);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Editing States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBorrowing, setEditingBorrowing] = useState<Borrowing | null>(null);
  const [editTanggalPinjam, setEditTanggalPinjam] = useState('');
  const [editTanggalHarusKembali, setEditTanggalHarusKembali] = useState('');
  const [editStatus, setEditStatus] = useState<'Dipinjam' | 'Kembali'>('Dipinjam');
  const [editJumlah, setEditJumlah] = useState(1);
  const [editKeterangan, setEditKeterangan] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Auto-generate transaction ID
  const generateTxId = () => {
    const lastIdNum = borrowings
      .map(b => {
        const parts = b.id.split('-');
        return parts.length > 1 ? parseInt(parts[1]) : 0;
      })
      .sort((a, b) => b - a)[0] || 0;
    return `TR-${String(lastIdNum + 1).padStart(3, '0')}`;
  };

  const handleCreateBorrowing = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!selectedMemberId) {
      setFormError('Silakan pilih Anggota Perpustakaan!');
      return;
    }
    if (!selectedBookCode) {
      setFormError('Silakan pilih Buku yang akan dipinjam!');
      return;
    }

    const memberObj = members.find(m => m.nomorAnggota === selectedMemberId);
    const bookObj = books.find(b => b.kodeBuku === selectedBookCode);

    if (!memberObj) {
      setFormError('Anggota tidak valid!');
      return;
    }
    if (!bookObj) {
      setFormError('Buku tidak valid!');
      return;
    }

    if (memberObj.status !== 'Aktif') {
      setFormError('Anggota berstatus Tidak Aktif, tidak diizinkan meminjam buku!');
      return;
    }

    if (bookObj.stock < jumlahPinjam) {
      setFormError(`Stok buku tidak mencukupi! Hanya tersedia ${bookObj.stock} buku.`);
      return;
    }

    const newTx: Borrowing = {
      id: generateTxId(),
      nomorAnggota: memberObj.nomorAnggota,
      namaAnggota: memberObj.nama,
      kelasAnggota: memberObj.kelas,
      kodeBuku: bookObj.kodeBuku,
      judulBuku: bookObj.judul,
      tanggalPinjam: tanggalPinjam,
      tanggalHarusKembali: tanggalHarusKembali,
      status: 'Dipinjam',
      jumlah: jumlahPinjam,
      keterangan: keterangan.trim() || undefined
    };

    const error = onAddBorrowing(newTx);
    if (error) {
      setFormError(error);
    } else {
      setFormSuccess(`Sukses! Buku "${bookObj.judul}" dipinjam oleh ${memberObj.nama}.`);
      setSelectedMemberId('');
      setMemberSearchQuery('');
      setSelectedBookCode('');
      setBookSearchQuery('');
      setJumlahPinjam(1);
      setKeterangan('');
      setTanggalPinjam(today);
      setTanggalHarusKembali(nextWeek);
      setTimeout(() => setFormSuccess(''), 4000);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (b: Borrowing) => {
    setEditingBorrowing(b);
    setEditTanggalPinjam(b.tanggalPinjam);
    setEditTanggalHarusKembali(b.tanggalHarusKembali);
    setEditStatus(b.status);
    setEditJumlah(b.jumlah || 1);
    setEditKeterangan(b.keterangan || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBorrowing) return;

    const updated: Borrowing = {
      ...editingBorrowing,
      tanggalPinjam: editTanggalPinjam,
      tanggalHarusKembali: editTanggalHarusKembali,
      status: editStatus,
      jumlah: editJumlah,
      keterangan: editKeterangan.trim() || undefined,
      tanggalKembali: editStatus === 'Kembali' ? today : undefined
    };

    onEditBorrowing(updated);
    setIsEditModalOpen(false);
  };

  // Filter listings
  const filteredBorrowings = borrowings.filter(b => {
    const matchesSearch = b.namaAnggota.toLowerCase().includes(search.toLowerCase()) || 
                          b.judulBuku.toLowerCase().includes(search.toLowerCase()) ||
                          b.nomorAnggota.toLowerCase().includes(search.toLowerCase()) ||
                          b.kodeBuku.toLowerCase().includes(search.toLowerCase()) ||
                          b.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Only show active members for checkout
  const activeMembers = members.filter(m => m.status === 'Aktif');

  // Filter active members based on manual search query
  const filteredActiveMembers = activeMembers.filter(m => {
    const selectedM = activeMembers.find(am => am.nomorAnggota === selectedMemberId);
    const selectedDisplay = selectedM 
      ? `[${selectedM.nomorAnggota}] ${selectedM.nama} - ${selectedM.kelas === 'Guru' ? 'Guru' : `Kelas ${selectedM.kelas}`}`
      : '';
    
    // If the search query is exactly matching the selected member display, we show all members on focus
    if (selectedMemberId && memberSearchQuery === selectedDisplay) {
      return true;
    }

    const query = memberSearchQuery.toLowerCase();
    const displayString = `[${m.nomorAnggota}] ${m.nama} - ${m.kelas === 'Guru' ? 'Guru' : `Kelas ${m.kelas}`}`.toLowerCase();
    return m.nama.toLowerCase().includes(query) || 
           m.nomorAnggota.toLowerCase().includes(query) ||
           (m.kelas === 'Guru' ? 'guru' : `kelas ${m.kelas}`).toLowerCase().includes(query) ||
           displayString.includes(query);
  });
  // Only show books with stock > 0 for selection
  const availableBooks = books.filter(b => b.stock > 0);

  // Filter available books based on manual search query
  const filteredAvailableBooks = availableBooks.filter(b => {
    const selectedB = availableBooks.find(ab => ab.kodeBuku === selectedBookCode);
    const selectedDisplay = selectedB
      ? `[${selectedB.kodeBuku}] ${selectedB.judul} - Kategori: ${selectedB.kategori} (Stok: ${selectedB.stock})`
      : '';
    
    // If the search query is exactly matching the selected book display, we show all books on focus
    if (selectedBookCode && bookSearchQuery === selectedDisplay) {
      return true;
    }

    const query = bookSearchQuery.toLowerCase();
    const displayString = `[${b.kodeBuku}] ${b.judul} - Kategori: ${b.kategori} (Stok: ${b.stock})`.toLowerCase();
    return b.judul.toLowerCase().includes(query) ||
           b.kodeBuku.toLowerCase().includes(query) ||
           b.kategori.toLowerCase().includes(query) ||
           displayString.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-100 tracking-tight font-sans">
            TRANSAKSI PEMINJAMAN BUKU
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            Formulir peminjaman buku perpustakaan untuk anggota dan monitoring status pinjam.
          </p>
        </div>

        <button
          onClick={() => downloadBorrowingsPDF(filteredBorrowings)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 text-amber-400 transition-all cursor-pointer self-stretch sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Cetak Laporan PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Register New Loan */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800/80 pb-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100 font-sans">Isi Formulir Peminjaman</h3>
          </div>

          <form onSubmit={handleCreateBorrowing} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-green-950/40 border border-green-500/20 text-green-300 rounded-xl text-xs flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Select Member (Pencarian Manual) */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Cari / Pilih Anggota</span>
              </label>
              <div className="relative">
                <input
                  id="member-search-input"
                  type="text"
                  placeholder="Ketik nama / nomor anggota..."
                  value={memberSearchQuery}
                  onChange={(e) => {
                    setMemberSearchQuery(e.target.value);
                    setIsMemberDropdownOpen(true);
                    // If they clear the text completely, clear selection
                    if (e.target.value === '') {
                      setSelectedMemberId('');
                    }
                  }}
                  onFocus={() => setIsMemberDropdownOpen(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setIsMemberDropdownOpen(false);
                    }, 200);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl pl-3 pr-10 py-2.5 text-xs outline-none transition-all placeholder:text-zinc-600"
                />
                {selectedMemberId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMemberId('');
                      setMemberSearchQuery('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    title="Bersihkan pilihan"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Suggestions dropdown */}
              {isMemberDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 max-h-56 overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl divide-y divide-zinc-900 scrollbar-thin scrollbar-thumb-zinc-800">
                  {filteredActiveMembers.length > 0 ? (
                    filteredActiveMembers.map(m => (
                      <button
                        key={m.nomorAnggota}
                        type="button"
                        onMouseDown={() => {
                          setSelectedMemberId(m.nomorAnggota);
                          setMemberSearchQuery(`[${m.nomorAnggota}] ${m.nama} - ${m.kelas === 'Guru' ? 'Guru' : `Kelas ${m.kelas}`}`);
                          setIsMemberDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors hover:bg-zinc-900 cursor-pointer flex justify-between items-center ${
                          selectedMemberId === m.nomorAnggota ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-zinc-300'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="font-mono text-[10px] text-zinc-500 mr-1.5 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded">
                            {m.nomorAnggota}
                          </span>
                          <span className="font-medium text-zinc-200">{m.nama}</span>
                        </div>
                        <span className="text-[9px] shrink-0 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                          {m.kelas === 'Guru' ? 'Guru' : `Kelas ${m.kelas}`}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3.5 py-3 text-xs text-zinc-500 italic">
                      Tidak ada anggota aktif ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Select Book */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>Cari / Pilih Buku</span>
              </label>
              <div className="relative">
                <input
                  id="book-search-input"
                  type="text"
                  placeholder="Ketik judul / kode / kategori buku..."
                  value={bookSearchQuery}
                  onChange={(e) => {
                    setBookSearchQuery(e.target.value);
                    setIsBookDropdownOpen(true);
                    if (e.target.value === '') {
                      setSelectedBookCode('');
                    }
                  }}
                  onFocus={() => setIsBookDropdownOpen(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setIsBookDropdownOpen(false);
                    }, 200);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl pl-3 pr-10 py-2.5 text-xs outline-none transition-all placeholder:text-zinc-600"
                />
                {selectedBookCode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBookCode('');
                      setBookSearchQuery('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    title="Bersihkan pilihan"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Suggestions dropdown for Books */}
              {isBookDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 max-h-56 overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl divide-y divide-zinc-900 scrollbar-thin scrollbar-thumb-zinc-800">
                  {filteredAvailableBooks.length > 0 ? (
                    filteredAvailableBooks.map(b => (
                      <button
                        key={b.kodeBuku}
                        type="button"
                        onMouseDown={() => {
                          setSelectedBookCode(b.kodeBuku);
                          setBookSearchQuery(`[${b.kodeBuku}] ${b.judul} - Kategori: ${b.kategori} (Stok: ${b.stock})`);
                          setIsBookDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors hover:bg-zinc-900 cursor-pointer flex justify-between items-start gap-2 ${
                          selectedBookCode === b.kodeBuku ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-zinc-300'
                        }`}
                      >
                        <div className="truncate pr-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-mono text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded shrink-0">
                              {b.kodeBuku}
                            </span>
                            <span className="font-medium text-zinc-200 truncate">{b.judul}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            Kategori: <span className="text-zinc-400 font-medium">{b.kategori}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] shrink-0 px-1.5 py-0.5 rounded font-mono border ${
                          b.stock <= 2 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          Stok: {b.stock}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3.5 py-3 text-xs text-zinc-500 italic">
                      Tidak ada buku tersedia ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Jumlah & Keterangan Grid */}
            <div className="grid grid-cols-3 gap-3.5 pt-1">
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1">
                  <span>Jumlah Buku</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={books.find(b => b.kodeBuku === selectedBookCode)?.stock || 100}
                  value={jumlahPinjam}
                  onChange={(e) => setJumlahPinjam(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-2.5 py-2.5 text-xs outline-none font-mono"
                  required
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1">
                  <span>Keterangan</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Untuk tugas kelas..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-2.5 py-2.5 text-xs outline-none placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Tgl Pinjam</span>
                </label>
                <input
                  type="date"
                  value={tanggalPinjam}
                  onChange={(e) => setTanggalPinjam(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-2.5 py-2 text-xs outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Harus Kembali</span>
                </label>
                <input
                  type="date"
                  value={tanggalHarusKembali}
                  onChange={(e) => setTanggalHarusKembali(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-2.5 py-2 text-xs outline-none font-mono"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-bold py-3 px-4 rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer pt-3 mt-4"
            >
              <Plus className="w-4 h-4 text-zinc-950" />
              <span>Daftarkan Peminjaman</span>
            </button>
          </form>
        </div>

        {/* Right Column: Loans Logs List */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 font-sans">Riwayat & Daftar Peminjaman</h3>
            
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-600">
                  <Search className="w-3 h-3" />
                </span>
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-lg pl-8 pr-3 py-1.5 text-[11px] placeholder-zinc-700 outline-none w-44"
                />
              </div>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1 text-[11px] outline-none cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="Dipinjam">Dipinjam</option>
                <option value="Kembali">Kembali</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-950/60 p-2">
                <tr>
                  <th className="px-3 py-2.5">ID</th>
                  <th className="px-3 py-2.5">Nama Anggota</th>
                  <th className="px-3 py-2.5">Judul Buku</th>
                  <th className="px-3 py-2.5 text-center">Jumlah</th>
                  <th className="px-3 py-2.5">Tgl Pinjam</th>
                  <th className="px-3 py-2.5">Harus Kembali</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredBorrowings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-zinc-600">
                      Tidak ada catatan peminjaman ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredBorrowings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-800/15 transition-colors">
                      <td className="px-3 py-3 font-mono font-bold text-amber-500">{b.id}</td>
                      <td className="px-3 py-3 font-semibold text-zinc-200">
                        {b.namaAnggota} <span className="text-[10px] text-zinc-500">({b.kelasAnggota})</span>
                      </td>
                      <td className="px-3 py-3 text-zinc-300 max-w-[150px]" title={b.judulBuku}>
                        <div className="truncate">{b.judulBuku}</div>
                        {b.keterangan && (
                          <div className="text-[10px] text-zinc-500 italic truncate mt-0.5" title={b.keterangan}>
                            Ket: {b.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-mono bg-zinc-950 border border-zinc-850 px-1.5 py-0.5 rounded text-zinc-300 text-[10px] font-bold">
                          {b.jumlah || 1}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-zinc-400">{b.tanggalPinjam}</td>
                      <td className="px-3 py-3 font-mono text-[11px] text-zinc-400">{b.tanggalHarusKembali}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                          b.status === 'Dipinjam'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1 rounded bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-amber-500 hover:text-amber-400 transition-all cursor-pointer"
                            title="Edit Data Pinjam"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(b.id)}
                            className="p-1 rounded bg-zinc-950 border border-zinc-800 hover:border-red-500/40 text-red-500 hover:text-red-400 transition-all cursor-pointer"
                            title="Hapus Transaksi Pinjam"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Loan Date/Status Modal */}
      {isEditModalOpen && editingBorrowing && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-zinc-100 font-sans">Edit Informasi Peminjaman</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div className="text-xs bg-zinc-950 p-3.5 rounded-xl space-y-1.5 border border-zinc-850">
                <div className="flex justify-between"><span className="text-zinc-500">ID Transaksi:</span> <span className="font-mono text-amber-400 font-bold">{editingBorrowing.id}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Peminjam:</span> <span className="text-zinc-200 font-semibold">{editingBorrowing.namaAnggota}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Buku:</span> <span className="text-zinc-200 font-semibold truncate max-w-[200px]">{editingBorrowing.judulBuku}</span></div>
              </div>

              {/* Edit Dates */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">Tanggal Pinjam</label>
                <input
                  type="date"
                  value={editTanggalPinjam}
                  onChange={(e) => setEditTanggalPinjam(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">Tanggal Harus Kembali</label>
                <input
                  type="date"
                  value={editTanggalHarusKembali}
                  onChange={(e) => setEditTanggalHarusKembali(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none font-mono"
                  required
                />
              </div>

              {/* Edit Jumlah & Keterangan */}
              <div className="grid grid-cols-3 gap-3.5">
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={editJumlah}
                    onChange={(e) => setEditJumlah(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none font-mono"
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">Keterangan</label>
                  <input
                    type="text"
                    value={editKeterangan}
                    onChange={(e) => setEditKeterangan(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none placeholder:text-zinc-700"
                    placeholder="Catatan..."
                  />
                </div>
              </div>

              {/* Edit Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'Dipinjam' | 'Kembali')}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
                >
                  <option value="Dipinjam">Dipinjam (Aktif)</option>
                  <option value="Kembali">Kembali (Selesai)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 py-2 rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-bold py-2 rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-red-500">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-zinc-100 font-sans">
                Konfirmasi Hapus Transaksi
              </h3>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus Transaksi Peminjaman dengan ID: <span className="font-mono text-amber-400 font-bold">{deleteConfirmId}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-300 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBorrowing(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-red-500/10 transition-colors cursor-pointer"
              >
                Hapus Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
