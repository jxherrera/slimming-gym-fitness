const { sql, poolPromise } = require('../config/db');

// GET /api/coaches
// Fetch all users along with their coach permissions (if any)
exports.getAllCoaches = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                u.UserID, 
                u.FirstName, 
                u.LastName, 
                u.Email,
                u.RoleID,
                ISNULL(cp.CanEditOthersRoutines, 0) AS CanEditOthersRoutines
            FROM Users u
            LEFT JOIN CoachPermissions cp ON u.UserID = cp.CoachID
        `);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving coaches', error: err.message });
    }
};

// PUT /api/coaches/:id/permissions
exports.updatePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { CanEditOthersRoutines } = req.body;
        
        const pool = await poolPromise;
        
        // Check if permission row exists
        const check = await pool.request()
            .input('CoachID', sql.Int, id)
            .query('SELECT * FROM CoachPermissions WHERE CoachID = @CoachID');
            
        if (check.recordset.length > 0) {
            await pool.request()
                .input('CoachID', sql.Int, id)
                .input('CanEditOthersRoutines', sql.Bit, CanEditOthersRoutines ? 1 : 0)
                .query(`
                    UPDATE CoachPermissions 
                    SET CanEditOthersRoutines = @CanEditOthersRoutines 
                    WHERE CoachID = @CoachID
                `);
        } else {
            await pool.request()
                .input('CoachID', sql.Int, id)
                .input('CanEditOthersRoutines', sql.Bit, CanEditOthersRoutines ? 1 : 0)
                .query(`
                    INSERT INTO CoachPermissions (CoachID, CanEditOthersRoutines) 
                    VALUES (@CoachID, @CanEditOthersRoutines)
                `);
        }
        res.status(200).json({ message: 'Permissions updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating permissions', error: err.message });
    }
};

// GET /api/coaches/assignments
// Fetch all assignments (CoachID, MemberID, CoachName, MemberName)
exports.getAssignments = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                ca.CoachID,
                ca.MemberID,
                c.FirstName + ' ' + c.LastName AS CoachName,
                m.FirstName + ' ' + m.LastName AS MemberName
            FROM CoachAssignments ca
            JOIN Users c ON ca.CoachID = c.UserID
            JOIN Users m ON ca.MemberID = m.UserID
        `);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving assignments', error: err.message });
    }
};

// POST /api/coaches/:id/assign
exports.assignMember = async (req, res) => {
    try {
        const coachId = req.params.id;
        const { MemberID } = req.body;
        
        if (!MemberID) {
            return res.status(400).json({ message: 'MemberID is required' });
        }
        
        const pool = await poolPromise;
        
        // Check if member is already assigned somewhere (since MemberID is UNIQUE)
        const existing = await pool.request()
            .input('MemberID', sql.Int, MemberID)
            .query('SELECT * FROM CoachAssignments WHERE MemberID = @MemberID');
            
        if (existing.recordset.length > 0) {
            // Update existing assignment
            await pool.request()
                .input('CoachID', sql.Int, coachId)
                .input('MemberID', sql.Int, MemberID)
                .query('UPDATE CoachAssignments SET CoachID = @CoachID WHERE MemberID = @MemberID');
        } else {
            // Insert new assignment
            await pool.request()
                .input('CoachID', sql.Int, coachId)
                .input('MemberID', sql.Int, MemberID)
                .query('INSERT INTO CoachAssignments (CoachID, MemberID) VALUES (@CoachID, @MemberID)');
        }
        
        res.status(200).json({ message: 'Member assigned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error assigning member', error: err.message });
    }
};

// DELETE /api/coaches/assign/:memberId
exports.removeAssignment = async (req, res) => {
    try {
        const { memberId } = req.params;
        const pool = await poolPromise;
        
        await pool.request()
            .input('MemberID', sql.Int, memberId)
            .query('DELETE FROM CoachAssignments WHERE MemberID = @MemberID');
            
        res.status(200).json({ message: 'Assignment removed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error removing assignment', error: err.message });
    }
};
