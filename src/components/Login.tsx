import React, { useState } from 'react';
import { LogIn, BookOpen, Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (adminName: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password === 'admin123') {
      onLoginSuccess('Administrator RK Makmur');
    } else {
      setError('Username atau Password salah! (Gunakan: admin / admin123)');
    }
  };

  return (
    <div id="login-screen" className="min-h-screen bg-zinc-950 flex flex-col justify-between text-zinc-100 relative overflow-hidden">
      {/* Background Decorative Gold Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex items-center gap-3 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur z-10">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/15">
          <BookOpen className="w-6 h-6 text-zinc-950" />
        </div>
        <div>
          <h1 className="font-sans font-bold tracking-tight text-amber-400 text-lg sm:text-xl">
            Sistem Informasi Perpustakaan
          </h1>
          <p className="text-zinc-500 text-xs font-mono">SMP Swasta RK Makmur</p>
        </div>
      </header>

      {/* Login Main Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-zinc-900/90 border border-amber-500/20 rounded-2xl p-8 shadow-2xl relative">
          {/* Subtle gold line on top of card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-sans text-amber-400 tracking-tight">
              Akses Admin Perpustakaan
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Silakan login untuk mengelola buku, anggota, dan transaksi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-300 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono tracking-wider text-amber-400/80 uppercase block">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono tracking-wider text-amber-400/80 uppercase block">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Hint Box for demo */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 text-xs text-amber-300/80 leading-relaxed">
              <span className="font-bold text-amber-400 block mb-0.5">💡 Akses Akun Demo:</span>
              Username: <span className="font-mono text-zinc-300">admin</span> &nbsp;|&nbsp; Password: <span className="font-mono text-zinc-300">admin123</span>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 text-zinc-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Sistem</span>
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-zinc-600 border-t border-zinc-900 bg-zinc-950/50">
        <p className="font-semibold text-zinc-500">SMP SWASTA RK MAKMUR</p>
        <p className="mt-1 leading-relaxed max-w-md mx-auto">
          Jalan Teratai No 21 A Medan Estate, Kec. Percut Sei Tuan, Kab. Deli Serdang, Provinsi Sumatera Utara.
        </p>
        <p className="text-[10px] text-zinc-700 mt-2 font-mono">
          &copy; 2026 SMP RK Makmur. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
