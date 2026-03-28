document.addEventListener('DOMContentLoaded', () => {

    // ─── Login Form ───────────────────────────────────────
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        if (Auth.isLoggedIn()) window.location.href = 'index.html';

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            btn.disabled = true; btn.textContent = 'Signing in…';

            const email    = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            try {
                const data = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                Auth.save(data.token, data.user);
                showToast('Welcome back, ' + data.user.name + '! 🎉', 'success');
                setTimeout(() => {
                    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'index.html';
                }, 800);
            } catch (err) {
                showToast(err.message, 'error');
                btn.disabled = false; btn.textContent = 'Sign In';
            }
        });
    }

    // ─── Register Form ────────────────────────────────────
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        if (Auth.isLoggedIn()) window.location.href = 'index.html';

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('registerBtn');

            const name     = document.getElementById('regName').value.trim();
            const email    = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirm  = document.getElementById('regConfirm').value;

            if (password !== confirm) {
                showToast('Passwords do not match!', 'error'); return;
            }
            if (password.length < 6) {
                showToast('Password must be at least 6 characters.', 'error'); return;
            }

            btn.disabled = true; btn.textContent = 'Creating account…';
            try {
                await apiFetch('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });
                showToast('Account created! Please login.', 'success');
                setTimeout(() => window.location.href = 'login.html', 1200);
            } catch (err) {
                showToast(err.message, 'error');
                btn.disabled = false; btn.textContent = 'Create Account';
            }
        });
    }
});
