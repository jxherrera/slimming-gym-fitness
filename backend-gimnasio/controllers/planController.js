const { sql, poolPromise } = require('../config/db');

// GET /api/plans
exports.getPlans = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { all } = req.query;
        
        let query = 'SELECT * FROM Plans';
        if (all !== 'true') {
            query += " WHERE Status = 'A'";
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

// DELETE /api/plans/:id (Archive logic)
exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("UPDATE Plans SET Status = 'I' WHERE PlanID = @id");
            
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Plan not found' });
        }
            
        res.status(200).json({ message: 'Plan archived successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error archiving plan', error: err.message });
    }
};
