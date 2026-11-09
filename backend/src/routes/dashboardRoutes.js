const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifikasiToken } = require('../middleware/auth');

router.get('/stats', verifikasiToken, dashboardController.getStats);

module.exports = router;