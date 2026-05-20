const app = document.getElementById('app');

// Reusable function to make API requests with our Token
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.hash = '#/login';
        return null;
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
        return null;
    }
    return res;
}

// Routing Logic
async function router() {
    let hash = window.location.hash || '#/dashboard';
    
    // Handle dynamic route for the editor
    if (hash.startsWith('#/editor/')) {
        const storyId = hash.split('/')[2];
        await renderEditor(storyId);
        return;
    }

    if (hash === '#/dashboard') {
        await renderDashboard();
    } else if (hash === '#/login') {
        renderLogin();
    } else {
        app.innerHTML = `<section class="view-section"><h2>404 - Page Not Found</h2></section>`;
    }
}

// --- RENDER FUNCTIONS ---
function renderLogin() {
    app.innerHTML = `
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
    `;
    setupAuthListeners();
}

async function renderDashboard() {
    const res = await fetchWithAuth('/api/stories');
    if (!res) return; // User isn't logged in
    
    const stories = await res.json();
    const username = localStorage.getItem('username');

    let html = `
        <section class="view-section">
            <h2>${username}'s Desk</h2>
            
            <div style="width: 100%; max-width: 700px; margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-surface); border: 1px solid var(--border-color);">
                <h3>Start a New Story</h3>
                <form id="new-story-form" style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <input type="text" id="new-title" placeholder="Story Title" required style="flex: 1; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                    <input type="text" id="new-genre" placeholder="Genre" required style="flex: 1; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                    <button type="submit" class="theme-btn">Create</button>
                </form>
            </div>

            <div style="width: 100%; max-width: 700px; display: flex; flex-direction: column; gap: 1rem;">
                <h3>Your Manuscripts</h3>
    `;

    if (stories.length === 0) {
        html += `<p>Your desk is empty. Start writing above.</p>`;
    } else {
        stories.forEach(story => {
            html += `
                <div style="padding: 1rem; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface);">
                    <div>
                        <h4 style="color: var(--accent); font-size: 1.2rem; margin-bottom: 0.3rem;">${story.title}</h4>
                        <small style="color: var(--text-muted);">${story.genre} | ${story.current_words} words</small>
                    </div>
                    <a href="#/editor/${story.id}" class="theme-btn" style="text-decoration: none;">Write</a>
                </div>
            `;
        });
    }

    html += `</div></section>`;
    app.innerHTML = html;

    // Handle New Story Creation
    document.getElementById('new-story-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('new-title').value;
        const genre = document.getElementById('new-genre').value;
        
        await fetchWithAuth('/api/stories', {
            method: 'POST',
            body: JSON.stringify({ title, genre })
        });
        renderDashboard(); // Refresh the list
    });
}

async function renderEditor(storyId) {
    const res = await fetchWithAuth(`/api/stories/${storyId}`);
    if (!res) return;
    const story = await res.json();

    app.innerHTML = `
        <section class="view-section" id="editor-container" style="padding-top: 2rem;">
            
            <div style="width: 100%; max-width: 900px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <a href="#/dashboard" style="color: var(--text-muted); text-decoration: none;">← Back to Desk</a>
                <div>
                    <span style="margin-right: 1rem;">Mode:</span>
                    <button class="theme-btn" onclick="setMode('classic')">Classic</button>
                    <button class="theme-btn" onclick="setMode('typewriter')">Typewriter</button>
                    <button class="theme-btn" onclick="setMode('focus')">Dark Focus</button>
                </div>
            </div>

            <h2 style="border-bottom: none; margin-bottom: 0;">${story.title}</h2>
            <div style="color: var(--text-muted); margin-bottom: 2rem;">
                Words: <span id="word-count">${story.current_words}</span> 
                <span id="save-status" style="margin-left: 1rem; color: var(--accent);"></span>
            </div>

            <textarea id="story-content" style="width: 100%; height: 60vh; background: transparent; color: inherit; border: none; outline: none; resize: none; line-height: 1.8; font-size: inherit; font-family: inherit;" placeholder="Begin your story...">${story.content || ''}</textarea>
            
            <button id="save-btn" class="theme-btn" style="margin-top: 1rem;">Save Manuscript</button>
        </section>
    `;

    const textArea = document.getElementById('story-content');
    const wordCountSpan = document.getElementById('word-count');
    const saveBtn = document.getElementById('save-btn');
    const saveStatus = document.getElementById('save-status');

    // Live word count
    textArea.addEventListener('input', () => {
        const text = textArea.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        wordCountSpan.textContent = words;
        saveStatus.textContent = '* Unsaved changes';
    });

    // Save functionality
    saveBtn.addEventListener('click', async () => {
        saveStatus.textContent = 'Saving...';
        const words = wordCountSpan.textContent;
        await fetchWithAuth(`/api/stories/${storyId}`, {
            method: 'PUT',
            body: JSON.stringify({ content: textArea.value, current_words: parseInt(words) })
        });
        saveStatus.textContent = 'Saved safely.';
        setTimeout(() => saveStatus.textContent = '', 2000);
    });
}

// Global function to switch writing modes
window.setMode = function(mode) {
    const container = document.getElementById('editor-container');
    const textArea = document.getElementById('story-content');
    
    // Reset classes
    container.className = 'view-section';
    
    if (mode === 'classic') {
        container.classList.add('story-mode-classic');
        textArea.style.fontFamily = 'var(--font-classic)';
    } else if (mode === 'typewriter') {
        container.classList.add('story-mode-typewriter');
        textArea.style.fontFamily = "'Courier New', Courier, monospace";
    } else if (mode === 'focus') {
        container.classList.add('story-mode-focus');
        textArea.style.fontFamily = 'var(--font-classic)';
    }
};

// --- AUTH LOGIC ---
function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const msgBox = document.getElementById('auth-msg');

    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: document.getElementById('reg-user').value, 
                    password: document.getElementById('reg-pass').value 
                })
            });
            const data = await res.json();
            msgBox.textContent = data.message || data.error;
        });
    }

    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: document.getElementById('login-user').value, 
                    password: document.getElementById('login-pass').value 
                })
            });
            const data = await res.json();
            msgBox.textContent = data.message || data.error;

            if (res.ok) {
                localStorage.setItem('token', data.token); 
                localStorage.setItem('username', data.username);
                setTimeout(() => window.location.hash = '#/dashboard', 500); 
            }
        });
    }
}

// Initialize App
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Theme Switcher Logic
const themeBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'light') document.body.classList.add('theme-light');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
    localStorage.setItem('theme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
});