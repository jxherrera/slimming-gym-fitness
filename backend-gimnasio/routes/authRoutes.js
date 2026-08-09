const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// --- Rutas publicas ---
// El registro publico crea SIEMPRE un Socio: ignora cualquier RoleID del body.
router.post('/register', authController.register);
router.post('/login', authController.login);

// Recuperacion de contrasena. Publicas por necesidad: quien las usa es
// precisamente alguien que no puede iniciar sesion.
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// --- Alta de usuarios con rol elegible: exclusivo del Administrador ---
router.post('/users', authMiddleware, checkRole(['Admin']), authController.createUserByAdmin);

module.exports = router;
