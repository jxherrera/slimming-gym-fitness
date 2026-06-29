const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

router.post('/', evaluationController.addEvaluation);
router.get('/user/:userId', evaluationController.getEvaluationHistory);

module.exports = router;