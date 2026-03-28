let cancelTargetId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;

    const user = Auth.getUser();
    if (user) {
        document.getElementById('profileName').textContent  = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileRole').textContent  = user.role === 'admin' ? 'Admin' : 'User';
    }

    loadMyBookings();
    initSidebarTabs();

    document.getElementById('confirmCancelBtn').addEventListener('click', async () => {
        if (!cancelTargetId) return;
        try {
            await apiFetch(`/bookings/${cancelTargetId}/cancel`, { method: 'PUT' });
            showToast('Booking cancelled.', 'success');
            closeModal('cancelModal');
            loadMyBookings();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
});

// ─── Load Bookings ────────────────────────────────────────
async function loadMyBookings() {
    const wrap = document.getElementById('bookingsTableWrap');
    wrap.innerHTML = '<div class="spinner" style="margin:2rem auto;"></div>';
    try {
        const bookings = await apiFetch('/bookings/my-bookings');
        renderBookingsTable(bookings);
        updateStats(bookings);
    } catch (err) {
        wrap.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><h3>${err.message}</h3></div>`;
    }
}

// ─── Render Table ─────────────────────────────────────────
function renderBookingsTable(bookings) {
    const wrap = document.getElementById('bookingsTableWrap');
    if (!bookings || bookings.length === 0) {
        wrap.innerHTML = `<div class="empty-state"><div class="icon">📋</div><h3>No bookings yet</h3><p>Start exploring and book your first hotel!</p><a href="index.html" class="btn btn-primary" style="margin-top:1rem;">Browse Hotels</a></div>`;
        return;
    }
    wrap.innerHTML = `
        <table>
            <thead><tr>
                <th>Hotel</th><th>Room</th><th>Check-in</th><th>Check-out</th>
                <th>Total</th><th>Status</th><th>Payment</th><th>Action</th>
            </tr></thead>
            <tbody>
            ${bookings.map(b => `
                <tr>
                    <td><strong>${b.hotel_name}</strong><br/><span style="color:var(--text-secondary);font-size:0.78rem;">${b.hotel_location}</span></td>
                    <td>${b.room_type}</td>
                    <td>${formatDate(b.check_in_date)}</td>
                    <td>${formatDate(b.check_out_date)}</td>
                    <td style="color:var(--gold);font-weight:700;">${formatCurrency(b.total_price)}</td>
                    <td><span class="badge badge-${b.status.toLowerCase()}">${b.status}</span></td>
                    <td><span class="badge badge-${(b.payment_status||'pending').toLowerCase()}">${b.payment_status || 'Not Paid'}</span></td>
                    <td>
                        ${b.status !== 'Cancelled'
                            ? `<button class="btn btn-danger btn-sm" onclick="openCancelModal(${b.id})">Cancel</button>`
                            : '<span style="color:var(--text-muted);font-size:0.8rem;">—</span>'
                        }
                    </td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;
}

// ─── Update Stats ─────────────────────────────────────────
function updateStats(bookings) {
    document.getElementById('statTotal').textContent     = bookings.length;
    document.getElementById('statConfirmed').textContent = bookings.filter(b => b.status === 'Confirmed').length;
    document.getElementById('statPending').textContent   = bookings.filter(b => b.status === 'Pending').length;
    const spent = bookings.filter(b => b.payment_status === 'Completed').reduce((s, b) => s + parseFloat(b.total_price), 0);
    document.getElementById('statSpent').textContent = formatCurrency(spent);
}

// ─── Cancel Modal ─────────────────────────────────────────
function openCancelModal(id) {
    cancelTargetId = id;
    openModal('cancelModal');
}

// ─── Sidebar Tab Navigation ───────────────────────────────
function initSidebarTabs() {
    document.querySelectorAll('[data-tab-trigger]').forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.tabTrigger;
            document.querySelectorAll('[data-tab-trigger]').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('[id^="tab-"]').forEach(t => t.style.display = 'none');
            const el = document.getElementById(`tab-${target}`);
            if (el) el.style.display = 'block';
        });
    });
}
