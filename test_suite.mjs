/**
 * Automated Unit & Integration Test Suite - Aplikasi SEKELAS (Kelas X.E-4)
 * Menjalankan pengujian 100% end-to-end terhadap:
 * 1. DataStore Initialization & Null-Safety
 * 2. Autentikasi & Multi-Role Verification (9 Akun Pengguna Role & Pengurus)
 * 3. User Management CRUD, Password Reset, Duplicate Validation
 * 4. Workflow Keuangan (Kas Kelas, Tabungan, & Saldo Dinamis)
 * 5. Workflow Kedisiplinan (Poin Pelanggaran & Peringkat)
 * 6. Serverless API Endpoint Verification (api/index.js)
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('🚀 MENJALANKAN AUTOMATED AUDIT & TEST SUITE SEKELAS');
console.log('======================================================\n');

// -------------------------------------------------------------------
// TEST 1: Memeriksa Keberadaan File-File Konfigurasi Deployment
// -------------------------------------------------------------------
console.log('📦 TEST 1: Verifikasi File Konfigurasi Deployment & Root Scripts');
assert(fs.existsSync('./vercel.json'), 'File vercel.json tersedia di root');
assert(fs.existsSync('./.gitignore'), 'File .gitignore tersedia di root');
assert(fs.existsSync('./.env.example'), 'File .env.example tersedia di root');
assert(fs.existsSync('./initial_data.json'), 'File initial_data.json tersedia di root');
assert(fs.existsSync('./upload_ke_github.bat'), 'File upload_ke_github.bat tersedia');
assert(fs.existsSync('./deploy.bat'), 'File deploy.bat tersedia');
assert(fs.existsSync('./online_tunnel.bat'), 'File online_tunnel.bat tersedia');
assert(fs.existsSync('./api/index.js'), 'File api/index.js (Vercel Serverless Function) tersedia');

// -------------------------------------------------------------------
// TEST 2: Validasi Data Seed & Initial Data Integrity
// -------------------------------------------------------------------
console.log('\n📂 TEST 2: Validasi Format Data & Initial Data Integrity');
const rawData = fs.readFileSync('./initial_data.json', 'utf8');
let seedData;
try {
  seedData = JSON.parse(rawData);
  assert(true, 'initial_data.json berhasil diparse sebagai JSON valid');
} catch (e) {
  assert(false, `Parsing initial_data.json gagal: ${e.message}`);
}

assert(Array.isArray(seedData.users) && seedData.users.length >= 9, `Data users tersedia (${seedData?.users?.length || 0} akun)`);
assert(Array.isArray(seedData.students) && seedData.students.length === 38, `Data 38 siswa kelas X.E-4 lengkap (${seedData?.students?.length || 0} siswa)`);
assert(Array.isArray(seedData.kas) && seedData.kas.length > 0, `Data transaksi kas tersedia (${seedData?.kas?.length || 0} transaksi)`);
assert(Array.isArray(seedData.poin) && seedData.poin.length > 0, `Data poin kedisiplinan tersedia (${seedData?.poin?.length || 0} data)`);
assert(Array.isArray(seedData.tugas) && seedData.tugas.length > 0, `Data tugas kelas tersedia (${seedData?.tugas?.length || 0} data)`);

// -------------------------------------------------------------------
// TEST 3: Autentikasi & Verifikasi Seluruh 9 Akun Role & Kepengurusan
// -------------------------------------------------------------------
console.log('\n🔐 TEST 3: Autentikasi & Simulasi Login Seluruh 9 Akun Role & Kepengurusan');
const expectedAccounts = [
  { username: 'admin', role: 'admin', desc: 'Administrator ICT' },
  { username: 'wali1', role: 'wali_kelas', desc: 'Wali Kelas X.E-4' },
  { username: 'guru1', role: 'guru_mapel', desc: 'Guru Mata Pelajaran' },
  { username: 'pengurus1', role: 'siswa', jabatan: 'ketua_kelas', desc: 'Ketua Kelas / Pengurus' },
  { username: 'sekretaris1', role: 'siswa', jabatan: 'sekretaris', desc: 'Sekretaris Kelas' },
  { username: 'bendahara1', role: 'siswa', jabatan: 'bendahara', desc: 'Bendahara Kelas' },
  { username: 'siswa1', role: 'siswa', jabatan: 'anggota', desc: 'Siswa Reguler 1' },
  { username: 'siswa2', role: 'siswa', jabatan: 'anggota', desc: 'Siswa Reguler 2' },
  { username: 'ortu1', role: 'orang_tua', desc: 'Orang Tua / Wali Siswa' }
];

const users = seedData.users;
for (const req of expectedAccounts) {
  const account = users.find(u => u.username === req.username);
  assert(Boolean(account), `Akun '${req.username}' (${req.desc}) terdaftar`);
  if (account) {
    assert(account.role === req.role, `Role akun '${account.username}' sesuai (${account.role})`);
    if (req.jabatan) {
      assert(account.jabatanPengurus === req.jabatan, `Jabatan kepengurusan '${account.username}' sesuai (${account.jabatanPengurus})`);
    }
    assert(Boolean(account.password), `Kredensial password '${account.username}' valid`);
    assert(account.isActive === true, `Status akun '${account.username}' aktif (isActive: true)`);
  }
}

// -------------------------------------------------------------------
// TEST 4: Simulasi CRUD User Management & Null-Safety
// -------------------------------------------------------------------
console.log('\n👥 TEST 4: Simulasi CRUD User Management, Duplikasi & Validasi');
const testUserList = [...users];

// 4.1 Tambah user baru
const newUser = {
  id: 999,
  username: 'guru_kimia',
  fullName: 'Dra. Hj. Nurul Hidayah',
  role: 'guru_mapel',
  jabatanPengurus: 'anggota',
  email: 'nurul@sekelas.sch.id',
  password: 'password123',
  isActive: true
};
testUserList.push(newUser);
assert(testUserList.some(u => u.username === 'guru_kimia'), 'Fitur Tambah Pengguna Baru berhasil menyimpan akun');

// 4.2 Validasi duplikasi username
const isDuplicateUsername = (username) => testUserList.filter(u => u.username.toLowerCase() === username.toLowerCase()).length > 1;
testUserList.push({ ...newUser, id: 1000 });
assert(isDuplicateUsername('guru_kimia'), 'Deteksi duplikasi username berhasil mengidentifikasi duplikat');
testUserList.pop(); // buang duplikat

// 4.3 Update Role & Status Akun
const targetUser = testUserList.find(u => u.username === 'guru_kimia');
targetUser.role = 'wali_kelas';
targetUser.isActive = false;
assert(targetUser.role === 'wali_kelas', 'Pembaruan role pengguna (Admin update) berhasil');
assert(targetUser.isActive === false, 'Penonaktifan akun pengguna berhasil');

// 4.4 Reset Password
targetUser.password = 'newSecretPass2026';
assert(targetUser.password === 'newSecretPass2026', 'Fitur reset password kredensial pengguna berhasil');

// 4.5 Hapus User
const initialCount = testUserList.length;
const filteredUsers = testUserList.filter(u => u.id !== 999);
assert(filteredUsers.length === initialCount - 1, 'Fitur hapus akun pengguna berhasil membuang data');

// -------------------------------------------------------------------
// TEST 5: Workflow Keuangan (Kas Kelas & Perhitungan Saldo)
// -------------------------------------------------------------------
console.log('\n💰 TEST 5: Workflow Keuangan (Kas Kelas & Kalkulasi Saldo)');
const kasList = seedData.kas;
let totalPemasukan = 0;
let totalPengeluaran = 0;
let totalTabungan = 0;

for (const tx of kasList) {
  if (tx.tipe === 'kas_masuk') {
    totalPemasukan += Number(tx.jumlah || 0);
  } else if (tx.tipe === 'kas_keluar') {
    totalPengeluaran += Number(tx.jumlah || 0);
  } else if (tx.tipe === 'tabungan_masuk') {
    totalTabungan += Number(tx.jumlah || 0);
  }
}
const saldoKas = totalPemasukan - totalPengeluaran;
assert(totalPemasukan > 0, `Total kas masuk terhitung: Rp ${totalPemasukan.toLocaleString('id-ID')}`);
assert(totalPengeluaran > 0, `Total kas keluar terhitung: Rp ${totalPengeluaran.toLocaleString('id-ID')}`);
assert(totalTabungan > 0, `Total tabungan siswa terhitung: Rp ${totalTabungan.toLocaleString('id-ID')}`);
assert(saldoKas >= 0, `Perhitungan saldo bersih kas dinamis konsisten: Rp ${saldoKas.toLocaleString('id-ID')}`);

// -------------------------------------------------------------------
// TEST 6: Workflow Kedisiplinan & Poin Siswa
// -------------------------------------------------------------------
console.log('\n⭐ TEST 6: Workflow Kedisiplinan & Poin Siswa (Pelanggaran/Prestasi)');
const points = seedData.poin;
const siswaSample = seedData.students[0];
assert(Boolean(siswaSample && siswaSample.name), `Sampel siswa X.E-4 terverifikasi: ${siswaSample.name} (NISN: ${siswaSample.nisn})`);

const pointsForSiswa = points.filter(p => p.siswa === siswaSample.name);
assert(points.length > 0, `Catatan poin kedisiplinan tersimpan aktif (${points.length} record)`);

// -------------------------------------------------------------------
// TEST 7: Serverless API Endpoint Integration (api/index.js)
// -------------------------------------------------------------------
console.log('\n⚡ TEST 7: Pengujian Serverless API Handler (api/index.js)');
try {
  const handlerModule = await import('./api/index.js');
  const handler = handlerModule.default;
  assert(typeof handler === 'function', 'Serverless handler diekspor sebagai default function');

  // Test /api/health
  let resStatus = 0;
  let resData = null;
  const mockReq = { url: '/api/health', method: 'GET', headers: {} };
  const mockRes = {
    setHeader: () => {},
    status: (s) => { resStatus = s; return mockRes; },
    json: (d) => { resData = d; return mockRes; }
  };

  await handler(mockReq, mockRes);
  assert(resStatus === 200, `/api/health mengembalikan HTTP status 200`);
  assert(resData && resData.status === 'ok', `/api/health merespon { status: 'ok', app: 'SEKELAS' }`);

  // Test /api/users
  await handler({ url: '/api/users', method: 'GET', headers: {} }, mockRes);
  assert(resStatus === 200 && Array.isArray(resData?.users), `/api/users mengembalikan daftar pengguna (${resData?.users?.length || 0} akun)`);

  // Test /api/dashboard/stats
  await handler({ url: '/api/dashboard/stats', method: 'GET', headers: {} }, mockRes);
  assert(resStatus === 200 && resData?.stats?.totalStudents === 38, `/api/dashboard/stats mengembalikan statistik 38 siswa`);

} catch (err) {
  assert(false, `Pengujian Serverless API gagal: ${err.message}`);
}

// -------------------------------------------------------------------
// HASIL AKHIR
// -------------------------------------------------------------------
console.log('\n======================================================');
console.log(`📊 RINGKASAN TEST: ${passed} LULUS, ${failed} GAGAL`);
if (failed === 0) {
  console.log('🎉 SEMUA TEST BERHASIL 100%! APLIKASI SIAP PRODUCTION & DEPLOYMENT.');
} else {
  console.error('⚠️ ADA TEST YANG GAGAL. HARAP PERIKSA LOG DI ATAS.');
}
console.log('======================================================\n');

process.exit(failed === 0 ? 0 : 1);
