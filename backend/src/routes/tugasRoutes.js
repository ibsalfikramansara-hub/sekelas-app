/**
 * Tugas Routes
 */

const express = require('express');
const router = express.Router();
const tugasController = require('../controllers/tugasController');
const { verifikasiToken, allowRoles } = require('../middleware/auth');

router.use(verifikasiToken);
router.get('/', tugasController.getTugas);
router.post('/', allowRoles('guru_mapel', 'wali_kelas', 'admin'), tugasController.createTugas);
router.post('/:id/submit', tugasController.submitTugas);

module.exports = router;

