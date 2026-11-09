/**
 * Sidebar Component — Full-Color Modern Purple Theme
 * Menyajikan menu navigasi sesuai matriks hak akses (RBAC) setiap role & jabatan pengurus.
 */

const MENU_BY_ROLE = {
  admin: [
    { label: 'Dashboard Admin', icon: '📊', path: '#/dashboard' },
    { label: 'Manajemen User', icon: '🛡️', path: '#/users' },
    { label: 'Data Siswa & Kelas', icon: '👨‍🎓', path: '#/murid' },
    { label: 'Jadwal & Piket', icon: '📅', path: '#/jadwal' },
    { label: 'Presensi Harian', icon: '✅', path: '#/absen' },
    { label: 'Kas & Tabungan', icon: '💰', path: '#/kas' },
    { label: 'Catatan Poin', icon: '⚠️', path: '#/poin' },
    { label: 'Manajemen Tugas', icon: '📚', path: '#/tugas' },
  ],
  wali_kelas: [
    { label: 'Dashboard Wali', icon: '📊', path: '#/dashboard/wali-kelas' },
    { label: 'Data Siswa & Pengurus', icon: '👨‍🎓', path: '#/murid' },
    { label: 'Jadwal & Piket', icon: '📅', path: '#/jadwal' },
    { label: 'Presensi Harian', icon: '✅', path: '#/absen' },
    { label: 'Kas & Tabungan', icon: '💰', path: '#/kas' },
    { label: 'Catatan Poin', icon: '⚠️', path: '#/poin' },
    { label: 'Monitoring Tugas', icon: '📚', path: '#/tugas' },
  ],
  guru_mapel: [
    { label: 'Dashboard Guru', icon: '📊', path: '#/dashboard/guru' },
    { label: 'Jadwal Mengajar', icon: '📅', path: '#/jadwal' },
    { label: 'Direktori Siswa', icon: '👨‍🎓', path: '#/murid' },
    { label: 'Manajemen Tugas', icon: '📚', path: '#/tugas' },
    { label: 'Penilaian Tugas', icon: '📝', path: '#/tugas/nilai' },
  ],
  siswa: [
    { label: 'Dashboard Siswa', icon: '📊', path: '#/dashboard/siswa' },
    { label: 'Teman Sekelas', icon: '👨‍🎓', path: '#/murid' },
    { label: 'Jadwal & Piket', icon: '📅', path: '#/jadwal' },
    { label: 'Presensi Kelas', icon: '✅', path: '#/absen' },
    { label: 'Tugas Saya', icon: '📚', path: '#/tugas' },
    { label: 'Poin Kedisiplinan', icon: '🏅', path: '#/poin' },
    { label: 'Kas & Tabungan', icon: '💰', path: '#/kas' },
  ],
  orang_tua: [
    { label: 'Dashboard Orang Tua', icon: '📊', path: '#/dashboard/orang-tua' },
    { label: 'Profil Anak & Kelas', icon: '👨‍🎓', path: '#/murid' },
    { label: 'Jadwal Belajar', icon: '📅', path: '#/jadwal' },
    { label: 'Kehadiran Anak', icon: '✅', path: '#/absen' },
    { label: 'Tugas & Nilai Anak', icon: '📚', path: '#/tugas' },
    { label: 'Kas & Tabungan Anak', icon: '💰', path: '#/kas' },
    { label: 'Catatan Sikap Anak', icon: '🏅', path: '#/poin' },
  ],
};

const JABATAN_LABELS = {
  ketua_kelas: 'Ketua Kelas',
  sekretaris: 'Sekretaris',
  bendahara: 'Bendahara',
  seksi_kebersihan: 'Seksi Kebersihan',
  seksi_keamanan: 'Seksi Keamanan',
};

export function renderSidebar(containerEl, user, navigateFn) {
  if (!containerEl || !user) return;
  const menuItems = MENU_BY_ROLE[user.role] || MENU_BY_ROLE.siswa;

  // Badge khusus pengurus jika siswa memegang amanah jabatan
  let roleBanner = '';
  if (user.role === 'siswa' && user.jabatanPengurus && user.jabatanPengurus !== 'anggota') {
    roleBanner = `
      <div class="mb-3 px-3.5 py-2.5 bg-white/15 border border-white/25 rounded-2xl backdrop-blur-sm">
        <div class="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider flex items-center gap-1">
          <span>⭐</span> Amanah Pengurus
        </div>
        <div class="text-xs font-black text-white mt-0.5">${JABATAN_LABELS[user.jabatanPengurus] || user.jabatanPengurus}</div>
      </div>
    `;
  } else if (user.role === 'admin') {
    roleBanner = `
      <div class="mb-3 px-3.5 py-2 bg-white/15 border border-white/25 rounded-2xl backdrop-blur-sm">
        <div class="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider">🛡️ Super Admin</div>
        <div class="text-[11px] font-bold text-white/90 mt-0.5">Otoritas Penuh Sistem</div>
      </div>
    `;
  } else if (user.role === 'orang_tua') {
    roleBanner = `
      <div class="mb-3 px-3.5 py-2 bg-white/15 border border-white/25 rounded-2xl backdrop-blur-sm">
        <div class="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider">👪 Portal Wali Murid</div>
        <div class="text-[11px] font-bold text-white/90 mt-0.5 truncate">${user.parentOfName || 'Ahmad Ajriel Irfan'}</div>
      </div>
    `;
  }

  containerEl.innerHTML = `
    <div class="space-y-1">
      ${roleBanner}
      ${menuItems
        .map(
          (item) => `
        <a href="${item.path}"
          class="sidebar-item flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white/80 hover:bg-white/15 hover:text-white transition group cursor-pointer"
          data-path="${item.path}">
          <span class="w-6 text-center text-base">${item.icon}</span>
          <span class="tracking-wide">${item.label}</span>
        </a>
      `
        )
        .join('')}
    </div>
  `;

  // Bersihkan listener lama agar tidak duplikat saat berganti akun
  if (containerEl._sidebarClickHandler) {
    containerEl.removeEventListener('click', containerEl._sidebarClickHandler);
  }

  const handleClick = (e) => {
    const link = e.target.closest('[data-path]');
    if (!link) return;
    e.preventDefault();
    const path = link.getAttribute('data-path');
    navigateFn(path);

    // Tutup drawer mobile otomatis saat item diklik
    const sidebarAside = document.getElementById('sidebar');
    if (window.innerWidth < 1024 && sidebarAside) {
      sidebarAside.classList.add('hidden');
    }
  };

  containerEl._sidebarClickHandler = handleClick;
  containerEl.addEventListener('click', handleClick);
}
