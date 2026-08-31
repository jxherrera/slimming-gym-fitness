const { sql, poolPromise } = require('../config/db');
const { validarNumero } = require('../utils/validators');

// GET /api/plans
exports.getPlans = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { all } = req.query;
        
        let query = '';
        if (all !== 'true') {
            // Optimización para la web pública: Usar Stored Procedure compilado
            query = 'EXEC sp_GetPublicPlans';
        } else {
            // Consulta administrativa
            query = 'SELECT * FROM Plans';
        }
        
        const result = await pool.request().query(query);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving plans', error: err.message });
    }
};

// POST /api/plans
exports.createPlan = async (req, res) => {
    try {
        const { PlanName, Price, DurationDays } = req.body;
        if (!PlanName || Price == null || !DurationDays) {
            return res.status(400).json({ message: 'PlanName, Price, and DurationDays are required' });
        }

        const errorPrecio = validarNumero(Price, { campo: 'El precio', min: 0.01, max: 99999.99 });
        if (errorPrecio) {
            return res.status(400).json({ message: errorPrecio });
        }

        const errorDuracion = validarNumero(DurationDays, { campo: 'La duración', min: 1, max: 3650, entero: true });
        if (errorDuracion) {
            return res.status(400).json({ message: errorDuracion });
        }
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('PlanName', sql.VarChar(50), PlanName)
            .input('Price', sql.Decimal(10,2), Price)
            .input('DurationDays', sql.Int, DurationDays)
            .query(`
                INSERT INTO Plans (PlanName, Price, DurationDays, Status) 
                OUTPUT inserted.* 
                VALUES (@PlanName, @Price, @DurationDays, 'A')
            `);
            
        res.status(201).json({ message: 'Plan created successfully', plan: result.recordset[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating plan', error: err.message });
    }
};

// PUT /api/plans/:id
exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { PlanName, Price, DurationDays, Status } = req.body;

        if (Price !== undefined) {
            const errorPrecio = validarNumero(Price, { campo: 'El precio', min: 0.01, max: 99999.99 });
            if (errorPrecio) {
                return res.status(400).json({ message: errorPrecio });
            }
        }

        if (DurationDays !== undefined) {
            const errorDuracion = validarNumero(DurationDays, { campo: 'La duración', min: 1, max: 3650, entero: true });
            if (errorDuracion) {
                return res.status(400).json({ message: errorDuracion });
            }
        }
        
        const pool = await poolPromise;
        
        // Find existing plan
        const existing = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Plans WHERE PlanID = @id');
            
        if (existing.recordset.length === 0) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        
        const plan = existing.recordset[0];
        const newPlanName = PlanName !== undefined ? PlanName : plan.PlanName;
        const newPrice = Price !== undefined ? Price : plan.Price;
        const newDuration = DurationDays !== undefined ? DurationDays : plan.DurationDays;
        const newStatus = Status !== undefined ? Status : plan.Status;
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('PlanName', sql.VarChar(50), newPlanName)
            .input('Price', sql.Decimal(10,2), newPrice)
            .input('DurationDays', sql.Int, newDuration)
            .input('Status', sql.Char(1), newStatus)
            .query(`
                UPDATE Plans 
                SET PlanName = @PlanName, Price = @Price, DurationDays = @DurationDays, Status = @Status 
                WHERE PlanID = @id
            `);
            
        res.status(200).json({ message: 'Plan updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating plan', error: err.message });
    }
};

// DELETE /api/plans/:id (Archive or Permanent)
exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { permanent } = req.query;
        const pool = await poolPromise;
        
        if (permanent === 'true') {
            try {
                const result = await pool.request()
                    .input('id', sql.Int, id)
                    .query("DELETE FROM Plans WHERE PlanID = @id");
                    
                if (result.rowsAffected[0] === 0) {
                    return res.status(404).json({ message: 'Plan not found' });
                }
                return res.status(200).json({ message: 'Plan deleted permanently' });
            } catch (fkError) {
                if (fkError.message.includes('REFERENCE constraint')) {
                    return res.status(400).json({ message: 'No se puede eliminar el plan porque hay socios u otros registros vinculados a él. Mantenlo archivado.' });
                }
                throw fkError;
            }
        } else {
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query("UPDATE Plans SET Status = 'I' WHERE PlanID = @id");
                
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Plan not found' });
            }
                
            res.status(200).json({ message: 'Plan archived successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error archiving/deleting plan', error: err.message });
    }
};
