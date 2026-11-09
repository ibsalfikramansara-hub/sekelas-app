/**
 * SEKELAS Portable Server — Zero-Dependency One-Click Runner
 * Menjalankan aplikasi langsung dengan Node.js bawaan tanpa perlu 'npm install'.
 * Melayani Frontend SPA dan menyediakan REST API terintegrasi untuk Auth, Users, & Dashboard.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

let serverUsersDb = [
  { id: 1, username: 'admin', password: '123456', fullName: 'Administrator ICT', email: 'admin@sekelas.sch.id', role: 'admin', jabatanPengurus: 'anggota', nip: 'ADM-001', isActive: true },
  { id: 2, username: 'wali1', password: '123456', fullName: 'Mr. Ahmad Yuwafi', email: 'yuwafi@sekelas.sch.id', role: 'wali_kelas', jabatanPengurus: 'anggota', nip: 'G-002', isActive: true },
  { id: 3, username: 'guru1', password: '123456', fullName: 'Ms. Wilda Ulfiyanti, S.Kom', email: 'wilda@sekelas.sch.id', role: 'guru_mapel', jabatanPengurus: 'anggota', nip: 'G-001', isActive: true },
  { id: 4, username: 'pengurus1', password: '123456', fullName: 'KEISHA NISWATUN SUPRIYANTO', email: 'keisha@sekelas.sch.id', role: 'siswa', jabatanPengurus: 'ketua_kelas', nis: '112591827', isActive: true },
  { id: 5, username: 'sekretaris1', password: '123456', fullName: 'NABILA TSABITA PUTRI MUSTOFA', email: 'nabila@sekelas.sch.id', role: 'siswa', jabatanPengurus: 'sekretaris', nis: '111982065', isActive: true },
  { id: 6, username: 'bendahara1', password: '123456', fullName: 'HANNA AULIA', email: 'hanna@sekelas.sch.id', role: 'siswa', jabatanPengurus: 'bendahara', nis: '109410011', isActive: true },
  { id: 7, username: 'siswa1', password: '123456', fullName: 'AHMAD AJRIEL IRFAN', email: 'ajriel@sekelas.sch.id', role: 'siswa', jabatanPengurus: 'anggota', nis: '3113134417', isActive: true },
  { id: 8, username: 'siswa2', password: '123456', fullName: 'BRIAN ARVIN YUDA ALBAIHAQI', email: 'brian@sekelas.sch.id', role: 'siswa', jabatanPengurus: 'anggota', nis: '117855860', isActive: true },
  { id: 9, username: 'ortu1', password: '123456', fullName: 'Bpk. Irfan (Wali Ahmad Ajriel)', email: 'irfan.ortu@gmail.com', role: 'orang_tua', jabatanPengurus: 'anggota', nis: '3113134417', parentOfName: 'AHMAD AJRIEL IRFAN', isActive: true },
];

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Endpoint REST API Terintegrasi
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // Sinkronisasi database user dari Manajemen User Admin
    if (pathname === '/api/users/sync' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (Array.isArray(parsed.users)) {
            serverUsersDb = parsed.users;
          }
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: serverUsersDb, message: 'Sinkronisasi akun berhasil' }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Payload tidak valid' }));
        }
      });
      return;
    }

    if (pathname === '/api/users' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: serverUsersDb }));
      return;
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { username, password, role } = JSON.parse(body || '{}');
          const cleanUser = String(username || '').trim().toLowerCase();

          const found = serverUsersDb.find(
            (u) =>
              u.username.toLowerCase() === cleanUser ||
              (u.email && u.email.toLowerCase() === cleanUser) ||
              (u.nis && u.nis === cleanUser) ||
              (u.nip && u.nip.toLowerCase() === cleanUser)
          );

          if (found) {
            if (found.isActive === false) {
              res.writeHead(403);
              res.end(JSON.stringify({ success: false, message: 'Akun sedang dinonaktifkan oleh Administrator.' }));
              return;
            }
            if (password && found.password && password !== found.password) {
              res.writeHead(401);
              res.end(JSON.stringify({ success: false, message: 'Password salah.' }));
              return;
            }
          }

          const token = 'token-sekelas-' + Date.now();
          const user = found || {
            id: cleanUser === 'admin' ? 1 : 99,
            username: username || 'admin',
            fullName: cleanUser === 'admin' ? 'Administrator ICT' : username,
            role: role || (cleanUser === 'admin' ? 'admin' : 'siswa'),
            jabatanPengurus: 'anggota',
            isActive: true
          };

          const responseData = {
            success: true,
            message: 'Login berhasil',
            data: {
              user,
              token,
              roleLogin: user.role,
              redirectTo: '#/dashboard'
            },
            user,
            token,
            redirectTo: '#/dashboard'
          };

          res.writeHead(200);
          res.end(JSON.stringify(responseData));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Invalid payload' }));
        }
      });
      return;
    }

    if (pathname === '/api/dashboard/stats') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: {
          totalSiswa: 38,
          totalSiswaKelas: 38,
          totalGuru: 12,
          totalKelas: 1,
          totalTugasSaya: 3,
          totalPengumpulan: 2,
          sudahDinilai: 1,
          belumDinilai: 1,
          totalPoinMinus: 25,
          totalTabungan: 125000,
          saldoKasKelas: { _sum: { jumlah: 10000 } }
        }
      }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: [], message: 'OK (Mock API)' }));
    return;
  }

  // Menyajikan Berkas Statis Frontend SPA
  let safeRelPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = path.join(FRONTEND_DIR, safeRelPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (!path.extname(safeRelPath)) {
      filePath = path.join(FRONTEND_DIR, 'index.html');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error: ' + err.message);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('====================================================');
  console.log('  SEKELAS — Aplikasi Kelas Digital X.E-4 Aktif!     ');
  console.log(`  Alamat Web : ${url}`);
  console.log('====================================================');

  if (process.env.NO_BROWSER !== '1') {
    const startCmd = process.platform === 'win32' ? `start "" "${url}"` : `xdg-open "${url}"`;
    exec(startCmd, () => {});
  }
});
