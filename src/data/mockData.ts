import { Book, Member, Borrowing, Visitor, BookCategory } from '../types';

export const INITIAL_BOOKS: Book[] = [
  {
    kodeBuku: "B001",
    kategori: "Novel",
    judul: "Laskar Pelangi",
    pengarang: "Andrea Hirata",
    penerbit: "Bentang Pustaka",
    tahunTerbit: "2005",
    isbn: "979-3062-79-7",
    deskripsi: "Kisah perjuangan sepuluh anak di Belitung dalam mengejar mimpi lewat pendidikan di sekolah dasar sederhana Muhammadiyah.",
    stock: 5,
    fotoSampul: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400"
  },
  {
    kodeBuku: "B002",
    kategori: "Novel",
    judul: "Bumi",
    pengarang: "Tere Liye",
    penerbit: "Gramedia Pustaka Utama",
    tahunTerbit: "2014",
    isbn: "978-602-03-3290-1",
    deskripsi: "Petualangan tiga remaja bersahabat: Raib, Seli, dan Ali, yang ternyata memiliki kekuatan dunia paralel.",
    stock: 3,
    fotoSampul: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400"
  },
  {
    kodeBuku: "B003",
    kategori: "Sejarah",
    judul: "Sejarah Nasional Indonesia",
    pengarang: "Sartono Kartodirdjo",
    penerbit: "Balai Pustaka",
    tahunTerbit: "2008",
    isbn: "978-979-407-407-7",
    deskripsi: "Buku babon sejarah perjuangan bangsa Indonesia sejak zaman prasejarah hingga zaman kemerdekaan.",
    stock: 2,
    fotoSampul: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=400"
  },
  {
    kodeBuku: "B004",
    kategori: "IPA",
    judul: "Fisika Dasar untuk SMP",
    pengarang: "Dr. Budi Prasetyo",
    penerbit: "Erlangga",
    tahunTerbit: "2021",
    isbn: "978-602-241-112-3",
    deskripsi: "Panduan lengkap konsep-konsep fisika dasar, mekanika, dan termodinamika untuk siswa tingkat SMP.",
    stock: 8,
    fotoSampul: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400"
  },
  {
    kodeBuku: "B005",
    kategori: "Dongeng",
    judul: "Kumpulan Dongeng Nusantara",
    pengarang: "Seno Hadi",
    penerbit: "Pustaka Anak",
    tahunTerbit: "2018",
    isbn: "978-979-22-2931-1",
    deskripsi: "Koleksi dongeng tradisional legendaris mulai dari Malin Kundang, Sangkuriang, hingga Timun Mas.",
    stock: 4,
    fotoSampul: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400"
  },
  {
    kodeBuku: "B006",
    kategori: "Kamus",
    judul: "Kamus Besar Bahasa Indonesia",
    pengarang: "Tim Redaksi Bahasa",
    penerbit: "Balai Pustaka",
    tahunTerbit: "2016",
    isbn: "978-602-263-104-5",
    deskripsi: "Kamus rujukan utama bahasa Indonesia yang baku dan resmi untuk pelajar dan umum.",
    stock: 2,
    fotoSampul: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400"
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    nomorAnggota: "M001",
    nama: "Andi Wijaya",
    kelas: "8.1",
    jenisKelamin: "Laki-laki",
    status: "Aktif",
    createdAt: "2026-01-10"
  },
  {
    nomorAnggota: "M002",
    nama: "Siti Rahma",
    kelas: "9.2",
    jenisKelamin: "Perempuan",
    status: "Aktif",
    createdAt: "2026-01-15"
  },
  {
    nomorAnggota: "M003",
    nama: "Budi Santoso, S.Pd.",
    kelas: "Guru",
    jenisKelamin: "Laki-laki",
    status: "Aktif",
    createdAt: "2026-02-01"
  },
  {
    nomorAnggota: "M004",
    nama: "Dewi Lestari",
    kelas: "7.3",
    jenisKelamin: "Perempuan",
    status: "Aktif",
    createdAt: "2026-02-12"
  },
  {
    nomorAnggota: "M005",
    nama: "Rian Pratama",
    kelas: "8.3",
    jenisKelamin: "Laki-laki",
    status: "Tidak Aktif",
    createdAt: "2025-11-05"
  }
];

export const INITIAL_BORROWINGS: Borrowing[] = [
  {
    id: "TR-001",
    nomorAnggota: "M001",
    namaAnggota: "Andi Wijaya",
    kelasAnggota: "8.1",
    kodeBuku: "B001",
    judulBuku: "Laskar Pelangi",
    tanggalPinjam: "2026-07-10",
    tanggalHarusKembali: "2026-07-17",
    status: "Dipinjam"
  },
  {
    id: "TR-002",
    nomorAnggota: "M002",
    namaAnggota: "Siti Rahma",
    kelasAnggota: "9.2",
    kodeBuku: "B002",
    judulBuku: "Bumi",
    tanggalPinjam: "2026-07-12",
    tanggalHarusKembali: "2026-07-19",
    status: "Dipinjam"
  },
  {
    id: "TR-003",
    nomorAnggota: "M003",
    namaAnggota: "Budi Santoso, S.Pd.",
    kelasAnggota: "Guru",
    kodeBuku: "B006",
    judulBuku: "Kamus Besar Bahasa Indonesia",
    tanggalPinjam: "2026-07-01",
    tanggalHarusKembali: "2026-07-15",
    tanggalKembali: "2026-07-14",
    status: "Kembali"
  },
  {
    id: "TR-004",
    nomorAnggota: "M004",
    namaAnggota: "Dewi Lestari",
    kelasAnggota: "7.3",
    kodeBuku: "B005",
    judulBuku: "Kumpulan Dongeng Nusantara",
    tanggalPinjam: "2026-07-05",
    tanggalHarusKembali: "2026-07-12",
    status: "Dipinjam"
  }
];

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: "V-001",
    nama: "Andi Wijaya",
    tujuan: "Meminjam Buku",
    tanggal: "2026-07-17 08:30",
    kelas: "8.1"
  },
  {
    id: "V-002",
    nama: "Siti Rahma",
    tujuan: "Membaca Buku",
    tanggal: "2026-07-17 09:15",
    kelas: "9.2"
  },
  {
    id: "V-003",
    nama: "Rian Pratama",
    tujuan: "Mengembalikan Buku",
    tanggal: "2026-07-17 10:00",
    kelas: "8.3"
  },
  {
    id: "V-004",
    nama: "Dian Safitri",
    tujuan: "Tugas Kelompok",
    tanggal: "2026-07-17 11:20",
    kelas: "7.2"
  },
  {
    id: "V-005",
    nama: "Sari Astuti, S.Pd.",
    tujuan: "Referensi Mengajar",
    tanggal: "2026-07-17 13:00",
    kelas: "Guru"
  }
];

export const CLASSES_LIST = [
  "7.1", "7.2", "7.3", "8.1", "8.2", "8.3", "9.1", "9.2", "9.3", "Guru"
];

export const BOOK_CATEGORIES: BookCategory[] = [
  "Novel", "Komik", "Dongeng", "Cerpen", "Agama", "IPA", "Sejarah", "Ensikolpedi", "Kamus", "Umum", "Referensi", "Pelajaran"
];
