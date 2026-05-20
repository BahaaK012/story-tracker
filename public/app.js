const app = document.getElementById('app');

// Static Views
const views = {
    '#/dashboard': `
        <section class="view-section">
            <h2>Dashboard</h2>
            <p>Welcome to your writing desk. Please login to see stats.</p>
        </section>
    `,
    '#/stories': `
        <section class="view-section">
            <h2>Your Stories</h2>
            <p>Please login to view your manuscripts.</p>
        </section>
    `,
    '#/login': `
        <section class="view-section">
            <h2>Access Your Desk</h2>
            <div style="width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 2rem;">
                
                <form id="login-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <h3>Login</h3>
                    <input type="text" id="login-user" placeholder="Username" style="padding: 0.8rem; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;" required>
                    <input type="password" id="login-pass" placeholder="Password" style="padding: 0.8rem; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;" required>
                    <button type="submit" class="theme-btn" style="padding: 0.8rem;">Enter</button>
                </form>

                <form id="register-form" style="display: flex; flex-direction: column; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
                    <h3>New Writer</h3>
                    <input type="text" id="reg-user" placeholder="Choose a Username" style="padding: 0.8rem; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;" required>
                    <input type="password" id="reg-pass" placeholder="Choose a Password" style="padding: 0.8rem; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;" required>
                    <button type="submit" class="theme-btn" style="padding: 0.8rem;">Register Account</button>
                </form>
                
                <p id="auth-msg" style="color: var(--accent); font-weight: bold; text-align: center; margin-top: 1rem;"></p>
            </div>
        </section>
    `
};

// Routing Logic
function router() {
    const hash = window.location.hash || '#/dashboard';
    app.innerHTML = views[hash] || `<section class="view-section"><h2>404 - Page Not Found</h2></section>`;
    
    if (hash === '#/login') {
        setupAuthListeners();
    }
}

// Handle Login & Register Requests
function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const msgBox = document.getElementById('auth-msg');

    // Handle Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-user').value;
        const password = document.getElementById('reg-pass').value;

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        msgBox.textContent = data.message || data.error;
    });

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-user').value;
        const password = document.getElementById('login-pass').value;

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        msgBox.textContent = data.message || data.error;

        if (res.ok) {
            localStorage.setItem('token', data.token); // Save the keycard
            localStorage.setItem('username', data.username);
            setTimeout(() => window.location.hash = '#/dashboard', 1500); // Send to dashboard
        }
    });
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Theme Switcher Logic (From Stage 2)
const themeBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'light') document.body.classList.add('theme-light');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
    localStorage.setItem('theme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
}); 