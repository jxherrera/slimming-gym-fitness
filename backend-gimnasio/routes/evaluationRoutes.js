const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { authMiddleware, checkRole, checkOwnership } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Registrar una evaluacion fisica: Administrador, Entrenador o el propio Socio
router.post('/', checkRole(['Admin', 'Coach', 'Member']), evaluationController.addEvaluation);

// Consultar el historial: cualquier usuario autenticado (el socio ve su progreso)
router.get('/user/:userId', checkOwnership, evaluationController.getEvaluationHistory);

module.exports = router;
