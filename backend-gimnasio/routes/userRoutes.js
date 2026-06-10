const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/role/:roleName', userController.getUsersByRole);
router.get('/summary', userController.getDashboardSummary);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
