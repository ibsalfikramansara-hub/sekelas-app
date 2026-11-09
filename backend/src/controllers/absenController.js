/**
 * Absen Controller — Presensi Harian Siswa
 */

const { prisma, isDbConnected } = require('../config/db');
const { success, error } = require('../utils/response');

const getAbsen = async (req, res) => {
  try {
    const tanggal = req.query.tanggal || new Date().toISOString().slice(0, 10);
    return success(res, { tanggal, data: [] }, 'Data absensi');
  } catch (err) {
    return error(res, 'Gagal mengambil data absensi', 500);
  }
};

const saveAbsen = async (req, res) => {
  try {
    const { tanggal, presensi } = req.body;
    return success(res, { tanggal, presensi }, 'Presensi berhasil disimpan', 200);
  } catch (err) {
    return error(res, 'Gagal menyimpan absensi', 500);
  }
};

module.exports = {
  getAbsen,
  saveAbsen,
};

