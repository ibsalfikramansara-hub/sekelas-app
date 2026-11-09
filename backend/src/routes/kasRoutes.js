/**
 * Kas Routes
 */

const express = require('express');
const router = express.Router();
const kasController = require('../controllers/kasController');
const { verifikasiToken, allowRoles, allowJabatan } = require('../middleware/auth');

router.use(verifikasiToken);
router.get('/', kasController.getTransaksi);
router.post('/', kasController.createTransaksi);

module.exports = router;

