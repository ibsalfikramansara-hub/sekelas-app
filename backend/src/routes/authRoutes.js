const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifikasiToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', verifikasiToken, authController.me);
router.post('/logout', verifikasiToken, authController.logout);

module.exports = router;