import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Download, 
  Filter, 
  X, 
  Sparkles,
  BookMarked,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { Book, BookCategory } from '../types';
import { BOOK_CATEGORIES } from '../data/mockData';
import { downloadBooksPDF } from '../utils/pdfGenerator';

interface DataBukuProps {
  books: Book[];
  onAddBook: (book: Book) => void;
  onEditBook: (book: Book, oldKodeBuku?: string) => void;
  onDeleteBook: (kodeBuku: string) => void;
}

// Preset library covers that match the categories for easy and beautiful selection!
const PRESET_COVERS = [
  { name: 'Sastra & Novel', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400' },
  { name: 'Sains & Alam', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400' },
  { name: 'Sejarah & Budaya', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=400' },
  { name: 'Kamus & Ensiklopedia', url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400' },
  { name: 'Pelajaran & Umum', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400' },
  { name: 'Dongeng & Komik', url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400' },
];

export default function DataBuku({ 
  books, 
  onAddBook, 
  onEditBook, 
  onDeleteBook 
}: DataBukuProps) {
  // Search & Filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteConfirmBook, setDeleteConfirmBook] = useState<string | null>(null);

  // Form Fields
  const [formKode, setFormKode] = useState('');
  const [formKategori, setFormKategori] = useState<BookCategory>('Novel');
  const [formJudul, setFormJudul] = useState('');
  const [formPengarang, setFormPengarang] = useState('');
  const [formPenerbit, setFormPenerbit] = useState('');
  const [formTahun, setFormTahun] = useState('');
  const [formIsbn, setFormIsbn] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formStock, setFormStock] = useState<number>(1);
  const [formCover, setFormCover] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar!');
      return;
    }
    // Limit file size to 3MB just in case
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Ukuran file gambar maksimal 3MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedCoverUrl(event.target.result as string);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setEditingBook(null);
    // Auto-generate book code
    const lastId = books
      .filter(b => b.kodeBuku.startsWith('B'))
      .map(b => parseInt(b.kodeBuku.substring(1)))
      .sort((a, b) => b - a)[0] || 0;
    const nextId = 'B' + String(lastId + 1).padStart(3, '0');

    setFormKode(nextId);
    setFormKategori('Novel');
    setFormJudul('');
    setFormPengarang('');
    setFormPenerbit('');
    setFormTahun(new Date().getFullYear().toString());
    setFormIsbn('');
    setFormDeskripsi('');
    setFormStock(1);
    setFormCover(PRESET_COVERS[0].url);
    setCustomCoverUrl('');
    setUploadedCoverUrl('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setFormKode(book.kodeBuku);
    setFormKategori(book.kategori);
    setFormJudul(book.judul);
    setFormPengarang(book.pengarang);
    setFormPenerbit(book.penerbit);
    setFormTahun(book.tahunTerbit);
    setFormIsbn(book.isbn);
    setFormDeskripsi(book.deskripsi);
    setFormStock(book.stock);
    
    // Check if cover is part of presets, otherwise set as custom/upload
    const isPreset = PRESET_COVERS.some(c => c.url === book.fotoSampul);
    if (isPreset) {
      setFormCover(book.fotoSampul);
      setCustomCoverUrl('');
      setUploadedCoverUrl('');
    } else {
      if (book.fotoSampul.startsWith('data:image/')) {
        setFormCover('upload');
        setUploadedCoverUrl(book.fotoSampul);
        setCustomCoverUrl('');
      } else {
        setFormCover('custom');
        setCustomCoverUrl(book.fotoSampul);
        setUploadedCoverUrl('');
      }
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formKode.trim()) {
      setErrorMsg('Kode Buku tidak boleh kosong!');
      return;
    }

    if (!formJudul.trim() || !formPengarang.trim() || !formPenerbit.trim()) {
      setErrorMsg('Harap lengkapi Judul, Pengarang, dan Penerbit!');
      return;
    }

    let finalCover = formCover;
    if (formCover === 'custom') {
      finalCover = customCoverUrl.trim() || PRESET_COVERS[0].url;
    } else if (formCover === 'upload') {
      finalCover = uploadedCoverUrl || PRESET_COVERS[0].url;
    }

    const bookData: Book = {
      kodeBuku: formKode.trim(),
      kategori: formKategori,
      judul: formJudul.trim(),
      pengarang: formPengarang.trim(),
      penerbit: formPenerbit.trim(),
      tahunTerbit: formTahun.trim(),
      isbn: formIsbn.trim() || 'No ISBN',
      deskripsi: formDeskripsi.trim() || 'Tidak ada deskripsi.',
      stock: Number(formStock),
      fotoSampul: finalCover
    };

    if (editingBook) {
      if (bookData.kodeBuku !== editingBook.kodeBuku) {
        if (books.some(b => b.kodeBuku === bookData.kodeBuku)) {
          setErrorMsg('Kode Buku sudah digunakan oleh buku lain!');
          return;
        }
      }
      onEditBook(bookData, editingBook.kodeBuku);
    } else {
      if (books.some(b => b.kodeBuku === bookData.kodeBuku)) {
        setErrorMsg('Kode Buku sudah terdaftar! Gunakan kode lain.');
        return;
      }
      onAddBook(bookData);
    }

    setIsModalOpen(false);
  };

  const handleDeleteClick = (kodeBuku: string) => {
    setDeleteConfirmBook(kodeBuku);
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.judul.toLowerCase().includes(search.toLowerCase()) || 
                          book.pengarang.toLowerCase().includes(search.toLowerCase()) ||
                          book.kodeBuku.toLowerCase().includes(search.toLowerCase()) ||
                          book.isbn.includes(search);
    const matchesCat = categoryFilter === 'Semua' || book.kategori === categoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Title Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-100 tracking-tight font-sans">
            DATA BUKU PERPUSTAKAAN
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            Kelola seluruh koleksi buku, novel, kamus, ensiklopedia, dan buku pelajaran sekolah.
          </p>
        </div>

        <div className="flex gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={() => downloadBooksPDF(filteredBooks)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 text-amber-400 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 hover:brightness-110 shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Buku Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-600">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari Kode, Judul, Pengarang, atau ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl py-2 pl-10 pr-4 text-xs placeholder-zinc-700 outline-none transition-colors"
          />
        </div>

        {/* Category select */}
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 min-w-[170px]">
          <Filter className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-xs text-zinc-300 outline-none w-full border-none cursor-pointer"
          >
            <option value="Semua" className="bg-zinc-950 text-zinc-300">Semua Kategori</option>
            {BOOK_CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-zinc-950 text-zinc-300">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Books */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredBooks.length === 0 ? (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-600">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p className="text-sm font-semibold">Tidak ada koleksi buku yang cocok.</p>
            <p className="text-xs text-zinc-600 mt-1">Ubah kata kunci pencarian atau bersihkan filter kategori Anda.</p>
          </div>
        ) : (
          filteredBooks.map((book) => (
            <div 
              key={book.kodeBuku}
              className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/25 rounded-2xl p-5 shadow-xl transition-all relative flex gap-4 group"
            >
              {/* Cover Art Image */}
              <div className="w-24 h-36 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shrink-0 shadow-md relative">
                <img 
                  src={book.fotoSampul} 
                  alt={book.judul} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-zinc-950/80 text-amber-400 border border-amber-500/20">
                  {book.kodeBuku}
                </span>
              </div>

              {/* Book Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-amber-500/85 uppercase font-bold tracking-wider">
                    {book.kategori}
                  </span>
                  <h3 className="text-sm font-extrabold text-zinc-100 font-sans tracking-tight line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors" title={book.judul}>
                    {book.judul}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate">Oleh: {book.pengarang}</p>
                  <p className="text-[10px] text-zinc-500 truncate">ISBN: {book.isbn}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 mt-2">
                  <div className="text-left">
                    <span className="text-[9px] text-zinc-500 block">Stok Buku:</span>
                    <span className={`text-xs font-bold font-mono ${book.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {book.stock} eks
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(book)}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-amber-500 hover:text-amber-400 transition-all cursor-pointer"
                      title="Edit Buku & Stok"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(book.kodeBuku)}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-red-500/40 text-red-500 hover:text-red-400 transition-all cursor-pointer"
                      title="Hapus Buku"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl my-8">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-zinc-100 font-sans">
                  {editingBook ? 'Edit Data Koleksi Buku' : 'Tambah Koleksi Buku Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kode */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                      Kode Buku
                    </label>
                    <span className="text-[9px] text-amber-500/80 font-mono">
                      {editingBook ? 'Dapat Diubah' : 'Otomatis / Custom'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    placeholder="Contoh: B001"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none transition-colors font-mono font-bold"
                    required
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    Kategori Buku
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as BookCategory)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none transition-colors cursor-pointer"
                  >
                    {BOOK_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Judul */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                  Judul Buku
                </label>
                <input
                  type="text"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Masukkan judul buku"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pengarang */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    Pengarang (Penulis)
                  </label>
                  <input
                    type="text"
                    value={formPengarang}
                    onChange={(e) => setFormPengarang(e.target.value)}
                    placeholder="Nama pengarang"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                    required
                  />
                </div>

                {/* Penerbit */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    Penerbit
                  </label>
                  <input
                    type="text"
                    value={formPenerbit}
                    onChange={(e) => setFormPenerbit(e.target.value)}
                    placeholder="Nama penerbit"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tahun Terbit */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    Tahun Terbit
                  </label>
                  <input
                    type="text"
                    value={formTahun}
                    onChange={(e) => setFormTahun(e.target.value)}
                    placeholder="Contoh: 2021"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none transition-colors font-mono"
                  />
                </div>

                {/* ISBN */}
                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={formIsbn}
                    onChange={(e) => setFormIsbn(e.target.value)}
                    placeholder="978-602-..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    Jumlah Stok
                  </label>
                  <input
                    type="number"
                    value={formStock}
                    min={0}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none transition-colors font-mono"
                    required
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                  Deskripsi / Sinopsis Buku
                </label>
                <textarea
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Ketik deskripsi singkat mengenai isi buku ini..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl p-3 text-xs outline-none transition-colors resize-none"
                />
              </div>

              {/* Foto Sampul Buku Section */}
              <div className="space-y-3.5 border-t border-zinc-850 pt-3">
                <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Foto Sampul Buku</span>
                </div>

                 {/* Preset Options Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_COVERS.map((cov, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormCover(cov.url)}
                      className={`relative rounded-xl border p-1 text-left transition-all overflow-hidden h-14 bg-zinc-950/60 ${
                        formCover === cov.url 
                          ? 'border-amber-500 ring-1 ring-amber-500' 
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 h-full">
                        <img src={cov.url} className="w-7 h-10 object-cover rounded shadow shrink-0" referrerPolicy="no-referrer" />
                        <span className="text-[8px] text-zinc-400 line-clamp-2 leading-tight">{cov.name}</span>
                      </div>
                    </button>
                  ))}
                  
                  {/* Custom URL selection */}
                  <button
                    type="button"
                    onClick={() => setFormCover('custom')}
                    className={`relative rounded-xl border p-2 text-left transition-all h-14 flex items-center justify-center bg-zinc-950/60 ${
                      formCover === 'custom' 
                        ? 'border-amber-500 ring-1 ring-amber-500' 
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-amber-400">Gunakan URL Custom</span>
                  </button>

                  {/* Upload File selection */}
                  <button
                    type="button"
                    onClick={() => setFormCover('upload')}
                    className={`relative rounded-xl border p-2 text-left transition-all h-14 flex items-center justify-center bg-zinc-950/60 ${
                      formCover === 'upload' 
                        ? 'border-amber-500 ring-1 ring-amber-500' 
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-amber-400">Upload dari Komputer</span>
                  </button>
                </div>

                {/* Custom input URL if selected */}
                {formCover === 'custom' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[9px] font-mono text-zinc-500">
                      Masukkan URL Gambar Online / Foto Sampul
                    </label>
                    <input
                      type="url"
                      value={customCoverUrl}
                      onChange={(e) => setCustomCoverUrl(e.target.value)}
                      placeholder="https://example.com/gambar-buku.jpg"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2 text-xs outline-none transition-colors font-mono"
                    />
                  </div>
                )}

                {/* Upload File area if selected */}
                {formCover === 'upload' && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-[9px] font-mono text-zinc-500 block">
                      Pilih File Cover dari Komputer (PNG, JPG, JPEG)
                    </label>
                    <div 
                      className="border-2 border-dashed border-zinc-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-zinc-950/40 text-center transition-colors cursor-pointer relative"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          handleFileChange(file);
                        }
                      }}
                      onClick={() => document.getElementById('cover-file-input')?.click()}
                    >
                      <input
                        id="cover-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileChange(file);
                          }
                        }}
                      />
                      
                      {uploadedCoverUrl ? (
                        <div className="flex items-center gap-3 w-full">
                          <img 
                            src={uploadedCoverUrl} 
                            alt="Preview Upload" 
                            className="w-12 h-16 object-cover rounded-lg border border-zinc-800 shrink-0 animate-fade-in" 
                          />
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-xs font-bold text-emerald-400">File berhasil dimuat</p>
                            <p className="text-[10px] text-zinc-500 truncate">Klik atau seret file lain untuk mengganti</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-amber-500" />
                          <div>
                            <p className="text-xs font-semibold text-zinc-300">Klik atau Seret file ke sini</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">Maksimum ukuran gambar disarankan di bawah 3MB</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-bold py-2.5 rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                  <span>{editingBook ? 'Simpan Perubahan' : 'Simpan Koleksi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBook && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-red-500">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-zinc-100 font-sans">
                Konfirmasi Hapus Buku
              </h3>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus Buku dengan Kode: <span className="font-mono text-amber-400 font-bold">{deleteConfirmBook}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBook(null)}
                className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-300 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBook(deleteConfirmBook);
                  setDeleteConfirmBook(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-red-500/10 transition-colors cursor-pointer"
              >
                Hapus Buku
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
