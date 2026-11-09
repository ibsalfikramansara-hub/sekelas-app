/**
 * Poin Controller — Catatan Pelanggaran & Poin Sikap Siswa
 */

const { prisma, isDbConnected } = require('../config/db');
const { success, error } = require('../utils/response');

const getPelanggaran = async (req, res) => {
  try {
    if (isDbConnected()) {
      const data = await prisma.pelanggaran.findMany({
        include: {
          siswa: { select: { fullName: true, nis: true } },
          pelapor: { select: { fullName: true } },
        },
        orderBy: { tanggal: 'desc' },
      });
      return success(res, data, 'Riwayat catatan pelanggaran');
    }
    return success(res, [], 'Riwayat pelanggaran (Demo)');
  } catch (err) {
    return error(res, 'Gagal mengambil data pelanggaran', 500);
  }
};

const createPelanggaran = async (req, res) => {
  try {
    const { siswaId, jenisPelanggaran, poinMinus, catatanPembinaan } = req.body;
    if (isDbConnected()) {
      const baru = await prisma.pelanggaran.create({
        data: {
          siswaId: Number(siswaId),
          pelaporId: req.user.id,
          kelasId: req.user.kelasId || 1,
          jenisPelanggaran,
          poinMinus: Number(poinMinus) || 5,
          catatanPembinaan,
        },
      });
      return success(res, baru, 'Pelanggaran berhasil dicatat', 201);
    }
    return success(res, { id: Date.now(), jenisPelanggaran, poinMinus }, 'Pelanggaran dicatat (Demo)', 201);
  } catch (err) {
    return error(res, 'Gagal mencatat pelanggaran', 500);
  }
};

module.exports = {
  getPelanggaran,
  createPelanggaran,
};

