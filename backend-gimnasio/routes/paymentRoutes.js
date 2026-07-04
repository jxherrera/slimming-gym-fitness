const express = require('express');
const router = express.Router();
const multer = require('multer');
const paymentController = require('../controllers/paymentController');

// Configuración de multer en memoria (memoryStorage) para pasar el buffer directo a GCS
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB
    }
});

router.get('/pending', paymentController.getPendingPayments);
router.patch('/:id/approve', paymentController.approvePayment);
router.patch('/:id/reject', paymentController.rejectPayment);

// Endpoint que permite a los socios subir sus comprobantes de pago de forma transaccional con multer
router.post('/upload', upload.single('receipt'), paymentController.uploadPayment);
router.post('/webhook', paymentController.webhookPayment);

module.exports = router;
