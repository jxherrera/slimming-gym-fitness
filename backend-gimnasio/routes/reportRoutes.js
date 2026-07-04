const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/member-pdf/:id', reportController.generateMemberPdf);

module.exports = router;
