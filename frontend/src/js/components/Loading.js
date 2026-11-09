/**
 * Loading Component — toggle overlay berdasarkan store.loadingCount.
 */

import { store } from '../store.js';

export function initLoading() {
  store._toggleLoading(store.loadingCount > 0);
}