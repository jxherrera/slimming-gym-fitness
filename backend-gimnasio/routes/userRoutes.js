const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, checkRole, checkOwnership } = require('../middleware/authMiddleware');

// Ninguna operacion sobre usuarios es publica.
router.use(authMiddleware);

// --- Gestion de usuarios: exclusiva del Administrador ---
router.get('/role/:roleName', checkRole(['Admin']), userController.getUsersByRole);
router.get('/summary', checkRole(['Admin']), userController.getDashboardSummary);
router.patch('/:id', checkRole(['Admin']), userController.updateUser);
router.delete('/:id', checkRole(['Admin']), userController.deleteUser);
router.put('/:id/activate', checkRole(['Admin']), userController.activateUser);
router.patch('/:id/password/admin', checkRole(['Admin']), userController.changePasswordByAdmin);
router.delete('/:id/hard', checkRole(['Admin']), userController.hardDeleteUser);

// --- Datos propios del usuario (o de cualquiera, si es Administrador) ---
router.patch('/:id/password', checkOwnership, userController.changeUserPassword);

// Estado actual de la membresia y dias restantes
router.get('/:id/subscription', checkOwnership, userController.getUserSubscription);

// Notificaciones del socio
router.get('/:id/notifications', checkOwnership, userController.getUserNotifications);
router.patch('/:id/notifications/:notifId/read', checkOwnership, userController.markNotificationRead);

// Historial de pagos del socio
router.get('/:id/payments', checkOwnership, userController.getUserPayments);

module.exports = router;
