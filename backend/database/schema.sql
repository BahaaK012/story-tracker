-- Users Table
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stories Table
CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    content TEXT DEFAULT '', 
    status TEXT DEFAULT 'planning',
    target_words INTEGER DEFAULT 0,
    current_words INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Characters Table
CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Supporting',
    trait TEXT DEFAULT '',
    FOREIGN KEY (story_id) REFERENCES stories(id)
);

-- World & Plot Notes
CREATE TABLE IF NOT EXISTS lore (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    FOREIGN KEY (story_id) REFERENCES stories(id)
);