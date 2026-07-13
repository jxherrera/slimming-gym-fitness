const { sql, poolPromise } = require('../config/db');

// --- EXERCISE CATALOG ---

const getExercisesCatalog = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT ExerciseID, Name, MuscleGroup, Description
            FROM ExerciseCatalog
            ORDER BY Name ASC
        `);
        res.status(200).json({ success: true, exercises: result.recordset });
    } catch (error) {
        console.error('Error getting exercises catalog:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const createCatalogExercise = async (req, res) => {
    try {
        const { name, muscleGroup, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'El nombre del ejercicio es requerido.' });
        }

        const pool = await poolPromise;
        const check = await pool.request()
            .input('Name', sql.NVarChar(150), name)
            .query('SELECT ExerciseID FROM ExerciseCatalog WHERE Name = @Name');
            
        if (check.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'El ejercicio ya existe.' });
        }

        const result = await pool.request()
            .input('Name', sql.NVarChar(150), name)
            .input('MuscleGroup', sql.NVarChar(100), muscleGroup || null)
            .input('Description', sql.NVarChar(sql.MAX), description || null)
            .query(`
                INSERT INTO ExerciseCatalog (Name, MuscleGroup, Description)
                OUTPUT INSERTED.*
                VALUES (@Name, @MuscleGroup, @Description)
            `);
            
        res.status(201).json({ success: true, exercise: result.recordset[0] });
    } catch (error) {
        console.error('Error creating catalog exercise:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteCatalogExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('ExerciseID', sql.Int, id)
            .query('DELETE FROM ExerciseCatalog WHERE ExerciseID = @ExerciseID');
        res.status(200).json({ success: true, message: 'Ejercicio eliminado.' });
    } catch (error) {
        console.error('Error deleting catalog exercise:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// --- ROUTINE TEMPLATES ---

const updateCatalogExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, muscleGroup, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'El nombre del ejercicio es requerido.' });
        }

        const pool = await poolPromise;
        const check = await pool.request()
            .input('Name', sql.NVarChar(150), name)
            .input('ExerciseID', sql.Int, id)
            .query('SELECT ExerciseID FROM ExerciseCatalog WHERE Name = @Name AND ExerciseID != @ExerciseID');
            
        if (check.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Ya existe otro ejercicio con ese nombre.' });
        }

        const result = await pool.request()
            .input('ExerciseID', sql.Int, id)
            .input('Name', sql.NVarChar(150), name)
            .input('MuscleGroup', sql.NVarChar(100), muscleGroup || null)
            .input('Description', sql.NVarChar(sql.MAX), description || null)
            .query(`
                UPDATE ExerciseCatalog 
                SET Name = @Name, MuscleGroup = @MuscleGroup, Description = @Description
                OUTPUT INSERTED.*
                WHERE ExerciseID = @ExerciseID
            `);
            
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Ejercicio no encontrado.' });
        }
            
        res.status(200).json({ success: true, exercise: result.recordset[0] });
    } catch (error) {
        console.error('Error updating catalog exercise:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getRoutineTemplates = async (req, res) => {
    try {
        const { coachId } = req.params;
        const pool = await poolPromise;
        
        const templatesResult = await pool.request()
            .input('CoachID', sql.Int, coachId)
            .query(`
                SELECT TemplateID, TemplateName, Goal, CreatedAt
                FROM RoutineTemplates
                WHERE CoachID = @CoachID
                ORDER BY CreatedAt DESC
            `);
            
        const templates = templatesResult.recordset;
        
        // Fetch exercises for each template
        if (templates.length > 0) {
            const templateIds = templates.map(t => t.TemplateID);
            const exercisesResult = await pool.request()
                .query(`
                    SELECT TemplateExerciseID, TemplateID, ExerciseName, Sets, Reps, Weight, DayOfWeek
                    FROM RoutineTemplateExercises
                    WHERE TemplateID IN (${templateIds.join(',')})
                `);
                
            const exercises = exercisesResult.recordset;
            
            templates.forEach(t => {
                t.exercises = exercises.filter(e => e.TemplateID === t.TemplateID).map(e => ({
                    id: e.TemplateExerciseID,
                    name: e.ExerciseName,
                    sets: e.Sets,
                    reps: e.Reps,
                    weight: e.Weight,
                    day: e.DayOfWeek
                }));
            });
        }
        
        res.status(200).json({ success: true, templates });
    } catch (error) {
        console.error('Error al obtener plantillas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const getAllRoutineTemplates = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                T.TemplateID, 
                T.TemplateName, 
                T.Goal, 
                T.CreatedAt,
                T.CoachID,
                C.FirstName + ' ' + C.LastName AS CoachName
            FROM RoutineTemplates T
            JOIN Users C ON T.CoachID = C.UserID
            ORDER BY T.CreatedAt DESC
        `);

        const templates = result.recordset;

        for (const tpl of templates) {
            const exResult = await pool.request()
                .input('TemplateID', sql.Int, tpl.TemplateID)
                .query(`
                    SELECT ExerciseName as name, Sets as sets, Reps as reps, Weight as weight, DayOfWeek as day
                    FROM RoutineTemplateExercises
                    WHERE TemplateID = @TemplateID
                `);
            tpl.exercises = exResult.recordset;
        }

        res.status(200).json({ success: true, templates });
    } catch (error) {
        console.error('Error al obtener todas las plantillas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const createRoutineTemplate = async (req, res) => {
    try {
        const { coachId, templateName, goal, exercises } = req.body;
        
        if (!coachId || !templateName) {
            return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        try {
            const request = new sql.Request(transaction);
            const templateResult = await request
                .input('CoachID', sql.Int, coachId)
                .input('TemplateName', sql.NVarChar(150), templateName)
                .input('Goal', sql.NVarChar(255), goal || null)
                .query(`
                    INSERT INTO RoutineTemplates (CoachID, TemplateName, Goal)
                    OUTPUT INSERTED.TemplateID, INSERTED.TemplateName, INSERTED.Goal
                    VALUES (@CoachID, @TemplateName, @Goal)
                `);

            const templateId = templateResult.recordset[0].TemplateID;

            if (exercises && Array.isArray(exercises) && exercises.length > 0) {
                for (const ex of exercises) {
                    if (ex.name && ex.sets && ex.reps) {
                        const exRequest = new sql.Request(transaction);
                        await exRequest
                            .input('TemplateID', sql.Int, templateId)
                            .input('ExerciseName', sql.NVarChar(150), ex.name)
                            .input('Sets', sql.Int, ex.sets)
                            .input('Reps', sql.Int, ex.reps)
                            .input('Weight', sql.Decimal(5,2), ex.weight ? parseFloat(ex.weight) : null)
                            .input('DayOfWeek', sql.NVarChar(20), ex.day || null)
                            .query(`
                                INSERT INTO RoutineTemplateExercises (TemplateID, ExerciseName, Sets, Reps, Weight, DayOfWeek)
                                VALUES (@TemplateID, @ExerciseName, @Sets, @Reps, @Weight, @DayOfWeek)
                            `);
                    }
                }
            }

            await transaction.commit();
            res.status(201).json({
                success: true,
                message: 'Plantilla creada exitosamente.',
                template: templateResult.recordset[0] 
            });
        } catch (innerError) {
            await transaction.rollback();
            throw innerError;
        }

    } catch (error) {
        console.error('Error creating routine template:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteRoutineTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('TemplateID', sql.Int, id)
            .query('DELETE FROM RoutineTemplates WHERE TemplateID = @TemplateID');
        res.status(200).json({ success: true, message: 'Plantilla eliminada.' });
    } catch (error) {
        console.error('Error deleting routine template:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateRoutineTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { templateName, goal, exercises } = req.body;
        
        if (!templateName) {
            return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        try {
            const request = new sql.Request(transaction);
            const templateResult = await request
                .input('TemplateID', sql.Int, id)
                .input('TemplateName', sql.NVarChar(150), templateName)
                .input('Goal', sql.NVarChar(255), goal || null)
                .query(`
                    UPDATE RoutineTemplates
                    SET TemplateName = @TemplateName, Goal = @Goal
                    OUTPUT INSERTED.TemplateID, INSERTED.TemplateName, INSERTED.Goal
                    WHERE TemplateID = @TemplateID
                `);

            if (templateResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Plantilla no encontrada.' });
            }

            const templateId = templateResult.recordset[0].TemplateID;

            // Delete old exercises
            const delRequest = new sql.Request(transaction);
            await delRequest
                .input('TemplateID', sql.Int, templateId)
                .query(`DELETE FROM RoutineTemplateExercises WHERE TemplateID = @TemplateID`);

            // Insert new exercises
            if (exercises && Array.isArray(exercises) && exercises.length > 0) {
                for (const ex of exercises) {
                    if (ex.name && ex.sets && ex.reps) {
                        const exRequest = new sql.Request(transaction);
                        await exRequest
                            .input('TemplateID', sql.Int, templateId)
                            .input('ExerciseName', sql.NVarChar(150), ex.name)
                            .input('Sets', sql.Int, ex.sets)
                            .input('Reps', sql.Int, ex.reps)
                            .input('Weight', sql.Decimal(5,2), ex.weight ? parseFloat(ex.weight) : null)
                            .input('DayOfWeek', sql.NVarChar(20), ex.day || null)
                            .query(`
                                INSERT INTO RoutineTemplateExercises (TemplateID, ExerciseName, Sets, Reps, Weight, DayOfWeek)
                                VALUES (@TemplateID, @ExerciseName, @Sets, @Reps, @Weight, @DayOfWeek)
                            `);
                    }
                }
            }

            await transaction.commit();
            res.status(200).json({
                success: true,
                message: 'Plantilla actualizada exitosamente.',
                template: templateResult.recordset[0] 
            });
        } catch (innerError) {
            await transaction.rollback();
            throw innerError;
        }

    } catch (error) {
        console.error('Error updating routine template:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    getExercisesCatalog,
    createCatalogExercise,
    updateCatalogExercise,
    deleteCatalogExercise,
    getRoutineTemplates,
    getAllRoutineTemplates,
    createRoutineTemplate,
    updateRoutineTemplate,
    deleteRoutineTemplate
};
