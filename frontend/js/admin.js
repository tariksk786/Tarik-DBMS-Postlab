// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;
    if (!requireAdmin()) return;

    loadOverview();
    initAdminSidebarTabs();
});

// ─── Sidebar Tab Navigation ───────────────────────────────
function initAdminSidebarTabs() {
    const loaders = {
        overview: loadOverview,
        hotels:   loadHotels,
        rooms:    loadRoomsTab,
        bookings: loadAllBookings,
        users:    loadUsers
    };
    document.querySelectorAll('[data-tab-trigger]').forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.tabTrigger;
            document.querySelectorAll('[data-tab-trigger]').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('[id^="tab-"]').forEach(t => t.style.display = 'none');
            const el = document.getElementById(`tab-${target}`);
            if (el) el.style.display = 'block';
            if (loaders[target]) loaders[target]();
        });
    });
}

// ─── OVERVIEW ─────────────────────────────────────────────
let revenueChartInstance = null;
let statusChartInstance  = null;

async function loadOverview() {
    try {
        const data = await apiFetch('/admin/stats');
        document.getElementById('statRevenue').textContent  = formatCurrency(data.totalRevenue);
        document.getElementById('statBookings').textContent = data.totalBookings;
        document.getElementById('statHotels').textContent   = data.totalHotels;
        document.getElementById('statUsers').textContent    = data.totalUsers;

        renderRevenueChart(data.monthlyRevenue);
        renderStatusChart(data.bookingsByStatus);
        renderTopHotels(data.topHotels);
    } catch (err) {
        showToast('Failed to load stats: ' + err.message, 'error');
    }
}

function renderRevenueChart(data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (revenueChartInstance) revenueChartInstance.destroy();
    revenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.month),
            datasets: [{
                label: 'Revenue ($)',
                data: data.map(d => d.revenue),
                backgroundColor: 'rgba(245,200,66,0.7)',
                borderColor: '#f5c842',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#8a97b5' } } },
            scales: {
                x: { ticks: { color: '#8a97b5' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#8a97b5', callback: v => '$' + v }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

function renderStatusChart(data) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    if (statusChartInstance) statusChartInstance.destroy();
    const colorMap = { Confirmed: '#22c55e', Pending: '#f59e0b', Cancelled: '#ef4444' };
    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.status),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: data.map(d => colorMap[d.status] || '#8a97b5'),
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: '#8a97b5', padding: 16 } } },
            cutout: '65%'
        }
    });
}

function renderTopHotels(hotels) {
    const tbody = document.getElementById('topHotelsTable');
    if (!hotels || hotels.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text-secondary);padding:1.5rem;">No revenue data yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = hotels.map((h, i) => `
        <tr>
            <td><strong style="color:var(--gold);">#${i+1}</strong></td>
            <td>${h.name}</td>
            <td style="color:var(--success);font-weight:700;">${formatCurrency(h.revenue)}</td>
        </tr>
    `).join('');
}

// ─── HOTELS CRUD ──────────────────────────────────────────
async function loadHotels() {
    const tbody = document.getElementById('hotelsTableBody');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem;"><div class="spinner"></div></td></tr>`;
    try {
        const data = await apiFetch('/hotels?limit=100');
        populateHotelDropdowns(data.hotels);
        if (!data.hotels.length) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);padding:2rem;">No hotels yet.</td></tr>`;
            return;
        }
        tbody.innerHTML = data.hotels.map(h => `
            <tr>
                <td>${h.id}</td>
                <td><strong>${h.name}</strong></td>
                <td>📍 ${h.location}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deleteHotel(${h.id})">🗑 Delete</button></td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:var(--danger);text-align:center;padding:1.5rem;">${err.message}</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addHotelBtn')?.addEventListener('click', async () => {
        const name     = document.getElementById('hName').value.trim();
        const location = document.getElementById('hLocation').value.trim();
        const desc     = document.getElementById('hDesc').value.trim();
        const image    = document.getElementById('hImage').value.trim();
        if (!name || !location) { showToast('Name and location are required.', 'error'); return; }
        try {
            await apiFetch('/hotels', { method: 'POST', body: JSON.stringify({ name, location, description: desc, image_url: image }) });
            showToast('Hotel added successfully! 🏨', 'success');
            ['hName','hLocation','hDesc','hImage'].forEach(id => document.getElementById(id).value = '');
            loadHotels();
        } catch (err) { showToast(err.message, 'error'); }
    });

    document.getElementById('addRoomBtn')?.addEventListener('click', async () => {
        const hotel_id       = document.getElementById('rHotelId').value;
        const room_type      = document.getElementById('rType').value.trim();
        const price_per_night = document.getElementById('rPrice').value;
        const capacity       = document.getElementById('rCapacity').value;
        if (!hotel_id || !room_type || !price_per_night) { showToast('Hotel, Room Type and Price are required.', 'error'); return; }
        try {
            await apiFetch('/rooms', { method: 'POST', body: JSON.stringify({ hotel_id: parseInt(hotel_id), room_type, price_per_night: parseFloat(price_per_night), capacity: parseInt(capacity) || 2 }) });
            showToast('Room added! 🚪', 'success');
            const sel = document.getElementById('filterHotelRooms');
            if (sel.value) loadRoomsForHotel(sel.value);
        } catch (err) { showToast(err.message, 'error'); }
    });

    document.getElementById('filterHotelRooms')?.addEventListener('change', (e) => {
        if (e.target.value) loadRoomsForHotel(e.target.value);
    });
});

async function deleteHotel(id) {
    if (!confirm('Delete this hotel and all its rooms/bookings?')) return;
    try {
        await apiFetch(`/hotels/${id}`, { method: 'DELETE' });
        showToast('Hotel deleted.', 'success');
        loadHotels();
    } catch (err) { showToast(err.message, 'error'); }
}

function populateHotelDropdowns(hotels) {
    ['rHotelId','filterHotelRooms'].forEach(selId => {
        const sel = document.getElementById(selId);
        if (!sel) return;
        const current = sel.value;
        sel.innerHTML = `<option value="">Select Hotel…</option>` + hotels.map(h => `<option value="${h.id}" ${h.id == current ? 'selected' : ''}>${h.name}</option>`).join('');
    });
}

// ─── ROOMS ────────────────────────────────────────────────
async function loadRoomsTab() {
    await loadHotels();
}

async function loadRoomsForHotel(hotelId) {
    const tbody = document.getElementById('roomsTableBody');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;"><div class="spinner"></div></td></tr>`;
    try {
        const rooms = await apiFetch(`/rooms/hotel/${hotelId}`);
        const hotelName = document.getElementById('filterHotelRooms').selectedOptions[0].text;
        if (!rooms.length) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:2rem;">No rooms for this hotel.</td></tr>`;
            return;
        }
        tbody.innerHTML = rooms.map(r => `
            <tr>
                <td>${r.id}</td>
                <td>${hotelName}</td>
                <td>${r.room_type}</td>
                <td style="color:var(--gold);font-weight:700;">${formatCurrency(r.price_per_night)}</td>
                <td>${r.capacity}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deleteRoom(${r.id})">🗑 Delete</button></td>
            </tr>
        `).join('');
    } catch (err) { showToast(err.message, 'error'); }
}

async function deleteRoom(id) {
    if (!confirm('Delete this room?')) return;
    try {
        await apiFetch(`/rooms/${id}`, { method: 'DELETE' });
        showToast('Room deleted.', 'success');
        const sel = document.getElementById('filterHotelRooms');
        if (sel.value) loadRoomsForHotel(sel.value);
    } catch (err) { showToast(err.message, 'error'); }
}

// ─── ALL BOOKINGS ─────────────────────────────────────────
async function loadAllBookings() {
    const tbody = document.getElementById('allBookingsBody');
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;"><div class="spinner"></div></td></tr>`;
    try {
        const bookings = await apiFetch('/admin/bookings');
        if (!bookings.length) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-secondary);padding:2rem;">No bookings yet.</td></tr>`;
            return;
        }
        tbody.innerHTML = bookings.map(b => `
            <tr>
                <td>#${b.id}</td>
                <td><strong>${b.user_name}</strong><br/><span style="color:var(--text-muted);font-size:0.75rem;">${b.user_email}</span></td>
                <td>${b.hotel_name}</td>
                <td>${b.room_type}</td>
                <td style="font-size:0.8rem;">${formatDate(b.check_in_date)} → ${formatDate(b.check_out_date)}</td>
                <td style="color:var(--gold);font-weight:700;">${formatCurrency(b.total_price)}</td>
                <td><span class="badge badge-${b.status.toLowerCase()}">${b.status}</span></td>
                <td><span class="badge badge-${(b.payment_status||'pending').toLowerCase()}">${b.payment_status || '—'}</span></td>
                <td>
                    ${b.status === 'Pending'
                        ? `<button class="btn btn-accent btn-sm" onclick="confirmBooking(${b.id})">✓ Confirm</button>`
                        : '<span style="color:var(--text-muted);font-size:0.8rem;">—</span>'
                    }
                </td>
            </tr>
        `).join('');
    } catch (err) { showToast(err.message, 'error'); }
}

async function confirmBooking(id) {
    try {
        await apiFetch(`/admin/bookings/${id}/confirm`, { method: 'PUT' });
        showToast('Booking confirmed!', 'success');
        loadAllBookings();
    } catch (err) { showToast(err.message, 'error'); }
}

// ─── USERS ────────────────────────────────────────────────
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;"><div class="spinner"></div></td></tr>`;
    try {
        const users = await apiFetch('/admin/users');
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-confirmed' : 'badge-pending'}">${u.role}</span></td>
                <td style="font-size:0.8rem;">${formatDate(u.created_at)}</td>
                <td>
                    ${u.role !== 'admin'
                        ? `<button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id}, '${u.name}')">🗑 Delete</button>`
                        : '<span style="color:var(--text-muted);font-size:0.8rem;">Protected</span>'
                    }
                </td>
            </tr>
        `).join('');
    } catch (err) { showToast(err.message, 'error'); }
}

async function deleteUser(id, name) {
    if (!confirm(`Delete user "${name}"? This will also delete their bookings.`)) return;
    try {
        await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
        showToast('User deleted.', 'success');
        loadUsers();
    } catch (err) { showToast(err.message, 'error'); }
}
