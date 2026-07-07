const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

router.get('/coach/:coachId/clients', routineController.getClientsByCoach);
router.get('/coach/:coachId/clients', routineController.getClientsByCoach);
router.post('/assign', routineController.assignRoutine);
router.get('/user/:userId', routineController.getUserRoutines);
router.get('/user/:userId/current', routineController.getCurrentRoutine);
router.get('/exercises/unique', routineController.getUniqueExercises);
router.get('/coach/:coachId/schedule', routineController.getCoachSchedule);

module.exports = router;