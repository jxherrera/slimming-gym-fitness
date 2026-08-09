const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Consulta de horarios: cualquier usuario autenticado (el socio ve disponibilidad)
router.get('/', scheduleController.getAllSchedules);
router.get('/:coachId', scheduleController.getSchedules);

// Gestion de horarios: Administrador o Entrenador
const soloPersonal = checkRole(['Admin', 'Coach']);
router.post('/', soloPersonal, scheduleController.createSchedule);
router.put('/:id', soloPersonal, scheduleController.updateSchedule);
router.delete('/:id', soloPersonal, scheduleController.deleteSchedule);

module.exports = router;
