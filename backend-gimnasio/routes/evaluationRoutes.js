const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

router.get('/:userId', evaluationController.getEvaluationsByUser);
router.post('/', evaluationController.createEvaluation);
router.get('/:userId/pdf', evaluationController.generatePdf);

module.exports = router;
