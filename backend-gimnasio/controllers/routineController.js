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
                    CASE WHEN U.Status = 'A' THEN 'Activo' ELSE 'Inactivo' END AS Status,
                    (
                        SELECT TOP 1 R.Goal 
                        FROM Routines R 
                        WHERE R.UserID = U.UserID 
                        ORDER BY R.RoutineID DESC
                    ) AS Goal
                FROM Users U
                INNER JOIN CoachAssignments CA ON U.UserID = CA.MemberID
                WHERE CA.CoachID = @CoachID AND U.Status = 'A'
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

// Obtiene las rutinas activas asignadas a un socio en particular para mostrarlas en su panel
const getUserRoutines = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'El ID de usuario es requerido.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
                SELECT 
                    R.RoutineID, 
                    R.RoutineName, 
                    R.Goal, 
                    R.AssignedAt, 
                    (U.FirstName + ' ' + U.LastName) as CoachName
                FROM Routines R
                LEFT JOIN Users U ON R.CoachID = U.UserID
                WHERE R.UserID = @UserID AND R.Status = 'A'
                ORDER BY R.AssignedAt DESC
            `);

        res.status(200).json({
            success: true,
            routines: result.recordset
        });

    } catch (error) {
        console.error('Error al obtener rutinas del usuario:', error);
        res.status(500).json({ success: false, message: 'Error interno al consultar la base de datos.' });
    }
};

module.exports = {
    getClientsByCoach,
    assignRoutine,
    getUserRoutines // Exportado para permitir la consulta de rutinas asignadas desde el panel de usuario
};