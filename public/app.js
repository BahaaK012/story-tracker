const app = document.getElementById('app');


const views = {
    '#/login': `
        <section class="view-section">
            <h2>Login</h2>
            <p>Authentication forms will be built in Stage 3.</p>
        </section>
    `,
    '#/dashboard': `
        <section class="view-section">
            <h2>Dashboard</h2>
            <p>Total Stories: 0</p>
            <p>Total Words: 0</p>
        </section>
    `,
    '#/stories': `
        <section class="view-section">
            <h2>Your Stories</h2>
            <p>Immersive story feed will load here.</p>
        </section>
    `
};

// routing logic
function router() {
    const hash = window.location.hash || '#/dashboard';
    
    app.innerHTML = views[hash] || `
        <section class="view-section">
            <h2>404 - Page Not Found</h2>
        </section>
    `;
}

//listeners for SPA navigation
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Theme Switcher Logic
const themeBtn = document.getElementById('theme-toggle');

// Check local storage for saved theme
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('theme-light');
}

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
    
    // Save preference so it remembers when you refresh
    if (document.body.classList.contains('theme-light')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});