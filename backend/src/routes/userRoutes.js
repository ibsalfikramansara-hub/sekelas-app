/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifikasiToken } = require('../middleware/auth');

router.use(verifikasiToken);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

module.exports = router;

