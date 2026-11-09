/**
 * Jadwal Controller — Jadwal Pelajaran & Rotasi Piket
 */

const { prisma, isDbConnected } = require('../config/db');
const { success, error } = require('../utils/response');

const getJadwalPelajaran = async (req, res) => {
  try {
    const hari = req.query.hari;
    if (isDbConnected()) {
      const where = hari ? { hari } : {};
      const jadwal = await prisma.jadwalPelajaran.findMany({
        where,
        include: { guru: { select: { fullName: true } } },
        orderBy: { jamKe: 'asc' },
      });
      return success(res, jadwal, 'Data jadwal pelajaran');
    }
    // Fallback info
    return success(res, [], 'Data jadwal pelajaran (Lokal/Demo)');
  } catch (err) {
    return error(res, 'Gagal mengambil jadwal pelajaran', 500);
  }
};

const getJadwalPiket = async (req, res) => {
  try {
    if (isDbConnected()) {
      const piket = await prisma.jadwalPiket.findMany({
        include: { siswa: { select: { fullName: true, nis: true } } },
        orderBy: { tanggal: 'desc' },
      });
      return success(res, piket, 'Data jadwal piket');
    }
    return success(res, [], 'Data jadwal piket (Lokal/Demo)');
  } catch (err) {
    return error(res, 'Gagal mengambil jadwal piket', 500);
  }
};

module.exports = {
  getJadwalPelajaran,
  getJadwalPiket,
};

