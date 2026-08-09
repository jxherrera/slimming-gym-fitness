const { sql, poolPromise } = require('../config/db');
const { evaluateAccess, USER_ACTIVE } = require('../utils/accessRules');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/attendance
 * Valida el ingreso de un socio a partir de su numero de cedula y, si procede,
 * lo registra en la bitacora de asistencia.
 *
 * La decision de acceso se delega a utils/accessRules para poder probarla
 * unitariamente; aqui solo vive el acceso a datos.
 */
exports.registerAttendance = asyncHandler(async (req, res) => {
    const { idNumber } = req.body;

    if (!idNumber || !String(idNumber).trim()) {
        return res.status(400).json({
            success: false,
            accessGranted: false,
            message: 'Se requiere el número de cédula.'
        });
    }

    const cedula = String(idNumber).trim();
    const pool = await poolPromise;

    const userResult = await pool.request()
        .input('IDNumber', sql.VarChar(50), cedula)
        .input('ActiveStatus', sql.Char(1), USER_ACTIVE)
        .query(`
            SELECT UserID, RoleID, FirstName, LastName
            FROM Users
            WHERE IDNumber = @IDNumber AND Status = @ActiveStatus
        `);

    if (userResult.recordset.length === 0) {
        return res.status(404).json({
            success: false,
            accessGranted: false,
            message: 'Cédula no registrada o usuario inactivo.'
        });
    }

    const user = userResult.recordset[0];
    const memberName = `${user.FirstName} ${user.LastName}`.trim();

    const subResult = await pool.request()
        .input('UserID', sql.Int, user.UserID)
        .query(`
            SELECT TOP 1 PaymentStatus, EndDate
            FROM Subscriptions
            WHERE UserID = @UserID
            ORDER BY EndDate DESC
        `);

    const suscripcion = subResult.recordset[0] || null;
    const decision = evaluateAccess(user.RoleID, suscripcion, new Date());

    if (!decision.accessGranted) {
        return res.status(403).json({
            success: false,
            accessGranted: false,
            memberName,
            status: decision.status,
            message: `Acceso denegado: ${decision.reason}`
        });
    }

    // Solo se deja constancia en la bitacora cuando el acceso fue concedido.
    await pool.request()
        .input('UserID', sql.Int, user.UserID)
        .query('INSERT INTO Attendance (UserID) VALUES (@UserID)');

    res.json({
        success: true,
        accessGranted: true,
        memberName,
        status: decision.status,
        message: decision.reason
    });
});

/**
 * GET /api/attendance/today
 * Bitacora de ingresos del dia en curso, para la pantalla de recepcion.
 */
exports.getTodayAttendance = asyncHandler(async (req, res) => {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT a.AttendanceID, a.CheckInTime, u.FirstName, u.LastName, u.IDNumber, r.RoleName
        FROM Attendance a
        INNER JOIN Users u ON a.UserID = u.UserID
        LEFT JOIN Roles r ON u.RoleID = r.RoleID
        WHERE CAST(a.CheckInTime AS DATE) = CAST(GETDATE() AS DATE)
        ORDER BY a.CheckInTime DESC
    `);

    res.json({ success: true, attendance: result.recordset });
});
