const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');

router.get('/', getSettings);
router.put('/', auth, updateSettings);

module.exports = router;
