const db = require('../database/db');

// Add a new Character
exports.addCharacter = (req, res) => {
    const { name, role, trait, status, description } = req.body;
    db.run(
        `INSERT INTO characters (story_id, name, role, trait, status, description) VALUES (?, ?, ?, ?, ?, ?)`,
        [req.params.storyId, name, role, trait, status, description],
        function(err) {
            if (err) return res.status(500).json({ error: 'Failed to create character.' });
            res.json({ message: 'Character saved.', id: this.lastID });
        }
    );
};

// Get Characters
exports.getCharacters = (req, res) => {
    db.all(`SELECT * FROM characters WHERE story_id = ?`, [req.params.storyId], (err, rows) => {
        res.json(rows || []);
    });
};

// Add Lore/Plot
exports.addLore = (req, res) => {
    const { category, title, content } = req.body;
    db.run(
        `INSERT INTO lore (story_id, category, title, content) VALUES (?, ?, ?, ?)`,
        [req.params.storyId, category, title, content],
        function(err) {
            if (err) return res.status(500).json({ error: 'Failed to add lore.' });
            res.json({ message: 'Lore saved.', id: this.lastID });
        }
    );
};

// Get Lore
exports.getLore = (req, res) => {
    db.all(`SELECT * FROM lore WHERE story_id = ?`, [req.params.storyId], (err, rows) => {
        res.json(rows || []);
    });
};