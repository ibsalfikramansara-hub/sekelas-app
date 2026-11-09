/**
 * Tugas Controller — Manajemen & Pengumpulan Tugas Siswa
 */

const { prisma, isDbConnected } = require('../config/db');
const { success, error } = require('../utils/response');

const getTugas = async (req, res) => {
  try {
    if (isDbConnected()) {
      const list = await prisma.tugas.findMany({
        include: {
          guru: { select: { fullName: true } },
          pengumpulan: { where: { siswaId: req.user.id } },
        },
        orderBy: { deadline: 'asc' },
      });
      return success(res, list, 'Daftar tugas');
    }
    return success(res, [], 'Daftar tugas (Demo)');
  } catch (err) {
    return error(res, 'Gagal mengambil data tugas', 500);
  }
};

const createTugas = async (req, res) => {
  try {
    const { mataPelajaran, judul, deskripsi, deadline, poinMaksimal } = req.body;
    if (isDbConnected()) {
      const tugasBaru = await prisma.tugas.create({
        data: {
          guruId: req.user.id,
          kelasId: req.user.kelasId || 1,
          mataPelajaran,
          judul,
          deskripsi,
          deadline: new Date(deadline),
          poinMaksimal: Number(poinMaksimal) || 100,
        },
      });
      return success(res, tugasBaru, 'Tugas berhasil diterbitkan', 201);
    }
    return success(res, { id: Date.now(), judul, mataPelajaran }, 'Tugas diterbitkan (Demo)', 201);
  } catch (err) {
    return error(res, 'Gagal membuat tugas baru', 500);
  }
};

const submitTugas = async (req, res) => {
  try {
    const tugasId = Number(req.params.id);
    const { catatanSiswa, filePath } = req.body;
    if (isDbConnected()) {
      const submit = await prisma.pengumpulanTugas.upsert({
        where: { tugasId_siswaId: { tugasId, siswaId: req.user.id } },
        update: {
          catatanSiswa,
          filePath,
          status: 'terkumpul',
          submittedAt: new Date(),
        },
        create: {
          tugasId,
          siswaId: req.user.id,
          catatanSiswa,
          filePath,
          status: 'terkumpul',
          submittedAt: new Date(),
        },
      });
      return success(res, submit, 'Tugas berhasil dikumpulkan');
    }
    return success(res, { tugasId, status: 'terkumpul' }, 'Tugas dikumpulkan (Demo)');
  } catch (err) {
    return error(res, 'Gagal mengumpulkan tugas', 500);
  }
};

module.exports = {
  getTugas,
  createTugas,
  submitTugas,
};

