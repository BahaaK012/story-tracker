const db = require('../database/db');

/**
 * Recompute word count from text — canonical server-side implementation.
 * Mirrors the frontend countWords so dashboard & stats are always in sync.
 */
function countWords(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

/**
 * Normalize a SQLite CURRENT_TIMESTAMP ("YYYY-MM-DD HH:MM:SS") to a proper
 * ISO-8601 UTC string ("YYYY-MM-DDTHH:MM:SSZ") so JavaScript's Date constructor
 * always treats it as UTC, regardless of the host's local timezone.
 */
function toISODate(sqliteDate) {
    if (!sqliteDate) return null;
    if (sqliteDate.includes('T')) return sqliteDate; // already ISO
    return sqliteDate.replace(' ', 'T') + 'Z';
}

exports.getAllStories = (userId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT id, title, genre, current_words, target_words,
                    strftime('%Y-%m-%dT%H:%M:%SZ', last_edited) AS last_edited
             FROM stories WHERE user_id = ? ORDER BY last_edited DESC`,
            [userId],
            (err, rows) => {
                if (err) reject(err); else resolve(rows);
            }
        );
    });
};

exports.createStory = (title, genre, userId, targetWords) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO stories (user_id, title, genre, target_words) VALUES (?, ?, ?, ?)`;
        db.run(sql, [userId, title, genre, targetWords || 80000], function(err) {
            if (err) reject(err); else resolve({ id: this.lastID });
        });
    });
};

exports.getStoryById = (storyId, userId) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT id, user_id, title, genre, content, current_words, target_words,
                    strftime('%Y-%m-%dT%H:%M:%SZ', last_edited) AS last_edited
             FROM stories WHERE id = ? AND user_id = ?`,
            [storyId, userId],
            (err, row) => {
                if (err) reject(err); else resolve(row);
            }
        );
    });
};

exports.updateStory = (storyId, userId, data) => {
    return new Promise((resolve, reject) => {
        // Build dynamic update — only set fields that are provided
        const fields = [];
        const values = [];

        if (data.content !== undefined) {
            fields.push('content = ?');
            values.push(data.content);
            // Always recompute current_words server-side from the actual content
            // so the dashboard count and the stats count are always in sync.
            fields.push('current_words = ?');
            values.push(countWords(data.content));
        } else if (data.current_words !== undefined) {
            // Allow an explicit override only when content is not being updated
            fields.push('current_words = ?');
            values.push(data.current_words);
        }

        if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title.trim()); }
        if (data.genre !== undefined) { fields.push('genre = ?'); values.push(data.genre); }
        if (data.target_words !== undefined) { fields.push('target_words = ?'); values.push(data.target_words); }

        if (fields.length === 0) return resolve({ changes: 0 });

        fields.push('last_edited = CURRENT_TIMESTAMP');
        values.push(storyId, userId);

        db.run(
            `UPDATE stories SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
            values,
            function(err) {
                if (err) reject(err); else resolve({ changes: this.changes });
            }
        );
    });
};

exports.deleteStory = (storyId, userId) => {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM stories WHERE id = ? AND user_id = ?`,
            [storyId, userId],
            function(err) {
                if (err) reject(err); else resolve(this.changes);
            }
        );
    });
};
