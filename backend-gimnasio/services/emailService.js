const nodemailer = require('nodemailer');
const path = require('path');
const { rutaAbsolutaDesdeUrl } = require('./storageService');
const { poolPromise, sql } = require('../config/db');
require('dotenv').config();
const { getWelcomeTemplate, getPaymentApprovedTemplate, getClassJoinedTemplate } = require('./emailTemplates');

class EmailService {
    constructor() {
        // Configuracion por entorno: por defecto Gmail (lo que usamos hoy), pero
        // definiendo SMTP_HOST se puede apuntar a cualquier servidor SMTP sin
        // tocar codigo, algo necesario al migrar el sistema a otro servidor.
        const transportConfig = process.env.SMTP_HOST
            ? {
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true'
            }
            : { service: process.env.SMTP_SERVICE || 'gmail' };

        this.transporter = nodemailer.createTransport({
            ...transportConfig,
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
     * @param {Array} attachments
     */
    async sendEmail(to, subject, html, attachments = []) {
        try {
            const mailOptions = {
                from: `"Slimming Gym" <${process.env.SMTP_EMAIL}>`,
                to,
                subject,
                html
            };
            
            if (attachments && attachments.length > 0) {
                mailOptions.attachments = attachments;
            }

            const info = await this.transporter.sendMail(mailOptions);
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
     * @param {Array} attachments
     */
    async sendEmailAndLog(userId, to, subject, html, emailType, attachments = []) {
        let status = 'Pendiente';
        try {
            const success = await this.sendEmail(to, subject, html, attachments);
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

    /**
     * Enviar correo de bienvenida a nuevo usuario
     */
    async sendWelcomeEmail(userId, email, firstName) {
        const subject = '¡Bienvenido a Slimming Gym!';
        const html = getWelcomeTemplate(firstName);
        return this.sendEmailAndLog(userId, email, subject, html, 'Bienvenida');
    }

    /**
     * Enviar correo de pago aprobado
     */
    async sendPaymentApprovedEmail(userId, email, firstName, isAutomatic = false, receiptImageUrl = null) {
        const subject = isAutomatic ? 'Pago Aprobado (Automático) - Slimming Gym' : 'Pago Aprobado - Slimming Gym';
        const html = getPaymentApprovedTemplate(firstName, isAutomatic);
        
        const attachments = [];
        if (receiptImageUrl) {
            // Los comprobantes viven en el disco de la VM: se adjunta el archivo
            // por su ruta absoluta. Los historicos guardados en Google Cloud
            // Storage conservan una URL absoluta, que nodemailer descarga con
            // 'href'. Si el archivo local ya no existe, se omite el adjunto en
            // lugar de hacer fallar el correo de aprobacion.
            const rutaLocal = rutaAbsolutaDesdeUrl(receiptImageUrl);

            if (rutaLocal) {
                attachments.push({ filename: path.basename(rutaLocal), path: rutaLocal });
            } else if (/^https?:\/\//i.test(receiptImageUrl)) {
                attachments.push({ filename: 'Comprobante_de_Pago.jpg', href: receiptImageUrl });
            } else {
                console.warn(`[Email] Comprobante no encontrado, se envía el correo sin adjunto: ${receiptImageUrl}`);
            }
        }
        
        return this.sendEmailAndLog(userId, email, subject, html, 'Pago', attachments);
    }

    /**
     * Enviar correo de reserva de clase
     */
    async sendClassJoinedEmail(userId, email, firstName, className, startTime, coachName) {
        const subject = `Reserva confirmada: ${className}`;
        const html = getClassJoinedTemplate(firstName, className, startTime, coachName);
        return this.sendEmailAndLog(userId, email, subject, html, 'Clase');
    }
}

module.exports = new EmailService();
