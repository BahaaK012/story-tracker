const statsService = require('../services/statsService');

exports.getStoryStats = async (req, res) => {
    try {
        const stats = await statsService.getStoryStats(req.params.id, req.user.id);
        res.json(stats);
    } catch (err) {
        if (err.message === 'Story not found') {
            return res.status(404).json({ error: 'Story not found' });
        }
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};
