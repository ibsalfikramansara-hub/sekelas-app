# Dokumentasi Spesifikasi & Workflow Aplikasi Kelas Bilingual ICT

Dokumen ini berisi panduan alur kerja (*workflow*), arsitektur sistem, skema database, serta instruksi penyempurnaan aplikasi dari prototipe HTML statis menjadi aplikasi web modern *production-ready*.

---

## 1. Pemetaan File Prototipe Siswa ke Modul Utama

| File Asal (Prototipe) | Modul Sistem Terintegrasi | Deskripsi & Peran Modul |
| :--- | :--- | :--- |
| `index.html` & `app.html` | Dashboard Utama (Multi-Role) | Ringkasan informasi, pengumuman, jadwal piket hari ini, dan tugas mendatang. |
| `loginapk.html` | Autentikasi & Otorisasi | Halaman login terpusat dengan deteksi *Role* dan *Jabatan*. |
| `murid.html` | Data Siswa & Profil | Manajemen profil siswa, struktur pengurus kelas, dan info kelas. |
| `kasapk.html` | Keuangan (Kas & Tabungan) | Pencatatan setoran kas, pengeluaran kas, serta tabungan siswa. |
| `jadwal2.html` | Jadwal Pelajaran & Piket | Manajemen jadwal mata pelajaran harian dan rotasi piket kelas. |
| `absen.html` | Presensi & Kehadiran | Pencatatan absensi harian dan verifikasi kehadiran piket. |
| `poin.html` | Catatan Pelanggaran & Poin | Monitoring poin sikap, pelanggaran piket, dan riwayat sanksi/pembinaan. |
| `tugasmurid.html` | Manajemen Tugas | Pengumpulan tugas oleh siswa dan verifikasi/input oleh Guru Mapel. |

---

## 2. Alur Login & Pengalihan Halaman (Multi-Role)

```
                       +-------------------+
                       |   Halaman Login   |
                       +---------+---------+
                                 |
                                 v
                       +-------------------+
                       |    Autentikasi    |
                       +----+---------+----+
                       Gagal|         |Berhasil
                            v         v
                  +------------+   +--------------------+
                  | Cek Login  |   | Cek Role & Jabatan |
                  +------------+   +---------+----------+
                                             |
     +-----------------+---------------------+---------------------+------------------+
     |                 |                     |                     |                  |
     v                 v                     v                     v                  v
[Siswa Biasa]   [Pengurus Kelas]        [Wali Kelas]          [Guru Mapel]       [Orang Tua]
     |                 |                     |                     |                  |
     v                 v                     v                     v                  v
 Dashboard        Dashboard Siswa       Dashboard Wali       Dashboard Guru     Dashboard Orang
   Siswa         + Menu Pengurus            Kelas                 Mapel               Tua
```

### Ketentuan Access Control:
- **Siswa**: Login akun pribadi. Jika diberi jabatan oleh Wali Kelas (Ketua/Sekretaris/Bendahara), menu pengurus otomatis aktif tanpa perlu pergantian akun.
- **Guru Mapel**: Hanya dapat mengakses dan mengelola tugas untuk kelas yang diampu.
- **Orang Tua**: Memiliki akses terbatas untuk melihat progress, status kas, tabungan, dan poin pelanggaran anak mereka sendiri.

---

## 3. Matriks Hak Akses (Role-Based Access Control)

| Menu / Fitur | Siswa | Pengurus (Ketua/Sekr) | Pengurus (Bendahara) | Wali Kelas | Guru Mapel | Orang Tua |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Dashboard Ringkasan | View | View | View | View | View | View |
| Jadwal Pelajaran & Piket | View | Manage | View | Manage | View | View |
| Catat Pelanggaran Piket | - | Manage | - | Review | - | - |
| Setoran Kas & Tabungan | View (Milik Sendiri) | - | Manage | Approval | - | View |
| Pengeluaran Kas Kelas | - | - | Manage | Approval | - | - |
| Input / Kelola Tugas | - | - | - | - | Manage | - |
| Pengumpulan Tugas | Submit | Submit | Submit | View | Review | View |
| Kelola Struktur Pengurus | - | - | - | Manage | - | - |
| Catatan Pelanggaran & Poin | View (Milik Sendiri) | Manage | - | Manage/Selesai | - | View |

---

## 4. Detail Workflow Utama

### 4.1 Alur Piket & Pencatatan Pelanggaran

```
                [Jadwal Piket Hari Ini]
                           |
                           v
              <Siswa Melaksanakan Piket?>
              /                         \
           Tidak                         Ya
            /                             \
           v                               v
[Pengurus: Catat Pelanggaran]   [Pengurus: Tandai Piket Terlaksana]
           |                               |
           v                               v
[Simpan ke Catatan Siswa]       [Rekap Piket Terupdate]
           |
           v
[Notifikasi ke Wali Kelas & Orang Tua]
           |
           v
   <Wali Kelas Tindak Lanjut?>
   /                         \
  Ya                        Tidak
 /                           \
v                             v
[Pembinaan/Sanksi Dicatat]    [Tetap Tercatat sebagai Riwayat]
|
v
[Status: Selesai Ditindaklanjuti]
```

---

### 4.2 Alur Iuran Kas & Tabungan

```
           [Siswa: Setor Kas / Tabungan ke Bendahara]
                               |
                               v
                  [Bendahara: Input Setoran]
                               |
                               v
                     <Jenis Setoran?>
                    /                \
             Tabungan                Iuran Kas
               /                          \
              v                            v
[Saldo Tabungan Pribadi +]    [Saldo Kas Kelas Bertambah]
              |                            |
              v                            +-----------------------+
[Riwayat Tabungan Terupdate]               |                       |
              |                            v                       v
              |               [Status Kas: Lunas Bulan Ini]  <Ada Pengeluaran?>
              |                            |                 /            \
              |                            |                Ya            Tidak
              \                            /               /                |
               v                          v               v                 v
            [Rekap Kas & Tabungan Terupdate]  [Bendahara: Catat Pengeluaran] |
                           |                              |                 |
                           v                              v                 v
           [Laporan Berkala ke Wali Kelas]     [Saldo Kas Berkurang] --------+
```

---

### 4.3 Alur Pengelolaan Tugas dari Guru

```
[Guru: Input Tugas Baru]
           |
           v
[Tugas Tampil di Dashboard Siswa]
           |
           v
[Siswa: Kerjakan & Kumpulkan Tugas]
           |
           v
[Guru: Cek Status Pengumpulan]
           |
           v
 <Semua Siswa Sudah Kumpul?>
 /                         \
Belum                       Ya
 /                           \
v                             v
[Notifikasi Pengingat (H-1)]   [Status Tugas: Selesai]
```

---

## 5. Rancangan Database Terpisah (Skema Relasional)

Untuk mendukung *deployment* lokal (XAMPP/Docker) dan online (Supabase/PostgreSQL/MySQL), skema database dipisahkan menjadi tabel-tabel berikut:

### 5.1 Skema Tabel

```sql
-- 1. Tabel Users & Autentikasi
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('siswa', 'wali_kelas', 'guru_mapel', 'orang_tua') NOT NULL,
    jabatan_pengurus ENUM('anggota', 'ketua_kelas', 'sekretaris', 'bendahara') DEFAULT 'anggota',
    parent_of_id INT NULL, -- Hubungan orang tua ke ID siswa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Jadwal Pelajaran & Piket
CREATE TABLE jadwal_pelajaran (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hari ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') NOT NULL,
    mata_pelajaran VARCHAR(100) NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    guru_id INT,
    FOREIGN KEY (guru_id) REFERENCES users(id)
);

CREATE TABLE jadwal_piket (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hari ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') NOT NULL,
    siswa_id INT NOT NULL,
    FOREIGN KEY (siswa_id) REFERENCES users(id)
);

-- 3. Tabel Pelanggaran & Poin
CREATE TABLE pelanggaran (
    id INT PRIMARY KEY AUTO_INCREMENT,
    siswa_id INT NOT NULL,
    pelapor_id INT NOT NULL, -- Pengurus / Wali Kelas
    jenis_pelanggaran VARCHAR(255) NOT NULL,
    poin_minus INT DEFAULT 0,
    tanggal DATE NOT NULL,
    status ENUM('tercatat', 'ditindaklanjuti', 'selesai') DEFAULT 'tercatat',
    catatan_pembinaan TEXT NULL,
    FOREIGN KEY (siswa_id) REFERENCES users(id),
    FOREIGN KEY (pelapor_id) REFERENCES users(id)
);

-- 4. Tabel Keuangan (Kas & Tabungan)
CREATE TABLE transaksi_keuangan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    siswa_id INT NULL, -- NULL jika pengeluaran kelas
    bendahara_id INT NOT NULL,
    tipe ENUM('kas_masuk', 'kas_keluar', 'tabungan_masuk', 'tabungan_keluar') NOT NULL,
    jumlah DECIMAL(12, 2) NOT NULL,
    keterangan VARCHAR(255),
    tanggal DATE NOT NULL,
    status_approval ENUM('pending', 'approved') DEFAULT 'approved',
    FOREIGN KEY (siswa_id) REFERENCES users(id),
    FOREIGN KEY (bendahara_id) REFERENCES users(id)
);

-- 5. Tabel Tugas & Pengumpulan
CREATE TABLE tugas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    guru_id INT NOT NULL,
    judul VARCHAR(150) NOT NULL,
    deskripsi TEXT,
    deadline DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guru_id) REFERENCES users(id)
);

CREATE TABLE pengumpulan_tugas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tugas_id INT NOT NULL,
    siswa_id INT NOT NULL,
    file_path VARCHAR(255),
    catatan_siswa TEXT,
    nilai INT NULL,
    status ENUM('belum_kumpul', 'terkumpul', 'dinilai') DEFAULT 'belum_kumpul',
    submitted_at TIMESTAMP NULL,
    FOREIGN KEY (tugas_id) REFERENCES tugas(id),
    FOREIGN KEY (siswa_id) REFERENCES users(id)
);
```

---

## 6. Prompt Pengembangan untuk AI / Tim Dev

Salin teks prompt di bawah ini untuk menginstruksikan AI atau tim pengembang dalam melakukan penyempurnaan sistem secara bertahap:

```text
Act as a Full-Stack Developer & UI/UX Designer.
Bantu saya mengkonversi prototipe aplikasi HTML statis (app.html, index.html, kasapk.html, absen.html, poin.html, dll) menjadi Single Page Application (SPA) / Web App utuh berbasis Node.js/Express (atau Framework pilihan) dengan ketentuan:

1. UI/UX Refactoring:
   - Gunakan Tailwind CSS atau Bootstrap 5 untuk desain modern, bersih, dan fully responsive.
   - Sediakan komponen Dashboard dinamis sesuai dengan 5 Role (Siswa, Pengurus, Wali Kelas, Guru Mapel, Orang Tua).

2. Database Multi-Environment:
   - Gunakan ORM (seperti Prisma / Sequelize) atau driver database terpisah dengan file konfigurasi (.env).
   - Pastikan aplikasi dapat berjalan di environment LOKAL (SQLite/MySQL/PostgreSQL via Docker/XAMPP) dan ONLINE (Supabase/Railway/Heroku).

3. Business Logic Compliance:
   - Terapkan logika alur bisnis sesuai dokumen workflow-kelas-bilingual-ict.md (autentikasi RBAC, pencatatan kas/tabungan, jadwal piket & sanksi pelanggaran, serta workflow pengumpulan tugas guru).

Mohon hasilkan:
- Struktur folder proyek modular (Separate Frontend & Backend API).
- Konfigurasi .env contoh untuk deployment lokal vs online.
- Templat halaman dashboard utama dan controller utama.
```