const express = require('express');
const router = express.Router();
const multer = require('multer');
const paymentController = require('../controllers/paymentController');
const paypalController = require('../controllers/paypalController');
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

// --- PayPal ---
// Configuracion publica: el navegador necesita el Client ID para cargar el boton.
// Solo se expone lo publico; el secret nunca sale del servidor.
router.get('/paypal/config', paypalController.getConfig);

// Webhook de PayPal: publico por necesidad, autenticado por firma dentro del
// controlador contra la propia API de PayPal.
router.post('/paypal/webhook', paypalController.webhook);

// Creacion y cobro de la orden: exigen sesion. El importe se resuelve en el
// servidor a partir del plan, nunca se acepta del cliente.
router.post('/paypal/order', authMiddleware, paypalController.createOrder);
router.post('/paypal/capture', authMiddleware, paypalController.captureOrder);

// Cualquier usuario autenticado puede subir su comprobante de pago.
router.post('/upload', authMiddleware, upload.single('receipt'), paymentController.uploadPayment);

// La verificacion de pagos es exclusiva del Administrador.
router.get('/pending', authMiddleware, checkRole(['Admin']), paymentController.getPendingPayments);
router.get('/history', authMiddleware, checkRole(['Admin']), paymentController.getPaymentHistory);
router.patch('/:id/approve', authMiddleware, checkRole(['Admin']), paymentController.approvePayment);
router.patch('/:id/reject', authMiddleware, checkRole(['Admin']), paymentController.rejectPayment);

module.exports = router;
