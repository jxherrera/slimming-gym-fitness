const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/pending', paymentController.getPendingPayments);
router.patch('/:id/approve', paymentController.approvePayment);
router.patch('/:id/reject', paymentController.rejectPayment);

module.exports = router;
