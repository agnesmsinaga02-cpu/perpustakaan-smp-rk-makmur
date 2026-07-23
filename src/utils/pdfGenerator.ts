import { jsPDF } from 'jspdf';
import { Book, Member, Borrowing, Visitor } from '../types';

// Helper to draw the official School Letterhead (Kop Surat)
const drawHeader = (doc: jsPDF, title: string) => {
  // Dark gray/black header bar
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, 210, 8, 'F');
  
  // Gold accent bar
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 8, 210, 2, 'F');

  // School Info
  doc.setTextColor(26, 26, 26);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SMP SWASTA RK MAKMUR', 105, 20, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Jalan Teratai No 21 A Medan Estate, Kec. Percut Sei Tuan, Kab. Deli Serdang', 105, 25, { align: 'center' });
  doc.text('Provinsi Sumatera Utara, Indonesia', 105, 29, { align: 'center' });

  // Thin line below letterhead
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(15, 33, 195, 33);

  // Document Title
  doc.setTextColor(26, 26, 26);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, 105, 42, { align: 'center' });

  // Date of report
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
  doc.text(`Dicetak pada: ${nowStr}`, 195, 42, { align: 'right' });

  // Reset colors & font
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
};

// Footer with page numbering
const drawFooter = (doc: jsPDF, pageNum: number) => {
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Aplikasi Perpustakaan SMP Swasta RK Makmur - Black Gold Edition', 15, 285);
  doc.text(`Halaman ${pageNum}`, 195, 285, { align: 'right' });
};

export const downloadBooksPDF = (books: Book[]) => {
  const doc = new jsPDF('p', 'mm', 'a4'); // 210 x 297 mm
  drawHeader(doc, 'LAPORAN DATA BUKU PERPUSTAKAAN');

  // Table header
  doc.setFillColor(26, 26, 26);
  doc.rect(15, 48, 180, 7, 'F');
  doc.setTextColor(212, 175, 55); // Gold
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('No', 18, 53);
  doc.text('Kode', 25, 53);
  doc.text('Kategori', 42, 53);
  doc.text('Judul Buku', 70, 53);
  doc.text('Pengarang', 125, 53);
  doc.text('Penerbit', 160, 53);
  doc.text('Stok', 188, 53);

  // Draw rows
  doc.setTextColor(40, 40, 40);
  doc.setFont('Helvetica', 'normal');
  let y = 60;
  books.forEach((book, idx) => {
    // Check if we need a new page
    if (y > 270) {
      drawFooter(doc, 1);
      doc.addPage();
      drawHeader(doc, 'LAPORAN DATA BUKU PERPUSTAKAAN');
      doc.setFillColor(26, 26, 26);
      doc.rect(15, 48, 180, 7, 'F');
      doc.setTextColor(212, 175, 55);
      doc.setFont('Helvetica', 'bold');
      doc.text('No', 18, 53);
      doc.text('Kode', 25, 53);
      doc.text('Kategori', 42, 53);
      doc.text('Judul Buku', 70, 53);
      doc.text('Pengarang', 125, 53);
      doc.text('Penerbit', 160, 53);
      doc.text('Stok', 188, 53);
      doc.setTextColor(40, 40, 40);
      doc.setFont('Helvetica', 'normal');
      y = 60;
    }

    // Zebra striping
    if (idx % 2 === 1) {
      doc.setFillColor(245, 245, 240);
      doc.rect(15, y - 4, 180, 6, 'F');
    }

    // Truncate long titles/authors to fit
    const truncatedTitle = book.judul.length > 30 ? book.judul.substring(0, 28) + '...' : book.judul;
    const truncatedAuth = book.pengarang.length > 20 ? book.pengarang.substring(0, 18) + '...' : book.pengarang;
    const truncatedPub = book.penerbit.length > 15 ? book.penerbit.substring(0, 13) + '...' : book.penerbit;

    doc.text((idx + 1).toString(), 18, y);
    doc.text(book.kodeBuku, 25, y);
    doc.text(book.kategori, 42, y);
    doc.text(truncatedTitle, 70, y);
    doc.text(truncatedAuth, 125, y);
    doc.text(truncatedPub, 160, y);
    doc.text(book.stock.toString(), 190, y, { align: 'right' });

    // Underline row
    doc.setDrawColor(230, 230, 230);
    doc.line(15, y + 2, 195, y + 2);

    y += 6;
  });

  drawFooter(doc, 1);
  doc.save('Laporan_Data_Buku_SMP_RK_Makmur.pdf');
};

export const downloadMembersPDF = (members: Member[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  drawHeader(doc, 'LAPORAN DATA ANGGOTA PERPUSTAKAAN');

  doc.setFillColor(26, 26, 26);
  doc.rect(15, 48, 180, 7, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('No', 18, 53);
  doc.text('No. Anggota', 25, 53);
  doc.text('Nama Lengkap', 55, 53);
  doc.text('Kelas', 110, 53);
  doc.text('Jenis Kelamin', 135, 53);
  doc.text('Status', 170, 53);

  doc.setTextColor(40, 40, 40);
  doc.setFont('Helvetica', 'normal');
  let y = 60;
  members.forEach((member, idx) => {
    if (y > 270) {
      drawFooter(doc, 1);
      doc.addPage();
      drawHeader(doc, 'LAPORAN DATA ANGGOTA PERPUSTAKAAN');
      doc.setFillColor(26, 26, 26);
      doc.rect(15, 48, 180, 7, 'F');
      doc.setTextColor(212, 175, 55);
      doc.setFont('Helvetica', 'bold');
      doc.text('No', 18, 53);
      doc.text('No. Anggota', 25, 53);
      doc.text('Nama Lengkap', 55, 53);
      doc.text('Kelas', 110, 53);
      doc.text('Jenis Kelamin', 135, 53);
      doc.text('Status', 170, 53);
      doc.setTextColor(40, 40, 40);
      doc.setFont('Helvetica', 'normal');
      y = 60;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(245, 245, 240);
      doc.rect(15, y - 4, 180, 6, 'F');
    }

    doc.text((idx + 1).toString(), 18, y);
    doc.text(member.nomorAnggota, 25, y);
    doc.text(member.nama, 55, y);
    doc.text(member.kelas, 110, y);
    doc.text(member.jenisKelamin, 135, y);
    doc.text(member.status, 170, y);

    doc.setDrawColor(230, 230, 230);
    doc.line(15, y + 2, 195, y + 2);

    y += 6;
  });

  drawFooter(doc, 1);
  doc.save('Laporan_Anggota_SMP_RK_Makmur.pdf');
};

export const downloadBorrowingsPDF = (borrowings: Borrowing[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  drawHeader(doc, 'LAPORAN TRANSAKSI PEMINJAMAN BUKU');

  doc.setFillColor(26, 26, 26);
  doc.rect(15, 48, 180, 7, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ID Trans.', 17, 53);
  doc.text('Peminjam (Kelas)', 37, 53);
  doc.text('Buku / Judul', 85, 53);
  doc.text('Tgl Pinjam', 135, 53);
  doc.text('Harus Kembali', 158, 53);
  doc.text('Status', 183, 53);

  doc.setTextColor(40, 40, 40);
  doc.setFont('Helvetica', 'normal');
  let y = 60;
  borrowings.forEach((b, idx) => {
    if (y > 270) {
      drawFooter(doc, 1);
      doc.addPage();
      drawHeader(doc, 'LAPORAN TRANSAKSI PEMINJAMAN BUKU');
      doc.setFillColor(26, 26, 26);
      doc.rect(15, 48, 180, 7, 'F');
      doc.setTextColor(212, 175, 55);
      doc.text('ID Trans.', 17, 53);
      doc.text('Peminjam (Kelas)', 37, 53);
      doc.text('Buku / Judul', 85, 53);
      doc.text('Tgl Pinjam', 135, 53);
      doc.text('Harus Kembali', 158, 53);
      doc.text('Status', 183, 53);
      doc.setTextColor(40, 40, 40);
      doc.setFont('Helvetica', 'normal');
      y = 60;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(245, 245, 240);
      doc.rect(15, y - 4, 180, 6, 'F');
    }

    const truncatedBorrower = `${b.namaAnggota} (${b.kelasAnggota})`;
    const displayBorrower = truncatedBorrower.length > 28 ? truncatedBorrower.substring(0, 26) + '..' : truncatedBorrower;
    const truncatedBook = `${b.kodeBuku} - ${b.judulBuku}`;
    const displayBook = truncatedBook.length > 30 ? truncatedBook.substring(0, 28) + '..' : truncatedBook;

    doc.text(b.id, 17, y);
    doc.text(displayBorrower, 37, y);
    doc.text(displayBook, 85, y);
    doc.text(b.tanggalPinjam, 135, y);
    doc.text(b.tanggalHarusKembali, 158, y);
    
    // Status color
    if (b.status === 'Dipinjam') {
      doc.setTextColor(180, 100, 0); // Orange
    } else {
      doc.setTextColor(0, 120, 0); // Green
    }
    doc.setFont('Helvetica', 'bold');
    doc.text(b.status, 183, y);
    
    doc.setTextColor(40, 40, 40);
    doc.setFont('Helvetica', 'normal');

    doc.setDrawColor(230, 230, 230);
    doc.line(15, y + 2, 195, y + 2);

    y += 6;
  });

  drawFooter(doc, 1);
  doc.save('Laporan_Peminjaman_SMP_RK_Makmur.pdf');
};

export const downloadVisitorsPDF = (visitors: Visitor[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  drawHeader(doc, 'LAPORAN DATA KUNJUNGAN PERPUSTAKAAN');

  doc.setFillColor(26, 26, 26);
  doc.rect(15, 48, 180, 7, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('No', 18, 53);
  doc.text('Nama Pengunjung', 25, 53);
  doc.text('Kelas / Kategori', 80, 53);
  doc.text('Tujuan Kunjungan', 110, 53);
  doc.text('Waktu Kunjungan', 155, 53);

  doc.setTextColor(40, 40, 40);
  doc.setFont('Helvetica', 'normal');
  let y = 60;
  visitors.forEach((visitor, idx) => {
    if (y > 270) {
      drawFooter(doc, 1);
      doc.addPage();
      drawHeader(doc, 'LAPORAN DATA KUNJUNGAN PERPUSTAKAAN');
      doc.setFillColor(26, 26, 26);
      doc.rect(15, 48, 180, 7, 'F');
      doc.setTextColor(212, 175, 55);
      doc.setFont('Helvetica', 'bold');
      doc.text('No', 18, 53);
      doc.text('Nama Pengunjung', 25, 53);
      doc.text('Kelas / Kategori', 80, 53);
      doc.text('Tujuan Kunjungan', 110, 53);
      doc.text('Waktu Kunjungan', 155, 53);
      doc.setTextColor(40, 40, 40);
      doc.setFont('Helvetica', 'normal');
      y = 60;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(245, 245, 240);
      doc.rect(15, y - 4, 180, 6, 'F');
    }

    doc.text((idx + 1).toString(), 18, y);
    doc.text(visitor.nama, 25, y);
    doc.text(visitor.kelas, 80, y);
    doc.text(visitor.tujuan, 110, y);
    doc.text(visitor.tanggal, 155, y);

    doc.setDrawColor(230, 230, 230);
    doc.line(15, y + 2, 195, y + 2);

    y += 6;
  });

  drawFooter(doc, 1);
  doc.save('Laporan_Kunjungan_SMP_RK_Makmur.pdf');
};

export const downloadSummaryPDF = (
  books: Book[],
  members: Member[],
  borrowings: Borrowing[],
  visitors: Visitor[]
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  drawHeader(doc, 'LAPORAN RINGKASAN PERPUSTAKAAN');

  // Print brief statistical summary box
  doc.setFillColor(248, 244, 230);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.rect(15, 48, 180, 40, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 26, 26);
  doc.text('RINGKASAN STATISTIK PERPUSTAKAAN:', 20, 55);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total Buku Terdaftar     : ${books.length} Buku (Total Stok: ${books.reduce((acc, curr) => acc + curr.stock, 0)} eks)`, 20, 62);
  doc.text(`Total Anggota Perpustakaan: ${members.length} Orang (${members.filter(m => m.status === 'Aktif').length} Aktif)`, 20, 68);
  doc.text(`Total Transaksi Peminjaman: ${borrowings.length} Kali (${borrowings.filter(b => b.status === 'Dipinjam').length} Sedang Dipinjam)`, 20, 74);
  doc.text(`Total Kunjungan Siswa/Guru: ${visitors.length} Kunjungan Hari Ini/Keseluruhan`, 20, 80);

  // Recent Borrowers list inside report
  doc.setFillColor(26, 26, 26);
  doc.rect(15, 96, 180, 7, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DAFTAR BUKU POPULER SAAT INI', 18, 101);

  doc.setTextColor(40, 40, 40);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  let y = 110;
  
  // Show first 5 books as popular
  const popularBooks = [...books].sort((a, b) => b.stock - a.stock).slice(0, 5);
  popularBooks.forEach((book, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(245, 245, 240);
      doc.rect(15, y - 4, 180, 6, 'F');
    }

    doc.text(`${idx + 1}.`, 18, y);
    doc.text(`${book.kodeBuku} - ${book.judul}`, 25, y);
    doc.text(`Kategori: ${book.kategori}`, 100, y);
    doc.text(`Pengarang: ${book.pengarang}`, 140, y);
    
    doc.setDrawColor(230, 230, 230);
    doc.line(15, y + 2, 195, y + 2);
    y += 6;
  });

  // Recent 5 borrowings
  y += 10;
  doc.setFillColor(26, 26, 26);
  doc.rect(15, y - 5, 180, 7, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('5 TRANSAKSI TERAKHIR', 18, y);

  doc.setTextColor(40, 40, 40);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  y += 5;
  const recentBorrows = [...borrowings].slice(-5).reverse();
  recentBorrows.forEach((b, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(245, 245, 240);
      doc.rect(15, y - 4, 180, 6, 'F');
    }

    doc.text(`${idx + 1}.`, 18, y);
    doc.text(`${b.namaAnggota} (${b.kelasAnggota})`, 25, y);
    doc.text(`Meminjam: "${b.judulBuku}"`, 80, y);
    doc.text(`Tgl: ${b.tanggalPinjam}`, 145, y);
    doc.text(b.status, 180, y, { align: 'right' });

    doc.setDrawColor(230, 230, 230);
    doc.line(15, y + 2, 195, y + 2);
    y += 6;
  });

  // Signature area (Petugas Perpustakaan)
  y += 15;
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text('Petugas Perpustakaan,', 195, y, { align: 'right' });
  
  y += 20;
  doc.setFont('Helvetica', 'bold');
  doc.text('Agnes Maria Sabrina Sinaga, S.A.P', 195, y, { align: 'right' });

  drawFooter(doc, 1);
  doc.save('Ringkasan_Laporan_SMP_RK_Makmur.pdf');
};

// Periodic report helpers
const parseDateString = (dateStr: string): Date => {
  const parts = dateStr.split(' ')[0].split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(dateStr);
};

const isWithinPeriod = (dateStr: string, period: 'weekly' | 'monthly' | 'yearly'): boolean => {
  if (!dateStr) return false;
  const itemDate = parseDateString(dateStr);
  const today = new Date();
  
  // Reset hours to compare dates only
  today.setHours(23, 59, 59, 999);
  itemDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - itemDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (period === 'weekly') {
    return diffDays >= 0 && diffDays <= 7;
  } else if (period === 'monthly') {
    return diffDays >= 0 && diffDays <= 30;
  } else {
    return diffDays >= 0 && diffDays <= 365;
  }
};

const generatePeriodicReportPDF = (
  title: string,
  periodText: string,
  filteredBorrowings: Borrowing[],
  filteredVisitors: Visitor[],
  books: Book[],
  members: Member[],
  fileName: string
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  let currentPage = 1;
  drawHeader(doc, `${title}\n(${periodText})`);

  // Periodic Summary Box
  doc.setFillColor(248, 244, 230); // Warm gold cream
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.rect(15, 52, 180, 36, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text('RINGKASAN AKTIVITAS PERIODE:', 20, 58);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  
  const totalDenda = filteredBorrowings.reduce((acc, curr) => acc + (curr.denda || 0), 0);
  const kembaliCount = filteredBorrowings.filter(b => b.status === 'Kembali').length;
  const pinjamCount = filteredBorrowings.filter(b => b.status === 'Dipinjam').length;

  doc.text(`• Total Peminjaman Baru : ${filteredBorrowings.length} Kali (${pinjamCount} Aktif, ${kembaliCount} Kembali)`, 20, 65);
  doc.text(`• Total Kunjungan Siswa : ${filteredVisitors.length} Kunjungan tercatat`, 20, 71);
  doc.text(`• Kas Denda Terkumpul   : Rp ${totalDenda.toLocaleString('id-ID')}`, 20, 77);
  doc.text(`• Cakupan Laporan       : ${periodText}`, 20, 83);

  let y = 98;

  // Render Borrowings Table Header
  doc.setFillColor(26, 26, 26);
  doc.rect(15, y - 5, 180, 7, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TRANSAKSI PEMINJAMAN PADA PERIODE INI', 18, y);

  y += 8;
  doc.setFillColor(40, 40, 40);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ID', 17, y);
  doc.text('Peminjam (Kelas)', 32, y);
  doc.text('Buku', 80, y);
  doc.text('Tgl Pinjam', 135, y);
  doc.text('Status', 162, y);
  doc.text('Denda', 182, y);

  doc.setTextColor(40, 40, 40);
  doc.setFont('Helvetica', 'normal');
  y += 6;

  if (filteredBorrowings.length === 0) {
    doc.text('Tidak ada transaksi peminjaman pada periode ini.', 20, y);
    y += 8;
  } else {
    filteredBorrowings.forEach((b, idx) => {
      if (y > 270) {
        drawFooter(doc, currentPage);
        doc.addPage();
        currentPage++;
        drawHeader(doc, `${title}\n(${periodText})`);
        
        // Redraw table headers on new page
        y = 52;
        doc.setFillColor(40, 40, 40);
        doc.rect(15, y - 4, 180, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('ID', 17, y);
        doc.text('Peminjam (Kelas)', 32, y);
        doc.text('Buku', 80, y);
        doc.text('Tgl Pinjam', 135, y);
        doc.text('Status', 162, y);
        doc.text('Denda', 182, y);
        
        doc.setTextColor(40, 40, 40);
        doc.setFont('Helvetica', 'normal');
        y += 6;
      }

      if (idx % 2 === 1) {
        doc.setFillColor(245, 245, 240);
        doc.rect(15, y - 4, 180, 6, 'F');
      }

      const truncatedBorrower = `${b.namaAnggota} (${b.kelasAnggota})`;
      const displayBorrower = truncatedBorrower.length > 25 ? truncatedBorrower.substring(0, 23) + '..' : truncatedBorrower;
      const truncatedBook = b.judulBuku;
      const displayBook = truncatedBook.length > 30 ? truncatedBook.substring(0, 28) + '..' : truncatedBook;
      const dendaText = b.denda && b.denda > 0 ? `Rp ${b.denda.toLocaleString('id-ID')}` : '-';

      doc.text(b.id, 17, y);
      doc.text(displayBorrower, 32, y);
      doc.text(displayBook, 80, y);
      doc.text(b.tanggalPinjam, 135, y);
      doc.text(b.status, 162, y);
      doc.text(dendaText, 182, y);

      doc.setDrawColor(230, 230, 230);
      doc.line(15, y + 2, 195, y + 2);
      y += 6;
    });
  }

  // Render Visitors Table Header
  y += 8;
  if (y > 250) {
    drawFooter(doc, currentPage);
    doc.addPage();
    currentPage++;
    drawHeader(doc, `${title}\n(${periodText})`);
    y = 50;
  }

  doc.setFillColor(26, 26, 26);
  doc.rect(15, y - 5, 180, 7, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('LOG KUNJUNGAN PERPUSTAKAAN PADA PERIODE INI', 18, y);

  y += 8;
  doc.setFillColor(40, 40, 40);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('No', 17, y);
  doc.text('Nama Pengunjung', 25, y);
  doc.text('Kelas / Kategori', 80, y);
  doc.text('Tujuan Kunjungan', 115, y);
  doc.text('Waktu Kunjungan', 155, y);

  doc.setTextColor(40, 40, 40);
  doc.setFont('Helvetica', 'normal');
  y += 6;

  if (filteredVisitors.length === 0) {
    doc.text('Tidak ada catatan kunjungan pada periode ini.', 20, y);
    y += 8;
  } else {
    filteredVisitors.forEach((visitor, idx) => {
      if (y > 270) {
        drawFooter(doc, currentPage);
        doc.addPage();
        currentPage++;
        drawHeader(doc, `${title}\n(${periodText})`);
        
        // Redraw table headers on new page
        y = 52;
        doc.setFillColor(40, 40, 40);
        doc.rect(15, y - 4, 180, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('No', 17, y);
        doc.text('Nama Pengunjung', 25, y);
        doc.text('Kelas / Kategori', 80, y);
        doc.text('Tujuan Kunjungan', 115, y);
        doc.text('Waktu Kunjungan', 155, y);
        
        doc.setTextColor(40, 40, 40);
        doc.setFont('Helvetica', 'normal');
        y += 6;
      }

      if (idx % 2 === 1) {
        doc.setFillColor(245, 245, 240);
        doc.rect(15, y - 4, 180, 6, 'F');
      }

      doc.text((idx + 1).toString(), 18, y);
      doc.text(visitor.nama, 25, y);
      doc.text(visitor.kelas, 80, y);
      doc.text(visitor.tujuan, 115, y);
      doc.text(visitor.tanggal, 155, y);

      doc.setDrawColor(230, 230, 230);
      doc.line(15, y + 2, 195, y + 2);
      y += 6;
    });
  }

  // Signature area (Petugas Perpustakaan)
  y += 12;
  if (y > 250) {
    drawFooter(doc, currentPage);
    doc.addPage();
    currentPage++;
    drawHeader(doc, `${title}\n(${periodText})`);
    y = 60;
  }

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text('Petugas Perpustakaan,', 195, y, { align: 'right' });
  
  y += 18;
  doc.setFont('Helvetica', 'bold');
  doc.text('Agnes Maria Sabrina Sinaga, S.A.P', 195, y, { align: 'right' });

  drawFooter(doc, currentPage);
  doc.save(fileName);
};

export const downloadWeeklyReportPDF = (
  books: Book[],
  members: Member[],
  borrowings: Borrowing[],
  visitors: Visitor[]
) => {
  const filteredBorrowings = borrowings.filter(b => isWithinPeriod(b.tanggalPinjam, 'weekly'));
  const filteredVisitors = visitors.filter(v => isWithinPeriod(v.tanggal, 'weekly'));
  generatePeriodicReportPDF('LAPORAN MINGGUAN PERPUSTAKAAN', 'Mingguan (7 Hari Terakhir)', filteredBorrowings, filteredVisitors, books, members, 'Laporan_Mingguan_Perpustakaan.pdf');
};

export const downloadMonthlyReportPDF = (
  books: Book[],
  members: Member[],
  borrowings: Borrowing[],
  visitors: Visitor[]
) => {
  const filteredBorrowings = borrowings.filter(b => isWithinPeriod(b.tanggalPinjam, 'monthly'));
  const filteredVisitors = visitors.filter(v => isWithinPeriod(v.tanggal, 'monthly'));
  generatePeriodicReportPDF('LAPORAN BULANAN PERPUSTAKAAN', 'Bulanan (30 Hari Terakhir)', filteredBorrowings, filteredVisitors, books, members, 'Laporan_Bulanan_Perpustakaan.pdf');
};

export const downloadYearlyReportPDF = (
  books: Book[],
  members: Member[],
  borrowings: Borrowing[],
  visitors: Visitor[]
) => {
  const filteredBorrowings = borrowings.filter(b => isWithinPeriod(b.tanggalPinjam, 'yearly'));
  const filteredVisitors = visitors.filter(v => isWithinPeriod(v.tanggal, 'yearly'));
  generatePeriodicReportPDF('LAPORAN TAHUNAN PERPUSTAKAAN', 'Tahunan (365 Hari Terakhir)', filteredBorrowings, filteredVisitors, books, members, 'Laporan_Tahunan_Perpustakaan.pdf');
};
