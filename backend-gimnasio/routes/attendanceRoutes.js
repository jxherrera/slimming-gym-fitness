const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// El control de ingreso lo opera la recepcion desde el panel administrativo.
router.use(authMiddleware, checkRole(['Admin']));

// POST /api/attendance        -> validar y registrar el ingreso de un socio
router.post('/', attendanceController.registerAttendance);

// GET  /api/attendance/today  -> bitacora de ingresos del dia
router.get('/today', attendanceController.getTodayAttendance);

module.exports = router;
