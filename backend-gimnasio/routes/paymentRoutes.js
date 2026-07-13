const express = require('express');
const router = express.Router();
const multer = require('multer');
const paymentController = require('../controllers/paymentController');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
});

router.get('/pending', paymentController.getPendingPayments);
router.patch('/:id/approve', paymentController.approvePayment);
router.patch('/:id/reject', paymentController.rejectPayment);

router.post('/upload', upload.single('receipt'), paymentController.uploadPayment);
router.post('/webhook', paymentController.webhookPayment);

module.exports = router;
