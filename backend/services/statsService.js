const db = require('../database/db');

/**
 * Calculate words in a string.
 */
function countWords(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

/**
 * Calculate estimated reading time in minutes.
 * Average adult reads ~238 words per minute.
 */
function estimatedReadingTime(wordCount) {
    return Math.ceil(wordCount / 238);
}

/**
 * Calculate completion percentage (capped at 100).
 */
function completionPercent(current, target) {
    if (!target || target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
}

/**
 * Normalize a SQLite CURRENT_TIMESTAMP ("YYYY-MM-DD HH:MM:SS") to an ISO-8601
 * UTC string so JavaScript's Date constructor always treats it as UTC.
 */
function toISODate(sqliteDate) {
    if (!sqliteDate) return null;
    if (sqliteDate.includes('T')) return sqliteDate; // already ISO
    return sqliteDate.replace(' ', 'T') + 'Z';
}

/**
 * Get full statistics for a single story.
 * Word count is always derived from story.content so it matches
 * what the manuscript editor shows — never relies on the cached
 * current_words column, which could be stale.
 */
exports.getStoryStats = (storyId, userId) => {
    return new Promise((resolve, reject) => {
        // First verify ownership and get content
        db.get(
            `SELECT id, title, content, target_words,
                    strftime('%Y-%m-%dT%H:%M:%SZ', last_edited) AS last_edited
             FROM stories WHERE id = ? AND user_id = ?`,
            [storyId, userId],
            (err, story) => {
                if (err) return reject(err);
                if (!story) return reject(new Error('Story not found'));

                const totalWords = countWords(story.content);
                const targetWords = story.target_words || 80000;

                // Get chapter count
                db.get(
                    `SELECT COUNT(*) as count FROM chapters WHERE story_id = ?`,
                    [storyId],
                    (err2, chapterRow) => {
                        if (err2) return reject(err2);

                        // Get character count
                        db.get(
                            `SELECT COUNT(*) as count FROM characters WHERE story_id = ?`,
                            [storyId],
                            (err3, charRow) => {
                                if (err3) return reject(err3);

                                resolve({
                                    storyId: story.id,
                                    title: story.title,
                                    totalWordCount: totalWords,
                                    targetWordCount: targetWords,
                                    completionPercentage: completionPercent(totalWords, targetWords),
                                    chapterCount: chapterRow.count || 0,
                                    characterCount: charRow.count || 0,
                                    estimatedReadingTimeMinutes: estimatedReadingTime(totalWords),
                                    lastEdited: story.last_edited  // already ISO from strftime
                                });
                            }
                        );
                    }
                );
            }
        );
    });
};

// Export helpers for testing
exports.countWords = countWords;
exports.estimatedReadingTime = estimatedReadingTime;
exports.completionPercent = completionPercent;
