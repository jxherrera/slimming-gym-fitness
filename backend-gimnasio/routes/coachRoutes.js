const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');

router.get('/', coachController.getAllCoaches);
router.put('/:id/permissions', coachController.updatePermissions);

router.get('/assignments', coachController.getAssignments);
router.post('/:id/assign', coachController.assignMember);
router.delete('/assign/:memberId', coachController.removeAssignment);

module.exports = router;
