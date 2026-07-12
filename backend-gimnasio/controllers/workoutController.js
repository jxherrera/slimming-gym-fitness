const { poolPromise, sql } = require('../config/db');

exports.completeWorkout = async (req, res) => {
  const { userId, routineId, exercises } = req.body;

  if (!userId || !exercises || !Array.isArray(exercises)) {
    return res.status(400).json({ success: false, message: 'Faltan datos requeridos o el formato de ejercicios es inválido.' });
  }

  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Insertar la Sesión General
      const sessionResult = await transaction.request()
        .input('UserID', sql.Int, userId)
        .input('RoutineID', sql.Int, routineId || null)
        .input('TotalExercises', sql.Int, exercises.length)
        .query(`
          INSERT INTO WorkoutSessions (UserID, RoutineID, CompletedAt, TotalExercisesCompleted)
          OUTPUT INSERTED.SessionID
          VALUES (@UserID, @RoutineID, GETDATE(), @TotalExercises)
        `);

      const sessionId = sessionResult.recordset[0].SessionID;

      // 2. Insertar los detalles de cada ejercicio
      // Usaremos un loop para insertar. En producción con miles de registros se preferiría TVP (Table-Valued Parameters),
      // pero para ~10 ejercicios por sesión, multiples requests dentro de la transacción es totalmente válido.
      for (const ex of exercises) {
        await transaction.request()
          .input('SessionID', sql.Int, sessionId)
          .input('ExerciseName', sql.VarChar(150), ex.name || 'Desconocido')
          .input('SetsCompleted', sql.Int, parseInt(ex.sets) || 0)
          .input('RepsCompleted', sql.Int, parseInt(ex.reps) || 0)
          .input('WeightUsed', sql.Decimal(10,2), ex.weight ? parseFloat(ex.weight) : null)
          .query(`
            INSERT INTO WorkoutSessionDetails (SessionID, ExerciseName, SetsCompleted, RepsCompleted, WeightUsed)
            VALUES (@SessionID, @ExerciseName, @SetsCompleted, @RepsCompleted, @WeightUsed)
          `);
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: '¡Entrenamiento registrado con éxito!',
        sessionId
      });

    } catch (err) {
      await transaction.rollback();
      throw err;
    }

  } catch (error) {
    console.error('Error registrando el entrenamiento:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al guardar el entrenamiento.' });
  }
};
