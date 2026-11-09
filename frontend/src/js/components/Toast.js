/**
 * Toast Component — digerakkan oleh store.toasts.
 * Dipanggil saat inisialisasi aplikasi untuk render notifikasi yang muncul.
 */

import { store } from '../store.js';

export function initToast() {
  store._renderToasts();
}