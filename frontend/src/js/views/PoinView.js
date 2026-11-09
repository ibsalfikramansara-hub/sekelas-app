/**
 * PoinView — Modul Catatan Kedisiplinan, Pelanggaran, & Prestasi Siswa Kelas X.E-4
 * Terintegrasi dengan Workflow 4.1 (Piket -> Pelanggaran -> Pembinaan Wali Kelas -> Selesai)
 * Mendukung Filter Status/Kategori, Pencarian, Edit/Tuntaskan/Hapus, & Unduh CSV.
 */

import { getPoinDb, savePoinDb, getStudentsDb } from '../dataStore.js';

export function renderPoinView(containerEl, storeRef) {
  const user = storeRef.user || {};
  const canManage =
    user.role === 'wali_kelas' ||
    user.role === 'admin' ||
    (user.role === 'siswa' && user.jabatanPengurus && user.jabatanPengurus !== 'anggota');
  const canResolveOrDelete = user.role === 'wali_kelas' || user.role === 'admin';

  let filterMode = 'all';
  let searchQuery = '';

  const render = () => {
    let cases = getPoinDb();
    const students = getStudentsDb();

    const pelanggaranList = cases.filter((c) => c.kategori !== 'prestasi');
    const prestasiList = cases.filter((c) => c.kategori === 'prestasi');
    const totalKasus = pelanggaranList.length;
    const ditindaklanjuti = cases.filter((c) => c.status === 'ditindaklanjuti').length;
    const selesai = cases.filter((c) => c.status === 'selesai').length;
    const indeksKepatuhan = Math.max(85, 100 - totalKasus * 0.8).toFixed(1);

    const filtered = cases.filter((c) => {
      const matchSearch =
        (c.siswa || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.jenis || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tindakan || '').toLowerCase().includes(searchQuery.toLowerCase());

      let matchFilter = true;
      if (filterMode === 'ditindaklanjuti') matchFilter = c.status === 'ditindaklanjuti';
      else if (filterMode === 'selesai') matchFilter = c.status === 'selesai';
      else if (filterMode === 'prestasi') matchFilter = c.kategori === 'prestasi';

      return matchSearch && matchFilter;
    });

    containerEl.innerHTML = `
      <div class="space-y-7">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Catatan Kedisiplinan & Poin</h1>
            <p class="text-slate-500 text-xs sm:text-sm mt-0.5">
              Monitoring ketertiban, catatan piket, pembinaan wali kelas, dan prestasi siswa <span class="font-bold text-indigo-600">X.E-4</span>.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button id="btn-export-poin" class="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5">
              <span>📥</span> Unduh CSV
            </button>
            ${
              canManage
                ? `
              <button id="btn-open-modal-poin" class="px-5 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-black transition shadow-md shadow-indigo-600/30 flex items-center gap-2">
                <span>➕</span> Catat Poin / Kasus
              </button>
            `
                : ''
            }
          </div>
        </div>

        <!-- 4 KARTU METRIK FULL COLOR GLOWING -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#FF5E62] to-[#FF9966] shadow-glow-coral relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Catatan Pelanggaran</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">⚠️</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${totalKasus} Kasus</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">${prestasiList.length} Catatan Prestasi Positif</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#F7971E] to-[#FFD200] shadow-glow-amber relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Ditindaklanjuti</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">⏳</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${ditindaklanjuti} Kasus</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Dalam pembinaan wali kelas</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#0072ff] to-[#00c6ff] shadow-glow-blue relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Selesai / Tuntas</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">✅</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${selesai} Kasus</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Pembinaan telah dituntaskan</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#8E54E9] to-[#6C5CE7] shadow-glow-purple relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Indeks Kepatuhan</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">⭐</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${indeksKepatuhan}%</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Predikat Sikap: Amat Baik</div>
          </div>
        </div>

        <!-- TABEL CATATAN KEDISIPLINAN -->
        <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100 overflow-hidden">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div class="flex flex-wrap items-center gap-1.5">
              ${[
                { k: 'all', l: 'Semua Catatan' },
                { k: 'ditindaklanjuti', l: 'Ditindaklanjuti' },
                { k: 'selesai', l: 'Selesai' },
                { k: 'prestasi', l: 'Prestasi / Penghargaan' },
              ]
                .map(
                  (tab) => `
                <button class="poin-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterMode === tab.k
                    ? 'bg-[#5443E8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }" data-mode="${tab.k}">${tab.l}</button>
              `
                )
                .join('')}
            </div>

            <div class="relative w-full sm:w-64">
              <input
                id="search-poin-input"
                type="text"
                placeholder="Cari nama siswa / keterangan..."
                value="${searchQuery}"
                class="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-100 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#5443E8]"
              />
              <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            </div>
          </div>

          <div class="overflow-x-auto mt-4">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <th class="py-3 px-3 w-12 text-center">No</th>
                  <th class="py-3 px-3">Tanggal</th>
                  <th class="py-3 px-4">Nama Siswa</th>
                  <th class="py-3 px-4">Deskripsi & Pembinaan</th>
                  <th class="py-3 px-3 text-center">Poin</th>
                  <th class="py-3 px-3">Pelapor</th>
                  <th class="py-3 px-3 text-center">Status</th>
                  <th class="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${
                  filtered.length > 0
                    ? filtered
                        .map((c, idx) => {
                          const isPrestasi = c.kategori === 'prestasi';
                          return `
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-3 text-center text-slate-400 font-bold">${idx + 1}</td>
                    <td class="py-3.5 px-3 font-mono text-[11px] text-slate-600">${c.tanggal}</td>
                    <td class="py-3.5 px-4 font-bold text-slate-900">${c.siswa}</td>
                    <td class="py-3.5 px-4 max-w-xs">
                      <div class="font-bold text-slate-800">${c.jenis}</div>
                      <div class="text-[11px] text-slate-400 mt-0.5">Tindak lanjut: ${c.tindakan || '-'}</div>
                    </td>
                    <td class="py-3.5 px-3 text-center font-black ${isPrestasi ? 'text-emerald-600' : 'text-rose-600'}">
                      ${isPrestasi ? `🌟 +${c.poin}` : `⚠️ -${c.poin}`}
                    </td>
                    <td class="py-3.5 px-3 text-slate-500">${c.pelapor}</td>
                    <td class="py-3.5 px-3 text-center">
                      <span class="px-3 py-1 rounded-full text-[10px] font-black border ${
                        c.status === 'selesai'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-[#F7971E] border-amber-200'
                      }">
                        ${c.status === 'selesai' ? 'Selesai' : 'Ditindaklanjuti'}
                      </span>
                    </td>
                    <td class="py-3.5 px-3 text-right">
                      <div class="inline-flex items-center gap-1">
                        ${
                          canManage && c.status !== 'selesai'
                            ? `
                          <button class="btn-resolve px-2.5 py-1 rounded-xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-[11px] font-bold shadow-xs transition" data-id="${c.id}">
                            Tuntaskan ✓
                          </button>
                        `
                            : `<span class="text-slate-400 text-[11px] px-1">Tuntas</span>`
                        }
                        ${
                          canResolveOrDelete
                            ? `
                          <button class="btn-delete-poin px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#FF5E62] font-bold text-[11px]" data-id="${c.id}" title="Hapus Catatan">🗑️</button>
                        `
                            : ''
                        }
                      </div>
                    </td>
                  </tr>
                `;
                        })
                        .join('')
                    : `<tr><td colspan="8" class="py-12 text-center text-slate-400 text-xs">Tidak ada catatan yang cocok dengan filter pencarian.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- MODAL CATAT PELANGGARAN / PRESTASI -->
        <div id="modal-poin" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 lg:p-7 shadow-2xl border border-slate-100">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 class="text-base font-extrabold text-slate-900">Catat Poin Kedisiplinan / Prestasi</h3>
              <button id="btn-close-modal-poin" class="text-slate-400 hover:text-slate-600 font-black text-sm">✕</button>
            </div>

            <form id="form-poin" class="mt-4 space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Kategori Catatan *</label>
                <select id="modal-poin-kategori" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-[#5443E8]">
                  <option value="pelanggaran">⚠️ Pelanggaran Tata Tertib / Piket</option>
                  <option value="prestasi">🌟 Prestasi / Apresiasi Sikap Positif</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nama Siswa Terkait *</label>
                <select id="modal-poin-siswa" required class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-[#5443E8]">
                  ${students.map((s) => `<option value="${s.name}">${s.name}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Deskripsi Kejadian / Prestasi *</label>
                <input id="modal-poin-jenis" type="text" required placeholder="Contoh: Tidak melaksanakan piket pagi" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#5443E8]">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Bobot Poin *</label>
                <select id="modal-poin-nilai" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-[#5443E8]">
                  <option value="5">5 Poin (Ringan / Apresiasi Harian)</option>
                  <option value="10" selected>10 Poin (Sedang: Lalai Piket / Terlambat)</option>
                  <option value="25">25 Poin (Berat / Prestasi Kejuaraan)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Tindakan Pembinaan / Keterangan *</label>
                <input id="modal-poin-tindakan" type="text" required placeholder="Contoh: Piket pengganti 2 hari" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#5443E8]">
              </div>

              <div class="pt-3 flex gap-2">
                <button type="button" id="btn-cancel-modal-poin" class="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition">Batal</button>
                <button type="submit" class="flex-1 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition">Simpan Catatan</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    // Listener Filter
    containerEl.querySelectorAll('.poin-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        filterMode = btn.getAttribute('data-mode');
        render();
      });
    });

    // Listener Search
    const searchEl = document.getElementById('search-poin-input');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
        const next = document.getElementById('search-poin-input');
        if (next) {
          next.focus();
          next.setSelectionRange(next.value.length, next.value.length);
        }
      });
    }

    // Export CSV
    document.getElementById('btn-export-poin')?.addEventListener('click', () => {
      const headers = ['ID,Tanggal,Nama Siswa,Kategori,Deskripsi,Poin,Pelapor,Status,Tindakan'];
      const rows = cases.map(
        (c) =>
          `"${c.id}","${c.tanggal}","${c.siswa}","${c.kategori || 'pelanggaran'}","${c.jenis}","${c.poin}","${c.pelapor}","${c.status}","${c.tindakan}"`
      );
      const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csv));
      link.setAttribute('download', 'laporan_kedisiplinan_xe4.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      storeRef.success('Laporan Kedisiplinan & Poin berhasil diunduh.');
    });

    // Modal
    const modal = document.getElementById('modal-poin');
    document.getElementById('btn-open-modal-poin')?.addEventListener('click', () => modal?.classList.remove('hidden'));
    ['btn-close-modal-poin', 'btn-cancel-modal-poin'].forEach((id) => {
      document.getElementById(id)?.addEventListener('click', () => modal?.classList.add('hidden'));
    });

    const form = document.getElementById('form-poin');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const kategori = document.getElementById('modal-poin-kategori').value;
        const siswa = document.getElementById('modal-poin-siswa').value;
        const jenis = document.getElementById('modal-poin-jenis').value.trim();
        const poin = Number(document.getElementById('modal-poin-nilai').value) || 5;
        const tindakan = document.getElementById('modal-poin-tindakan').value.trim();

        const todayStr = new Date().toISOString().slice(0, 10);
        cases.unshift({
          id: Date.now(),
          tanggal: todayStr,
          siswa,
          kategori,
          jenis,
          poin,
          pelapor: user.fullName || user.username || 'Pengurus Kelas',
          status: kategori === 'prestasi' ? 'selesai' : 'ditindaklanjuti',
          tindakan,
        });

        savePoinDb(cases);
        storeRef.success(`Catatan untuk ${siswa} berhasil disimpan.`);
        modal?.classList.add('hidden');
        render();
      });
    }

    // Tuntaskan Kasus
    containerEl.querySelectorAll('.btn-resolve').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const targetCase = cases.find((c) => c.id === id);
        if (targetCase) {
          targetCase.status = 'selesai';
          savePoinDb(cases);
          storeRef.success(`Pembinaan kasus untuk ${targetCase.siswa} dinyatakan selesai.`);
          render();
        }
      });
    });

    // Hapus Kasus
    containerEl.querySelectorAll('.btn-delete-poin').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        cases = cases.filter((c) => c.id !== id);
        savePoinDb(cases);
        storeRef.info('Catatan poin telah dihapus.');
        render();
      });
    });
  };

  render();

  return {
    unmount: () => {},
  };
}
