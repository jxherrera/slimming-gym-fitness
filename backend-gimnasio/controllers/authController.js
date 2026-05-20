const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    const { IDNumber, FirstName, LastName, Email, Password, PhoneNumber, RoleName } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(Password, salt);

        const pool = await poolPromise;

        const validRoles = ['Admin', 'Coach', 'Member'];
        const roleName = validRoles.includes(RoleName) ? RoleName : 'Member';

        const roleResult = await pool.request()
            .input('RoleName', sql.VarChar, roleName)
            .query(`SELECT RoleID FROM Roles WHERE RoleName = @RoleName`);

        let roleId;
        
        if (roleResult.recordset.length === 0) {
            const insertRoleResult = await pool.request()
                .input('RoleName', sql.VarChar, roleName)
                .query(`INSERT INTO Roles (RoleName) OUTPUT INSERTED.RoleID VALUES (@RoleName)`);
            roleId = insertRoleResult.recordset[0].RoleID;
        } else {
            roleId = roleResult.recordset[0].RoleID;
        }

        await pool.request()
            .input('IDNumber', sql.VarChar, IDNumber)
            .input('FirstName', sql.VarChar, FirstName)
            .input('LastName', sql.VarChar, LastName)
            .input('Email', sql.VarChar, Email)
            .input('PasswordHash', sql.VarChar, passwordHash) 
            .input('PhoneNumber', sql.VarChar, PhoneNumber)
            .input('RoleID', sql.Int, roleId)
            .query(`
                INSERT INTO Users (IDNumber, FirstName, LastName, Email, PasswordHash, PhoneNumber, RoleID, Status)
                VALUES (@IDNumber, @FirstName, @LastName, @Email, @PasswordHash, @PhoneNumber, @RoleID, 'A')
            `);

        res.status(201).json({ 
            success: true, 
            message: "Usuario registrado con éxito en la base de datos.",
            user: {
                firstName: FirstName,
                role: roleName
            }
        });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error al registrar el usuario.", 
            error: error.message 
        });
    }
};

exports.login = async (req, res) => {
    const { Email, Password } = req.body;

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('Email', sql.VarChar, Email)
            .query(`
                SELECT u.UserID, u.FirstName, u.LastName, u.Email, u.PasswordHash, r.RoleName
                FROM Users u
                LEFT JOIN Roles r ON u.RoleID = r.RoleID
                WHERE u.Email = @Email
            `);

        const user = result.recordset[0];

        if (!user || !(await bcrypt.compare(Password, user.PasswordHash))) {
            return res.status(400).json({
                success: false,
                message: 'Correo o contraseña incorrectos.'
            });
        }

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso.',
            user: {
                userId: user.UserID,
                firstName: user.FirstName,
                lastName: user.LastName,
                email: user.Email,
                role: user.RoleName ? user.RoleName.trim() : 'Member' 
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            success: false,
            message: 'Error interno en el servidor.',
            error: error.message
        });
    }
};