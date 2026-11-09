/**
 * Controller Autentikasi
 * Login multi-role, generate JWT, dan deteksi role + jabatan pengurus.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const { success, error, notFound } = require('../utils/response');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      jabatanPengurus: user.jabatanPengurus,
      kelasId: user.kelasId,
      fullName: user.fullName,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d' }
  );
};

/**
 * POST /api/auth/login
 * Body: { username, password, role }
 * Role dikirim dari frontend untuk memastikan login sesuai dengan peran yang dipilih.
 */
const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return error(res, 'Username, password, dan role harus diisi', 422);
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { kelas: true },
    });

    if (!user || !user.isActive) {
      return notFound(res, 'Pengguna tidak ditemukan atau tidak aktif');
    }

    const cocok = await bcrypt.compare(password, user.passwordHash);
    if (!cocok) {
      return error(res, 'Password salah', 401);
    }

    // Validasi role yang dipilih harus cocok dengan role user di database
    // Admin dapat login sebagai role apa saja; siswa tidak boleh login sebagai guru, dan seterusnya.
    const roleDiizinkan =
      user.role === 'admin'
        ? ['admin', 'siswa', 'wali_kelas', 'guru_mapel', 'orang_tua']
        : [user.role];

    if (!roleDiizinkan.includes(role)) {
      return error(
        res,
        `Akun ini terdaftar sebagai ${user.role}, tidak dapat login sebagai ${role}`,
        403
      );
    }

    const token = generateToken(user);

    // Hapus password dari respons
    const { passwordHash, ...userWithoutPassword } = user;

    return success(
      res,
      {
        user: userWithoutPassword,
        token,
        roleLogin: role,
        redirectTo: getDashboardRoute(role, user.jabatanPengurus),
      },
      'Login berhasil'
    );
  } catch (err) {
    console.error('[AuthController.login]', err);
    return error(res, 'Terjadi kesalahan server saat login', 500);
  }
};

/**
 * GET /api/auth/me
 * Mengembalikan data user yang sedang login (dilampirkan oleh middleware verifikasiToken).
 */
const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        jabatanPengurus: true,
        nis: true,
        nip: true,
        avatarUrl: true,
        isActive: true,
        kelas: { select: { id: true, namaKelas: true } },
        createdAt: true,
      },
    });

    if (!user) {
      return notFound(res, 'Pengguna tidak ditemukan');
    }

    return success(res, user, 'Data profil pengguna');
  } catch (err) {
    console.error('[AuthController.me]', err);
    return error(res, 'Gagal mengambil data profil', 500);
  }
};

/**
 * POST /api/auth/logout
 * Stateless JWT: klien hanya menghapus token. Endpoint ini untuk audit/validasi.
 */
const logout = async (req, res) => {
  return success(res, null, 'Logout berhasil');
};

/**
 * Tentukan halaman dashboard tujuan berdasarkan role & jabatan.
 */
function getDashboardRoute(role, jabatan) {
  const routes = {
    admin: '/dashboard',
    wali_kelas: '/dashboard/wali-kelas',
    guru_mapel: '/dashboard/guru',
    orang_tua: '/dashboard/orang-tua',
    siswa: '/dashboard/siswa',
  };

  // Pengurus dengan jabatan khusus tetap di dashboard siswa, menu pengurus akan aktif otomatis
  if (role === 'siswa' && jabatan !== 'anggota') {
    return '/dashboard/siswa';
  }

  return routes[role] || '/dashboard';
}

module.exports = { login, me, logout };