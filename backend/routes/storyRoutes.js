const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const hubController = require('../controllers/hubController');  // ← this line must be here
const auth = require('../middleware/authMiddleware');
// Story CRUD
router.get('/', auth, storyController.getStories);
router.post('/', auth, storyController.createStory);
router.get('/:id', auth, storyController.getSingleStory);
router.put('/:id', auth, storyController.updateStory);

// Hub Routes
router.get('/:storyId/hub/characters', auth, hubController.getCharacters);
router.post('/:storyId/hub/characters', auth, hubController.addCharacter);
router.get('/:storyId/hub/lore', auth, hubController.getLore);
router.post('/:storyId/hub/lore', auth, hubController.addLore);

module.exports = router;