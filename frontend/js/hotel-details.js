const hotelId = new URLSearchParams(window.location.search).get('id');
let selectedRoomId = null;
let selectedRoomPrice = 0;
let selectedRoomName = '';
let selectedRating = 0;
const hotelEmojis = ['🏨','🏩','🌴','🏰','🗼','🌊','⛰️','🏙️'];

// ─── Load Hotel Details ───────────────────────────────────
async function loadHotelDetails() {
    if (!hotelId) { window.location.href = 'index.html'; return; }
    try {
        const data = await apiFetch(`/hotels/${hotelId}`);
        const { hotel, rooms, reviews } = data;

        // Hero
        document.title = `${hotel.name} – LuxeStay`;
        const heroEl = document.getElementById('detailsHero');
        if (hotel.image_url) {
            const imgPath = hotel.image_url.startsWith('http') ? hotel.image_url : '/' + hotel.image_url;
            heroEl.style.backgroundImage = `linear-gradient(to bottom, rgba(10,14,26,0) 0%, rgba(10,14,26,0.95) 100%), url('${imgPath}')`;
            document.getElementById('hotelEmoji').style.display = 'none';
        }
        document.getElementById('hotelName').textContent = hotel.name;
        document.getElementById('hotelLocation').textContent = '📍 ' + hotel.location;
        document.getElementById('hotelDesc').textContent = hotel.description || 'No description available.';
        document.getElementById('hotelStars').textContent = renderStars(hotel.avg_rating);
        document.getElementById('hotelRating').textContent = hotel.avg_rating
            ? `${hotel.avg_rating} / 5 (${reviews.length} review${reviews.length !== 1 ? 's' : ''})`
            : 'No reviews yet';

        renderRooms(rooms);
        renderReviews(reviews);
    } catch (err) {
        showToast('Failed to load hotel: ' + err.message, 'error');
    }
}

// ─── Render Rooms ─────────────────────────────────────────
function renderRooms(rooms) {
    const list = document.getElementById('roomsList');
    if (!rooms || rooms.length === 0) {
        list.innerHTML = `<div class="empty-state"><div class="icon">🚪</div><h3>No rooms available</h3></div>`;
        return;
    }
    list.innerHTML = rooms.map(r => `
        <div class="room-card" id="roomCard-${r.id}" onclick="selectRoom(${r.id}, ${r.price_per_night}, '${r.room_type.replace(/'/g,"\\'")}')">
            <div class="room-info">
                <div class="room-type">${r.room_type}</div>
                <div class="room-meta">👥 Capacity: ${r.capacity} guest${r.capacity > 1 ? 's' : ''}</div>
            </div>
            <div class="room-price">
                <div class="amount">${formatCurrency(r.price_per_night)}</div>
                <div class="per">per night</div>
            </div>
            <button class="btn btn-secondary btn-sm select-room-btn" id="selectBtn-${r.id}">Select</button>
        </div>
    `).join('');
}

// ─── Select Room ──────────────────────────────────────────
function selectRoom(id, price, name) {
    selectedRoomId = id;
    selectedRoomPrice = price;
    selectedRoomName = name;

    document.querySelectorAll('.room-card').forEach(c => {
        c.style.borderColor = 'var(--border)';
        c.style.background = 'var(--gradient-card)';
    });
    document.querySelectorAll('[id^="selectBtn-"]').forEach(b => {
        b.textContent = 'Select'; b.className = 'btn btn-secondary btn-sm select-room-btn';
    });

    const card = document.getElementById(`roomCard-${id}`);
    const btn  = document.getElementById(`selectBtn-${id}`);
    if (card) { card.style.borderColor = 'var(--gold)'; card.style.background = 'var(--gold-dim)'; }
    if (btn)  { btn.textContent = '✓ Selected'; btn.className = 'btn btn-primary btn-sm select-room-btn'; }

    document.getElementById('selectedRoomNote').innerHTML =
        `✅ <strong>${name}</strong> selected · ${formatCurrency(price)}/night`;
    document.getElementById('bookNowBtn').disabled = false;
}

// ─── Book Now ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadHotelDetails();

    // Set min dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkIn').min  = today;
    document.getElementById('checkOut').min = today;
    document.getElementById('checkIn').addEventListener('change', e => {
        document.getElementById('checkOut').min = e.target.value;
    });

    document.getElementById('bookNowBtn').addEventListener('click', () => {
        if (!Auth.isLoggedIn()) { showToast('Please login to book.', 'error'); setTimeout(() => window.location.href = 'login.html', 1000); return; }
        const checkIn  = document.getElementById('checkIn').value;
        const checkOut = document.getElementById('checkOut').value;
        if (!checkIn || !checkOut) { showToast('Please select check-in and check-out dates.', 'error'); return; }
        if (!selectedRoomId) { showToast('Please select a room.', 'error'); return; }
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000*60*60*24));
        if (nights <= 0) { showToast('Check-out must be after check-in.', 'error'); return; }

        const params = new URLSearchParams({ room_id: selectedRoomId, check_in: checkIn, check_out: checkOut, hotel_id: hotelId, room_name: selectedRoomName, price: selectedRoomPrice, nights });
        window.location.href = `checkout.html?${params}`;
    });

    // Star input
    const stars = document.querySelectorAll('#starInput span');
    stars.forEach(s => {
        s.addEventListener('mouseover', () => {
            const val = parseInt(s.dataset.val);
            stars.forEach(st => st.classList.toggle('active', parseInt(st.dataset.val) <= val));
        });
        s.addEventListener('click', () => {
            selectedRating = parseInt(s.dataset.val);
            stars.forEach(st => st.classList.toggle('active', parseInt(st.dataset.val) <= selectedRating));
        });
    });
    document.getElementById('starInput').addEventListener('mouseleave', () => {
        stars.forEach(st => st.classList.toggle('active', parseInt(st.dataset.val) <= selectedRating));
    });

    // Submit review
    document.getElementById('submitReviewBtn').addEventListener('click', async () => {
        if (!Auth.isLoggedIn()) { showToast('Please login to review.', 'error'); return; }
        if (!selectedRating) { showToast('Please select a rating.', 'error'); return; }
        const comment = document.getElementById('reviewComment').value.trim();
        try {
            await apiFetch(`/hotels/${hotelId}/reviews`, {
                method: 'POST', body: JSON.stringify({ rating: selectedRating, comment })
            });
            showToast('Review posted! ⭐', 'success');
            closeModal('reviewModal');
            loadHotelDetails();
        } catch (err) { showToast(err.message, 'error'); }
    });
});

// ─── Render Reviews ───────────────────────────────────────
function renderReviews(reviews) {
    const list = document.getElementById('reviewsList');
    if (!reviews || reviews.length === 0) {
        list.innerHTML = `<div class="empty-state"><div class="icon">💬</div><h3>No reviews yet</h3><p>Be the first to leave a review!</p></div>`;
        return;
    }
    list.innerHTML = reviews.map(r => `
        <div class="review-card">
            <div class="review-header">
                <span class="reviewer-name">👤 ${r.user_name}</span>
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span class="stars" style="font-size:0.9rem;">${renderStars(r.rating)}</span>
                    <span class="review-date">${formatDate(r.created_at)}</span>
                </div>
            </div>
            <div class="review-comment">${r.comment || '<em>No comment provided.</em>'}</div>
        </div>
    `).join('');
}
