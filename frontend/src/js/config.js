/**
 * Konfigurasi Frontend — Environment Switchable
 *
 * Untuk development lokal: gunakan http://localhost:5000/api
 * Untuk produksi/online: ganti dengan URL backend yang deployed (Railway / VPS / etc).
 * Pastikan CORS di backend mengizinkan origin frontend ini.
 */

export const CONFIG = {
  API_BASE_URL: (() => {
    if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
      return window.__API_BASE_URL__;
    }
    if (typeof window !== 'undefined' && (window.location.port === '3000' || !window.location.port)) {
      return '/api';
    }
    return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';
  })(),
  APP_NAME: 'SEKELAS',
  APP_VERSION: '1.0.0',
  ROLES: ['siswa', 'wali_kelas', 'guru_mapel', 'orang_tua', 'admin'],
  // Role yang ditampilkan di login (label untuk UI)
  ROLE_LABELS: {
    siswa: 'Siswa',
    wali_kelas: 'Wali Kelas',
    guru_mapel: 'Guru Mapel',
    orang_tua: 'Orang Tua',
    admin: 'Administrator',
  },
  // Role default berdasarkan pilihan di dropdown login
  LOGIN_ROLE_MAP: {
    'siswa': 'siswa',
    'wali_kelas': 'wali_kelas',
    'guru_mapel': 'guru_mapel',
    'orang_tua': 'orang_tua',
    'admin': 'admin',
  },
};