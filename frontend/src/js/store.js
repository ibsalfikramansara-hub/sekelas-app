// Simple reactive store for auth state, toast notifications, and loading.
const initialToken = localStorage.getItem('sekelas_token') || null;
let initialUser = null;
try {
  const savedUser = localStorage.getItem('sekelas_user');
  if (savedUser) initialUser = JSON.parse(savedUser);
} catch (e) {
  initialUser = null;
}

export const store = {
  // Auth
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken && !!initialUser,

  // UI
  toasts: [],
  loadingCount: 0,

  // Persist token & user on login/logout
  setAuth(user, token) {
    this.user = user;
    this.token = token;
    this.isAuthenticated = !!token && !!user;
    if (token) {
      localStorage.setItem('sekelas_token', token);
      localStorage.setItem('sekelas_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sekelas_token');
      localStorage.removeItem('sekelas_user');
    }
  },

  clearAuth() {
    this.user = null;
    this.token = null;
    this.isAuthenticated = false;
    localStorage.removeItem('sekelas_token');
    localStorage.removeItem('sekelas_user');
  },

  // Toast notifications
  toast(message, type = 'info', duration = 4000) {
    const id = Date.now() + Math.random();
    this.toasts.push({ id, message, type, duration });
    this._renderToasts();
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
      this._renderToasts();
    }, duration);
  },

  success(message, duration) { this.toast(message, 'success', duration); },
  error(message, duration) { this.toast(message, 'error', duration); },
  info(message, duration) { this.toast(message, 'info', duration); },
  warning(message, duration) { this.toast(message, 'warning', duration); },

  // Loading indicator
  startLoading() {
    this.loadingCount++;
    this._toggleLoading(true);
  },
  stopLoading() {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) this._toggleLoading(false);
  },

  _toggleLoading(show) {
    const el = document.getElementById('loading-overlay');
    if (!el) return;
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
  },

  _renderToasts() {
    const container = document.getElementById('toast-container');
    if (!container) return;
    container.innerHTML = '';
    this.toasts.forEach((t) => {
      const div = document.createElement('div');
      const typeConfig = {
        success: { bg: 'bg-green-500', icon: '✔', border: 'border-green-400' },
        error: { bg: 'bg-red-500', icon: '✖', border: 'border-red-400' },
        warning: { bg: 'bg-amber-500', icon: '⚠', border: 'border-amber-400' },
        info: { bg: 'bg-primary-600', icon: 'ℹ', border: 'border-primary-400' },
      }[t.type] || typeConfig.info;
      div.className = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[300px] border-l-4 ' +
        typeConfig.border + ' ' + typeConfig.bg + ' text-white text-sm font-medium animate-in slide-in-from-right-2 duration-300';
      div.innerHTML = '<span class="text-xl">' + typeConfig.icon + '</span>' +
        '<span class="flex-1">' + t.message + '</span>' +
        '<button onclick="store.toasts = store.toasts.filter(x => x.id !== ' + t.id + '); store._renderToasts();" ' +
        'class="text-xs opacity-70 hover:opacity-100">&times;</button>';
      container.appendChild(div);
    });
  },
};

// Expose toast globally for inline HTML usage
window.store = store;
