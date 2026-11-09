# SEKELAS — Aplikasi Kelas Digital (Production-Ready)

Aplikasi manajemen kelas bilingual ICT yang dikembangkan ulang dari prototipe HTML statis siswa menjadi **Single Page Application (SPA)** profesional dengan backend REST API, basis data relasional, autentikasi multi-role, dan antarmuka modern berbasis Tailwind CSS.

## 🚀 Fitur Utama
- **Autentikasi multi-role**: Siswa, Pengurus (Ketua/Sekretaris/Bendahara), Wali Kelas, Guru Mapel, Orang Tua, Admin.
- **RBAC (Role-Based Access Control)** sesuai matriks hak akses dokumen workflow.
- **Modul Terintegrasi**:
  1. **Dashboard Ringkasan**: Statistik kehadiran, tugas terkini, dan aktivitas pelanggaran/prestasi.
  2. **Data Siswa & Profil**: Profil 38 siswa kelas X.E-4, NISN, gender, struktur organisasi, dan live search.
  3. **Jadwal & Piket**: Jadwal mapel harian (Senin–Sabtu), les intensif UTBK, checklist regu piket interaktif, dan SOP kebersihan.
  4. **Presensi Harian**: Pencatatan kehadiran (Hadir/Sakit/Izin/Alpa) per tanggal, tombol "Tandai Semua Hadir", dan persentase kehadiran real-time.
  5. **Keuangan (Kas & Tabungan)**: Saldo kas aktif, iuran masuk, pengeluaran operasional, tabungan siswa, dan modal pencatatan bendahara.
  6. **Catatan Kedisiplinan & Poin**: Monitoring poin minus, buku riwayat sanksi/pembinaan wali kelas, dan tombol verifikasi selesai dibina.
  7. **Manajemen Tugas**: Publikasi tugas oleh Guru, penyerahan tugas oleh Siswa, dan penilaian nilai rapor (0–100).
- **UI/UX Modern**: Desain Tailwind CSS bertema *warm cream & soft teal*, responsif mobile-friendly, toast notifikasi, zero-flicker routing, dan persistensi sesi aman saat refresh (F5).

---

## ⚡ Cara Menjalankan Aplikasi

### Opsi 1: Paling Mudah — Sekali Klik (One-Click Runner)
Cukup **dobel-klik berkas berikut** di Windows Explorer:
```text
JALANKAN_SEKELAS.bat
```
Server portabel akan langsung menyala otomatis dan peramban web default akan langsung membuka:
👉 **`http://localhost:3000`** *(Nol instalasi paket, langsung jalan!)*

---

### Opsi 2: Mode Pengembang (Vite Frontend + Express Backend)

#### 1. Backend REST API
```bash
cd backend
npm install
npm run dev   # Berjalan di http://localhost:5000
```

#### 2. Frontend SPA
```bash
cd frontend
npm install
npm run dev   # Berjalan di http://localhost:5173
```

---

### Opsi 3: Docker Compose
```bash
docker compose up --build
# Backend: http://localhost:5000
# Frontend: http://localhost:5173
# Database: localhost:5432
```

---

## 🔐 Contoh Akun Demo

| Akun | Username | Password | Role di Dropdown |
| :--- | :--- | :--- | :--- |
| **Siswa Biasa** | `siswa1` | `123456` | Siswa / Pengurus Kelas |
| **Ketua Kelas** | `pengurus1` | `123456` | Siswa / Pengurus Kelas |
| **Bendahara** | `bendahara1` | `123456` | Siswa / Pengurus Kelas |
| **Sekretaris** | `sekretaris1`| `123456` | Siswa / Pengurus Kelas |
| **Wali Kelas** | `wali1` | `123456` | Wali Kelas |
| **Guru Mapel** | `guru1` | `123456` | Guru Mapel |
| **Orang Tua** | `ortu1` | `123456` | Orang Tua Siswa |
| **Administrator** | `admin` | `123456` | Administrator |

---

## 📂 Struktur Berkas
- `PROJECT_STRUCTURE.md` — Panduan struktur folder modular
- `database/schema.sql` — Skema basis data relasional PostgreSQL / MySQL
- `backend/prisma/schema.prisma` — Skema ORM Prisma
- `backend/prisma/seed.js` — Script migrasi data awal kelas & akun demo
- `frontend/src/js/views/` — Modul tampilan SPA (`MuridView`, `JadwalView`, `AbsenView`, `KasView`, `PoinView`, `TugasView`)
- `server-portable.js` — Server mandiri zero-dependency untuk eksekusi satu langkah
