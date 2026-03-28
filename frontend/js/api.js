// ─── API Base ──────────────────────────────────────────────────────────────
const API_BASE = '/api'; // Use relative path for production hosting

// ─── Auth Helpers ──────────────────────────────────────────────────────────
const Auth = {
    getToken: () => localStorage.getItem('hotel_token'),
    getUser:  () => JSON.parse(localStorage.getItem('hotel_user') || 'null'),
    isLoggedIn: () => !!localStorage.getItem('hotel_token'),
    isAdmin: () => {
        const u = Auth.getUser();
        return u && u.role === 'admin';
    },
    save: (token, user) => {
        localStorage.setItem('hotel_token', token);
        localStorage.setItem('hotel_user', JSON.stringify(user));
    },
    logout: () => {
        localStorage.removeItem('hotel_token');
        localStorage.removeItem('hotel_user');
        window.location.href = 'login.html';
    }
};

// ─── Fetch Wrapper ─────────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

// ─── Toast Notifications ───────────────────────────────────────────────────
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '<i class="fas fa-check-circle"></i>', error: '<i class="fas fa-exclamation-circle"></i>', info: '<i class="fas fa-info-circle"></i>' };
    toast.innerHTML = `${icons[type] || ''} ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3500);
}

// ─── Star Renderer ─────────────────────────────────────────────────────────
function renderStars(rating, max = 5) {
    const r = Math.round(rating || 0);
    let html = '';
    for (let i = 1; i <= max; i++) {
        html += i <= r ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    return html;
}

// ─── Date Formatter ────────────────────────────────────────────────────────
function formatDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Currency Formatter ────────────────────────────────────────────────────
function formatCurrency(amount) {
    return `$${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

// ─── Page Loader ───────────────────────────────────────────────────────────
function hideLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 500); }
}

// ─── Navbar Scroll Effect ──────────────────────────────────────────────────
function initNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    });

    // Populate user state
    const loginLink = document.getElementById('navLoginLink');
    const userBtn   = document.getElementById('userMenuBtn');
    const adminLink = document.getElementById('navAdminLink');
    const logoutBtn = document.getElementById('navLogout');

    if (Auth.isLoggedIn()) {
        const user = Auth.getUser();
        if (loginLink) loginLink.style.display = 'none';
        if (userBtn)   { userBtn.style.display = 'flex'; userBtn.querySelector('.user-name').textContent = user.name; }
        if (adminLink) adminLink.style.display = Auth.isAdmin() ? 'block' : 'none';
        if (logoutBtn) logoutBtn.addEventListener('click', Auth.logout);
    } else {
        if (userBtn)   userBtn.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// ─── Tab System ────────────────────────────────────────────────────────────
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const pane = document.getElementById(target);
            if (pane) pane.classList.add('active');
        });
    });
}

// ─── Modal System ─────────────────────────────────────────────────────────
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
}
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
}
function initModals() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) modal.classList.remove('open');
        });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });
}

// ─── Route Guard ───────────────────────────────────────────────────────────
function requireAuth() {
    if (!Auth.isLoggedIn()) { showToast('Please login to continue.', 'error'); window.location.href = 'login.html'; return false; }
    return true;
}
function requireAdmin() {
    if (!Auth.isAdmin()) { showToast('Admin access required.', 'error'); window.location.href = 'index.html'; return false; }
    return true;
}

// Initialize common utilities on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    hideLoader();
    initNavbar();
    initTabs();
    initModals();
});
