const nodemailer = require('nodemailer');
const { poolPromise, sql } = require('../config/db');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    /**
     * Enviar correo simple
     * @param {string} to 
     * @param {string} subject 
     * @param {string} html 
     */
    async sendEmail(to, subject, html) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Slimming Gym" <${process.env.SMTP_EMAIL}>`,
                to,
                subject,
                html
            });
            console.log(`Correo enviado a ${to}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error(`Error enviando correo a ${to}:`, error);
            return false;
        }
    }

    /**
     * Enviar correo y registrar el log en la base de datos
     * @param {number} userId 
     * @param {string} to 
     * @param {string} subject 
     * @param {string} html 
     * @param {string} emailType 
     */
    async sendEmailAndLog(userId, to, subject, html, emailType) {
        let status = 'Pendiente';
        try {
            const success = await this.sendEmail(to, subject, html);
            status = success ? 'Éxito' : 'Fallo';
            return success;
        } finally {
            if (userId) {
                try {
                    const pool = await poolPromise;
                    await pool.request()
                        .input('UserID', sql.Int, userId)
                        .input('EmailType', sql.VarChar(50), emailType)
                        .input('Status', sql.VarChar(20), status)
                        .query(`
                            INSERT INTO EmailLogs (UserID, EmailType, Status)
                            VALUES (@UserID, @EmailType, @Status)
                        `);
                } catch (dbError) {
                    console.error('Error insertando el log de correo:', dbError);
                }
            }
        }
    }
}

module.exports = new EmailService();
