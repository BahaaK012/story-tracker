const app = document.getElementById('app');

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) { window.location.hash = '#/login'; return null; }
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) { localStorage.removeItem('token'); window.location.hash = '#/login'; return null; }
    return res;
}

window.toggleOther = function(selectId, inputId) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);
    if (select.value === 'Other') {
        input.style.display = 'block';
        input.required = true;
    } else {
        input.style.display = 'none';
        input.required = false;
        input.value = ''; 
    }
};

async function router() {
    let hash = window.location.hash || '#/dashboard';
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
            <div style="width: 100%; max-width: 800px; margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-surface); border: 1px solid var(--border-color);">
                <h3>Start a New Story</h3>
                <form id="new-story-form" style="display: flex; gap: 1rem; margin-top: 1rem; align-items: flex-start;">
                    <input type="text" id="new-title" placeholder="Story Title" required style="flex: 2; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                    <div style="flex: 2; display: flex; flex-direction: column; gap: 0.5rem;">
                        <select id="new-genre" onchange="toggleOther('new-genre', 'new-genre-other')" style="padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                            <option value="" disabled selected>Select Genre...</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Sci-Fi">Sci-Fi</option>
                            <option value="Mystery/Thriller">Mystery/Thriller</option>
                            <option value="Romance">Romance</option>
                            <option value="Historical">Historical</option>
                            <option value="Horror">Horror</option>
                            <option value="Other">Other...</option>
                        </select>
                        <input type="text" id="new-genre-other" placeholder="Type custom genre..." style="display:none; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                    </div>
                    <button type="submit" class="theme-btn" style="flex: 1;">Create</button>
                </form>
            </div>
            <div style="width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: 1rem;">
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
                    <a href="#/hub/${story.id}" class="theme-btn" style="text-decoration: none;">Open Project Hub</a>
                </div>`;
        });
    }
    html += `</div></section>`;
    app.innerHTML = html;

    document.getElementById('new-story-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectVal = document.getElementById('new-genre').value;
        const finalGenre = selectVal === 'Other' ? document.getElementById('new-genre-other').value : selectVal;
        if(!finalGenre) return alert("Please select or type a genre.");
        await fetchWithAuth('/api/stories', { method: 'POST', body: JSON.stringify({ title: document.getElementById('new-title').value, genre: finalGenre }) });
        renderDashboard();
    });
}

// --- THE PROJECT HUB ---
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

            <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; width: 100%; max-width: 900px; overflow-x: auto;">
                <button class="theme-btn" onclick="switchTab('cast')">Characters</button>
                <button class="theme-btn" onclick="switchTab('lore')">World & Plot</button>
                <button class="theme-btn" onclick="switchTab('manuscript')">Manuscript</button>
                <button class="theme-btn" onclick="switchTab('chaos')" style="background: var(--text-main); color: var(--bg-main);">🎲 Chaos Engine</button>
            </div>

            <div id="tab-cast" class="hub-tab" style="width: 100%; max-width: 900px; display: none;">
                <h3>Character Roster</h3>
                <form id="char-form" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; margin-bottom: 2rem; background: var(--bg-surface); padding: 1.5rem; border: 1px solid var(--border-color);">
                    
                    <div style="display: flex; gap: 1rem;">
                        <input type="text" id="char-name" placeholder="Character Name" required style="flex: 2; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                        
                        <select id="char-role" style="flex: 1; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                            <option value="Protagonist">Protagonist</option>
                            <option value="Antagonist">Antagonist</option>
                            <option value="Mentor">Mentor</option>
                            <option value="Sidekick">Sidekick</option>
                            <option value="Love Interest">Love Interest</option>
                            <option value="Comic Relief">Comic Relief</option>
                            <option value="Red Shirt (Expendable)">Red Shirt</option>
                            <option value="Other">Other</option>
                        </select>
                        
                        <select id="char-status" style="flex: 1; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                            <option value="Alive">🟢 Alive</option>
                            <option value="Dead">💀 Dead</option>
                            <option value="Missing">❓ Missing</option>
                            <option value="Undead/Ghost">👻 Undead</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 1rem;">
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
                            <select id="char-trait" onchange="toggleOther('char-trait', 'char-trait-other')" style="padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                                <option value="" disabled selected>Dominant Trait...</option>
                                <option value="Brave">Brave</option>
                                <option value="Cunning">Cunning</option>
                                <option value="Loyal">Loyal</option>
                                <option value="Arrogant">Arrogant</option>
                                <option value="Cowardly">Cowardly</option>
                                <option value="Charismatic">Charismatic</option>
                                <option value="Unhinged">Unhinged</option>
                                <option value="Naïve">Naïve</option>
                                <option value="Other">Other...</option>
                            </select>
                            <input type="text" id="char-trait-other" placeholder="Type custom trait..." style="display:none; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                        </div>
                    </div>

                    <textarea id="char-desc" placeholder="Character background, secrets, or notes..." rows="3" style="padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit; resize: vertical;"></textarea>

                    <button type="submit" class="theme-btn" style="align-self: flex-start;">Add Character</button>
                </form>
                <div id="char-list" style="display: flex; flex-direction: column; gap: 1rem;"></div>
            </div>

            <div id="tab-lore" class="hub-tab" style="width: 100%; max-width: 900px; display: none;">
                <h3>World Building & Plot Notes</h3>
                <form id="lore-form" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; margin-bottom: 2rem; background: var(--bg-surface); padding: 1.5rem; border: 1px solid var(--border-color);">
                    
                    <div style="display: flex; gap: 1rem;">
                        <select id="lore-cat" onchange="toggleOther('lore-cat', 'lore-cat-other')" style="flex: 1; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                            <option value="Plot Point">Plot Point / Event</option>
                            <option value="Magic / Rules">Magic / Rules</option>
                            <option value="Politics / Factions">Politics / Factions</option>
                            <option value="History / Myth">History / Myth</option>
                            <option value="Geography / Location">Geography / Location</option>
                            <option value="Technology">Technology</option>
                            <option value="Other">Other...</option>
                        </select>
                        <input type="text" id="lore-cat-other" placeholder="Custom Category..." style="display:none; flex: 1; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                        
                        <input type="text" id="lore-title" placeholder="Title (e.g., The Fall of the Republic)" required style="flex: 2; padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit;">
                    </div>
                    
                    <textarea id="lore-content" placeholder="Dump your detailed notes here..." rows="4" required style="padding: 0.5rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit; resize: vertical;"></textarea>
                    
                    <button type="submit" class="theme-btn" style="align-self: flex-start;">Pin to Board</button>
                </form>
                <div id="lore-list" style="display: flex; flex-direction: column; gap: 1rem;"></div>
            </div>

            <div id="tab-manuscript" class="hub-tab" style="width: 100%; max-width: 900px; display: block;">
                <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
                    <button class="theme-btn" onclick="setMode('classic')" style="margin-right: 0.5rem;">Classic</button>
                    <button class="theme-btn" onclick="setMode('typewriter')">Typewriter</button>
                </div>
                <textarea id="story-content" style="width: 100%; height: 50vh; background: transparent; color: inherit; border: none; outline: none; resize: none; line-height: 1.8; font-size: inherit; font-family: inherit;" placeholder="Start drafting...">${story.content || ''}</textarea>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <span id="save-status" style="color: var(--accent);"></span>
                    <button id="save-btn" class="theme-btn">Save Draft</button>
                </div>
            </div>

            <div id="tab-chaos" class="hub-tab" style="width: 100%; max-width: 900px; display: none; text-align: center; padding: 4rem 2rem;">
                <h3 style="font-size: 2rem; margin-bottom: 1rem;">The Chaos Engine</h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Writer's block? Click the button to inject absolute chaos into your story.</p>
                <button class="theme-btn" onclick="triggerChaos()" style="padding: 1rem 2rem; font-size: 1.2rem; background: var(--text-main); color: var(--bg-main); font-weight: bold;">Generate Plot Twist</button>
                
                <div id="chaos-output" style="margin-top: 3rem; font-size: 1.5rem; font-family: 'Courier New', Courier, monospace; color: var(--accent); min-height: 100px; padding: 2rem; border: 2px dashed var(--border-color); display: none;">
                </div>
            </div>
        </section>
    `;

    // Tab Switching Logic
    window.switchTab = function(tabName) {
        document.querySelectorAll('.hub-tab').forEach(el => el.style.display = 'none');
        document.getElementById(`tab-${tabName}`).style.display = 'block';
    };

    // Load Data
    loadCharacters(storyId);
    loadLore(storyId);

    // Form Submissions: Characters
    document.getElementById('char-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectVal = document.getElementById('char-trait').value;
        const finalTrait = selectVal === 'Other' ? document.getElementById('char-trait-other').value : selectVal;
        if(!finalTrait) return alert("Please select or type a trait.");

        await fetchWithAuth(`/api/stories/${storyId}/hub/characters`, {
            method: 'POST',
            body: JSON.stringify({ 
                name: document.getElementById('char-name').value, 
                role: document.getElementById('char-role').value, 
                trait: finalTrait,
                status: document.getElementById('char-status').value,
                description: document.getElementById('char-desc').value
            })
        });
        document.getElementById('char-form').reset();
        document.getElementById('char-trait-other').style.display = 'none';
        loadCharacters(storyId);
    });

    // Form Submissions: Lore
    document.getElementById('lore-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectVal = document.getElementById('lore-cat').value;
        const finalCat = selectVal === 'Other' ? document.getElementById('lore-cat-other').value : selectVal;

        await fetchWithAuth(`/api/stories/${storyId}/hub/lore`, {
            method: 'POST',
            body: JSON.stringify({ 
                category: finalCat,
                title: document.getElementById('lore-title').value, 
                content: document.getElementById('lore-content').value 
            })
        });
        document.getElementById('lore-form').reset();
        document.getElementById('lore-cat-other').style.display = 'none';
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

// Fetchers
async function loadCharacters(storyId) {
    const res = await fetchWithAuth(`/api/stories/${storyId}/hub/characters`);
    const chars = await res.json();
    const list = document.getElementById('char-list');
    list.innerHTML = chars.map(c => `
        <div style="padding: 1rem; border-left: 3px solid ${c.status === 'Dead' ? '#ff4444' : 'var(--accent)'}; background: var(--bg-surface);">
            <div style="display: flex; justify-content: space-between;">
                <strong>${c.name}</strong> 
                <span style="font-size: 0.9rem;">${c.status}</span>
            </div>
            <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">${c.role} | Trait: ${c.trait}</div>
            ${c.description ? `<em style="font-size: 0.9rem; opacity: 0.8;">${c.description}</em>` : ''}
        </div>
    `).join('');
}

async function loadLore(storyId) {
    const res = await fetchWithAuth(`/api/stories/${storyId}/hub/lore`);
    const lore = await res.json();
    const list = document.getElementById('lore-list');
    list.innerHTML = lore.map(l => `
        <div style="padding: 1rem; border: 1px solid var(--border-color); background: var(--bg-surface);">
            <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.2rem;">${l.category}</div>
            <strong style="color: var(--accent); font-size: 1.1rem;">${l.title}</strong><br>
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 0.9rem; display: block; margin-top: 0.5rem; white-space: pre-wrap;">${l.content}</span>
        </div>
    `).join('');
}

// Editor Mode
window.setMode = function(mode) {
    const container = document.getElementById('editor-container');
    const textArea = document.getElementById('story-content');
    container.className = 'view-section';
    if (mode === 'classic') { container.classList.add('story-mode-classic'); textArea.style.fontFamily = 'var(--font-classic)'; } 
    else if (mode === 'typewriter') { container.classList.add('story-mode-typewriter'); textArea.style.fontFamily = "'Courier New', Courier, monospace"; } 
};

// CHAOS ENGINE LOGIC
window.triggerChaos = function() {
    const twists = [
        "The mentor character was secretly working for the villain the entire time.",
        "Gravity suddenly stops working, but only inside the main character's house.",
        "Your protagonist discovers they have been dead for three years.",
        "The most useless item in the protagonist's inventory is actually the key to saving the world.",
        "A portal opens and drops a very confused pizza delivery driver into the middle of the climax.",
        "The villain's evil plan is actually extremely reasonable and benefits the local economy.",
        "Every single character swaps bodies with the person they hate the most.",
        "The sacred prophecy was actually just a bad translation of a 2000-year-old grocery list.",
        "A minor background character suddenly inherits a cursed bakery and derails the plot.",
        "The ancient magical artifact requires a monthly subscription fee to work."
    ];
    const box = document.getElementById('chaos-output');
    box.style.display = 'block';
    box.innerHTML = "<em>Summoning chaos...</em>";
    
    setTimeout(() => {
        const randomTwist = twists[Math.floor(Math.random() * twists.length)];
        box.innerHTML = randomTwist;
    }, 600);
};

// Auth
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