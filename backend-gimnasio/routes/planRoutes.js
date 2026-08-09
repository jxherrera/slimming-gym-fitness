const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Publico: la landing page muestra los planes a visitantes sin sesion.
router.get('/', planController.getPlans);

// La administracion del catalogo es exclusiva del Administrador.
router.post('/', authMiddleware, checkRole(['Admin']), planController.createPlan);
router.put('/:id', authMiddleware, checkRole(['Admin']), planController.updatePlan);
router.delete('/:id', authMiddleware, checkRole(['Admin']), planController.deletePlan);

module.exports = router;
