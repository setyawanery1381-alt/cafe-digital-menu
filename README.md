# ☕ Cafe Digital Menu Book & Admin CMS

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/setyawanery1381-alt/cafe-digital-menu)

Aplikasi Web Buku Menu Digital Interaktif untuk Kafe & Restoran, terinspirasi langsung dari arsitektur performa tinggi **book.poutercoffee.id**.

Pelanggan cukup memindai (scan) QR Code di meja mereka menggunakan kamera HP, dan buku menu akan terbuka secara instan, halus, dan interaktif tanpa perlu mengunduh file PDF secara manual!

---

## 🚀 Live Demo & Deployment

- **Repository GitHub**: [https://github.com/setyawanery1381-alt/cafe-digital-menu](https://github.com/setyawanery1381-alt/cafe-digital-menu)
- **Deploy 1-Click ke Vercel**: Klik tombol **Deploy with Vercel** di atas atau buka [Vercel New Project](https://vercel.com/new/clone?repository-url=https://github.com/setyawanery1381-alt/cafe-digital-menu).

---

## ✨ Fitur Unggulan

### 📱 Tampilan Pelanggan (Customer Viewer)
- **Ultra-Fast & Mobile-First**: Dioptimalkan khusus untuk layar HP, tablet, dan desktop dengan dukungan *safe-area insets* (poni iPhone & gesture bar Android).
- **Dual Mode Tampilan**:
  - **Mode Gulir (*Scroll Mode*)**: Membaca menu secara vertikal berkelanjutan dari atas ke bawah.
  - **Mode Halaman (*Page/Flip Mode*)**: Membaca satu halaman per layar dengan navigasi tombol *Prev/Next* dan gestur *swipe* kiri-kanan.
- **Pinch-To-Zoom & Double-Tap**: Memperbesar dan memperkecil menu dengan cubitan dua jari secara halus dengan penguncian titik fokus (*focal center*).
- **Mesin Pertajam Otomatis (*Smart Deferred Sharpening*)**:
  - Halaman dimuat terlebih dahulu dengan cepat pada resolusi ringan.
  - Saat berhenti menggulir atau di-zoom, kanvas otomatis digambar ulang dengan ketajaman Retina (2x Device Pixel Ratio).
  - Dilengkapi sistem proteksi memori HP (`MAX_DIM = 2400` dan batas buffer 5 halaman) agar browser HP tidak *crash* atau *lag*.
- **Deteksi Nomor Meja Otomatis**: Jika QR code dibuka dengan parameter URL (contoh: `/?meja=05`), sistem otomatis menampilkan lencana nomor meja.
- **Floating WhatsApp Order / Call Waiter**: Tombol cepat untuk langsung chat ke WhatsApp kasir/waiter dengan pesan otomatis yang menyertakan nomor meja pelanggan.

---

### ⚙️ Dashboard Pengelola (Admin CMS)
- **Login PIN Aman**: Akses panel admin dengan proteksi PIN (Default PIN: `1234`, dapat diubah sewaktu-waktu).
- **Penggantian PDF Menu Mandiri**: Cukup *drag & drop* file PDF menu baru tanpa perlu menyentuh kode program.
- **Cache-Busting Otomatis**: Setiap kali PDF baru diunggah, versi timestamp diperbarui otomatis sehingga HP pelanggan langsung memuat menu terbaru tanpa kendala cache browser.
- **Generator QR Code Stand Meja**:
  - Buat QR Code unik untuk masing-masing meja (Meja 01, Meja 02, VIP, dll).
  - Fitur cetak langsung (*Print Tent Card*) dengan template kartu meja elegan siap ditaruh di atas meja kafe.
- **Pengaturan Brand & Tema**:
  - Ganti Nama Kafe, Tagline, dan Logo Kafe.
  - Sesuaikan warna aksen (*Brand Accent*) dan warna latar belakang (*Dark Background*).
  - Atur nomor WhatsApp kasir dan akun Instagram kafe.
- **Statistik Pengunjung**: Pantau total kunjungan dan pengunjung menu hari ini.

---

## 💻 Panduan Menjalankan Secara Lokal

### 1. Jalankan Server
```bash
npm start
```

### 2. Akses Aplikasi
- **Buku Menu Pelanggan**: [http://localhost:3000](http://localhost:3000)
- **Simulasi Meja Tertentu**: [http://localhost:3000/?meja=05](http://localhost:3000/?meja=05)
- **Dashboard Admin CMS**: [http://localhost:3000/admin](http://localhost:3000/admin) *(PIN Default: `1234`)*

---

## 🌐 Panduan Deploy ke Vercel

Proyek ini sudah dikonfigurasi dengan `vercel.json` dan serverless entrypoint `api/index.js`:
1. Buka [https://vercel.com/new](https://vercel.com/new).
2. Login dengan akun GitHub Anda (`setyawanery1381-alt`).
3. Cari repository **`cafe-digital-menu`** lalu klik **Import**.
4. Biarkan konfigurasi default, lalu klik **Deploy**.
5. Dalam ~1 menit, aplikasi buku menu digital Anda sudah live di internet dengan domain HTTPS gratis!
