const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const hubController = require('../controllers/hubController'); // <-- Brought the Hub in!
const auth = require('../middleware/authMiddleware');

// --- Original Story Routes ---
router.get('/', auth, storyController.getStories);
router.post('/', auth, storyController.createStory);
router.get('/:id', auth, storyController.getSingleStory);
router.put('/:id', auth, storyController.updateStory);

// --- NEW Hub Routes (Bypassing server.js!) ---
router.get('/:storyId/hub/characters', auth, hubController.getCharacters);
router.post('/:storyId/hub/characters', auth, hubController.addCharacter);

router.get('/:storyId/hub/lore', auth, hubController.getLore);
router.post('/:storyId/hub/lore', auth, hubController.addLore);

module.exports = router;