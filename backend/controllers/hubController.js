const db = require('../database/db');

// ── Ownership helper ──────────────────────────────────────────
// Ensures the story belongs to the authenticated user before any
// character / lore operation, preventing cross-user data access.
function verifyStoryOwnership(storyId, userId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT id FROM stories WHERE id = ? AND user_id = ?`,
            [storyId, userId],
            (err, row) => {
                if (err) return reject(err);
                resolve(!!row);
            }
        );
    });
}

// ── Characters ──────────────────────────────────────────────

exports.addCharacter = async (req, res) => {
    try {
        const owned = await verifyStoryOwnership(req.params.storyId, req.user.id);
        if (!owned) return res.status(403).json({ error: 'Story not found or access denied' });

        const { name, role, trait, status, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Character name is required' });
        }
        db.run(
            `INSERT INTO characters (story_id, name, role, trait, status, description) VALUES (?, ?, ?, ?, ?, ?)`,
            [req.params.storyId, name.trim(), role || 'Supporting', trait || '', status || 'Alive', description || ''],
            function(err) {
                if (err) return res.status(500).json({ error: 'Failed to create character' });
                res.status(201).json({ message: 'Character saved.', id: this.lastID });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getCharacters = async (req, res) => {
    try {
        const owned = await verifyStoryOwnership(req.params.storyId, req.user.id);
        if (!owned) return res.status(403).json({ error: 'Story not found or access denied' });

        db.all(
            `SELECT * FROM characters WHERE story_id = ? ORDER BY name ASC`,
            [req.params.storyId],
            (err, rows) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch characters' });
                res.json(rows || []);
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteCharacter = async (req, res) => {
    try {
        const owned = await verifyStoryOwnership(req.params.storyId, req.user.id);
        if (!owned) return res.status(403).json({ error: 'Story not found or access denied' });

        db.run(
            `DELETE FROM characters WHERE id = ? AND story_id = ?`,
            [req.params.charId, req.params.storyId],
            function(err) {
                if (err) return res.status(500).json({ error: 'Failed to delete character' });
                if (this.changes === 0) return res.status(404).json({ error: 'Character not found' });
                res.json({ success: true });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// ── Lore ─────────────────────────────────────────────────────

exports.addLore = async (req, res) => {
    try {
        const owned = await verifyStoryOwnership(req.params.storyId, req.user.id);
        if (!owned) return res.status(403).json({ error: 'Story not found or access denied' });

        const { category, title, content } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Lore title is required' });
        }
        db.run(
            `INSERT INTO lore (story_id, category, title, content) VALUES (?, ?, ?, ?)`,
            [req.params.storyId, category || 'General', title.trim(), content || ''],
            function(err) {
                if (err) return res.status(500).json({ error: 'Failed to add lore' });
                res.status(201).json({ message: 'Lore saved.', id: this.lastID });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getLore = async (req, res) => {
    try {
        const owned = await verifyStoryOwnership(req.params.storyId, req.user.id);
        if (!owned) return res.status(403).json({ error: 'Story not found or access denied' });

        db.all(
            `SELECT * FROM lore WHERE story_id = ? ORDER BY category, title ASC`,
            [req.params.storyId],
            (err, rows) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch lore' });
                res.json(rows || []);
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteLore = async (req, res) => {
    try {
        const owned = await verifyStoryOwnership(req.params.storyId, req.user.id);
        if (!owned) return res.status(403).json({ error: 'Story not found or access denied' });

        db.run(
            `DELETE FROM lore WHERE id = ? AND story_id = ?`,
            [req.params.loreId, req.params.storyId],
            function(err) {
                if (err) return res.status(500).json({ error: 'Failed to delete lore' });
                if (this.changes === 0) return res.status(404).json({ error: 'Lore entry not found' });
                res.json({ success: true });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
