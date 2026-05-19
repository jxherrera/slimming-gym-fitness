const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    const { IDNumber, FirstName, LastName, Email, Password, PhoneNumber } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(Password, salt);

        const pool = await poolPromise;

        await pool.request()
            .input('IDNumber', sql.VarChar, IDNumber)
            .input('FirstName', sql.VarChar, FirstName)
            .input('LastName', sql.VarChar, LastName)
            .input('Email', sql.VarChar, Email)
            .input('Pass', sql.VarChar, passwordHash)
            .input('Phone', sql.VarChar, PhoneNumber)
            .input('Role', sql.Int, 1)
            .query(`
                INSERT INTO Users (IDNumber, FirstName, LastName, Email, PasswordHash, PhoneNumber, RoleID, Status)
                VALUES (@IDNumber, @FirstName, @LastName, @Email, @Pass, @Phone, @Role, 'A')
            `);

        res.status(201).json({ 
            success: true, 
            message: "Usuario registrado con éxito en la base de datos." 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Error al registrar el usuario", 
            error: error.message 
        });
    }
};