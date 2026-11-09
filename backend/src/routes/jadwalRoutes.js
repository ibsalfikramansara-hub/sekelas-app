/**
 * Jadwal Routes
 */

const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');
const { verifikasiToken } = require('../middleware/auth');

router.use(verifikasiToken);
router.get('/pelajaran', jadwalController.getJadwalPelajaran);
router.get('/piket', jadwalController.getJadwalPiket);

module.exports = router;

