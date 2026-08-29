const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
const { validarPassword, camposFaltantes, validarCedulaEC, validarEmail } = require('../utils/validators');
const emailService = require('../services/emailService');

const ROLE_MAPPING = {
    1: 'Member',
    2: 'Coach',
    3: 'Admin'
};
const ROLE_MEMBER = 1;
const ROLES_VALIDOS = [1, 2, 3];

/**
 * Alta de usuario. El rol NO se lee de req.body: lo decide quien invoca esta
 * funcion. Es lo que impide que el registro publico cree Administradores.
 */
const createUser = async (req, res, roleIdForzado) => {
    const { IDNumber, FirstName, LastName, Email, Password, PhoneNumber } = req.body;

    try {
        const faltantes = camposFaltantes(req.body, ['IDNumber', 'FirstName', 'LastName', 'Email', 'Password']);
        if (faltantes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Faltan campos obligatorios: ${faltantes.join(', ')}.`
            });
        }

        const errorCedula = validarCedulaEC(IDNumber);
        if (errorCedula) {
            return res.status(400).json({ success: false, message: errorCedula });
        }

        const errorEmail = validarEmail(Email);
        if (errorEmail) {
            return res.status(400).json({ success: false, message: errorEmail });
        }

        const errorPassword = validarPassword(Password);
        if (errorPassword) {
            return res.status(400).json({ success: false, message: errorPassword });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(Password, salt);

        const pool = await poolPromise;

        const roleMapping = ROLE_MAPPING;

        let roleId = roleIdForzado;
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

/**
 * POST /api/auth/register — Registro publico.
 * Crea SIEMPRE un Socio. Cualquier RoleID enviado en el body se ignora.
 */
exports.register = (req, res) => createUser(req, res, ROLE_MEMBER);

/**
 * POST /api/auth/users — Alta desde el panel administrativo.
 * Aqui el rol si puede venir del body, pero la ruta exige token de Admin.
 */
exports.createUserByAdmin = (req, res) => {
    let roleId = Number(req.body.RoleID) || ROLE_MEMBER;
    if (!ROLES_VALIDOS.includes(roleId)) roleId = ROLE_MEMBER;
    return createUser(req, res, roleId);
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

        const roleName = user.RoleName && user.RoleName.trim()
            ? user.RoleName.trim()
            : ROLE_MAPPING[user.RoleID] || 'Member';

        const token = jwt.sign(
            { userId: user.UserID, role: roleName },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
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

const crypto = require('crypto');

// Vigencia del enlace de recuperacion. Corto a proposito: reduce la ventana en
// que un token filtrado sigue siendo util.
const MINUTOS_VIGENCIA_TOKEN = 30;

/**
 * POST /api/auth/forgot-password
 *
 * Responde SIEMPRE lo mismo, exista o no la cuenta. Distinguir los casos
 * permitiria a un atacante averiguar que correos estan registrados
 * (enumeracion de usuarios).
 */
exports.forgotPassword = async (req, res) => {
    const { Email } = req.body;
    const respuestaNeutral = {
        success: true,
        message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.'
    };

    try {
        if (!Email || !String(Email).trim()) {
            return res.status(400).json({ success: false, message: 'El correo es obligatorio.' });
        }

        const pool = await poolPromise;
        const resultado = await pool.request()
            .input('Email', sql.VarChar(255), String(Email).trim())
            .query("SELECT UserID, FirstName FROM Users WHERE Email = @Email AND Status = 'A'");

        // Si no existe, se corta aqui pero se devuelve la misma respuesta.
        if (resultado.recordset.length === 0) {
            return res.json(respuestaNeutral);
        }

        const usuario = resultado.recordset[0];

        // El token viaja por correo; en la base solo se guarda su hash.
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Se invalidan los enlaces anteriores del usuario: solo uno vigente a la vez.
        await pool.request()
            .input('UserID', sql.Int, usuario.UserID)
            .query('UPDATE PasswordResetTokens SET UsedAt = GETDATE() WHERE UserID = @UserID AND UsedAt IS NULL');

        await pool.request()
            .input('UserID', sql.Int, usuario.UserID)
            .input('TokenHash', sql.VarChar(255), tokenHash)
            .input('Minutos', sql.Int, MINUTOS_VIGENCIA_TOKEN)
            .query(`INSERT INTO PasswordResetTokens (UserID, TokenHash, ExpiresAt)
                    VALUES (@UserID, @TokenHash, DATEADD(minute, @Minutos, GETDATE()))`);

        const base = process.env.FRONTEND_URL || 'http://localhost:5173';
        const enlace = `${base.replace(/\/$/, '')}/reset-password?token=${token}`;

        emailService.sendEmail(
            String(Email).trim(),
            'Restablecer tu contraseña - Slimming Gym',
            `<p>Hola ${usuario.FirstName || ''},</p>
             <p>Recibimos una solicitud para restablecer tu contraseña. El enlace vence en ${MINUTOS_VIGENCIA_TOKEN} minutos:</p>
             <p><a href="${enlace}">Restablecer mi contraseña</a></p>
             <p>Si no fuiste tú, ignora este mensaje: tu contraseña no cambiará.</p>`
        ).catch(err => console.error('Error enviando el correo de recuperación:', err));

        return res.json(respuestaNeutral);
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        // Incluso ante un fallo interno se mantiene la respuesta neutral.
        return res.json(respuestaNeutral);
    }
};

/**
 * POST /api/auth/reset-password
 * Valida el token, aplica la politica de contrasenas y marca el token como usado.
 */
exports.resetPassword = async (req, res) => {
    const { Token, Password } = req.body;

    try {
        if (!Token || !Password) {
            return res.status(400).json({ success: false, message: 'Token y contraseña son obligatorios.' });
        }

        const errorPassword = validarPassword(Password);
        if (errorPassword) {
            return res.status(400).json({ success: false, message: errorPassword });
        }

        const tokenHash = crypto.createHash('sha256').update(String(Token)).digest('hex');
        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('TokenHash', sql.VarChar(255), tokenHash)
            .query(`SELECT TokenID, UserID FROM PasswordResetTokens
                    WHERE TokenHash = @TokenHash AND UsedAt IS NULL AND ExpiresAt > GETDATE()`);

        if (resultado.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El enlace no es válido o ya expiró. Solicita uno nuevo.'
            });
        }

        const { TokenID, UserID } = resultado.recordset[0];
        const passwordHash = await bcrypt.hash(Password, await bcrypt.genSalt(10));

        // Cambio de contrasena y consumo del token en una sola transaccion: no
        // puede quedar la contrasena cambiada con el token aun utilizable.
        const transaccion = new sql.Transaction(pool);
        await transaccion.begin();
        try {
            await transaccion.request()
                .input('UserID', sql.Int, UserID)
                .input('PasswordHash', sql.VarChar(255), passwordHash)
                .query('UPDATE Users SET PasswordHash = @PasswordHash WHERE UserID = @UserID');

            await transaccion.request()
                .input('TokenID', sql.Int, TokenID)
                .query('UPDATE PasswordResetTokens SET UsedAt = GETDATE() WHERE TokenID = @TokenID');

            await transaccion.commit();
        } catch (err) {
            await transaccion.rollback();
            throw err;
        }

        return res.json({ success: true, message: 'Contraseña restablecida correctamente.' });
    } catch (error) {
        console.error('Error en resetPassword:', error);
        return res.status(500).json({ success: false, message: 'Error al restablecer la contraseña.' });
    }
};
