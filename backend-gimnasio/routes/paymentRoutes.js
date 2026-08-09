const express = require('express');
const router = express.Router();
const multer = require('multer');
const paymentController = require('../controllers/paymentController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
});

// Publico por necesidad: lo invoca la pasarela de pagos externa, que no puede
// autenticarse con un JWT. Se valida con el secreto compartido WEBHOOK_SECRET
// dentro del propio controlador.
router.post('/webhook', paymentController.webhookPayment);

// Cualquier usuario autenticado puede subir su comprobante de pago.
router.post('/upload', authMiddleware, upload.single('receipt'), paymentController.uploadPayment);

// La verificacion de pagos es exclusiva del Administrador.
router.get('/pending', authMiddleware, checkRole(['Admin']), paymentController.getPendingPayments);
router.get('/history', authMiddleware, checkRole(['Admin']), paymentController.getPaymentHistory);
router.patch('/:id/approve', authMiddleware, checkRole(['Admin']), paymentController.approvePayment);
router.patch('/:id/reject', authMiddleware, checkRole(['Admin']), paymentController.rejectPayment);

module.exports = router;
