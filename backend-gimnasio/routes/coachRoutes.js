const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Lectura del listado y de la configuracion propia: Administrador o Entrenador
router.get('/', checkRole(['Admin', 'Coach']), coachController.getAllCoaches);
router.get('/:id/settings', checkRole(['Admin', 'Coach']), coachController.getCoachSettings);

// Gestion de permisos, asignaciones y configuracion: exclusiva del Administrador
router.put('/:id/permissions', checkRole(['Admin']), coachController.updatePermissions);
router.put('/:id/settings', checkRole(['Admin']), coachController.updateCoachSettings);

router.get('/assignments', checkRole(['Admin']), coachController.getAssignments);
router.get('/unassigned-members', checkRole(['Admin']), coachController.getUnassignedMembers);
router.get('/members', checkRole(['Admin']), coachController.getMembersWithCoaches);
router.post('/:id/assign', checkRole(['Admin']), coachController.assignMember);
router.delete('/assign/:memberId', checkRole(['Admin']), coachController.removeAssignment);

module.exports = router;
