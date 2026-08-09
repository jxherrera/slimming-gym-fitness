const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Registrar una evaluacion fisica: Administrador o Entrenador
router.post('/', checkRole(['Admin', 'Coach']), evaluationController.addEvaluation);

// Consultar el historial: cualquier usuario autenticado (el socio ve su progreso)
router.get('/user/:userId', evaluationController.getEvaluationHistory);

module.exports = router;
