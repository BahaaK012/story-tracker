CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    genre TEXT DEFAULT '',
    content TEXT DEFAULT '',
    current_words INTEGER DEFAULT 0,
    target_words INTEGER DEFAULT 80000,
    last_edited DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    word_count INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories(id)
);

CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Supporting',
    trait TEXT DEFAULT '',
    status TEXT DEFAULT 'Alive',
    description TEXT DEFAULT '',
    FOREIGN KEY (story_id) REFERENCES stories(id)
);

CREATE TABLE IF NOT EXISTS lore (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    category TEXT DEFAULT 'General',
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    FOREIGN KEY (story_id) REFERENCES stories(id)
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories(id)
);
