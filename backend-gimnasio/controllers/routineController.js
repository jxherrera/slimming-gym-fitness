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
        const { userId, coachId, goal, exercises } = req.body;

        if (!userId || !coachId || !goal) {
            return res.status(400).json({ 
                success: false, 
                message: 'Datos incompletos. Se requiere userId, coachId y goal.' 
            });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        let routineResult;
        try {
            const request = new sql.Request(transaction);
            routineResult = await request
                .input('UserID', sql.Int, userId)
                .input('CoachID', sql.Int, coachId)
                .input('Goal', sql.NVarChar(255), goal) 
                .query(`
                    INSERT INTO Routines (UserID, CoachID, Goal)
                    OUTPUT INSERTED.RoutineID, INSERTED.UserID, INSERTED.CoachID, INSERTED.Goal
                    VALUES (@UserID, @CoachID, @Goal)
                `);

            const routineId = routineResult.recordset[0].RoutineID;

            if (exercises && Array.isArray(exercises) && exercises.length > 0) {
                for (const ex of exercises) {
                    if (ex.name && ex.sets && ex.reps) {
                        const exRequest = new sql.Request(transaction);
                        await exRequest
                            .input('RoutineID', sql.Int, routineId)
                            .input('ExerciseName', sql.NVarChar(100), ex.name)
                            .input('Sets', sql.Int, ex.sets)
                            .input('Reps', sql.Int, ex.reps)
                            .input('Weight', sql.Decimal(5,2), ex.weight ? parseFloat(ex.weight) : null)
                            .input('DayOfWeek', sql.NVarChar(20), ex.day || null)
                            .query(`
                                INSERT INTO RoutineExercises (RoutineID, ExerciseName, Sets, Reps, Weight, DayOfWeek)
                                VALUES (@RoutineID, @ExerciseName, @Sets, @Reps, @Weight, @DayOfWeek)
                            `);
                    }
                }
            }

            await transaction.commit();
        } catch (innerError) {
            await transaction.rollback();
            throw innerError;
        }

        res.status(201).json({
            success: true,
            message: 'Rutina asignada exitosamente.',
            routine: routineResult.recordset[0] 
        });

    } catch (error) {
        console.error('Error al asignar la rutina:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al guardar la rutina.' });
    }
};

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

const getCoachSchedule = async (req, res) => {
    try {
        const { coachId } = req.params;
        const pool = await poolPromise; // Usamos tu conexión segura

        const result = await pool.request()
            .input('CoachID', sql.Int, coachId)
            .query(`
                SELECT 
                    CS.ScheduleID,
                    CS.DayOfWeek,
                    CS.StartTime,
                    CS.EndTime,
                    C.ClassName,
                    C.Capacity
                FROM dbo.ClassSchedules CS
                INNER JOIN dbo.Classes C ON CS.ClassID = C.ClassID
                WHERE CS.CoachID = @CoachID AND CS.Status = 'A'
                ORDER BY 
                    -- Ordenamos los días lógicamente, no alfabéticamente
                    CASE CS.DayOfWeek
                        WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2
                        WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4
                        WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
                        WHEN 'Sunday' THEN 7
                    END, CS.StartTime
            `);

        res.status(200).json({ success: true, schedule: result.recordset });
    } catch (error) {
        console.error('Error al obtener la agenda del coach:', error);
        res.status(500).json({ success: false, message: 'Error al consultar la agenda.' });
    }
};

const getCurrentRoutine = async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await poolPromise;
        
        // 1. Get the latest routine
        const routineResult = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
                SELECT TOP 1 R.RoutineID, R.Goal, R.AssignedAt
                FROM Routines R
                WHERE R.UserID = @UserID AND R.Status = 'A'
                ORDER BY R.AssignedAt DESC
            `);
            
        if (routineResult.recordset.length === 0) {
            return res.status(200).json({ success: true, routine: null });
        }
        
        const routine = routineResult.recordset[0];
        
        // 2. Get exercises for this routine
        const exercisesResult = await pool.request()
            .input('RoutineID', sql.Int, routine.RoutineID)
            .query(`
                SELECT ExerciseID, ExerciseName as name, Sets as sets, Reps as reps, Weight as weight, DayOfWeek as day
                FROM RoutineExercises
                WHERE RoutineID = @RoutineID
            `);
            
        routine.exercises = exercisesResult.recordset;
        
        res.status(200).json({ success: true, routine });
    } catch (error) {
        console.error('Error getting current routine:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getUniqueExercises = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT DISTINCT ExerciseName as name
            FROM RoutineExercises
            WHERE ExerciseName IS NOT NULL AND LTRIM(RTRIM(ExerciseName)) <> ''
            ORDER BY ExerciseName ASC
        `);
        
        res.status(200).json({ success: true, exercises: result.recordset.map(e => e.name) });
    } catch (error) {
        console.error('Error getting unique exercises:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * POST /api/routines/aplicar-plantilla
 *
 * Permite que un socio adopte una plantilla publicada por un entrenador sin
 * pasar por el panel de gestion. Existe aparte de assignRoutine porque aquel
 * recibe userId y la lista completa de ejercicios en el cuerpo de la peticion,
 * algo que no puede quedar en manos del propio socio: podria asignarse una
 * rutina a otra persona o inventarse los ejercicios.
 *
 * Aqui solo llega el identificador de la plantilla. El socio sale del token y
 * los ejercicios se leen de la base, no del cliente.
 */
const applyTemplateToMyProfile = async (req, res) => {
    const { templateId } = req.body;
    const userId = req.user.userId;

    if (!templateId) {
        return res.status(400).json({ success: false, message: 'Falta el identificador de la plantilla.' });
    }

    try {
        const pool = await poolPromise;

        const plantilla = await pool.request()
            .input('TemplateID', sql.Int, templateId)
            .query(`
                SELECT TemplateID, CoachID, TemplateName, Goal
                FROM dbo.RoutineTemplates
                WHERE TemplateID = @TemplateID
            `);

        if (plantilla.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'La plantilla ya no existe.' });
        }

        const { CoachID, TemplateName, Goal } = plantilla.recordset[0];

        const ejercicios = await pool.request()
            .input('TemplateID', sql.Int, templateId)
            .query(`
                SELECT ExerciseName, Sets, Reps, Weight, DayOfWeek
                FROM dbo.RoutineTemplateExercises
                WHERE TemplateID = @TemplateID
            `);

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // La pantalla advierte al socio de que esto reemplaza su rutina. Las
            // anteriores se archivan en vez de borrarse: getCurrentRoutine solo
            // mira las activas, y el historial sirve para el seguimiento.
            await new sql.Request(transaction)
                .input('UserID', sql.Int, userId)
                .query("UPDATE dbo.Routines SET Status = 'I' WHERE UserID = @UserID AND Status = 'A'");

            const rutina = await new sql.Request(transaction)
                .input('UserID', sql.Int, userId)
                .input('CoachID', sql.Int, CoachID)
                .input('RoutineName', sql.VarChar(100), TemplateName)
                .input('Goal', sql.NVarChar(255), Goal || 'General')
                .query(`
                    INSERT INTO dbo.Routines (UserID, CoachID, RoutineName, Goal, Status)
                    OUTPUT INSERTED.RoutineID, INSERTED.Goal
                    VALUES (@UserID, @CoachID, @RoutineName, @Goal, 'A')
                `);

            const routineId = rutina.recordset[0].RoutineID;

            for (const ej of ejercicios.recordset) {
                await new sql.Request(transaction)
                    .input('RoutineID', sql.Int, routineId)
                    .input('ExerciseName', sql.NVarChar(150), ej.ExerciseName)
                    .input('Sets', sql.Int, ej.Sets)
                    .input('Reps', sql.Int, ej.Reps)
                    .input('Weight', sql.Decimal(5, 2), ej.Weight)
                    .input('DayOfWeek', sql.NVarChar(20), ej.DayOfWeek)
                    .query(`
                        INSERT INTO dbo.RoutineExercises (RoutineID, ExerciseName, Sets, Reps, Weight, DayOfWeek)
                        VALUES (@RoutineID, @ExerciseName, @Sets, @Reps, @Weight, @DayOfWeek)
                    `);
            }

            await transaction.commit();

            res.status(201).json({
                success: true,
                message: 'Rutina aplicada a tu perfil.',
                routine: { routineId, name: TemplateName, exercises: ejercicios.recordset.length }
            });
        } catch (errorInterno) {
            await transaction.rollback();
            throw errorInterno;
        }
    } catch (error) {
        console.error('Error al aplicar la plantilla al perfil:', error);
        res.status(500).json({ success: false, message: 'No se pudo aplicar la rutina.' });
    }
};

module.exports = {
    getClientsByCoach,
    assignRoutine,
    applyTemplateToMyProfile,
    getCoachSchedule,
    getUserRoutines,
    getCurrentRoutine,
    getUniqueExercises
};