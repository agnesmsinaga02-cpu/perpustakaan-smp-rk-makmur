import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Download, 
  Calendar, 
  Clock, 
  Activity, 
  UserPlus, 
  Sparkles,
  XCircle,
  X
} from 'lucide-react';
import { Visitor, Member } from '../types';
import { CLASSES_LIST } from '../data/mockData';
import { downloadVisitorsPDF } from '../utils/pdfGenerator';

interface DataKunjunganProps {
  visitors: Visitor[];
  members?: Member[];
  onAddVisitor: (visitor: Visitor) => void;
  onDeleteVisitor: (id: string) => void;
}

const VISIT_PURPOSES = [
  'Membaca Buku',
  'Meminjam Buku',
  'Mengembalikan Buku',
  'Mengerjakan Tugas',
  'Mencari Referensi',
  'Belajar',
  'Diskusi',
  'Umum / Lainnya'
];

export default function DataKunjungan({ visitors, members = [], onAddVisitor, onDeleteVisitor }: DataKunjunganProps) {
  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('Semua');
  const [deleteConfirmVisitor, setDeleteConfirmVisitor] = useState<{ id: string; name: string } | null>(null);

  // Visitor Form States
  const [formNama, setFormNama] = useState('');
  const [formKelas, setFormKelas] = useState('7.1');
  const [formTujuan, setFormTujuan] = useState('Membaca Buku');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Member Search State
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Filter active registered members for quick visitor logging
  const activeMembers = members.filter(m => m.status === 'Aktif');
  const filteredMembers = activeMembers.filter(m => {
    const query = formNama.toLowerCase().trim();
    if (!query) return true;
    const displayString = `[${m.nomorAnggota}] ${m.nama} - ${m.kelas === 'Guru' ? 'Guru' : `Kelas ${m.kelas}`}`.toLowerCase();
    return m.nama.toLowerCase().includes(query) ||
           m.nomorAnggota.toLowerCase().includes(query) ||
           (m.kelas === 'Guru' ? 'guru' : `kelas ${m.kelas}`).toLowerCase().includes(query) ||
           displayString.includes(query);
  });

  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formNama.trim()) {
      setFormError('Nama Pengunjung tidak boleh kosong!');
      return;
    }

    // Auto timestamp formatted: YYYY-MM-DD HH:MM
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10);
    const timePart = now.toTimeString().slice(0, 5);
    const formattedTimestamp = `${datePart} ${timePart}`;

    const newVisitor: Visitor = {
      id: `V-${Date.now()}`,
      nama: formNama.trim(),
      tujuan: formFormulatePurpose(),
      tanggal: formattedTimestamp,
      kelas: formKelas
    };

    onAddVisitor(newVisitor);
    setFormSuccess(`Kunjungan "${newVisitor.nama}" berhasil dicatat!`);
    setFormNama('');
    setSelectedMemberId(null);
    setFormKelas('7.1');
    setFormTujuan('Membaca Buku');
    
    setTimeout(() => setFormSuccess(''), 4000);
  };

  const formFormulatePurpose = () => {
    return formTujuan;
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirmVisitor({ id, name });
  };

  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = v.nama.toLowerCase().includes(search.toLowerCase()) || 
                          v.tujuan.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === 'Semua' || v.kelas === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-100 tracking-tight font-sans">
            BUKU TAMU / DATA KUNJUNGAN
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            Registrasi kedatangan harian siswa dan guru untuk monitoring aktivitas pemakaian perpustakaan.
          </p>
        </div>

        <button
          onClick={() => downloadVisitorsPDF(filteredVisitors)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 text-amber-400 transition-all cursor-pointer self-stretch sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Cetak Buku Tamu PDF</span>
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Fast Logger Guest */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800/80 pb-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100 font-sans">Catat Kedatangan Pengunjung</h3>
          </div>

          <form onSubmit={handleCreateVisitor} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-green-950/40 border border-green-500/20 text-green-300 rounded-xl text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Nama Pengunjung (Pencarian Manual & Dropdown Anggota Terdaftar) */}
            <div className="space-y-1 relative">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                  Nama Pengunjung
                </label>
                <span className="text-[9px] text-amber-500/80 font-mono">
                  Pilih Anggota / Ketik Manual
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => {
                    setFormNama(e.target.value);
                    setIsMemberDropdownOpen(true);
                    setSelectedMemberId(null);
                  }}
                  onFocus={() => setIsMemberDropdownOpen(true)}
                  onBlur={() => {
                    setTimeout(() => setIsMemberDropdownOpen(false), 200);
                  }}
                  placeholder="Ketik nama / cari anggota terdaftar..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl pl-3.5 pr-9 py-2.5 text-xs outline-none transition-colors placeholder:text-zinc-600"
                  required
                />
                {formNama ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFormNama('');
                      setSelectedMemberId(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    title="Bersihkan"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown for Registered Members */}
              {isMemberDropdownOpen && activeMembers.length > 0 && (
                <div className="absolute z-30 w-full mt-1 max-h-52 overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl divide-y divide-zinc-900 scrollbar-thin scrollbar-thumb-zinc-800">
                  <div className="px-3 py-1.5 text-[9px] font-mono text-zinc-500 bg-zinc-900/80 uppercase flex justify-between items-center sticky top-0 z-10 backdrop-blur-xs">
                    <span>Anggota Terdaftar ({filteredMembers.length})</span>
                    <span className="text-zinc-600">Klik untuk memilih</span>
                  </div>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((m) => (
                      <button
                        key={m.nomorAnggota}
                        type="button"
                        onMouseDown={() => {
                          setFormNama(m.nama);
                          setFormKelas(m.kelas);
                          setSelectedMemberId(m.nomorAnggota);
                          setIsMemberDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors hover:bg-zinc-900 cursor-pointer flex justify-between items-center ${
                          selectedMemberId === m.nomorAnggota ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-zinc-300'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="font-mono text-[9px] text-zinc-500 mr-1.5 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded">
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
                    <div className="px-3.5 py-2.5 text-xs text-zinc-500 italic">
                      Tidak ditemukan anggota terdaftar (Bisa lanjut ketik manual)
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Kelas / Kategori */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                Kelas / Jabatan
              </label>
              <select
                value={formKelas}
                onChange={(e) => setFormKelas(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors cursor-pointer"
              >
                {CLASSES_LIST.map(cls => (
                  <option key={cls} value={cls}>{cls === 'Guru' ? 'Guru' : `Kelas ${cls}`}</option>
                ))}
              </select>
            </div>

            {/* Tujuan */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                Tujuan Kunjungan
              </label>
              <select
                value={formTujuan}
                onChange={(e) => setFormTujuan(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors cursor-pointer"
              >
                {VISIT_PURPOSES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Simulated Live timestamp */}
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-[11px] text-zinc-500 flex justify-between items-center font-mono">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-500/50" /> Tanggal Otomatis</span>
              <span className="text-zinc-400 font-bold">Hari Ini (Waktu Sistem)</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-bold py-3 rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4 text-zinc-950" />
              <span>Simpan Kunjungan</span>
            </button>
          </form>
        </div>

        {/* Right Table: Guest Books Logs */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          
          {/* Header filters */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100 font-sans">Log Daftar Pengunjung</h3>
            </div>

            <div className="flex gap-2">
              {/* Search log */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-600">
                  <Search className="w-3 h-3" />
                </span>
                <input
                  type="text"
                  placeholder="Cari pengunjung..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-lg pl-8 pr-3 py-1.5 text-[11px] placeholder-zinc-700 outline-none w-40"
                />
              </div>

              {/* Class log filter */}
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1.5 text-[11px] outline-none cursor-pointer"
              >
                <option value="Semua">Semua Kelas</option>
                {CLASSES_LIST.map(cls => (
                  <option key={cls} value={cls}>{cls === 'Guru' ? 'Guru' : `Kelas ${cls}`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-950/40">
                <tr>
                  <th className="px-3 py-2.5">Waktu Kunjungan</th>
                  <th className="px-3 py-2.5">Nama Pengunjung</th>
                  <th className="px-3 py-2.5">Kelas</th>
                  <th className="px-3 py-2.5">Tujuan Kunjungan</th>
                  <th className="px-3 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-zinc-600">
                      Belum ada catatan kunjungan hari ini.
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="px-3 py-3 font-mono text-[11px] text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-500/40" />
                        <span>{visitor.tanggal}</span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-zinc-200">
                        {visitor.nama}
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-400">
                          {visitor.kelas === 'Guru' ? 'Guru' : `Kelas ${visitor.kelas}`}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {visitor.tujuan}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => handleDeleteClick(visitor.id, visitor.nama)}
                          className="p-1 rounded bg-zinc-950 border border-zinc-800 hover:border-red-500/40 text-red-500 hover:text-red-400 transition-all cursor-pointer"
                          title="Hapus Kunjungan"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-2 bg-zinc-950 rounded-xl text-[10px] text-zinc-500 font-mono text-center">
            Total tercatat: <span className="text-amber-400 font-bold">{filteredVisitors.length}</span> kunjungan terdaftar dalam filter ini.
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmVisitor && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-red-500">
              <X className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-zinc-100 font-sans">
                Konfirmasi Hapus Kunjungan
              </h3>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan kunjungan atas nama <span className="text-amber-400 font-bold">{deleteConfirmVisitor.name}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmVisitor(null)}
                className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-300 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteVisitor(deleteConfirmVisitor.id);
                  setDeleteConfirmVisitor(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-red-500/10 transition-colors cursor-pointer"
              >
                Hapus Kunjungan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
