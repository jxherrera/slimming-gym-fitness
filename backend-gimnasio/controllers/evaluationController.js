const { sql, poolPromise } = require('../config/db');
const PDFDocument = require('pdfkit');

exports.getEvaluationsByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
                SELECT e.*, u.FirstName + ' ' + u.LastName AS CoachName
                FROM PhysicalEvaluations e
                LEFT JOIN Users u ON e.CoachID = u.UserID
                WHERE e.UserID = @UserID
                ORDER BY e.EvaluationDate DESC
            `);
        res.json({ success: true, evaluations: result.recordset });
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        res.status(500).json({ success: false, message: 'Error al obtener evaluaciones' });
    }
};

exports.createEvaluation = async (req, res) => {
    const { UserID, CoachID, WeightKg, BodyFatPercentage, MuscleMassPercentage } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserID', sql.Int, UserID)
            .input('CoachID', sql.Int, CoachID)
            .input('WeightKg', sql.Decimal(5, 2), WeightKg)
            .input('BodyFatPercentage', sql.Decimal(5, 2), BodyFatPercentage)
            .input('MuscleMassPercentage', sql.Decimal(5, 2), MuscleMassPercentage)
            .query(`
                INSERT INTO PhysicalEvaluations (UserID, CoachID, WeightKg, BodyFatPercentage, MuscleMassPercentage)
                VALUES (@UserID, @CoachID, @WeightKg, @BodyFatPercentage, @MuscleMassPercentage)
            `);
        res.json({ success: true, message: 'Evaluación registrada exitosamente' });
    } catch (error) {
        console.error('Error creating evaluation:', error);
        res.status(500).json({ success: false, message: 'Error al crear la evaluación' });
    }
};

exports.generatePdf = async (req, res) => {
    const { userId } = req.params;
    try {
        const pool = await poolPromise;
        const userResult = await pool.request()
            .input('UserID', sql.Int, userId)
            .query('SELECT FirstName, LastName FROM Users WHERE UserID = @UserID');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        const user = userResult.recordset[0];

        const evalResult = await pool.request()
            .input('UserID', sql.Int, userId)
            .query('SELECT TOP 1 * FROM PhysicalEvaluations WHERE UserID = @UserID ORDER BY EvaluationDate DESC');

        const latestEval = evalResult.recordset[0] || null;

        // Generate PDF
        const doc = new PDFDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_Fisico_${user.FirstName}_${user.LastName}.pdf`);
        
        doc.pipe(res);
        
        doc.fontSize(20).text('Reporte de Progreso Físico', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(`Usuario: ${user.FirstName} ${user.LastName}`);
        doc.moveDown();

        if (latestEval) {
            doc.fontSize(14).text('Última Evaluación Registrada:', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).text(`Fecha: ${new Date(latestEval.EvaluationDate).toLocaleDateString()}`);
            doc.text(`Peso: ${latestEval.WeightKg} kg`);
            doc.text(`Grasa Corporal: ${latestEval.BodyFatPercentage} %`);
            doc.text(`Masa Muscular: ${latestEval.MuscleMassPercentage} %`);
        } else {
            doc.fontSize(14).text('No hay evaluaciones físicas registradas.');
        }

        doc.moveDown(2);
        doc.fontSize(10).text('Generado automáticamente por Slimming Gym Fitness', { align: 'center', color: 'gray' });

        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
};
