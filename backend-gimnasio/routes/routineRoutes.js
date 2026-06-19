const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

router.get('/coach/:coachId/clients', routineController.getClientsByCoach);

module.exports = router;