const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const hubController = require('../controllers/hubController'); 
const auth = require('../middleware/authMiddleware');

// --- 1. HUB ROUTES ---
router.get('/:storyId/hub/characters', auth, hubController.getCharacters);
router.post('/:storyId/hub/characters', auth, hubController.addCharacter);

router.get('/:storyId/hub/lore', auth, hubController.getLore);
router.post('/:storyId/hub/lore', auth, hubController.addLore);

// --- 2. STORY ROUTES ---
router.get('/', auth, storyController.getStories);
router.post('/', auth, storyController.createStory);
router.get('/:id', auth, storyController.getSingleStory);
router.put('/:id', auth, storyController.updateStory);

module.exports = router;