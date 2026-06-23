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

// GET /api/coaches/members
// Retrieves all active members along with their assigned coach's name (if any).
exports.getMembersWithCoaches = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                u.UserID AS id, 
                u.FirstName + ' ' + u.LastName AS name,
                c.FirstName + ' ' + c.LastName AS coachName
            FROM Users u
            LEFT JOIN CoachAssignments ca ON u.UserID = ca.MemberID
            LEFT JOIN Users c ON ca.CoachID = c.UserID
            WHERE u.RoleID = 1 AND u.Status = 'A'
        `);
        res.status(200).json({ success: true, members: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error retrieving members with coaches', error: err.message });
    }
};

// GET /api/coaches/:id/settings
// Retrieves a coach's permissions and assigned students.
exports.getCoachSettings = async (req, res) => {
    try {
        const coachId = Number(req.params.id);
        const pool = await poolPromise;

        // Query permissions
        const permResult = await pool.request()
            .input('CoachID', sql.Int, coachId)
            .query(`
                SELECT 
                    ISNULL(CanEditOthersRoutines, 0) AS canEditOthersRoutines,
                    ISNULL(CanManagePlans, 0) AS canManagePlans,
                    ISNULL(CanSendMessages, 0) AS canSendMessages
                FROM CoachPermissions
                WHERE CoachID = @CoachID
            `);

        const permissions = permResult.recordset[0] || {
            canEditOthersRoutines: false,
            canManagePlans: false,
            canSendMessages: false
        };

        // Query assigned students
        const studentsResult = await pool.request()
            .input('CoachID', sql.Int, coachId)
            .query(`
                SELECT 
                    u.UserID AS id,
                    u.FirstName + ' ' + u.LastName AS name,
                    u.Email AS email
                FROM CoachAssignments ca
                INNER JOIN Users u ON ca.MemberID = u.UserID
                WHERE ca.CoachID = @CoachID AND u.Status = 'A'
            `);

        res.status(200).json({
            success: true,
            permissions: {
                canEditOthersRoutines: !!permissions.canEditOthersRoutines,
                canManagePlans: !!permissions.canManagePlans,
                canSendMessages: !!permissions.canSendMessages
            },
            students: studentsResult.recordset
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error retrieving coach settings', error: err.message });
    }
};

// PUT /api/coaches/:id/settings
// Updates a coach's permissions and assigned students.
exports.updateCoachSettings = async (req, res) => {
    try {
        const coachId = Number(req.params.id);
        const { permissions, studentIds } = req.body;

        if (!permissions) {
            return res.status(400).json({ success: false, message: 'Permissions are required' });
        }

        const pool = await poolPromise;

        // 1. Update or insert permissions
        const permCheck = await pool.request()
            .input('CoachID', sql.Int, coachId)
            .query('SELECT * FROM CoachPermissions WHERE CoachID = @CoachID');

        const canEditOthersRoutines = permissions.canEditOthersRoutines ? 1 : 0;
        const canManagePlans = permissions.canManagePlans ? 1 : 0;
        const canSendMessages = permissions.canSendMessages ? 1 : 0;

        if (permCheck.recordset.length > 0) {
            await pool.request()
                .input('CoachID', sql.Int, coachId)
                .input('CanEditOthersRoutines', sql.Bit, canEditOthersRoutines)
                .input('CanManagePlans', sql.Bit, canManagePlans)
                .input('CanSendMessages', sql.Bit, canSendMessages)
                .query(`
                    UPDATE CoachPermissions
                    SET CanEditOthersRoutines = @CanEditOthersRoutines,
                        CanManagePlans = @CanManagePlans,
                        CanSendMessages = @CanSendMessages
                    WHERE CoachID = @CoachID
                `);
        } else {
            await pool.request()
                .input('CoachID', sql.Int, coachId)
                .input('CanEditOthersRoutines', sql.Bit, canEditOthersRoutines)
                .input('CanManagePlans', sql.Bit, canManagePlans)
                .input('CanSendMessages', sql.Bit, canSendMessages)
                .query(`
                    INSERT INTO CoachPermissions (CoachID, CanEditOthersRoutines, CanManagePlans, CanSendMessages)
                    VALUES (@CoachID, @CanEditOthersRoutines, @CanManagePlans, @CanSendMessages)
                `);
        }

        // 2. Remove students no longer assigned to this coach
        if (studentIds && studentIds.length > 0) {
            const safeIds = studentIds.map(Number).filter(id => !isNaN(id));
            if (safeIds.length > 0) {
                const queryText = `
                    DELETE FROM CoachAssignments 
                    WHERE CoachID = @CoachID 
                      AND MemberID NOT IN (${safeIds.join(',')})
                `;
                await pool.request()
                    .input('CoachID', sql.Int, coachId)
                    .query(queryText);
            } else {
                await pool.request()
                    .input('CoachID', sql.Int, coachId)
                    .query('DELETE FROM CoachAssignments WHERE CoachID = @CoachID');
            }
        } else {
            // Remove all assignments for this coach if studentIds is empty
            await pool.request()
                .input('CoachID', sql.Int, coachId)
                .query('DELETE FROM CoachAssignments WHERE CoachID = @CoachID');
        }

        // 3. Insert or update assignments for the selected students
        if (studentIds && studentIds.length > 0) {
            for (const studentId of studentIds) {
                const sId = Number(studentId);
                if (isNaN(sId)) continue;

                // Delete any existing assignment for this student first (since MemberID is UNIQUE)
                await pool.request()
                    .input('MemberID', sql.Int, sId)
                    .query('DELETE FROM CoachAssignments WHERE MemberID = @MemberID');

                // Insert the new assignment
                await pool.request()
                    .input('CoachID', sql.Int, coachId)
                    .input('MemberID', sql.Int, sId)
                    .query('INSERT INTO CoachAssignments (CoachID, MemberID) VALUES (@CoachID, @MemberID)');
            }
        }

        res.status(200).json({ success: true, message: 'Coach settings and assignments updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error updating coach settings', error: err.message });
    }
};
