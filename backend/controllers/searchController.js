const searchService = require('../services/searchService');

exports.search = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || !q.trim()) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }
        const results = await searchService.search(req.user.id, q);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
};
