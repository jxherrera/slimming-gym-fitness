const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

router.get('/', classController.getAllClasses);
router.post('/', classController.createClass);
router.post('/reserve', classController.reserveClass);
router.get('/user/:userId', classController.getUserReservations);
router.post('/cancel', classController.cancelReservation);

module.exports = router;
