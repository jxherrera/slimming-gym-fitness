const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.post('/send-admin', authMiddleware, checkRole(['Admin']), emailController.sendAdminEmail);
router.get('/users', authMiddleware, checkRole(['Admin']), emailController.getAllUsersForEmail);

module.exports = router;
