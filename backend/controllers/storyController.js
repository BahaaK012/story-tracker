const storyService = require('../services/storyService');

exports.getStories = async (req, res) => {
    try {
        const stories = await storyService.getAllStories(req.user.id);
        res.json(stories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stories' });
    }
};

exports.createStory = async (req, res) => {
    try {
        const { title, genre, target_words } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const result = await storyService.createStory(
            title.trim(),
            genre || '',
            req.user.id,
            target_words || 80000
        );
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSingleStory = async (req, res) => {
    try {
        const story = await storyService.getStoryById(req.params.id, req.user.id);
        if (!story) return res.status(404).json({ error: 'Story not found' });
        res.json(story);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateStory = async (req, res) => {
    try {
        const { content, current_words, title, genre, target_words } = req.body;
        await storyService.updateStory(req.params.id, req.user.id, {
            content,
            current_words,
            title,
            genre,
            target_words
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStory = async (req, res) => {
    try {
        const changes = await storyService.deleteStory(req.params.id, req.user.id);
        if (changes === 0) return res.status(404).json({ error: 'Story not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
