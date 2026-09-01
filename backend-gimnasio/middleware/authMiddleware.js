const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

/**
 * Verifica el token JWT enviado en la cabecera Authorization.
 * Deja el payload disponible en req.user = { userId, role }.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Acceso denegado. No se proporcionó un token válido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { userId, role, ... }
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
    }
};

/**
 * Restringe el acceso a los roles indicados. Debe aplicarse siempre despues de
 * authMiddleware, que es el que rellena req.user.
 *
 * @param {string[]} roles p.ej. ['Admin'] o ['Admin', 'Coach']
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'No tienes los permisos necesarios para realizar esta acción.' });
        }
        next();
    };
};

/**
 * Permite el acceso al propio usuario o a un Administrador.
 *
 * Impide que un socio autenticado consulte los datos de otro simplemente
 * cambiando el :id de la URL (referencia directa insegura a objetos).
 *
 * Nota: si en el futuro un Entrenador necesita leer datos de sus alumnos por
 * esta via, no basta con agregar 'Coach' aqui: hay que verificar contra
 * CoachAssignments que el alumno le corresponde.
 */
const checkOwnership = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Acceso denegado. Sesión no válida.' });
    }
    if (req.user.role === 'Admin' || String(req.user.userId) === String(req.params.id || req.params.userId)) {
        return next();
    }
    return res.status(403).json({ success: false, message: 'No puedes acceder a datos de otro usuario.' });
};

module.exports = { authMiddleware, checkRole, checkOwnership };
