const db = require('../database/db');

/**
 * Search across stories, characters, and lore for a given user.
 */
exports.search = (userId, query) => {
    return new Promise((resolve, reject) => {
        if (!query || !query.trim()) {
            return resolve({ stories: [], characters: [], lore: [] });
        }
        const q = `%${query.trim()}%`;

        const results = { stories: [], characters: [], lore: [] };

        db.all(
            `SELECT id, title, genre, current_words FROM stories 
             WHERE user_id = ? AND (title LIKE ? OR genre LIKE ? OR content LIKE ?)`,
            [userId, q, q, q],
            (err, rows) => {
                if (err) return reject(err);
                results.stories = rows || [];

                db.all(
                    `SELECT c.id, c.name, c.role, c.trait, c.status, c.story_id, s.title as story_title
                     FROM characters c
                     JOIN stories s ON c.story_id = s.id
                     WHERE s.user_id = ? AND (c.name LIKE ? OR c.description LIKE ? OR c.trait LIKE ?)`,
                    [userId, q, q, q],
                    (err2, charRows) => {
                        if (err2) return reject(err2);
                        results.characters = charRows || [];

                        db.all(
                            `SELECT l.id, l.title, l.category, l.story_id, s.title as story_title
                             FROM lore l
                             JOIN stories s ON l.story_id = s.id
                             WHERE s.user_id = ? AND (l.title LIKE ? OR l.content LIKE ? OR l.category LIKE ?)`,
                            [userId, q, q, q],
                            (err3, loreRows) => {
                                if (err3) return reject(err3);
                                results.lore = loreRows || [];
                                resolve(results);
                            }
                        );
                    }
                );
            }
        );
    });
};
