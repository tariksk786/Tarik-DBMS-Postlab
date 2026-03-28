// ─── State ────────────────────────────────────────────────
let currentPage = 1;
let totalPages  = 1;
let searchParams = {};

// ─── Load Hotels ──────────────────────────────────────────
async function loadHotels(page = 1) {
    currentPage = page;
    const grid = document.getElementById('hotelsGrid');
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem 0;"><div class="spinner"></div><p style="color:var(--text-secondary);margin-top:1rem;">Loading hotels…</p></div>`;

    try {
        const params = new URLSearchParams({ page, limit: 6, ...searchParams });
        const data = await apiFetch(`/hotels?${params}`);
        totalPages = data.pages || 1;
        renderHotels(data.hotels);
        renderPagination();
    } catch (err) {
        grid.innerHTML = `<div style="grid-column:1/-1;" class="empty-state"><div class="icon">🏨</div><h3>Could not load hotels</h3><p>${err.message}</p></div>`;
    }
}

// ─── Render Hotels ────────────────────────────────────────
function renderHotels(hotels) {
    const grid = document.getElementById('hotelsGrid');
    if (!hotels || hotels.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;" class="empty-state"><div class="icon">🔍</div><h3>No hotels found</h3><p>Try adjusting your search filters.</p></div>`;
        return;
    }

    const hotelEmojis = ['🏨','🏩','🌴','🏰','🗼','🌊','⛰️','🏙️'];
    grid.innerHTML = hotels.map((h, i) => `
        <div class="hotel-card" onclick="window.location.href='hotel-details.html?id=${h.id}'">
            <div class="hotel-card-img" style="background-image: url('${h.image_url ? (h.image_url.startsWith('http') ? h.image_url : '/' + h.image_url) : 'https://via.placeholder.com/400x250?text=LuxeStay'}')">
            </div>
            <div class="hotel-card-body">
                <div class="hotel-card-location">📍 ${h.location}</div>
                <div class="hotel-card-name">${h.name}</div>
                <div class="stars">${renderStars(h.avg_rating)}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.25rem;">
                    ${h.avg_rating ? `${h.avg_rating} · ${h.review_count} review${h.review_count !== 1 ? 's' : ''}` : 'No reviews yet'}
                </div>
                <div class="hotel-card-footer">
                    <div class="hotel-card-price">From <span>${formatCurrency(h.min_price)}</span>/night</div>
                    <button class="btn btn-primary btn-sm">Book Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ─── Render Pagination ────────────────────────────────────
function renderPagination() {
    const el = document.getElementById('pagination');
    if (!el || totalPages <= 1) { if(el) el.innerHTML=''; return; }

    let html = `<button class="page-btn" onclick="loadHotels(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="loadHotels(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" onclick="loadHotels(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>›</button>`;
    el.innerHTML = html;
}

// ─── Search Handler ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadHotels(1);

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const location = document.getElementById('searchLocation').value.trim();
            const minPrice = document.getElementById('filterMinPrice').value;
            const maxPrice = document.getElementById('filterMaxPrice').value;
            searchParams = {};
            if (location) searchParams.location = location;
            if (minPrice) searchParams.minPrice = minPrice;
            if (maxPrice) searchParams.maxPrice = maxPrice;
            loadHotels(1);
        });
    }

    // Enter key on search
    document.getElementById('searchLocation')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('searchBtn').click();
    });

    // Show logout btn if logged in
    const logoutBtn = document.getElementById('navLogout');
    if (logoutBtn && Auth.isLoggedIn()) logoutBtn.style.display = 'inline-flex';
});
