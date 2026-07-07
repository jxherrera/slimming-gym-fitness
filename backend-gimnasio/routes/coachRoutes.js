const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');

router.get('/', coachController.getAllCoaches);
router.put('/:id/permissions', coachController.updatePermissions);

router.get('/assignments', coachController.getAssignments);
router.get('/unassigned-members', coachController.getUnassignedMembers);
router.post('/:id/assign', coachController.assignMember);
router.delete('/assign/:memberId', coachController.removeAssignment);

// New settings & assignments endpoints for Admin panel
router.get('/members', coachController.getMembersWithCoaches);
router.get('/:id/settings', coachController.getCoachSettings);
router.put('/:id/settings', coachController.updateCoachSettings);

module.exports = router;
