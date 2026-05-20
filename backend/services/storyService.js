const db = require('../database/db');

exports.getAllStories = (userId) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM stories WHERE user_id = ?`, [userId], (err, rows) => {
            if (err) reject(err); else resolve(rows);
        });
    });
};

exports.createStory = (title, genre, userId) => {
    return new Promise((resolve, reject) => {
        // You must include the default values or columns required by your schema
        const sql = `INSERT INTO stories (user_id, title, genre, status, target_words, current_words) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(sql, [userId, title.trim(), genre, 'planning', 0, 0], function(err) {
            if (err) {
                console.error("[storyService] SQL Error:", err.message);
                reject(err);
            } else {
                resolve({ id: this.lastID });
            }
        });
    });
};
exports.getStoryById = (storyId, userId) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM stories WHERE id = ? AND user_id = ?`, [storyId, userId], (err, row) => {
            if (err) reject(err); else resolve(row);
        });
    });
};

exports.updateStory = (storyId, userId, data) => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE stories SET content = ?, current_words = ? WHERE id = ? AND user_id = ?`, 
        [data.content, data.current_words, storyId, userId], function(err) {
            if (err) reject(err); else resolve({ changes: this.changes });
        });
    });
};