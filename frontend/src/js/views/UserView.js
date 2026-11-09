/**
 * UserView — Modul Manajemen Pengguna & Hak Akses (Khusus Administrator)
 * Mendukung:
 * - Tambah akun pengguna baru (Admin, Wali Kelas, Guru Mapel, Siswa/Pengurus, Orang Tua)
 * - Edit profil akun, role, dan jabatan pengurus (otomatis sinkron dengan Struktur Kelas)
 * - Aktifkan / Nonaktifkan akun pengguna (akun nonaktif otomatis ditolak saat login)
 * - Reset password & kelola kredensial
 * - Hapus akun pengguna (dengan proteksi akun admin utama)
 * - Validasi anti-duplikasi username & email
 * - Pencarian, filter per role/status, dan Ekspor CSV / Cetak
 */

import { getUsersDb, saveUsersDb, getStudentsDb, saveStudentsDb } from '../dataStore.js';
import { api } from '../api.js';

const ROLE_CONFIG = {
  admin: { label: 'Administrator', badge: 'bg-purple-50 text-[#8E54E9] border-purple-200', icon: '🛡️' },
  wali_kelas: { label: 'Wali Kelas', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '👨‍🏫' },
  guru_mapel: { label: 'Guru Mapel', badge: 'bg-sky-50 text-[#0072ff] border-sky-200', icon: '📘' },
  siswa: { label: 'Siswa', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '👨‍🎓' },
  orang_tua: { label: 'Orang Tua', badge: 'bg-amber-50 text-[#F7971E] border-amber-200', icon: '👪' },
};

const JABATAN_LABELS = {
  anggota: 'Anggota Kelas',
  ketua_kelas: 'Ketua Kelas',
  sekretaris: 'Sekretaris',
  bendahara: 'Bendahara',
  seksi_kebersihan: 'Seksi Kebersihan',
  seksi_keamanan: 'Seksi Keamanan',
};

const JABATAN_TO_STUDENT_MAP = {
  anggota: 'Anggota',
  ketua_kelas: 'Ketua Kelas',
  sekretaris: 'Sekretaris',
  bendahara: 'Bendahara',
  seksi_kebersihan: 'Seksi Kebersihan',
  seksi_keamanan: 'Seksi Keamanan',
};

export function renderUserView(containerEl, storeRef) {
  const currentUser = storeRef.user || {};
  const isAdmin = currentUser.role === 'admin';

  // Proteksi tingkat view jika bukan admin
  if (!isAdmin) {
    containerEl.innerHTML = `
      <div class="bg-white rounded-3xl p-10 text-center shadow-card-modern border border-rose-100 max-w-lg mx-auto my-10">
        <div class="w-16 h-16 rounded-2xl bg-rose-50 text-[#FF5E62] flex items-center justify-center text-3xl mx-auto mb-4">🔒</div>
        <h2 class="text-xl font-black text-slate-900 mb-2">Akses Terbatas (Administrator Only)</h2>
        <p class="text-xs text-slate-500 mb-6">Halaman Manajemen Pengguna dan Hak Akses hanya dapat diakses oleh Super Admin / Administrator Sistem.</p>
        <button onclick="window.navigateApp('#/dashboard')" class="px-6 py-2.5 rounded-2xl bg-[#5443E8] text-white text-xs font-extrabold">Kembali ke Dashboard</button>
      </div>
    `;
    return { unmount: () => {} };
  }

  let users = getUsersDb();
  let searchQuery = '';
  let filterRole = 'all';
  let filterStatus = 'all';

  const syncWithBackend = async (updatedUsers) => {
    saveUsersDb(updatedUsers);
    try {
      await api.post('/users/sync', { users: updatedUsers });
    } catch (e) {
      // Tetap tersimpan di localStorage jika mode offline
    }
  };

  // Sinkronkan jabatan pengurus ke daftar siswa jika akun ber-role siswa
  const syncStudentJabatan = (userObj) => {
    if (userObj.role !== 'siswa') return;
    const students = getStudentsDb();
    const target = students.find(
      (s) =>
        (userObj.nis && s.nisn === userObj.nis) ||
        s.name.toLowerCase() === (userObj.fullName || '').toLowerCase()
    );
    if (target) {
      target.jabatan = JABATAN_TO_STUDENT_MAP[userObj.jabatanPengurus] || 'Anggota';
      saveStudentsDb(students);
    }
  };

  const render = () => {
    users = getUsersDb();
    const studentsList = getStudentsDb();

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive !== false).length;
    const inactiveUsers = users.filter((u) => u.isActive === false).length;
    const totalStaffAndOfficers = users.filter(
      (u) => u.role === 'admin' || u.role === 'wali_kelas' || u.role === 'guru_mapel' || (u.role === 'siswa' && u.jabatanPengurus !== 'anggota')
    ).length;

    const filtered = users.filter((u) => {
      const matchSearch =
        (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.nis || '').includes(searchQuery) ||
        (u.nip || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = filterRole === 'all' || u.role === filterRole;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && u.isActive !== false) ||
        (filterStatus === 'inactive' && u.isActive === false);

      return matchSearch && matchRole && matchStatus;
    });

    containerEl.innerHTML = `
      <div class="space-y-7">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Manajemen Pengguna & Hak Akses</h1>
            <p class="text-slate-500 text-xs sm:text-sm mt-0.5">
              Kelola seluruh akun pengguna, pembagian role, jabatan pengurus, status aktif, dan kredensial login <span class="font-bold text-indigo-600">SEKELAS</span>.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <button id="btn-export-users" class="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5">
              <span>📥</span> Unduh CSV
            </button>
            <button id="btn-add-user" class="px-5 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-black transition shadow-md shadow-indigo-600/30 flex items-center gap-2">
              <span>➕</span> Tambah Akun Baru
            </button>
          </div>
        </div>

        <!-- 4 KARTU METRIK FULL COLOR GLOWING -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Card 1: Total Akun (Ungu Glow) -->
          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#8E54E9] to-[#6C5CE7] shadow-glow-purple relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Total Akun</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">👥</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${totalUsers} Akun</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">5 Role Sistem Terintegrasi</div>
          </div>

          <!-- Card 2: Akun Aktif (Biru Glow) -->
          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#0072ff] to-[#00c6ff] shadow-glow-blue relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Akun Aktif</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">✅</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${activeUsers} Aktif</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Dapat mengakses portal</div>
          </div>

          <!-- Card 3: Staf & Pengurus (Amber Glow) -->
          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#F7971E] to-[#FFD200] shadow-glow-amber relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Pengelola & Pengurus</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">🛡️</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${totalStaffAndOfficers} Orang</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Admin, Guru, Wali & Pengurus</div>
          </div>

          <!-- Card 4: Nonaktif (Coral Glow) -->
          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#FF5E62] to-[#FF9966] shadow-glow-coral relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Akun Nonaktif</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">🚫</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${inactiveUsers} Akun</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">${inactiveUsers > 0 ? 'Akses login dibekukan' : 'Semua akun aktif normal'}</div>
          </div>
        </div>

        <!-- MATRIKS HAK AKSES RINGKAS -->
        <div class="bg-white rounded-3xl p-6 shadow-card-modern border border-slate-100">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 class="text-sm font-extrabold text-slate-900">Matriks Kewenangan & Hak Akses Role (RBAC)</h3>
              <p class="text-xs text-slate-400">Setiap perubahan role atau jabatan pengurus langsung menerapkan hak akses berikut secara instan</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold self-start">RBAC Guard Aktif</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div class="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
              <div class="font-black text-[#8E54E9] mb-1">🛡️ Administrator</div>
              <p class="text-[11px] text-slate-600 leading-relaxed">Akses penuh seluruh modul, Manajemen User, Role, Reset Sandi, Kas, Absen, Poin & Tugas.</p>
            </div>
            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div class="font-black text-emerald-700 mb-1">👨‍🏫 Wali Kelas</div>
              <p class="text-[11px] text-slate-600 leading-relaxed">Kelola Siswa & Pengurus, Jadwal, Presensi, Approval Kas, Pembinaan Poin & Monitoring Tugas.</p>
            </div>
            <div class="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
              <div class="font-black text-[#0072ff] mb-1">📘 Guru Mapel</div>
              <p class="text-[11px] text-slate-600 leading-relaxed">Publikasi Tugas, Evaluasi & Input Nilai Siswa, Lihat Jadwal Mengajar & Direktori Siswa.</p>
            </div>
            <div class="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <div class="font-black text-indigo-700 mb-1">👨‍🎓 Siswa & Pengurus</div>
              <p class="text-[11px] text-slate-600 leading-relaxed">Kumpul Tugas & Lihat Data. Khusus Ketua/Sekr: Kelola Absen, Piket & Poin. Bendahara: Kelola Kas.</p>
            </div>
            <div class="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div class="font-black text-[#F7971E] mb-1">👪 Orang Tua</div>
              <p class="text-[11px] text-slate-600 leading-relaxed">Akses khusus pantau (Read-Only) Kehadiran, Tugas & Nilai, Tabungan, serta Catatan Sikap Anak.</p>
            </div>
          </div>
        </div>

        <!-- FILTER & TABEL DAFTAR PENGGUNA -->
        <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100 overflow-hidden">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <!-- Filter Role Pills -->
            <div class="flex flex-wrap items-center gap-1.5">
              ${[
                { key: 'all', label: 'Semua Role' },
                { key: 'admin', label: 'Admin' },
                { key: 'wali_kelas', label: 'Wali Kelas' },
                { key: 'guru_mapel', label: 'Guru Mapel' },
                { key: 'siswa', label: 'Siswa / Pengurus' },
                { key: 'orang_tua', label: 'Orang Tua' },
              ]
                .map(
                  (tab) => `
                <button class="role-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterRole === tab.key
                    ? 'bg-[#5443E8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }" data-role="${tab.key}">${tab.label}</button>
              `
                )
                .join('')}
            </div>

            <!-- Search & Status Filter -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <select id="select-status-filter" class="px-3.5 py-2 rounded-2xl bg-slate-100 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#5443E8]">
                <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
                <option value="active" ${filterStatus === 'active' ? 'selected' : ''}>Status: Aktif</option>
                <option value="inactive" ${filterStatus === 'inactive' ? 'selected' : ''}>Status: Nonaktif</option>
              </select>

              <div class="relative w-full sm:w-64">
                <input
                  id="input-search-user"
                  type="text"
                  placeholder="Cari username, nama, email..."
                  value="${searchQuery}"
                  class="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-100 border-none text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#5443E8] outline-none"
                />
                <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              </div>
            </div>
          </div>

          <!-- Tabel Akun -->
          <div class="overflow-x-auto mt-4">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <th class="py-3 px-3">Pengguna</th>
                  <th class="py-3 px-3">Username & ID</th>
                  <th class="py-3 px-3">Role Sistem</th>
                  <th class="py-3 px-3">Jabatan / Relasi</th>
                  <th class="py-3 px-3 text-center">Status Akun</th>
                  <th class="py-3 px-3 text-right">Aksi Pengelolaan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${
                  filtered.length > 0
                    ? filtered
                        .map((u) => {
                          const rConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.siswa;
                          const isSelf = u.username === currentUser.username;
                          const isActive = u.isActive !== false;
                          return `
                    <tr class="hover:bg-slate-50/80 transition-colors ${!isActive ? 'opacity-60 bg-slate-50/40' : ''}">
                      <td class="py-3.5 px-3">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-2xl ${
                            isActive ? 'bg-indigo-100 text-[#5443E8]' : 'bg-slate-200 text-slate-500'
                          } flex items-center justify-center font-black text-xs shrink-0">
                            ${(u.fullName || u.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div class="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>${u.fullName}</span>
                              ${isSelf ? '<span class="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black">Anda</span>' : ''}
                            </div>
                            <div class="text-[11px] text-slate-400">${u.email || `${u.username}@sekelas.sch.id`}</div>
                          </div>
                        </div>
                      </td>

                      <td class="py-3.5 px-3">
                        <div class="font-mono font-bold text-slate-800">@${u.username}</div>
                        <div class="text-[10px] text-slate-400 font-mono">
                          ${u.nis ? `NISN: ${u.nis}` : u.nip ? `NIP: ${u.nip}` : 'ID: #' + u.id}
                        </div>
                      </td>

                      <td class="py-3.5 px-3">
                        <span class="px-3 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${rConf.badge}">
                          <span>${rConf.icon}</span>
                          <span>${rConf.label}</span>
                        </span>
                      </td>

                      <td class="py-3.5 px-3">
                        ${
                          u.role === 'siswa'
                            ? `<span class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                u.jabatanPengurus && u.jabatanPengurus !== 'anggota'
                                  ? 'bg-amber-50 text-[#F7971E] border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }">${JABATAN_LABELS[u.jabatanPengurus] || 'Anggota Kelas'}</span>`
                            : u.role === 'orang_tua'
                            ? `<span class="text-[11px] text-slate-600 font-semibold">Wali dari: <strong class="text-slate-900">${u.parentOfName || 'Ahmad Ajriel Irfan'}</strong></span>`
                            : `<span class="text-[11px] text-slate-400">Otoritas Penuh Role</span>`
                        }
                      </td>

                      <td class="py-3.5 px-3 text-center">
                        <button
                          class="btn-toggle-active inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-[#FF5E62] border border-rose-200 hover:bg-rose-100'
                          }"
                          data-id="${u.id}"
                          title="Klik untuk mengubah status aktif/nonaktif"
                        >
                          <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-[#FF5E62]'}"></span>
                          ${isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>

                      <td class="py-3.5 px-3 text-right">
                        <div class="inline-flex items-center justify-end gap-1.5">
                          <button
                            class="btn-edit-user px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-[#5443E8] font-bold text-[11px] transition"
                            data-id="${u.id}"
                            title="Edit Data & Role"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            class="btn-reset-pass px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#F7971E] font-bold text-[11px] transition"
                            data-id="${u.id}"
                            title="Reset Password"
                          >
                            🔑 Sandi
                          </button>
                          ${
                            !isSelf
                              ? `
                            <button
                              class="btn-delete-user px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#FF5E62] font-bold text-[11px] transition"
                              data-id="${u.id}"
                              title="Hapus Akun"
                            >
                              🗑️
                            </button>
                          `
                              : ''
                          }
                        </div>
                      </td>
                    </tr>
                  `;
                        })
                        .join('')
                    : `<tr><td colspan="6" class="py-12 text-center text-slate-400 text-xs">Tidak ditemukan akun pengguna yang sesuai dengan filter pencarian.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- MODAL TAMBAH / EDIT AKUN PENGGUNA -->
        <div id="modal-user-form" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 id="modal-user-title" class="text-base font-extrabold text-slate-900">Tambah Akun Pengguna Baru</h3>
              <button id="btn-close-user-modal" class="text-slate-400 hover:text-slate-600 font-black text-sm">✕</button>
            </div>

            <form id="form-user-manage" class="mt-4 space-y-4">
              <input type="hidden" id="user-form-id" value="" />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
                  <input id="user-form-username" type="text" required placeholder="Contoh: guru2 / siswa3" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input id="user-form-email" type="email" required placeholder="nama@sekelas.sch.id" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input id="user-form-fullname" type="text" required placeholder="Masukkan nama lengkap pengguna" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]" />
              </div>

              <div id="password-field-wrapper">
                <label class="block text-xs font-bold text-slate-700 mb-1">Password Awal *</label>
                <input id="user-form-password" type="text" value="123456" required placeholder="Minimal 4 karakter" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-mono font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Role Pengguna *</label>
                  <select id="user-form-role" required class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]">
                    <option value="siswa">Siswa / Pengurus Kelas</option>
                    <option value="wali_kelas">Wali Kelas</option>
                    <option value="guru_mapel">Guru Mapel</option>
                    <option value="orang_tua">Orang Tua Siswa</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div id="jabatan-field-wrapper">
                  <label class="block text-xs font-bold text-slate-700 mb-1">Jabatan Pengurus Kelas</label>
                  <select id="user-form-jabatan" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]">
                    <option value="anggota">Anggota Biasa</option>
                    <option value="ketua_kelas">Ketua Kelas</option>
                    <option value="sekretaris">Sekretaris</option>
                    <option value="bendahara">Bendahara</option>
                    <option value="seksi_kebersihan">Seksi Kebersihan</option>
                    <option value="seksi_keamanan">Seksi Keamanan</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">NISN / NIP (Opsional)</label>
                  <input id="user-form-idnumber" type="text" placeholder="NISN Siswa atau NIP Guru" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Status Keaktifan Akun</label>
                  <select id="user-form-active" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]">
                    <option value="true">Aktif (Dapat Login)</option>
                    <option value="false">Nonaktif (Dibekukan)</option>
                  </select>
                </div>
              </div>

              <div id="parent-field-wrapper" class="hidden">
                <label class="block text-xs font-bold text-slate-700 mb-1">Orang Tua / Wali dari Siswa:</label>
                <select id="user-form-parent-of" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]">
                  ${studentsList.map((s) => `<option value="${s.name}">${s.name} (NISN: ${s.nisn})</option>`).join('')}
                </select>
              </div>

              <div class="pt-3 flex gap-2">
                <button type="button" id="btn-cancel-user-modal" class="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition">Batal</button>
                <button type="submit" class="flex-1 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition">Simpan Akun</button>
              </div>
            </form>
          </div>
        </div>

        <!-- MODAL RESET PASSWORD -->
        <div id="modal-reset-pass" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-sm w-full p-6 lg:p-7 shadow-2xl border border-slate-100">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 class="text-base font-extrabold text-slate-900">🔑 Reset Kredensial Sandi</h3>
              <button id="btn-close-reset-modal" class="text-slate-400 hover:text-slate-600 font-black text-sm">✕</button>
            </div>

            <form id="form-reset-pass" class="mt-4 space-y-4">
              <input type="hidden" id="reset-user-id" />
              <div class="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-800">
                Reset password untuk akun: <strong id="reset-user-label" class="font-black"></strong>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Password Baru *</label>
                <input id="reset-new-password" type="text" required minlength="4" value="123456" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-sm font-mono font-black text-center text-indigo-700 outline-none focus:ring-2 focus:ring-[#5443E8]" />
              </div>
              <div class="pt-2 flex gap-2">
                <button type="button" id="btn-cancel-reset-modal" class="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold">Batal</button>
                <button type="submit" class="flex-1 py-2.5 rounded-2xl bg-[#F7971E] hover:bg-amber-600 text-white text-xs font-extrabold shadow-md transition">Perbarui Sandi</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    // Filter Role
    containerEl.querySelectorAll('.role-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        filterRole = btn.getAttribute('data-role');
        render();
      });
    });

    // Filter Status
    const statusSel = document.getElementById('select-status-filter');
    if (statusSel) {
      statusSel.addEventListener('change', (e) => {
        filterStatus = e.target.value;
        render();
      });
    }

    // Search Input
    const searchInput = document.getElementById('input-search-user');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
        const next = document.getElementById('input-search-user');
        if (next) {
          next.focus();
          next.setSelectionRange(next.value.length, next.value.length);
        }
      });
    }

    // Toggle Active / Inactive
    containerEl.querySelectorAll('.btn-toggle-active').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const target = users.find((u) => u.id === id);
        if (!target) return;

        if (target.username === currentUser.username) {
          storeRef.warning('Anda tidak dapat menonaktifkan akun Administrator yang sedang Anda gunakan.');
          return;
        }

        target.isActive = target.isActive === false ? true : false;
        syncWithBackend(users);
        storeRef.success(
          `Status akun @${target.username} diubah menjadi ${target.isActive ? 'AKTIF' : 'NONAKTIF'}.`
        );
        render();
      });
    });

    // Modal Form Logic (Add / Edit)
    const modalForm = document.getElementById('modal-user-form');
    const formManage = document.getElementById('form-user-manage');
    const roleSelectEl = document.getElementById('user-form-role');
    const jabatanWrapper = document.getElementById('jabatan-field-wrapper');
    const parentWrapper = document.getElementById('parent-field-wrapper');
    const passWrapper = document.getElementById('password-field-wrapper');

    const updateConditionalFields = () => {
      const r = roleSelectEl.value;
      if (r === 'siswa') {
        jabatanWrapper.classList.remove('hidden');
        parentWrapper.classList.add('hidden');
      } else if (r === 'orang_tua') {
        jabatanWrapper.classList.add('hidden');
        parentWrapper.classList.remove('hidden');
      } else {
        jabatanWrapper.classList.add('hidden');
        parentWrapper.classList.add('hidden');
      }
    };

    if (roleSelectEl) {
      roleSelectEl.addEventListener('change', updateConditionalFields);
    }

    // Open Add Modal
    const btnAdd = document.getElementById('btn-add-user');
    if (btnAdd && modalForm) {
      btnAdd.addEventListener('click', () => {
        document.getElementById('modal-user-title').textContent = 'Tambah Akun Pengguna Baru';
        document.getElementById('user-form-id').value = '';
        document.getElementById('user-form-username').value = '';
        document.getElementById('user-form-email').value = '';
        document.getElementById('user-form-fullname').value = '';
        document.getElementById('user-form-password').value = '123456';
        document.getElementById('user-form-password').required = true;
        passWrapper.classList.remove('hidden');
        document.getElementById('user-form-role').value = 'siswa';
        document.getElementById('user-form-jabatan').value = 'anggota';
        document.getElementById('user-form-idnumber').value = '';
        document.getElementById('user-form-active').value = 'true';
        updateConditionalFields();
        modalForm.classList.remove('hidden');
      });
    }

    // Open Edit Modal
    containerEl.querySelectorAll('.btn-edit-user').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const u = users.find((x) => x.id === id);
        if (!u) return;

        document.getElementById('modal-user-title').textContent = `Edit Akun @${u.username}`;
        document.getElementById('user-form-id').value = String(u.id);
        document.getElementById('user-form-username').value = u.username;
        document.getElementById('user-form-email').value = u.email || `${u.username}@sekelas.sch.id`;
        document.getElementById('user-form-fullname').value = u.fullName;
        document.getElementById('user-form-password').required = false;
        passWrapper.classList.add('hidden');
        document.getElementById('user-form-role').value = u.role;
        document.getElementById('user-form-jabatan').value = u.jabatanPengurus || 'anggota';
        document.getElementById('user-form-idnumber').value = u.nis || u.nip || '';
        document.getElementById('user-form-active').value = u.isActive === false ? 'false' : 'true';
        if (u.parentOfName) {
          document.getElementById('user-form-parent-of').value = u.parentOfName;
        }
        updateConditionalFields();
        modalForm.classList.remove('hidden');
      });
    });

    // Close Modal Form
    ['btn-close-user-modal', 'btn-cancel-user-modal'].forEach((id) => {
      const el = document.getElementById(id);
      if (el && modalForm) el.addEventListener('click', () => modalForm.classList.add('hidden'));
    });

    // Submit Add / Edit User
    if (formManage) {
      formManage.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('user-form-id').value;
        const username = document.getElementById('user-form-username').value.trim();
        const email = document.getElementById('user-form-email').value.trim();
        const fullName = document.getElementById('user-form-fullname').value.trim();
        const password = document.getElementById('user-form-password').value;
        const role = document.getElementById('user-form-role').value;
        const jabatanPengurus = role === 'siswa' ? document.getElementById('user-form-jabatan').value : 'anggota';
        const idNumber = document.getElementById('user-form-idnumber').value.trim();
        const isActive = document.getElementById('user-form-active').value === 'true';
        const parentOfName = role === 'orang_tua' ? document.getElementById('user-form-parent-of').value : null;

        if (!username || !fullName || !email) {
          storeRef.error('Username, nama lengkap, dan email wajib diisi.');
          return;
        }

        // Validasi anti-duplikasi username & email
        const duplicateUser = users.find(
          (u) =>
            String(u.id) !== String(editId) &&
            (u.username.toLowerCase() === username.toLowerCase() ||
              (u.email && u.email.toLowerCase() === email.toLowerCase()))
        );

        if (duplicateUser) {
          storeRef.error(`Gagal menyimpan: Username "${username}" atau email "${email}" sudah terdaftar!`);
          return;
        }

        if (editId) {
          const target = users.find((u) => String(u.id) === String(editId));
          if (!target) return;

          // Cegah admin menonaktifkan atau menurunkan role dirinya sendiri
          if (target.username === currentUser.username && (!isActive || role !== 'admin')) {
            storeRef.warning('Tidak dapat menonaktifkan atau mengubah role akun Administrator utama yang sedang login.');
            return;
          }

          target.username = username;
          target.email = email;
          target.fullName = fullName;
          target.role = role;
          target.jabatanPengurus = jabatanPengurus;
          target.nis = role === 'siswa' || role === 'orang_tua' ? idNumber || null : null;
          target.nip = role === 'admin' || role === 'wali_kelas' || role === 'guru_mapel' ? idNumber || null : null;
          target.parentOfName = parentOfName;
          target.isActive = isActive;

          syncStudentJabatan(target);
          syncWithBackend(users);
          storeRef.success(`Data akun @${target.username} berhasil diperbarui.`);
        } else {
          if (!password || password.length < 4) {
            storeRef.error('Password awal minimal terdiri dari 4 karakter.');
            return;
          }
          const newUser = {
            id: Date.now(),
            username,
            password,
            fullName,
            email,
            role,
            jabatanPengurus,
            nis: role === 'siswa' || role === 'orang_tua' ? idNumber || null : null,
            nip: role === 'admin' || role === 'wali_kelas' || role === 'guru_mapel' ? idNumber || null : null,
            parentOfName,
            isActive,
            createdAt: new Date().toISOString().slice(0, 10),
          };
          users.unshift(newUser);
          syncStudentJabatan(newUser);
          syncWithBackend(users);
          storeRef.success(`Akun baru @${username} (${ROLE_CONFIG[role].label}) berhasil ditambahkan dan siap digunakan login!`);
        }

        modalForm.classList.add('hidden');
        render();
      });
    }

    // Modal Reset Password
    const modalReset = document.getElementById('modal-reset-pass');
    const formReset = document.getElementById('form-reset-pass');
    containerEl.querySelectorAll('.btn-reset-pass').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const u = users.find((x) => x.id === id);
        if (!u) return;
        document.getElementById('reset-user-id').value = String(u.id);
        document.getElementById('reset-user-label').textContent = `${u.fullName} (@${u.username})`;
        document.getElementById('reset-new-password').value = '123456';
        modalReset.classList.remove('hidden');
      });
    });

    ['btn-close-reset-modal', 'btn-cancel-reset-modal'].forEach((id) => {
      const el = document.getElementById(id);
      if (el && modalReset) el.addEventListener('click', () => modalReset.classList.add('hidden'));
    });

    if (formReset) {
      formReset.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = Number(document.getElementById('reset-user-id').value);
        const newPass = document.getElementById('reset-new-password').value.trim();
        if (newPass.length < 4) {
          storeRef.error('Password baru minimal 4 karakter.');
          return;
        }
        const target = users.find((x) => x.id === id);
        if (target) {
          target.password = newPass;
          syncWithBackend(users);
          storeRef.success(`Password untuk @${target.username} berhasil di-reset.`);
        }
        modalReset.classList.add('hidden');
      });
    }

    // Delete User
    containerEl.querySelectorAll('.btn-delete-user').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const target = users.find((x) => x.id === id);
        if (!target) return;

        if (target.username === currentUser.username) {
          storeRef.error('Tidak dapat menghapus akun yang sedang digunakan.');
          return;
        }

        users = users.filter((x) => x.id !== id);
        syncWithBackend(users);
        storeRef.info(`Akun @${target.username} telah dihapus dari sistem.`);
        render();
      });
    });

    // Export CSV
    const btnExport = document.getElementById('btn-export-users');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const headers = ['ID,Username,Nama Lengkap,Email,Role,Jabatan,NIS/NIP,Status'];
        const rows = users.map((u) =>
          `"${u.id}","${u.username}","${u.fullName}","${u.email || ''}","${u.role}","${u.jabatanPengurus || ''}","${u.nis || u.nip || ''}","${u.isActive !== false ? 'Aktif' : 'Nonaktif'}"`
        );
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', 'daftar_pengguna_sekelas_xe4.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        storeRef.success('Data pengguna berhasil diunduh dalam format CSV.');
      });
    }
  };

  render();

  return {
    unmount: () => {},
  };
}

