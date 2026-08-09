const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// La reserva de clases requiere sesion en todos los casos.
router.use(authMiddleware);

// Consulta y reserva: cualquier usuario autenticado
router.get('/', classController.getAllClasses);
router.post('/reserve', classController.reserveClass);
router.get('/user/:userId', classController.getUserReservations);
router.post('/cancel', classController.cancelReservation);

// Creacion de clases grupales: Administrador o Entrenador
router.post('/', checkRole(['Admin', 'Coach']), classController.createClass);

module.exports = router;
