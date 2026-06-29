const { sql, poolPromise } = require('../config/db');

const addEvaluation = async (req, res) => {
    try {
        const { userId, coachId, weightKg, bodyFatPercentage, chestPerimeter, waistPerimeter, notes } = req.body;

        if (!userId || !coachId || !weightKg) {
            return res.status(400).json({ success: false, message: 'Faltan datos obligatorios (Usuario, Entrenador o Peso).' });
        }

        const pool = await poolPromise;
        
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('CoachID', sql.Int, coachId)
            .input('WeightKg', sql.Decimal(5,2), weightKg)
            .input('BodyFatPercentage', sql.Decimal(5,2), bodyFatPercentage || null)
            .input('ChestPerimeter', sql.Decimal(5,2), chestPerimeter || null)
            .input('WaistPerimeter', sql.Decimal(5,2), waistPerimeter || null)
            .input('Notes', sql.NVarChar(500), notes || '')
            .query(`
                INSERT INTO dbo.PhysicalEvaluations 
                (UserID, CoachID, WeightKg, BodyFatPercentage, ChestPerimeter, WaistPerimeter, Notes)
                VALUES 
                (@UserID, @CoachID, @WeightKg, @BodyFatPercentage, @ChestPerimeter, @WaistPerimeter, @Notes)
            `);

        res.status(201).json({ success: true, message: 'Evaluación física registrada exitosamente.' });
    } catch (error) {
        console.error('Error al guardar evaluación:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const getEvaluationHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
                SELECT 
                    EvaluationID,
                    EvaluationDate,
                    WeightKg,
                    BodyFatPercentage,
                    ChestPerimeter,
                    WaistPerimeter,
                    Notes
                FROM dbo.PhysicalEvaluations
                WHERE UserID = @UserID
                ORDER BY EvaluationDate DESC -- Mostramos la más reciente primero
            `);

        res.status(200).json({ success: true, history: result.recordset });
    } catch (error) {
        console.error('Error al obtener historial de medidas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

module.exports = {
    addEvaluation,
    getEvaluationHistory
};