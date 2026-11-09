/**
 * Bootstrap Aplikasi SPA — SEKELAS Class App
 * Inisialisasi data store terpusat, komponen global, router, dan state store.
 */

import { initDataStore } from './dataStore.js';
import { initRouter, navigate } from './router.js';
import { initToast } from './components/Toast.js';
import { initLoading } from './components/Loading.js';
import { store } from './store.js';

function startApp() {
  initDataStore();
  initToast();
  initLoading();
  initRouter();

  // Handle Logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      store.clearAuth();
      store.info('Anda telah keluar dari aplikasi.');
      navigate('#login');
    });
  }

  // Handle Mobile Menu Toggle
  const btnMobile = document.getElementById('btn-mobile-menu');
  const sidebar = document.getElementById('sidebar');
  if (btnMobile && sidebar) {
    btnMobile.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('hidden');
      sidebar.classList.toggle('fixed');
      sidebar.classList.toggle('inset-y-0');
      sidebar.classList.toggle('left-0');
    });

    // Tutup sidebar saat klik di luar pada layar kecil
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 1024 && !sidebar.contains(e.target) && !btnMobile.contains(e.target)) {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('fixed', 'inset-y-0', 'left-0');
      }
    });
  }
}

// Pastikan startApp dijalankan baik sebelum maupun sesudah DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

// Expose navigasi global untuk digunakan di inline HTML onclick
window.navigateApp = (path) => {
  navigate(path);
};
