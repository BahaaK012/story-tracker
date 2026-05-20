const app = document.getElementById('app');

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) { window.location.hash = '#/login'; return null; }
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) { localStorage.removeItem('token'); window.location.hash = '#/login'; return null; }
    return res;
}

async function router() {
    let hash = window.location.hash || '#/dashboard';
    
    // Fix for the 404: Both Dashboard and Stories link to the same place
    if (hash === '#/dashboard' || hash === '#/stories') return renderDashboard();
    
    if (hash.startsWith('#/hub/')) return renderHub(hash.split('/')[2]);
    if (hash === '#/login') return renderLogin();
    
    app.innerHTML = `<section class="view-section"><h2>404 - Page Not Found</h2></section>`;
}

// --- VIEWS ---
function renderLogin() { 
    app.innerHTML = `
        <section class="view-section">
            <h2>Access Your Desk</h2>
            <div style="width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 2rem;">
                <form id="login-form" style="display: flex; flex-direction: column; gap: 1rem;">
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
        </section>`;
    setupAuthListeners();
}

async function renderDashboard() {
    const res = await fetchWithAuth('/api/stories');
    if (!res) return;
    const stories = await res.json();
    const username = localStorage.getItem('username');

    let html = `
        <section class="view-section">
            <h2>${username}'s Dashboard</h2>
            <div style="width: 100%; max-width: 700px; margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-surface); border: 1px solid var(--border-color);">
                <h3>Start a New Story</h3>
                <form id="new-story-form" style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <input type="text" id="new-title" placeholder="Story Title" required style="flex: 1; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                    <input type="text" id="new-genre" placeholder="Genre" required style="flex: 1; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                    <button type="submit" class="theme-btn">Create Story</button>
                </form>
            </div>
            <div style="width: 100%; max-width: 700px; display: flex; flex-direction: column; gap: 1rem;">
                <h3>Your Projects</h3>
    `;

    if (stories.length === 0) { html += `<p>Your desk is empty. Start a new story above.</p>`; } 
    else {
        stories.forEach(story => {
            html += `
                <div style="padding: 1rem; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface);">
                    <div>
                        <h4 style="color: var(--accent); font-size: 1.2rem; margin-bottom: 0.3rem;">${story.title}</h4>
                        <small style="color: var(--text-muted);">${story.genre}</small>
                    </div>
                    <a href="#/hub/${story.id}" class="theme-btn" style="text-decoration: none;">Open Story Bible</a>
                </div>`;
        });
    }
    html += `</div></section>`;
    app.innerHTML = html;

    document.getElementById('new-story-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await fetchWithAuth('/api/stories', {
            method: 'POST',
            body: JSON.stringify({ title: document.getElementById('new-title').value, genre: document.getElementById('new-genre').value })
        });
        renderDashboard();
    });
}

// --- THE STORY BIBLE / HUB ---
async function renderHub(storyId) {
    const res = await fetchWithAuth(`/api/stories/${storyId}`);
    if (!res) return;
    const story = await res.json();

    app.innerHTML = `
        <section class="view-section" id="editor-container" style="padding-top: 2rem;">
            <div style="width: 100%; max-width: 900px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <a href="#/dashboard" style="color: var(--text-muted); text-decoration: none;">← Back to Dashboard</a>
                <h2 style="border: none; margin: 0;">${story.title}</h2>
            </div>

            <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; width: 100%; max-width: 900px;">
                <button class="theme-btn" onclick="switchTab('cast')">Characters</button>
                <button class="theme-btn" onclick="switchTab('lore')">World & Plot</button>
                <button class="theme-btn" onclick="switchTab('manuscript')">Manuscript</button>
            </div>

            <div id="tab-cast" class="hub-tab" style="width: 100%; max-width: 900px; display: none;">
                <h3>Character Roster</h3>
                <form id="char-form" style="display: flex; gap: 1rem; margin-top: 1rem; margin-bottom: 2rem;">
                    <input type="text" id="char-name" placeholder="Name" required style="flex: 1; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                    <select id="char-role" style="padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                        <option value="Protagonist">Protagonist</option>
                        <option value="Antagonist">Antagonist</option>
                        <option value="Supporting">Supporting</option>
                        <option value="Minor">Minor</option>
                    </select>
                    <input type="text" id="char-flaw" placeholder="Notes / Arc" required style="flex: 2; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                    <button type="submit" class="theme-btn">Add Character</button>
                </form>
                <div id="char-list" style="display: flex; flex-direction: column; gap: 1rem;"></div>
            </div>

            <div id="tab-lore" class="hub-tab" style="width: 100%; max-width: 900px; display: none;">
                <h3>World Building & Plot Notes</h3>
                <form id="lore-form" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; margin-bottom: 2rem;">
                    <input type="text" id="lore-title" placeholder="Topic (e.g., Magic System, Chapter 1 Outline)" required style="padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                    <textarea id="lore-content" placeholder="Add your notes here..." rows="3" required style="padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit; resize: vertical;"></textarea>
                    <button type="submit" class="theme-btn" style="align-self: flex-start;">Save Note</button>
                </form>
                <div id="lore-list" style="display: flex; flex-direction: column; gap: 1rem;"></div>
            </div>

            <div id="tab-manuscript" class="hub-tab" style="width: 100%; max-width: 900px; display: block;">
                <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
                    <button class="theme-btn" onclick="setMode('classic')">Classic</button>
                    <button class="theme-btn" onclick="setMode('typewriter')">Typewriter</button>
                    <button class="theme-btn" onclick="setMode('focus')">Dark Focus</button>
                </div>
                <textarea id="story-content" style="width: 100%; height: 50vh; background: transparent; color: inherit; border: none; outline: none; resize: none; line-height: 1.8; font-size: inherit; font-family: inherit;" placeholder="Start drafting...">${story.content || ''}</textarea>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <span id="save-status" style="color: var(--accent);"></span>
                    <button id="save-btn" class="theme-btn">Save Draft</button>
                </div>
            </div>
        </section>
    `;

    // Tab Switching Logic
    window.switchTab = function(tabName) {
        document.querySelectorAll('.hub-tab').forEach(el => el.style.display = 'none');
        document.getElementById(`tab-${tabName}`).style.display = 'block';
    };

    // Load Data for Tabs
    loadCharacters(storyId);
    loadLore(storyId);

    // Form Submissions
    document.getElementById('char-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await fetchWithAuth(`/api/stories/${storyId}/hub/characters`, {
            method: 'POST',
            body: JSON.stringify({ 
                name: document.getElementById('char-name').value, 
                role: document.getElementById('char-role').value, 
                flaw: document.getElementById('char-flaw').value 
            })
        });
        document.getElementById('char-form').reset();
        loadCharacters(storyId);
    });

    document.getElementById('lore-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await fetchWithAuth(`/api/stories/${storyId}/hub/lore`, {
            method: 'POST',
            body: JSON.stringify({ 
                title: document.getElementById('lore-title').value, 
                content: document.getElementById('lore-content').value 
            })
        });
        document.getElementById('lore-form').reset();
        loadLore(storyId);
    });

    // Manuscript Saving
    const textArea = document.getElementById('story-content');
    const saveBtn = document.getElementById('save-btn');
    const saveStatus = document.getElementById('save-status');

    if(textArea) {
        textArea.addEventListener('input', () => saveStatus.textContent = '* Unsaved changes');
        saveBtn.addEventListener('click', async () => {
            saveStatus.textContent = 'Saving...';
            await fetchWithAuth(`/api/stories/${storyId}`, {
                method: 'PUT',
                body: JSON.stringify({ content: textArea.value, current_words: textArea.value.trim() ? textArea.value.trim().split(/\s+/).length : 0 })
            });
            saveStatus.textContent = 'Saved safely.';
            setTimeout(() => saveStatus.textContent = '', 2000);
        });
    }
}

// Helper fetchers for Hub Data
async function loadCharacters(storyId) {
    const res = await fetchWithAuth(`/api/stories/${storyId}/hub/characters`);
    const chars = await res.json();
    const list = document.getElementById('char-list');
    list.innerHTML = chars.map(c => `
        <div style="padding: 1rem; border-left: 3px solid var(--accent); background: var(--bg-surface);">
            <strong>${c.name}</strong> <span style="color: var(--text-muted);">(${c.role})</span><br>
            <em>Notes: ${c.flaw}</em>
        </div>
    `).join('');
}

async function loadLore(storyId) {
    const res = await fetchWithAuth(`/api/stories/${storyId}/hub/lore`);
    const lore = await res.json();
    const list = document.getElementById('lore-list');
    list.innerHTML = lore.map(l => `
        <div style="padding: 1rem; border: 1px solid var(--border-color); background: var(--bg-surface);">
            <strong style="color: var(--accent);">${l.title}</strong><br>
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 0.9rem;">${l.content}</span>
        </div>
    `).join('');
}

window.setMode = function(mode) {
    const container = document.getElementById('editor-container');
    const textArea = document.getElementById('story-content');
    container.className = 'view-section';
    if (mode === 'classic') { container.classList.add('story-mode-classic'); textArea.style.fontFamily = 'var(--font-classic)'; } 
    else if (mode === 'typewriter') { container.classList.add('story-mode-typewriter'); textArea.style.fontFamily = "'Courier New', Courier, monospace"; } 
    else if (mode === 'focus') { container.classList.add('story-mode-focus'); textArea.style.fontFamily = 'var(--font-classic)'; }
};

// --- AUTH LOGIC ---
function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const msgBox = document.getElementById('auth-msg');

    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.getElementById('reg-user').value, password: document.getElementById('reg-pass').value }) });
            const data = await res.json();
            msgBox.textContent = data.message || data.error;
        });
    }

    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.getElementById('login-user').value, password: document.getElementById('login-pass').value }) });
            const data = await res.json();
            msgBox.textContent = data.message || data.error;
            if (res.ok) {
                localStorage.setItem('token', data.token); localStorage.setItem('username', data.username);
                setTimeout(() => window.location.hash = '#/dashboard', 500); 
            }
        });
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
const themeBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'light') document.body.classList.add('theme-light');
themeBtn.addEventListener('click', () => { document.body.classList.toggle('theme-light'); localStorage.setItem('theme', document.body.classList.contains('theme-light') ? 'light' : 'dark'); });