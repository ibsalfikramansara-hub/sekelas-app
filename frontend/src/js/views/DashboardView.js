/**
 * Dashboard View — Full-Color Modern Dashboard (Multi-Role Dinamis)
 * Terhubung langsung dengan dataStore terpusat (Users, Siswa, Kas, Poin, Tugas, Presensi)
 * Dilengkapi Wave Area Chart interaktif (Monthly/Weekly/Daily), Donut Chart Analytics,
 * Recent Activities dinamis, serta Pencarian Status Tugas langsung.
 */

import { getUsersDb, getStudentsDb, getKasDb, getPoinDb, getTugasDb } from '../dataStore.js';

const STAT_CONFIG = {
  admin: [
    { label: 'Total Akun User', key: 'users', icon: '🛡️', path: '#/users', grad: 'from-[#8E54E9] to-[#6C5CE7]', shadow: 'shadow-glow-purple' },
    { label: 'Total Siswa X.E-4', key: 'siswa', icon: '👨‍🎓', path: '#/murid', grad: 'from-[#0072ff] to-[#00c6ff]', shadow: 'shadow-glow-blue' },
    { label: 'Saldo Kas Kelas', key: 'kas', icon: '💰', path: '#/kas', grad: 'from-[#FF5E62] to-[#FF9966]', shadow: 'shadow-glow-coral' },
    { label: 'Tugas & Evaluasi', key: 'tugas', icon: '📚', path: '#/tugas', grad: 'from-[#F7971E] to-[#FFD200]', shadow: 'shadow-glow-amber' },
  ],
  wali_kelas: [
    { label: 'Total Siswa', key: 'siswa', icon: '👨‍🎓', path: '#/murid', grad: 'from-[#8E54E9] to-[#6C5CE7]', shadow: 'shadow-glow-purple' },
    { label: 'Kehadiran Hari Ini', key: 'persen', icon: '✅', path: '#/absen', grad: 'from-[#0072ff] to-[#00c6ff]', shadow: 'shadow-glow-blue' },
    { label: 'Saldo Kas Kelas', key: 'kas', icon: '💰', path: '#/kas', grad: 'from-[#FF5E62] to-[#FF9966]', shadow: 'shadow-glow-coral' },
    { label: 'Catatan Disiplin', key: 'pelanggaran', icon: '⚠️', path: '#/poin', grad: 'from-[#F7971E] to-[#FFD200]', shadow: 'shadow-glow-amber' },
  ],
  guru_mapel: [
    { label: 'Tugas Dipublikasi', key: 'tugas', icon: '📚', path: '#/tugas', grad: 'from-[#8E54E9] to-[#6C5CE7]', shadow: 'shadow-glow-purple' },
    { label: 'Sudah Dikumpulkan', key: 'kumpul', icon: '📥', path: '#/tugas', grad: 'from-[#0072ff] to-[#00c6ff]', shadow: 'shadow-glow-blue' },
    { label: 'Sudah Dinilai', key: 'dinilai', icon: '✅', path: '#/tugas/nilai', grad: 'from-[#FF5E62] to-[#FF9966]', shadow: 'shadow-glow-coral' },
    { label: 'Perlu Diperiksa', key: 'belum_nilai', icon: '⏳', path: '#/tugas/nilai', grad: 'from-[#F7971E] to-[#FFD200]', shadow: 'shadow-glow-amber' },
  ],
  siswa: [
    { label: 'Tugas Selesai', key: 'terkumpul', icon: '📚', path: '#/tugas', grad: 'from-[#8E54E9] to-[#6C5CE7]', shadow: 'shadow-glow-purple' },
    { label: 'Kehadiran Kelas', key: 'persen', icon: '✅', path: '#/absen', grad: 'from-[#0072ff] to-[#00c6ff]', shadow: 'shadow-glow-blue' },
    { label: 'Total Tabungan', key: 'tabungan', icon: '💰', path: '#/kas', grad: 'from-[#FF5E62] to-[#FF9966]', shadow: 'shadow-glow-coral' },
    { label: 'Indeks Disiplin', key: 'kepatuhan', icon: '⭐', path: '#/poin', grad: 'from-[#F7971E] to-[#FFD200]', shadow: 'shadow-glow-amber' },
  ],
  orang_tua: [
    { label: 'Kehadiran Anak', key: 'persen', icon: '👨‍🎓', path: '#/absen', grad: 'from-[#8E54E9] to-[#6C5CE7]', shadow: 'shadow-glow-purple' },
    { label: 'Tugas Anak Tuntas', key: 'terkumpul', icon: '📚', path: '#/tugas', grad: 'from-[#0072ff] to-[#00c6ff]', shadow: 'shadow-glow-blue' },
    { label: 'Tabungan Anak', key: 'tabungan_anak', icon: '💰', path: '#/kas', grad: 'from-[#FF5E62] to-[#FF9966]', shadow: 'shadow-glow-coral' },
    { label: 'Predikat Sikap', key: 'kepatuhan', icon: '⭐', path: '#/poin', grad: 'from-[#F7971E] to-[#FFD200]', shadow: 'shadow-glow-amber' },
  ],
};

const CHART_MODES = {
  monthly: {
    labels: ['Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
    orangeFill: 'M 0,140 Q 70,120 130,135 T 250,110 T 370,125 T 500,85 L 500,180 L 0,180 Z',
    orangeStroke: 'M 0,140 Q 70,120 130,135 T 250,110 T 370,125 T 500,85',
    purpleFill: 'M 0,130 Q 80,70 160,110 T 300,60 T 420,95 T 500,45 L 500,180 L 0,180 Z',
    purpleStroke: 'M 0,130 Q 80,70 160,110 T 300,60 T 420,95 T 500,45',
    points: [
      { cx: 160, cy: 110 },
      { cx: 300, cy: 60 },
      { cx: 420, cy: 95 },
      { cx: 500, cy: 45 },
    ],
    badge: '+12.5% semester ini',
  },
  weekly: {
    labels: ['Mg 1', 'Mg 2', 'Mg 3', 'Mg 4', 'Mg 5', 'Mg 6'],
    orangeFill: 'M 0,145 Q 85,105 170,120 T 310,95 T 410,110 T 500,70 L 500,180 L 0,180 Z',
    orangeStroke: 'M 0,145 Q 85,105 170,120 T 310,95 T 410,110 T 500,70',
    purpleFill: 'M 0,120 Q 90,90 175,75 T 310,85 T 415,55 T 500,35 L 500,180 L 0,180 Z',
    purpleStroke: 'M 0,120 Q 90,90 175,75 T 310,85 T 415,55 T 500,35',
    points: [
      { cx: 175, cy: 75 },
      { cx: 310, cy: 85 },
      { cx: 415, cy: 55 },
      { cx: 500, cy: 35 },
    ],
    badge: '+4.8% minggu ini',
  },
  daily: {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    orangeFill: 'M 0,135 Q 80,125 160,100 T 290,115 T 400,90 T 500,80 L 500,180 L 0,180 Z',
    orangeStroke: 'M 0,135 Q 80,125 160,100 T 290,115 T 400,90 T 500,80',
    purpleFill: 'M 0,115 Q 80,65 160,85 T 290,50 T 400,70 T 500,40 L 500,180 L 0,180 Z',
    purpleStroke: 'M 0,115 Q 80,65 160,85 T 290,50 T 400,70 T 500,40',
    points: [
      { cx: 160, cy: 85 },
      { cx: 290, cy: 50 },
      { cx: 400, cy: 70 },
      { cx: 500, cy: 40 },
    ],
    badge: 'Aktif Hari Ini',
  },
};

export function renderDashboardView(containerEl, storeRef, navigateFn) {
  const user = storeRef.user;
  if (!user) return { unmount: () => {} };

  let chartMode = 'monthly';
  let taskSearch = '';

  const roleBannerHtml = () => {
    if (user.role === 'admin') {
      return `
        <div class="bg-gradient-to-r from-[#5443E8] to-[#8E54E9] rounded-3xl p-5 text-white shadow-glow-purple flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl shrink-0">🛡️</div>
            <div>
              <div class="text-xs font-extrabold uppercase tracking-wider text-amber-300">Panel Kendali Super Admin</div>
              <div class="text-sm sm:text-base font-black">Kelola pengguna, role, struktur pengurus, dan seluruh operasional kelas X.E-4</div>
            </div>
          </div>
          <button onclick="window.navigateApp('#/users')" class="px-5 py-2.5 rounded-2xl bg-white text-[#5443E8] text-xs font-black hover:bg-indigo-50 transition shrink-0 self-start sm:self-auto shadow-md">
            Kelola Akun User →
          </button>
        </div>
      `;
    }
    if (user.role === 'orang_tua') {
      const childName = user.parentOfName || 'AHMAD AJRIEL IRFAN';
      return `
        <div class="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl shrink-0">👪</div>
            <div>
              <div class="text-xs font-extrabold uppercase tracking-wider text-emerald-100">Portal Monitoring Orang Tua Siswa</div>
              <div class="text-sm sm:text-base font-black">Memantau Perkembangan Ananda: <span class="underline decoration-amber-300">${childName}</span></div>
            </div>
          </div>
          <button onclick="window.navigateApp('#/kas')" class="px-5 py-2.5 rounded-2xl bg-white text-emerald-700 text-xs font-black hover:bg-emerald-50 transition shrink-0 self-start sm:self-auto shadow-md">
            Lihat Tabungan Anak →
          </button>
        </div>
      `;
    }
    if (user.role === 'siswa' && user.jabatanPengurus && user.jabatanPengurus !== 'anggota') {
      const jMap = {
        ketua_kelas: { title: 'Ketua Kelas', action: '#/absen', btn: 'Kelola Presensi & Piket →' },
        sekretaris: { title: 'Sekretaris Kelas', action: '#/absen', btn: 'Catat Presensi Harian →' },
        bendahara: { title: 'Bendahara Kelas', action: '#/kas', btn: 'Kelola Kas & Tabungan →' },
      };
      const info = jMap[user.jabatanPengurus] || { title: 'Pengurus Kelas', action: '#/jadwal', btn: 'Cek Piket Kelas →' };
      return `
        <div class="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-5 text-white shadow-glow-blue flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl shrink-0">⭐</div>
            <div>
              <div class="text-xs font-extrabold uppercase tracking-wider text-amber-300">Akses Khusus Pengurus Aktif: ${info.title}</div>
              <div class="text-sm font-bold">Anda memiliki hak akses pengelolaan langsung sesuai amanah jabatan pengurus kelas.</div>
            </div>
          </div>
          <button onclick="window.navigateApp('${info.action}')" class="px-5 py-2.5 rounded-2xl bg-white text-indigo-700 text-xs font-black hover:bg-indigo-50 transition shrink-0 self-start sm:self-auto shadow-md">
            ${info.btn}
          </button>
        </div>
      `;
    }
    return '';
  };

  containerEl.innerHTML = `
    <div class="space-y-7">
      
      <!-- Top Title & Subtitle Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p class="text-slate-500 text-xs sm:text-sm mt-0.5">
            Selamat datang di portal kelas <span class="font-bold text-indigo-600">X.E-4 Bilingual ICT</span>, <strong>${user.fullName || user.username}</strong>.
          </p>
        </div>
        <div class="flex items-center gap-2.5">
          <button id="btn-refresh-dashboard" class="px-4 py-2 rounded-2xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center gap-2">
            <span>🔄</span> Segarkan Data
          </button>
        </div>
      </div>

      ${roleBannerHtml()}

      <!-- 1. TIER ATAS: 4 KARTU STATISTIK FULL-COLOR GLOWING -->
      <div id="stats-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"></div>

      <!-- 2. TIER TENGAH: OVERVIEW CHART + DONUT ANALYTICS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Widget Kiri: Wave Area Chart Overview -->
        <div class="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100 flex flex-col justify-between">
          <div>
            <!-- Header Grafik -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 class="text-base font-extrabold text-slate-900">Aktivitas & Keuangan Kelas</h3>
                <p class="text-xs text-slate-400 mt-0.5">Ringkasan statistik operasional X.E-4</p>
              </div>

              <!-- Filter Waktu Interaktif (Monthly, Weekly, Daily) -->
              <div class="inline-flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold self-start">
                <button class="chart-tab px-3 py-1 rounded-lg bg-white text-indigo-600 shadow-xs transition" data-mode="monthly">Monthly</button>
                <button class="chart-tab px-3 py-1 rounded-lg text-slate-500 hover:text-slate-900 transition" data-mode="weekly">Weekly</button>
                <button class="chart-tab px-3 py-1 rounded-lg text-slate-500 hover:text-slate-900 transition" data-mode="daily">Daily</button>
              </div>
            </div>

            <!-- Nilai Utama Kas / Kehadiran -->
            <div class="flex items-baseline gap-4 mb-1">
              <div class="text-3xl font-black text-slate-900" id="main-metric-val">Rp 0</div>
              <span id="chart-growth-badge" class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">+12.5% semester ini</span>
            </div>
            <p class="text-xs text-slate-400 mb-4">Total dana kas & tabungan terkelola kelas X.E-4</p>

            <!-- SVG Multi-Wave Area Chart Modern -->
            <div class="w-full h-48 relative overflow-hidden">
              <svg id="dashboard-wave-svg" viewBox="0 0 500 180" class="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8E54E9" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#8E54E9" stop-opacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#FF9966" stop-opacity="0.30"/>
                    <stop offset="100%" stop-color="#FF9966" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <line x1="0" y1="40" x2="500" y2="40" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4" />

                <path id="wave-orange-fill" d="${CHART_MODES.monthly.orangeFill}" fill="url(#orangeGradient)" />
                <path id="wave-orange-stroke" d="${CHART_MODES.monthly.orangeStroke}" fill="none" stroke="#FFA726" stroke-width="2.5" />

                <path id="wave-purple-fill" d="${CHART_MODES.monthly.purpleFill}" fill="url(#purpleGradient)" />
                <path id="wave-purple-stroke" d="${CHART_MODES.monthly.purpleStroke}" fill="none" stroke="#7C3AED" stroke-width="3" />

                <g id="wave-points-group">
                  <circle cx="160" cy="110" r="4" fill="#7C3AED" stroke="#FFFFFF" stroke-width="2" />
                  <circle cx="300" cy="60" r="5" fill="#7C3AED" stroke="#FFFFFF" stroke-width="2.5" />
                  <circle cx="420" cy="95" r="4" fill="#7C3AED" stroke="#FFFFFF" stroke-width="2" />
                  <circle cx="500" cy="45" r="5" fill="#7C3AED" stroke="#FFFFFF" stroke-width="2" />
                </g>
              </svg>
            </div>
            <!-- Sumbu X -->
            <div id="chart-x-labels" class="flex justify-between text-[11px] font-semibold text-slate-400 px-1 mt-1">
              <span>Jul</span><span>Agt</span><span>Sep</span><span>Okt</span><span>Nov</span><span>Des</span>
            </div>
          </div>

          <!-- 4 Mini Metric Pills di Bawah Grafik -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-4 border-t border-slate-100">
            <div class="flex items-center gap-2.5">
              <span class="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0"></span>
              <div>
                <div class="text-[10px] uppercase font-bold text-slate-400">Kas Masuk</div>
                <div class="text-xs font-black text-slate-800" id="sub-stat-1">Rp 0</div>
              </div>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="w-3.5 h-3.5 rounded-full bg-indigo-500 shrink-0"></span>
              <div>
                <div class="text-[10px] uppercase font-bold text-slate-400">Kas Keluar</div>
                <div class="text-xs font-black text-slate-800" id="sub-stat-2">Rp 0</div>
              </div>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0"></span>
              <div>
                <div class="text-[10px] uppercase font-bold text-slate-400">Tabungan</div>
                <div class="text-xs font-black text-slate-800" id="sub-stat-3">Rp 0</div>
              </div>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="w-3.5 h-3.5 rounded-full bg-cyan-500 shrink-0"></span>
              <div>
                <div class="text-[10px] uppercase font-bold text-slate-400">Ketuntasan</div>
                <div class="text-xs font-black text-slate-800" id="sub-stat-4">0%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget Kanan: Donut Chart Analytics -->
        <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Analytics Kelas</h3>
              <p class="text-[11px] text-slate-400">Proporsi kehadiran & tugas</p>
            </div>
            <button onclick="window.navigateApp('#/absen')" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-xs font-bold transition" title="Lihat Detail Presensi">Detail →</button>
          </div>

          <!-- Donut Ring SVG -->
          <div class="relative w-48 h-48 mx-auto my-2 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" stroke="#F1F5F9" stroke-width="12" fill="transparent" />
              <circle cx="50" cy="50" r="38" stroke="#6C5CE7" stroke-width="12" stroke-dasharray="238.7" stroke-dashoffset="47.7" stroke-linecap="round" fill="transparent" />
              <circle cx="50" cy="50" r="38" stroke="#FDCB6E" stroke-width="12" stroke-dasharray="238.7" stroke-dashoffset="202.9" stroke-linecap="round" fill="transparent" />
              <circle cx="50" cy="50" r="38" stroke="#FF7675" stroke-width="12" stroke-dasharray="238.7" stroke-dashoffset="226.7" stroke-linecap="round" fill="transparent" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-3xl font-black text-slate-900 tracking-tight" id="donut-percent">95%</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aktif & Tertib</span>
            </div>
          </div>

          <!-- Legenda Donut -->
          <div class="flex items-center justify-center gap-4 text-xs font-bold text-slate-600 pt-3 border-t border-slate-100">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#6C5CE7]"></span> Hadir</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#FDCB6E]"></span> Izin/Sakit</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#FF7675]"></span> Tugas</span>
          </div>
        </div>

      </div>

      <!-- 3. TIER BAWAH: RECENT ACTIVITIES + CLASS STATUS TABLE -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Kiri: Recent Activities -->
        <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-base font-extrabold text-slate-900">Aktivitas Terbaru</h3>
            <button onclick="window.navigateApp('#/poin')" class="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">Lihat Semua</button>
          </div>

          <div id="activity-timeline" class="space-y-4"></div>
        </div>

        <!-- Kanan: Class Status / Tugas Terkini -->
        <div class="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100 overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Status Tugas & Evaluasi Terkini</h3>
              <p class="text-xs text-slate-400 mt-0.5">Pantau progres pengumpulan dan penilaian tugas kelas X.E-4</p>
            </div>

            <!-- Tombol Kelola + Search Pill -->
            <div class="flex items-center gap-2">
              <button onclick="window.navigateApp('#/tugas')" class="px-3.5 py-1.5 rounded-xl bg-[#FF5E62] text-white text-xs font-bold hover:bg-rose-600 transition shadow-xs flex items-center gap-1.5">
                <span>📚</span> ${user.role === 'guru_mapel' || user.role === 'admin' || user.role === 'wali_kelas' ? 'Kelola Tugas' : 'Buka Tugas'}
              </button>
              <div class="relative">
                <input type="text" id="filter-task-input" placeholder="Cari tugas..." class="w-32 sm:w-40 pl-7 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" />
                <span class="absolute left-2.5 top-2 text-[10px] text-slate-400">🔍</span>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                <tr>
                  <th class="pb-3">Judul Tugas</th>
                  <th class="pb-3">Mata Pelajaran</th>
                  <th class="pb-3">Deadline</th>
                  <th class="pb-3 text-right">Status / Nilai</th>
                </tr>
              </thead>
              <tbody id="class-status-tbody" class="divide-y divide-slate-100"></tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `;

  // Listener Segarkan Data
  const btnRefresh = document.getElementById('btn-refresh-dashboard');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      loadDashboardData();
      storeRef.success('Metrik analitik berhasil disegarkan.');
    });
  }

  // Listener Tab Grafik (Monthly / Weekly / Daily)
  containerEl.querySelectorAll('.chart-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      chartMode = btn.getAttribute('data-mode');
      containerEl.querySelectorAll('.chart-tab').forEach((b) => {
        b.className =
          b.getAttribute('data-mode') === chartMode
            ? 'chart-tab px-3 py-1 rounded-lg bg-white text-indigo-600 shadow-xs transition'
            : 'chart-tab px-3 py-1 rounded-lg text-slate-500 hover:text-slate-900 transition';
      });
      const cfg = CHART_MODES[chartMode] || CHART_MODES.monthly;
      document.getElementById('wave-orange-fill')?.setAttribute('d', cfg.orangeFill);
      document.getElementById('wave-orange-stroke')?.setAttribute('d', cfg.orangeStroke);
      document.getElementById('wave-purple-fill')?.setAttribute('d', cfg.purpleFill);
      document.getElementById('wave-purple-stroke')?.setAttribute('d', cfg.purpleStroke);

      const ptsGroup = document.getElementById('wave-points-group');
      if (ptsGroup) {
        ptsGroup.innerHTML = cfg.points
          .map((p) => `<circle cx="${p.cx}" cy="${p.cy}" r="4.5" fill="#7C3AED" stroke="#FFFFFF" stroke-width="2" />`)
          .join('');
      }
      const xLabels = document.getElementById('chart-x-labels');
      if (xLabels) {
        xLabels.innerHTML = cfg.labels.map((l) => `<span>${l}</span>`).join('');
      }
      const badge = document.getElementById('chart-growth-badge');
      if (badge) badge.textContent = cfg.badge;
    });
  });

  // Listener Pencarian Tugas di Dashboard
  const filterTaskInput = document.getElementById('filter-task-input');
  if (filterTaskInput) {
    filterTaskInput.addEventListener('input', (e) => {
      taskSearch = e.target.value.toLowerCase();
      renderTaskTable();
    });
  }

  function renderTaskTable() {
    const statusTbody = document.getElementById('class-status-tbody');
    if (!statusTbody) return;
    const localTugas = getTugasDb();
    const filtered = localTugas.filter(
      (t) =>
        t.judul.toLowerCase().includes(taskSearch) ||
        t.mapel.toLowerCase().includes(taskSearch)
    );

    if (filtered.length > 0) {
      statusTbody.innerHTML = filtered
        .map((t) => {
          const dl = t.deadline ? t.deadline.slice(0, 10) : '-';
          return `
          <tr class="hover:bg-slate-50/80 transition cursor-pointer" onclick="window.navigateApp('#/tugas')">
            <td class="py-3.5 font-bold text-slate-800">${t.judul}</td>
            <td class="py-3.5 text-slate-500">${t.mapel}</td>
            <td class="py-3.5 font-mono text-[11px] text-slate-500">${dl}</td>
            <td class="py-3.5 text-right">
              <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                t.nilai !== null
                  ? 'bg-emerald-100 text-emerald-700'
                  : t.status === 'terkumpul'
                  ? 'bg-sky-100 text-[#0072ff]'
                  : 'bg-rose-100 text-[#FF5E62]'
              }">
                ${t.nilai !== null ? `Nilai: ${t.nilai}` : t.status === 'terkumpul' ? 'Terkumpul' : 'Belum Kumpul'}
              </span>
            </td>
          </tr>
        `;
        })
        .join('');
    } else {
      statusTbody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-slate-400">Tidak ada tugas yang cocok dengan pencarian.</td></tr>`;
    }
  }

  function loadDashboardData() {
    const statsGrid = document.getElementById('stats-grid');
    const activityTimeline = document.getElementById('activity-timeline');
    if (!statsGrid) return;

    const usersList = getUsersDb();
    const studentsList = getStudentsDb();
    const localKas = getKasDb();
    const localTugas = getTugasDb();
    const localCases = getPoinDb();

    let saldoKas = 0;
    let totalKasMasuk = 0;
    let totalKasKeluar = 0;
    let totalTabungan = 0;
    let tabunganAnak = 0;
    const childName = (user.parentOfName || 'AHMAD AJRIEL IRFAN').toLowerCase();

    localKas.forEach((t) => {
      const j = Number(t.jumlah) || 0;
      if (t.tipe === 'kas_masuk') {
        saldoKas += j;
        totalKasMasuk += j;
      } else if (t.tipe === 'kas_keluar') {
        saldoKas -= j;
        totalKasKeluar += j;
      } else if (t.tipe === 'tabungan_masuk') {
        totalTabungan += j;
        if ((t.siswa || '').toLowerCase() === childName) tabunganAnak += j;
      } else if (t.tipe === 'tabungan_keluar') {
        totalTabungan -= j;
        if ((t.siswa || '').toLowerCase() === childName) tabunganAnak -= j;
      }
    });

    const totalT = localTugas.length || 1;
    const selesaiT = localTugas.filter((t) => t.status === 'dinilai' || t.status === 'terkumpul').length;
    const dinilaiT = localTugas.filter((t) => t.nilai !== null || t.status === 'dinilai').length;
    const belumNilaiT = localTugas.filter((t) => t.status === 'terkumpul' && t.nilai === null).length;
    const persenTuntas = Math.round((selesaiT / totalT) * 100);

    // Hitung kehadiran hari ini
    const d = new Date();
    const todayISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let persenHadir = 97;
    try {
      const attAll = JSON.parse(localStorage.getItem('sekelas_attendance_data') || '{}');
      if (attAll[todayISO]) {
        const vals = Object.values(attAll[todayISO]);
        if (vals.length > 0) {
          const hCount = vals.filter((v) => v === 'H').length;
          persenHadir = Math.round((hCount / studentsList.length) * 100);
        }
      }
    } catch (e) {}

    const pelanggaranCases = localCases.filter((c) => c.kategori !== 'prestasi');
    const indeksKepatuhan = Math.max(85, 100 - pelanggaranCases.length * 0.8).toFixed(1);

    // Update Mini Metrics di bawah Wave Chart
    const sub1 = document.getElementById('sub-stat-1');
    const sub2 = document.getElementById('sub-stat-2');
    const sub3 = document.getElementById('sub-stat-3');
    const sub4 = document.getElementById('sub-stat-4');
    if (sub1) sub1.textContent = `Rp ${totalKasMasuk.toLocaleString('id-ID')}`;
    if (sub2) sub2.textContent = `Rp ${totalKasKeluar.toLocaleString('id-ID')}`;
    if (sub3) sub3.textContent = `Rp ${totalTabungan.toLocaleString('id-ID')}`;
    if (sub4) sub4.textContent = `${persenTuntas}%`;

    const donutEl = document.getElementById('donut-percent');
    if (donutEl) donutEl.textContent = `${persenHadir}%`;

    const mainVal = document.getElementById('main-metric-val');
    if (mainVal) mainVal.textContent = `Rp ${(saldoKas + totalTabungan).toLocaleString('id-ID')}`;

    // Render 4 Kartu Stat Gradient Full-Color Glow (Dapat Diklik)
    const cards = STAT_CONFIG[user.role] || STAT_CONFIG.siswa;
    statsGrid.innerHTML = cards
      .map((card) => {
        let val = '0';
        if (card.key === 'users') val = `${usersList.length} Akun`;
        else if (card.key === 'siswa') val = `${studentsList.length} Siswa`;
        else if (card.key === 'kas') val = `Rp ${saldoKas.toLocaleString('id-ID')}`;
        else if (card.key === 'tugas') val = `${localTugas.length} Tugas`;
        else if (card.key === 'terkumpul' || card.key === 'kumpul') val = `${selesaiT} / ${localTugas.length}`;
        else if (card.key === 'dinilai') val = `${dinilaiT} Tugas`;
        else if (card.key === 'belum_nilai') val = `${belumNilaiT} Tugas`;
        else if (card.key === 'persen') val = `${persenHadir}%`;
        else if (card.key === 'tabungan') val = `Rp ${totalTabungan.toLocaleString('id-ID')}`;
        else if (card.key === 'tabungan_anak') val = `Rp ${tabunganAnak.toLocaleString('id-ID')}`;
        else if (card.key === 'pelanggaran') val = `${pelanggaranCases.length} Catatan`;
        else if (card.key === 'kepatuhan') val = `${indeksKepatuhan}%`;

        return `
        <div onclick="window.navigateApp('${card.path}')" class="cursor-pointer relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r ${card.grad} text-white ${card.shadow} transition transform hover:-translate-y-1 duration-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0 shadow-inner">
              ${card.icon}
            </div>
            <div class="min-w-0">
              <div class="text-xl sm:text-2xl font-black tracking-tight leading-tight truncate">${val}</div>
              <div class="text-xs font-semibold text-white/85 mt-1">${card.label}</div>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    // Render Recent Activities Dinamis dari Data Nyata
    if (activityTimeline) {
      const latestTask = localTugas[0];
      const latestKas = localKas[0];
      const latestPoin = localCases[0];

      const activities = [
        {
          time: 'Terbaru',
          title: latestTask ? `Tugas: ${latestTask.judul}` : 'Tugas Kelas Aktif',
          desc: latestTask ? `${latestTask.mapel} • ${latestTask.guru}` : 'Semua tugas terpantau',
          dot: 'bg-[#FF5E62]',
          icon: '📚',
          path: '#/tugas',
        },
        {
          time: latestKas ? latestKas.tanggal : 'Keuangan',
          title: latestKas ? `${latestKas.keterangan}` : 'Kas Kelas Stabil',
          desc: latestKas ? `Nominal: Rp ${Number(latestKas.jumlah).toLocaleString('id-ID')}` : 'Transparansi kas kelas',
          dot: 'bg-[#6C5CE7]',
          icon: '💰',
          path: '#/kas',
        },
        {
          time: latestPoin ? latestPoin.tanggal : 'Disiplin',
          title: latestPoin ? `${latestPoin.siswa}` : 'Ketertiban Kelas',
          desc: latestPoin ? `${latestPoin.jenis} (${latestPoin.status})` : 'Kondisi kelas tertib',
          dot: 'bg-[#0072ff]',
          icon: '🏅',
          path: '#/poin',
        },
      ];

      activityTimeline.innerHTML = activities
        .map(
          (a) => `
        <div onclick="window.navigateApp('${a.path}')" class="flex items-start gap-3.5 p-2 rounded-2xl hover:bg-slate-50 transition cursor-pointer">
          <div class="text-[10px] font-bold text-slate-400 w-16 pt-1 shrink-0 text-right font-mono">${a.time}</div>
          <div class="w-8 h-8 rounded-2xl ${a.dot} text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
            ${a.icon}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-extrabold text-slate-800 truncate">${a.title}</div>
            <div class="text-[11px] text-slate-400 truncate">${a.desc}</div>
          </div>
        </div>
      `
        )
        .join('');
    }

    renderTaskTable();
  }

  loadDashboardData();

  return {
    unmount: () => {},
  };
}
