const express = require('express');
const cors = require('cors')
require('dotenv').config();

const routineRoutes = require('./routes/routineRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const planRoutes = require('./routes/planRoutes');
const coachRoutes = require('./routes/coachRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const classRoutes = require('./routes/classRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const reportRoutes = require('./routes/reportRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const emailRoutes = require('./routes/emailRoutes');
const { startCronJobs } = require('./cron/expirationChecker');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/routines', routineRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/coaches/schedules', scheduleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/emails', emailRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

startCronJobs();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
