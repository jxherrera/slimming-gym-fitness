const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

router.get('/coach/:coachId/clients', routineController.getClientsByCoach);
router.get('/coach/:coachId/clients', routineController.getClientsByCoach);
router.post('/assign', routineController.assignRoutine);

module.exports = router;