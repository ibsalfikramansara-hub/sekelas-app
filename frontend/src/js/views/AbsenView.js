/**
 * AbsenView — Modul Presensi Harian Siswa Kelas X.E-4
 * Mendukung RBAC (Hanya Admin, Wali Kelas, Ketua Kelas, dan Sekretaris yang dapat mengubah status presensi),
 * Filter Status Kehadiran, Pencarian Nama Siswa, Highlight Anak untuk Orang Tua, & Unduh Rekap CSV.
 */

import { getStudentsDb } from '../dataStore.js';

export function renderAbsenView(containerEl, storeRef) {
  const user = storeRef.user || {};
  const canEdit =
    user.role === 'admin' ||
    user.role === 'wali_kelas' ||
    (user.role === 'siswa' && ['ketua_kelas', 'sekretaris'].includes(user.jabatanPengurus));

  const getTodayISO = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  let selectedDate = getTodayISO();
  let searchQuery = '';
  let filterStatus = 'all';

  let allAttendance = {};
  try {
    allAttendance = JSON.parse(localStorage.getItem('sekelas_attendance_data') || '{}');
  } catch (e) {
    allAttendance = {};
  }

  const saveAttendance = () => {
    localStorage.setItem('sekelas_attendance_data', JSON.stringify(allAttendance));
  };

  const getDayAttendance = (students) => {
    if (!allAttendance[selectedDate]) {
      allAttendance[selectedDate] = {};
      students.forEach((s) => {
        allAttendance[selectedDate][s.nisn] = 'H';
      });
      saveAttendance();
    }
    return allAttendance[selectedDate];
  };

  const render = () => {
    const students = getStudentsDb();
    const currentAtt = getDayAttendance(students);

    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;

    students.forEach((s) => {
      const st = currentAtt[s.nisn] || 'H';
      if (st === 'H') hadir++;
      else if (st === 'S') sakit++;
      else if (st === 'I') izin++;
      else if (st === 'A') alpa++;
    });

    const total = students.length || 1;
    const persenKehadiran = Math.round((hadir / total) * 100);

    const filtered = students.filter((s) => {
      const st = currentAtt[s.nisn] || 'H';
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery);
      const matchStatus = filterStatus === 'all' || st === filterStatus;
      return matchSearch && matchStatus;
    });

    const statusBadgeInfo = {
      H: { label: 'Hadir', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      S: { label: 'Sakit', cls: 'bg-amber-50 text-[#F7971E] border-amber-200' },
      I: { label: 'Izin', cls: 'bg-purple-50 text-[#8E54E9] border-purple-200' },
      A: { label: 'Alpa', cls: 'bg-rose-50 text-[#FF5E62] border-rose-200' },
    };

    containerEl.innerHTML = `
      <div class="space-y-7">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Presensi Harian Siswa</h1>
            <p class="text-slate-500 text-xs sm:text-sm mt-0.5">
              ${
                canEdit
                  ? 'Kelola dan verifikasi absensi harian kelas X.E-4 Bilingual ICT.'
                  : 'Rekapitulasi kehadiran harian siswa kelas X.E-4 Bilingual ICT (Mode Lihat).'
              }
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <input
              id="input-date-absen"
              type="date"
              value="${selectedDate}"
              class="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-[#5443E8]"
            />
            <button id="btn-export-absen" class="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5">
              <span>📥</span> Unduh CSV
            </button>
            ${
              canEdit
                ? `
              <button id="btn-all-hadir" class="px-4 py-2 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-extrabold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5">
                <span>✓</span> Semua Hadir
              </button>
            `
                : ''
            }
          </div>
        </div>

        <!-- 4 KARTU METRIK FULL COLOR GLOWING -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#0072ff] to-[#00c6ff] shadow-glow-blue relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Hadir</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">✅</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${hadir} <span class="text-lg font-bold text-white/80">/ ${students.length}</span></div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Tingkat kehadiran ${persenKehadiran}%</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#F7971E] to-[#FFD200] shadow-glow-amber relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Sakit</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">🏥</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${sakit} <span class="text-lg font-bold text-white/80">Siswa</span></div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Surat dokter / info orang tua</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#8E54E9] to-[#6C5CE7] shadow-glow-purple relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Izin</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">📝</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${izin} <span class="text-lg font-bold text-white/80">Siswa</span></div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Keperluan keluarga / dispensasi</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#FF5E62] to-[#FF9966] shadow-glow-coral relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Tanpa Keterangan</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">⚠️</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${alpa} <span class="text-lg font-bold text-white/80">Siswa</span></div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">${alpa > 0 ? 'Perlu konfirmasi wali murid' : 'Nihil (Tertib 100%)'}</div>
          </div>
        </div>

        <!-- TABEL PRESENSI SISWA -->
        <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100 overflow-hidden">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Daftar Kehadiran — Tanggal ${selectedDate}</h3>
              <p class="text-xs text-slate-400 mt-0.5">
                ${canEdit ? 'Klik tombol H, S, I, atau A untuk mengubah status kehadiran siswa' : 'Menampilkan status kehadiran terverifikasi'}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2.5">
              <select id="filter-absen-status" class="px-3.5 py-2 rounded-2xl bg-slate-100 text-xs font-bold text-slate-700 outline-none">
                <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
                <option value="H" ${filterStatus === 'H' ? 'selected' : ''}>Hadir (H)</option>
                <option value="S" ${filterStatus === 'S' ? 'selected' : ''}>Sakit (S)</option>
                <option value="I" ${filterStatus === 'I' ? 'selected' : ''}>Izin (I)</option>
                <option value="A" ${filterStatus === 'A' ? 'selected' : ''}>Alpa (A)</option>
              </select>

              <div class="relative w-full sm:w-60">
                <input
                  id="search-absen-student"
                  type="text"
                  placeholder="Cari nama siswa / NISN..."
                  value="${searchQuery}"
                  class="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-100 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]"
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
                  <th class="py-3 px-4 text-center">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${
                  filtered.length > 0
                    ? filtered
                        .map((s, idx) => {
                          const currentStatus = currentAtt[s.nisn] || 'H';
                          const badge = statusBadgeInfo[currentStatus] || statusBadgeInfo.H;
                          const isChild =
                            user.role === 'orang_tua' &&
                            (user.parentOfName || 'AHMAD AJRIEL IRFAN').toLowerCase() === s.name.toLowerCase();

                          return `
                    <tr class="hover:bg-slate-50/80 transition-colors ${isChild ? 'bg-indigo-50/50' : ''}">
                      <td class="py-3.5 px-3 text-center text-slate-400 font-bold">${idx + 1}</td>
                      <td class="py-3.5 px-4 font-bold text-slate-900">
                        ${s.name}
                        <span class="ml-1.5 text-[10px] text-slate-400 font-normal">(${s.jabatan})</span>
                        ${isChild ? '<span class="ml-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black">Putra/Putri Anda</span>' : ''}
                      </td>
                      <td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">${s.nisn}</td>
                      <td class="py-3.5 px-4 text-center">
                        ${
                          canEdit
                            ? `
                          <div class="flex items-center justify-center gap-1.5">
                            <button class="status-btn px-3 py-1.5 rounded-xl font-black text-xs transition ${
                              currentStatus === 'H'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }" data-nisn="${s.nisn}" data-val="H">H</button>
                            
                            <button class="status-btn px-3 py-1.5 rounded-xl font-black text-xs transition ${
                              currentStatus === 'S'
                                ? 'bg-[#F7971E] text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }" data-nisn="${s.nisn}" data-val="S">S</button>
                            
                            <button class="status-btn px-3 py-1.5 rounded-xl font-black text-xs transition ${
                              currentStatus === 'I'
                                ? 'bg-[#8E54E9] text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }" data-nisn="${s.nisn}" data-val="I">I</button>
                            
                            <button class="status-btn px-3 py-1.5 rounded-xl font-black text-xs transition ${
                              currentStatus === 'A'
                                ? 'bg-[#FF5E62] text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }" data-nisn="${s.nisn}" data-val="A">A</button>
                          </div>
                        `
                            : `
                          <span class="px-3.5 py-1 rounded-full text-[11px] font-black border ${badge.cls}">
                            ${badge.label} (${currentStatus})
                          </span>
                        `
                        }
                      </td>
                    </tr>
                  `;
                        })
                        .join('')
                    : `<tr><td colspan="4" class="py-12 text-center text-slate-400 text-xs">Tidak ada siswa yang sesuai dengan pencarian/filter.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Listener Tanggal
    document.getElementById('input-date-absen')?.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      render();
    });

    // Listener Filter Status
    document.getElementById('filter-absen-status')?.addEventListener('change', (e) => {
      filterStatus = e.target.value;
      render();
    });

    // Listener Search
    const searchEl = document.getElementById('search-absen-student');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
        const next = document.getElementById('search-absen-student');
        if (next) {
          next.focus();
          next.setSelectionRange(next.value.length, next.value.length);
        }
      });
    }

    // Listener Semua Hadir
    document.getElementById('btn-all-hadir')?.addEventListener('click', () => {
      students.forEach((s) => {
        allAttendance[selectedDate][s.nisn] = 'H';
      });
      saveAttendance();
      storeRef.success(`Seluruh ${students.length} siswa ditandai HADIR pada tanggal ${selectedDate}.`);
      render();
    });

    // Listener Tombol Status Satuan
    containerEl.querySelectorAll('.status-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nisn = btn.getAttribute('data-nisn');
        const val = btn.getAttribute('data-val');
        allAttendance[selectedDate][nisn] = val;
        saveAttendance();
        render();
      });
    });

    // Listener Export CSV
    document.getElementById('btn-export-absen')?.addEventListener('click', () => {
      const headers = [`No,Tanggal,Nama Lengkap,NISN,Status Kehadiran`];
      const rows = students.map(
        (s, i) => `"${i + 1}","${selectedDate}","${s.name}","${s.nisn}","${currentAtt[s.nisn] || 'H'}"`
      );
      const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csv));
      link.setAttribute('download', `presensi_xe4_${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      storeRef.success(`Rekap presensi tanggal ${selectedDate} berhasil diunduh.`);
    });
  };

  render();

  return {
    unmount: () => {},
  };
}
