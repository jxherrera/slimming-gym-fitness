const { sql, poolPromise } = require('../config/db');
const { validarNumero } = require('../utils/validators');

const addEvaluation = async (req, res) => {
    try {
        const { userId, coachId, weightKg, bodyFatPercentage, muscleMassPercentage } = req.body;

        if (req.user && req.user.role === 'Member' && String(req.user.userId) !== String(userId)) {
            return res.status(403).json({ success: false, message: 'No tienes permisos para registrar la evaluación de otro usuario.' });
        }

        if (!userId || !coachId || !weightKg) {
            return res.status(400).json({ success: false, message: 'Faltan datos obligatorios (Usuario, Entrenador o Peso).' });
        }

        const errorPeso = validarNumero(weightKg, { campo: 'El peso', min: 20, max: 400 });
        if (errorPeso) {
            return res.status(400).json({ success: false, message: errorPeso });
        }

        if (bodyFatPercentage !== undefined && bodyFatPercentage !== null && String(bodyFatPercentage).trim() !== '') {
            const errorGrasa = validarNumero(bodyFatPercentage, { campo: 'El porcentaje de grasa', min: 1, max: 70 });
            if (errorGrasa) {
                return res.status(400).json({ success: false, message: errorGrasa });
            }
        }

        if (muscleMassPercentage !== undefined && muscleMassPercentage !== null && String(muscleMassPercentage).trim() !== '') {
            const errorMasa = validarNumero(muscleMassPercentage, { campo: 'La masa muscular', min: 1, max: 200 });
            if (errorMasa) {
                return res.status(400).json({ success: false, message: errorMasa });
            }
        }

        const pool = await poolPromise;
        
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('CoachID', sql.Int, coachId)
            .input('WeightKg', sql.Decimal(5,2), weightKg)
            .input('BodyFatPercentage', sql.Decimal(5,2), bodyFatPercentage || null)
            .input('MuscleMassPercentage', sql.Decimal(5,2), muscleMassPercentage || null)
            .query(`
                INSERT INTO dbo.PhysicalEvaluations 
                (UserID, CoachID, WeightKg, BodyFatPercentage, MuscleMassPercentage)
                VALUES 
                (@UserID, @CoachID, @WeightKg, @BodyFatPercentage, @MuscleMassPercentage)
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
                    MuscleMassPercentage
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