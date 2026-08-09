const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Reporte PDF del socio: lo descarga el propio socio, su entrenador o el admin.
router.get('/member-pdf/:id', reportController.generateMemberPdf);

module.exports = router;
