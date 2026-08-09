const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authMiddleware } = require('../middleware/authMiddleware');

// El socio registra el entrenamiento que acaba de completar.
router.post('/complete', authMiddleware, workoutController.completeWorkout);

module.exports = router;
