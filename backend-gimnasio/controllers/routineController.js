const { sql, poolPromise } = require('../config/db'); 


const getClientsByCoach = async (req, res) => {
    try {
        const { coachId } = req.params;

        if (!coachId) {
            return res.status(400).json({ message: 'El ID del entrenador es requerido.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('CoachID', sql.Int, coachId)
            .query(`
                SELECT DISTINCT 
                    U.UserID, 
                    U.Email, 
                    U.Status,
                    R.Goal
                FROM Users U
                INNER JOIN Routines R ON U.UserID = R.UserID
                WHERE R.CoachID = @CoachID AND U.Status = 'Activo'
            `);

        res.status(200).json({
            success: true,
            clients: result.recordset
        });

    } catch (error) {
        console.error('Error al obtener clientes del entrenador:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al consultar la base de datos.' });
    }
};

const assignRoutine = async (req, res) => {
    try {
        const { userId, coachId, goal } = req.body;

        if (!userId || !coachId || !goal) {
            return res.status(400).json({ 
                success: false, 
                message: 'Datos incompletos. Se requiere userId, coachId y goal.' 
            });
        }

        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .input('CoachID', sql.Int, coachId)
            .input('Goal', sql.NVarChar(255), goal) 
            .query(`
                INSERT INTO Routines (UserID, CoachID, Goal)
                OUTPUT INSERTED.RoutineID, INSERTED.UserID, INSERTED.CoachID, INSERTED.Goal
                VALUES (@UserID, @CoachID, @Goal)
            `);

        res.status(201).json({
            success: true,
            message: 'Rutina asignada exitosamente.',
            routine: result.recordset[0] 
        });

    } catch (error) {
        console.error('Error al asignar la rutina:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al guardar la rutina.' });
    }
};

module.exports = {
    getClientsByCoach,
    assignRoutine
};