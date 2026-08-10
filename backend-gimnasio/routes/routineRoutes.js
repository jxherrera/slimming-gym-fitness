const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const templateController = require('../controllers/templateController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Escritura de rutinas, catalogo y plantillas: Administrador o Entrenador
const soloPersonal = checkRole(['Admin', 'Coach']);

// --- RUTINAS ESTANDAR ---
router.get('/coach/:coachId/clients', soloPersonal, routineController.getClientsByCoach);
router.get('/coach/:coachId/schedule', soloPersonal, routineController.getCoachSchedule);
router.post('/assign', soloPersonal, routineController.assignRoutine);

// El socio adopta una plantilla publicada. No lleva soloPersonal: actua sobre
// si mismo y el controlador toma su identificador del token, nunca del cuerpo.
router.post('/aplicar-plantilla', routineController.applyTemplateToMyProfile);

// El socio consulta sus propias rutinas
router.get('/user/:userId', routineController.getUserRoutines);
router.get('/user/:userId/current', routineController.getCurrentRoutine);
router.get('/exercises/unique', routineController.getUniqueExercises);

// --- CATALOGO DE EJERCICIOS ---
router.get('/catalog/exercises', templateController.getExercisesCatalog);
router.post('/catalog/exercises', soloPersonal, templateController.createCatalogExercise);
router.put('/catalog/exercises/:id', soloPersonal, templateController.updateCatalogExercise);
router.delete('/catalog/exercises/:id', soloPersonal, templateController.deleteCatalogExercise);

// --- PLANTILLAS DE RUTINAS ---
router.get('/templates/all', templateController.getAllRoutineTemplates);
router.get('/templates/coach/:coachId', templateController.getRoutineTemplates);
router.post('/templates', soloPersonal, templateController.createRoutineTemplate);
router.put('/templates/:id', soloPersonal, templateController.updateRoutineTemplate);
router.delete('/templates/:id', soloPersonal, templateController.deleteRoutineTemplate);

module.exports = router;
