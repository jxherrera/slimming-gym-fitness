const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

router.post('/complete', workoutController.completeWorkout);

module.exports = router;
