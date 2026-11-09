/**
 * Controller Dashboard
 * Menghasilkan statistik ringkasan berdasarkan role pengguna yang login.
 * Menerapkan RBAC: siswa hanya melihat data miliknya, wali/guru melihat kelasnya, admin melihat semua.
 */

const { prisma } = require('../config/db');
const { success, error, forbidden } = require('../utils/response');

const getStats = async (req, res) => {
  try {
    const { user } = req;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const whereKelas = user.role === 'admin' ? {} : { kelasId: user.kelasId };
    const whereSiswaKelas = user.role === 'admin' ? {} : { kelasId: user.kelasId };

    let stats = {};

    if (user.role === 'admin') {
      stats = {
        totalSiswa: await prisma.user.count({ where: { role: 'siswa', isActive: true } }),
        totalGuru: await prisma.user.count({ where: { role: 'guru_mapel', isActive: true } }),
        totalKelas: await prisma.kelas.count(),
        totalTugas: await prisma.tugas.count(),
        pengumpulanHariIni: await prisma.pengumpulanTugas.count({
          where: { submittedAt: { gte: today } },
        }),
        pelanggaranHariIni: await prisma.pelanggaran.count({ where: { tanggal: today } }),
        saldoKas: await prisma.transaksiKeuangan.aggregate({
          where: { tipe: 'kas_masuk' },
          _sum: { jumlah: true },
        }),
      };
    } else if (user.role === 'siswa') {
      const pengumpulanSaya = await prisma.pengumpulanTugas.findMany({
        where: { siswaId: user.id },
        include: { tugas: { select: { judul: true, deadline: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      const pelanggaranSaya = await prisma.pelanggaran.findMany({
        where: { siswaId: user.id },
        orderBy: { tanggal: 'desc' },
        take: 5,
      });

      const totalPoinMinus = await prisma.pelanggaran.aggregate({
        where: { siswaId: user.id },
        _sum: { poinMinus: true },
      });

      const setoranSaya = await prisma.transaksiKeuangan.aggregate({
        where: { siswaId: user.id, tipe: 'tabungan_masuk' },
        _sum: { jumlah: true },
      });

      stats = {
        roleLogin: 'siswa',
        jabatan: user.jabatanPengurus,
        totalTugasDibuat: 0,
        tugasSaya: pengumpulanSaya.map((p) => ({
          id: p.id,
          judul: p.tugas.judul,
          deadline: p.tugas.deadline,
          status: p.status,
          nilai: p.nilai,
        })),
        pelanggaranTerbaru: pelanggaranSaya.map((p) => ({
          jenis: p.jenisPelanggaran,
          poinMinus: p.poinMinus,
          tanggal: p.tanggal,
          status: p.status,
        })),
        totalPoinMinus: totalPoinMinus._sum.poinMinus || 0,
        totalTabungan: setoranSaya._sum.jumlah || 0,
      };
    } else if (user.role === 'wali_kelas') {
      const siswaKelas = await prisma.user.count({
        where: { role: 'siswa', kelasId: user.kelasId, isActive: true },
      });

      stats = {
        roleLogin: 'wali_kelas',
        totalSiswaKelas: siswaKelas,
        pelanggaranKelasHariIni: await prisma.pelanggaran.count({
          where: { ...whereKelas, tanggal: today },
        }),
        pengumpulanKelasHariIni: await prisma.pengumpulanTugas.count({
          where: { tugas: { kelasId: user.kelasId }, submittedAt: { gte: today } },
        }),
        saldoKasKelas: await prisma.transaksiKeuangan.aggregate({
          where: { ...whereKelas, tipe: 'kas_masuk', statusApproval: 'approved' },
          _sum: { jumlah: true },
        }),
      };
    } else if (user.role === 'guru_mapel') {
      const tugasSaya = await prisma.tugas.count({ where: { guruId: user.id } });
      const pengumpulanSaya = await prisma.pengumpulanTugas.count({
        where: { tugas: { guruId: user.id } },
      });
      const dinilai = await prisma.pengumpulanTugas.count({
        where: { tugas: { guruId: user.id }, status: 'dinilai' },
      });

      stats = {
        roleLogin: 'guru_mapel',
        totalTugasSaya: tugasSaya,
        totalPengumpulan: pengumpulanSaya,
        sudahDinilai: dinilai,
        belumDinilai: pengumpulanSaya - dinilai,
      };
    } else if (user.role === 'orang_tua') {
      const anak = await prisma.user.findFirst({
        where: { id: user.parentOfId },
        select: { id: true, fullName: true, nis: true, kelas: { select: { namaKelas: true } } },
      });

      const pelanggaranAnak = user.parentOfId
        ? await prisma.pelanggaran.findMany({
            where: { siswaId: user.parentOfId },
            orderBy: { tanggal: 'desc' },
            take: 5,
          })
        : [];

      const tabunganAnak = user.parentOfId
        ? await prisma.transaksiKeuangan.aggregate({
            where: { siswaId: user.parentOfId, tipe: 'tabungan_masuk' },
            _sum: { jumlah: true },
          })
        : { _sum: { jumlah: null } };

      stats = {
        roleLogin: 'orang_tua',
        anak,
        pelanggaranAnak: pelanggaranAnak.map((p) => ({
          jenis: p.jenisPelanggaran,
          poinMinus: p.poinMinus,
          tanggal: p.tanggal,
          status: p.status,
        })),
        totalTabunganAnak: tabunganAnak._sum.jumlah || 0,
      };
    }

    return success(res, stats, 'Statistik dashboard berhasil diambil');
  } catch (err) {
    console.error('[DashboardController.getStats]', err);
    return error(res, 'Gagal mengambil statistik dashboard', 500);
  }
};

module.exports = { getStats };