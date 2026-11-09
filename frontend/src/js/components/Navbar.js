/**
 * Navbar Component — menampilkan informasi user yang login dan judul halaman aktif.
 */

const ROLE_LABELS = {
  siswa: 'Siswa',
  wali_kelas: 'Wali Kelas',
  guru_mapel: 'Guru Mapel',
  orang_tua: 'Orang Tua',
  admin: 'Administrator',
};

const TITLE_MAP = {
  '#/dashboard': 'Dashboard Ringkasan',
  '#/dashboard/admin': 'Dashboard Administrator',
  '#/dashboard/siswa': 'Dashboard Siswa',
  '#/dashboard/wali-kelas': 'Dashboard Wali Kelas',
  '#/dashboard/guru': 'Dashboard Guru Mapel',
  '#/dashboard/guru-mapel': 'Dashboard Guru Mapel',
  '#/dashboard/orang-tua': 'Dashboard Orang Tua',
  '#/users': 'Manajemen Pengguna & Hak Akses',
  '#/murid': 'Data Siswa & Profil Kelas',
  '#/pengurus': 'Struktur Pengurus Kelas',
  '#/kelas': 'Profil Kelas X.E-4',
  '#/jadwal': 'Jadwal Pelajaran & Piket',
  '#/absen': 'Presensi & Kehadiran',
  '#/kas': 'Keuangan Kas & Tabungan',
  '#/poin': 'Catatan Kedisiplinan & Poin',
  '#/tugas': 'Manajemen Tugas Kelas',
  '#/tugas/nilai': 'Evaluasi & Penilaian Tugas',
};

export function renderNavbar(user, currentPath) {
  if (!user) return;

  const roleBadge = document.getElementById('user-role-badge');
  const fullNameEl = document.getElementById('user-fullname');
  const usernameEl = document.getElementById('user-username');
  const avatarEl = document.getElementById('user-avatar');
  const titleEl = document.getElementById('page-title');

  if (roleBadge) {
    let label = ROLE_LABELS[user.role] || user.role;
    if (user.role === 'siswa' && user.jabatanPengurus && user.jabatanPengurus !== 'anggota') {
      const jabatanLabels = {
        ketua_kelas: 'Ketua Kelas',
        sekretaris: 'Sekretaris',
        bendahara: 'Bendahara',
        seksi_kebersihan: 'Seksi Kebersihan',
        seksi_keamanan: 'Seksi Keamanan',
      };
      label = `Siswa • ${jabatanLabels[user.jabatanPengurus] || user.jabatanPengurus}`;
    }
    roleBadge.textContent = label;
  }

  if (fullNameEl) fullNameEl.textContent = user.fullName || user.username || 'Pengguna';
  if (usernameEl) usernameEl.textContent = `@${user.username || 'user'}`;
  if (avatarEl) {
    const initial = (user.fullName || user.username || '?').charAt(0).toUpperCase();
    avatarEl.textContent = initial;
  }

  if (titleEl && currentPath) {
    titleEl.textContent = TITLE_MAP[currentPath] || 'SEKELAS — Aplikasi Kelas Digital';
  }
}
