const { poolPromise, sql } = require('../config/db');
const PDFDocument = require('pdfkit');

exports.generateMemberPdf = async (req, res) => {
    const userId = req.params.id;

    try {
        const pool = await poolPromise;
        
        // 1. Obtener datos del usuario
        const userRes = await pool.request()
            .input('UserID', sql.Int, userId)
            .query('SELECT FirstName, LastName, Email, Status FROM Users WHERE UserID = @UserID');
            
        if (userRes.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        const user = userRes.recordset[0];

        // 2. Obtener última valoración física
        const evalRes = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
                SELECT TOP 1 WeightKg, BodyFatPercentage, MuscleMassPercentage, EvaluationDate 
                FROM PhysicalEvaluations 
                WHERE UserID = @UserID 
                ORDER BY EvaluationDate DESC
            `);
        const evaluation = evalRes.recordset.length > 0 ? evalRes.recordset[0] : null;

        // 3. Obtener la rutina actual y sus ejercicios
        const routineRes = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
                SELECT r.RoutineID, r.Goal as RoutineName, r.Goal as Description, 
                       re.ExerciseName, re.Sets, re.Reps, re.Weight
                FROM Routines r
                LEFT JOIN RoutineExercises re ON r.RoutineID = re.RoutineID
                WHERE r.UserID = @UserID AND r.Status = 'A'
            `);
        const routines = routineRes.recordset;

        // 4. Crear el PDF
        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_Socio_${userId}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Slimming Gym', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Reporte de Socio', { align: 'center' });
        doc.moveDown(2);

        // Información Personal
        doc.fontSize(14).text('Información Personal', { underline: true });
        doc.fontSize(12).text(`Nombre: ${user.FirstName} ${user.LastName}`);
        doc.text(`Email: ${user.Email}`);
        doc.text(`Estado: ${user.Status === 'A' ? 'Activo' : 'Inactivo'}`);
        doc.moveDown();

        // Última Valoración Física
        doc.fontSize(14).text('Última Valoración Física', { underline: true });
        if (evaluation) {
            doc.fontSize(12).text(`Fecha: ${new Date(evaluation.EvaluationDate).toLocaleDateString()}`);
            doc.text(`Peso: ${evaluation.WeightKg} kg`);
            doc.text(`% Grasa Corporal: ${evaluation.BodyFatPercentage}%`);
            doc.text(`% Masa Muscular: ${evaluation.MuscleMassPercentage}%`);
        } else {
            doc.fontSize(12).text('No hay valoraciones registradas.');
        }
        doc.moveDown();

        // Rutina Actual
        doc.fontSize(14).text('Rutina Actual', { underline: true });
        if (routines.length > 0 && routines[0].RoutineID) {
            doc.fontSize(12).text(`Nombre de Rutina: ${routines[0].RoutineName}`);
            doc.text(`Descripción: ${routines[0].Description || 'N/A'}`);
            doc.moveDown();
            
            // Tabla de ejercicios simple
            doc.text('Ejercicios:', { underline: true });
            routines.forEach(r => {
                if (r.ExerciseName) {
                    doc.text(`- ${r.ExerciseName} | Series: ${r.Sets} | Reps: ${r.Reps}`);
                }
            });
        } else {
            doc.fontSize(12).text('No hay rutina activa.');
        }

        doc.end();

    } catch (error) {
        console.error('Error generando PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error interno generando PDF', error: error.message });
        }
    }
};
