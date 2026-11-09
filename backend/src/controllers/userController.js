/**
 * User Controller — Data Siswa, Pengurus, dan Profil Pengguna
 */

const { prisma, isDbConnected } = require('../config/db');
const { success, error, notFound } = require('../utils/response');

// Data demo fallback jika database belum tersambung
const FALLBACK_USERS = [
  { id: 1, username: 'siswa1', fullName: 'Ahmad Ajriel Irfan', nis: '3113134417', role: 'siswa', jabatanPengurus: 'anggota', isActive: true },
  { id: 2, username: 'pengurus1', fullName: 'Keisha Niswatun', nis: '112591827', role: 'siswa', jabatanPengurus: 'ketua_kelas', isActive: true },
  { id: 3, username: 'sekretaris1', fullName: 'Nabila Tsabita', nis: '111982065', role: 'siswa', jabatanPengurus: 'sekretaris', isActive: true },
  { id: 4, username: 'bendahara1', fullName: 'Hanna Aulia', nis: '109410011', role: 'siswa', jabatanPengurus: 'bendahara', isActive: true },
  { id: 5, username: 'wali1', fullName: 'Mr. Ahmad Yuwafi', nip: 'G-002', role: 'wali_kelas', jabatanPengurus: 'anggota', isActive: true },
  { id: 6, username: 'guru1', fullName: 'Ms. Wilda Ulfiyanti', nip: 'G-001', role: 'guru_mapel', jabatanPengurus: 'anggota', isActive: true },
];

const getUsers = async (req, res) => {
  try {
    if (isDbConnected()) {
      const users = await prisma.user.findMany({
        select: { id: true, username: true, fullName: true, nis: true, nip: true, role: true, jabatanPengurus: true, email: true, isActive: true },
        orderBy: { id: 'asc' },
      });
      return success(res, users, 'Daftar pengguna');
    }
    return success(res, FALLBACK_USERS, 'Daftar pengguna (Demo Mode)');
  } catch (err) {
    console.error('[UserController.getUsers]', err);
    return error(res, 'Gagal mengambil data pengguna', 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isDbConnected()) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, username: true, fullName: true, nis: true, nip: true, role: true, jabatanPengurus: true, email: true, isActive: true },
      });
      if (!user) return notFound(res, 'Pengguna tidak ditemukan');
      return success(res, user, 'Detail pengguna');
    }
    const user = FALLBACK_USERS.find((u) => u.id === id);
    if (!user) return notFound(res, 'Pengguna tidak ditemukan');
    return success(res, user, 'Detail pengguna (Demo Mode)');
  } catch (err) {
    return error(res, 'Gagal mengambil detail pengguna', 500);
  }
};

module.exports = {
  getUsers,
  getUserById,
};

