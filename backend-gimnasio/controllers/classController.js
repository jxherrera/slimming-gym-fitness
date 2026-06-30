const { sql, poolPromise } = require('../config/db');

exports.getAllClasses = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT c.ClassID, c.ClassName, c.Description, c.MaxCapacity, c.StartTime, c.EndTime,
                   c.CoachID, u.FirstName + ' ' + u.LastName AS CoachName,
                   (SELECT COUNT(*) FROM ClassReservations cr WHERE cr.ClassID = c.ClassID) as CurrentEnrollment
            FROM Classes c
            LEFT JOIN Users u ON c.CoachID = u.UserID
        `);
        res.json({ success: true, classes: result.recordset });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las clases' });
    }
};

exports.createClass = async (req, res) => {
    const { ClassName, Description, CoachID, MaxCapacity, StartTime, EndTime } = req.body;
    try {
        const pool = await poolPromise;
        
        // Validate overlapping schedule for the coach
        const conflictResult = await pool.request()
            .input('CoachID', sql.Int, CoachID)
            .input('StartTime', sql.DateTime, StartTime)
            .input('EndTime', sql.DateTime, EndTime)
            .query(`
                SELECT ClassID FROM Classes 
                WHERE CoachID = @CoachID 
                  AND (
                    (StartTime < @EndTime AND EndTime > @StartTime)
                  )
            `);

        if (conflictResult.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'El entrenador ya tiene una clase asignada en ese horario' });
        }

        await pool.request()
            .input('ClassName', sql.NVarChar, ClassName)
            .input('Description', sql.NVarChar, Description)
            .input('CoachID', sql.Int, CoachID)
            .input('MaxCapacity', sql.Int, MaxCapacity)
            .input('StartTime', sql.DateTime, StartTime)
            .input('EndTime', sql.DateTime, EndTime)
            .query(`
                INSERT INTO Classes (ClassName, Description, CoachID, MaxCapacity, StartTime, EndTime)
                VALUES (@ClassName, @Description, @CoachID, @MaxCapacity, @StartTime, @EndTime)
            `);

        res.json({ success: true, message: 'Clase creada exitosamente' });
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ success: false, message: 'Error al crear la clase' });
    }
};

exports.reserveClass = async (req, res) => {
    const { ClassID, UserID } = req.body;
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Check capacity
            const classReq = new sql.Request(transaction);
            const classRes = await classReq
                .input('ClassID', sql.Int, ClassID)
                .query(`
                    SELECT c.MaxCapacity, 
                           (SELECT COUNT(*) FROM ClassReservations cr WHERE cr.ClassID = c.ClassID) as CurrentEnrollment
                    FROM Classes c
                    WHERE c.ClassID = @ClassID
                `);
            
            if (classRes.recordset.length === 0) throw new Error('Clase no encontrada');
            const classInfo = classRes.recordset[0];

            if (classInfo.CurrentEnrollment >= classInfo.MaxCapacity) {
                throw new Error('La clase ha alcanzado su aforo máximo');
            }

            // Check if user already reserved
            const checkReq = new sql.Request(transaction);
            const checkRes = await checkReq
                .input('ClassID', sql.Int, ClassID)
                .input('UserID', sql.Int, UserID)
                .query(`SELECT ReservationID FROM ClassReservations WHERE ClassID = @ClassID AND UserID = @UserID`);

            if (checkRes.recordset.length > 0) {
                throw new Error('Ya tienes una reserva para esta clase');
            }

            // Insert reservation
            const insertReq = new sql.Request(transaction);
            await insertReq
                .input('ClassID', sql.Int, ClassID)
                .input('UserID', sql.Int, UserID)
                .query(`INSERT INTO ClassReservations (ClassID, UserID) VALUES (@ClassID, @UserID)`);

            await transaction.commit();
            res.json({ success: true, message: 'Reserva confirmada exitosamente' });
        } catch (err) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: err.message });
        }
    } catch (error) {
        console.error('Error reserving class:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor al procesar la reserva' });
    }
};

exports.getUserReservations = async (req, res) => {
    const userId = Number(req.params.userId);
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
                SELECT cr.ReservationID as reservationId, cr.ReservedAt as reservedAt, 
                       c.ClassID as classId, c.ClassName as className, c.Description as description, 
                       c.StartTime as startTime, c.EndTime as endTime,
                       u.FirstName + ' ' + u.LastName AS coachName
                FROM ClassReservations cr
                INNER JOIN Classes c ON cr.ClassID = c.ClassID
                LEFT JOIN Users u ON c.CoachID = u.UserID
                WHERE cr.UserID = @UserID
                ORDER BY c.StartTime ASC
            `);
        res.json({ success: true, reservations: result.recordset });
    } catch (error) {
        console.error('Error fetching user reservations:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las reservas del usuario' });
    }
};

exports.cancelReservation = async (req, res) => {
    const { ReservationID, UserID } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ReservationID', sql.Int, ReservationID)
            .input('UserID', sql.Int, UserID)
            .query('DELETE FROM ClassReservations WHERE ReservationID = @ReservationID AND UserID = @UserID');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Reserva no encontrada o no pertenece al usuario' });
        }
        res.json({ success: true, message: 'Reserva cancelada exitosamente' });
    } catch (error) {
        console.error('Error canceling reservation:', error);
        res.status(500).json({ success: false, message: 'Error al cancelar la reserva' });
    }
};
