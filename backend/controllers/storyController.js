const db = require('../database/db');

// Get all stories for the logged-in user
exports.getStories = (req, res) => {
    db.all(`SELECT * FROM stories WHERE user_id = ?`, [req.user.id], (err, stories) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        res.json(stories);
    });
};

// Create a new story
exports.createStory = (req, res) => {
    const { title, genre } = req.body;
    db.run(
        `INSERT INTO stories (user_id, title, genre) VALUES (?, ?, ?)`,
        [req.user.id, title, genre],
        function(err) {
            if (err) return res.status(500).json({ error: 'Could not create story.' });
            res.status(201).json({ message: 'Story created!', id: this.lastID });
        }
    );
};

// Update story content and words
exports.updateStory = (req, res) => {
    const { content, current_words } = req.body;
    db.run(
        `UPDATE stories SET content = ?, current_words = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
        [content, current_words, req.params.id, req.user.id],
        function(err) {
            if (err) return res.status(500).json({ error: 'Could not save story.' });
            res.json({ message: 'Story saved safely.' });
        }
    );
};

// Get a single story's content
exports.getSingleStory = (req, res) => {
    db.get(`SELECT * FROM stories WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, story) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        if (!story) return res.status(404).json({ error: 'Story not found.' });
        res.json(story);
    });
};