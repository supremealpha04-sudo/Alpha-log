// ============================================
// UI COMPONENTS
// ============================================
import { escapeHtml } from './utils.js';

// Toast System
export function showToast(title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content"><div class="toast-title">${escapeHtml(title)}</div>
    <div class="toast-msg">${escapeHtml(message)}</div></div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Modal helpers
export function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}
export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// Tag Input
export function setupTagInput(inputId, wrapId, tagsArray) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.value.trim();
      if (val && !tagsArray.includes(val)) {
        tagsArray.push(val);
        renderTags(wrapId, inputId, tagsArray);
      }
      input.value = '';
    }
  });
}

export function renderTags(wrapId, inputId, tagsArray) {
  const wrap = document.getElementById(wrapId);
  const input = document.getElementById(inputId);
  if (!wrap || !input) return;
  wrap.innerHTML = '';
  tagsArray.forEach((tag, i) => {
    const pill = document.createElement('div');
    pill.className = 'tag-pill';
    pill.innerHTML = `${escapeHtml(tag)} <button onclick="window.app.removeTag('${wrapId}', '${inputId}', ${i})">&times;</button>`;
    wrap.appendChild(pill);
  });
  wrap.appendChild(input);
  input.focus();
}

// Empty state
export function emptyState(msg = 'No data yet.') {
  return `<div class="empty-state"><p>${escapeHtml(msg)}</p></div>`;
}

// Loading state
export function loadingState() {
  return `<div class="empty-state"><div class="spinner" style="width:24px;height:24px;margin:0 auto 16px"></div><p>Loading...</p></div>`;
}

// Status pill
export function statusPill(status) {
  const map = {
    new: 'status-new', read: 'status-read', replied: 'status-replied',
    live: 'status-live', soon: 'status-soon',
    active: 'status-live', inactive: 'status-soon',
    pending: 'result-pending', right: 'result-right', wrong: 'result-wrong',
    reading: 'status-reading', finished: 'status-finished', wishlist: 'status-wishlist'
  };
  const cls = map[status] || '';
  return `<span class="status-pill ${cls}">${status}</span>`;
}

// Section wrapper
export function sectionWrapper(label, title, desc = '', extra = '') {
  return `<div class="sec-header"><div>
    <div class="sec-label">${escapeHtml(label)}</div>
    <h2 class="sec-title">${escapeHtml(title)}</h2>
    ${desc ? `<p class="sec-desc">${escapeHtml(desc)}</p>` : ''}
  </div>${extra}</div>`;
}

// PWA Install
let deferredPrompt = null;
export function setupPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.classList.add('show');
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.classList.remove('show');
    showToast('Installed', 'AlphaOS is now on your home screen!', 'success');
  });
  const btn = document.getElementById('pwaInstallBtn');
  if (btn) btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      btn.classList.remove('show');
    }
  });
}

// Service Worker
export function registerSW() {
  if ('serviceWorker' in navigator) {
    const swCode = `
      const CACHE_NAME = 'alphaos-v1';
      const urlsToCache = ['/', '/index.html'];
      self.addEventListener('install', e => {
        e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
        self.skipWaiting();
      });
      self.addEventListener('fetch', e => {
        e.respondWith(caches.match(e.request).then(r => {
          if (r) return r;
          return fetch(e.request).catch(() => {
            if (e.request.mode === 'navigate') return caches.match('/index.html');
          });
        }));
      });
      self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
    `;
    const blob = new Blob([swCode], { type: 'application/javascript' });
    navigator.serviceWorker.register(URL.createObjectURL(blob)).catch(() => {});
  }
}
