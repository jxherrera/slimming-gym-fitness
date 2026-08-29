const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Listado reducido (nombre y carga de trabajo), sin correos ni permisos:
// cualquier usuario autenticado. Es el que consulta el socio para elegir
// entrenador desde su perfil. Va antes de '/:id/settings' porque Express
// resuelve las rutas en orden y 'disponibles' encajaria en ':id'.
router.get('/disponibles', coachController.getAvailableCoaches);

// Entrenador asignado a quien hace la peticion, resuelto desde el token.
router.get('/mi-entrenador', coachController.getMyCoach);

// El socio elige su propio entrenador. El resto de asignaciones (sobre otros
// usuarios) siguen siendo exclusivas del administrador, mas abajo.
router.post('/mi-entrenador', coachController.chooseMyCoach);

// Lectura del listado completo y de la configuracion propia: Administrador o Entrenador
router.get('/', checkRole(['Admin', 'Coach']), coachController.getAllCoaches);
router.get('/:id/settings', checkRole(['Admin', 'Coach']), coachController.getCoachSettings);

// Gestion de permisos, asignaciones y configuracion: exclusiva del Administrador
router.put('/:id/permissions', checkRole(['Admin']), coachController.updatePermissions);
router.put('/:id/settings', checkRole(['Admin']), coachController.updateCoachSettings);

router.get('/assignments', checkRole(['Admin']), coachController.getAssignments);
router.get('/members', checkRole(['Admin']), coachController.getMembersWithCoaches);

// Socios activos sin entrenador: tambien lo consulta el entrenador desde su
// panel para reclutarlos. No expone datos de otros entrenadores.
router.get('/unassigned-members', checkRole(['Admin', 'Coach']), coachController.getUnassignedMembers);

// Alta y baja de asignaciones. El Administrador opera sobre cualquier
// entrenador; el Entrenador solo sobre si mismo y sobre sus propios alumnos,
// restriccion que verifica el controlador contra el token.
router.post('/:id/assign', checkRole(['Admin', 'Coach']), coachController.assignMember);
router.delete('/assign/:memberId', checkRole(['Admin', 'Coach']), coachController.removeAssignment);

module.exports = router;
