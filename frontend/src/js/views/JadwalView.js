/**
 * JadwalView — Modul Jadwal Pelajaran & Rotasi Piket Kelas X.E-4
 * Terintegrasi dengan Workflow 4.1:
 * - Pengurus Kelas (Ketua/Sekretaris/Seksi Kebersihan), Wali Kelas, & Admin dapat memverifikasi piket
 * - Tombol "Lapor Lalai Piket" otomatis mencatat pelanggaran ke Modul Catatan Poin
 * - Admin & Wali Kelas dapat menambah/menghapus sesi jadwal pelajaran
 */

import { getPoinDb, savePoinDb } from '../dataStore.js';

export const DEFAULT_JADWAL_PELAJARAN = {
  Senin: [
    { id: 101, jam: '07:00 - 08:30', mapel: 'Upacara & Jam Wali Kelas', guru: 'Mr. Ahmad Yuwafi', ruang: 'R. XE-4', tag: 'Wali Kelas', color: 'purple' },
    { id: 102, jam: '08:30 - 10:00', mapel: 'Bahasa Indonesia', guru: 'Ibu Dra. Siti Aminah', ruang: 'R. XE-4', tag: 'Bahasa', color: 'blue' },
    { id: 103, jam: '10:15 - 11:45', mapel: 'Matematika Tingkat Lanjut', guru: 'Bpk. H. Sugeng, M.Pd', ruang: 'R. XE-4', tag: 'Eksakta', color: 'coral' },
    { id: 104, jam: '12:30 - 14:00', mapel: 'Informatika & Pemrograman', guru: 'Ms. Wilda Ulfiyanti, S.Kom', ruang: 'Lab Komp 2', tag: 'ICT', color: 'amber' },
  ],
  Selasa: [
    { id: 201, jam: '07:00 - 08:30', mapel: 'Fisika Bilingual', guru: 'Bpk. Ir. Bambang, M.Sc', ruang: 'R. XE-4', tag: 'Sains', color: 'blue' },
    { id: 202, jam: '08:30 - 10:00', mapel: 'Bahasa Inggris / Cambridge', guru: 'Mr. John Miller, B.Ed', ruang: 'R. XE-4', tag: 'Bahasa', color: 'purple' },
    { id: 203, jam: '10:15 - 11:45', mapel: 'Pendidikan Agama & Budi Pekerti', guru: 'Ust. Nurul Huda, S.Pd.I', ruang: 'Masjid / R. XE-4', tag: 'Agama', color: 'amber' },
    { id: 204, jam: '12:30 - 14:00', mapel: 'Kimia Dasar', guru: 'Ibu Ratna Dewi, M.Si', ruang: 'Lab Kimia', tag: 'Sains', color: 'coral' },
  ],
  Rabu: [
    { id: 301, jam: '07:00 - 08:30', mapel: 'Biologi Sel & Genetika', guru: 'Ibu Dr. Endang Sulastri', ruang: 'Lab Biologi', tag: 'Sains', color: 'blue' },
    { id: 302, jam: '08:30 - 10:00', mapel: 'Ekonomi & Literasi Finansial', guru: 'Bpk. Arif Wicaksono, M.M', ruang: 'R. XE-4', tag: 'Sosial', color: 'purple' },
    { id: 303, jam: '10:15 - 11:45', mapel: 'PJOK / Olahraga & Kebugaran', guru: 'Bpk. Coach Danu Prasetyo', ruang: 'Lapangan Utama', tag: 'Olahraga', color: 'coral' },
    { id: 304, jam: '12:30 - 14:00', mapel: 'Sejarah Indonesia', guru: 'Ibu Sri Rahayu, S.Pd', ruang: 'R. XE-4', tag: 'Sejarah', color: 'amber' },
  ],
  Kamis: [
    { id: 401, jam: '07:00 - 08:30', mapel: 'Sosiologi & Antropologi', guru: 'Ibu Fatimah, S.Sos', ruang: 'R. XE-4', tag: 'Sosial', color: 'blue' },
    { id: 402, jam: '08:30 - 10:00', mapel: 'Geografi Spasial', guru: 'Bpk. Ridwan, M.Pd', ruang: 'R. XE-4', tag: 'Sosial', color: 'purple' },
    { id: 403, jam: '10:15 - 11:45', mapel: 'Seni Budaya & Desain Multimedia', guru: 'Bpk. Hendra S.Sn', ruang: 'R. Multimedia', tag: 'Seni', color: 'coral' },
    { id: 404, jam: '12:30 - 14:00', mapel: 'Les Intensif UTBK - Penalaran Umum', guru: 'Tim UTBK Bintang Edu', ruang: 'R. XE-4', tag: 'UTBK', color: 'amber' },
  ],
  Jumat: [
    { id: 501, jam: '07:00 - 08:00', mapel: 'Senam Pagi & Gerakan Literasi', guru: 'Koordinator Kesiswaan', ruang: 'Lapangan', tag: 'Pembiasaan', color: 'purple' },
    { id: 502, jam: '08:00 - 09:30', mapel: 'Bahasa Arab', guru: 'Ust. Kholilurrohman, Lc', ruang: 'R. XE-4', tag: 'Bahasa', color: 'blue' },
    { id: 503, jam: '09:45 - 11:15', mapel: 'Pendidikan Pancasila & Kewarganegaraan', guru: 'Ibu Laksmi, M.H', ruang: 'R. XE-4', tag: 'PKn', color: 'coral' },
    { id: 504, jam: '11:15 - 13:00', mapel: 'Ibadah Shalat Jumat Berjamaah', guru: 'Seluruh Sivitas', ruang: 'Masjid Sekolah', tag: 'Ibadah', color: 'amber' },
  ],
  Sabtu: [
    { id: 601, jam: '07:00 - 08:30', mapel: 'Pengembangan Diri & Ekstrakurikuler', guru: 'Pembina Ekskul', ruang: 'Area Ekskul', tag: 'Ekskul', color: 'purple' },
    { id: 602, jam: '08:30 - 10:00', mapel: 'Les Intensif UTBK - Literasi Bahasa', guru: 'Tim UTBK Bintang Edu', ruang: 'R. XE-4', tag: 'UTBK', color: 'blue' },
    { id: 603, jam: '10:15 - 11:45', mapel: 'Karya Ilmiah Remaja & Robotika ICT', guru: 'Ms. Wilda Ulfiyanti', ruang: 'Lab Riset', tag: 'Riset', color: 'coral' },
  ]
};

export const JADWAL_PIKET = {
  Senin: ['AHMAD AJRIEL IRFAN', 'AHMAD FAIRUZ SYIHAB ARAFIF', 'AINUL FUTICHATUR RIZQOH', 'ANDHIKA ADI SAPUTRA', 'AQILA MUMTAZ EL HADY', 'AULIA ZAHWA IZZATUNNISA\''],
  Selasa: ['AURELIA NAMIRA RAMANIYA', 'AZAM YUSUF MANSUR', 'BRIAN ARVIN YUDA ALBAIHAQI', 'DEFAAIQSYAH HIBATULLAH ABRAAR', 'DIFA FAUQI AIS FADILLA', 'FAIQ AULIA AMALI'],
  Rabu: ['FAISAL FATHIN BAYHAQI', 'FARHATUL ATIKAH', 'FITRI AMALIA HIDAYAH', 'HAJIRA NADA SALSABILA', 'HANNA AULIA', 'HISHAM MUHAMMAD SHOFA'],
  Kamis: ['ILHAM EKI NUR HAKIM', 'ILHAM PRABU MUKTAMAR', 'KAMILAH NA\'ILATUN NIHLAH', 'KEISHA NISWATUN SUPRIYANTO', 'KHUSNA AULIYAUSSYIFA', 'MOH NIQOBULLUBAB'],
  Jumat: ['MUHAMMAD BALYA SAMAHAT', 'MUHAMMAD HAZIM AL FANANI', 'MUHAMMAD MUFLIH ALMURTADLO', 'MUHAMMAD RAFIF ARYAJUNA', 'MUHAMMAD ZIVAN', 'NABILA TSABITA PUTRI MUSTOFA'],
  Sabtu: ['NASYWA TSABITA HAWA', 'NIA RAHMA IZZATI', 'RAFKA ARYA MAULANA', 'RONALD SANJAYA', 'SYAKIRA KHANSA SANTOSO', 'WILDA AYU SHOLIKHAH', 'ZAHARA NUR AULIA', 'ZAHIRA PUTRI FITRIA KHOIRUNNISA']
};

export function renderJadwalView(containerEl, storeRef) {
  const user = storeRef.user || {};
  const canManageMapel = user.role === 'admin' || user.role === 'wali_kelas';
  const canManagePiket =
    user.role === 'admin' ||
    user.role === 'wali_kelas' ||
    (user.role === 'siswa' && ['ketua_kelas', 'sekretaris', 'seksi_kebersihan'].includes(user.jabatanPengurus));

  let activeTab = 'mapel';
  let selectedDay = 'Senin';

  const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayIndex = new Date().getDay();
  const dayMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = dayMap[dayIndex] || 'Senin';
  if (hariList.includes(todayName)) {
    selectedDay = todayName;
  }

  const getJadwalMapelDb = () => {
    try {
      const saved = localStorage.getItem('sekelas_jadwal_mapel');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    localStorage.setItem('sekelas_jadwal_mapel', JSON.stringify(DEFAULT_JADWAL_PELAJARAN));
    return JSON.parse(JSON.stringify(DEFAULT_JADWAL_PELAJARAN));
  };

  const saveJadwalMapelDb = (data) => {
    localStorage.setItem('sekelas_jadwal_mapel', JSON.stringify(data));
  };

  let piketDone = {};
  try {
    piketDone = JSON.parse(localStorage.getItem('sekelas_piket_status') || '{}');
  } catch (e) {
    piketDone = {};
  }

  const render = () => {
    const jadwalDb = getJadwalMapelDb();
    const listMapelHari = jadwalDb[selectedDay] || [];
    const listPiketHari = JADWAL_PIKET[selectedDay] || [];

    const totalDonePiket = listPiketHari.filter((nama) => !!piketDone[`${selectedDay}_${nama}`]).length;

    const badgeColorMap = {
      purple: 'bg-purple-50 text-[#8E54E9] border-purple-200',
      blue: 'bg-sky-50 text-[#0072ff] border-sky-200',
      coral: 'bg-rose-50 text-[#FF5E62] border-rose-200',
      amber: 'bg-amber-50 text-[#F7971E] border-amber-200',
    };

    containerEl.innerHTML = `
      <div class="space-y-7">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Jadwal Pelajaran & Piket</h1>
            <p class="text-slate-500 text-xs sm:text-sm mt-0.5">
              Rotasi mata pelajaran kurikulum merdeka dan regu piket kebersihan <span class="font-bold text-indigo-600">X.E-4</span>.
            </p>
          </div>

          <!-- Switcher Tab Pill Modern -->
          <div class="flex flex-wrap items-center gap-2.5">
            ${
              canManageMapel && activeTab === 'mapel'
                ? `
              <button id="btn-open-modal-jadwal" class="px-4 py-2 rounded-2xl bg-[#5443E8] hover:bg-[#4433D6] text-white text-xs font-black shadow-md shadow-indigo-600/30 transition">
                ➕ Tambah Mapel
              </button>
            `
                : ''
            }
            <div class="inline-flex bg-slate-200/70 p-1.5 rounded-2xl shadow-inner">
              <button id="tab-btn-mapel" class="px-5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                activeTab === 'mapel' ? 'bg-[#5443E8] text-white shadow-md shadow-indigo-600/30' : 'text-slate-600 hover:text-slate-900'
              }">
                📚 Pelajaran
              </button>
              <button id="tab-btn-piket" class="px-5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                activeTab === 'piket' ? 'bg-[#5443E8] text-white shadow-md shadow-indigo-600/30' : 'text-slate-600 hover:text-slate-900'
              }">
                🧹 Regu Piket
              </button>
            </div>
          </div>
        </div>

        <!-- 4 KARTU METRIK FULL COLOR GLOWING -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#8E54E9] to-[#6C5CE7] shadow-glow-purple relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Total Mapel</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">📖</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">18 Mapel</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Semester Ganjil 2026/2027</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#0072ff] to-[#00c6ff] shadow-glow-blue relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Hari Dipilih</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">📅</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${selectedDay}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">${listMapelHari.length} Sesi Pertemuan</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#FF5E62] to-[#FF9966] shadow-glow-coral relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Intensif UTBK</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">🎯</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">2 Sesi</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Kamis & Sabtu Siang</div>
          </div>

          <div class="rounded-3xl p-6 text-white bg-gradient-to-br from-[#F7971E] to-[#FFD200] shadow-glow-amber relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">Progres Piket</span>
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">🧹</div>
            </div>
            <div class="text-3xl lg:text-4xl font-black tracking-tight">${totalDonePiket} / ${listPiketHari.length}</div>
            <div class="text-[11px] font-semibold text-white/80 mt-1">Petugas hari ${selectedDay}</div>
          </div>
        </div>

        <!-- SELECTOR HARI (Senin s.d. Sabtu Pill) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          ${hariList
            .map(
              (h) => `
            <button class="btn-day-select flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              selectedDay === h
                ? 'bg-[#5443E8] text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70 shadow-xs'
            }" data-day="${h}">
              ${h} ${h === todayName ? '<span class="ml-1 text-[10px] opacity-80 font-bold">(Hari ini)</span>' : ''}
            </button>
          `
            )
            .join('')}
        </div>

        <!-- MAIN CONTENT: TAB MAPEL / TAB PIKET -->
        ${
          activeTab === 'mapel'
            ? `
          <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-base font-extrabold text-slate-900">Jadwal Belajar — Hari ${selectedDay}</h3>
                <p class="text-xs text-slate-400 mt-0.5">Sesi KBM aktif kelas X.E-4</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">${listMapelHari.length} Jam Pelajaran</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${listMapelHari
                .map(
                  (item) => `
                <div class="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all flex flex-col justify-between group">
                  <div>
                    <div class="flex items-center justify-between mb-3">
                      <span class="px-3 py-1 rounded-xl text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                        ⏰ ${item.jam}
                      </span>
                      <div class="flex items-center gap-1.5">
                        <span class="px-3 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          badgeColorMap[item.color] || badgeColorMap.purple
                        }">
                          ${item.tag}
                        </span>
                        ${
                          canManageMapel
                            ? `<button class="btn-delete-mapel text-rose-400 hover:text-rose-600 text-xs font-bold px-1.5" data-id="${item.id}" title="Hapus Sesi">✕</button>`
                            : ''
                        }
                      </div>
                    </div>
                    <h4 class="text-sm font-black text-slate-900 group-hover:text-[#5443E8] transition-colors mb-1">
                      ${item.mapel}
                    </h4>
                    <p class="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>👨‍🏫</span> ${item.guru}
                    </p>
                  </div>

                  <div class="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                    <span class="flex items-center gap-1">
                      <span>📍</span> ${item.ruang}
                    </span>
                    <span class="text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Aktif</span>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : `
          <!-- List Jadwal Piket Kebersihan (Terintegrasi Workflow 4.1) -->
          <div class="bg-white rounded-3xl p-6 lg:p-7 shadow-card-modern border border-slate-100">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 class="text-base font-extrabold text-slate-900">Regu Piket Kebersihan — Hari ${selectedDay}</h3>
                <p class="text-xs text-slate-400 mt-0.5">
                  ${
                    canManagePiket
                      ? 'Verifikasi pelaksanaan piket atau laporkan siswa yang lalai ke buku poin kedisiplinan'
                      : 'Daftar petugas piket harian kelas X.E-4 (Mode Lihat)'
                  }
                </p>
              </div>
              <span class="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                Terlaksana: ${totalDonePiket} dari ${listPiketHari.length} Siswa
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${listPiketHari
                .map((nama) => {
                  const key = `${selectedDay}_${nama}`;
                  const isChecked = !!piketDone[key];
                  return `
                  <div class="p-4 rounded-2xl border ${
                    isChecked ? 'bg-emerald-50/60 border-emerald-200 shadow-xs' : 'bg-slate-50 border-slate-100'
                  } transition-all flex flex-col justify-between gap-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-2xl ${
                          isChecked ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-200 text-slate-600'
                        } flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                          ${isChecked ? '✓' : '🧹'}
                        </div>
                        <div class="min-w-0">
                          <div class="text-xs font-bold text-slate-900 truncate">${nama}</div>
                          <div class="text-[10px] font-semibold ${isChecked ? 'text-emerald-700' : 'text-slate-400'}">
                            ${isChecked ? 'Sudah Melaksanakan Piket' : 'Belum Terverifikasi'}
                          </div>
                        </div>
                      </div>

                      ${
                        canManagePiket
                          ? `
                        <label class="relative inline-flex items-center cursor-pointer shrink-0">
                          <input type="checkbox" class="sr-only peer piket-checkbox" data-key="${key}" ${isChecked ? 'checked' : ''}>
                          <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      `
                          : ''
                      }
                    </div>

                    ${
                      canManagePiket && !isChecked
                        ? `
                      <div class="pt-2 border-t border-slate-200/60 flex justify-end">
                        <button class="btn-lapor-lalai-piket text-[10px] font-extrabold text-[#FF5E62] hover:bg-rose-50 px-2.5 py-1 rounded-lg transition flex items-center gap-1" data-nama="${nama}">
                          <span>⚠️</span> Catat Lalai Piket (+10 Poin)
                        </button>
                      </div>
                    `
                        : ''
                    }
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>
        `
        }

        <!-- MODAL TAMBAH JADWAL MAPEL -->
        <div id="modal-jadwal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 lg:p-7 shadow-2xl border border-slate-100">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 class="text-base font-extrabold text-slate-900">Tambah Jadwal Pelajaran (${selectedDay})</h3>
              <button id="btn-close-modal-jadwal" class="text-slate-400 hover:text-slate-600 font-black text-sm">✕</button>
            </div>

            <form id="form-add-jadwal" class="mt-4 space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Jam Pelajaran *</label>
                <input id="jadwal-jam" type="text" required placeholder="Contoh: 14:00 - 15:30" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[#5443E8]" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran *</label>
                <input id="jadwal-mapel" type="text" required placeholder="Contoh: Praktikum Jaringan ICT" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-[#5443E8]" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Guru Pengampu *</label>
                <input id="jadwal-guru" type="text" required placeholder="Contoh: Ms. Wilda Ulfiyanti, S.Kom" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#5443E8]" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Ruang Kelas *</label>
                  <input id="jadwal-ruang" type="text" value="R. XE-4" required class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#5443E8]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Kategori / Tag</label>
                  <select id="jadwal-tag" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold outline-none">
                    <option value="ICT|amber">ICT</option>
                    <option value="Sains|blue">Sains</option>
                    <option value="Bahasa|purple">Bahasa</option>
                    <option value="UTBK|coral">UTBK</option>
                  </select>
                </div>
              </div>
              <div class="pt-2 flex gap-2">
                <button type="button" id="btn-cancel-modal-jadwal" class="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold">Batal</button>
                <button type="submit" class="flex-1 py-2.5 rounded-2xl bg-[#5443E8] text-white text-xs font-extrabold shadow-md">Simpan Jadwal</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    // Handler Tab Switch
    document.getElementById('tab-btn-mapel')?.addEventListener('click', () => {
      activeTab = 'mapel';
      render();
    });
    document.getElementById('tab-btn-piket')?.addEventListener('click', () => {
      activeTab = 'piket';
      render();
    });

    // Handler Pilih Hari
    containerEl.querySelectorAll('.btn-day-select').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedDay = btn.getAttribute('data-day');
        render();
      });
    });

    // Handler Checklist Piket
    containerEl.querySelectorAll('.piket-checkbox').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const key = e.target.getAttribute('data-key');
        if (e.target.checked) {
          piketDone[key] = true;
          storeRef.success('Status pelaksanaan piket berhasil diverifikasi.');
        } else {
          delete piketDone[key];
        }
        localStorage.setItem('sekelas_piket_status', JSON.stringify(piketDone));
        render();
      });
    });

    // Handler Lapor Lalai Piket -> Otomatis masuk ke PoinView (Workflow 4.1)
    containerEl.querySelectorAll('.btn-lapor-lalai-piket').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nama = btn.getAttribute('data-nama');
        const cases = getPoinDb();
        const todayStr = new Date().toISOString().slice(0, 10);

        cases.unshift({
          id: Date.now(),
          tanggal: todayStr,
          siswa: nama,
          kategori: 'pelanggaran',
          jenis: `Tidak melaksanakan piket kebersihan hari ${selectedDay}`,
          poin: 10,
          pelapor: user.fullName || user.username || 'Pengurus Piket',
          status: 'ditindaklanjuti',
          tindakan: 'Piket pengganti & pembinaan wali kelas',
        });
        savePoinDb(cases);
        storeRef.warning(`Pelanggaran piket untuk ${nama} (+10 poin) telah dicatat ke Buku Kedisiplinan.`);
      });
    });

    // Handler Tambah & Hapus Jadwal Mapel
    const modalJadwal = document.getElementById('modal-jadwal');
    document.getElementById('btn-open-modal-jadwal')?.addEventListener('click', () => {
      modalJadwal?.classList.remove('hidden');
    });
    ['btn-close-modal-jadwal', 'btn-cancel-modal-jadwal'].forEach((id) => {
      document.getElementById(id)?.addEventListener('click', () => modalJadwal?.classList.add('hidden'));
    });

    const formJadwal = document.getElementById('form-add-jadwal');
    if (formJadwal) {
      formJadwal.addEventListener('submit', (e) => {
        e.preventDefault();
        const jam = document.getElementById('jadwal-jam').value.trim();
        const mapel = document.getElementById('jadwal-mapel').value.trim();
        const guru = document.getElementById('jadwal-guru').value.trim();
        const ruang = document.getElementById('jadwal-ruang').value.trim();
        const [tag, color] = document.getElementById('jadwal-tag').value.split('|');

        const db = getJadwalMapelDb();
        if (!db[selectedDay]) db[selectedDay] = [];
        db[selectedDay].push({
          id: Date.now(),
          jam,
          mapel,
          guru,
          ruang,
          tag,
          color,
        });
        saveJadwalMapelDb(db);
        storeRef.success(`Mata pelajaran "${mapel}" berhasil ditambahkan ke hari ${selectedDay}.`);
        modalJadwal?.classList.add('hidden');
        render();
      });
    }

    containerEl.querySelectorAll('.btn-delete-mapel').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const db = getJadwalMapelDb();
        db[selectedDay] = (db[selectedDay] || []).filter((item) => item.id !== id);
        saveJadwalMapelDb(db);
        storeRef.info('Sesi pelajaran telah dihapus dari jadwal.');
        render();
      });
    });
  };

  render();

  return {
    unmount: () => {},
  };
}
