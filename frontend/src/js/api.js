/**
 * API Wrapper — fetch dengan automatic JWT injection & response handling.
 * Digunakan oleh semua view untuk berkomunikasi dengan backend Express.
 */

import { CONFIG } from './config.js';
import { store } from './store.js';

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

export const api = {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Inject JWT token jika ada
    if (store.token) {
      headers.Authorization = `Bearer ${store.token}`;
    }

    store.startLoading();
    try {
      const res = await fetch(url, { ...options, headers });

      // Jika token expired / unauthorized, arahkan ke login
      if (res.status === 401) {
        store.clearAuth();
        window.location.hash = '#login';
        throw new ApiError('Sesi Anda telah berakhir, silakan login kembali.', 401);
      }

      let data = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        throw new ApiError(
          data?.message || 'Terjadi kesalahan',
          res.status,
          data?.errors || null
        );
      }

      return data;
    } catch (err) {
      if (!(err instanceof ApiError)) {
        store.error('Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.');
        throw new ApiError('Network error', 0);
      }
      store.error(err.message);
      throw err;
    } finally {
      store.stopLoading();
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

export { ApiError };