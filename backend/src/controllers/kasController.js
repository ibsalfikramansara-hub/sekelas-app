/**
 * Kas Controller — Keuangan Kas & Tabungan Siswa
 */

const { prisma, isDbConnected } = require('../config/db');
const { success, error } = require('../utils/response');

const getTransaksi = async (req, res) => {
  try {
    const { tipe } = req.query;
    if (isDbConnected()) {
      const where = tipe ? { tipe } : {};
      const tx = await prisma.transaksiKeuangan.findMany({
        where,
        include: {
          siswa: { select: { fullName: true, nis: true } },
          bendahara: { select: { fullName: true } },
        },
        orderBy: { tanggal: 'desc' },
      });
      return success(res, tx, 'Riwayat transaksi keuangan');
    }
    return success(res, [], 'Riwayat transaksi keuangan (Demo)');
  } catch (err) {
    return error(res, 'Gagal mengambil data transaksi keuangan', 500);
  }
};

const createTransaksi = async (req, res) => {
  try {
    const { siswaId, tipe, jumlah, keterangan } = req.body;
    if (!tipe || !jumlah) {
      return error(res, 'Tipe transaksi dan jumlah harus diisi', 422);
    }
    if (isDbConnected()) {
      const baru = await prisma.transaksiKeuangan.create({
        data: {
          kelasId: req.user.kelasId || 1,
          siswaId: siswaId ? Number(siswaId) : null,
          bendaharaId: req.user.id,
          tipe,
          jumlah,
          keterangan,
        },
      });
      return success(res, baru, 'Transaksi berhasil dicatat', 201);
    }
    return success(res, { id: Date.now(), tipe, jumlah, keterangan }, 'Transaksi dicatat (Demo Mode)', 201);
  } catch (err) {
    return error(res, 'Gagal mencatat transaksi keuangan', 500);
  }
};

module.exports = {
  getTransaksi,
  createTransaksi,
};

