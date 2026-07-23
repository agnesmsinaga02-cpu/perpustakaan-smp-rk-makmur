import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Download, 
  Filter, 
  X, 
  CheckCircle, 
  XCircle,
  Sparkles,
  UserPlus,
  ListPlus,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Table,
  RotateCcw,
  IdCard
} from 'lucide-react';
import { Member } from '../types';
import { CLASSES_LIST } from '../data/mockData';
import { downloadMembersPDF } from '../utils/pdfGenerator';

type SortOption = 
  | 'nomor-asc' 
  | 'nomor-desc' 
  | 'nama-asc' 
  | 'nama-desc' 
  | 'kelas-asc' 
  | 'kelas-desc' 
  | 'tanggal-desc' 
  | 'tanggal-asc';

interface DataAnggotaProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onEditMember: (member: Member, oldNomorAnggota?: string) => void;
  onDeleteMember: (nomorAnggota: string) => void;
}

export default function DataAnggota({ 
  members, 
  onAddMember, 
  onEditMember, 
  onDeleteMember 
}: DataAnggotaProps) {
  // Search, Filters & Sorting
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [sortBy, setSortBy] = useState<SortOption>('nomor-asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<string | null>(null);

  // Single Form Fields
  const [formNomor, setFormNomor] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formKelas, setFormKelas] = useState('7.1');
  const [formGender, setFormGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');

  // Bulk Form Fields
  const [bulkText, setBulkText] = useState('');
  const [bulkKelas, setBulkKelas] = useState('7.1');
  const [bulkDefaultGender, setBulkDefaultGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle open modal for new member
  const handleOpenAddModal = (mode: 'single' | 'bulk' = 'single') => {
    setEditingMember(null);
    setAddMode(mode);
    
    // Auto-generate a new ID based on current members
    const lastId = members
      .filter(m => m.nomorAnggota.startsWith('M'))
      .map(m => parseInt(m.nomorAnggota.substring(1)))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a)[0] || 0;
    const nextId = 'M' + String(lastId + 1).padStart(3, '0');
    
    setFormNomor(nextId);
    setFormNama('');
    setFormKelas('7.1');
    setFormGender('Laki-laki');
    setFormStatus('Aktif');
    
    setBulkText('');
    setBulkKelas('7.1');
    setBulkDefaultGender('Laki-laki');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Handle open modal for editing
  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setAddMode('single');
    setFormNomor(member.nomorAnggota);
    setFormNama(member.nama);
    setFormKelas(member.kelas);
    setFormGender(member.jenisKelamin);
    setFormStatus(member.status);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Single member submit handler
  const handleSingleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formNomor.trim()) {
      setErrorMsg('Nomor Anggota tidak boleh kosong!');
      return;
    }

    if (!formNama.trim()) {
      setErrorMsg('Nama Anggota tidak boleh kosong!');
      return;
    }

    const newMemberData: Member = {
      nomorAnggota: formNomor.trim(),
      nama: formNama.trim(),
      kelas: formKelas,
      jenisKelamin: formGender,
      status: formStatus,
      createdAt: editingMember ? editingMember.createdAt : new Date().toISOString().slice(0, 10)
    };

    if (editingMember) {
      const oldNomor = editingMember.nomorAnggota;
      // If user changed nomorAnggota, check if new number already exists in another member
      if (oldNomor !== newMemberData.nomorAnggota) {
        if (members.some(m => m.nomorAnggota === newMemberData.nomorAnggota)) {
          setErrorMsg(`Nomor Anggota "${newMemberData.nomorAnggota}" sudah digunakan oleh anggota lain!`);
          return;
        }
      }
      onEditMember(newMemberData, oldNomor);
    } else {
      // Add check duplicate
      if (members.some(m => m.nomorAnggota === newMemberData.nomorAnggota)) {
        setErrorMsg('Nomor Anggota sudah terdaftar! Gunakan nomor/kode lain.');
        return;
      }
      onAddMember(newMemberData);
    }

    setIsModalOpen(false);
  };

  // Bulk member submit handler
  const handleBulkFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      setErrorMsg('Masukkan minimal 1 data anggota!');
      return;
    }

    // Find current highest M ID as fallback
    let currentLastNum = members
      .filter(m => m.nomorAnggota.startsWith('M'))
      .map(m => parseInt(m.nomorAnggota.substring(1)))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a)[0] || 0;

    const todayStr = new Date().toISOString().slice(0, 10);
    const newMembersList: Member[] = [];

    for (const rawLine of lines) {
      let cleanedLine = rawLine.trim();

      // Remove numbered lists like "1. ", "2) "
      cleanedLine = cleanedLine.replace(/^\d+[\.\)]\s*/, '').trim();

      // Detect gender markers like (P), (L), (Perempuan), (Laki-laki)
      let gender: 'Laki-laki' | 'Perempuan' = bulkDefaultGender;
      if (/\((p|perempuan)\)/i.test(cleanedLine) || /\b(p|perempuan)$/i.test(cleanedLine)) {
        gender = 'Perempuan';
        cleanedLine = cleanedLine.replace(/\((p|perempuan)\)/i, '').replace(/\b(p|perempuan)$/i, '').trim();
      } else if (/\((l|laki|laki-laki)\)/i.test(cleanedLine) || /\b(l|laki|laki-laki)$/i.test(cleanedLine)) {
        gender = 'Laki-laki';
        cleanedLine = cleanedLine.replace(/\((l|laki|laki-laki)\)/i, '').replace(/\b(l|laki|laki-laki)$/i, '').trim();
      }

      if (!cleanedLine) continue;

      let memberId = '';
      let memberName = '';

      // Check if line contains custom School ID / Card Number prefix like "202607063 -Akazia Alberik Simangunsong"
      const hyphenOrColonMatch = cleanedLine.match(/^([A-Za-z0-9\/_\.\-]+?)\s*[\-:\t]\s*(.+)$/);
      const spaceSeparatedMatch = cleanedLine.match(/^([0-9]{3,15})\s+(.+)$/);

      if (hyphenOrColonMatch && hyphenOrColonMatch[1] && hyphenOrColonMatch[2]) {
        memberId = hyphenOrColonMatch[1].trim();
        memberName = hyphenOrColonMatch[2].trim();
      } else if (spaceSeparatedMatch && spaceSeparatedMatch[1] && spaceSeparatedMatch[2]) {
        memberId = spaceSeparatedMatch[1].trim();
        memberName = spaceSeparatedMatch[2].trim();
      } else {
        // Fallback: Auto generated ID
        currentLastNum++;
        memberId = 'M' + String(currentLastNum).padStart(3, '0');
        memberName = cleanedLine;
      }

      if (!memberName) continue;

      newMembersList.push({
        nomorAnggota: memberId,
        nama: memberName,
        kelas: bulkKelas,
        jenisKelamin: gender,
        status: 'Aktif',
        createdAt: todayStr
      });
    }

    if (newMembersList.length === 0) {
      setErrorMsg('Tidak ada data valid yang dapat diproses.');
      return;
    }

    // Add all members
    newMembersList.forEach(m => onAddMember(m));
    setIsModalOpen(false);
  };

  // Parsed line count for bulk mode preview
  const bulkLinesCount = bulkText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0).length;

  const handleDeleteClick = (nomorAnggota: string) => {
    setDeleteConfirmMember(nomorAnggota);
  };

  // Helper for numeric extraction for natural sorting (e.g. 202607063 vs 202607064, M001 vs M010)
  const getNumericVal = (str: string) => {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
  };

  // Sort member list based on selected sort option
  const sortMembersList = (list: Member[], sortKey: SortOption) => {
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'nomor-asc': {
          const numA = getNumericVal(a.nomorAnggota);
          const numB = getNumericVal(b.nomorAnggota);
          if (numA !== numB) return numA - numB;
          return a.nomorAnggota.localeCompare(b.nomorAnggota, undefined, { numeric: true, sensitivity: 'base' });
        }
        case 'nomor-desc': {
          const numA = getNumericVal(a.nomorAnggota);
          const numB = getNumericVal(b.nomorAnggota);
          if (numA !== numB) return numB - numA;
          return b.nomorAnggota.localeCompare(a.nomorAnggota, undefined, { numeric: true, sensitivity: 'base' });
        }
        case 'nama-asc':
          return a.nama.localeCompare(b.nama);
        case 'nama-desc':
          return b.nama.localeCompare(a.nama);
        case 'kelas-asc':
          return a.kelas.localeCompare(b.kelas);
        case 'kelas-desc':
          return b.kelas.localeCompare(a.kelas);
        case 'tanggal-desc':
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        case 'tanggal-asc':
          return (a.createdAt || '').localeCompare(b.createdAt || '');
        default:
          return 0;
      }
    });
  };

  const handleToggleColumnSort = (column: 'nomor' | 'nama' | 'kelas') => {
    if (column === 'nomor') {
      setSortBy(prev => prev === 'nomor-asc' ? 'nomor-desc' : 'nomor-asc');
    } else if (column === 'nama') {
      setSortBy(prev => prev === 'nama-asc' ? 'nama-desc' : 'nama-asc');
    } else if (column === 'kelas') {
      setSortBy(prev => prev === 'kelas-asc' ? 'kelas-desc' : 'kelas-asc');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setClassFilter('Semua');
    setStatusFilter('Semua');
    setSortBy('nomor-asc');
  };

  // Filtering and sorting data
  const filteredMembers = sortMembersList(
    members.filter(member => {
      const matchesSearch = member.nama.toLowerCase().includes(search.toLowerCase()) || 
                            member.nomorAnggota.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classFilter === 'Semua' || member.kelas === classFilter;
      const matchesStatus = statusFilter === 'Semua' || member.status === statusFilter;
      
      return matchesSearch && matchesClass && matchesStatus;
    }),
    sortBy
  );

  const isFilterActive = search !== '' || classFilter !== 'Semua' || statusFilter !== 'Semua' || sortBy !== 'nomor-asc';

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-100 tracking-tight font-sans">
            DATA ANGGOTA PERPUSTAKAAN
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Daftar siswa & guru terdaftar. Kelola nomor kartu & urutkan data secara fleksibel.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={() => downloadMembersPDF(filteredMembers)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 text-amber-400 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('single')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-zinc-200 hover:text-amber-400 transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Tambah Satuan</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('bulk')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 hover:brightness-110 shadow-lg shadow-amber-500/10 active:scale-95 transition-all cursor-pointer"
          >
            <ListPlus className="w-4 h-4" />
            <span>Tambah Sekaligus</span>
          </button>
        </div>
      </div>

      {/* Filter & Sort Controls Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="relative lg:col-span-4">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-600">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari Nomor Kartu / Nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl py-2.5 pl-10 pr-8 text-xs placeholder-zinc-600 outline-none transition-colors"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selection (FITUR SORTIR UTAMA) */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 lg:col-span-3">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                Sortir / Urutkan:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-bold text-amber-300 outline-none w-full border-none cursor-pointer truncate"
              >
                <option value="nomor-asc" className="bg-zinc-950 text-zinc-200">
                  🔢 Nomor Kartu (Terkecil → Terbesar)
                </option>
                <option value="nomor-desc" className="bg-zinc-950 text-zinc-200">
                  🔢 Nomor Kartu (Terbesar → Terkecil)
                </option>
                <option value="nama-asc" className="bg-zinc-950 text-zinc-200">
                  🔤 Nama Anggota (A - Z)
                </option>
                <option value="nama-desc" className="bg-zinc-950 text-zinc-200">
                  🔤 Nama Anggota (Z - A)
                </option>
                <option value="kelas-asc" className="bg-zinc-950 text-zinc-200">
                  🏫 Kelas (7.1 → Guru)
                </option>
                <option value="kelas-desc" className="bg-zinc-950 text-zinc-200">
                  🏫 Kelas (Guru → 7.1)
                </option>
                <option value="tanggal-desc" className="bg-zinc-950 text-zinc-200">
                  📅 Tanggal Terdaftar (Terbaru)
                </option>
                <option value="tanggal-asc" className="bg-zinc-950 text-zinc-200">
                  📅 Tanggal Terdaftar (Terlama)
                </option>
              </select>
            </div>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 lg:col-span-2">
            <Filter className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                Kelas:
              </label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 outline-none w-full border-none cursor-pointer truncate"
              >
                <option value="Semua" className="bg-zinc-950 text-zinc-300">Semua Kelas</option>
                {CLASSES_LIST.map(cls => (
                  <option key={cls} value={cls} className="bg-zinc-950 text-zinc-300">{cls === 'Guru' ? 'Guru' : `Kelas ${cls}`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 lg:col-span-2">
            <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 outline-none w-full border-none cursor-pointer truncate"
              >
                <option value="Semua" className="bg-zinc-950 text-zinc-300">Semua Status</option>
                <option value="Aktif" className="bg-zinc-950 text-zinc-300">Aktif</option>
                <option value="Tidak Aktif" className="bg-zinc-950 text-zinc-300">Tidak Aktif</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle (Table vs Cards) */}
          <div className="flex items-center justify-end gap-1.5 lg:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'table'
                  ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
              title="Tampilan Tabel"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'cards'
                  ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
              title="Tampilan Kartu (Responsif Mobile)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Filter Chips & Clear Bar */}
        {isFilterActive && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-[11px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-zinc-500 font-mono">Filter & Sortir Aktif:</span>
              {search && (
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg font-mono">
                  Cari: "{search}"
                </span>
              )}
              {sortBy !== 'nomor-asc' && (
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg font-mono">
                  Sort: {sortBy}
                </span>
              )}
              {classFilter !== 'Semua' && (
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg font-mono">
                  Kelas: {classFilter}
                </span>
              )}
              {statusFilter !== 'Semua' && (
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg font-mono">
                  Status: {statusFilter}
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono text-[10px] bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Data Container: Render Table View OR Responsive Cards View */}
      {viewMode === 'table' ? (
        /* Members List Table View */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th 
                    onClick={() => handleToggleColumnSort('nomor')} 
                    className="px-6 py-4 cursor-pointer select-none hover:text-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Nomor Anggota / Kartu</span>
                      {sortBy === 'nomor-asc' && <ArrowUp className="w-3 h-3 text-amber-400" />}
                      {sortBy === 'nomor-desc' && <ArrowDown className="w-3 h-3 text-amber-400" />}
                      {sortBy !== 'nomor-asc' && sortBy !== 'nomor-desc' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleToggleColumnSort('nama')} 
                    className="px-6 py-4 cursor-pointer select-none hover:text-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Nama Lengkap</span>
                      {sortBy === 'nama-asc' && <ArrowUp className="w-3 h-3 text-amber-400" />}
                      {sortBy === 'nama-desc' && <ArrowDown className="w-3 h-3 text-amber-400" />}
                      {sortBy !== 'nama-asc' && sortBy !== 'nama-desc' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleToggleColumnSort('kelas')} 
                    className="px-6 py-4 cursor-pointer select-none hover:text-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Kelas</span>
                      {sortBy === 'kelas-asc' && <ArrowUp className="w-3 h-3 text-amber-400" />}
                      {sortBy === 'kelas-desc' && <ArrowDown className="w-3 h-3 text-amber-400" />}
                      {sortBy !== 'kelas-asc' && sortBy !== 'kelas-desc' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>
                  <th className="px-6 py-4">Jenis Kelamin</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-sans">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-zinc-700" />
                        <p className="text-xs">Tidak ada data anggota ditemukan.</p>
                        {isFilterActive && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-2 text-xs text-amber-400 underline font-mono cursor-pointer"
                          >
                            Reset semua filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.nomorAnggota} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {member.nomorAnggota}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-100">
                        {member.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[10px] font-bold">
                          {member.kelas === 'Guru' ? 'Guru' : `Kelas ${member.kelas}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 whitespace-nowrap">
                        {member.jenisKelamin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono inline-flex items-center gap-1 ${
                          member.status === 'Aktif'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Aktif' ? 'bg-green-400' : 'bg-red-400'}`} />
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(member)}
                            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer active:scale-95"
                            title="Edit Anggota (Bisa ubah Nomor Kartu)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member.nomorAnggota)}
                            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer active:scale-95"
                            title="Hapus Anggota"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Foot Stats */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>Menampilkan <strong className="text-zinc-200">{filteredMembers.length}</strong> dari {members.length} Anggota</span>
            <span className="text-amber-400/80 font-semibold">SMP Swasta RK Makmur</span>
          </div>
        </div>
      ) : (
        /* Members Responsive Card Grid View */
        <div className="space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
              <Users className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs">Tidak ada data anggota ditemukan.</p>
              {isFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="mt-2 text-xs text-amber-400 underline font-mono cursor-pointer"
                >
                  Reset semua filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMembers.map((member) => (
                <div 
                  key={member.nomorAnggota}
                  className="bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-lg transition-all relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-amber-500/30 text-amber-400 font-mono font-black text-xs">
                          #{member.nomorAnggota}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono inline-flex items-center gap-1 ${
                          member.status === 'Aktif'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition-colors pt-1 truncate">
                        {member.nama}
                      </h3>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 hover:border-amber-500/50 cursor-pointer active:scale-95 transition-transform"
                        title="Edit Nomor/Data"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(member.nomorAnggota)}
                        className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-red-400 hover:border-red-500/50 cursor-pointer active:scale-95 transition-transform"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-zinc-300">
                        {member.kelas === 'Guru' ? 'Guru' : `Kelas ${member.kelas}`}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {member.jenisKelamin}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-600">
                      {member.createdAt || 'Aktif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Foot Stats */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] text-zinc-500 font-mono flex justify-between items-center">
            <span>Menampilkan <strong className="text-zinc-200">{filteredMembers.length}</strong> dari {members.length} Anggota</span>
            <span className="text-amber-400/80 font-semibold">SMP Swasta RK Makmur</span>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) on Mobile Screens */}
      <button
        onClick={() => handleOpenAddModal('bulk')}
        className="md:hidden fixed bottom-6 right-6 z-30 p-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-black shadow-2xl flex items-center gap-2 active:scale-95 transition-transform border border-amber-300"
      >
        <ListPlus className="w-5 h-5" />
        <span className="text-xs font-bold font-sans">Tambah Data</span>
      </button>

      {/* Add / Edit Member Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-zinc-100 font-sans">
                  {editingMember 
                    ? 'Edit Data Anggota' 
                    : addMode === 'single' 
                      ? 'Tambah Anggota Satuan' 
                      : 'Tambah Anggota Banyak Sekaligus'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs (Only if creating new member) */}
            {!editingMember && (
              <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1.5 gap-1.5">
                <button
                  type="button"
                  onClick={() => { setAddMode('single'); setErrorMsg(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    addMode === 'single'
                      ? 'bg-zinc-800 text-amber-400 border border-amber-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>1. Input Satuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAddMode('bulk'); setErrorMsg(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    addMode === 'bulk'
                      ? 'bg-zinc-800 text-amber-400 border border-amber-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>2. Input Banyak sekaligus</span>
                </button>
              </div>
            )}

            {/* Error banner */}
            {errorMsg && (
              <div className="mx-5 mt-4 p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* FORM 1: SINGLE MEMBER FORM */}
            {addMode === 'single' ? (
              <form onSubmit={handleSingleFormSubmit} className="p-5 space-y-4">
                {/* ID input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    Nomor Anggota / Kartu
                  </label>
                  <input
                    type="text"
                    value={formNomor}
                    onChange={(e) => setFormNomor(e.target.value)}
                    placeholder="Contoh: 202607063 atau M001"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors font-mono font-bold"
                    required
                  />
                  <p className="text-[11px] text-amber-400/80 italic">
                    * Anda dapat mengubah Nomor Anggota/Kartu sesuai dengan format nomor kartu resmi dari sekolah.
                  </p>
                </div>

                {/* Name input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Muhammad Ali, S.Pd / Fitri Handayani"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors"
                    required
                  />
                </div>

                {/* Class Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                    Kelas / Kategori
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

                {/* Gender radio */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">
                    Jenis Kelamin
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={formGender === 'Laki-laki'}
                        onChange={() => setFormGender('Laki-laki')}
                        className="accent-amber-500"
                      />
                      <span>Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={formGender === 'Perempuan'}
                        onChange={() => setFormGender('Perempuan')}
                        className="accent-amber-500"
                      />
                      <span>Perempuan</span>
                    </label>
                  </div>
                </div>

                {/* Status Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">
                    Status Keanggotaan
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Tidak Aktif')}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors cursor-pointer"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>

                {/* Submit */}
                <div className="pt-3 border-t border-zinc-800 flex gap-2.5">
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
                    <span>{editingMember ? 'Simpan Perubahan' : 'Simpan Anggota'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* FORM 2: BULK MEMBER FORM */
              <form onSubmit={handleBulkFormSubmit} className="p-5 space-y-4">
                {/* Select Class for all entries in bulk */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-amber-400 uppercase font-bold flex items-center justify-between">
                    <span>Pilih Kelas / Kategori Rombel</span>
                    <span className="text-zinc-500 font-normal">Format Terpilih</span>
                  </label>
                  <select
                    value={bulkKelas}
                    onChange={(e) => setBulkKelas(e.target.value)}
                    className="w-full bg-zinc-950 border border-amber-500/40 text-amber-300 font-bold rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors cursor-pointer"
                  >
                    {CLASSES_LIST.map(cls => (
                      <option key={cls} value={cls} className="bg-zinc-950 text-zinc-200">
                        {cls === 'Guru' ? 'Guru' : `Kelas ${cls}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-zinc-400 italic">
                    * Semua nama yang Anda masukkan di bawah akan otomatis terdaftar untuk <strong className="text-amber-400 font-semibold">{bulkKelas === 'Guru' ? 'Guru' : `Kelas ${bulkKelas}`}</strong>.
                  </p>
                </div>

                {/* Default Gender selection */}
                <div className="space-y-1.5 bg-zinc-950/60 border border-zinc-800 p-3 rounded-xl">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase block">
                    Jenis Kelamin Default
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="bulkGender"
                        checked={bulkDefaultGender === 'Laki-laki'}
                        onChange={() => setBulkDefaultGender('Laki-laki')}
                        className="accent-amber-500"
                      />
                      <span>Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="bulkGender"
                        checked={bulkDefaultGender === 'Perempuan'}
                        onChange={() => setBulkDefaultGender('Perempuan')}
                        className="accent-amber-500"
                      />
                      <span>Perempuan</span>
                    </label>
                  </div>
                  <span className="text-[10px] text-zinc-500 block">
                    Tip: Bisa diset otomatis per nama dengan menulis <code className="bg-zinc-900 px-1 py-0.5 rounded text-amber-300 font-mono">(P)</code> atau <code className="bg-zinc-900 px-1 py-0.5 rounded text-amber-300 font-mono">(L)</code> di akhir nama.
                  </span>
                </div>

                {/* Textarea list input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                      Daftar Anggota & Nomor Kartu (1 Data per Baris)
                    </label>
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      {bulkLinesCount} Baris Terdeteksi
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={`Contoh Format Sekolah (Nomor Kartu - Nama):\n202607063 -Akazia Alberik Simangunsong\n202607064 - Anisa Rahmawati (P)\n202607065 - Budi Santoso (L)\n202607066: Citra Dewi\n\nAtau jika hanya nama saja (Nomor otomatis dibuat):\nAditya Pratama\nDewi Lestari`}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl p-3 text-xs outline-none transition-colors font-mono leading-relaxed"
                    required
                  />
                </div>

                {/* Info Callout */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-[11px] text-zinc-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Deteksi Otomatis Nomor Kartu & Nama:</span>
                  </div>
                  <p className="leading-relaxed">
                    Format seperti <code className="text-amber-300 font-mono font-bold bg-zinc-950 px-1 py-0.5 rounded">202607063 -Akazia Alberik Simangunsong</code> akan otomatis membaca <strong className="text-emerald-400 font-mono">202607063</strong> sebagai Nomor Anggota dan <strong className="text-amber-300">Akazia Alberik Simangunsong</strong> sebagai Nama Lengkap untuk <strong className="text-zinc-200">{bulkKelas === 'Guru' ? 'Guru' : `Kelas ${bulkKelas}`}</strong>.
                  </p>
                </div>

                {/* Submit button */}
                <div className="pt-2 border-t border-zinc-800 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={bulkLinesCount === 0}
                    className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-600 disabled:opacity-50 text-zinc-950 font-bold py-2.5 rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ListPlus className="w-4 h-4 text-zinc-950" />
                    <span>{bulkLinesCount > 0 ? `Simpan ${bulkLinesCount} Anggota ${bulkKelas}` : 'Simpan Anggota'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-red-500">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-zinc-100 font-sans">
                Konfirmasi Hapus Anggota
              </h3>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus Anggota dengan Nomor: <span className="font-mono text-amber-400 font-bold">{deleteConfirmMember}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmMember(null)}
                className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-300 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMember(deleteConfirmMember);
                  setDeleteConfirmMember(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs shadow-lg shadow-red-500/10 transition-colors cursor-pointer"
              >
                Hapus Anggota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
