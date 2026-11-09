/**
 * TugasView — Modul Manajemen, Pengumpulan, & Evaluasi Tugas Kelas X.E-4
 * Mengakomodasi Workflow 4.3:
 * - Guru Mapel / Wali Kelas / Admin: Publikasi Tugas, Edit, Hapus, & Beri Nilai + Umpan Balik
 * - Siswa / Pengurus: Kumpulkan Link Tugas & Lihat Nilai beserta Catatan Guru
 * - Orang Tua: Monitoring Progres Tugas & Nilai Anak (Read-Only)
 */

import { getTugasDb, saveTugasDb } from '../dataStore.js';

export function renderTugasView(containerEl, storeRef) {
  const user = storeRef.user || {};
  const isGuru = user.role === 'guru_mapel' || user.role === 'wali_kelas' || user.role === 'admin';
  const isSiswa = user.role === 'siswa';

  // Jika dibuka dari menu '#/tugas/nilai', fokuskan pada tugas yang siap dinilai
  let filterStatus = window.location.hash === '#/tugas/nilai' ? 'siap_nilai' : 'all';
  let searchQuery = '';

  const render = () => {
    let tugasList = getTugasDb();

    const totalTugas = tugasList.length;
    const terkumpul = tugasList.filter((t) => t.status === 'terkumpul' || t.status === 'dinilai').length;
    const belumKumpul = tugasList.filter((t) => t.status === 'belum_kumpul').length;
    const sudahDinilai = tugasList.filter((t) => t.nilai !== null);
    const avgNilai =
      sudahDinilai.length > 0
        ? (sudahDinilai.reduce((acc, c) => acc + Number(c.nilai), 0) / sudahDinilai.length).toFixed(1)
        : '95.0';

    const filtered = tugasList.filter((t) => {
      const matchSearch =
        (t.judul || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.mapel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.guru || '').toLowerCase().includes(searchQuery.toLowerCase());

      let matchFilter = true;
      if (filterStatus === 'belum_kumpul') matchFilter = t.status === 'belum_kumpul';
      else if (filterStatus === 'siap_nilai') matchFilter = t.status === 'terkumpul' || t.status === 'dinilai';
      else if (filterStatus === 'dinilai') matchFilter = t.nilai !== null;

      return matchSearch && matchFilter;
    });

    containerEl.innerHTML = `
      <div class="space-y-7">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              ${window.location.hash === '#/tugas/nilai' ? 'Evaluasi & Penilaian Tugas' : 'Manajemen & Tugas Kelas'}
            </h1>
            <p class="text-slate-500 text-xs sm:text-sm mt-0.5">
              Portal penugasan akademik, pengumpulan karya siswa, dan evaluasi nilai <span class="font-bold text-indigo-600">X.E-4</span>.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button id="btn-export-tugas" class="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5">
              <span>📥</span> Unduh CSV
            </button>
            ${
              isGuru
                ? `
              <button id="btn-open-modal-tugas" class="px-5 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-black transition shadow-md shadow-indigo-600/30 flex items-center gap-2">
                <span>➕</span> Publikasikan Tugas Baru
              </button>
            `
                : ''
            }
          </div>
        </div>

        <!-- 4 KARTU METRIK FULL COLOR GLOWING -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#8E54E9] to-[#6C5CE7] shadow-glow-purple relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Total Tugas</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">📚</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${totalTugas} Tugas</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Semester Ganjil 2026/2027</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#0072ff] to-[#00c6ff] shadow-glow-blue relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Sudah Terkumpul</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">📥</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${terkumpul} Tugas</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">${sudahDinilai.length} Sudah Dinilai Guru</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#FF5E62] to-[#FF9966] shadow-glow-coral relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Belum Dikumpulkan</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">⏳</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${belumKumpul} Tugas</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Perlu segera diselesaikan</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#F7971E] to-[#FFD200] shadow-glow-amber relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Rata-rata Nilai</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">⭐</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${avgNilai}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Skala Evaluasi 0 - 100</div>
          </div>
        </div>

        <!-- FILTER & SEARCH BAR -->
        <div class="bg-white rounded-3xl p-4 sm:p-5 shadow-card-modern border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-1.5">
            ${[
              { k: 'all', l: 'Semua Tugas' },
              { k: 'belum_kumpul', l: 'Belum Dikumpulkan' },
              { k: 'siap_nilai', l: 'Sudah Terkumpul' },
              { k: 'dinilai', l: 'Sudah Dinilai' },
            ]
              .map(
                (tab) => `
              <button class="tugas-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === tab.k
                  ? 'bg-[#5443E8] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }" data-status="${tab.k}">${tab.l}</button>
            `
              )
              .join('')}
          </div>

          <div class="relative w-full sm:w-64">
            <input
              id="search-tugas-input"
              type="text"
              placeholder="Cari judul / mata pelajaran..."
              value="${searchQuery}"
              class="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-100 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]"
            />
            <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        <!-- DAFTAR KARTU TUGAS MODERN -->
        <div class="space-y-4">
          ${
            filtered.length > 0
              ? filtered
                  .map(
                    (t) => `
            <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100 transition-all hover:border-indigo-100 hover:shadow-lg">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div class="space-y-2.5 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-[#8E54E9] border border-purple-200">
                      ${t.mapel}
                    </span>
                    <span class="text-xs text-slate-400">• Pengampu: <strong class="text-slate-700">${t.guru}</strong></span>
                  </div>

                  <h3 class="text-lg font-black text-slate-900">${t.judul}</h3>
                  <p class="text-xs text-slate-600 leading-relaxed max-w-3xl">${t.deskripsi}</p>

                  ${
                    t.catatanSiswa
                      ? `
                    <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-1 max-w-2xl">
                      <div class="font-bold text-slate-700 flex items-center gap-1.5">
                        <span>📎</span> Lampiran Pengumpulan ${t.submittedBy ? `(${t.submittedBy})` : ''}:
                      </div>
                      <div class="text-indigo-600 font-mono text-[11px] break-all">${t.catatanSiswa}</div>
                      ${
                        t.catatanGuru
                          ? `<div class="pt-1.5 mt-1.5 border-t border-slate-200 text-emerald-700 font-semibold">💬 Catatan Guru: "${t.catatanGuru}"</div>`
                          : ''
                      }
                    </div>
                  `
                      : ''
                  }

                  <div class="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                    <span class="flex items-center gap-1 font-mono">
                      <span>⏰</span> Deadline: ${(t.deadline || '').replace('T', ' ')}
                    </span>
                    <span class="flex items-center gap-1">
                      <span>🎯</span> Poin Maksimal: ${t.poinMaksimal || 100}
                    </span>
                  </div>
                </div>

                <!-- Bagian Kanan: Status & Tombol Aksi -->
                <div class="flex flex-col sm:items-end justify-between gap-3 min-w-[180px] pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div>
                    ${
                      t.nilai !== null
                        ? `
                      <div class="sm:text-right">
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Sudah Dinilai</span>
                        <div class="text-2xl font-black text-emerald-600 mt-1">${t.nilai} <span class="text-xs text-slate-400">/ 100</span></div>
                      </div>
                    `
                        : t.status === 'terkumpul'
                        ? `
                      <span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-[#0072ff] border border-sky-200 inline-block">
                        ✓ Terkumpul (Menunggu Nilai)
                      </span>
                    `
                        : `
                      <span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-[#FF5E62] border border-rose-200 inline-block">
                        ⏳ Belum Dikumpulkan
                      </span>
                    `
                    }
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    ${
                      isGuru
                        ? `
                      <button class="btn-grade-tugas px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition" data-id="${t.id}">
                        📝 Beri Nilai
                      </button>
                      <button class="btn-edit-tugas px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-[#5443E8] text-xs font-bold transition" data-id="${t.id}" title="Edit Tugas">
                        ✏️
                      </button>
                      <button class="btn-delete-tugas px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#FF5E62] text-xs font-bold transition" data-id="${t.id}" title="Hapus Tugas">
                        🗑️
                      </button>
                    `
                        : ''
                    }

                    ${
                      isSiswa
                        ? `
                      <button class="btn-submit-tugas px-4 py-2 rounded-xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition" data-id="${t.id}">
                        ${t.status === 'terkumpul' || t.nilai !== null ? '📤 Kirim Revisi' : '📤 Kumpulkan Jawaban'}
                      </button>
                    `
                        : ''
                    }
                  </div>
                </div>
              </div>
            </div>
          `
                  )
                  .join('')
              : `<div class="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-100">Tidak ada tugas yang sesuai dengan filter pencarian.</div>`
          }
        </div>

        <!-- MODAL BUAT / EDIT TUGAS (Guru / Wali / Admin) -->
        <div id="modal-create-tugas" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-7 shadow-2xl border border-slate-100">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 id="modal-tugas-form-title" class="text-base font-extrabold text-slate-900">Publikasikan Tugas Baru</h3>
              <button id="btn-close-modal-create" class="text-slate-400 hover:text-slate-600 font-black text-sm">✕</button>
            </div>

            <form id="form-create-tugas" class="mt-4 space-y-4">
              <input type="hidden" id="modal-tugas-edit-id" value="" />
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran *</label>
                <input id="modal-tugas-mapel" type="text" required placeholder="Contoh: Informatika & Pemrograman" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-[#5443E8]">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Judul Tugas *</label>
                <input id="modal-tugas-judul" type="text" required placeholder="Contoh: Proyek Struktur Data Python" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-[#5443E8]">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Instruksi & Deskripsi Tugas *</label>
                <textarea id="modal-tugas-deskripsi" rows="3" required placeholder="Tuliskan rincian instruksi pengerjaan tugas..." class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#5443E8]"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Batas Waktu (Deadline) *</label>
                  <input id="modal-tugas-deadline" type="datetime-local" required class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#5443E8]">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Poin Maksimal</label>
                  <input id="modal-tugas-poin" type="number" value="100" min="10" max="100" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-[#5443E8]">
                </div>
              </div>

              <div class="pt-3 flex gap-2">
                <button type="button" id="btn-cancel-modal-create" class="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition">Batal</button>
                <button type="submit" class="flex-1 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition">Simpan Tugas</button>
              </div>
            </form>
          </div>
        </div>

        <!-- MODAL KUMPULKAN JAWABAN (Siswa) -->
        <div id="modal-submit-tugas" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 lg:p-7 shadow-2xl border border-slate-100">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 class="text-base font-extrabold text-slate-900">📤 Kumpulkan Lembar Tugas</h3>
              <button id="btn-close-modal-submit" class="text-slate-400 hover:text-slate-600 font-black text-sm">✕</button>
            </div>

            <form id="form-submit-tugas" class="mt-4 space-y-4">
              <input type="hidden" id="modal-submit-id" />
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Tautan File / Repositori Tugas *</label>
                <input id="modal-submit-link" type="text" required placeholder="https://drive.google.com/... atau GitHub/Colab" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#5443E8]">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Catatan Siswa untuk Guru *</label>
                <textarea id="modal-submit-catatan" rows="3" required placeholder="Jelaskan ringkasan tugas yang Anda kumpulkan..." class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#5443E8]"></textarea>
              </div>

              <div class="pt-3 flex gap-2">
                <button type="button" id="btn-cancel-modal-submit" class="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition">Batal</button>
                <button type="submit" class="flex-1 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition">Kirim Tugas</button>
              </div>
            </form>
          </div>
        </div>

        <!-- MODAL BERI NILAI & FEEDBACK (Guru) -->
        <div id="modal-grade-tugas" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-sm w-full p-6 lg:p-7 shadow-2xl border border-slate-100">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 class="text-base font-extrabold text-slate-900">📝 Evaluasi & Nilai Tugas</h3>
              <button id="btn-close-modal-grade" class="text-slate-400 hover:text-slate-600 font-black text-sm">✕</button>
            </div>

            <form id="form-grade-tugas" class="mt-4 space-y-4">
              <input type="hidden" id="modal-grade-id" />
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nilai Evaluasi (0 - 100) *</label>
                <input id="modal-grade-val" type="number" min="0" max="100" required placeholder="95" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-lg font-black text-center text-indigo-600 outline-none focus:ring-2 focus:ring-[#5443E8]">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Umpan Balik / Catatan Guru</label>
                <textarea id="modal-grade-feedback" rows="2" placeholder="Berikan apresiasi atau masukan evaluasi..." class="w-full px-4 py-2 rounded-2xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#5443E8]"></textarea>
              </div>

              <div class="pt-2 flex gap-2">
                <button type="button" id="btn-cancel-modal-grade" class="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition">Batal</button>
                <button type="submit" class="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 transition">Simpan Nilai</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    // Filter Buttons
    containerEl.querySelectorAll('.tugas-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        filterStatus = btn.getAttribute('data-status');
        render();
      });
    });

    // Search
    const searchEl = document.getElementById('search-tugas-input');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
        const next = document.getElementById('search-tugas-input');
        if (next) {
          next.focus();
          next.setSelectionRange(next.value.length, next.value.length);
        }
      });
    }

    // Export CSV
    document.getElementById('btn-export-tugas')?.addEventListener('click', () => {
      const headers = ['ID,Mata Pelajaran,Guru,Judul Tugas,Deadline,Status,Nilai,Catatan Siswa'];
      const rows = tugasList.map(
        (t) =>
          `"${t.id}","${t.mapel}","${t.guru}","${t.judul}","${t.deadline}","${t.status}","${t.nilai ?? '-'}","${(t.catatanSiswa || '').replace(/"/g, '""')}"`
      );
      const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csv));
      link.setAttribute('download', 'rekap_tugas_kelas_xe4.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      storeRef.success('Rekapitulasi Tugas & Nilai berhasil diunduh.');
    });

    // Modal Create / Edit Tugas
    const modalCreate = document.getElementById('modal-create-tugas');
    const formCreate = document.getElementById('form-create-tugas');

    document.getElementById('btn-open-modal-tugas')?.addEventListener('click', () => {
      document.getElementById('modal-tugas-form-title').textContent = 'Publikasikan Tugas Baru';
      document.getElementById('modal-tugas-edit-id').value = '';
      document.getElementById('modal-tugas-mapel').value = '';
      document.getElementById('modal-tugas-judul').value = '';
      document.getElementById('modal-tugas-deskripsi').value = '';
      document.getElementById('modal-tugas-deadline').value = '2026-11-25T23:59';
      document.getElementById('modal-tugas-poin').value = '100';
      modalCreate?.classList.remove('hidden');
    });

    containerEl.querySelectorAll('.btn-edit-tugas').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const t = tugasList.find((x) => x.id === id);
        if (!t) return;
        document.getElementById('modal-tugas-form-title').textContent = 'Edit Data Tugas';
        document.getElementById('modal-tugas-edit-id').value = String(t.id);
        document.getElementById('modal-tugas-mapel').value = t.mapel;
        document.getElementById('modal-tugas-judul').value = t.judul;
        document.getElementById('modal-tugas-deskripsi').value = t.deskripsi;
        document.getElementById('modal-tugas-deadline').value = (t.deadline || '').slice(0, 16);
        document.getElementById('modal-tugas-poin').value = t.poinMaksimal || 100;
        modalCreate?.classList.remove('hidden');
      });
    });

    containerEl.querySelectorAll('.btn-delete-tugas').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        tugasList = tugasList.filter((x) => x.id !== id);
        saveTugasDb(tugasList);
        storeRef.info('Tugas telah dihapus.');
        render();
      });
    });

    ['btn-close-modal-create', 'btn-cancel-modal-create'].forEach((id) => {
      document.getElementById(id)?.addEventListener('click', () => modalCreate?.classList.add('hidden'));
    });

    if (formCreate) {
      formCreate.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('modal-tugas-edit-id').value;
        const mapel = document.getElementById('modal-tugas-mapel').value.trim();
        const judul = document.getElementById('modal-tugas-judul').value.trim();
        const deskripsi = document.getElementById('modal-tugas-deskripsi').value.trim();
        const deadline = document.getElementById('modal-tugas-deadline').value;
        const poin = Number(document.getElementById('modal-tugas-poin').value) || 100;

        if (editId) {
          const target = tugasList.find((x) => String(x.id) === String(editId));
          if (target) {
            target.mapel = mapel;
            target.judul = judul;
            target.deskripsi = deskripsi;
            target.deadline = deadline;
            target.poinMaksimal = poin;
          }
          storeRef.success(`Tugas "${judul}" berhasil diperbarui.`);
        } else {
          tugasList.unshift({
            id: Date.now(),
            mapel,
            guru: user.fullName || user.username || 'Guru Mapel',
            judul,
            deskripsi,
            deadline,
            poinMaksimal: poin,
            status: 'belum_kumpul',
            nilai: null,
            catatanSiswa: '',
            catatanGuru: '',
            submittedBy: '',
            submittedAt: null,
          });
          storeRef.success(`Tugas baru "${judul}" berhasil dipublikasikan ke kelas X.E-4!`);
        }

        saveTugasDb(tugasList);
        modalCreate?.classList.add('hidden');
        render();
      });
    }

    // Modal Submit Tugas (Siswa)
    const modalSubmit = document.getElementById('modal-submit-tugas');
    const formSubmit = document.getElementById('form-submit-tugas');

    containerEl.querySelectorAll('.btn-submit-tugas').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const t = tugasList.find((x) => x.id === id);
        document.getElementById('modal-submit-id').value = String(id);
        document.getElementById('modal-submit-link').value = '';
        document.getElementById('modal-submit-catatan').value = '';
        if (t && t.catatanSiswa) {
          const parts = t.catatanSiswa.split(' — ');
          document.getElementById('modal-submit-link').value = parts[0] || '';
          document.getElementById('modal-submit-catatan').value = parts[1] || '';
        }
        modalSubmit?.classList.remove('hidden');
      });
    });

    ['btn-close-modal-submit', 'btn-cancel-modal-submit'].forEach((id) => {
      document.getElementById(id)?.addEventListener('click', () => modalSubmit?.classList.add('hidden'));
    });

    if (formSubmit) {
      formSubmit.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = Number(document.getElementById('modal-submit-id').value);
        const link = document.getElementById('modal-submit-link').value.trim();
        const catatan = document.getElementById('modal-submit-catatan').value.trim();

        const target = tugasList.find((t) => t.id === id);
        if (target) {
          target.status = 'terkumpul';
          target.catatanSiswa = `${link} — ${catatan}`;
          target.submittedBy = user.fullName || user.username || 'Siswa';
          target.submittedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
          saveTugasDb(tugasList);
          storeRef.success(`Jawaban untuk tugas "${target.judul}" berhasil dikirim!`);
        }

        modalSubmit?.classList.add('hidden');
        render();
      });
    }

    // Modal Beri Nilai (Guru)
    const modalGrade = document.getElementById('modal-grade-tugas');
    const formGrade = document.getElementById('form-grade-tugas');

    containerEl.querySelectorAll('.btn-grade-tugas').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const t = tugasList.find((x) => x.id === id);
        document.getElementById('modal-grade-id').value = String(id);
        document.getElementById('modal-grade-val').value = t?.nilai !== null ? t.nilai : 90;
        document.getElementById('modal-grade-feedback').value = t?.catatanGuru || 'Kerja bagus, pertahankan!';
        modalGrade?.classList.remove('hidden');
      });
    });

    ['btn-close-modal-grade', 'btn-cancel-modal-grade'].forEach((id) => {
      document.getElementById(id)?.addEventListener('click', () => modalGrade?.classList.add('hidden'));
    });

    if (formGrade) {
      formGrade.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = Number(document.getElementById('modal-grade-id').value);
        const score = Number(document.getElementById('modal-grade-val').value);
        const feedback = document.getElementById('modal-grade-feedback').value.trim();

        if (score < 0 || score > 100) {
          storeRef.error('Nilai harus berada pada rentang 0 hingga 100.');
          return;
        }

        const target = tugasList.find((t) => t.id === id);
        if (target) {
          target.nilai = score;
          target.catatanGuru = feedback;
          target.status = 'dinilai';
          saveTugasDb(tugasList);
          storeRef.success(`Nilai ${score} berhasil disimpan untuk tugas "${target.judul}".`);
        }

        modalGrade?.classList.add('hidden');
        render();
      });
    }
  };

  render();

  return {
    unmount: () => {},
  };
}
