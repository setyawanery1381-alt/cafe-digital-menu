# ☕ Cafe Digital Menu Book & Admin CMS

Aplikasi Web Buku Menu Digital Interaktif untuk Kafe & Restoran, terinspirasi langsung dari arsitektur performa tinggi **book.poutercoffee.id**.

Pelanggan cukup memindai (scan) QR Code di meja mereka menggunakan kamera HP, dan buku menu akan terbuka secara instan, halus, dan interaktif tanpa perlu mengunduh file PDF secara manual!

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

## 🚀 Panduan Menjalankan Aplikasi

### 1. Instalasi Dependensi
Buka terminal di direktori proyek dan jalankan:
```bash
npm install
```

### 2. Menjalankan Server
```bash
npm start
```

### 3. Mengakses Aplikasi
- **Buku Menu Pelanggan**: [http://localhost:3000](http://localhost:3000)
- **Simulasi Meja Tertentu**: [http://localhost:3000/?meja=05](http://localhost:3000/?meja=05)
- **Dashboard Admin CMS**: [http://localhost:3000/admin](http://localhost:3000/admin) *(PIN Default: `1234`)*

---

## 📁 Struktur Direktori

```text
cafe-digital-menu/
├── server.js               # Express API & Static File Server
├── package.json            # Dependensi dan script project
├── data/
│   └── settings.json       # Penyimpanan konfigurasi kafe & statistik (Zero-DB)
├── uploads/
│   ├── menu.pdf            # File PDF menu aktif yang ditampilkan ke pelanggan
│   └── logo.png            # File logo kafe yang diunggah
├── public/
│   ├── index.html          # Halaman penampil menu untuk pelanggan
│   ├── app.js              # PDF Engine interaktif (Scroll, Page, Pinch Zoom, Sharpening)
│   ├── style.css           # Desain modern kafe dengan safe-area mobile insets
│   ├── assets/
│   │   ├── pdf.min.js      # Library PDF.js offline-ready
│   │   ├── pdf.worker.min.js
│   │   ├── qrcode.min.js   # Generator QR code
│   │   └── default-logo.svg
│   └── admin/
│       ├── index.html      # Dashboard Admin CMS
│       ├── admin.js        # Logika upload PDF, setting, & cetak QR meja
│       └── admin.css       # Desain elegan dashboard admin
```

---

## 🌐 Panduan Deploy ke Internet (Production)

### Opsi A: Deploy ke VPS / cPanel / Node.js Hostinger
1. Unggah seluruh isi folder proyek ke hosting Anda.
2. Pastikan versi Node.js minimal v18 atau v20.
3. Jalankan `npm install` lalu jalankan service dengan PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "menu-pouter"
   ```

### Opsi B: Deploy ke Cloud Gratis (Render / Railway)
1. Hubungkan repository GitHub Anda ke [Render.com](https://render.com) atau [Railway.app](https://railway.app).
2. Set Build Command: `npm install`
3. Set Start Command: `node server.js`
4. Aplikasi akan langsung aktif dengan URL publik HTTPS gratis!
