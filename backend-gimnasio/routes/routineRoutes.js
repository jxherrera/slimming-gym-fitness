const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

router.get('/coach/:coachId/clients', routineController.getClientsByCoach);
router.get('/coach/:coachId/clients', routineController.getClientsByCoach);
router.post('/assign', routineController.assignRoutine);

// Endpoint que permite consultar la rutina asignada al socio logueado para mostrar en su panel
router.get('/user/:userId', routineController.getUserRoutines);

module.exports = router;