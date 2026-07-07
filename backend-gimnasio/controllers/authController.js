const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
    const { IDNumber, FirstName, LastName, Email, Password, PhoneNumber, RoleID } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(Password, salt);

        const pool = await poolPromise;

        const roleMapping = {
            1: 'Member',
            2: 'Coach',
            3: 'Admin'
        };

        let roleId = Number(RoleID) || 1;
        if (![1, 2, 3].includes(roleId)) roleId = 1;

        const roleName = roleMapping[roleId];

        const roleResult = await pool.request()
            .input('RoleID', sql.Int, roleId)
            .query(`SELECT RoleID FROM Roles WHERE RoleID = @RoleID`);

        if (roleResult.recordset.length === 0) {
            const roleByNameResult = await pool.request()
                .input('RoleName', sql.VarChar, roleName)
                .query(`SELECT RoleID FROM Roles WHERE RoleName = @RoleName`);

            if (roleByNameResult.recordset.length > 0) {
                roleId = roleByNameResult.recordset[0].RoleID;
            } else {
                const insertRoleResult = await pool.request()
                    .input('RoleName', sql.VarChar, roleName)
                    .query(`INSERT INTO Roles (RoleName) OUTPUT INSERTED.RoleID VALUES (@RoleName)`);
                roleId = insertRoleResult.recordset[0].RoleID;
            }
        }
        
        // CHECK IF USER ALREADY EXISTS
        const emailStr = Email ? String(Email).trim() : '';
        const idStr = IDNumber ? String(IDNumber).trim() : '';
        
        const existingUserResult = await pool.request()
            .input('EmailCheck', sql.VarChar(255), emailStr)
            .input('IDCheck', sql.VarChar(50), idStr)
            .query(`SELECT UserID, Status, Email, IDNumber FROM Users WHERE Email = @EmailCheck OR IDNumber = @IDCheck`);
            
        if (existingUserResult.recordset.length > 0) {
            const existingUser = existingUserResult.recordset[0];
            if (existingUser.Status === 'I') {
                // RESTORE AND UPDATE INACTIVE USER
                await pool.request()
                    .input('IDNumber', sql.VarChar(50), idStr)
                    .input('FirstName', sql.VarChar(100), FirstName)
                    .input('LastName', sql.VarChar(100), LastName)
                    .input('Email', sql.VarChar(255), emailStr)
                    .input('PasswordHash', sql.VarChar(255), passwordHash) 
                    .input('PhoneNumber', sql.VarChar(20), PhoneNumber || '')
                    .input('RoleID', sql.Int, roleId)
                    .input('UserID', sql.Int, existingUser.UserID)
                    .query(`
                        UPDATE Users 
                        SET IDNumber = @IDNumber, FirstName = @FirstName, LastName = @LastName, 
                            Email = @Email, PasswordHash = @PasswordHash, PhoneNumber = @PhoneNumber, 
                            RoleID = @RoleID, Status = 'A'
                        WHERE UserID = @UserID
                    `);
                    
                if (emailStr) {
                    emailService.sendWelcomeEmail(existingUser.UserID, emailStr, FirstName).catch(err => {
                        console.error('Error al enviar correo de bienvenida (restauración):', err);
                    });
                }

                return res.status(201).json({ 
                    success: true, 
                    message: "Usuario restaurado y actualizado con éxito en la base de datos.",
                    user: {
                        firstName: FirstName,
                        role: roleName
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "El correo electrónico o el número de identificación ya está en uso por un usuario activo."
                });
            }
        }

        const insertResult = await pool.request()
            .input('IDNumber', sql.VarChar(50), idStr)
            .input('FirstName', sql.VarChar(100), FirstName)
            .input('LastName', sql.VarChar(100), LastName)
            .input('Email', sql.VarChar(255), emailStr)
            .input('PasswordHash', sql.VarChar(255), passwordHash) 
            .input('PhoneNumber', sql.VarChar(20), PhoneNumber || '')
            .input('RoleID', sql.Int, roleId)
            .query(`
                INSERT INTO Users (IDNumber, FirstName, LastName, Email, PasswordHash, PhoneNumber, RoleID, Status)
                OUTPUT INSERTED.UserID
                VALUES (@IDNumber, @FirstName, @LastName, @Email, @PasswordHash, @PhoneNumber, @RoleID, 'A')
            `);
            
        const newUserId = insertResult.recordset[0].UserID;

        // Send welcome email asynchronously
        if (emailStr) {
            emailService.sendWelcomeEmail(newUserId, emailStr, FirstName).catch(err => {
                console.error('Error al enviar correo de bienvenida:', err);
            });
        }

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
                SELECT u.UserID, u.FirstName, u.LastName, u.Email, u.PasswordHash, u.RoleID, r.RoleName
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

        const roleMapping = {
            1: 'Member',
            2: 'Coach',
            3: 'Admin'
        };

        const roleName = user.RoleName && user.RoleName.trim()
            ? user.RoleName.trim()
            : roleMapping[user.RoleID] || 'Member';

        const token = jwt.sign(
            { userId: user.UserID, role: roleName },
            process.env.JWT_SECRET || 'supersecret_fallback_key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso.',
            token,
            user: {
                userId: user.UserID,
                firstName: user.FirstName,
                lastName: user.LastName,
                email: user.Email,
                role: roleName
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