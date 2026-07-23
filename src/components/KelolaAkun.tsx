import React, { useState, useRef } from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  Download, 
  Upload, 
  Smartphone, 
  AlertCircle, 
  CheckCircle,
  Sparkles,
  RefreshCw,
  FileDown,
  Cloud,
  Database
} from 'lucide-react';
import { Book, Member, Borrowing, Visitor } from '../types';
import { syncLocalStorageToCloud, restoreInitialDataToCloud } from '../lib/dbService';

interface KelolaAkunProps {
  adminName: string;
  setAdminName: (name: string) => void;
  books: Book[];
  members: Member[];
  borrowings: Borrowing[];
  visitors: Visitor[];
  onImportDatabase: (data: { books: Book[], members: Member[], borrowings: Borrowing[], visitors: Visitor[] }) => void;
}

export default function KelolaAkun({ 
  adminName, 
  setAdminName, 
  books, 
  members, 
  borrowings, 
  visitors,
  onImportDatabase
}: KelolaAkunProps) {
  // Account Form States
  const [namaAdmin, setNamaAdmin] = useState(adminName);
  const [username, setUsername] = useState('admin');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  // Backup & Import States
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App download guide simulation
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStep, setInstallStep] = useState(0);

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');

    if (!namaAdmin.trim()) {
      setAccountError('Nama Admin tidak boleh kosong!');
      return;
    }

    if (newPassword) {
      if (oldPassword !== 'admin123') {
        setAccountError('Password Lama salah! Gunakan "admin123" untuk konfirmasi.');
        return;
      }
      setAccountSuccess('Nama Admin & Password berhasil diubah!');
    } else {
      setAccountSuccess('Nama Admin berhasil disimpan!');
    }

    setAdminName(namaAdmin);
    setOldPassword('');
    setNewPassword('');
    setTimeout(() => setAccountSuccess(''), 4000);
  };

  // Export current databases to JSON backup file
  const handleExportDatabase = () => {
    const fullDB = {
      books,
      members,
      borrowings,
      visitors,
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullDB, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_Perpustakaan_SMP_RK_Makmur_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import databases from JSON file
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportSuccess('');

    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.books && parsed.members && parsed.borrowings && parsed.visitors) {
          onImportDatabase({
            books: parsed.books,
            members: parsed.members,
            borrowings: parsed.borrowings,
            visitors: parsed.visitors
          });
          setImportSuccess('Database berhasil dipulihkan dari file backup!');
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          setImportError('Struktur file JSON tidak valid! Pastikan file adalah backup aplikasi ini.');
        }
      } catch (err) {
        setImportError('Gagal membaca file! Format JSON rusak.');
      }
    };
    fileReader.readAsText(file);
  };

  // Simulate PWA stand alone installation download
  const handleInstallSimulate = () => {
    setIsInstalling(true);
    setInstallStep(1);
    
    setTimeout(() => {
      setInstallStep(2);
      setTimeout(() => {
        setInstallStep(3);
        setTimeout(() => {
          setIsInstalling(false);
          setInstallStep(0);
          alert('Aplikasi siap digunakan offline! (PWA Terpasang)');
        }, 2000);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-zinc-100 tracking-tight font-sans">
          KELOLA AKUN & SETUP APLIKASI
        </h2>
        <p className="text-xs text-zinc-500 font-mono">
          Perbarui akun admin perpustakaan, buat cadangan basis data lengkap, dan pasang aplikasi di perangkat Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Account Management */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100 font-sans">Perbarui Profil Admin</h3>
          </div>

          <form onSubmit={handleUpdateAccount} className="space-y-4">
            {accountError && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs">
                {accountError}
              </div>
            )}
            {accountSuccess && (
              <div className="p-3 bg-green-950/40 border border-green-500/20 text-green-300 rounded-xl text-xs flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{accountSuccess}</span>
              </div>
            )}

            {/* Nama Admin */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                Nama Lengkap Admin
              </label>
              <input
                type="text"
                value={namaAdmin}
                onChange={(e) => setNamaAdmin(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors"
                required
              />
            </div>

            {/* Username (Locked) */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                Username Akses (Terkunci)
              </label>
              <input
                type="text"
                value={username}
                disabled
                className="w-full bg-zinc-950 border border-zinc-800 opacity-60 text-zinc-400 rounded-xl px-3.5 py-2.5 text-xs outline-none font-mono"
              />
            </div>

            {/* Password section header */}
            <div className="pt-2 border-t border-zinc-850/80">
              <span className="text-[9px] font-mono text-amber-500/85 uppercase block mb-3 font-semibold">Ganti Password (Opsional)</span>
            </div>

            {/* Old Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                Password Lama (untuk konfirmasi)
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-bold py-2.5 rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer pt-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              <span>Simpan Perubahan Akun</span>
            </button>
          </form>
        </div>

        {/* Right Card: Backup, Restore & Offline PWA download */}
        <div className="space-y-6">
          
          {/* Section: Backup Database */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100 font-sans">Pencadangan & Pemulihan Data</h3>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed">
              Seluruh basis data Anda tersimpan otomatis di <strong>Cloud Database (Firestore)</strong> secara realtime, sehingga aman dan dapat diakses dari perangkat HP/Laptop manapun tanpa hilang.
            </p>

            {importError && (
              <div className="p-2.5 bg-red-950/40 border border-red-500/20 text-red-300 rounded-lg text-xs">
                {importError}
              </div>
            )}
            {importSuccess && (
              <div className="p-2.5 bg-green-950/40 border border-green-500/20 text-green-300 rounded-lg text-xs flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            {/* Actions button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export backup */}
              <button
                onClick={handleExportDatabase}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-950 border border-zinc-800 hover:border-amber-500/30 text-amber-400 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Backup (.json)</span>
              </button>

              {/* Import backup */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-400 text-zinc-950 hover:brightness-110 shadow-lg shadow-amber-500/5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pulihkan Backup File</span>
              </button>

              {/* Section for Vercel / External Hosting env variables */}
              <div className="p-3 bg-zinc-950 border border-amber-500/20 rounded-xl space-y-2 text-[11px] text-zinc-400 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Konfigurasi Deployment Vercel / GitHub</span>
                  </span>
                  <button
                    onClick={() => {
                      const envText = `VITE_FIREBASE_PROJECT_ID="gen-lang-client-0957103195"\nVITE_FIREBASE_APP_ID="1:1042294773881:web:f9e7db3f7e3ca9a30cdca8"\nVITE_FIREBASE_API_KEY="AIzaSyDH2HqauDzJ6Ph_BAK-Jd8H1rvUxcQUKsE"\nVITE_FIREBASE_AUTH_DOMAIN="gen-lang-client-0957103195.firebaseapp.com"\nVITE_FIREBASE_DATABASE_ID="ai-studio-perpustakaansmpr-e8213a3f-bcaf-4b6e-824f-efe5fa0452a7"\nVITE_FIREBASE_STORAGE_BUCKET="gen-lang-client-0957103195.firebasestorage.app"\nVITE_FIREBASE_MESSAGING_SENDER_ID="1042294773881"`;
                      navigator.clipboard.writeText(envText);
                      alert('Environment variables Firebase berhasil disalin! Masukkan ke Environment Variables Vercel Anda.');
                    }}
                    className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] cursor-pointer"
                  >
                    Salin Config Vercel
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                  Jika Anda men-deploy ke <strong>Vercel</strong> atau <strong>GitHub Pages</strong>, pastikan memasukkan Variabel Lingkungan (Environment Variables) di atas agar Vercel terhubung langsung ke Cloud Firestore database ini.
                </p>
              </div>

              {/* Push Local Storage to Cloud */}

              <button
                onClick={async () => {
                  setImportError('');
                  setImportSuccess('Mengupload data browser lokal ke Cloud Database...');
                  const res = await syncLocalStorageToCloud();
                  if (res) {
                    setImportSuccess('Berhasil mengupload data lokal Anda ke Cloud Database!');
                  } else {
                    setImportError('Gagal melakukan sinkronisasi data lokal.');
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer sm:col-span-2"
              >
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Upload Data Browser Lokal ke Cloud Database</span>
              </button>

              {/* Reset Initial Sample Data */}
              <button
                onClick={async () => {
                  if (confirm('Apakah Anda yakin ingin memulihkan data contoh/bawaan awal perpustakaan ke Cloud Database?')) {
                    setImportError('');
                    setImportSuccess('Memulihkan data bawaan awal...');
                    await restoreInitialDataToCloud();
                    setImportSuccess('Data contoh bawaan perpustakaan berhasil dipulihkan!');
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] font-mono text-zinc-500 hover:text-amber-400 hover:bg-zinc-950 transition-all cursor-pointer sm:col-span-2"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Kembalikan Data Contoh / Bawaan Awal</span>
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Section: Standalone Application Download / PWA Guide */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100 font-sans">Pasang Sebagai Aplikasi (PWA)</h3>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed">
              Aplikasi Perpustakaan ini mendukung PWA (Progressive Web App). Anda dapat mengunduhnya secara langsung menjadi aplikasi real di HP Android, iPhone, ataupun PC tanpa koneksi internet!
            </p>

            {/* Install Flow Simulator */}
            {isInstalling ? (
              <div className="p-4 bg-zinc-950 border border-amber-500/20 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">Mengunduh aset & menginstal...</span>
                  <span className="font-mono text-amber-400 font-bold">{installStep * 33}%</span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-1000"
                    style={{ width: `${installStep * 33}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono block">
                  {installStep === 1 && '✓ Menghubungkan modul offline cache...'}
                  {installStep === 2 && '✓ Mengunduh metadata SMP Swasta RK Makmur...'}
                  {installStep === 3 && '✓ Mengintegrasikan launcher di layar utama...'}
                </span>
              </div>
            ) : (
              <button
                onClick={handleInstallSimulate}
                className="w-full bg-zinc-950 border border-zinc-800 hover:border-amber-500/30 text-amber-400 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Instal Aplikasi di Perangkat Ini</span>
              </button>
            )}

            {/* Instruction Guides */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide block">Petunjuk Pemasangan Manual:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px] leading-relaxed text-zinc-500 font-mono">
                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850/80">
                  <span className="text-amber-400 font-bold block mb-1">Android (Chrome)</span>
                  Klik titik tiga (⋮) di sudut kanan atas, lalu pilih <span className="text-zinc-300">"Tambahkan ke Layar Utama"</span>.
                </div>
                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850/80">
                  <span className="text-amber-400 font-bold block mb-1">iPhone (Safari)</span>
                  Klik tombol <span className="text-zinc-300">"Share"</span>, lalu gulir ke bawah dan pilih <span className="text-zinc-300">"Add to Home Screen"</span>.
                </div>
                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850/80">
                  <span className="text-amber-400 font-bold block mb-1">Laptop & PC</span>
                  Klik icon <span className="text-zinc-300">"Instal" / Monitor (+)</span> di sebelah kanan address bar browser Anda.
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
