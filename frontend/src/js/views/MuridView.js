/**
 * MuridView — Modul Data Siswa & Struktur Organisasi Kelas X.E-4
 * Mendukung CRUD Siswa & Pengurus Kelas (untuk Admin & Wali Kelas),
 * Sinkronisasi Struktur Organisasi Dinamis, Filter Gender/Jabatan, Pencarian, & Unduh CSV.
 */

import { INITIAL_STUDENTS, getStudentsDb, saveStudentsDb, getUsersDb, saveUsersDb } from '../dataStore.js';

// Ekspor STUDENTS_DATA untuk kompatibilitas modul lain
export const STUDENTS_DATA = INITIAL_STUDENTS;

export function renderMuridView(containerEl, storeRef) {
  const user = storeRef.user || {};
  const canManage = user.role === 'admin' || user.role === 'wali_kelas';

  let searchQuery = '';
  let filterGender = 'all';
  let filterRoleType = 'all';

  const renderContent = () => {
    const students = getStudentsDb();
    const totalSiswa = students.length;
    const totalLaki = students.filter((s) => s.gender === 'L').length;
    const totalPerempuan = students.filter((s) => s.gender === 'P').length;
    const totalPengurus = students.filter((s) => s.jabatan !== 'Anggota').length;

    // Cari pengurus inti secara dinamis dari data siswa
    const ketua = students.find((s) => s.jabatan === 'Ketua Kelas') || { name: 'KEISHA NISWATUN S.', nisn: '112591827' };
    const sekretaris = students.find((s) => s.jabatan === 'Sekretaris') || { name: 'NABILA TSABITA P.', nisn: '111982065' };
    const bendahara = students.find((s) => s.jabatan === 'Bendahara') || { name: 'HANNA AULIA', nisn: '109410011' };

    const filtered = students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGender = filterGender === 'all' || s.gender === filterGender;
      const matchType =
        filterRoleType === 'all' ||
        (filterRoleType === 'pengurus' && s.jabatan !== 'Anggota') ||
        (filterRoleType === 'anggota' && s.jabatan === 'Anggota');
      return matchSearch && matchGender && matchType;
    });

    containerEl.innerHTML = `
      <div class="space-y-7">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Data Siswa & Pengurus Kelas</h1>
            <p class="text-slate-500 text-xs sm:text-sm mt-0.5">
              Direktori resmi siswa <span class="font-bold text-indigo-600">Kelas X.E-4 Bilingual ICT</span> TA 2026/2027.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2.5">
            <button id="btn-export-students" class="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5">
              <span>📥</span> Unduh CSV
            </button>
            ${
              canManage
                ? `
              <button id="btn-add-student" class="px-5 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-black transition shadow-md shadow-indigo-600/30 flex items-center gap-2">
                <span>➕</span> Tambah Siswa
              </button>
            `
                : `
              <span class="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5">
                <span>👨‍🏫</span> Wali Kelas: <strong class="text-indigo-600">Mr. Ahmad Yuwafi</strong>
              </span>
            `
            }
          </div>
        </div>

        <!-- 4 KARTU METRIK FULL COLOR GLOWING -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#8E54E9] to-[#6C5CE7] shadow-glow-purple relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Total Siswa</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">👥</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${totalSiswa}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">100% Terdaftar Aktif</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#0072ff] to-[#00c6ff] shadow-glow-blue relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Siswa Laki-laki</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">👦</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${totalLaki}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">${totalSiswa ? Math.round((totalLaki / totalSiswa) * 100) : 0}% dari total kelas</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#FF5E62] to-[#FF9966] shadow-glow-coral relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Siswa Perempuan</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">👧</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${totalPerempuan}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">${totalSiswa ? Math.round((totalPerempuan / totalSiswa) * 100) : 0}% dari total kelas</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#F7971E] to-[#FFD200] shadow-glow-amber relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Pengurus Kelas</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">⭐</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${totalPengurus}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Ketua, Sekr, Bend & Seksi</div>
          </div>
        </div>

        <!-- STRUKTUR ORGANISASI KELAS DINAMIS -->
        <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Struktur Pengurus Inti Kelas X.E-4</h3>
              <p class="text-xs text-slate-400 mt-0.5">Terhubung otomatis dengan penetapan jabatan siswa</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">Periode 2026/2027</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/40 border border-indigo-100/60 flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-[#5443E8] text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-500/20 shrink-0">WK</div>
              <div class="min-w-0">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Wali Kelas</span>
                <div class="text-xs font-bold text-slate-900 mt-0.5 truncate">Mr. Ahmad Yuwafi</div>
                <div class="text-[11px] text-slate-400 font-mono">NIP. G-002</div>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-gradient-to-br from-sky-50/70 to-blue-50/40 border border-sky-100/60 flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-[#0072ff] text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20 shrink-0">KM</div>
              <div class="min-w-0">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-sky-600">Ketua Kelas</span>
                <div class="text-xs font-bold text-slate-900 mt-0.5 truncate">${ketua.name}</div>
                <div class="text-[11px] text-slate-400 font-mono">NISN. ${ketua.nisn}</div>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 to-pink-50/40 border border-rose-100/60 flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-[#FF5E62] text-white flex items-center justify-center font-black text-sm shadow-md shadow-rose-500/20 shrink-0">SK</div>
              <div class="min-w-0">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">Sekretaris</span>
                <div class="text-xs font-bold text-slate-900 mt-0.5 truncate">${sekretaris.name}</div>
                <div class="text-[11px] text-slate-400 font-mono">NISN. ${sekretaris.nisn}</div>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-yellow-50/40 border border-amber-100/60 flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-[#F7971E] text-white flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20 shrink-0">BD</div>
              <div class="min-w-0">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">Bendahara</span>
                <div class="text-xs font-bold text-slate-900 mt-0.5 truncate">${bendahara.name}</div>
                <div class="text-[11px] text-slate-400 font-mono">NISN. ${bendahara.nisn}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- DAFTAR SISWA & FILTER -->
        <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100 overflow-hidden">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Buku Induk Siswa X.E-4</h3>
              <p class="text-xs text-slate-400 mt-0.5">Menampilkan ${filtered.length} dari total ${totalSiswa} siswa</p>
            </div>
            
            <div class="flex flex-wrap items-center gap-2.5">
              <select id="filter-gender-student" class="px-3.5 py-2 rounded-2xl bg-slate-100 text-xs font-bold text-slate-700 outline-none">
                <option value="all" ${filterGender === 'all' ? 'selected' : ''}>Semua Gender</option>
                <option value="L" ${filterGender === 'L' ? 'selected' : ''}>Laki-laki (L)</option>
                <option value="P" ${filterGender === 'P' ? 'selected' : ''}>Perempuan (P)</option>
              </select>

              <select id="filter-role-student" class="px-3.5 py-2 rounded-2xl bg-slate-100 text-xs font-bold text-slate-700 outline-none">
                <option value="all" ${filterRoleType === 'all' ? 'selected' : ''}>Semua Jabatan</option>
                <option value="pengurus" ${filterRoleType === 'pengurus' ? 'selected' : ''}>Pengurus Kelas</option>
                <option value="anggota" ${filterRoleType === 'anggota' ? 'selected' : ''}>Anggota Biasa</option>
              </select>

              <div class="relative w-full sm:w-64">
                <input
                  id="search-student"
                  type="text"
                  placeholder="Cari nama, NISN, jabatan..."
                  value="${searchQuery}"
                  class="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-100 border-none text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#5443E8] outline-none transition"
                />
                <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto mt-4">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <th class="py-3 px-3 w-12 text-center">No</th>
                  <th class="py-3 px-4">Nama Lengkap</th>
                  <th class="py-3 px-4">NISN</th>
                  <th class="py-3 px-3 text-center">Gender</th>
                  <th class="py-3 px-4">Jabatan di Kelas</th>
                  <th class="py-3 px-4 text-right">${canManage ? 'Aksi Kelola' : 'Status'}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${
                  filtered.length > 0
                    ? filtered
                        .map(
                          (s, idx) => `
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-3 text-center text-slate-400 font-bold">${idx + 1}</td>
                    <td class="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-full ${
                        s.gender === 'L' ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'
                      } flex items-center justify-center font-black text-[10px] shrink-0">
                        ${s.name.charAt(0)}
                      </div>
                      <span>${s.name}</span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">${s.nisn}</td>
                    <td class="py-3.5 px-3 text-center">
                      <span class="px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        s.gender === 'L' ? 'bg-sky-50 text-[#0072ff]' : 'bg-pink-50 text-[#FF5E62]'
                      }">${s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </td>
                    <td class="py-3.5 px-4">
                      <span class="px-3 py-1 rounded-full text-[11px] font-bold ${
                        s.jabatan === 'Ketua Kelas'
                          ? 'bg-sky-50 text-[#0072ff] border border-sky-200'
                          : s.jabatan === 'Sekretaris'
                          ? 'bg-rose-50 text-[#FF5E62] border border-rose-200'
                          : s.jabatan === 'Bendahara'
                          ? 'bg-amber-50 text-[#F7971E] border border-amber-200'
                          : s.jabatan !== 'Anggota'
                          ? 'bg-purple-50 text-[#8E54E9] border border-purple-200'
                          : 'bg-slate-100 text-slate-600'
                      }">${s.jabatan}</span>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      ${
                        canManage
                          ? `
                        <div class="inline-flex items-center gap-1.5">
                          <button class="btn-edit-student px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-[#5443E8] font-bold text-[11px] transition" data-nisn="${s.nisn}">
                            ✏️ Edit
                          </button>
                          <button class="btn-delete-student px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#FF5E62] font-bold text-[11px] transition" data-nisn="${s.nisn}">
                            🗑️
                          </button>
                        </div>
                      `
                          : `
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
                        </span>
                      `
                      }
                    </td>
                  </tr>
                `
                        )
                        .join('')
                    : `<tr><td colspan="6" class="py-12 text-center text-slate-400 text-xs">Tidak ditemukan siswa yang cocok dengan kriteria pencarian.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- MODAL TAMBAH / EDIT SISWA -->
        <div id="modal-student" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 lg:p-7 shadow-2xl border border-slate-100">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 id="modal-student-title" class="text-base font-extrabold text-slate-900">Tambah Data Siswa</h3>
              <button id="btn-close-student-modal" class="text-slate-400 hover:text-slate-600 font-black text-sm">✕</button>
            </div>

            <form id="form-student" class="mt-4 space-y-4">
              <input type="hidden" id="student-old-nisn" value="" />
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input id="student-name" type="text" required placeholder="Contoh: AHMAD AJRIEL IRFAN" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold uppercase outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Nomor NISN *</label>
                  <input id="student-nisn" type="text" required placeholder="10 digit NISN" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-mono font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin *</label>
                  <select id="student-gender" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]">
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Jabatan di Kelas *</label>
                <select id="student-jabatan" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]">
                  <option value="Anggota">Anggota</option>
                  <option value="Ketua Kelas">Ketua Kelas</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Seksi Kebersihan">Seksi Kebersihan</option>
                  <option value="Seksi Keamanan">Seksi Keamanan</option>
                </select>
              </div>

              <div class="pt-3 flex gap-2">
                <button type="button" id="btn-cancel-student-modal" class="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold">Batal</button>
                <button type="submit" class="flex-1 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition">Simpan Siswa</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    // Listener Search & Filter
    const searchInput = document.getElementById('search-student');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderContent();
        const nextInput = document.getElementById('search-student');
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
        }
      });
    }

    const genderSel = document.getElementById('filter-gender-student');
    if (genderSel) {
      genderSel.addEventListener('change', (e) => {
        filterGender = e.target.value;
        renderContent();
      });
    }

    const roleSel = document.getElementById('filter-role-student');
    if (roleSel) {
      roleSel.addEventListener('change', (e) => {
        filterRoleType = e.target.value;
        renderContent();
      });
    }

    // Export CSV
    const btnExport = document.getElementById('btn-export-students');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const list = getStudentsDb();
        const headers = ['No,Nama Lengkap,NISN,Gender,Jabatan'];
        const rows = list.map((s, i) => `"${i + 1}","${s.name}","${s.nisn}","${s.gender}","${s.jabatan}"`);
        const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csv));
        link.setAttribute('download', 'buku_induk_siswa_xe4.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        storeRef.success('Buku Induk Siswa berhasil diunduh (CSV).');
      });
    }

    // Modal Add / Edit Siswa
    const modal = document.getElementById('modal-student');
    const form = document.getElementById('form-student');
    const btnAdd = document.getElementById('btn-add-student');

    if (btnAdd && modal) {
      btnAdd.addEventListener('click', () => {
        document.getElementById('modal-student-title').textContent = 'Tambah Siswa Baru X.E-4';
        document.getElementById('student-old-nisn').value = '';
        document.getElementById('student-name').value = '';
        document.getElementById('student-nisn').value = '';
        document.getElementById('student-gender').value = 'L';
        document.getElementById('student-jabatan').value = 'Anggota';
        modal.classList.remove('hidden');
      });
    }

    containerEl.querySelectorAll('.btn-edit-student').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nisn = btn.getAttribute('data-nisn');
        const list = getStudentsDb();
        const s = list.find((x) => x.nisn === nisn);
        if (!s) return;
        document.getElementById('modal-student-title').textContent = `Edit Data Siswa: ${s.name}`;
        document.getElementById('student-old-nisn').value = s.nisn;
        document.getElementById('student-name').value = s.name;
        document.getElementById('student-nisn').value = s.nisn;
        document.getElementById('student-gender').value = s.gender;
        document.getElementById('student-jabatan').value = s.jabatan;
        modal.classList.remove('hidden');
      });
    });

    containerEl.querySelectorAll('.btn-delete-student').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nisn = btn.getAttribute('data-nisn');
        let list = getStudentsDb();
        const target = list.find((x) => x.nisn === nisn);
        if (!target) return;
        list = list.filter((x) => x.nisn !== nisn).map((item, idx) => ({ ...item, no: idx + 1 }));
        saveStudentsDb(list);
        storeRef.info(`Data siswa ${target.name} telah dihapus.`);
        renderContent();
      });
    });

    ['btn-close-student-modal', 'btn-cancel-student-modal'].forEach((id) => {
      const el = document.getElementById(id);
      if (el && modal) el.addEventListener('click', () => modal.classList.add('hidden'));
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const oldNisn = document.getElementById('student-old-nisn').value;
        const name = document.getElementById('student-name').value.trim().toUpperCase();
        const nisn = document.getElementById('student-nisn').value.trim();
        const gender = document.getElementById('student-gender').value;
        const jabatan = document.getElementById('student-jabatan').value;

        let list = getStudentsDb();
        const dup = list.find((s) => s.nisn === nisn && s.nisn !== oldNisn);
        if (dup) {
          storeRef.error(`NISN "${nisn}" sudah digunakan oleh siswa ${dup.name}!`);
          return;
        }

        if (oldNisn) {
          const target = list.find((s) => s.nisn === oldNisn);
          if (target) {
            target.name = name;
            target.nisn = nisn;
            target.gender = gender;
            target.jabatan = jabatan;
          }
          storeRef.success(`Data siswa ${name} berhasil diperbarui.`);
        } else {
          list.push({ no: list.length + 1, name, nisn, gender, jabatan });
          storeRef.success(`Siswa baru ${name} berhasil ditambahkan ke kelas X.E-4.`);
        }

        saveStudentsDb(list);

        // Sinkronkan jabatan ke akun pengguna jika ada
        const jabatanReverseMap = {
          'Anggota': 'anggota',
          'Ketua Kelas': 'ketua_kelas',
          'Sekretaris': 'sekretaris',
          'Bendahara': 'bendahara',
          'Seksi Kebersihan': 'seksi_kebersihan',
          'Seksi Keamanan': 'seksi_keamanan',
        };
        const users = getUsersDb();
        const matchedUser = users.find((u) => u.nis === nisn || u.fullName.toUpperCase() === name);
        if (matchedUser && matchedUser.role === 'siswa') {
          matchedUser.jabatanPengurus = jabatanReverseMap[jabatan] || 'anggota';
          saveUsersDb(users);
        }

        modal.classList.add('hidden');
        renderContent();
      });
    }
  };

  renderContent();

  return {
    unmount: () => {},
  };
}
