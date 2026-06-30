const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/role/:roleName', userController.getUsersByRole);
router.get('/summary', userController.getDashboardSummary);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Endpoint que permite al socio consultar el estado actual de su membresía y sus días restantes
router.get('/:id/subscription', userController.getUserSubscription);

// Endpoints para gestionar las notificaciones de los socios
router.get('/:id/notifications', userController.getUserNotifications);
router.patch('/:id/notifications/:notifId/read', userController.markNotificationRead);

// Endpoint para el historial de pagos del socio
router.get('/:id/payments', userController.getUserPayments);

module.exports = router;
