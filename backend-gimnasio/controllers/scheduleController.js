const { sql, poolPromise } = require('../config/db');

exports.getSchedules = async (req, res) => {
    const coachId = req.params.coachId;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CoachID', sql.Int, coachId)
            .query(`
                SELECT ID as id, CoachID as coachId, DayOfWeek as dayOfWeek, 
                       CONVERT(varchar(5), StartTime, 108) as startTime, 
                       CONVERT(varchar(5), EndTime, 108) as endTime
                FROM CoachWorkHours
                WHERE CoachID = @CoachID
            `);
        res.json({ success: true, schedules: result.recordset });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ success: false, message: 'Error al obtener horarios del entrenador' });
    }
};

exports.createSchedule = async (req, res) => {
    const { coachId, dayOfWeek, startTime, endTime } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('CoachID', sql.Int, coachId)
            .input('DayOfWeek', sql.VarChar(20), dayOfWeek)
            .input('StartTime', sql.Time, startTime)
            .input('EndTime', sql.Time, endTime)
            .query(`
                INSERT INTO CoachWorkHours (CoachID, DayOfWeek, StartTime, EndTime)
                VALUES (@CoachID, @DayOfWeek, @StartTime, @EndTime)
            `);
        res.status(201).json({ success: true, message: 'Horario creado exitosamente' });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ success: false, message: 'Error al crear horario' });
    }
};

exports.updateSchedule = async (req, res) => {
    const scheduleId = req.params.id;
    const { dayOfWeek, startTime, endTime } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ID', sql.Int, scheduleId)
            .input('DayOfWeek', sql.VarChar(20), dayOfWeek)
            .input('StartTime', sql.Time, startTime)
            .input('EndTime', sql.Time, endTime)
            .query(`
                UPDATE CoachWorkHours 
                SET DayOfWeek = @DayOfWeek, StartTime = @StartTime, EndTime = @EndTime
                WHERE ID = @ID
            `);
            
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Horario no encontrado' });
        }
        res.json({ success: true, message: 'Horario actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar horario' });
    }
};

exports.deleteSchedule = async (req, res) => {
    const scheduleId = req.params.id;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ID', sql.Int, scheduleId)
            .query('DELETE FROM CoachWorkHours WHERE ID = @ID');
            
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Horario no encontrado' });
        }
        res.json({ success: true, message: 'Horario eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar horario' });
    }
};
