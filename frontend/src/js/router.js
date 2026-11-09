/**
 * Hash-based SPA Router dengan Role-Based Access Control (RBAC) Route Guard
 * Memetakan hash URL ke view yang sesuai, memeriksa otorisasi role, dan menjaga sesi pengguna.
 */

import { store } from './store.js';
import { getUsersDb } from './dataStore.js';
import { renderNavbar } from './components/Navbar.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderLoginView } from './views/LoginView.js';
import { renderDashboardView } from './views/DashboardView.js';
import { renderUserView } from './views/UserView.js';
import { renderMuridView } from './views/MuridView.js';
import { renderJadwalView } from './views/JadwalView.js';
import { renderAbsenView } from './views/AbsenView.js';
import { renderKasView } from './views/KasView.js';
import { renderPoinView } from './views/PoinView.js';
import { renderTugasView } from './views/TugasView.js';

const routeMap = {
  '#login': renderLoginView,
  '#': renderDashboardView,
  '#/dashboard': renderDashboardView,
  '#/dashboard/admin': renderDashboardView,
  '#/dashboard/siswa': renderDashboardView,
  '#/dashboard/wali-kelas': renderDashboardView,
  '#/dashboard/guru': renderDashboardView,
  '#/dashboard/guru-mapel': renderDashboardView,
  '#/dashboard/orang-tua': renderDashboardView,
  // Modul Manajemen Pengguna (Khusus Admin)
  '#/users': renderUserView,
  // Modul Data Siswa & Pengurus
  '#/murid': renderMuridView,
  '#/pengurus': renderMuridView,
  '#/kelas': renderMuridView,
  // Modul Jadwal & Piket
  '#/jadwal': renderJadwalView,
  // Modul Presensi
  '#/absen': renderAbsenView,
  // Modul Keuangan
  '#/kas': renderKasView,
  // Modul Kedisiplinan & Poin
  '#/poin': renderPoinView,
  // Modul Tugas
  '#/tugas': renderTugasView,
  '#/tugas/nilai': renderTugasView,
};

// Matriks Rute yang Diizinkan per Role
const ROLE_ALLOWED_ROUTES = {
  admin: [
    '#', '#/dashboard', '#/dashboard/admin', '#/dashboard/siswa', '#/dashboard/wali-kelas',
    '#/dashboard/guru', '#/dashboard/orang-tua', '#/users', '#/murid', '#/pengurus',
    '#/kelas', '#/jadwal', '#/absen', '#/kas', '#/poin', '#/tugas', '#/tugas/nilai'
  ],
  wali_kelas: [
    '#', '#/dashboard', '#/dashboard/wali-kelas', '#/murid', '#/pengurus', '#/kelas',
    '#/jadwal', '#/absen', '#/kas', '#/poin', '#/tugas', '#/tugas/nilai'
  ],
  guru_mapel: [
    '#', '#/dashboard', '#/dashboard/guru', '#/dashboard/guru-mapel',
    '#/jadwal', '#/murid', '#/tugas', '#/tugas/nilai'
  ],
  siswa: [
    '#', '#/dashboard', '#/dashboard/siswa', '#/murid', '#/pengurus', '#/kelas',
    '#/jadwal', '#/absen', '#/tugas', '#/poin', '#/kas'
  ],
  orang_tua: [
    '#', '#/dashboard', '#/dashboard/orang-tua', '#/murid', '#/jadwal',
    '#/absen', '#/tugas', '#/kas', '#/poin'
  ],
};

export function getDefaultDashboardForRole(role) {
  switch (role) {
    case 'admin': return '#/dashboard';
    case 'wali_kelas': return '#/dashboard/wali-kelas';
    case 'guru_mapel': return '#/dashboard/guru';
    case 'orang_tua': return '#/dashboard/orang-tua';
    default: return '#/dashboard/siswa';
  }
}

let currentView = null;
let sidebarRenderedKey = null;
let activeRenderFn = null;

export function navigate(path) {
  if (window.location.hash === path) {
    if (typeof activeRenderFn === 'function') {
      activeRenderFn();
    }
  } else {
    window.location.hash = path;
  }
}

export function getCurrentPath() {
  return window.location.hash || '#login';
}

export function initRouter() {
  const contentEl = document.getElementById('page-content');
  const appShell = document.getElementById('view-app');
  const loginView = document.getElementById('view-login');
  const sidebarNav = document.querySelector('#sidebar nav');

  const render = () => {
    let path = getCurrentPath();
    let isAuth = Boolean(store.isAuthenticated && store.user);

    // Sinkronkan status aktif & role terkini dari database user lokal
    if (isAuth && store.user) {
      const usersDb = getUsersDb();
      const freshUser = usersDb.find(
        (u) => u.username.toLowerCase() === String(store.user.username || '').toLowerCase()
      );
      if (freshUser) {
        if (freshUser.isActive === false) {
          store.clearAuth();
          store.error('Sesi dihentikan: Akun Anda telah dinonaktifkan oleh Administrator.');
          isAuth = false;
        } else {
          // Perbarui data role/jabatan jika baru saja diubah oleh Admin
          store.user.fullName = freshUser.fullName;
          store.user.role = freshUser.role;
          store.user.jabatanPengurus = freshUser.jabatanPengurus || 'anggota';
          store.user.parentOfName = freshUser.parentOfName || null;
        }
      }
    }

    // Jika belum login dan bukan di #login -> arahkan ke #login
    if (!isAuth && path !== '#login') {
      sidebarRenderedKey = null;
      if (window.location.hash !== '#login') {
        window.location.hash = '#login';
        return;
      }
      path = '#login';
    }

    // Jika sudah login tetapi masih di #login -> arahkan ke dashboard sesuai role
    if (isAuth && path === '#login') {
      const targetDash = getDefaultDashboardForRole(store.user.role);
      window.location.hash = targetDash;
      return;
    }

    // RBAC Route Guard: Periksa apakah role diizinkan mengakses path ini
    if (isAuth && path !== '#login') {
      const allowedList = ROLE_ALLOWED_ROUTES[store.user.role] || ROLE_ALLOWED_ROUTES.siswa;
      if (!allowedList.includes(path)) {
        store.warning(`Akses dibatasi: Role "${store.user.role}" tidak memiliki izin membuka halaman ${path}.`);
        const fallback = getDefaultDashboardForRole(store.user.role);
        window.location.hash = fallback;
        return;
      }
    }

    // Tampilkan / sembunyikan shell utama vs halaman login
    if (isAuth) {
      if (loginView) loginView.classList.add('hidden');
      if (appShell) appShell.classList.remove('hidden');

      // Update navbar info
      renderNavbar(store.user, path);

      // Render sidebar setiap kali user, role, atau jabatan pengurus berganti
      const userKey = `${store.user.username}_${store.user.role}_${store.user.jabatanPengurus}`;
      if (sidebarNav && sidebarRenderedKey !== userKey) {
        renderSidebar(sidebarNav, store.user, navigate);
        sidebarRenderedKey = userKey;
      }
    } else {
      if (loginView) loginView.classList.remove('hidden');
      if (appShell) appShell.classList.add('hidden');
    }

    // Unmount view sebelumnya jika ada
    if (currentView && typeof currentView.unmount === 'function') {
      try {
        currentView.unmount();
      } catch (e) {
        console.warn('Unmount error:', e);
      }
    }

    // Highlight menu aktif di sidebar
    const sidebarEl = document.getElementById('sidebar');
    if (sidebarEl) {
      sidebarEl.querySelectorAll('.sidebar-item').forEach((el) => {
        const itemPath = el.getAttribute('data-path');
        const isDashboardAlias =
          path.startsWith('#/dashboard') && itemPath && itemPath.startsWith('#/dashboard');
        if (itemPath === path || isDashboardAlias) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });
    }

    const handler = routeMap[path] || (isAuth ? renderDashboardView : renderLoginView);
    currentView = handler(contentEl, store, navigate);
  };

  activeRenderFn = render;
  window.addEventListener('hashchange', render);

  // Langsung jalankan render saat inisialisasi router
  render();
}
