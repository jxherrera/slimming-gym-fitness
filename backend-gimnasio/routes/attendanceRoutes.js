const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// POST /api/attendance
router.post('/', attendanceController.registerAttendance);

module.exports = router;
