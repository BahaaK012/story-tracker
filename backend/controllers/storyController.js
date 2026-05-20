const db = require('../database/db');

exports.getStories = (req, res) => {
    db.all(`SELECT * FROM stories`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.createStory = (req, res) => {
    const { title, genre } = req.body;
    db.run(`INSERT INTO stories (title, genre) VALUES (?, ?)`, [title, genre], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Story created', id: this.lastID });
    });
};

exports.getSingleStory = (req, res) => {
    db.get(`SELECT * FROM stories WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
};

exports.updateStory = (req, res) => {
    const { content, current_words } = req.body;
    db.run(`UPDATE stories SET content = ?, current_words = ?, last_edited = CURRENT_TIMESTAMP WHERE id = ?`,
        [content, current_words, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Saved successfully' });
    });
};