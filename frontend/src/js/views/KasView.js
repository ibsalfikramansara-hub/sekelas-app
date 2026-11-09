/**
 * KasView — Modul Keuangan Kelas X.E-4 (Kas & Tabungan Siswa)
 * Mengakomodasi Workflow 4.2:
 * - Setoran Kas Masuk, Pengeluaran Kas Operasional, Setor Tabungan, & Penarikan Tabungan
 * - Validasi Saldo Cukup (mencegah saldo kas atau tabungan minus)
 * - Edit & Hapus Transaksi (Bendahara, Wali Kelas, Admin)
 * - Pencarian, Filter Kategori, & Unduh Laporan CSV
 */

import { getKasDb, saveKasDb, getStudentsDb } from '../dataStore.js';

export function renderKasView(containerEl, storeRef) {
  const user = storeRef.user || {};
  const isBendahara =
    user.jabatanPengurus === 'bendahara' ||
    user.role === 'wali_kelas' ||
    user.role === 'admin';

  let filterTipe = 'all';
  let searchQuery = '';

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const render = () => {
    let transactions = getKasDb();
    const students = getStudentsDb();

    let totalKasMasuk = 0;
    let totalKasKeluar = 0;
    let totalTabungan = 0;
    const tabunganPerSiswa = {};

    transactions.forEach((t) => {
      const jml = Number(t.jumlah) || 0;
      if (t.tipe === 'kas_masuk') totalKasMasuk += jml;
      else if (t.tipe === 'kas_keluar') totalKasKeluar += jml;
      else if (t.tipe === 'tabungan_masuk') {
        totalTabungan += jml;
        if (t.siswa && t.siswa !== '-') {
          tabunganPerSiswa[t.siswa] = (tabunganPerSiswa[t.siswa] || 0) + jml;
        }
      } else if (t.tipe === 'tabungan_keluar') {
        totalTabungan -= jml;
        if (t.siswa && t.siswa !== '-') {
          tabunganPerSiswa[t.siswa] = (tabunganPerSiswa[t.siswa] || 0) - jml;
        }
      }
    });

    const saldoKas = totalKasMasuk - totalKasKeluar;

    const filtered = transactions.filter((t) => {
      const matchTipe = filterTipe === 'all' || t.tipe === filterTipe;
      const matchSearch =
        (t.siswa || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.keterangan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.tanggal || '').includes(searchQuery);
      return matchTipe && matchSearch;
    });

    const tipeBadge = {
      kas_masuk: { label: 'Kas Masuk', cls: 'bg-sky-50 text-[#0072ff] border-sky-200' },
      kas_keluar: { label: 'Kas Keluar', cls: 'bg-rose-50 text-[#FF5E62] border-rose-200' },
      tabungan_masuk: { label: 'Setor Tabungan', cls: 'bg-amber-50 text-[#F7971E] border-amber-200' },
      tabungan_keluar: { label: 'Tarik Tabungan', cls: 'bg-purple-50 text-[#8E54E9] border-purple-200' },
    };

    containerEl.innerHTML = `
      <div class="space-y-7">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Kas & Tabungan Kelas</h1>
            <p class="text-slate-500 text-xs sm:text-sm mt-0.5">
              Transparansi anggaran operasional dan simpanan siswa kelas <span class="font-bold text-indigo-600">X.E-4</span>.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button id="btn-export-kas" class="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5">
              <span>📥</span> Unduh CSV
            </button>
            ${
              isBendahara
                ? `
              <button id="btn-open-modal-kas" class="px-5 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-black transition shadow-md shadow-indigo-600/30 flex items-center gap-2">
                <span>➕</span> Catat Mutasi Kas
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
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Saldo Kas Bersih</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">💰</div>
            </div>
            <div class="text-2xl lg:text-3xl font-black tracking-tight">${formatRupiah(saldoKas)}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Dana operasional siap pakai</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#0072ff] to-[#00c6ff] shadow-glow-blue relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Total Kas Masuk</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">📥</div>
            </div>
            <div class="text-2xl lg:text-3xl font-black tracking-tight">${formatRupiah(totalKasMasuk)}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Iuran rutin siswa X.E-4</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#FF5E62] to-[#FF9966] shadow-glow-coral relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Total Pengeluaran</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">📤</div>
            </div>
            <div class="text-2xl lg:text-3xl font-black tracking-tight">${formatRupiah(totalKasKeluar)}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Kebutuhan ATK & kelas</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#F7971E] to-[#FFD200] shadow-glow-amber relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Tabungan Siswa</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">🏦</div>
            </div>
            <div class="text-2xl lg:text-3xl font-black tracking-tight">${formatRupiah(totalTabungan)}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Simpanan aktif siswa</div>
          </div>
        </div>

        <!-- RIWAYAT MUTASI KAS -->
        <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100 overflow-hidden">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <!-- Filter Pill -->
            <div class="flex flex-wrap items-center gap-1.5">
              ${[
                { k: 'all', l: 'Semua Mutasi' },
                { k: 'kas_masuk', l: 'Kas Masuk' },
                { k: 'kas_keluar', l: 'Kas Keluar' },
                { k: 'tabungan_masuk', l: 'Setor Tabungan' },
                { k: 'tabungan_keluar', l: 'Tarik Tabungan' },
              ]
                .map(
                  (btn) => `
                <button class="filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterTipe === btn.k
                    ? 'bg-[#5443E8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }" data-tipe="${btn.k}">${btn.l}</button>
              `
                )
                .join('')}
            </div>

            <!-- Search -->
            <div class="relative w-full sm:w-64">
              <input
                id="search-kas-input"
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
                  <th class="py-3 px-4">Tanggal</th>
                  <th class="py-3 px-4">Kategori</th>
                  <th class="py-3 px-4">Siswa / Pihak</th>
                  <th class="py-3 px-4">Keterangan</th>
                  <th class="py-3 px-4 text-right">Nominal</th>
                  ${isBendahara ? '<th class="py-3 px-3 text-right">Aksi</th>' : ''}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${
                  filtered.length > 0
                    ? filtered
                        .map((t, idx) => {
                          const b = tipeBadge[t.tipe] || tipeBadge.kas_masuk;
                          const isOut = t.tipe === 'kas_keluar' || t.tipe === 'tabungan_keluar';
                          return `
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-3 text-center text-slate-400 font-bold">${idx + 1}</td>
                    <td class="py-3.5 px-4 font-mono text-[11px] text-slate-600">${t.tanggal}</td>
                    <td class="py-3.5 px-4">
                      <span class="px-3 py-1 rounded-full text-[10px] font-black border ${b.cls}">
                        ${b.label}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 font-bold text-slate-900">${t.siswa}</td>
                    <td class="py-3.5 px-4 text-slate-500">${t.keterangan}</td>
                    <td class="py-3.5 px-4 text-right font-black text-xs ${isOut ? 'text-[#FF5E62]' : 'text-emerald-600'}">
                      ${isOut ? '-' : '+'} ${formatRupiah(t.jumlah)}
                    </td>
                    ${
                      isBendahara
                        ? `
                      <td class="py-3.5 px-3 text-right">
                        <div class="inline-flex items-center gap-1">
                          <button class="btn-edit-kas px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-[#5443E8] font-bold text-[11px]" data-id="${t.id}" title="Edit">✏️</button>
                          <button class="btn-delete-kas px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#FF5E62] font-bold text-[11px]" data-id="${t.id}" title="Hapus">🗑️</button>
                        </div>
                      </td>
                    `
                        : ''
                    }
                  </tr>
                `;
                        })
                        .join('')
                    : `<tr><td colspan="${isBendahara ? 7 : 6}" class="py-12 text-center text-slate-400 text-xs">Tidak ada transaksi mutasi yang cocok.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- MODAL CATAT / EDIT TRANSAKSI KAS -->
        <div id="modal-kas" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 lg:p-7 shadow-2xl border border-slate-100">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 id="modal-kas-title" class="text-base font-extrabold text-slate-900">Catat Mutasi Keuangan</h3>
              <button id="btn-close-modal-kas" class="text-slate-400 hover:text-slate-600 font-black text-sm">✕</button>
            </div>

            <form id="form-transaksi-kas" class="mt-4 space-y-4">
              <input type="hidden" id="modal-kas-id" value="" />
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Tipe Transaksi *</label>
                <select id="modal-tipe" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-[#5443E8]">
                  <option value="kas_masuk">Iuran Kas Masuk (+)</option>
                  <option value="kas_keluar">Pengeluaran Kas Operasional (-)</option>
                  <option value="tabungan_masuk">Setoran Tabungan Siswa (+)</option>
                  <option value="tabungan_keluar">Penarikan Tabungan Siswa (-)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nama Siswa / Pengaju</label>
                <select id="modal-siswa" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-[#5443E8]">
                  <option value="-">- Operasional Umum Kelas (Tanpa Siswa) -</option>
                  ${students.map((s) => `<option value="${s.name}">${s.name}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nominal (Rp) *</label>
                <input id="modal-nominal" type="number" required min="1000" step="500" placeholder="Contoh: 20000" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-[#5443E8]">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Keterangan Transaksi *</label>
                <input id="modal-keterangan" type="text" required placeholder="Contoh: Iuran Kas Bulan November" class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#5443E8]">
              </div>

              <div class="pt-3 flex gap-2">
                <button type="button" id="btn-cancel-modal-kas" class="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition">Batal</button>
                <button type="submit" class="flex-1 py-2.5 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition">Simpan Mutasi</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    // Listener Filter
    containerEl.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        filterTipe = btn.getAttribute('data-tipe');
        render();
      });
    });

    // Listener Search
    const searchEl = document.getElementById('search-kas-input');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
        const next = document.getElementById('search-kas-input');
        if (next) {
          next.focus();
          next.setSelectionRange(next.value.length, next.value.length);
        }
      });
    }

    // Listener Export CSV
    document.getElementById('btn-export-kas')?.addEventListener('click', () => {
      const headers = ['ID,Tanggal,Tipe,Siswa,Nominal,Keterangan'];
      const rows = transactions.map(
        (t) => `"${t.id}","${t.tanggal}","${t.tipe}","${t.siswa}","${t.jumlah}","${t.keterangan}"`
      );
      const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csv));
      link.setAttribute('download', 'laporan_keuangan_kas_xe4.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      storeRef.success('Laporan Keuangan Kas & Tabungan berhasil diunduh.');
    });

    // Modal Add / Edit
    const modal = document.getElementById('modal-kas');
    const form = document.getElementById('form-transaksi-kas');

    document.getElementById('btn-open-modal-kas')?.addEventListener('click', () => {
      document.getElementById('modal-kas-title').textContent = 'Catat Mutasi Keuangan Baru';
      document.getElementById('modal-kas-id').value = '';
      document.getElementById('modal-tipe').value = 'kas_masuk';
      document.getElementById('modal-siswa').value = students[0]?.name || '-';
      document.getElementById('modal-nominal').value = '';
      document.getElementById('modal-keterangan').value = '';
      modal?.classList.remove('hidden');
    });

    containerEl.querySelectorAll('.btn-edit-kas').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const t = transactions.find((x) => x.id === id);
        if (!t) return;
        document.getElementById('modal-kas-title').textContent = 'Edit Transaksi Keuangan';
        document.getElementById('modal-kas-id').value = String(t.id);
        document.getElementById('modal-tipe').value = t.tipe;
        document.getElementById('modal-siswa').value = t.siswa;
        document.getElementById('modal-nominal').value = t.jumlah;
        document.getElementById('modal-keterangan').value = t.keterangan;
        modal?.classList.remove('hidden');
      });
    });

    containerEl.querySelectorAll('.btn-delete-kas').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        transactions = transactions.filter((x) => x.id !== id);
        saveKasDb(transactions);
        storeRef.info('Data transaksi berhasil dihapus.');
        render();
      });
    });

    ['btn-close-modal-kas', 'btn-cancel-modal-kas'].forEach((id) => {
      document.getElementById(id)?.addEventListener('click', () => modal?.classList.add('hidden'));
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('modal-kas-id').value;
        const tipe = document.getElementById('modal-tipe').value;
        const siswa = document.getElementById('modal-siswa').value;
        const jumlah = Number(document.getElementById('modal-nominal').value) || 0;
        const keterangan = document.getElementById('modal-keterangan').value.trim();

        if (jumlah < 1000) {
          storeRef.error('Nominal transaksi minimal Rp 1.000.');
          return;
        }

        if ((tipe === 'kas_masuk' || tipe === 'tabungan_masuk' || tipe === 'tabungan_keluar') && siswa === '-') {
          storeRef.error('Silakan pilih nama siswa untuk transaksi iuran atau tabungan.');
          return;
        }

        if (tipe === 'kas_keluar' && !editId && jumlah > saldoKas) {
          storeRef.error(`Saldo kas aktif (${formatRupiah(saldoKas)}) tidak mencukupi untuk pengeluaran ini.`);
          return;
        }

        if (tipe === 'tabungan_keluar' && !editId) {
          const currentSiswaTab = tabunganPerSiswa[siswa] || 0;
          if (jumlah > currentSiswaTab) {
            storeRef.error(`Saldo tabungan ${siswa} (${formatRupiah(currentSiswaTab)}) tidak mencukupi.`);
            return;
          }
        }

        if (editId) {
          const target = transactions.find((x) => String(x.id) === String(editId));
          if (target) {
            target.tipe = tipe;
            target.siswa = tipe === 'kas_keluar' ? '-' : siswa;
            target.jumlah = jumlah;
            target.keterangan = keterangan;
          }
          storeRef.success('Data mutasi keuangan berhasil diperbarui.');
        } else {
          const todayStr = new Date().toISOString().slice(0, 10);
          transactions.unshift({
            id: Date.now(),
            tanggal: todayStr,
            tipe,
            siswa: tipe === 'kas_keluar' ? '-' : siswa,
            jumlah,
            keterangan,
            statusApproval: 'approved',
          });
          storeRef.success(`Transaksi ${formatRupiah(jumlah)} berhasil dicatat.`);
        }

        saveKasDb(transactions);
        modal?.classList.add('hidden');
        render();
      });
    }
  };

  render();

  return {
    unmount: () => {},
  };
}
