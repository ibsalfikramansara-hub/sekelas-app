/**
 * Helper Respons API Standar
 * Memastikan semua endpoint mengembalikan format respons yang konsisten.
 */

const success = (res, data = null, message = 'Berhasil', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const error = (res, message = 'Terjadi kesalahan', status = 400, errors = null) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

const created = (res, data = null, message = 'Dibuat berhasil') =>
  success(res, data, message, 201);

const notFound = (res, message = 'Data tidak ditemukan') =>
  error(res, message, 404);

const unauthorized = (res, message = 'Akses tidak diizinkan') =>
  error(res, message, 401);

const forbidden = (res, message = 'Anda tidak memiliki akses ke fitur ini') =>
  error(res, message, 403);

const validationError = (res, errors) =>
  error(res, 'Validasi gagal', 422, errors);

module.exports = {
  success,
  error,
  created,
  notFound,
  unauthorized,
  forbidden,
  validationError,
};