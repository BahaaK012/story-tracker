const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const auth = require('../middleware/authMiddleware'); // Our Security Guard

// Every route here requires the auth guard
router.get('/', auth, storyController.getStories);
router.post('/', auth, storyController.createStory);
router.get('/:id', auth, storyController.getSingleStory);
router.put('/:id', auth, storyController.updateStory);

module.exports = router;