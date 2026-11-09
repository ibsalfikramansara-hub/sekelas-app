/**
 * Konfigurasi Koneksi Database — Dual Mode (Lokal & Online)
 *
 * Menggunakan Prisma Client. Hanya perlu mengganti DATABASE_URL di file .env
 * untuk berpindah antara environment lokal (Docker/XAMPP/Laragon) dan online
 * (Supabase / Railway / VPS) tanpa mengubah kode aplikasi.
 *
 * Support: PostgreSQL (default) dan MySQL (ubah provider di schema.prisma).
 */

const { PrismaClient } = require('@prisma/client');

let isConnected = false;

// Buat instance Prisma Client dengan log pencetakan query di development
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

// Uji koneksi saat aplikasi dijalankan dan tangani kesalahan dengan aman
prisma
  .$connect()
  .then(() => {
    isConnected = true;
    console.log(
      `[Database] Terkoneksi ke database (${process.env.NODE_ENV || 'development'})`
    );
  })
  .catch((err) => {
    isConnected = false;
    console.warn(
      '[Database Warning] Tidak dapat terhubung ke database:',
      err.message
    );
    console.warn(
      '[Database Warning] Server tetap berjalan dalam mode Demo / Mock API.'
    );
  });

// Tangani penutupan koneksi secara benar saat proses berhenti
process.on('beforeExit', async () => {
  if (isConnected) {
    await prisma.$disconnect();
  }
});

module.exports = {
  prisma,
  isDbConnected: () => isConnected,
};
