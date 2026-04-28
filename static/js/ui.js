// --- UI Utilities ---

// -- Toast Notifications --

const TOAST_ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info'
};

export function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${TOAST_ICONS[type]} custom-toast-icon"></i>
    <div class="custom-toast-body">
      ${title ? `<p class="custom-toast-title">${title}</p>` : ''}
      <p class="custom-toast-message">${message}</p>
    </div>
    <button class="custom-toast-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
  `;

  toast.querySelector('.custom-toast-close').addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// -- Loading Spinner --

export function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('show');
}

export function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('show');
}

// -- Sidebar Navigation --

export function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay?.classList.toggle('show');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  const params = new URLSearchParams(window.location.search);
  const currentTpl = params.get('tpl') || 'templates/dashboard/dashboard.html';
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    const tplMatch = href?.match(/tpl=([^&]+)/);
    if (tplMatch && tplMatch[1] === currentTpl) {
      link.classList.add('active');
    }
  });
}

// -- Dark Mode --

export function initTheme() {
  const settings = JSON.parse(localStorage.getItem('sms_settings') || '{}');
  const theme = settings.theme || localStorage.getItem('sms_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);

  const primaryColor = settings.primaryColor || '#4f46e5';
  document.documentElement.style.setProperty('--color-primary', primaryColor);
  document.documentElement.style.setProperty('--color-primary-hover', adjustColor(primaryColor, -20));
  document.documentElement.style.setProperty('--color-primary-light', hexToRgba(primaryColor, 0.12));
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('sms_theme', theme);
  const settings = JSON.parse(localStorage.getItem('sms_settings') || '{}');
  settings.theme = theme;
  localStorage.setItem('sms_settings', JSON.stringify(settings));
}

export function setPrimaryColor(color) {
  document.documentElement.style.setProperty('--color-primary', color);
  document.documentElement.style.setProperty('--color-primary-hover', adjustColor(color, -20));
  document.documentElement.style.setProperty('--color-primary-light', hexToRgba(color, 0.12));
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// -- Global Search --

export function initGlobalSearch() {
  const searchInput = document.getElementById('global-search');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim().toLowerCase();
      if (query) {
        window.location.href = `/?tpl=templates/students/list.html&search=${encodeURIComponent(query)}`;
      }
    }
  });
}

// -- Pagination Helper --

export function paginate(array, page, perPage) {
  const start = (page - 1) * perPage;
  return {
    data: array.slice(start, start + perPage),
    total: array.length,
    totalPages: Math.ceil(array.length / perPage),
    currentPage: page,
    perPage
  };
}

export function renderPagination(container, currentPage, totalPages, onPageChange) {
  if (!container) return;

  const prevDisabled = currentPage <= 1 ? 'disabled' : '';
  const nextDisabled = currentPage >= totalPages ? 'disabled' : '';

  let pages = '';
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  container.innerHTML = `
    <div class="pagination-controls">
      <button class="pagination-btn" data-page="${currentPage - 1}" ${prevDisabled}><i class="fa-solid fa-chevron-left"></i></button>
      ${pages}
      <button class="pagination-btn" data-page="${currentPage + 1}" ${nextDisabled}><i class="fa-solid fa-chevron-right"></i></button>
    </div>
  `;

  container.querySelectorAll('.pagination-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page, 10);
      if (page >= 1 && page <= totalPages) onPageChange(page);
    });
  });
}

// -- Format Helpers --

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getInitials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
}

// -- Modal Helper --

export function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) bootstrap.Modal.getOrCreateInstance(el).show();
}

export function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) bootstrap.Modal.getInstance(el)?.hide();
}

// -- Debounce --

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// -- Confirm Dialog --

export function confirmAction(message) {
  return window.confirm(message);
}
