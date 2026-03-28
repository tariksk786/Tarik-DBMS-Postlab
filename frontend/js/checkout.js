const params = new URLSearchParams(window.location.search);
let selectedMethod = 'Credit Card';
let bookingId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

    // Populate summary from URL params
    const roomId    = params.get('room_id');
    const checkIn   = params.get('check_in');
    const checkOut  = params.get('check_out');
    const hotelId   = params.get('hotel_id');
    const roomName  = params.get('room_name');
    const price     = parseFloat(params.get('price'));
    const nights    = parseInt(params.get('nights'));
    const total     = price * nights;

    if (!roomId || !checkIn || !checkOut) { showToast('Invalid booking details.', 'error'); setTimeout(() => window.location.href='index.html', 1500); return; }

    // Fill hotel name from API
    apiFetch(`/hotels/${hotelId}`).then(data => {
        document.getElementById('sumHotel').textContent = data.hotel.name;
    }).catch(() => {});

    document.getElementById('sumRoom').textContent    = roomName || '—';
    document.getElementById('sumCheckIn').textContent  = formatDate(checkIn);
    document.getElementById('sumCheckOut').textContent = formatDate(checkOut);
    document.getElementById('sumNights').textContent   = `${nights} night${nights !== 1 ? 's' : ''}`;
    document.getElementById('sumPrice').textContent    = formatCurrency(price);
    document.getElementById('sumTotal').textContent    = formatCurrency(total);

    // Card number auto-format
    document.getElementById('cardNumber').addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0,16);
        e.target.value = val.replace(/(.{4})/g, '$1 ').trim();
    });

    // Card expiry auto-format
    document.getElementById('cardExpiry').addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0,4);
        if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2);
        e.target.value = val;
    });

    // Payment method selection
    document.querySelectorAll('.pm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pm-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMethod = btn.dataset.method;
        });
    });

    // Pay Button
    document.getElementById('payBtn').addEventListener('click', async () => {
        const cardName = document.getElementById('cardName').value.trim();
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const cardExpiry = document.getElementById('cardExpiry').value.trim();
        const cardCVV = document.getElementById('cardCVV').value.trim();

        if (!cardName || !cardNumber || !cardExpiry || !cardCVV) { 
            showToast('Please fill all payment details.', 'error'); return; 
        }

        const payBtn = document.getElementById('payBtn');
        payBtn.disabled = true; 
        
        try {
            // Processing Simulation - Step 1
            payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating Card…';
            await new Promise(r => setTimeout(r, 1200));

            // Create booking in background
            const bookingRes = await apiFetch('/bookings', {
                method: 'POST',
                body: JSON.stringify({ room_id: roomId, check_in_date: checkIn, check_out_date: checkOut })
            });
            bookingId = bookingRes.bookingId;

            // Processing Simulation - Step 2
            payBtn.innerHTML = '<i class="fas fa-shield-alt fa-spin"></i> Authorizing with Bank…';
            await new Promise(r => setTimeout(r, 1500));

            // Process payment
            await apiFetch('/payments', {
                method: 'POST',
                body: JSON.stringify({ booking_id: bookingId, payment_method: selectedMethod })
            });

            // Finalizing
            payBtn.innerHTML = '<i class="fas fa-check-circle"></i> Success!';
            await new Promise(r => setTimeout(r, 600));

            // Show success
            document.getElementById('successOverlay').classList.add('show');
        } catch (err) {
            showToast('Payment failed: ' + err.message, 'error');
            payBtn.disabled = false; 
            payBtn.innerHTML = '<i class="fas fa-check-double"></i> Pay Now';
        }
    });
});
