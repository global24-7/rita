const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { login, getMe, changePassword } = require('../controllers/adminController');

router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/password', auth, changePassword);

module.exports = router;
