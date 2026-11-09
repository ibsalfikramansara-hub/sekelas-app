/**
 * Seed Database Awal — SEKELAS Class App
 * Membuat kelas X.E-4 dan akun-akun demo: Siswa, Pengurus, Wali Kelas, Guru Mapel, Admin.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Memulai seeding database...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Buat Kelas X.E-4
  const kelas = await prisma.kelas.upsert({
    where: { namaKelas: 'X.E-4' },
    update: {},
    create: { namaKelas: 'X.E-4' },
  });
  console.log('[Seed] Kelas dibuat:', kelas.namaKelas);

  // 2. Buat Wali Kelas
  const wali = await prisma.user.upsert({
    where: { username: 'wali1' },
    update: {},
    create: {
      username: 'wali1',
      passwordHash,
      fullName: 'Mr. Ahmad Yuwafi',
      nip: 'G-002',
      email: 'wali1@sekolah.sch.id',
      role: 'wali_kelas',
      jabatanPengurus: 'anggota',
      kelasId: kelas.id,
    },
  });

  await prisma.kelas.update({
    where: { id: kelas.id },
    data: { waliKelasId: wali.id },
  });

  // 3. Buat Guru Mapel
  await prisma.user.upsert({
    where: { username: 'guru1' },
    update: {},
    create: {
      username: 'guru1',
      passwordHash,
      fullName: 'Ms. Wilda Ulfiyanti, S.Kom',
      nip: 'G-001',
      email: 'guru1@sekolah.sch.id',
      role: 'guru_mapel',
      jabatanPengurus: 'anggota',
      kelasId: kelas.id,
    },
  });

  // 4. Buat Akun Siswa Pengurus & Siswa Biasa
  const siswaData = [
    { username: 'siswa1', fullName: 'Ahmad Ajriel Irfan', nis: '3113134417', jabatan: 'anggota' },
    { username: 'pengurus1', fullName: 'Keisha Niswatun Supriyanto', nis: '112591827', jabatan: 'ketua_kelas' },
    { username: 'sekretaris1', fullName: 'Nabila Tsabita Putri', nis: '111982065', jabatan: 'sekretaris' },
    { username: 'bendahara1', fullName: 'Hanna Aulia', nis: '109410011', jabatan: 'bendahara' },
  ];

  for (const s of siswaData) {
    await prisma.user.upsert({
      where: { username: s.username },
      update: {},
      create: {
        username: s.username,
        passwordHash,
        fullName: s.fullName,
        nis: s.nis,
        email: `${s.username}@sekolah.sch.id`,
        role: 'siswa',
        jabatanPengurus: s.jabatan,
        kelasId: kelas.id,
      },
    });
  }

  // 5. Buat Admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      fullName: 'Administrator ICT',
      nip: 'ADM-001',
      email: 'admin@sekolah.sch.id',
      role: 'admin',
      jabatanPengurus: 'anggota',
    },
  });

  console.log('[Seed] Berhasil mengisi data awal aplikasi SEKELAS.');
}

main()
  .catch((e) => {
    console.error('[Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

