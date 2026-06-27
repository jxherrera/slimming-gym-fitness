const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/pending', paymentController.getPendingPayments);
router.patch('/:id/approve', paymentController.approvePayment);
router.patch('/:id/reject', paymentController.rejectPayment);

// Endpoint que permite a los socios subir sus comprobantes de pago de forma transaccional
router.post('/upload', paymentController.uploadPayment);

module.exports = router;
