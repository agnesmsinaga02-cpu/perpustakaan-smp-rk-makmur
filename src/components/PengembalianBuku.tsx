import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  CheckCircle, 
  Clock, 
  Search, 
  DollarSign, 
  AlertTriangle,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Borrowing } from '../types';

interface PengembalianBukuProps {
  borrowings: Borrowing[];
  onReturnBook: (id: string, denda: number) => void;
}

export default function PengembalianBuku({ borrowings, onReturnBook }: PengembalianBukuProps) {
  const [search, setSearch] = useState('');
  const [returnSuccess, setReturnSuccess] = useState('');
  const [returnConfirmLoan, setReturnConfirmLoan] = useState<{
    id: string;
    judulBuku: string;
    namaAnggota: string;
    daysLate: number;
    fine: number;
  } | null>(null);

  // Daily late fine rate
  const FINE_PER_DAY = 1000; // Rp 1.000 per hari lambat

  // Function to calculate late days and fine
  const calculateLateStats = (harusKembaliStr: string) => {
    const today = new Date();
    // remove hours
    today.setHours(0,0,0,0);
    
    const dueDate = new Date(harusKembaliStr);
    dueDate.setHours(0,0,0,0);

    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        daysLate: diffDays,
        fine: diffDays * FINE_PER_DAY
      };
    }
    return { daysLate: 0, fine: 0 };
  };

  const handleReturnAction = (id: string, harusKembali: string, judul: string, nama: string) => {
    const { daysLate, fine } = calculateLateStats(harusKembali);
    setReturnConfirmLoan({ id, judulBuku: judul, namaAnggota: nama, daysLate, fine });
  };

  // Get active loans
  const activeLoans = borrowings.filter(b => b.status === 'Dipinjam');
  const filteredActive = activeLoans.filter(b => 
    b.namaAnggota.toLowerCase().includes(search.toLowerCase()) ||
    b.judulBuku.toLowerCase().includes(search.toLowerCase()) ||
    b.nomorAnggota.toLowerCase().includes(search.toLowerCase()) ||
    b.kodeBuku.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  // Get past returned loans
  const returnedLoans = borrowings.filter(b => b.status === 'Kembali').reverse();

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <h2 className="text-xl font-black text-zinc-100 tracking-tight font-sans">
          PENGEMBALIAN BUKU PERPUSTAKAAN
        </h2>
        <p className="text-xs text-zinc-500 font-mono">
          Proses pengembalian buku yang dipinjam, hitung denda keterlambatan otomatis, dan kembalikan stok buku.
        </p>
      </div>

      {returnSuccess && (
        <div className="p-4 bg-green-950/40 border border-green-500/25 text-green-300 rounded-xl text-xs flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{returnSuccess}</span>
        </div>
      )}

      {/* Main layout grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Active borrowings directory (2-cols span) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100 font-sans">Daftar Buku Sedang Dipinjam</h3>
            </div>

            {/* Live Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-600">
                <Search className="w-3 h-3" />
              </span>
              <input
                type="text"
                placeholder="Cari peminjam / buku..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-lg pl-8 pr-3 py-1.5 text-[11px] placeholder-zinc-700 outline-none w-48"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredActive.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/40 border border-zinc-800/40 rounded-xl text-zinc-600 text-xs">
                Tidak ada buku sedang dipinjam saat ini.
              </div>
            ) : (
              filteredActive.map((loan) => {
                const { daysLate, fine } = calculateLateStats(loan.tanggalHarusKembali);
                const isLate = daysLate > 0;

                return (
                  <div 
                    key={loan.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-zinc-950/60 border border-zinc-800/80 hover:border-amber-500/20 rounded-xl gap-4 transition-all relative overflow-hidden"
                  >
                    {/* Visual border indicating lateness */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${isLate ? 'bg-red-500' : 'bg-amber-500/50'}`} />

                    <div className="space-y-1.5 min-w-0 flex-1 pl-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/15">
                          {loan.id}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-100 truncate">
                          {loan.namaAnggota} <span className="text-[10px] text-zinc-500">({loan.kelasAnggota === 'Guru' ? 'Guru' : `Kelas ${loan.kelasAnggota}`})</span>
                        </h4>
                      </div>

                      <div className="space-y-0.5 text-xs text-zinc-400">
                        <p className="font-semibold text-zinc-300 truncate">📚 {loan.judulBuku}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">Kode Buku: {loan.kodeBuku}</p>
                      </div>

                      <div className="flex gap-4 text-[10px] font-mono text-zinc-500 pt-1">
                        <span>Pinjam: {loan.tanggalPinjam}</span>
                        <span>Batas Kembali: {loan.tanggalHarusKembali}</span>
                      </div>
                    </div>

                    {/* Right side: Late Status and Actions */}
                    <div className="flex flex-row sm:flex-col items-end gap-3 self-stretch sm:self-auto justify-between sm:justify-center border-t sm:border-0 border-zinc-800/60 pt-3.5 sm:pt-0">
                      <div className="text-left sm:text-right">
                        {isLate ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-950/30 border border-red-900/40 px-2 py-0.5 rounded-full uppercase">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Lambat {daysLate} Hari</span>
                            </span>
                            <span className="text-xs font-bold font-mono text-red-400 block">
                              Denda: Rp {fine.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-950/30 border border-green-900/40 px-2 py-0.5 rounded-full uppercase">
                            <span>Aman (Tepat Waktu)</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleReturnAction(loan.id, loan.tanggalHarusKembali, loan.judulBuku, loan.namaAnggota)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/5 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5 text-zinc-950" />
                        <span>Proses Kembali</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Section: Returned Audit Trail */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100 font-sans">Selesai Dikembalikan</h3>
          </div>

          <p className="text-zinc-500 text-[11px] leading-relaxed">
            Catatan pengembalian buku terbaru hari ini berserta denda yang telah diselesaikan.
          </p>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {returnedLoans.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-6">Belum ada pengembalian selesai.</p>
            ) : (
              returnedLoans.map(r => (
                <div key={r.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500">ID: {r.id}</span>
                    <span className="text-green-400 font-semibold uppercase flex items-center gap-0.5">
                      ✓ Kembali
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-zinc-300 truncate">{r.namaAnggota}</h5>
                    <p className="text-[11px] text-zinc-400 truncate">📖 {r.judulBuku}</p>
                  </div>

                  <div className="pt-1.5 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5 text-zinc-600" />
                      <span>Kembali: {r.tanggalKembali || r.tanggalHarusKembali}</span>
                    </span>
                    {r.denda && r.denda > 0 ? (
                      <span className="text-red-400 font-bold">Denda: Rp {r.denda.toLocaleString('id-ID')}</span>
                    ) : (
                      <span className="text-zinc-600">No Denda</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Return Confirmation Modal */}
      {returnConfirmLoan && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl p-6 space-y-4">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            <div className="flex items-center gap-2.5 text-amber-500 pb-2 border-b border-zinc-800">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-zinc-100 font-sans">
                Konfirmasi Pengembalian Buku
              </h3>
            </div>

            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between border-b border-zinc-800/40 pb-1.5">
                <span>Peminjam:</span>
                <span className="font-semibold text-zinc-200">{returnConfirmLoan.namaAnggota}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/40 pb-1.5">
                <span>Buku:</span>
                <span className="font-semibold text-zinc-200 max-w-[200px] truncate">{returnConfirmLoan.judulBuku}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Status Keterlambatan:</span>
                {returnConfirmLoan.daysLate > 0 ? (
                  <span className="text-red-400 font-bold">Terlambat {returnConfirmLoan.daysLate} Hari</span>
                ) : (
                  <span className="text-green-400 font-bold">Tepat Waktu</span>
                )}
              </div>
              {returnConfirmLoan.daysLate > 0 && (
                <div className="flex justify-between pt-1 text-red-400 font-bold font-mono">
                  <span>Denda Akumulasi:</span>
                  <span>Rp {returnConfirmLoan.fine.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-zinc-500">
              Apakah Anda yakin ingin memproses pengembalian ini dan mengembalikan stok buku?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReturnConfirmLoan(null)}
                className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-300 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onReturnBook(returnConfirmLoan.id, returnConfirmLoan.fine);
                  
                  let successStr = `Berhasil mengembalikan "${returnConfirmLoan.judulBuku}".`;
                  if (returnConfirmLoan.fine > 0) {
                    successStr += ` Terlambat ${returnConfirmLoan.daysLate} hari, denda Rp ${returnConfirmLoan.fine.toLocaleString('id-ID')} telah dicatatkan.`;
                  } else {
                    successStr += ` Dikembalikan tepat waktu.`;
                  }
                  setReturnSuccess(successStr);
                  setTimeout(() => setReturnSuccess(''), 6000);
                  setReturnConfirmLoan(null);
                }}
                className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-bold py-2.5 rounded-xl text-xs hover:brightness-110 transition-all cursor-pointer"
              >
                Proses Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
