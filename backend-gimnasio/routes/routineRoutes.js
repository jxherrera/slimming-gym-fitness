const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const templateController = require('../controllers/templateController');

// --- RUTINAS ESTANDAR ---
router.get('/coach/:coachId/clients', routineController.getClientsByCoach);
router.get('/coach/:coachId/clients', routineController.getClientsByCoach);
router.post('/assign', routineController.assignRoutine);
router.get('/user/:userId', routineController.getUserRoutines);
router.get('/user/:userId/current', routineController.getCurrentRoutine);
router.get('/exercises/unique', routineController.getUniqueExercises);
router.get('/coach/:coachId/schedule', routineController.getCoachSchedule);

// --- CATALOGO DE EJERCICIOS ---
router.get('/catalog/exercises', templateController.getExercisesCatalog);
router.post('/catalog/exercises', templateController.createCatalogExercise);
router.put('/catalog/exercises/:id', templateController.updateCatalogExercise);
router.delete('/catalog/exercises/:id', templateController.deleteCatalogExercise);

// --- PLANTILLAS DE RUTINAS ---
router.get('/templates/all', templateController.getAllRoutineTemplates);
router.get('/templates/coach/:coachId', templateController.getRoutineTemplates);
router.get('/templates/coach/:coachId', templateController.getRoutineTemplates);
router.post('/templates', templateController.createRoutineTemplate);
router.put('/templates/:id', templateController.updateRoutineTemplate);
router.delete('/templates/:id', templateController.deleteRoutineTemplate);

module.exports = router;