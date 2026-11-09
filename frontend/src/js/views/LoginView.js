/**
 * Login View — Halaman Autentikasi Multi-Role SEKELAS.
 * Terintegrasi penuh dengan database pengguna (Manajemen User Admin):
 * - Mendukung login dengan Username, Email, NISN, atau NIP
 * - Memvalidasi kecocokan password & status keaktifan akun (isActive)
 * - Memvalidasi kesesuaian Role (mencegah eskalasi hak akses tidak sah)
 * - Mendukung akun baru yang ditambahkan melalui Manajemen User
 */

import { api } from '../api.js';
import { getUsersDb } from '../dataStore.js';
import { getDefaultDashboardForRole } from '../router.js';

export function renderLoginView(containerEl, storeRef, navigateFn) {
  const form = document.getElementById('login-form');
  if (!form) return { unmount: () => {} };

  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const roleSelect = document.getElementById('login-role');

  // Deteksi otomatis role di dropdown saat user mengetik username yang terdaftar
  const handleUsernameInput = () => {
    const val = usernameInput.value.trim().toLowerCase();
    if (!val) return;
    const users = getUsersDb();
    const matched = users.find(
      (u) =>
        u.username.toLowerCase() === val ||
        (u.email && u.email.toLowerCase() === val) ||
        (u.nis && u.nis === val) ||
        (u.nip && u.nip.toLowerCase() === val)
    );
    if (matched && roleSelect) {
      roleSelect.value = matched.role;
    }
  };

  usernameInput.addEventListener('input', handleUsernameInput);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="flex items-center gap-2"><svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memproses...</span>`;

    try {
      const rawIdentifier = usernameInput.value.trim();
      const rawPass = passwordInput.value;
      let selectedRole = roleSelect ? roleSelect.value : '';

      if (!rawIdentifier || !rawPass) {
        throw new Error('Username dan password wajib diisi.');
      }

      // Cari akun di database pengguna lokal (yang dikelola oleh modul Manajemen User)
      const users = getUsersDb();
      const account = users.find(
        (u) =>
          u.username.toLowerCase() === rawIdentifier.toLowerCase() ||
          (u.email && u.email.toLowerCase() === rawIdentifier.toLowerCase()) ||
          (u.nis && u.nis === rawIdentifier) ||
          (u.nip && u.nip.toLowerCase() === rawIdentifier.toLowerCase())
      );

      if (!account) {
        throw new Error(`Akun "${rawIdentifier}" tidak ditemukan dalam sistem.`);
      }

      // Cek apakah akun dinonaktifkan oleh Admin
      if (account.isActive === false) {
        throw new Error(`Akun @${account.username} sedang dinonaktifkan oleh Administrator.`);
      }

      // Validasi password
      const expectedPassword = account.password || '123456';
      if (rawPass !== expectedPassword) {
        throw new Error('Password yang Anda masukkan salah. Silakan coba lagi.');
      }

      // Jika role belum dipilih, gunakan role asli akun
      if (!selectedRole) {
        selectedRole = account.role;
        if (roleSelect) roleSelect.value = selectedRole;
      }

      // Validasi kesesuaian role (Cegah pengguna non-admin login sebagai role lain)
      if (account.role !== 'admin' && selectedRole !== account.role) {
        const roleNames = {
          admin: 'Administrator',
          wali_kelas: 'Wali Kelas',
          guru_mapel: 'Guru Mapel',
          siswa: 'Siswa / Pengurus',
          orang_tua: 'Orang Tua Siswa',
        };
        throw new Error(
          `Akses Ditolak: Akun @${account.username} terdaftar sebagai "${roleNames[account.role] || account.role}", tidak dapat masuk sebagai "${roleNames[selectedRole] || selectedRole}".`
        );
      }

      // Kirim juga ke API backend untuk sinkronisasi token sesi
      let token = 'token-sekelas-' + Date.now();
      try {
        const resData = await api.post('/auth/login', {
          username: account.username,
          password: rawPass,
          role: account.role,
        });
        if (resData?.data?.token || resData?.token) {
          token = resData?.data?.token || resData?.token;
        }
      } catch (apiErr) {
        // Tetap lanjutkan dengan sesi lokal jika server dalam mode statis
      }

      const sessionUser = {
        id: account.id,
        username: account.username,
        fullName: account.fullName,
        email: account.email,
        role: account.role,
        jabatanPengurus: account.jabatanPengurus || 'anggota',
        nis: account.nis || null,
        nip: account.nip || null,
        parentOfName: account.parentOfName || null,
        isActive: true,
      };

      const targetRoute = getDefaultDashboardForRole(sessionUser.role);

      storeRef.setAuth(sessionUser, token);
      storeRef.success(`Selamat datang, ${sessionUser.fullName}!`);

      navigateFn(targetRoute);
    } catch (err) {
      storeRef.error(err.message || 'Gagal masuk akun. Periksa kembali kredensial Anda.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  };

  // Bersihkan handler sebelumnya
  if (form._submitHandler) {
    form.removeEventListener('submit', form._submitHandler);
  }
  form._submitHandler = handleSubmit;
  form.addEventListener('submit', handleSubmit);

  // Setup tombol cepat demo login
  document.querySelectorAll('.btn-demo-quick').forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      const u = btn.getAttribute('data-user');
      const r = btn.getAttribute('data-role');
      const users = getUsersDb();
      const found = users.find((x) => x.username === u);
      if (usernameInput) usernameInput.value = u;
      if (passwordInput) passwordInput.value = found?.password || '123456';
      if (roleSelect && r) roleSelect.value = r;
      if (form) form.requestSubmit();
    };
  });

  return {
    unmount: () => {
      if (form._submitHandler) {
        form.removeEventListener('submit', form._submitHandler);
        delete form._submitHandler;
      }
      usernameInput.removeEventListener('input', handleUsernameInput);
    },
  };
}
