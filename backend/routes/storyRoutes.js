const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const hubController = require('../controllers/hubController');
const statsController = require('../controllers/statsController');
const auth = require('../middleware/authMiddleware');

// Story CRUD
router.get('/', auth, storyController.getStories);
router.post('/', auth, storyController.createStory);
router.get('/:id', auth, storyController.getSingleStory);
router.put('/:id', auth, storyController.updateStory);
router.delete('/:id', auth, storyController.deleteStory);

// Statistics
router.get('/:id/stats', auth, statsController.getStoryStats);

// Hub routes — characters and lore per story
router.get('/:storyId/hub/characters', auth, hubController.getCharacters);
router.post('/:storyId/hub/characters', auth, hubController.addCharacter);
router.delete('/:storyId/hub/characters/:charId', auth, hubController.deleteCharacter);

router.get('/:storyId/hub/lore', auth, hubController.getLore);
router.post('/:storyId/hub/lore', auth, hubController.addLore);
router.delete('/:storyId/hub/lore/:loreId', auth, hubController.deleteLore);

module.exports = router;
