export interface AdminAccount {
  username: string;
  namaAdmin: string;
  role: string;
  fotoProfile?: string;
}

export interface Member {
  nomorAnggota: string;
  nama: string;
  kelas: string; // Kelas 7.1-9.3, Guru
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  status: 'Aktif' | 'Tidak Aktif';
  createdAt: string;
}

export type BookCategory =
  | 'Novel'
  | 'Komik'
  | 'Dongeng'
  | 'Cerpen'
  | 'Agama'
  | 'IPA'
  | 'Sejarah'
  | 'Ensikolpedi'
  | 'Kamus'
  | 'Umum'
  | 'Referensi'
  | 'Pelajaran';

export interface Book {
  kodeBuku: string;
  kategori: BookCategory;
  judul: string;
  pengarang: string;
  penerbit: string;
  tahunTerbit: string;
  isbn: string;
  deskripsi: string;
  stock: number;
  fotoSampul: string; // URL, Base64, or default pattern
}

export interface Borrowing {
  id: string;
  nomorAnggota: string;
  namaAnggota: string;
  kelasAnggota: string;
  kodeBuku: string;
  judulBuku: string;
  tanggalPinjam: string;
  tanggalHarusKembali: string;
  tanggalKembali?: string;
  status: 'Dipinjam' | 'Kembali';
  denda?: number; // Late return fee
  jumlah?: number;
  keterangan?: string;
}

export interface Visitor {
  id: string;
  nama: string;
  tujuan: string; // Membaca, Meminjam, Mengembalikan, Tugas, dll.
  tanggal: string; // YYYY-MM-DD HH:MM
  kelas: string; // Kelas or Guru
}
