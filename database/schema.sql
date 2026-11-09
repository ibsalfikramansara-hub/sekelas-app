-- ============================================================================
-- Skema Database Relasional — SEKELAS Class App
-- Kompatibel: PostgreSQL (production / Supabase / Railway) & MySQL (XAMPP / Laragon)
-- Catatan untuk MySQL: ganti SERIAL -> INT AUTO_INCREMENT, TIMESTAMP untuk deadline,
-- dan pastikan mode SQL strict diaktifkan.
-- ============================================================================

-- ---------------------------------------------------------
-- 1. Tabel Kelas (contoh: X.E-4)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS kelas (
    id SERIAL PRIMARY KEY,
    nama_kelas VARCHAR(20) NOT NULL UNIQUE,
    wali_kelas_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 2. Tabel Users & Autentikasi
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nis VARCHAR(20) NULL UNIQUE,
    nip VARCHAR(20) NULL UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NULL UNIQUE,
    role VARCHAR(30) NOT NULL DEFAULT 'siswa', -- siswa | wali_kelas | guru_mapel | orang_tua | admin
    jabatan_pengurus VARCHAR(30) DEFAULT 'anggota', -- anggota | ketua_kelas | sekretaris | bendahara
    kelas_id INT NULL REFERENCES kelas(id),
    parent_of_id INT NULL REFERENCES users(id), -- orang tua -> id siswa anaknya
    avatar_url VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 3. Tabel Jadwal Pelajaran
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS jadwal_pelajaran (
    id SERIAL PRIMARY KEY,
    kelas_id INT NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    hari VARCHAR(15) NOT NULL,
    jam_ke INT NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    mata_pelajaran VARCHAR(100) NOT NULL,
    guru_id INT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 4. Tabel Jadwal Piket (rotasi harian)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS jadwal_piket (
    id SERIAL PRIMARY KEY,
    kelas_id INT NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    siswa_id INT NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'terjadwal', -- terjadwal | selesai | pelanggaran
    catatan TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (kelas_id, tanggal, siswa_id)
);

-- ---------------------------------------------------------
-- 5. Tabel Pelanggaran & Poin Sikap
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pelanggaran (
    id SERIAL PRIMARY KEY,
    siswa_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pelapor_id INT NOT NULL REFERENCES users(id),
    kelas_id INT NOT NULL REFERENCES kelas(id),
    jenis_pelanggaran VARCHAR(255) NOT NULL,
    poin_minus INT DEFAULT 0,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'tercatat', -- tercatat | ditindaklanjuti | selesai
    catatan_pembinaan TEXT NULL,
    tindak_lanjut_oleh INT NULL REFERENCES users(id),
    selesai_pada TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 6. Tabel Transaksi Keuangan (Kas Masuk/Keluar & Tabungan)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaksi_keuangan (
    id SERIAL PRIMARY KEY,
    kelas_id INT NOT NULL REFERENCES kelas(id),
    siswa_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
    bendahara_id INT NOT NULL REFERENCES users(id),
    tipe VARCHAR(30) NOT NULL, -- kas_masuk | kas_keluar | tabungan_masuk | tabungan_keluar
    jumlah DECIMAL(12, 2) NOT NULL,
    keterangan VARCHAR(255) NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status_approval VARCHAR(20) DEFAULT 'approved', -- pending | approved | ditolak
    disetujui_oleh INT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 7. Tabel Tugas (dibuat oleh Guru Mapel)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS tugas (
    id SERIAL PRIMARY KEY,
    guru_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kelas_id INT NOT NULL REFERENCES kelas(id),
    mata_pelajaran VARCHAR(100) NOT NULL,
    judul VARCHAR(150) NOT NULL,
    deskripsi TEXT NULL,
    file_instruksi VARCHAR(255) NULL,
    deadline TIMESTAMP NOT NULL,
    poin_maksimal INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 8. Tabel Pengumpulan Tugas (dari Siswa)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pengumpulan_tugas (
    id SERIAL PRIMARY KEY,
    tugas_id INT NOT NULL REFERENCES tugas(id) ON DELETE CASCADE,
    siswa_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_path VARCHAR(255) NULL,
    catatan_siswa TEXT NULL,
    nilai INT NULL,
    status VARCHAR(30) DEFAULT 'belum_kumpul', -- belum_kumpul | terkumpul | dinilai
    submitted_at TIMESTAMP NULL,
    dinilai_oleh INT NULL REFERENCES users(id),
    dinilai_pada TIMESTAMP NULL,
    catatan_guru TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tugas_id, siswa_id)
);

-- ---------------------------------------------------------
-- 9. Tabel Notifikasi
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifikasi (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    judul VARCHAR(150) NOT NULL,
    pesan TEXT NULL,
    tipe VARCHAR(30) DEFAULT 'info', -- info | sukses | peringatan | error
    dibaca BOOLEAN DEFAULT FALSE,
    link VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Index untuk performa query umum
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_kelas ON users(kelas_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_kelas_hari ON jadwal_pelajaran(kelas_id, hari);
CREATE INDEX IF NOT EXISTS idx_jadwal_piket_tanggal ON jadwal_piket(tanggal);
CREATE INDEX IF NOT EXISTS idx_pelanggaran_siswa ON pelanggaran(siswa_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi_keuangan(tanggal);
CREATE INDEX IF NOT EXISTS idx_transaksi_tipe ON transaksi_keuangan(tipe);
CREATE INDEX IF NOT EXISTS idx_pengumpulan_tugas ON pengumpulan_tugas(tugas_id, siswa_id);
CREATE INDEX IF NOT EXISTS idx_notifikasi_user ON notifikasi(user_id, dibaca);