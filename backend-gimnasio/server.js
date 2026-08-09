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
const healthRoutes = require('./routes/healthRoutes');
const { startCronJobs } = require('./cron/expirationChecker');
const errorHandler = require('./middleware/errorHandler');
const { UPLOADS_DIR } = require('./services/storageService');

const app = express();

// Origenes autorizados. En produccion se definen en ALLOWED_ORIGINS (lista
// separada por comas); el valor por defecto cubre solo desarrollo local.
// Nota: si Nginx sirve el frontend y hace proxy de /api en el mismo dominio,
// el navegador no emite peticiones de otro origen y CORS deja de intervenir.
const DEV_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000'
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : DEV_ORIGINS;

const corsOptions = {
  origin: (origin, callback) => {
    // Peticiones sin cabecera Origin (Postman, cURL, mismo servidor tras el proxy)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`[CORS Bloqueado] Petición no autorizada desde el origen: ${origin}`);
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Archivos subidos (comprobantes de pago) almacenados en el disco de la VM.
// En produccion Nginx intercepta /uploads antes de llegar a Node; esta linea
// cubre el entorno de desarrollo y sirve de respaldo.
app.use('/uploads', express.static(UPLOADS_DIR, {
  index: false,          // sin listado de directorios
  dotfiles: 'deny',
  maxAge: '7d'
}));

// Sonda de estado. Publica y montada antes del resto: la consultan Docker y
// Nginx, que no disponen de token.
app.use('/api/health', healthRoutes);

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

// Las tareas programadas deben ejecutarse en UNA sola instancia. Con varias
// replicas de la API, cada una dispararia el aviso de vencimiento y los socios
// recibirian un correo por replica. En Docker Compose solo el servicio 'worker'
// lleva ENABLE_CRON=true; las replicas de 'api' lo dejan apagado.
if (process.env.ENABLE_CRON === 'true') {
    startCronJobs();
    console.log('Tareas programadas activadas en esta instancia.');
} else {
    console.log('Tareas programadas desactivadas en esta instancia (ENABLE_CRON != true).');
}

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
