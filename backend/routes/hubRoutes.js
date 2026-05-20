const express = require('express');
const router = express.Router({ mergeParams: true }); // Important for getting storyId
const hubController = require('../controllers/hubController');
const auth = require('../middleware/authMiddleware');

router.get('/characters', auth, hubController.getCharacters);
router.post('/characters', auth, hubController.addCharacter);

router.get('/lore', auth, hubController.getLore);
router.post('/lore', auth, hubController.addLore);

module.exports = router;