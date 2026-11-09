/**
 * Poin Routes
 */

const express = require('express');
const router = express.Router();
const poinController = require('../controllers/poinController');
const { verifikasiToken } = require('../middleware/auth');

router.use(verifikasiToken);
router.get('/', poinController.getPelanggaran);
router.post('/', poinController.createPelanggaran);

module.exports = router;

