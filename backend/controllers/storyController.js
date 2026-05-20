const storyService = require('../services/storyService');

exports.getStories = async (req, res) => {
    try {
        const stories = await storyService.getAllStories(req.user.id);
        res.json(stories);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stories" });
    }
};

exports.createStory = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized" });
        const { title, genre } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });
        
        const result = await storyService.createStory(title, genre, req.user.id);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSingleStory = async (req, res) => {
    try {
        const story = await storyService.getStoryById(req.params.id, req.user.id);
        if (!story) return res.status(404).json({ error: "Story not found" });
        res.json(story);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.updateStory = async (req, res) => {
    try {
        await storyService.updateStory(req.params.id, req.user.id, req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};