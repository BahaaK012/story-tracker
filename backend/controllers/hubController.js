const db = require('../database/db');

// Add a new victim (Character)
exports.addCharacter = (req, res) => {
    const { name, role, flaw } = req.body;
    db.run(
        `INSERT INTO characters (story_id, name, role, flaw) VALUES (?, ?, ?, ?)`,
        [req.params.storyId, name, role, flaw],
        function(err) {
            if (err) return res.status(500).json({ error: 'Failed to create character.' });
            res.json({ message: 'Character added to the meat grinder.', id: this.lastID });
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
    const { title, content } = req.body;
    db.run(
        `INSERT INTO lore (story_id, title, content) VALUES (?, ?, ?)`,
        [req.params.storyId, title, content],
        function(err) {
            if (err) return res.status(500).json({ error: 'Failed to add lore.' });
            res.json({ message: 'Conspiracy added.', id: this.lastID });
        }
    );
};

// Get Lore
exports.getLore = (req, res) => {
    db.all(`SELECT * FROM lore WHERE story_id = ?`, [req.params.storyId], (err, rows) => {
        res.json(rows || []);
    });
};