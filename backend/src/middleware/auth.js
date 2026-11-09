/**
 * Middleware Autentikasi & Otorisasi (RBAC)
 *
 * - verifikasiToken: memvalidasi JWT dan melampirkan user ke req.user
 * - allowRoles: membatasi akses berdasarkan role (siswa, wali_kelas, guru_mapel, orang_tua, admin)
 * - allowJabatan: membatasi akses berdasarkan jabatan pengurus (ketua_kelas, sekretaris, bendahara, anggota)
 * - checkKelasAccess: memastikan user hanya mengakses data milik kelasnya (kecuali admin)
 */

const jwt = require('jsonwebtoken');
const { unauthorized, forbidden } = require('../utils/response');

const verifikasiToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Token autentikasi diperlukan');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      jabatanPengurus: decoded.jabatanPengurus,
      kelasId: decoded.kelasId,
      fullName: decoded.fullName,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Sesi login sudah kadaluarsa, silakan login kembali');
    }
    return unauthorized(res, 'Token tidak valid');
  }
};

/**
 * Izinkan akses hanya untuk role yang diterima.
 * Contoh: allowRoles(['wali_kelas', 'admin'])
 */
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return forbidden(res, 'Role Anda tidak diizinkan mengakses fitur ini');
  }
  next();
};

/**
 * Izinkan akses hanya untuk jabatan pengurus yang diterima.
 * Contoh: allowJabatan(['bendahara', 'ketua_kelas'])
 */
const allowJabatan = (...jabatans) => (req, res, next) => {
  if (!req.user || !jabatans.includes(req.user.jabatanPengurus)) {
    return forbidden(res, 'Jabatan Anda tidak diizinkan mengakses fitur ini');
  }
  next();
};

/**
 * Hanya izinkan mengakses data milik kelas user, kecuali admin.
 * Digunakan untuk endpoint yang memerlukan params kelas_id atau query kelas_id.
 */
const checkKelasAccess = (req, res, next) => {
  const { user } = req;
  const kelasIdDariParams = Number(req.params.kelasId || req.query.kelasId || req.body.kelasId);

  if (user.role === 'admin') {
    return next();
  }

  if (!user.kelasId || (kelasIdDariParams && kelasIdDariParams !== user.kelasId)) {
    return forbidden(res, 'Anda hanya dapat mengakses data milik kelas Anda sendiri');
  }
  next();
};

module.exports = {
  verifikasiToken,
  allowRoles,
  allowJabatan,
  checkKelasAccess,
};