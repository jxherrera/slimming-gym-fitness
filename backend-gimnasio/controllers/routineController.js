const { sql, poolPromise } = require('../config/db'); // Importamos la conexión a SQL Server


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

module.exports = {
    getClientsByCoach
};