const express = require('express');
const cors = require('cors')
require('dotenv').config();

const routineRoutes = require('./routes/routineRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const planRoutes = require('./routes/planRoutes');
const coachRoutes = require('./routes/coachRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use('/api/routines', routineRoutes);
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
