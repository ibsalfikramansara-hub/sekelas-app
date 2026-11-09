# 📁 Struktur Folder Proyek — SEKELAS Class App (Production-Ready)

Struktur berikut menggabungkan semua file prototipe siswa (`index.html`, `loginapk.html`, `murid.html`, `kasapk.html`, `jadwal2.html`, `absen.html`, `poin.html`, `tugasmurid.html`) ke dalam satu arsitektur terpisah antara **Backend API (Node.js/Express + Prisma)** dan **Frontend SPA (vanilla JS + Tailwind CSS)**.

```text
sekelas-app/
│
├── backend/                     # Backend REST API (Node.js + Express + Prisma ORM)
│   ├── prisma/
│   │   ├── schema.prisma        # ORM schema (dihasilkan dari database/schema.sql)
│   │   └── migrations/          # Migrasi database (versi-tabel)
│   │       └── 001_init.sql
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js            # Koneksi DB: switchable Lokal (Docker/XAMPP) vs Online (Supabase/Railway)
│   │   │   └── passport.js      # (opsional) Strategi autentikasi tambahan
│   │   ├── controllers/         # Logika bisnis per modul
│   │   │   ├── authController.js        # Login, register, role detection, logout
│   │   │   ├── userController.js        # Manajemen user & profil siswa/pengurus
│   │   │   ├── dashboardController.js   # Statistik ringkasan dashboard per role
│   │   │   ├── jadwalController.js      # Jadwal pelajaran & piket
│   │   │   ├── kasController.js         # Setoran, pengeluaran, tabungan kas
│   │   │   ├── absenController.js       # Presensi harian & verifikasi piket
│   │   │   ├── poinController.js        # Pelanggaran & poin prestasi
│   │   │   └── tugasController.js       # Pengumpulan & penilaian tugas
│   │   ├── middleware/
│   │   │   ├── auth.js              # Verifikasi JWT + RBAC (role & jabatan)
│   │   │   ├── validate.js          # Validasi request (zod / express-validator)
│   │   │   └── errorHandler.js      # Penanganan error terpusat
│   │   ├── routes/                # Definisi endpoint API
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── jadwalRoutes.js
│   │   │   ├── kasRoutes.js
│   │   │   ├── absenRoutes.js
│   │   │   ├── poinRoutes.js
│   │   │   └── tugasRoutes.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── response.js        # Helper response standar (success/error)
│   │   └── server.js              # Titik masuk Express (app + listen)
│   ├── .env.example               # Contoh variabel environment (lokal & online)
│   ├── .env                       # (gitignored) variabel aktual deployment
│   ├── package.json
│   └── Dockerfile                 # (opsional) Kontainerisasi backend
│
├── frontend/                      # SPA Frontend (Tailwind CSS + Vanilla JS)
│   ├── index.html                 # Shell SPA (single entry, router berbasis hash)
│   ├── assets/
│   │   ├── css/
│   │   │   └── tailwind.css       # Build output Tailwind (produksi) / CDN (demo)
│   │   ├── img/
│   │   │   └── foto-kelas.jpg     # Dipindahkan dari assets lama
│   │   └── js/
│   │       ├── config.js          # Base URL API + environment switch
│   │       ├── store.js           # State sederhana (auth, toast, loading)
│   │       ├── api.js             # Wrapper fetch/axios + token injector
│   │       ├── router.js          # SPA router (hash-based)
│   │       ├── app.js             # Bootstrap inisialisasi aplikasi
│   │       ├── components/
│   │       │   ├── Navbar.js      # Navigasi atas responsif
│   │       │   ├── Sidebar.js     # Sidebar yang menyesuaikan menu per role
│   │       │   ├── Toast.js       # Notifikasi toast/alert
│   │       │   ├── Loading.js     # Indikator loading global & inline
│   │       │   ├── StatCard.js    # Kartu statistik dashboard
│   │       │   └── FormValidator.js # Validasi form klien sisi
│   │       └── views/
│   │           ├── LoginView.js           # Halaman login multi-role
│   │           ├── DashboardView.js       # Dashboard utama per role
│   │           ├── MuridView.js           # Data siswa & profil
│   │           ├── KasView.js             # Keuangan kas & tabungan
│   │           ├── JadwalView.js          # Jadwal pelajaran & piket
│   │           ├── AbsenView.js           # Presensi harian
│   │           ├── PoinView.js            # Poin pelanggaran/prestasi
│   │           └── TugasView.js           # Manajemen tugas
│   ├── package.json
│   └── vite.config.js             # (opsional) Build tool untuk produksi
│
├── docker-compose.yml             # Orchestrasi lokal: Postgres + backend + frontend
├── .env.example                   # Contoh environment root
├── .gitignore
├── README.md
└── docs/
    ├── PROJECT_STRUCTURE.md       # Berkas ini
    ├── DATABASE_SCHEMA.md
    └── API_ENDPOINTS.md
```

## Alasan Pemilihan Arsitektur

| Komponen | Pilihan | Alasan |
|----------|---------|--------|
| Backend Runtime | Node.js + Express | Ringan, banyak dokumentasi, mudah dipelajari siswa, ekosistem luas |
| ORM / Database | Prisma + PostgreSQL | Type-safe, migrasi terstruktur, support PostgreSQL/MySQL/SQLite, cocok untuk lokal & cloud |
| Frontend | Vanilla JS + Tailwind CSS | Tidak membangun bundling kompleks untuk demo, mudah dipelajari, responsif out-of-the-box; bisa diganti React/Vue nanti |
| Routing Frontend | Hash-based SPA Router | Tidak perlu konfigurasi server untuk histori HTML5, cocok untuk hosting statis + API terpisah |
| Autentikasi | JWT (jsonwebtoken) + bcryptjs | Stateless, cocok untuk SPA terpisah dari backend |
| Deployment Lokal | Docker Compose (Postgres) atau XAMPP/Laragon | Dapat dijalankan offline di sekolah tanpa internet |
| Deployment Online | Supabase / Railway / VPS | Hanya ganti `DATABASE_URL` di `.env`, tidak perlu ubah kode |

## Bagaimana File Lama Digabungkan

File-file prototipe siswa tidak dihapus, namun **dikonversi menjadi "view" dalam SPA**:

| File Asal | Modul Baru | Lokasi di Frontend SPA |
|-----------|------------|------------------------|
| `index.html`, `app.html` | Dashboard Utama (Multi-Role) | `views/DashboardView.js` |
| `loginapk.html` | Autentikasi & Otorisasi | `views/LoginView.js` |
| `murid.html` | Data Siswa & Profil | `views/MuridView.js` |
| `kasapk.html` | Keuangan (Kas & Tabungan) | `views/KasView.js` |
| `jadwal2.html` | Jadwal Pelajaran & Piket | `views/JadwalView.js` |
| `absen.html` | Presensi & Kehadiran | `views/AbsenView.js` |
| `poin.html` | Catatan Pelanggaran & Poin | `views/PoinView.js` |
| `tugasmurid.html` | Manajemen Tugas | `views/TugasView.js` |

Semua halaman sekarang berada dalam satu `index.html` SPA dan ditampilkan melalui router berdasarkan role pengguna yang login.