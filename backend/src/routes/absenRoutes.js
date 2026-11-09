/**
 * Absen Routes
 */

const express = require('express');
const router = express.Router();
const absenController = require('../controllers/absenController');
const { verifikasiToken } = require('../middleware/auth');

router.use(verifikasiToken);
router.get('/', absenController.getAbsen);
router.post('/', absenController.saveAbsen);

module.exports = router;

