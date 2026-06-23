const { sql, poolPromise } = require('../config/db');

exports.registerAttendance = async (req, res) => {
    try {
        const { idNumber } = req.body;

        if (!idNumber) {
            return res.status(400).json({ success: false, message: 'Se requiere el número de identificación (IDNumber)' });
        }

        const pool = await poolPromise;
        
        // Find user by IDNumber
        const userResult = await pool.request()
            .input('IDNumber', sql.NVarChar, idNumber)
            .query('SELECT UserID, RoleID FROM Users WHERE IDNumber = @IDNumber AND Status = \'Active\'');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado o inactivo' });
        }

        const user = userResult.recordset[0];

        // Check subscription status
        const subResult = await pool.request()
            .input('UserID', sql.Int, user.UserID)
            .query('SELECT TOP 1 PaymentStatus, EndDate FROM Subscriptions WHERE UserID = @UserID ORDER BY EndDate DESC');

        let isActive = false;
        let subscriptionStatus = 'Sin suscripción';
        
        if (subResult.recordset.length > 0) {
            const sub = subResult.recordset[0];
            subscriptionStatus = sub.PaymentStatus;
            
            // Check if end date is in the future and payment is not suspended
            const now = new Date();
            if (sub.PaymentStatus !== 'Suspended' && new Date(sub.EndDate) > now) {
                isActive = true;
            } else if (new Date(sub.EndDate) <= now) {
                subscriptionStatus = 'Vencida';
            }
        }

        // Only block access if role is member (RoleID = 1)
        if (user.RoleID === 1 && !isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'Acceso denegado. Membresía inactiva o suspendida.',
                status: subscriptionStatus,
                accessGranted: false
            });
        }

        // Register attendance
        await pool.request()
            .input('UserID', sql.Int, user.UserID)
            .query('INSERT INTO Attendance (UserID) VALUES (@UserID)');

        res.json({
            success: true,
            message: 'Acceso concedido',
            status: subscriptionStatus,
            accessGranted: true
        });

    } catch (error) {
        console.error('Error en registerAttendance:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor al registrar asistencia' });
    }
};
