/* ══════════════════════════════════════════════════════════
   Story Tracker — Frontend Application
   Vanilla JS, hash-based routing, RESTful API
   ══════════════════════════════════════════════════════════ */

const app = document.getElementById('app');

// ── Utilities ───────────────────────────────────────────────

function getToken() { return localStorage.getItem('token'); }
function getUsername() { return localStorage.getItem('username'); }
function isLoggedIn() { return !!getToken(); }

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    updateNav();
    window.location.hash = '#/login';
}

function updateNav() {
    const logoutBtn = document.getElementById('nav-logout');
    const loginLink = document.getElementById('nav-login');
    if (isLoggedIn()) {
        if (logoutBtn) logoutBtn.style.display = '';
        if (loginLink) loginLink.style.display = 'none';
    } else {
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginLink) loginLink.style.display = '';
    }
}

async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (!token) { window.location.hash = '#/login'; return null; }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    try {
        const res = await fetch(url, { ...options, headers });
        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.hash = '#/login';
            return null;
        }
        return res;
    } catch (err) {
        showToast('Network error — please check your connection.', 'error');
        return null;
    }
}

function countWords(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

function formatNumber(n) {
    return n.toLocaleString();
}

/**
 * Convert a date string to a human-readable relative time.
 *
 * SQLite CURRENT_TIMESTAMP yields "YYYY-MM-DD HH:MM:SS" (no timezone).
 * The backend normalises every timestamp to ISO-8601 UTC using strftime,
 * so all values arriving from the API are "YYYY-MM-DDTHH:MM:SSZ".
 *
 * Defence-in-depth: even if a raw SQLite string arrives (no "T"),
 * we still convert it correctly:
 *   "YYYY-MM-DD HH:MM:SS"  →  replace space→T, append Z  →  UTC ISO
 *   "YYYY-MM-DDTHH:MM:SS"  →  append Z                   →  UTC ISO
 *   "YYYY-MM-DDTHH:MM:SSZ" →  use as-is                  →  UTC ISO
 */
function timeAgo(dateStr) {
    if (!dateStr) return '';

    let iso = dateStr;

    // If there is no "T" separator it is a raw SQLite "YYYY-MM-DD HH:MM:SS"
    if (!iso.includes('T')) {
        iso = iso.replace(' ', 'T') + 'Z';
    } else if (!iso.endsWith('Z') && !iso.includes('+') && !/[+-]\d{2}:\d{2}$/.test(iso)) {
        // Has T but no timezone marker — treat as UTC
        iso = iso + 'Z';
    }
    // If it ends with Z or has an explicit offset, use it as-is

    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';

    const diff = Date.now() - date.getTime();
    // Guard against small clock skew producing a slightly negative diff
    if (diff < 0) return 'just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ── Toast Notifications ──────────────────────────────────────

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed; bottom: 1.5rem; right: 1.5rem;
            display: flex; flex-direction: column; gap: 0.5rem; z-index: 9999;
        `;
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}`;
    toast.style.cssText = `max-width: 320px; box-shadow: var(--shadow); animation: fadeIn 0.2s ease;`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ── Router ───────────────────────────────────────────────────

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
    // Init theme
    if (localStorage.getItem('theme') === 'light') document.body.classList.add('theme-light');

    // Nav events
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        localStorage.setItem('theme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
    });
    document.getElementById('nav-logout').addEventListener('click', logout);

    updateNav();
    router();
});

async function router() {
    if (!isLoggedIn()) {
        updateNav();
        return renderLogin();
    }
    updateNav();
    const hash = window.location.hash || '#/dashboard';
    if (hash === '#/dashboard' || hash === '#/' || hash === '') return renderDashboard();
    if (hash === '#/search') return renderSearch();
    if (hash.startsWith('#/hub/')) return renderHub(hash.split('/')[2]);
    if (hash === '#/login') return renderLogin();
    app.innerHTML = `<section class="view-section"><h2>404</h2><p>Page not found.</p></section>`;
}

// ── Login / Register ─────────────────────────────────────────

function renderLogin() {
    app.innerHTML = `
        <section class="view-section" style="justify-content: center; max-width: 480px;">
            <h2>Writer's Desk</h2>

            <div id="auth-message"></div>

            <div class="card" style="width:100%; margin-bottom: 1.5rem;">
                <h3>Sign In</h3>
                <form id="login-form" style="display:flex; flex-direction:column; gap:0.75rem; margin-top:1rem;">
                    <input type="text" id="login-user" placeholder="Username" required autocomplete="username">
                    <input type="password" id="login-pass" placeholder="Password" required autocomplete="current-password">
                    <button type="submit" class="btn btn-primary">Enter</button>
                </form>
            </div>

            <div class="card" style="width:100%;">
                <h3>New Writer</h3>
                <form id="register-form" style="display:flex; flex-direction:column; gap:0.75rem; margin-top:1rem;">
                    <input type="text" id="reg-user" placeholder="Choose a username" required autocomplete="username">
                    <input type="password" id="reg-pass" placeholder="Password (min. 6 characters)" required autocomplete="new-password">
                    <button type="submit" class="btn btn-primary">Create Account</button>
                </form>
            </div>
        </section>`;

    const msgBox = document.getElementById('auth-message');

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.textContent = 'Signing in…'; btn.disabled = true;
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: document.getElementById('login-user').value,
                    password: document.getElementById('login-pass').value
                })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                updateNav();
                window.location.hash = '#/dashboard';
            } else {
                msgBox.innerHTML = `<div class="alert alert-error">${escHtml(data.error)}</div>`;
            }
        } catch { msgBox.innerHTML = `<div class="alert alert-error">Network error</div>`; }
        finally { btn.textContent = 'Enter'; btn.disabled = false; }
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.textContent = 'Creating…'; btn.disabled = true;
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: document.getElementById('reg-user').value,
                    password: document.getElementById('reg-pass').value
                })
            });
            const data = await res.json();
            if (res.ok) {
                msgBox.innerHTML = `<div class="alert alert-success">${escHtml(data.message)} You can now sign in.</div>`;
                document.getElementById('register-form').reset();
            } else {
                msgBox.innerHTML = `<div class="alert alert-error">${escHtml(data.error)}</div>`;
            }
        } catch { msgBox.innerHTML = `<div class="alert alert-error">Network error</div>`; }
        finally { btn.textContent = 'Create Account'; btn.disabled = false; }
    });
}

// ── Dashboard ────────────────────────────────────────────────

async function renderDashboard() {
    app.innerHTML = `<section class="view-section"><h2>${escHtml(getUsername())}'s Dashboard</h2><p style="color:var(--text-muted)">Loading…</p></section>`;

    const res = await fetchWithAuth('/api/stories');
    if (!res) return;
    const stories = await res.json();

    let statsHtml = '';
    if (stories.length > 0) {
        const totalWords = stories.reduce((s, x) => s + (x.current_words || 0), 0);
        const avgComplete = stories.length
            ? Math.round(stories.reduce((s, x) => s + Math.min(100, ((x.current_words || 0) / (x.target_words || 80000)) * 100), 0) / stories.length)
            : 0;

        statsHtml = `
            <div style="width:100%; max-width:800px; margin-bottom:2rem;">
                <h3>Overview</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-value">${stories.length}</span>
                        <div class="stat-label">Projects</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${formatNumber(totalWords)}</span>
                        <div class="stat-label">Total Words</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${avgComplete}%</span>
                        <div class="stat-label">Avg. Progress</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${Math.ceil(totalWords / 238)}</span>
                        <div class="stat-label">Est. Read Time (min)</div>
                    </div>
                </div>
            </div>`;
    }

    let storiesHtml = '';
    if (stories.length === 0) {
        storiesHtml = `<p style="color:var(--text-muted); padding: 2rem 0;">Your desk is empty. Start a story below.</p>`;
    } else {
        storiesHtml = stories.map(s => {
            const pct = Math.min(100, Math.round(((s.current_words || 0) / (s.target_words || 80000)) * 100));
            return `
                <div class="story-card">
                    <div class="story-card-info">
                        <h4>${escHtml(s.title)}</h4>
                        <div class="meta">
                            <span>${escHtml(s.genre || 'No genre')}</span>
                            <span>${formatNumber(s.current_words || 0)} / ${formatNumber(s.target_words || 80000)} words</span>
                            <span>${timeAgo(s.last_edited)}</span>
                        </div>
                        <div class="progress-wrap" style="margin-top:0.5rem; margin-bottom:0;">
                            <div class="progress-bar-track">
                                <div class="progress-bar-fill" style="width:${pct}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="story-card-actions">
                        <a href="#/hub/${s.id}" class="btn btn-primary btn-sm">Open Hub</a>
                        <button class="btn btn-danger btn-sm" onclick="deleteStory(${s.id}, '${escHtml(s.title).replace(/'/g, "\\'")}')">✕</button>
                    </div>
                </div>`;
        }).join('');
    }

    app.innerHTML = `
        <section class="view-section">
            <h2>${escHtml(getUsername())}'s Dashboard</h2>

            ${statsHtml}

            <div class="card" style="width:100%; max-width:800px; margin-bottom:2rem;">
                <h3>Start a New Story</h3>
                <form id="new-story-form" style="display:flex; gap:0.75rem; margin-top:1rem; flex-wrap:wrap; align-items:flex-end;">
                    <div style="flex:2; min-width:180px;">
                        <input type="text" id="new-title" placeholder="Story Title" required>
                    </div>
                    <div style="flex:2; min-width:140px;">
                        <select id="new-genre">
                            <option value="">No genre</option>
                            <option>Fantasy</option>
                            <option>Sci-Fi</option>
                            <option>Mystery/Thriller</option>
                            <option>Romance</option>
                            <option>Historical</option>
                            <option>Horror</option>
                            <option>Literary Fiction</option>
                        </select>
                    </div>
                    <div style="flex:1; min-width:120px;">
                        <input type="number" id="new-target" placeholder="Target words" value="80000" min="100">
                    </div>
                    <button type="submit" class="btn btn-primary" style="flex-shrink:0;">Create</button>
                </form>
            </div>

            <div style="width:100%; max-width:800px; display:flex; flex-direction:column; gap:0.75rem;">
                <h3>Your Projects</h3>
                ${storiesHtml}
            </div>
        </section>`;

    document.getElementById('new-story-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Creating…';
        const res = await fetchWithAuth('/api/stories', {
            method: 'POST',
            body: JSON.stringify({
                title: document.getElementById('new-title').value,
                genre: document.getElementById('new-genre').value,
                target_words: parseInt(document.getElementById('new-target').value) || 80000
            })
        });
        btn.disabled = false; btn.textContent = 'Create';
        if (res && res.ok) { showToast('Story created!', 'success'); renderDashboard(); }
        else if (res) { const d = await res.json(); showToast(d.error || 'Failed to create story', 'error'); }
    });
}

window.deleteStory = async function(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetchWithAuth(`/api/stories/${id}`, { method: 'DELETE' });
    if (res && res.ok) { showToast('Story deleted.', 'success'); renderDashboard(); }
    else showToast('Failed to delete story.', 'error');
};

// ── Search ───────────────────────────────────────────────────

async function renderSearch() {
    app.innerHTML = `
        <section class="view-section">
            <h2>Search</h2>
            <div class="search-bar">
                <input type="text" id="search-input" placeholder="Search stories, characters, lore…" autofocus>
                <button class="btn btn-primary" onclick="runSearch()">Search</button>
            </div>
            <div id="search-results" style="width:100%;"></div>
        </section>`;

    document.getElementById('search-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runSearch();
    });
}

window.runSearch = async function() {
    const q = document.getElementById('search-input').value.trim();
    if (!q) return;
    const resultsEl = document.getElementById('search-results');
    resultsEl.innerHTML = `<p style="color:var(--text-muted)">Searching…</p>`;
    const res = await fetchWithAuth(`/api/search?q=${encodeURIComponent(q)}`);
    if (!res) return;
    const data = await res.json();
    if (data.error) { resultsEl.innerHTML = `<div class="alert alert-error">${escHtml(data.error)}</div>`; return; }

    const total = data.stories.length + data.characters.length + data.lore.length;
    if (total === 0) {
        resultsEl.innerHTML = `<p style="color:var(--text-muted)">No results for "<strong>${escHtml(q)}</strong>".</p>`;
        return;
    }

    let html = `<p style="color:var(--text-muted); margin-bottom:1rem;">${total} result${total !== 1 ? 's' : ''} for "<strong>${escHtml(q)}</strong>"</p>`;

    if (data.stories.length) {
        html += `<div class="search-result-section"><h4>Stories (${data.stories.length})</h4>`;
        html += data.stories.map(s => `
            <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
                <div><strong style="color:var(--accent)">${escHtml(s.title)}</strong> <span style="color:var(--text-muted); font-size:0.85rem;">${escHtml(s.genre || '')}</span></div>
                <a href="#/hub/${s.id}" class="btn btn-sm">Open</a>
            </div>`).join('');
        html += `</div>`;
    }

    if (data.characters.length) {
        html += `<div class="search-result-section"><h4>Characters (${data.characters.length})</h4>`;
        html += data.characters.map(c => `
            <div class="card" style="margin-bottom:0.5rem;">
                <strong>${escHtml(c.name)}</strong>
                <span class="badge" style="margin-left:0.5rem;">${escHtml(c.role)}</span>
                <div style="font-size:0.82rem; color:var(--text-muted);">in <a href="#/hub/${c.story_id}" style="color:var(--accent);">${escHtml(c.story_title)}</a></div>
            </div>`).join('');
        html += `</div>`;
    }

    if (data.lore.length) {
        html += `<div class="search-result-section"><h4>Lore (${data.lore.length})</h4>`;
        html += data.lore.map(l => `
            <div class="card" style="margin-bottom:0.5rem;">
                <div class="lore-category">${escHtml(l.category)}</div>
                <strong>${escHtml(l.title)}</strong>
                <div style="font-size:0.82rem; color:var(--text-muted);">in <a href="#/hub/${l.story_id}" style="color:var(--accent);">${escHtml(l.story_title)}</a></div>
            </div>`).join('');
        html += `</div>`;
    }

    resultsEl.innerHTML = html;
};

// ── Project Hub ───────────────────────────────────────────────

async function renderHub(storyId) {
    const res = await fetchWithAuth(`/api/stories/${storyId}`);
    if (!res) return;
    if (!res.ok) {
        app.innerHTML = `<section class="view-section"><h2>Story not found</h2><a href="#/dashboard" class="btn">← Back</a></section>`;
        return;
    }
    const story = await res.json();

    app.innerHTML = `
        <section class="view-section" id="editor-container">
            <div style="display:flex; align-items:center; justify-content:space-between; width:100%; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
                <div>
                    <a href="#/dashboard" style="font-size:0.85rem; color:var(--text-muted); text-decoration:none;">← Dashboard</a>
                    <h2 style="margin-bottom:0; border:none; padding:0;">${escHtml(story.title)}</h2>
                    <p style="color:var(--text-muted); font-size:0.85rem;">${escHtml(story.genre || 'No genre')}</p>
                </div>
            </div>

            <div class="tab-bar">
                <button class="tab-btn active" onclick="switchTab('stats', this)">📊 Stats</button>
                <button class="tab-btn" onclick="switchTab('manuscript', this)">✏ Manuscript</button>
                <button class="tab-btn" onclick="switchTab('characters', this)">👤 Characters</button>
                <button class="tab-btn" onclick="switchTab('lore', this)">📚 Lore</button>
                <button class="tab-btn" onclick="switchTab('chaos', this)">🎲 Chaos Engine</button>
            </div>

            <!-- Stats Tab -->
            <div id="tab-stats" class="hub-tab" style="width:100%;">
                <div id="stats-content"><p style="color:var(--text-muted)">Loading stats…</p></div>
            </div>

            <!-- Manuscript Tab -->
            <div id="tab-manuscript" class="hub-tab" style="width:100%; display:none;">
                <div style="display:flex; gap:0.5rem; margin-bottom:1rem; align-items:center; flex-wrap:wrap;">
                    <button class="btn btn-sm" onclick="setMode('classic')">Classic</button>
                    <button class="btn btn-sm" onclick="setMode('typewriter')">Typewriter</button>
                    <span id="word-count-live" style="color:var(--text-muted); font-size:0.85rem; margin-left:auto;"></span>
                </div>
                <textarea class="editor-area" id="story-content" placeholder="Start drafting…"></textarea>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                    <span id="save-status" style="color:var(--text-muted); font-size:0.85rem;"></span>
                    <button id="save-btn" class="btn btn-primary">Save Draft</button>
                </div>
            </div>

            <!-- Characters Tab -->
            <div id="tab-characters" class="hub-tab" style="width:100%; display:none;">
                <form id="char-form" class="card" style="margin-bottom:1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
                    <h3 style="margin:0;">Add Character</h3>
                    <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                        <input type="text" id="char-name" placeholder="Name" required style="flex:2; min-width:140px;">
                        <select id="char-role" style="flex:1; min-width:120px;">
                            <option>Protagonist</option>
                            <option selected>Supporting</option>
                            <option>Antagonist</option>
                            <option>Mentor</option>
                            <option>Comic Relief</option>
                        </select>
                        <select id="char-status" style="flex:1; min-width:100px;">
                            <option selected>Alive</option>
                            <option>Dead</option>
                            <option>Unknown</option>
                        </select>
                    </div>
                    <input type="text" id="char-trait" placeholder="Core trait (e.g. Brave, Cunning, Loyal…)">
                    <textarea id="char-desc" placeholder="Brief description or notes…" rows="2" style="resize:vertical;"></textarea>
                    <button type="submit" class="btn btn-primary" style="align-self:flex-start;">Add Character</button>
                </form>
                <div id="char-list" style="display:flex; flex-direction:column; gap:0.6rem;"></div>
            </div>

            <!-- Lore Tab -->
            <div id="tab-lore" class="hub-tab" style="width:100%; display:none;">
                <form id="lore-form" class="card" style="margin-bottom:1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
                    <h3 style="margin:0;">Pin Lore Entry</h3>
                    <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                        <select id="lore-cat" style="flex:1; min-width:130px;">
                            <option>General</option>
                            <option>World Building</option>
                            <option>Magic System</option>
                            <option>History</option>
                            <option>Faction</option>
                            <option>Location</option>
                            <option>Plot Thread</option>
                        </select>
                        <input type="text" id="lore-title" placeholder="Entry title" required style="flex:3; min-width:180px;">
                    </div>
                    <textarea id="lore-content" placeholder="Your notes…" rows="3" style="resize:vertical;"></textarea>
                    <button type="submit" class="btn btn-primary" style="align-self:flex-start;">Pin to Board</button>
                </form>
                <div id="lore-list" style="display:flex; flex-direction:column; gap:0.6rem;"></div>
            </div>

            <!-- Chaos Tab -->
            <div id="tab-chaos" class="hub-tab" style="width:100%; display:none; text-align:center; padding:3rem 1rem;">
                <h3 style="font-size:1.8rem; margin-bottom:0.75rem;">The Chaos Engine</h3>
                <p style="color:var(--text-muted); margin-bottom:2rem;">Stuck? Let fate decide your next plot twist.</p>
                <button class="btn btn-primary" onclick="triggerChaos()" style="font-size:1.1rem; padding:0.75rem 2rem;">Generate Plot Twist</button>
                <div id="chaos-output" style="display:none; margin-top:2.5rem; font-size:1.3rem; font-family:var(--font-mono); color:var(--accent); padding:1.5rem; border:2px dashed var(--border); border-radius:var(--radius);"></div>
            </div>
        </section>`;

    // ── Set textarea content safely (avoids HTML-encoding artefacts) ──
    document.getElementById('story-content').value = story.content || '';

    // ── Tab switching ──
    window.switchTab = function(tabName, btn) {
        document.querySelectorAll('.hub-tab').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).style.display = 'block';
        if (btn) btn.classList.add('active');
    };

    // ── Load stats ──
    loadStats(storyId);

    // ── Load lists ──
    loadCharacters(storyId);
    loadLore(storyId);

    // ── Manuscript ──
    const textArea = document.getElementById('story-content');
    const saveBtn = document.getElementById('save-btn');
    const saveStatus = document.getElementById('save-status');
    const wordCountLive = document.getElementById('word-count-live');

    function updateWordCount() {
        const wc = countWords(textArea.value);
        const target = story.target_words || 80000;
        wordCountLive.textContent = `${formatNumber(wc)} / ${formatNumber(target)} words`;
    }
    updateWordCount();

    textArea.addEventListener('input', () => {
        saveStatus.textContent = '· Unsaved';
        updateWordCount();
    });

    saveBtn.addEventListener('click', async () => {
        saveStatus.textContent = 'Saving…';
        saveBtn.disabled = true;
        const content = textArea.value;
        const wc = countWords(content);
        const saveRes = await fetchWithAuth(`/api/stories/${storyId}`, {
            method: 'PUT',
            body: JSON.stringify({ content, current_words: wc })
        });
        saveBtn.disabled = false;
        if (saveRes && saveRes.ok) {
            saveStatus.textContent = 'Saved ✓';
            // Keep local story object in sync so stats are consistent
            story.current_words = wc;
            story.content = content;
            // Refresh the Stats tab so its word count matches the saved content
            loadStats(storyId);
            setTimeout(() => { saveStatus.textContent = ''; }, 2500);
        } else {
            saveStatus.textContent = 'Save failed.';
        }
    });

    // ── Characters ──
    document.getElementById('char-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('[type="submit"]');
        btn.disabled = true;
        const charRes = await fetchWithAuth(`/api/stories/${storyId}/hub/characters`, {
            method: 'POST',
            body: JSON.stringify({
                name: document.getElementById('char-name').value,
                role: document.getElementById('char-role').value,
                status: document.getElementById('char-status').value,
                trait: document.getElementById('char-trait').value,
                description: document.getElementById('char-desc').value
            })
        });
        btn.disabled = false;
        if (charRes && charRes.ok) {
            e.target.reset();
            loadCharacters(storyId);
            showToast('Character added.', 'success');
        } else {
            const errData = charRes ? await charRes.json().catch(() => ({})) : {};
            showToast(errData.error || 'Failed to add character.', 'error');
        }
    });

    // ── Lore ──
    document.getElementById('lore-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('[type="submit"]');
        btn.disabled = true;
        const loreRes = await fetchWithAuth(`/api/stories/${storyId}/hub/lore`, {
            method: 'POST',
            body: JSON.stringify({
                category: document.getElementById('lore-cat').value,
                title: document.getElementById('lore-title').value,
                content: document.getElementById('lore-content').value
            })
        });
        btn.disabled = false;
        if (loreRes && loreRes.ok) {
            e.target.reset();
            loadLore(storyId);
            showToast('Lore pinned.', 'success');
        } else {
            const errData = loreRes ? await loreRes.json().catch(() => ({})) : {};
            showToast(errData.error || 'Failed to save lore.', 'error');
        }
    });
}

// ── Stats loader ─────────────────────────────────────────────

async function loadStats(storyId) {
    const statsEl = document.getElementById('stats-content');
    if (!statsEl) return; // tab may not be in DOM if user navigated away
    const res = await fetchWithAuth(`/api/stories/${storyId}/stats`);
    if (!res || !res.ok) {
        statsEl.innerHTML = `<div class="alert alert-error">Failed to load stats.</div>`;
        return;
    }
    const s = await res.json();
    const pct = s.completionPercentage;

    statsEl.innerHTML = `
        <div class="stats-grid" style="margin-bottom:1.5rem;">
            <div class="stat-card">
                <span class="stat-value">${formatNumber(s.totalWordCount)}</span>
                <div class="stat-label">Words Written</div>
            </div>
            <div class="stat-card">
                <span class="stat-value">${pct}%</span>
                <div class="stat-label">Complete</div>
            </div>
            <div class="stat-card">
                <span class="stat-value">${s.characterCount}</span>
                <div class="stat-label">Characters</div>
            </div>
            <div class="stat-card">
                <span class="stat-value">${s.estimatedReadingTimeMinutes}</span>
                <div class="stat-label">Min to Read</div>
            </div>
        </div>
        <div class="progress-wrap">
            <div class="progress-label">
                <span>Progress to target (${formatNumber(s.targetWordCount)} words)</span>
                <span>${pct}%</span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width:${pct}%"></div>
            </div>
        </div>
        <p style="color:var(--text-muted); font-size:0.85rem;">
            ${formatNumber(Math.max(0, s.targetWordCount - s.totalWordCount))} words remaining
            · Last edited ${timeAgo(s.lastEdited)}
        </p>`;
}

// ── Characters loader ─────────────────────────────────────────

async function loadCharacters(storyId) {
    const res = await fetchWithAuth(`/api/stories/${storyId}/hub/characters`);
    if (!res) return;
    const chars = await res.json();
    const list = document.getElementById('char-list');
    if (!list) return;
    if (!chars.length) { list.innerHTML = `<p style="color:var(--text-muted)">No characters yet.</p>`; return; }
    list.innerHTML = chars.map(c => `
        <div class="char-card ${c.status === 'Dead' ? 'dead' : ''}">
            <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">
                    <strong>${escHtml(c.name)}</strong>
                    <span class="badge ${c.status === 'Dead' ? 'badge-danger' : 'badge-success'}">${escHtml(c.status)}</span>
                    <span class="badge">${escHtml(c.role)}</span>
                </div>
                ${c.trait ? `<div style="color:var(--text-muted); font-size:0.85rem;">Trait: ${escHtml(c.trait)}</div>` : ''}
                ${c.description ? `<div style="font-size:0.88rem; margin-top:0.3rem;">${escHtml(c.description)}</div>` : ''}
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteCharacter(${storyId}, ${c.id})">✕</button>
        </div>`).join('');
}

window.deleteCharacter = async function(storyId, charId) {
    if (!confirm('Delete this character?')) return;
    const res = await fetchWithAuth(`/api/stories/${storyId}/hub/characters/${charId}`, { method: 'DELETE' });
    if (res && res.ok) {
        loadCharacters(storyId);
        // Refresh stats since character count changed
        loadStats(storyId);
        showToast('Character removed.', 'success');
    } else {
        showToast('Failed to delete.', 'error');
    }
};

// ── Lore loader ───────────────────────────────────────────────

async function loadLore(storyId) {
    const res = await fetchWithAuth(`/api/stories/${storyId}/hub/lore`);
    if (!res) return;
    const lore = await res.json();
    const list = document.getElementById('lore-list');
    if (!list) return;
    if (!lore.length) { list.innerHTML = `<p style="color:var(--text-muted)">No lore pinned yet.</p>`; return; }
    list.innerHTML = lore.map(l => `
        <div class="lore-card" style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="flex:1;">
                <div class="lore-category">${escHtml(l.category)}</div>
                <strong style="color:var(--accent);">${escHtml(l.title)}</strong>
                ${l.content ? `<p style="font-family:var(--font-mono); font-size:0.88rem; margin-top:0.4rem; white-space:pre-wrap;">${escHtml(l.content)}</p>` : ''}
            </div>
            <button class="btn btn-danger btn-sm" style="margin-left:0.5rem;" onclick="deleteLore(${storyId}, ${l.id})">✕</button>
        </div>`).join('');
}

window.deleteLore = async function(storyId, loreId) {
    if (!confirm('Delete this lore entry?')) return;
    const res = await fetchWithAuth(`/api/stories/${storyId}/hub/lore/${loreId}`, { method: 'DELETE' });
    if (res && res.ok) { loadLore(storyId); showToast('Lore removed.', 'success'); }
    else showToast('Failed to delete.', 'error');
};

// ── Editor mode ───────────────────────────────────────────────

window.setMode = function(mode) {
    const container = document.getElementById('editor-container');
    container.className = 'view-section';
    if (mode === 'classic') container.classList.add('story-mode-classic');
    else if (mode === 'typewriter') container.classList.add('story-mode-typewriter');
};

// ── Chaos Engine ──────────────────────────────────────────────

window.triggerChaos = function() {
    const twists = [
        "The mentor was working for the villain the entire time.",
        "Gravity stops working — but only inside the protagonist's house.",
        "Your hero discovers they've been dead for three years.",
        "The most useless item in the inventory is the key to saving the world.",
        "A portal drops a very confused pizza delivery driver into the climax.",
        "The villain's plan is actually extremely reasonable and benefits the local economy.",
        "Every character swaps bodies with the person they hate most.",
        "The sacred prophecy was a bad translation of a 2,000-year-old grocery list.",
        "A minor background character inherits a cursed bakery and derails the plot.",
        "The ancient artifact requires a monthly subscription fee to work.",
        "The map has been upside down the entire quest.",
        "The love interest is actually the protagonist's long-lost twin.",
        "The dragon turns out to be the chosen one, not the hero.",
        "Time is moving backwards, but only in the library."
    ];
    const box = document.getElementById('chaos-output');
    box.style.display = 'block';
    box.textContent = 'Summoning chaos…';
    setTimeout(() => {
        box.textContent = twists[Math.floor(Math.random() * twists.length)];
    }, 500);
};

// ── XSS safe string ──────────────────────────────────────────

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
